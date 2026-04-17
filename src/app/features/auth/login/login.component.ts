import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
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

      <div *ngIf="!isNative" class="app-banners">
        <a class="app-banner android-banner" href="https://github.com/Redfenzi/moneywise-frontend/releases/latest/download/MoneyWise.apk" download>
          <div class="banner-icon android-icon">
            <span class="material-icons-round">android</span>
          </div>
          <div class="banner-text">
            <span class="banner-label">{{ 'auth.login.download_app' | translate }}</span>
            <span class="banner-sub">{{ 'auth.login.download_android' | translate }}</span>
          </div>
          <span class="material-icons-round android-arrow">download</span>
        </a>
        <button class="app-banner ios-banner" (click)="openIosModal()">
          <div class="banner-icon ios-icon">
            <span class="material-icons-round">phone_iphone</span>
          </div>
          <div class="banner-text">
            <span class="banner-label">Installer sur iOS</span>
            <span class="banner-sub">iPhone / iPad</span>
          </div>
          <span class="material-icons-round ios-arrow">info_outline</span>
        </button>
      </div>

      <!-- Modal iOS instructions -->
      <div class="ios-modal-overlay" *ngIf="showIosModal()" (click)="closeIosModal()">
        <div class="ios-modal" (click)="$event.stopPropagation()">
          <div class="ios-modal-handle"></div>
          <button class="ios-modal-close" (click)="closeIosModal()">
            <span class="material-icons-round">close</span>
          </button>
          <div class="ios-modal-header">
            <div class="ios-modal-icon-wrap">
              <span class="material-icons-round">phone_iphone</span>
            </div>
            <h3 class="ios-modal-title">Installer sur iOS</h3>
            <p class="ios-modal-subtitle">Ajoutez MoneyWise à votre écran d'accueil</p>
          </div>
          <div class="ios-steps">
            <div class="ios-step">
              <div class="step-num">1</div>
              <div class="step-text">
                <strong>Ouvrez Safari</strong>
                <span>Pas Chrome ou autre navigateur</span>
              </div>
            </div>
            <div class="ios-step">
              <div class="step-num">2</div>
              <div class="step-text">
                <strong>Appuyez sur Partager ↑</strong>
                <span>Le bouton carré avec une flèche en bas de l'écran</span>
              </div>
            </div>
            <div class="ios-step">
              <div class="step-num">3</div>
              <div class="step-text">
                <strong>« Sur l'écran d'accueil »</strong>
                <span>Faites défiler le menu et appuyez dessus</span>
              </div>
            </div>
            <div class="ios-step">
              <div class="step-num">4</div>
              <div class="step-text">
                <strong>Appuyez sur « Ajouter »</strong>
                <span>MoneyWise apparaît comme une vraie app !</span>
              </div>
            </div>
          </div>
          <a href="https://redmoneywise.netlify.app" class="ios-open-btn" target="_blank">
            <span class="material-icons-round">open_in_new</span>
            Ouvrir dans Safari
          </a>
        </div>
      </div>

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
      padding: 0;
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
    .app-banners {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      @media (max-width: 400px) {
        flex-direction: column;
      }
    }
    .app-banner {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      text-decoration: none;
      transition: var(--transition);
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
    .android-banner {
      &:hover {
        border-color: #3ddc84;
        box-shadow: 0 4px 16px rgba(61, 220, 132, 0.15);
        transform: translateY(-1px);
      }
    }
    .ios-banner {
      background: var(--bg-card);
      justify-content: flex-start;
      text-align: left;
      &:hover {
        border-color: #007AFF;
        box-shadow: 0 4px 16px rgba(0, 122, 255, 0.15);
        transform: translateY(-1px);
      }
    }
    .banner-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      .material-icons-round { color: #fff; font-size: 22px; }
    }
    .android-icon {
      background: linear-gradient(135deg, #3ddc84 0%, #00c853 100%);
    }
    .ios-icon {
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
    }
    .banner-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .banner-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .banner-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .android-arrow {
      color: #3ddc84;
      font-size: 20px;
      flex-shrink: 0;
    }
    .ios-arrow {
      color: #007AFF;
      font-size: 20px;
      flex-shrink: 0;
    }
    /* iOS Modal */
    .ios-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 9999;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .ios-modal {
      background: var(--bg-card);
      border-radius: 24px 24px 0 0;
      padding: 20px 20px 36px;
      padding-bottom: max(36px, calc(20px + env(safe-area-inset-bottom, 0px)));
      width: 100%;
      max-width: 100%;
      max-height: var(--modal-max-h, 90vh);
      height: auto;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      position: relative;
      border: 1px solid var(--border);
      border-bottom: none;
      box-sizing: border-box;
    }
    .ios-modal-close {
      position: absolute;
      top: 14px;
      right: 14px;
      background: var(--bg-secondary);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
      .material-icons-round { font-size: 18px; }
      &:hover { color: var(--text-primary); }
    }
    .ios-modal-handle {
      width: 36px;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin: 0 auto 18px;
    }
    .ios-modal-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .ios-modal-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      .material-icons-round { color: #fff; font-size: 24px; }
    }
    .ios-modal-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px;
    }
    .ios-modal-subtitle {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin: 0;
    }
    .ios-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }
    .ios-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: var(--bg-secondary);
      border-radius: 12px;
      padding: 12px;
    }
    .step-num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007AFF, #5856D6);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-top: 1px;
      strong {
        font-size: 0.85rem;
        color: var(--text-primary);
        font-weight: 600;
      }
      span {
        font-size: 0.76rem;
        color: var(--text-muted);
        line-height: 1.4;
      }
    }
    .ios-open-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      color: #fff;
      border-radius: 14px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: var(--transition);
      box-sizing: border-box;
      .material-icons-round { font-size: 18px; }
      &:hover { opacity: 0.9; transform: translateY(-1px); }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isNative = Capacitor.isNativePlatform();
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  showIosModal = signal(false);
  private scrollY = 0;
  private popstateHandler = () => {
    if (this.showIosModal()) {
      this.closeIosModal(false);
    }
  };

  lang = inject(LanguageService);
  private translate = inject(TranslateService);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    if (this.isNative) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('popstate', this.popstateHandler);
  }

  ngOnDestroy() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    window.removeEventListener('popstate', this.popstateHandler);
  }

  openIosModal() {
    // Calcul de la hauteur réelle visible (fix iOS Safari vh bug)
    const realH = window.innerHeight;
    document.documentElement.style.setProperty('--modal-max-h', `${Math.floor(realH * 0.90)}px`);
    // Scroll lock iOS-compatible (position:fixed sur body)
    this.scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    // Pousse un état dans l'historique pour intercepter le bouton retour
    history.pushState({ iosModal: true }, '');
    this.showIosModal.set(true);
  }

  closeIosModal(pushBack = true) {
    if (pushBack) {
      // Si fermé via bouton/overlay (pas via popstate), revenir en arrière
      history.back();
      return;
    }
    this.showIosModal.set(false);
    // Restore scroll
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, this.scrollY);
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
