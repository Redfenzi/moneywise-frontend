import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card verify-card">
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
          <span class="lang-sep">|</span>
          <button class="lang-btn theme-toggle-btn" (click)="theme.toggle()" [title]="theme.isDark() ? ('nav.theme_light' | translate) : ('nav.theme_dark' | translate)">
            <span class="material-icons-round" style="font-size:16px; vertical-align:middle;">{{ theme.isDark() ? 'light_mode' : 'dark_mode' }}</span>
          </button>
        </div>

        <!-- Chargement -->
        <div *ngIf="status() === 'loading'" class="status-block">
          <span class="loading-spinner large"></span>
          <p>{{ 'auth.verify_email.loading' | translate }}</p>
        </div>

        <!-- Succès -->
        <div *ngIf="status() === 'success'" class="status-block">
          <span class="material-icons-round status-icon success">check_circle</span>
          <h2>{{ 'auth.verify_email.success_title' | translate }}</h2>
          <p>{{ 'auth.verify_email.success_desc' | translate }}</p>
          <div class="mobile-hint">
            <span class="material-icons-round">phone_android</span>
            <p>{{ 'auth.verify_email.app_hint' | translate }}</p>
          </div>
          <a routerLink="/auth/login" class="btn btn-primary btn-full" style="margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span class="material-icons-round">login</span>
            {{ 'auth.verify_email.go_login' | translate }}
          </a>
        </div>

        <!-- Erreur -->
        <div *ngIf="status() === 'error'" class="status-block">
          <span class="material-icons-round status-icon error">error_outline</span>
          <h2>{{ 'auth.verify_email.error_title' | translate }}</h2>
          <p>{{ errorMessage() || ('auth.verify_email.error_desc' | translate) }}</p>

          <!-- Renvoi email -->
          <div class="resend-section" *ngIf="!resendDone()">
            <p class="resend-hint">{{ 'auth.verify_email.resend_hint' | translate }}</p>
            <div class="resend-form">
              <input type="email" class="form-control" [(ngModel)]="resendEmailValue"
                     [placeholder]="'auth.verify_email.resend_placeholder' | translate">
              <button class="btn btn-primary" (click)="doResend()" [disabled]="!resendEmailValue || resendLoading()">
                <span class="loading-spinner small" *ngIf="resendLoading()"></span>
                <span class="material-icons-round" *ngIf="!resendLoading()">send</span>
                {{ resendLoading() ? ('auth.verify_email.resend_loading' | translate) : ('auth.verify_email.resend_btn' | translate) }}
              </button>
            </div>
            <p class="resend-error" *ngIf="resendError()">{{ resendError() }}</p>
          </div>

          <div class="alert-success" *ngIf="resendDone()">
            <span class="material-icons-round">mark_email_read</span>
            {{ 'auth.verify_email.resend_success' | translate }}
          </div>

          <a routerLink="/auth/register" class="btn btn-outline btn-full" style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span class="material-icons-round">person_add</span>
            {{ 'auth.verify_email.go_register' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-card {
      text-align: center;
      max-width: 440px;
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
    .status-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 16px 0;
      p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
      h2 { font-size: 1.3rem; }
    }
    .status-icon {
      font-size: 60px;
      &.success { color: #4caf50; }
      &.error { color: var(--danger); }
    }
    .resend-section {
      width: 100%;
      margin-top: 8px;
    }
    .resend-hint {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }
    .resend-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }
    .form-control {
      width: 100%; box-sizing: border-box; padding: 11px 14px;
      background: var(--bg-secondary); border: 1px solid var(--border);
      border-radius: 10px; color: var(--text-primary); font-size: 0.9rem;
      font-family: 'Inter', sans-serif; outline: none; transition: var(--transition);
      &:focus { border-color: var(--primary-light); box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
    }
    .resend-error {
      font-size: 0.8rem;
      color: var(--danger);
      margin-top: 4px;
    }
    .alert-success {
      display: flex; align-items: center; gap: 10px;
      background: rgba(16,185,129,0.1); color: #10b981;
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 10px; padding: 12px 16px; font-size: 0.875rem;
      width: 100%; box-sizing: border-box;
    }
    .btn-outline {
      background: none;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      &:hover { border-color: var(--primary-light); color: var(--primary-light); }
    }
    .mobile-hint {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(108,99,255,0.08);
      border: 1px solid rgba(108,99,255,0.2);
      border-radius: 12px;
      padding: 12px 14px;
      text-align: left;
      width: 100%;
      box-sizing: border-box;
      .material-icons-round { color: var(--primary-light); font-size: 20px; flex-shrink: 0; margin-top: 1px; }
      p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; line-height: 1.5; }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  lang = inject(LanguageService);
  theme = inject(ThemeService);

  status = signal<'loading' | 'success' | 'error'>('loading');
  errorMessage = signal('');

  resendEmailValue = '';
  resendLoading = signal(false);
  resendDone = signal(false);
  resendError = signal('');

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('error');
      return;
    }
    this.http.get<{message: string}>(`${environment.apiUrl}/auth/verify-email`, { params: { token } }).subscribe({
      next: () => this.status.set('success'),
      error: (err) => {
        this.errorMessage.set(err.error?.error || '');
        this.status.set('error');
      }
    });
  }

  doResend() {
    if (!this.resendEmailValue) return;
    this.resendLoading.set(true);
    this.resendError.set('');
    this.http.post<{ message: string }>(`${environment.apiUrl}/auth/resend-verification`, { email: this.resendEmailValue }).subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.resendDone.set(true);
      },
      error: (err) => {
        this.resendLoading.set(false);
        this.resendError.set(err.error?.error || 'Une erreur est survenue.');
      }
    });
  }
}
