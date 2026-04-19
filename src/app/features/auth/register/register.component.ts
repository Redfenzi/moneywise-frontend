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

        <!-- Écran de succès : email de confirmation envoyé -->
        <div *ngIf="registered()" class="success-card">
          <span class="material-icons-round success-icon">mark_email_unread</span>
          <h3>{{ 'auth.register.success_title' | translate }}</h3>
          <p>{{ 'auth.register.success_desc' | translate }}</p>
          <a routerLink="/auth/login" class="btn btn-primary btn-full" style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span class="material-icons-round">login</span>
            {{ 'auth.register.login' | translate }}
          </a>
        </div>

        <form *ngIf="!registered()" [formGroup]="form" (ngSubmit)="onSubmit()">
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

          <!-- Case politique de confidentialité -->
          <div class="privacy-check-group">
            <label class="privacy-label">
              <input type="checkbox" formControlName="acceptPrivacy" class="privacy-checkbox">
              <span>{{ 'auth.register.privacy_check' | translate }}
                <button type="button" class="privacy-link-btn" (click)="showPrivacy = true">
                  {{ 'auth.register.privacy_link' | translate }}
                </button>
              </span>
            </label>
            <div class="form-error" *ngIf="form.get('acceptPrivacy')?.invalid && form.get('acceptPrivacy')?.touched">
              {{ 'auth.register.privacy_required' | translate }}
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top: 8px;"
                  [disabled]="form.invalid || loading()">
            <span class="loading-spinner" *ngIf="loading()"></span>
            <span class="material-icons-round" *ngIf="!loading()">person_add</span>
            {{ loading() ? ('auth.register.loading' | translate) : ('auth.register.submit' | translate) }}
          </button>
        </form>

        <!-- Modal politique de confidentialité -->
        <div class="privacy-modal-overlay" *ngIf="showPrivacy" (click)="showPrivacy = false">
          <div class="privacy-modal" (click)="$event.stopPropagation()">
            <div class="privacy-modal-handle"></div>
            <div class="privacy-modal-header">
              <h3 class="privacy-modal-title">
                <span class="material-icons-round" style="color:var(--primary-light);font-size:22px;">privacy_tip</span>
                {{ 'auth.register.privacy_link' | translate }}
              </h3>
              <button class="privacy-close-btn" type="button" (click)="showPrivacy = false">
                <span class="material-icons-round">close</span>
              </button>
            </div>
            <div class="privacy-modal-body">
              <ng-container *ngIf="lang.currentLang() === 'fr'; else enPrivacy">
                <p class="privacy-date">Dernière mise à jour : 19 avril 2026</p>

                <h4>1. Responsable du traitement</h4>
                <p>MoneyWise est une application de gestion financière personnelle. Les données collectées sont traitées dans le respect de la réglementation applicable, notamment le RGPD (Règlement Général sur la Protection des Données).</p>

                <h4>2. Données collectées</h4>
                <p>Nous collectons les données suivantes :</p>
                <ul>
                  <li>Informations d'identification : prénom, nom, nom d'utilisateur, adresse email</li>
                  <li>Données financières : revenus, dépenses, abonnements, comptes bancaires que vous saisissez</li>
                  <li>Préférences : devise, langue, thème de l'application</li>
                  <li>Données de connexion : date de création, jetons d'authentification</li>
                </ul>

                <h4>3. Finalités du traitement</h4>
                <p>Vos données sont utilisées exclusivement pour :</p>
                <ul>
                  <li>Vous fournir les fonctionnalités de l'application (suivi budgétaire, tableaux de bord)</li>
                  <li>Authentifier votre compte de manière sécurisée</li>
                  <li>Vous envoyer des emails transactionnels (confirmation d'email, réinitialisation de mot de passe)</li>
                </ul>
                <p>Vos données ne sont jamais vendues ni partagées avec des tiers à des fins commerciales.</p>

                <h4>4. Durée de conservation</h4>
                <p>Vos données sont conservées tant que votre compte est actif. En cas de suppression de votre compte, toutes vos données sont définitivement effacées de nos serveurs.</p>

                <h4>5. Sécurité</h4>
                <p>Les mots de passe sont chiffrés avec BCrypt. Les communications sont sécurisées via HTTPS. Les jetons d'authentification JWT ont une durée de vie limitée.</p>

                <h4>6. Vos droits</h4>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul>
                  <li><strong>Droit d'accès</strong> : consulter vos données depuis la page Profil</li>
                  <li><strong>Droit de rectification</strong> : modifier vos informations depuis la page Profil</li>
                  <li><strong>Droit à l'effacement</strong> : supprimer votre compte et toutes vos données depuis la page Profil</li>
                  <li><strong>Droit à la portabilité</strong> : vous pouvez exporter vos données sur demande</li>
                </ul>

                <h4>7. Cookies et stockage local</h4>
                <p>L'application utilise le stockage local (localStorage) uniquement pour mémoriser vos préférences de langue et de thème. Aucun cookie publicitaire n'est utilisé.</p>

                <h4>8. Contact</h4>
                <p>Pour toute question relative à vos données personnelles, contactez-nous à : <strong>redtechsolutions75&#64;gmail.com</strong></p>
              </ng-container>
              <ng-template #enPrivacy>
                <p class="privacy-date">Last updated: April 19, 2026</p>

                <h4>1. Data Controller</h4>
                <p>MoneyWise is a personal finance management application. The data collected is processed in accordance with applicable regulations, including GDPR (General Data Protection Regulation).</p>

                <h4>2. Data Collected</h4>
                <p>We collect the following data:</p>
                <ul>
                  <li>Identification: first name, last name, username, email address</li>
                  <li>Financial data: income, expenses, subscriptions, and bank accounts you enter</li>
                  <li>Preferences: currency, language, app theme</li>
                  <li>Connection data: account creation date, authentication tokens</li>
                </ul>

                <h4>3. Purpose of Processing</h4>
                <p>Your data is used exclusively to:</p>
                <ul>
                  <li>Provide application features (budget tracking, dashboards)</li>
                  <li>Securely authenticate your account</li>
                  <li>Send transactional emails (email confirmation, password reset)</li>
                </ul>
                <p>Your data is never sold or shared with third parties for commercial purposes.</p>

                <h4>4. Retention Period</h4>
                <p>Your data is retained as long as your account is active. If you delete your account, all your data is permanently erased from our servers.</p>

                <h4>5. Security</h4>
                <p>Passwords are encrypted with BCrypt. Communications are secured via HTTPS. JWT authentication tokens have a limited lifetime.</p>

                <h4>6. Your Rights</h4>
                <p>Under GDPR, you have the following rights:</p>
                <ul>
                  <li><strong>Right of access</strong>: view your data from the Profile page</li>
                  <li><strong>Right of rectification</strong>: edit your information from the Profile page</li>
                  <li><strong>Right to erasure</strong>: delete your account and all your data from the Profile page</li>
                  <li><strong>Right to portability</strong>: you may request an export of your data</li>
                </ul>

                <h4>7. Cookies and Local Storage</h4>
                <p>The application uses local storage (localStorage) only to remember your language and theme preferences. No advertising cookies are used.</p>

                <h4>8. Contact</h4>
                <p>For any questions regarding your personal data, contact us at: <strong>redtechsolutions75&#64;gmail.com</strong></p>
              </ng-template>
            </div>
            <div class="privacy-modal-footer">
              <button class="btn btn-primary" type="button" (click)="acceptAndClose()">
                <span class="material-icons-round">check_circle</span>
                {{ 'auth.register.privacy_link' | translate }} — OK
              </button>
            </div>
          </div>
        </div>

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
    .success-card {
      text-align: center;
      padding: 32px 16px;
      .success-icon {
        font-size: 56px;
        color: var(--primary-light);
        margin-bottom: 16px;
      }
      h3 { font-size: 1.3rem; margin-bottom: 12px; }
      p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }
    }
    .password-toggle {      position: absolute;
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
    .privacy-check-group {
      margin: 16px 0 4px;
    }
    .privacy-label {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .privacy-checkbox {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
      accent-color: var(--primary-light);
      cursor: pointer;
    }
    .privacy-link-btn {
      background: none;
      border: none;
      color: var(--primary-light);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0;
      font-family: 'Inter', sans-serif;
      text-decoration: underline;
      &:hover { opacity: 0.8; }
    }
    /* Modal politique */
    .privacy-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 2000;
      padding: 0;
    }
    .privacy-modal {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px 20px 0 0;
      border-bottom: none;
      width: 100%;
      max-width: 640px;
      max-height: 85dvh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.4);
    }
    .privacy-modal-handle {
      width: 40px;
      height: 4px;
      background: var(--border-light);
      border-radius: 2px;
      margin: 12px auto 0;
      flex-shrink: 0;
    }
    .privacy-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .privacy-modal-title {
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    .privacy-close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      border-radius: 6px;
      &:hover { background: var(--bg-secondary); color: var(--text-primary); }
      .material-icons-round { font-size: 20px; }
    }
    .privacy-modal-body {
      overflow-y: auto;
      padding: 16px 20px;
      flex: 1;
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.7;
      h4 {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 20px 0 6px;
      }
      p { margin: 0 0 8px; }
      ul {
        margin: 4px 0 8px 18px;
        li { margin-bottom: 4px; }
      }
    }
    .privacy-date {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-bottom: 16px !important;
      font-style: italic;
    }
    .privacy-modal-footer {
      padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
      border-top: 1px solid var(--border);
      flex-shrink: 0;
      .btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; }
    }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  registered = signal(false);
  showPrivacy = false;

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
      password: ['', [Validators.required, Validators.minLength(6)]],
      acceptPrivacy: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    // Le scroll vertical est géré par touch-action: pan-y (styles.scss)
    // overflow-x: hidden est déjà appliqué globalement sur body
  }

  ngOnDestroy() {}

  acceptAndClose() {
    this.form.get('acceptPrivacy')?.setValue(true);
    this.showPrivacy = false;
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { acceptPrivacy, ...payload } = this.form.value;
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.registered.set(true);
      },
      error: (err: { error?: { error?: string } }) => {
        this.loading.set(false);
        this.error.set(err.error?.error || this.translate.instant('auth.register.error_creation'));
      }
    });
  }
}
