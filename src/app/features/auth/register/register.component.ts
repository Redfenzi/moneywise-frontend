import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="auth-container" style="align-items: flex-start;">
      <div class="auth-card" style="max-width: 560px; width: 100%; box-sizing: border-box;">
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
          <h2 style="font-size:1.5rem; margin-bottom:8px;">{{ 'auth.register.title' | translate }}</h2>
          <p style="font-size:0.875rem;">{{ 'auth.register.subtitle' | translate }}</p>
        </div>

        <div *ngIf="error()" class="alert alert-danger">
          <span class="material-icons-round">error_outline</span>
          {{ error() }}
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ 'auth.register.first_name' | translate }}</label>
              <input type="text" class="form-control" formControlName="firstName"
                     [class.error]="form.get('firstName')?.invalid && form.get('firstName')?.touched"
                     [placeholder]="'auth.register.first_name_placeholder' | translate">
              <div class="form-error" *ngIf="form.get('firstName')?.invalid && form.get('firstName')?.touched">
                <span *ngIf="form.get('firstName')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ 'auth.register.last_name' | translate }}</label>
              <input type="text" class="form-control" formControlName="lastName"
                     [class.error]="form.get('lastName')?.invalid && form.get('lastName')?.touched"
                     [placeholder]="'auth.register.last_name_placeholder' | translate">
              <div class="form-error" *ngIf="form.get('lastName')?.invalid && form.get('lastName')?.touched">
                <span *ngIf="form.get('lastName')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'auth.register.username' | translate }}</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">person</span>
              <input type="text" class="form-control" formControlName="username"
                     [class.error]="form.get('username')?.invalid && form.get('username')?.touched"
                     [placeholder]="'auth.register.username_placeholder' | translate">
            </div>
            <div class="form-error" *ngIf="form.get('username')?.invalid && form.get('username')?.touched">
              <span *ngIf="form.get('username')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
              <span *ngIf="form.get('username')?.errors?.['minlength']">{{ 'validation.min_length_3' | translate }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'auth.register.email' | translate }}</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">email</span>
              <input type="email" class="form-control" formControlName="email"
                     [class.error]="form.get('email')?.invalid && form.get('email')?.touched"
                     [placeholder]="'auth.register.email_placeholder' | translate">
            </div>
            <div class="form-error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              <span *ngIf="form.get('email')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
              <span *ngIf="form.get('email')?.errors?.['email']">{{ 'validation.email_invalid' | translate }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'auth.register.profile_type' | translate }}</label>
            <select class="form-control" formControlName="userType">
              <option value="INDIVIDUAL">👤 {{ 'auth.register.individual' | translate }}</option>
              <option value="BUSINESS">🏢 {{ 'auth.register.business' | translate }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'auth.register.currency' | translate }}</label>
            <select class="form-control" formControlName="currency">
              <option *ngFor="let c of currencies" [value]="c">{{ 'currency.' + c | translate }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'auth.register.password' | translate }}</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">lock</span>
              <input [type]="showPassword() ? 'text' : 'password'"
                     class="form-control" formControlName="password"
                     [placeholder]="'auth.register.password_placeholder' | translate"
                     style="padding-right: 50px;">
              <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())">
                <span class="material-icons-round">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div class="form-error" *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              <span *ngIf="form.get('password')?.errors?.['required']">{{ 'validation.required' | translate }}</span>
              <span *ngIf="form.get('password')?.errors?.['minlength']">{{ 'validation.min_length_6' | translate }}</span>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 8px;"
                  [disabled]="form.invalid || loading()">
            <span class="loading-spinner" *ngIf="loading()"></span>
            <span class="material-icons-round" *ngIf="!loading()">person_add</span>
            {{ loading() ? ('auth.register.loading' | translate) : ('auth.register.submit' | translate) }}
          </button>
        </form>

        <p style="text-align:center; margin-top: 24px; font-size:0.875rem; color: var(--text-muted);">
          {{ 'auth.register.already_account' | translate }}
          <a routerLink="/auth/login" style="color: var(--primary-light); font-weight:600;">{{ 'auth.register.login' | translate }}</a>
        </p>
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
export class RegisterComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  lang = inject(LanguageService);
  private translate = inject(TranslateService);

  currencies = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'MAD', 'DZD', 'TND', 'XOF'];

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

  ngOnInit() {
    // Le scroll vertical est géré par touch-action: pan-y (styles.scss)
    // overflow-x: hidden est déjà appliqué globalement sur body
  }

  ngOnDestroy() {}

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: { error?: { error?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.error || this.translate.instant('auth.register.error_creation'));
      }
    });
  }
}
