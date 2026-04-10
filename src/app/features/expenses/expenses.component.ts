import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { Expense, ExpenseCategory } from '../../core/models/models';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe, DatePipe, ReactiveFormsModule],
  template: `
    <div>
      <div class="page-header">
        <div class="flex flex-between flex-wrap" style="gap: 16px;">
          <div>
            <h1 class="page-title">Dépenses</h1>
            <p class="page-subtitle">Suivez tous vos achats et dépenses</p>
          </div>
          <button class="btn btn-danger" style="background: var(--danger); color: white;" (click)="openModal()">
            <span class="material-icons-round">add</span>
            Ajouter une dépense
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
          {{ cat.label }}
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span class="material-icons-round">receipt_long</span>
            Historique des dépenses
            <span class="badge badge-danger" style="margin-left: 4px;">{{ filteredExpenses().length }}</span>
          </div>
          <div class="total-badge">
            Total: <strong class="amount negative">{{ totalFiltered() | appCurrency }}</strong>
          </div>
        </div>

        <div *ngIf="loading()" class="loading-overlay">
          <div class="loading-spinner big-spinner"></div>
        </div>

        <div *ngIf="!loading() && filteredExpenses().length === 0" class="empty-state">
          <div class="empty-icon"><span class="material-icons-round">shopping_bag</span></div>
          <h3>Aucune dépense enregistrée</h3>
          <p>Commencez à enregistrer vos achats</p>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>Ajouter une dépense
          </button>
        </div>

        <div class="table-container" *ngIf="!loading() && filteredExpenses().length > 0">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Actions</th>
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
                <td><span class="category-pill">{{ getCategoryLabel(expense.category) }}</span></td>
                <td><span class="amount negative">-{{ expense.amount | appCurrency }}</span></td>
                <td>{{ expense.expenseDate | date:'dd/MM/yyyy' }}</td>
                <td>
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
            {{ editingId() ? 'Modifier la dépense' : 'Nouvelle dépense' }}
          </div>
          <button class="btn btn-icon" (click)="showModal.set(false)">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Catégorie</label>
                <select class="form-control" formControlName="category">
                  <option *ngFor="let c of expenseCategories.slice(1)" [value]="c.value">
                    {{ c.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Montant ({{ currencyCode }})</label>
                <div class="input-with-icon">
                  <span class="material-icons-round input-icon">euro</span>
                  <input type="number" class="form-control" formControlName="amount"
                         placeholder="0.00" step="0.01" min="0">
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input type="text" class="form-control" formControlName="description"
                     placeholder="Ex: Courses Carrefour, T-shirt Nike...">
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" formControlName="expenseDate">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showModal.set(false)">Annuler</button>
          <button class="btn btn-primary" (click)="saveExpense()" [disabled]="form.invalid || saving()">
            <span class="loading-spinner" *ngIf="saving()"></span>
            <span class="material-icons-round" *ngIf="!saving()">save</span>
            Sauvegarder
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

  expenseCategories = [
    { value: 'ALL', label: 'Tous', icon: 'list' },
    { value: 'FOOD', label: 'Alimentation', icon: 'restaurant' },
    { value: 'CLOTHING', label: 'Vêtements', icon: 'checkroom' },
    { value: 'ELECTRONICS', label: 'Électronique', icon: 'devices' },
    { value: 'TRANSPORT', label: 'Transport', icon: 'directions_car' },
    { value: 'HEALTH', label: 'Santé', icon: 'local_hospital' },
    { value: 'ENTERTAINMENT', label: 'Loisirs', icon: 'movie' },
    { value: 'EDUCATION', label: 'Éducation', icon: 'school' },
    { value: 'HOME', label: 'Maison', icon: 'home' },
    { value: 'OTHER', label: 'Autre', icon: 'more_horiz' },
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
    if (!confirm('Supprimer cette dépense ?')) return;
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
