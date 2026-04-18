import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { Expense, ExpenseCategory } from '../../core/models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe, DatePipe, ReactiveFormsModule, TranslateModule],
  template: `
    <div>
      <div class="page-header">
        <div class="flex flex-between flex-wrap" style="gap: 16px;">
          <div>
            <h1 class="page-title">{{ 'expenses.title' | translate }}</h1>
            <p class="page-subtitle">{{ 'expenses.subtitle' | translate }}</p>
          </div>
          <button class="btn btn-danger" style="background: var(--danger); color: white;" (click)="openModal()">
            <span class="material-icons-round">add</span>
            {{ 'expenses.add_btn' | translate }}
          </button>
        </div>
      </div>

      <!-- CATEGORY FILTERS -->
      <div class="type-filters">
        <button *ngFor="let cat of expenseCategories"
                class="type-filter-btn"
                [class.active]="activeFilter() === cat.value"
                (click)="activeFilter.set(cat.value)">
          <span class="material-icons-round">{{ cat.icon }}</span>
          {{ cat.label | translate }}
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span class="material-icons-round">receipt_long</span>
            {{ 'expenses.history' | translate }}
            <span class="badge badge-danger" style="margin-left: 4px;">{{ filteredExpenses().length }}</span>
          </div>
          <div class="total-badge">
            {{ 'expenses.total' | translate }}: <strong class="amount negative">{{ totalFiltered() | appCurrency }}</strong>
          </div>
        </div>

        <div *ngIf="loading()" class="loading-overlay">
          <div class="loading-spinner big-spinner"></div>
        </div>

        <div *ngIf="!loading() && filteredExpenses().length === 0" class="empty-state">
          <div class="empty-icon"><span class="material-icons-round">shopping_bag</span></div>
          <h3>{{ 'expenses.empty_title' | translate }}</h3>
          <p>{{ 'expenses.empty_subtitle' | translate }}</p>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>{{ 'expenses.add_btn' | translate }}
          </button>
        </div>

        <div class="table-container" *ngIf="!loading() && filteredExpenses().length > 0">
          <table>
            <thead>
              <tr>
                <th>{{ 'expenses.col_description' | translate }}</th>
                <th>{{ 'expenses.col_category' | translate }}</th>
                <th>{{ 'expenses.col_amount' | translate }}</th>
                <th>{{ 'expenses.col_date' | translate }}</th>
                <th>{{ 'expenses.col_actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let expense of filteredExpenses()">
                <td>
                  <div class="expense-desc">
                    <span class="expense-icon-sm" [style.background]="getCategoryColor(expense.category) + '20'">
                      <span class="material-icons-round" [style.color]="getCategoryColor(expense.category)">
                        {{ getCategoryIcon(expense.category) }}
                      </span>
                    </span>
                    {{ expense.description }}
                  </div>
                </td>
                <td [attr.data-label]="'expenses.col_category' | translate"><span class="category-pill">{{ getCategoryLabel(expense.category) | translate }}</span></td>
                <td [attr.data-label]="'expenses.col_amount' | translate"><span class="amount negative">-{{ expense.amount | appCurrency }}</span></td>
                <td [attr.data-label]="'expenses.col_date' | translate">{{ expense.expenseDate | date:'dd/MM/yyyy' }}</td>
                <td class="actions-cell" [attr.data-label]="'expenses.col_actions' | translate">
                  <div class="flex flex-gap">
                    <button class="btn btn-icon" style="color: var(--primary-light);" (click)="editExpense(expense)">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn btn-icon" style="color: var(--danger);" (click)="deleteExpense(expense.id!)">
                      <span class="material-icons-round">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal($event)">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">
            <span class="material-icons-round">{{ editingId() ? 'edit' : 'add_shopping_cart' }}</span>
            {{ editingId() ? ('expenses.modal_edit' | translate) : ('expenses.modal_new' | translate) }}
          </div>
          <button class="btn btn-icon" (click)="showModal.set(false)">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ 'expenses.field_category' | translate }}</label>
                <select class="form-control" formControlName="category">
                  <option *ngFor="let c of expenseCategories.slice(1)" [value]="c.value">
                    {{ c.label | translate }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'expenses.field_amount' | translate }} ({{ currencyCode }})</label>
                <div class="input-with-icon">
                  <span class="material-icons-round input-icon">euro</span>
                  <input type="number" class="form-control" formControlName="amount"
                         [class.error]="form.get('amount')?.invalid && form.get('amount')?.touched"
                         placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="form-error" *ngIf="form.get('amount')?.invalid && form.get('amount')?.touched">
                  <span *ngIf="form.get('amount')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
                  <span *ngIf="form.get('amount')?.errors?.['min']">{{ 'validation.amount_min' | translate }}</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ 'expenses.field_description' | translate }}</label>
              <input type="text" class="form-control" formControlName="description"
                     [class.error]="form.get('description')?.invalid && form.get('description')?.touched"
                     [placeholder]="'expenses.field_description_placeholder' | translate">
              <div class="form-error" *ngIf="form.get('description')?.invalid && form.get('description')?.touched">
                <span *ngIf="form.get('description')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ 'expenses.field_date' | translate }}</label>
              <input type="date" class="form-control" formControlName="expenseDate">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showModal.set(false)">{{ 'expenses.cancel' | translate }}</button>
          <button class="btn btn-primary" (click)="saveExpense()" [disabled]="form.invalid || saving()">
            <span class="loading-spinner" *ngIf="saving()"></span>
            <span class="material-icons-round" *ngIf="!saving()">save</span>
            {{ 'expenses.save' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .type-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
    .type-filter-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--border);
      background: var(--bg-card); color: var(--text-secondary);
      font-size: 0.85rem; font-weight: 500; cursor: pointer;
      transition: var(--transition); font-family: 'Inter', sans-serif;
      .material-icons-round { font-size: 16px; }
      &:hover, &.active {
        background: rgba(239, 68, 68, 0.1);
        border-color: var(--danger);
        color: var(--danger);
      }
    }
    .total-badge { font-size: 0.9rem; color: var(--text-secondary); }
    .expense-desc { display: flex; align-items: center; gap: 10px; font-weight: 500; color: var(--text-primary); }
    .expense-icon-sm {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .material-icons-round { font-size: 16px; }
    }
    .big-spinner {
      width: 40px; height: 40px; border-width: 3px;
      border-color: var(--border); border-top-color: var(--primary);
    }
    @media (max-width: 768px) {
      .card { overflow: visible; padding: 12px; }
      .card-header { flex-direction: column; align-items: flex-start; gap: 8px; }
      .type-filters {
        flex-wrap: nowrap;
        overflow-x: auto;
        padding-bottom: 4px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .type-filters::-webkit-scrollbar { display: none; }
      .table-container { border: none; border-radius: 0; overflow-x: visible; }
      table { display: block; }
      thead { display: none; }
      tbody { display: flex; flex-direction: column; gap: 8px; }
      tr {
        display: block;
        background: var(--bg-primary);
        border-radius: 10px;
        border: 1px solid var(--border);
        overflow: hidden;
      }
      td {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-bottom: 1px solid var(--border);
        font-size: 0.875rem;
        gap: 8px;
      }
      td:last-child { border-bottom: none; }
      td:first-child { padding: 12px; border-bottom: 1px solid var(--border); }
      td[data-label]::before {
        content: attr(data-label);
        font-size: 0.72rem;
        color: var(--text-muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        flex-shrink: 0;
        white-space: nowrap;
      }
      .actions-cell { justify-content: space-between; }
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenses = signal<Expense[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  activeFilter = signal<string>('ALL');

  form: FormGroup;

  private translate = inject(TranslateService);

  expenseCategories = [
    { value: 'ALL', label: 'expenses.cat_all', icon: 'list' },
    { value: 'FOOD', label: 'expenses.cat_food', icon: 'restaurant' },
    { value: 'CLOTHING', label: 'expenses.cat_clothing', icon: 'checkroom' },
    { value: 'ELECTRONICS', label: 'expenses.cat_electronics', icon: 'devices' },
    { value: 'TRANSPORT', label: 'expenses.cat_transport', icon: 'directions_car' },
    { value: 'HEALTH', label: 'expenses.cat_health', icon: 'local_hospital' },
    { value: 'ENTERTAINMENT', label: 'expenses.cat_entertainment', icon: 'movie' },
    { value: 'EDUCATION', label: 'expenses.cat_education', icon: 'school' },
    { value: 'HOME', label: 'expenses.cat_home', icon: 'home' },
    { value: 'OTHER', label: 'expenses.cat_other', icon: 'more_horiz' },
  ];

  constructor(private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private authService: AuthService) {
    this.form = this.fb.group({
      category: ['FOOD', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      expenseDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  get currencyCode(): string {
    return this.authService.currentUser()?.currency || 'EUR';
  }

  ngOnInit() { this.loadExpenses(); }

  loadExpenses() {
    this.loading.set(true);
    this.api.getExpenses().subscribe({
      next: (data: Expense[]) => { this.expenses.set(data); this.loading.set(false); this.cdr.detectChanges(); },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  filteredExpenses(): Expense[] {
    const f = this.activeFilter();
    if (f === 'ALL') return this.expenses();
    return this.expenses().filter(e => e.category === f);
  }

  totalFiltered(): number {
    return this.filteredExpenses().reduce((sum, e) => sum + e.amount, 0);
  }

  openModal() {
    this.editingId.set(null);
    this.form.reset({ category: 'FOOD', amount: null, description: '', expenseDate: new Date().toISOString().split('T')[0] });
    this.showModal.set(true);
  }

  editExpense(expense: Expense) {
    this.editingId.set(expense.id!);
    this.form.patchValue({ category: expense.category, amount: expense.amount, description: expense.description, expenseDate: expense.expenseDate });
    this.showModal.set(true);
  }

  saveExpense() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const obs = id ? this.api.updateExpense(id, this.form.value) : this.api.createExpense(this.form.value);
    obs.subscribe({
      next: () => { this.saving.set(false); this.showModal.set(false); this.cdr.detectChanges(); this.loadExpenses(); },
      error: () => { this.saving.set(false); this.cdr.detectChanges(); }
    });
  }

  deleteExpense(id: number) {
    if (!confirm(this.translate.instant('expenses.delete_confirm'))) return;
    this.api.deleteExpense(id).subscribe(() => this.loadExpenses());
  }

  closeModal(e: MouseEvent) {
    if ((e.target as Element).classList.contains('modal-overlay')) this.showModal.set(false);
  }

  getCategoryLabel(cat: ExpenseCategory): string {
    const c = this.expenseCategories.find(x => x.value === cat);
    return c ? c.label : cat;
  }

  getCategoryIcon(cat: ExpenseCategory): string {
    const c = this.expenseCategories.find(x => x.value === cat);
    return c ? c.icon : 'category';
  }

  getCategoryColor(cat: ExpenseCategory): string {
    const colors: Record<string, string> = {
      FOOD: '#F59E0B', CLOTHING: '#8B5CF6', ELECTRONICS: '#3B82F6',
      TRANSPORT: '#10B981', HEALTH: '#EF4444', ENTERTAINMENT: '#EC4899',
      EDUCATION: '#6366F1', HOME: '#14B8A6', OTHER: '#6B7280'
    };
    return colors[cat] || '#6C63FF';
  }
}
