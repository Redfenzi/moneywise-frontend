import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { LanguageService } from '../../core/services/language.service';
import { MonthlySummary } from '../../core/models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe, DatePipe, RouterLink, TranslateModule],
  template: `
    <div class="dashboard">
      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="flex flex-between flex-wrap" style="gap:16px">
          <div>
            <h1 class="page-title">{{ 'dashboard.title' | translate }}</h1>
            <p class="page-subtitle">{{ 'dashboard.subtitle' | translate:{name: userName} }}</p>
          </div>
          <div class="month-selector">
            <button class="btn btn-ghost btn-sm" (click)="prevMonth()">
              <span class="material-icons-round">chevron_left</span>
            </button>
            <span class="month-label">{{ monthLabel }}</span>
            <button class="btn btn-ghost btn-sm" (click)="nextMonth()">
              <span class="material-icons-round">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading()" class="loading-overlay">
        <div class="loading-spinner big-spinner"></div>
        <span>{{ 'dashboard.loading' | translate }}</span>
      </div>

      <!-- ERROR -->
      <div *ngIf="!loading() && error()" class="alert alert-danger" style="display:flex;align-items:center;gap:8px;margin:24px 0;">
        <span class="material-icons-round">error_outline</span>
        <span>{{ error() }}</span>
      </div>

      <ng-container *ngIf="!loading() && summary()">
        <!-- STAT CARDS -->
        <div class="grid grid-4" style="margin-bottom: 28px;">
          <div class="stat-card income">
            <div class="stat-icon income-icon">
              <span class="material-icons-round">trending_up</span>
            </div>
            <div class="stat-value">{{ summary()!.totalIncome | appCurrency }}</div>
            <div class="stat-label">{{ 'dashboard.total_income' | translate }}</div>
          </div>

          <div class="stat-card expense">
            <div class="stat-icon expense-icon">
              <span class="material-icons-round">shopping_cart</span>
            </div>
            <div class="stat-value">{{ summary()!.totalExpenses | appCurrency }}</div>
            <div class="stat-label">{{ 'dashboard.total_expenses' | translate }}</div>
          </div>

          <div class="stat-card subscription">
            <div class="stat-icon subscription-icon">
              <span class="material-icons-round">subscriptions</span>
            </div>
            <div class="stat-value">{{ summary()!.totalSubscriptions | appCurrency }}</div>
            <div class="stat-label">{{ 'dashboard.total_subscriptions' | translate }}</div>
          </div>

          <div class="stat-card" [class.balance]="summary()!.balance >= 0">
            <div class="stat-icon" [class.balance-icon]="summary()!.balance >= 0" [class.expense-icon]="summary()!.balance < 0">
              <span class="material-icons-round">{{ summary()!.balance >= 0 ? 'savings' : 'warning' }}</span>
            </div>
            <div class="stat-value" [style.color]="summary()!.balance >= 0 ? 'var(--success)' : 'var(--danger)'">
              {{ summary()!.balance | appCurrency }}
            </div>
            <div class="stat-label">{{ 'dashboard.balance' | translate }}</div>
          </div>
        </div>

        <!-- MAIN CONTENT GRID -->
        <div class="grid grid-2" style="margin-bottom: 28px;">
          <!-- BUDGET OVERVIEW -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span class="material-icons-round">donut_large</span>
                {{ 'dashboard.budget_overview' | translate }}
              </div>
            </div>

            <div class="budget-items">
              <div class="budget-item">
                <div class="flex flex-between">
                  <span class="budget-label">
                    <span class="budget-dot income"></span>{{ 'dashboard.revenues' | translate }}
                  </span>
                  <span class="amount positive">{{ summary()!.totalIncome | appCurrency }}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar income" [style.width.%]="100"></div>
                </div>
              </div>

              <div class="budget-item">
                <div class="flex flex-between">
                  <span class="budget-label">
                    <span class="budget-dot expense"></span>{{ 'dashboard.expenses' | translate }}
                  </span>
                  <span class="amount negative">{{ summary()!.totalExpenses | appCurrency }}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar expense"
                       [style.width.%]="getPercent(summary()!.totalExpenses, summary()!.totalIncome)"></div>
                </div>
              </div>

              <div class="budget-item">
                <div class="flex flex-between">
                  <span class="budget-label">
                    <span class="budget-dot subscription"></span>{{ 'dashboard.subscriptions' | translate }}
                  </span>
                  <span class="amount warning-color">{{ summary()!.totalSubscriptions | appCurrency }}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar subscription"
                       [style.width.%]="getPercent(summary()!.totalSubscriptions, summary()!.totalIncome)"></div>
                </div>
              </div>

              <hr class="divider">

              <div class="budget-total">
                <span>{{ 'dashboard.total_deductions' | translate }}</span>
                <span class="amount negative">
                  -{{ summary()!.totalDeductions | appCurrency }}
                </span>
              </div>
              <div class="budget-total balance">
                <span>{{ 'dashboard.net_balance' | translate }}</span>
                <span class="amount" [class.positive]="summary()!.balance >= 0" [class.negative]="summary()!.balance < 0">
                  {{ summary()!.balance | appCurrency }}
                </span>
              </div>
            </div>
          </div>

          <!-- SAVINGS -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span class="material-icons-round">account_balance</span>
                                {{ 'dashboard.total_savings' | translate }}
              </div>
              <a routerLink="/bank-accounts" class="btn btn-secondary btn-sm">
                <span class="material-icons-round">manage_accounts</span>{{ 'common.manage' | translate }}
              </a>
            </div>

            <div class="savings-total">
              <div class="savings-amount">{{ summary()!.totalSavings | appCurrency }}</div>
              <div class="savings-label">{{ 'dashboard.all_accounts' | translate }}</div>
            </div>

            <div class="savings-hint" *ngIf="summary()!.balance > 0">
              <span class="material-icons-round" style="color: var(--success); font-size: 18px;">lightbulb</span>
              <span>{{ 'dashboard.available_before' | translate }} <strong>{{ summary()!.balance | appCurrency }}</strong> {{ 'dashboard.available_after' | translate }}</span>
            </div>
            <div class="savings-hint danger" *ngIf="summary()!.balance < 0">
              <span class="material-icons-round" style="color: var(--danger); font-size: 18px;">warning</span>
              <span>{{ 'dashboard.overspent' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- EXPENSES BY CATEGORY -->
        <div class="card" *ngIf="hasExpenseCategories()">
          <div class="card-header">
            <div class="card-title">
              <span class="material-icons-round">category</span>
              {{ 'dashboard.expenses_by_category' | translate }}
            </div>
          </div>
          <div class="categories-grid">
            <div class="category-item" *ngFor="let cat of getCategoryEntries()">
              <div class="category-info">
                <span class="category-icon-wrap" [style.background]="getCategoryColor(cat[0]) + '20'">
                  <span class="material-icons-round" [style.color]="getCategoryColor(cat[0])">
                    {{ getCategoryIcon(cat[0]) }}
                  </span>
                </span>
                <div>
                  <div class="category-name">{{ getCategoryLabel(cat[0]) | translate }}</div>
                  <div class="category-amount">{{ cat[1] | appCurrency }}</div>
                </div>
              </div>
              <div class="progress-bar-container" style="margin-top: 8px;">
                <div class="progress-bar expense" [style.width.%]="getPercent(cat[1], summary()!.totalExpenses)"></div>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; text-align:right;">
                {{ getPercent(cat[1], summary()!.totalExpenses).toFixed(1) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div class="card" style="margin-top: 28px;">
          <div class="card-header">
            <div class="card-title">
              <span class="material-icons-round">bolt</span>
              {{ 'dashboard.quick_actions' | translate }}
            </div>
          </div>
          <div class="quick-actions">
            <a routerLink="/incomes" class="quick-action income">
              <span class="material-icons-round">add_circle</span>
              <span>{{ 'dashboard.add_income' | translate }}</span>
            </a>
            <a routerLink="/expenses" class="quick-action expense">
              <span class="material-icons-round">remove_circle</span>
              <span>{{ 'dashboard.add_expense' | translate }}</span>
            </a>
            <a routerLink="/subscriptions" class="quick-action subscription">
              <span class="material-icons-round">add_card</span>
              <span>{{ 'dashboard.new_subscription' | translate }}</span>
            </a>
            <a routerLink="/bank-accounts" class="quick-action savings">
              <span class="material-icons-round">account_balance</span>
              <span>{{ 'dashboard.manage_accounts' | translate }}</span>
            </a>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .month-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--border-radius-sm);
      padding: 4px;
    }
    .month-label {
      font-weight: 600;
      font-size: 0.9375rem;
      min-width: 140px;
      text-align: center;
      color: var(--text-primary);
      text-transform: capitalize;
    }

    .budget-items { display: flex; flex-direction: column; gap: 16px; }
    .budget-item {}
    .budget-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .budget-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      &.income { background: var(--success); }
      &.expense { background: var(--danger); }
      &.subscription { background: var(--warning); }
    }
    .budget-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-secondary);
      &.balance {
        font-size: 1.1rem;
        color: var(--text-primary);
        margin-top: 4px;
      }
    }

    .savings-total {
      text-align: center;
      padding: 24px 0;
    }
    .savings-amount {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -1px;
      margin-bottom: 4px;
    }
    .savings-label {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .savings-hint {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      &.danger {
        background: var(--danger-bg);
        border-color: rgba(239, 68, 68, 0.2);
      }
      strong { color: var(--success); }
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .category-item {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 16px;
    }
    .category-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .category-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .material-icons-round { font-size: 20px; }
    }
    .category-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .category-amount {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
    }
    .quick-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 20px;
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      border: 1.5px dashed;
      text-decoration: none;

      .material-icons-round { font-size: 28px; }

      &.income {
        color: var(--success);
        border-color: rgba(16, 185, 129, 0.3);
        &:hover { background: var(--success-bg); border-style: solid; }
      }
      &.expense {
        color: var(--danger);
        border-color: rgba(239, 68, 68, 0.3);
        &:hover { background: var(--danger-bg); border-style: solid; }
      }
      &.subscription {
        color: var(--warning);
        border-color: rgba(245, 158, 11, 0.3);
        &:hover { background: var(--warning-bg); border-style: solid; }
      }
      &.savings {
        color: var(--secondary);
        border-color: rgba(0, 212, 170, 0.3);
        &:hover { background: rgba(0, 212, 170, 0.1); border-style: solid; }
      }
    }

    .big-spinner {
      width: 48px;
      height: 48px;
      border-width: 3px;
      border-color: var(--border);
      border-top-color: var(--primary);
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary = signal<MonthlySummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  private langService = inject(LanguageService);

  constructor(private api: ApiService, public auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadSummary();
  }

  get userName(): string {
    const user = this.auth.currentUser();
    return user ? user.firstName : '';
  }

  get monthLabel(): string {
    const locale = this.langService.currentLang();
    const date = new Date(this.currentYear, this.currentMonth - 1, 1);
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  }

  prevMonth() {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadSummary();
  }

  nextMonth() {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadSummary();
  }

  loadSummary() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getMonthlySummary(this.currentYear, this.currentMonth).subscribe({
      next: (data: import('../../core/models/models').MonthlySummary) => {
        this.summary.set(data);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'dashboard.error_load');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  getPercent(value: number, total: number): number {
    if (total <= 0 || value <= 0) return 0;
    return Math.min((value / total) * 100, 100);
  }

  hasExpenseCategories(): boolean {
    const s = this.summary();
    return !!s && !!s.expensesByCategory && Object.keys(s.expensesByCategory).length > 0;
  }

  getCategoryEntries(): [string, number][] {
    const cats = this.summary()?.expensesByCategory as Record<string, number> | undefined;
    if (!cats) return [];
    return (Object.entries(cats) as [string, number][]).sort((a, b) => b[1] - a[1]);
  }

  getCategoryLabel(cat: string): string {
    const keys: Record<string, string> = {
      FOOD: 'expenses.cat_food', CLOTHING: 'expenses.cat_clothing', ELECTRONICS: 'expenses.cat_electronics',
      TRANSPORT: 'expenses.cat_transport', HEALTH: 'expenses.cat_health', ENTERTAINMENT: 'expenses.cat_entertainment',
      EDUCATION: 'expenses.cat_education', HOME: 'expenses.cat_home', OTHER: 'expenses.cat_other'
    };
    return keys[cat] || cat;
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      FOOD: 'restaurant', CLOTHING: 'checkroom', ELECTRONICS: 'devices',
      TRANSPORT: 'directions_car', HEALTH: 'local_hospital', ENTERTAINMENT: 'movie',
      EDUCATION: 'school', HOME: 'home', OTHER: 'more_horiz'
    };
    return icons[cat] || 'category';
  }

  getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      FOOD: '#F59E0B', CLOTHING: '#8B5CF6', ELECTRONICS: '#3B82F6',
      TRANSPORT: '#10B981', HEALTH: '#EF4444', ENTERTAINMENT: '#EC4899',
      EDUCATION: '#6366F1', HOME: '#14B8A6', OTHER: '#6B7280'
    };
    return colors[cat] || '#6C63FF';
  }
}
