import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../../../core/services/api.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">account_balance_wallet</span>
          </div>
          <span class="logo-text">MoneyWise</span>
        </div>

        <div class="lang-switcher-auth">
          <button class="lang-btn" [class.active]="lang.currentLang() === 'fr'" (click)="lang.setLanguage('fr')">
            🇫🇷 FR
          </button>
          <span class="lang-sep">|</span>
          <button class="lang-btn" [class.active]="lang.currentLang() === 'en'" (click)="lang.setLanguage('en')">
            🇬🇧 EN
          </button>
        </div>

        <div style="text-align:center; margin-bottom: 32px;">
          <h2 style="font-size:1.5rem; margin-bottom:8px;">{{ 'auth.forgot.title' | translate }}</h2>
          <p style="font-size:0.875rem; color: var(--text-muted);">{{ 'auth.forgot.subtitle' | translate }}</p>
        </div>

        <!-- Succès -->
        <div *ngIf="success()" class="alert alert-success">
          <span class="material-icons-round">mark_email_read</span>
          <div>
            <strong>{{ 'auth.forgot.success_title' | translate }}</strong>
            <p style="margin:4px 0 0; font-size:0.85rem;">{{ 'auth.forgot.success_desc' | translate }}</p>
          </div>
        </div>

        <!-- Erreur -->
        <div *ngIf="error()" class="alert alert-danger">
          <span class="material-icons-round">error_outline</span>
          {{ error() }}
        </div>

        <form *ngIf="!success()" [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">{{ 'auth.forgot.email' | translate }}</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">email</span>
              <input type="email" class="form-control" formControlName="email"
                     [placeholder]="'auth.forgot.email_placeholder' | translate"
                     [class.error]="form.get('email')?.invalid && form.get('email')?.touched">
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 8px;"
                  [disabled]="form.invalid || loading()">
            <span class="loading-spinner" *ngIf="loading()"></span>
            <span class="material-icons-round" *ngIf="!loading()">send</span>
            {{ loading() ? ('auth.forgot.loading' | translate) : ('auth.forgot.submit' | translate) }}
          </button>
        </form>

        <p style="text-align:center; margin-top: 24px; font-size:0.875rem; color: var(--text-muted);">
          <a routerLink="/auth/login" style="color: var(--primary-light); font-weight:600;">
            <span class="material-icons-round" style="font-size:14px; vertical-align:middle;">arrow_back</span>
            {{ 'auth.forgot.back_login' | translate }}
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    }
    .auth-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      justify-content: center;
    }
    .logo-icon {
      width: 44px; height: 44px;
      background: var(--primary-gradient);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      .material-icons-round { color: white; font-size: 22px; }
    }
    .logo-text {
      font-size: 1.4rem; font-weight: 800;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .lang-switcher-auth {
      display: flex; align-items: center; gap: 4px;
      justify-content: center; margin-bottom: 24px;
    }
    .lang-btn {
      background: none; border: none;
      color: var(--text-secondary); font-size: 0.8rem; font-weight: 500;
      cursor: pointer; padding: 2px 6px; border-radius: 6px;
      transition: var(--transition); font-family: 'Inter', sans-serif;
      &:hover { color: var(--text-primary); }
      &.active { color: var(--primary-light); font-weight: 700; }
    }
    .lang-sep { color: var(--border); }
    .form-group { margin-bottom: 20px; }
    .form-label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .input-with-icon { position: relative; }
    .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 18px; pointer-events: none; }
    .form-control {
      width: 100%; box-sizing: border-box; padding: 11px 14px 11px 40px;
      background: var(--bg-secondary); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text-primary); font-size: 0.9rem;
      font-family: 'Inter', sans-serif; outline: none; transition: var(--transition);
      &:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
      &.error { border-color: var(--danger); }
    }
    .alert {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px; border-radius: 10px; font-size: 0.875rem; margin-bottom: 20px;
      .material-icons-round { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
    }
    .alert-danger { background: var(--danger-bg); color: var(--danger); border: 1px solid rgba(239,68,68,0.2); }
    .alert-success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
    .loading-spinner {
      width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = signal(false);
  success = signal(false);
  error = signal('');

  private api = inject(ApiService);
  lang = inject(LanguageService);
  private fb = inject(FormBuilder);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.api.forgotPassword(this.form.value.email).subscribe({
      next: (res) => {
        // Stocker le browserKey dans localStorage — lie la demande à CE navigateur
        localStorage.setItem('mw_reset_browser_key', res.browserKey);
        this.loading.set(false);
        this.success.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }
}
