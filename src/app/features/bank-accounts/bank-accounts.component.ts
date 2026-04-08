import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { BankAccount, AccountType } from '../../core/models/models';

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule],
  template: `
    <div>
      <div class="page-header">
        <div class="flex flex-between flex-wrap" style="gap: 16px;">
          <div>
            <h1 class="page-title">Comptes bancaires</h1>
            <p class="page-subtitle">Gérez vos comptes et votre épargne en un seul endroit</p>
          </div>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>
            Nouveau compte
          </button>
        </div>
      </div>

      <!-- SUMMARY STATS -->
      <div class="grid grid-3" style="margin-bottom: 28px;">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(0,212,170,0.1);">
            <span class="material-icons-round" style="color: var(--secondary); font-size:24px;">account_balance_wallet</span>
          </div>
          <div class="stat-value" style="color: var(--secondary);">{{ totalBalance() | currency:'EUR':'symbol':'1.2-2':'fr' }}</div>
          <div class="stat-label">Épargne totale</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(108,99,255,0.1);">
            <span class="material-icons-round" style="color: var(--primary-light); font-size:24px;">account_balance</span>
          </div>
          <div class="stat-value">{{ accounts().length }}</div>
          <div class="stat-label">Comptes enregistrés</div>
        </div>
        <div class="stat-card" *ngIf="primaryAccount()">
          <div class="stat-icon" style="background: rgba(245,158,11,0.1);">
            <span class="material-icons-round" style="color: #F59E0B; font-size:24px;">star</span>
          </div>
          <div class="stat-value">{{ primaryAccount()!.balance | currency:'EUR':'symbol':'1.2-2':'fr' }}</div>
          <div class="stat-label">Compte principal</div>
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
              {{ getTypeLabel(acc.accountType) }}
            </div>
            <span class="badge badge-warning" *ngIf="acc.isPrimary">
              <span class="material-icons-round" style="font-size:12px;">star</span>Principal
            </span>
          </div>

          <div class="account-bank">{{ acc.bankName }}</div>
          <div class="account-name">{{ acc.accountName }}</div>

          <div class="account-balance">
            {{ acc.balance | currency:'EUR':'symbol':'1.2-2':'fr' }}
          </div>

          <div class="account-bar">
            <div class="account-bar-fill"
                 [style.width]="getBalancePercent(acc.balance) + '%'"
                 [style.background]="getTypeColor(acc.accountType)">
            </div>
          </div>

          <div class="account-actions">
            <button class="btn btn-ghost btn-sm" (click)="editAccount(acc)">
              <span class="material-icons-round">edit</span>Modifier
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
            {{ editingId() ? 'Modifier le compte' : 'Nouveau compte' }}
          </div>
          <button class="btn btn-icon" (click)="showModal.set(false)">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Banque</label>
                <input type="text" class="form-control" formControlName="bankName"
                       placeholder="Ex: BNP, Crédit Agricole, Revolut...">
              </div>
              <div class="form-group">
                <label class="form-label">Nom du compte</label>
                <input type="text" class="form-control" formControlName="accountName"
                       placeholder="Ex: Compte courant, Livret A...">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type de compte</label>
                <select class="form-control" formControlName="accountType">
                  <option *ngFor="let t of accountTypes" [value]="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Solde (€)</label>
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
                <span>Définir comme compte principal</span>
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showModal.set(false)">Annuler</button>
          <button class="btn btn-primary" (click)="saveAccount()" [disabled]="form.invalid || saving()">
            <span class="loading-spinner" *ngIf="saving()"></span>
            <span class="material-icons-round" *ngIf="!saving()">save</span>
            Sauvegarder
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

  accountTypes = [
    { value: 'CHECKING',   label: '💳 Compte courant',   icon: 'payment',     color: '#3B82F6' },
    { value: 'SAVINGS',    label: '💰 Épargne / Livret', icon: 'savings',     color: '#10B981' },
    { value: 'INVESTMENT', label: '📈 Investissement',   icon: 'trending_up', color: '#8B5CF6' },
    { value: 'CRYPTO',     label: '₿ Crypto',            icon: 'currency_bitcoin', color: '#F59E0B' },
    { value: 'OTHER',      label: '🏦 Autre',            icon: 'account_balance', color: '#6B7280' },
  ];

  constructor(private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      bankName:    ['', Validators.required],
      accountName: ['', Validators.required],
      accountType: ['CHECKING', Validators.required],
      balance:     [0, [Validators.required, Validators.min(0)]],
      isPrimary:   [false]
    });
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
    if (!confirm('Supprimer ce compte ?')) return;
    this.api.deleteBankAccount(id).subscribe(() => this.loadAccounts());
  }

  closeModal(e: MouseEvent) {
    if ((e.target as Element).classList.contains('modal-overlay')) this.showModal.set(false);
  }

  getTypeLabel(t: AccountType): string { return this.accountTypes.find(x => x.value === t)?.label ?? t; }
  getTypeIcon(t: AccountType): string  { return this.accountTypes.find(x => x.value === t)?.icon ?? 'account_balance'; }
  getTypeColor(t: AccountType): string { return this.accountTypes.find(x => x.value === t)?.color ?? '#6C63FF'; }
}
