import { Component, OnInit, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { Income, IncomeType } from '../../core/models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe, DatePipe, ReactiveFormsModule, TranslateModule],
  template: `
    <div>
      <div class="page-header">
        <div class="flex flex-between flex-wrap" style="gap: 16px;">
          <div>
            <h1 class="page-title">{{ 'incomes.title' | translate }}</h1>
            <p class="page-subtitle">{{ 'incomes.subtitle' | translate }}</p>
          </div>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>
            {{ 'incomes.add_btn' | translate }}
          </button>
        </div>
      </div>

      <!-- TYPE FILTERS -->
      <div class="type-filters">
        <button *ngFor="let type of incomeTypes"
                class="type-filter-btn"
                [class.active]="activeFilter() === type.value"
                (click)="activeFilter.set(type.value)">
          <span class="material-icons-round">{{ type.icon }}</span>
          {{ type.label | translate }}
        </button>
      </div>

      <!-- INCOMES LIST -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span class="material-icons-round">trending_up</span>
            {{ 'incomes.history' | translate }}
            <span class="badge badge-primary" style="margin-left: 4px;">{{ filteredIncomes().length }}</span>
          </div>
          <div class="total-badge">
            {{ 'incomes.total' | translate }}: <strong class="amount positive">{{ totalFiltered() | appCurrency }}</strong>
          </div>
        </div>

        <div *ngIf="loading()" class="loading-overlay">
          <div class="loading-spinner big-spinner"></div>
        </div>

        <div *ngIf="!loading() && filteredIncomes().length === 0" class="empty-state">
          <div class="empty-icon"><span class="material-icons-round">savings</span></div>
          <h3>{{ 'incomes.empty_title' | translate }}</h3>
          <p>{{ 'incomes.empty_subtitle' | translate }}</p>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>{{ 'incomes.add_btn' | translate }}
          </button>
        </div>

        <div class="table-container" *ngIf="!loading() && filteredIncomes().length > 0">
          <table>
            <thead>
              <tr>
                <th>{{ 'incomes.col_description' | translate }}</th>
                <th>{{ 'incomes.col_type' | translate }}</th>
                <th>{{ 'incomes.col_amount' | translate }}</th>
                <th>{{ 'incomes.col_date' | translate }}</th>
                <th>{{ 'incomes.col_status' | translate }}</th>
                <th>{{ 'incomes.col_actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let income of filteredIncomes()">
                <td>
                  <div class="income-desc">
                    <span class="income-icon-sm" [style.background]="getTypeColor(income.type) + '20'">
                      <span class="material-icons-round" [style.color]="getTypeColor(income.type)">
                        {{ getTypeIcon(income.type) }}
                      </span>
                    </span>
                    {{ income.description }}
                  </div>
                </td>
                <td [attr.data-label]="'incomes.col_type' | translate"><span class="badge badge-primary">{{ getTypeLabel(income.type) | translate }}</span></td>
                <td [attr.data-label]="'incomes.col_amount' | translate"><span class="amount positive">+{{ income.amount | appCurrency }}</span></td>
                <td [attr.data-label]="'incomes.col_date' | translate">{{ income.incomeDate | date:'dd/MM/yyyy' }}</td>
                <td [attr.data-label]="'incomes.col_status' | translate">
                  <span class="badge" [class.badge-success]="income.isFixedSalary" [class.badge-info]="!income.isFixedSalary">
                    {{ income.isFixedSalary ? ('incomes.status_fixed' | translate) : ('incomes.status_variable' | translate) }}
                  </span>
                </td>
                <td class="actions-cell" [attr.data-label]="'incomes.col_actions' | translate">
                  <div class="flex flex-gap">
                    <button class="btn btn-icon" style="color: var(--primary-light);" (click)="editIncome(income)">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn btn-icon" style="color: var(--danger);" (click)="deleteIncome(income.id!)">
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
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">
            <span class="material-icons-round">{{ editingId() ? 'edit' : 'add_circle' }}</span>
            {{ editingId() ? ('incomes.modal_edit' | translate) : ('incomes.modal_new' | translate) }}
          </div>
          <button class="btn btn-icon" (click)="showModal.set(false)">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="form" (ngSubmit)="saveIncome()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ 'incomes.field_type' | translate }}</label>
                <select class="form-control" formControlName="type">
                  <option *ngFor="let t of incomeTypes" [value]="t.value">
                    {{ t.label | translate }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'incomes.field_amount' | translate }} ({{ currencyCode }})</label>
                <div class="input-with-icon">
                  <span class="material-icons-round input-icon">euro</span>
                  <input type="number" class="form-control" formControlName="amount"
                         placeholder="0.00" step="0.01" min="0">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">{{ 'incomes.field_description' | translate }}</label>
              <input type="text" class="form-control" formControlName="description"
                     [placeholder]="'incomes.field_description_placeholder' | translate">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ 'incomes.field_date' | translate }}</label>
                <input type="date" class="form-control" formControlName="incomeDate">
              </div>

              <div class="form-group" *ngIf="form.get('type')?.value === 'SALARY'">
                <label class="form-label">{{ 'incomes.field_salary_type' | translate }}</label>
                <select class="form-control" formControlName="isFixedSalary">
                  <option [value]="true">{{ 'incomes.fixed' | translate }}</option>
                  <option [value]="false">{{ 'incomes.variable' | translate }}</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showModal.set(false)">{{ 'incomes.cancel' | translate }}</button>
          <button class="btn btn-primary" (click)="saveIncome()" [disabled]="form.invalid || saving()">
            <span class="loading-spinner" *ngIf="saving()"></span>
            <span class="material-icons-round" *ngIf="!saving()">save</span>
            {{ saving() ? ('incomes.saving' | translate) : ('incomes.save' | translate) }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .type-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    .type-filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      border: 1.5px solid var(--border);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      font-family: 'Inter', sans-serif;
      .material-icons-round { font-size: 16px; }
      &:hover, &.active {
        background: rgba(108, 99, 255, 0.15);
        border-color: var(--primary);
        color: var(--primary-light);
      }
    }
    .total-badge {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .income-desc {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      color: var(--text-primary);
    }
    .income-icon-sm {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .material-icons-round { font-size: 16px; }
    }
    .big-spinner {
      width: 40px;
      height: 40px;
      border-width: 3px;
      border-color: var(--border);
      border-top-color: var(--primary);
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
export class IncomesComponent implements OnInit {
  incomes = signal<Income[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  activeFilter = signal<string>('ALL');

  form: FormGroup;

  private translate = inject(TranslateService);

  incomeTypes = [
    { value: 'ALL', label: 'incomes.type_all', icon: 'list' },
    { value: 'SALARY', label: 'incomes.type_salary', icon: 'work' },
    { value: 'SALE', label: 'incomes.type_sale', icon: 'sell' },
    { value: 'GAMBLING', label: 'incomes.type_gambling', icon: 'casino' },
    { value: 'FREELANCE', label: 'incomes.type_freelance', icon: 'laptop' },
    { value: 'INVESTMENT', label: 'incomes.type_investment', icon: 'show_chart' },
    { value: 'OTHER', label: 'incomes.type_other', icon: 'more_horiz' },
  ];

  constructor(private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private authService: AuthService) {
    this.form = this.fb.group({
      type: ['SALARY', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      incomeDate: [new Date().toISOString().split('T')[0], Validators.required],
      isFixedSalary: [false]
    });
  }

  get currencyCode(): string {
    return this.authService.currentUser()?.currency || 'EUR';
  }

  ngOnInit() {
    this.loadIncomes();
  }

  loadIncomes() {
    this.loading.set(true);
    this.api.getIncomes().subscribe({
      next: (data: Income[]) => { this.incomes.set(data); this.loading.set(false); this.cdr.detectChanges(); },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  filteredIncomes(): Income[] {
    const f = this.activeFilter();
    if (f === 'ALL') return this.incomes();
    return this.incomes().filter((i: Income) => i.type === f);
  }

  totalFiltered(): number {
    return this.filteredIncomes().reduce((sum, i) => sum + i.amount, 0);
  }

  openModal() {
    this.editingId.set(null);
    this.form.reset({
      type: 'SALARY',
      amount: null,
      description: '',
      incomeDate: new Date().toISOString().split('T')[0],
      isFixedSalary: false
    });
    this.showModal.set(true);
  }

  editIncome(income: Income) {
    this.editingId.set(income.id!);
    this.form.patchValue({
      type: income.type,
      amount: income.amount,
      description: income.description,
      incomeDate: income.incomeDate,
      isFixedSalary: income.isFixedSalary
    });
    this.showModal.set(true);
  }

  saveIncome() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const obs = id
      ? this.api.updateIncome(id, this.form.value)
      : this.api.createIncome(this.form.value);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.cdr.detectChanges();
        this.loadIncomes();
      },
      error: () => { this.saving.set(false); this.cdr.detectChanges(); }
    });
  }

  deleteIncome(id: number) {
    if (!confirm(this.translate.instant('incomes.delete_confirm'))) return;
    this.api.deleteIncome(id).subscribe(() => this.loadIncomes());
  }

  closeModal(e: MouseEvent) {
    if ((e.target as Element).classList.contains('modal-overlay')) {
      this.showModal.set(false);
    }
  }

  getTypeLabel(type: IncomeType): string {
    const t = this.incomeTypes.find(i => i.value === type);
    return t ? t.label : type;
  }

  getTypeIcon(type: IncomeType): string {
    const icons: Record<string, string> = {
      SALARY: 'work', SALE: 'sell', GAMBLING: 'casino',
      FREELANCE: 'laptop', INVESTMENT: 'show_chart', OTHER: 'more_horiz'
    };
    return icons[type] || 'payments';
  }

  getTypeColor(type: IncomeType): string {
    const colors: Record<string, string> = {
      SALARY: '#10B981', SALE: '#3B82F6', GAMBLING: '#F59E0B',
      FREELANCE: '#8B5CF6', INVESTMENT: '#06B6D4', OTHER: '#6B7280'
    };
    return colors[type] || '#6C63FF';
  }
}
