import { Component, OnInit, signal, computed, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AppCurrencyPipe } from '../../core/pipes/app-currency.pipe';
import { BankAccount, AccountType } from '../../core/models/models';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [CommonModule, AppCurrencyPipe, ReactiveFormsModule, TranslateModule],
  template: `
    <div>
      <div class="page-header">
        <div class="flex flex-between flex-wrap" style="gap: 16px;">
          <div>
            <h1 class="page-title">{{ 'bank_accounts.title' | translate }}</h1>
            <p class="page-subtitle">{{ 'bank_accounts.subtitle' | translate }}</p>
          </div>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>
            {{ 'bank_accounts.add_btn' | translate }}
          </button>
        </div>
      </div>

      <!-- SUMMARY STATS -->
      <div class="grid grid-3" style="margin-bottom: 28px;">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(0,212,170,0.1);">
            <span class="material-icons-round" style="color: var(--secondary); font-size:24px;">account_balance_wallet</span>
          </div>
          <div class="stat-value" style="color: var(--secondary);">{{ totalBalance() | appCurrency }}</div>
          <div class="stat-label">{{ 'bank_accounts.total_savings' | translate }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(108,99,255,0.1);">
            <span class="material-icons-round" style="color: var(--primary-light); font-size:24px;">account_balance</span>
          </div>
          <div class="stat-value">{{ accounts().length }}</div>
          <div class="stat-label">{{ 'bank_accounts.accounts_count' | translate }}</div>
        </div>
        <div class="stat-card" *ngIf="primaryAccount()">
          <div class="stat-icon" style="background: rgba(245,158,11,0.1);">
            <span class="material-icons-round" style="color: #F59E0B; font-size:24px;">star</span>
          </div>
          <div class="stat-value">{{ primaryAccount()!.balance | appCurrency }}</div>
          <div class="stat-label">{{ 'bank_accounts.primary_account' | translate }}</div>
        </div>
      </div>

      <!-- CARDS GRID -->
      <div *ngIf="loading()" class="loading-overlay">
        <div class="loading-spinner" style="width:40px;height:40px;border-width:3px;border-color:var(--border);border-top-color:var(--primary);"></div>
      </div>

      <div *ngIf="!loading() && accounts().length === 0" class="empty-state">
        <div class="empty-icon"><span class="material-icons-round">account_balance</span></div>
        <h3>Aucun compte</h3>
        <p>Ajoutez vos comptes bancaires pour suivre votre épargne</p>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="material-icons-round">add</span>Ajouter un compte
        </button>
      </div>

      <div class="accounts-grid" *ngIf="!loading() && accounts().length > 0">
        <div class="account-card" *ngFor="let acc of accounts()">
          <div class="account-top">
            <div class="account-type-badge" [style.background]="getTypeColor(acc.accountType) + '20'">
              <span class="material-icons-round" [style.color]="getTypeColor(acc.accountType)">
                {{ getTypeIcon(acc.accountType) }}
              </span>
              {{ getTypeLabel(acc.accountType) | translate }}
            </div>
              <span class="badge badge-warning" *ngIf="acc.isPrimary">
              <span class="material-icons-round" style="font-size:12px;">star</span>{{ 'bank_accounts.primary_account' | translate }}
            </span>
          </div>

          <div class="account-bank">{{ acc.bankName }}</div>
          <div class="account-name">{{ acc.accountName }}</div>

          <div class="account-balance">
            {{ acc.balance | appCurrency }}
          </div>

          <div class="account-bar">
            <div class="account-bar-fill"
                 [style.width]="getBalancePercent(acc.balance) + '%'"
                 [style.background]="getTypeColor(acc.accountType)">
            </div>
          </div>

          <div class="account-actions">
            <button class="btn btn-ghost btn-sm" (click)="editAccount(acc)">
              <span class="material-icons-round">edit</span>{{ 'bank_accounts.edit' | translate }}
            </button>
            <button class="btn btn-icon" style="color:var(--danger);" (click)="deleteAccount(acc.id!)">
              <span class="material-icons-round">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal($event)">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">
            <span class="material-icons-round">{{ editingId() ? 'edit' : 'account_balance' }}</span>
            {{ editingId() ? ('bank_accounts.modal_edit' | translate) : ('bank_accounts.modal_new' | translate) }}
          </div>
          <button class="btn btn-icon" (click)="showModal.set(false)">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ 'bank_accounts.field_bank_name' | translate }}</label>
                <input type="text" class="form-control" formControlName="bankName"
                       [placeholder]="'bank_accounts.field_bank_name_placeholder' | translate">
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'bank_accounts.field_account_name' | translate }}</label>
                <input type="text" class="form-control" formControlName="accountName"
                       [placeholder]="'bank_accounts.field_account_name_placeholder' | translate">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ 'bank_accounts.field_account_type' | translate }}</label>
                <select class="form-control" formControlName="accountType">
                  <option *ngFor="let t of accountTypes" [value]="t.value">{{ t.label | translate }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'bank_accounts.field_balance' | translate }} ({{ currencyCode }})</label>
                <div class="input-with-icon">
                  <span class="material-icons-round input-icon">euro</span>
                  <input type="number" class="form-control" formControlName="balance"
                         placeholder="0.00" step="0.01">
                </div>
              </div>
            </div>
            <div class="form-group">
              <label style="display:flex;align-items:center;gap:10px;cursor:pointer;color:var(--text-secondary);">
                <input type="checkbox" formControlName="isPrimary"
                       style="width:18px;height:18px;accent-color:var(--primary);">
                <span>{{ 'bank_accounts.field_primary' | translate }}</span>
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showModal.set(false)">{{ 'bank_accounts.cancel' | translate }}</button>
          <button class="btn btn-primary" (click)="saveAccount()" [disabled]="form.invalid || saving()">
            <span class="loading-spinner" *ngIf="saving()"></span>
            <span class="material-icons-round" *ngIf="!saving()">save</span>
            {{ 'bank_accounts.save' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .account-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--border-radius);
      padding: 24px;
      transition: var(--transition);
      display: flex; flex-direction: column; gap: 10px;
      &:hover { border-color: var(--border-light); box-shadow: var(--shadow-card); }
    }
    .account-top { display: flex; justify-content: space-between; align-items: center; }
    .account-type-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 20px;
      font-size: 0.78rem; font-weight: 600;
      .material-icons-round { font-size: 16px; }
    }
    .account-bank { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-top: 4px; }
    .account-name { font-size: 0.85rem; color: var(--text-muted); }
    .account-balance { font-size: 1.8rem; font-weight: 800; color: var(--secondary); margin: 6px 0; }
    .account-bar { height: 4px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
    .account-bar-fill { height: 100%; border-radius: 2px; transition: width 0.8s ease; }
    .account-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 6px; }
  `]
})
export class BankAccountsComponent implements OnInit {
  accounts = signal<BankAccount[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);

  form: FormGroup;

  private translate = inject(TranslateService);

  accountTypes = [
    { value: 'CHECKING',   label: 'bank_accounts.type_checking',    icon: 'payment',          color: '#3B82F6' },
    { value: 'SAVINGS',    label: 'bank_accounts.type_savings',     icon: 'savings',          color: '#10B981' },
    { value: 'INVESTMENT', label: 'bank_accounts.type_investment',  icon: 'trending_up',      color: '#8B5CF6' },
    { value: 'CRYPTO',     label: 'bank_accounts.type_crypto',      icon: 'currency_bitcoin', color: '#F59E0B' },
    { value: 'OTHER',      label: 'bank_accounts.type_other',       icon: 'account_balance',  color: '#6B7280' },
  ];

  constructor(private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private authService: AuthService) {
    this.form = this.fb.group({
      bankName:    ['', Validators.required],
      accountName: ['', Validators.required],
      accountType: ['CHECKING', Validators.required],
      balance:     [0, [Validators.required, Validators.min(0)]],
      isPrimary:   [false]
    });
  }

  get currencyCode(): string {
    return this.authService.currentUser()?.currency || 'EUR';
  }

  ngOnInit() { this.loadAccounts(); }

  loadAccounts() {
    this.loading.set(true);
    this.api.getBankAccounts().subscribe({
      next: (data) => { this.accounts.set(data); this.loading.set(false); this.cdr.detectChanges(); },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  totalBalance(): number { return this.accounts().reduce((s, a) => s + a.balance, 0); }
  primaryAccount(): BankAccount | undefined { return this.accounts().find(a => a.isPrimary); }

  getBalancePercent(balance: number): number {
    const max = Math.max(...this.accounts().map(a => a.balance), 1);
    return Math.round((balance / max) * 100);
  }

  openModal() {
    this.editingId.set(null);
    this.form.reset({ bankName: '', accountName: '', accountType: 'CHECKING', balance: 0, isPrimary: false });
    this.showModal.set(true);
  }

  editAccount(acc: BankAccount) {
    this.editingId.set(acc.id!);
    this.form.patchValue({ bankName: acc.bankName, accountName: acc.accountName, accountType: acc.accountType, balance: acc.balance, isPrimary: acc.isPrimary });
    this.showModal.set(true);
  }

  saveAccount() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const obs = id ? this.api.updateBankAccount(id, this.form.value) : this.api.createBankAccount(this.form.value);
    obs.subscribe({
      next: () => { this.saving.set(false); this.showModal.set(false); this.cdr.detectChanges(); this.loadAccounts(); },
      error: () => { this.saving.set(false); this.cdr.detectChanges(); }
    });
  }

  deleteAccount(id: number) {
    if (!confirm(this.translate.instant('bank_accounts.delete_confirm'))) return;
    this.api.deleteBankAccount(id).subscribe(() => this.loadAccounts());
  }

  closeModal(e: MouseEvent) {
    if ((e.target as Element).classList.contains('modal-overlay')) this.showModal.set(false);
  }

  getTypeLabel(t: AccountType): string { return this.accountTypes.find(x => x.value === t)?.label ?? t; }
  getTypeIcon(t: AccountType): string  { return this.accountTypes.find(x => x.value === t)?.icon ?? 'account_balance'; }
  getTypeColor(t: AccountType): string { return this.accountTypes.find(x => x.value === t)?.color ?? '#6C63FF'; }
}
