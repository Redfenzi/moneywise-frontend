import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">account_balance_wallet</span>
          </div>
          <span class="logo-text">MoneyWise</span>
        </div>

        <div style="text-align:center; margin-bottom: 32px;">
          <h2 style="font-size:1.5rem; margin-bottom:8px;">Bon retour !</h2>
          <p style="font-size:0.875rem;">Connectez-vous à votre compte</p>
        </div>

        <div *ngIf="error()" class="alert alert-danger">
          <span class="material-icons-round">error_outline</span>
          {{ error() }}
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Nom d'utilisateur</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">person</span>
              <input type="text" class="form-control" formControlName="username"
                     placeholder="Votre nom d'utilisateur"
                     [class.error]="form.get('username')?.invalid && form.get('username')?.touched">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">lock</span>
              <input [type]="showPassword() ? 'text' : 'password'"
                     class="form-control" formControlName="password"
                     placeholder="Votre mot de passe"
                     style="padding-right: 50px;"
                     [class.error]="form.get('password')?.invalid && form.get('password')?.touched">
              <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())">
                <span class="material-icons-round">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 8px;"
                  [disabled]="form.invalid || loading()">
            <span class="loading-spinner" *ngIf="loading()"></span>
            <span class="material-icons-round" *ngIf="!loading()">login</span>
            {{ loading() ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p style="text-align:center; margin-top: 24px; font-size:0.875rem; color: var(--text-muted);">
          Pas encore de compte ?
          <a routerLink="/auth/register" style="color: var(--primary-light); font-weight:600;">Créer un compte</a>
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
      transition: var(--transition);
      &:hover { color: var(--text-primary); }
      .material-icons-round { font-size: 20px; }
    }
    .input-with-icon { position: relative; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: { error?: { error?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Identifiants invalides');
      }
    });
  }
}
