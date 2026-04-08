import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Subscription, SubscriptionCategory } from '../../core/models/models';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule],
  template: `
    <div>
      <div class="page-header">
        <div class="flex flex-between flex-wrap" style="gap: 16px;">
          <div>
            <h1 class="page-title">Abonnements</h1>
            <p class="page-subtitle">Gérez vos abonnements récurrents et leur déduction mensuelle automatique</p>
          </div>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>
            Nouvel abonnement
          </button>
        </div>
      </div>

      <!-- SUMMARY -->
      <div class="grid grid-3" style="margin-bottom: 28px;">
        <div class="stat-card subscription">
          <div class="stat-icon subscription-icon">
            <span class="material-icons-round">subscriptions</span>
          </div>
          <div class="stat-value">{{ activeSubscriptions().length }}</div>
          <div class="stat-label">Abonnements actifs</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(108,99,255,0.1);">
            <span class="material-icons-round" style="color: var(--primary-light); font-size:24px;">euro</span>
          </div>
          <div class="stat-value">{{ totalMonthly() | currency:'EUR':'symbol':'1.2-2':'fr' }}</div>
          <div class="stat-label">Par mois (actifs)</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(0,212,170,0.1);">
            <span class="material-icons-round" style="color: var(--secondary); font-size:24px;">calendar_month</span>
          </div>
          <div class="stat-value">{{ totalYearly() | currency:'EUR':'symbol':'1.2-2':'fr' }}</div>
          <div class="stat-label">Par an (projection)</div>
        </div>
      </div>

      <!-- LIST -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span class="material-icons-round">list_alt</span>
            Tous les abonnements
          </div>
          <div class="flex flex-gap">
            <button class="btn btn-secondary btn-sm"
                    [class.btn-primary]="activeFilter() === 'ACTIVE'"
                    (click)="activeFilter.set('ACTIVE')">Actifs</button>
            <button class="btn btn-secondary btn-sm"
                    [class.btn-primary]="activeFilter() === 'ALL'"
                    (click)="activeFilter.set('ALL')">Tous</button>
          </div>
        </div>

        <div *ngIf="loading()" class="loading-overlay">
          <div class="loading-spinner big-spinner"></div>
        </div>

        <div *ngIf="!loading() && filteredSubscriptions().length === 0" class="empty-state">
          <div class="empty-icon"><span class="material-icons-round">subscriptions</span></div>
          <h3>Aucun abonnement</h3>
          <p>Ajoutez vos abonnements pour les déduire automatiquement de votre budget</p>
          <button class="btn btn-primary" (click)="openModal()">
            <span class="material-icons-round">add</span>Ajouter un abonnement
          </button>
        </div>

        <div class="subscriptions-grid" *ngIf="!loading() && filteredSubscriptions().length > 0">
          <div class="subscription-card" *ngFor="let sub of filteredSubscriptions()"
               [class.inactive]="!sub.isActive">
            <div class="sub-header">
              <div class="sub-icon" [style.background]="getCategoryColor(sub.category) + '20'">
                <span class="material-icons-round" [style.color]="getCategoryColor(sub.category)">
                  {{ getCategoryIcon(sub.category) }}
                </span>
              </div>
              <div class="sub-info">
                <div class="sub-name">{{ sub.name }}</div>
                <div class="sub-category">{{ getCategoryLabel(sub.category) }}</div>
              </div>
              <span class="badge" [class.badge-success]="sub.isActive" [class.badge-danger]="!sub.isActive">
                {{ sub.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>

            <div class="sub-amount">
              <span class="amount warning-color">{{ sub.monthlyAmount | currency:'EUR':'symbol':'1.2-2':'fr' }}</span>
              <span style="color: var(--text-muted); font-size:0.8rem;">/mois</span>
            </div>

            <div class="sub-dates">
              <div class="sub-date-item">
                <span class="material-icons-round">play_circle</span>
                <span>Début: {{ sub.startDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="sub-date-item" *ngIf="sub.endDate">
                <span class="material-icons-round">stop_circle</span>
                <span>Fin: {{ sub.endDate | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="sub-date-item" *ngIf="sub.durationMonths">
                <span class="material-icons-round">timelapse</span>
                <span>{{ sub.durationMonths }} mois</span>
              </div>
            </div>

            <div class="sub-actions">
              <button class="btn btn-sm" [class.btn-success]="!sub.isActive" [class.btn-secondary]="sub.isActive"
                      (click)="toggleSub(sub)">
                <span class="material-icons-round">{{ sub.isActive ? 'pause' : 'play_arrow' }}</span>
                {{ sub.isActive ? 'Désactiver' : 'Activer' }}
              </button>
              <button class="btn btn-icon" style="color: var(--primary-light);" (click)="editSub(sub)">
                <span class="material-icons-round">edit</span>
              </button>
              <button class="btn btn-icon" style="color: var(--danger);" (click)="deleteSub(sub.id!)">
                <span class="material-icons-round">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal-overlay" *ngIf="showModal()" (click)="closeModal($event)">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">
            <span class="material-icons-round">{{ editingId() ? 'edit' : 'add_card' }}</span>
            {{ editingId() ? "Modifier l'abonnement" : 'Nouvel abonnement' }}
          </div>
          <button class="btn btn-icon" (click)="showModal.set(false)">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">
          <form [formGroup]="form">
            <div class="form-group">
              <label class="form-label">Nom de l'abonnement</label>
              <input type="text" class="form-control" formControlName="name"
                     placeholder="Ex: Netflix, EDF, Orange...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Catégorie</label>
                <select class="form-control" formControlName="category">
                  <option *ngFor="let c of subCategories" [value]="c.value">{{ c.label }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Montant mensuel (€)</label>
                <div class="input-with-icon">
                  <span class="material-icons-round input-icon">euro</span>
                  <input type="number" class="form-control" formControlName="monthlyAmount"
                         placeholder="0.00" step="0.01" min="0">
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date de début</label>
                <input type="date" class="form-control" formControlName="startDate">
              </div>
              <div class="form-group">
                <label class="form-label">Durée (mois, optionnel)</label>
                <div class="input-with-icon">
                  <span class="material-icons-round input-icon">timelapse</span>
                  <input type="number" class="form-control" formControlName="durationMonths"
                         placeholder="Indéfini si vide" min="1">
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="showModal.set(false)">Annuler</button>
          <button class="btn btn-primary" (click)="saveSub()" [disabled]="form.invalid || saving()">
            <span class="loading-spinner" *ngIf="saving()"></span>
            <span class="material-icons-round" *ngIf="!saving()">save</span>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subscriptions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      padding: 4px;
    }
    .subscription-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--border-radius);
      padding: 20px;
      transition: var(--transition);
      &.inactive { opacity: 0.6; }
      &:hover { border-color: var(--border-light); box-shadow: var(--shadow-card); }
    }
    .sub-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .sub-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      .material-icons-round { font-size: 22px; }
    }
    .sub-info { flex: 1; min-width: 0; }
    .sub-name { font-weight: 700; font-size: 1rem; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sub-category { font-size: 0.8rem; color: var(--text-muted); }
    .sub-amount { font-size: 1.5rem; font-weight: 800; margin: 12px 0; display: flex; align-items: baseline; gap: 4px; }
    .sub-dates { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
    .sub-date-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.8rem; color: var(--text-muted);
      .material-icons-round { font-size: 14px; }
    }
    .sub-actions { display: flex; align-items: center; gap: 8px; }
    .big-spinner {
      width: 40px; height: 40px; border-width: 3px;
      border-color: var(--border); border-top-color: var(--primary);
    }
  `]
})
export class SubscriptionsComponent implements OnInit {
  subscriptions = signal<Subscription[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  activeFilter = signal<string>('ACTIVE');

  form: FormGroup;

  subCategories = [
    { value: 'ELECTRICITY', label: '⚡ Électricité', icon: 'bolt' },
    { value: 'INTERNET', label: '🌐 Internet / Box', icon: 'wifi' },
    { value: 'MOBILE', label: '📱 Mobile', icon: 'smartphone' },
    { value: 'STREAMING', label: '🎬 Streaming (Netflix...)', icon: 'tv' },
    { value: 'RENT', label: '🏠 Loyer', icon: 'home' },
    { value: 'INSURANCE', label: '🛡️ Assurance', icon: 'security' },
    { value: 'GYM', label: '🏋️ Sport / Gym', icon: 'fitness_center' },
    { value: 'NEWSPAPER', label: '📰 Presse', icon: 'article' },
    { value: 'CLOUD', label: '☁️ Cloud', icon: 'cloud' },
    { value: 'OTHER', label: '📦 Autre', icon: 'more_horiz' },
  ];

  constructor(private api: ApiService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['STREAMING', Validators.required],
      monthlyAmount: [null, [Validators.required, Validators.min(0.01)]],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      durationMonths: [null]
    });
  }

  ngOnInit() { this.loadSubscriptions(); }

  loadSubscriptions() {
    this.loading.set(true);
    this.api.getSubscriptions().subscribe({
      next: (data) => { this.subscriptions.set(data); this.loading.set(false); this.cdr.detectChanges(); },
      error: () => { this.loading.set(false); this.cdr.detectChanges(); }
    });
  }

  activeSubscriptions(): Subscription[] {
    return this.subscriptions().filter(s => s.isActive);
  }

  filteredSubscriptions(): Subscription[] {
    if (this.activeFilter() === 'ACTIVE') return this.activeSubscriptions();
    return this.subscriptions();
  }

  totalMonthly(): number {
    return this.activeSubscriptions().reduce((sum, s) => sum + s.monthlyAmount, 0);
  }

  totalYearly(): number { return this.totalMonthly() * 12; }

  openModal() {
    this.editingId.set(null);
    this.form.reset({ name: '', category: 'STREAMING', monthlyAmount: null, startDate: new Date().toISOString().split('T')[0], durationMonths: null });
    this.showModal.set(true);
  }

  editSub(sub: Subscription) {
    this.editingId.set(sub.id!);
    this.form.patchValue({ name: sub.name, category: sub.category, monthlyAmount: sub.monthlyAmount, startDate: sub.startDate, durationMonths: sub.durationMonths });
    this.showModal.set(true);
  }

  saveSub() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const id = this.editingId();
    const obs = id ? this.api.updateSubscription(id, this.form.value) : this.api.createSubscription(this.form.value);
    obs.subscribe({
      next: () => { this.saving.set(false); this.showModal.set(false); this.cdr.detectChanges(); this.loadSubscriptions(); },
      error: () => { this.saving.set(false); this.cdr.detectChanges(); }
    });
  }

  toggleSub(sub: Subscription) {
    this.api.toggleSubscription(sub.id!).subscribe(() => this.loadSubscriptions());
  }

  deleteSub(id: number) {
    if (!confirm('Supprimer cet abonnement ?')) return;
    this.api.deleteSubscription(id).subscribe(() => this.loadSubscriptions());
  }

  closeModal(e: MouseEvent) {
    if ((e.target as Element).classList.contains('modal-overlay')) this.showModal.set(false);
  }

  getCategoryLabel(cat: SubscriptionCategory): string {
    const c = this.subCategories.find(x => x.value === cat);
    return c ? c.label : cat;
  }

  getCategoryIcon(cat: SubscriptionCategory): string {
    const c = this.subCategories.find(x => x.value === cat);
    return c ? c.icon : 'subscriptions';
  }

  getCategoryColor(cat: SubscriptionCategory): string {
    const colors: Record<string, string> = {
      ELECTRICITY: '#F59E0B', INTERNET: '#3B82F6', MOBILE: '#10B981',
      STREAMING: '#EF4444', RENT: '#8B5CF6', INSURANCE: '#6366F1',
      GYM: '#EC4899', NEWSPAPER: '#14B8A6', CLOUD: '#06B6D4', OTHER: '#6B7280'
    };
    return colors[cat] || '#6C63FF';
  }
}
