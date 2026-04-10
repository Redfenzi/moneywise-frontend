import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card" style="max-width: 560px;">
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">account_balance_wallet</span>
          </div>
          <span class="logo-text">MoneyWise</span>
        </div>

        <div style="text-align:center; margin-bottom: 32px;">
          <h2 style="font-size:1.5rem; margin-bottom:8px;">Créer un compte</h2>
          <p style="font-size:0.875rem;">Commencez à gérer votre argent intelligemment</p>
        </div>

        <div *ngIf="error()" class="alert alert-danger">
          <span class="material-icons-round">error_outline</span>
          {{ error() }}
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input type="text" class="form-control" formControlName="firstName" placeholder="Jean">
            </div>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input type="text" class="form-control" formControlName="lastName" placeholder="Dupont">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nom d'utilisateur</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">person</span>
              <input type="text" class="form-control" formControlName="username" placeholder="jeandupont">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">email</span>
              <input type="email" class="form-control" formControlName="email" placeholder="jean@exemple.fr">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Type de profil</label>
            <select class="form-control" formControlName="userType">
              <option value="INDIVIDUAL">👤 Particulier</option>
              <option value="BUSINESS">🏢 Entreprise (revenus variables)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Devise</label>
            <select class="form-control" formControlName="currency">
              <option value="EUR">🇪🇺 Euro (EUR)</option>
              <option value="USD">🇺🇸 Dollar américain (USD)</option>
              <option value="GBP">🇬🇧 Livre sterling (GBP)</option>
              <option value="CHF">🇨🇭 Franc suisse (CHF)</option>
              <option value="CAD">🇨🇦 Dollar canadien (CAD)</option>
              <option value="AUD">🇦🇺 Dollar australien (AUD)</option>
              <option value="JPY">🇯🇵 Yen japonais (JPY)</option>
              <option value="MAD">🇲🇦 Dirham marocain (MAD)</option>
              <option value="DZD">🇩🇿 Dinar algérien (DZD)</option>
              <option value="TND">🇹🇳 Dinar tunisien (TND)</option>
              <option value="XOF">🌍 Franc CFA (XOF)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">lock</span>
              <input [type]="showPassword() ? 'text' : 'password'"
                     class="form-control" formControlName="password"
                     placeholder="Minimum 6 caractères"
                     style="padding-right: 50px;">
              <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())">
                <span class="material-icons-round">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 8px;"
                  [disabled]="form.invalid || loading()">
            <span class="loading-spinner" *ngIf="loading()"></span>
            <span class="material-icons-round" *ngIf="!loading()">person_add</span>
            {{ loading() ? 'Création...' : 'Créer mon compte' }}
          </button>
        </form>

        <p style="text-align:center; margin-top: 24px; font-size:0.875rem; color: var(--text-muted);">
          Déjà un compte ?
          <a routerLink="/auth/login" style="color: var(--primary-light); font-weight:600;">Se connecter</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      .material-icons-round { font-size: 20px; }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      userType: ['INDIVIDUAL', Validators.required],
      currency: ['EUR', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: { error?: { error?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Erreur lors de la création du compte');
      }
    });
  }
}
