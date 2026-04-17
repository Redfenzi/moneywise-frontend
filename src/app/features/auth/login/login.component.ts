import { Component, signal, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-container">
      <div class="auth-wrapper">
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
          <h2 style="font-size:1.5rem; margin-bottom:8px;">{{ 'auth.login.title' | translate }}</h2>
          <p style="font-size:0.875rem;">{{ 'auth.login.subtitle' | translate }}</p>
        </div>

        <div *ngIf="error()" class="alert alert-danger">
          <span class="material-icons-round">error_outline</span>
          {{ error() }}
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">{{ 'auth.login.username' | translate }}</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">person</span>
              <input type="text" class="form-control" formControlName="username"
                     [placeholder]="'auth.login.username_placeholder' | translate"
                     [class.error]="form.get('username')?.invalid && form.get('username')?.touched">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'auth.login.password' | translate }}</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">lock</span>
              <input [type]="showPassword() ? 'text' : 'password'"
                     class="form-control" formControlName="password"
                     [placeholder]="'auth.login.password_placeholder' | translate"
                     style="padding-right: 50px;"
                     [class.error]="form.get('password')?.invalid && form.get('password')?.touched">
              <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())">
                <span class="material-icons-round">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <div style="text-align:right; margin-top: -12px; margin-bottom: 16px;">
            <a routerLink="/auth/forgot-password" style="font-size:0.8rem; color: var(--primary-light); font-weight:500;">
              {{ 'auth.login.forgot_password' | translate }}
            </a>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 8px;"
                  [disabled]="form.invalid || loading()">
            <span class="loading-spinner" *ngIf="loading()"></span>
            <span class="material-icons-round" *ngIf="!loading()">login</span>
            {{ loading() ? ('auth.login.loading' | translate) : ('auth.login.submit' | translate) }}
          </button>
        </form>

        <p style="text-align:center; margin-top: 24px; font-size:0.875rem; color: var(--text-muted);">
          {{ 'auth.login.no_account' | translate }}
          <a routerLink="/auth/register" style="color: var(--primary-light); font-weight:600;">{{ 'auth.login.create_account' | translate }}</a>
        </p>
      </div>

      <a *ngIf="!isNative" class="android-banner" href="https://github.com/Redfenzi/moneywise-frontend/releases/latest/download/MoneyWise.apk" download>
        <div class="android-icon">
          <span class="material-icons-round">android</span>
        </div>
        <div class="android-text">
          <span class="android-label">{{ 'auth.login.download_app' | translate }}</span>
          <span class="android-sub">{{ 'auth.login.download_android' | translate }}</span>
        </div>
        <span class="material-icons-round android-arrow">download</span>
      </a>
      </div>
    </div>
  `,
  styles: [`
    .lang-switcher-auth {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      margin-bottom: 24px;
    }
    .lang-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      padding: 2px 8px;
      border-radius: 6px;
      transition: var(--transition);
      font-family: 'Inter', sans-serif;
      &:hover { color: var(--text-primary); }
      &.active { color: var(--primary-light); font-weight: 700; }
    }
    .lang-sep { color: var(--border); font-size: 0.75rem; }
    :host { width: 100%; display: flex; justify-content: center; }
    .auth-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 480px;
      position: relative;
      z-index: 1;
      padding: 0 16px;
      box-sizing: border-box;
    }
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
    .android-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 20px;
      padding: 14px 20px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      text-decoration: none;
      transition: var(--transition);
      cursor: pointer;
      &:hover {
        border-color: #3ddc84;
        box-shadow: 0 4px 16px rgba(61, 220, 132, 0.15);
        transform: translateY(-1px);
      }
    }
    .android-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #3ddc84 0%, #00c853 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .material-icons-round { color: #fff; font-size: 24px; }
    }
    .android-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .android-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .android-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .android-arrow {
      color: #3ddc84;
      font-size: 22px;
      flex-shrink: 0;
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  isNative = Capacitor.isNativePlatform();
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  lang = inject(LanguageService);
  private translate = inject(TranslateService);

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
        this.error.set(err.error?.error || this.translate.instant('auth.login.error_invalid'));
      }
    });
  }
}
