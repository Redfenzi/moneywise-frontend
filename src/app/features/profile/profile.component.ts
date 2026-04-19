import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'profile.title' | translate }}</h1>
        <p class="page-subtitle">{{ 'profile.subtitle' | translate }}</p>
      </div>
    </div>

    <div class="profile-grid">

      <!-- Infos personnelles -->
      <div class="card">
        <div class="card-header">
          <span class="material-icons-round card-icon">person</span>
          <h2 class="card-title">{{ 'profile.personal_info' | translate }}</h2>
        </div>

        <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">{{ 'profile.first_name' | translate }}</label>
              <input class="form-input" type="text" name="firstName"
                     [(ngModel)]="profile.firstName" required
                     #firstNameInput="ngModel"
                     [class.error]="firstNameInput.invalid && firstNameInput.touched" />
              <div class="form-error" *ngIf="firstNameInput.invalid && firstNameInput.touched">
                <span *ngIf="firstNameInput.errors?.['required']">{{ 'validation.required' | translate }}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ 'profile.last_name' | translate }}</label>
              <input class="form-input" type="text" name="lastName"
                     [(ngModel)]="profile.lastName" required
                     #lastNameInput="ngModel"
                     [class.error]="lastNameInput.invalid && lastNameInput.touched" />
              <div class="form-error" *ngIf="lastNameInput.invalid && lastNameInput.touched">
                <span *ngIf="lastNameInput.errors?.['required']">{{ 'validation.required' | translate }}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'profile.username' | translate }}</label>
            <input class="form-input" type="text" [value]="currentUser()?.username" disabled />
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'profile.email' | translate }}</label>
            <input class="form-input" type="email" name="email"
                   [(ngModel)]="profile.email" required
                   #emailInput="ngModel"
                   [class.error]="emailInput.invalid && emailInput.touched" />
            <div class="form-error" *ngIf="emailInput.invalid && emailInput.touched">
              <span *ngIf="emailInput.errors?.['required']">{{ 'validation.required' | translate }}</span>
              <span *ngIf="emailInput.errors?.['email']">{{ 'validation.email_invalid' | translate }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'profile.currency' | translate }}</label>
            <select class="form-input" name="currency" [(ngModel)]="profile.currency">
              <option *ngFor="let c of currencies" [value]="c">{{ 'currency.' + c | translate }}</option>
            </select>
          </div>

          <div *ngIf="profileSuccess" class="alert alert-success">
            <span class="material-icons-round">check_circle</span>
            {{ 'profile.success_profile' | translate }}
          </div>
          <div *ngIf="profileError" class="alert alert-error">
            <span class="material-icons-round">error</span>
            {{ profileError }}
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="profileLoading || !profileForm.valid">
            <span class="material-icons-round" *ngIf="!profileLoading">save</span>
            <span class="material-icons-round spin" *ngIf="profileLoading">sync</span>
            {{ profileLoading ? ('profile.saving' | translate) : ('profile.save' | translate) }}
          </button>
        </form>
      </div>

      <!-- Changement de mot de passe -->
      <div class="card">
        <div class="card-header">
          <span class="material-icons-round card-icon">lock</span>
          <h2 class="card-title">{{ 'profile.change_password' | translate }}</h2>
        </div>

        <form (ngSubmit)="savePassword()" #passwordForm="ngForm">
          <div class="form-group">
            <label class="form-label">{{ 'profile.current_password' | translate }}</label>
            <input class="form-input" type="password" name="currentPassword"
                   [(ngModel)]="passwords.currentPassword" required
                   #currentPasswordInput="ngModel"
                   [class.error]="currentPasswordInput.invalid && currentPasswordInput.touched" />
            <div class="form-error" *ngIf="currentPasswordInput.invalid && currentPasswordInput.touched">
              <span *ngIf="currentPasswordInput.errors?.['required']">{{ 'validation.required' | translate }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'profile.new_password' | translate }}</label>
            <input class="form-input" type="password" name="newPassword"
                   [(ngModel)]="passwords.newPassword" required minlength="6"
                   #newPasswordInput="ngModel"
                   [class.error]="newPasswordInput.invalid && newPasswordInput.touched" />
            <div class="form-error" *ngIf="newPasswordInput.invalid && newPasswordInput.touched">
              <span *ngIf="newPasswordInput.errors?.['required']">{{ 'validation.required' | translate }}</span>
              <span *ngIf="newPasswordInput.errors?.['minlength']">{{ 'validation.min_length_6' | translate }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ 'profile.confirm_password' | translate }}</label>
            <input class="form-input" type="password" name="confirmPassword"
                   [(ngModel)]="passwords.confirmPassword" required />
            <span class="hint-error"
                  *ngIf="passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword">
              {{ 'profile.password_mismatch' | translate }}
            </span>
          </div>

          <div *ngIf="passwordSuccess" class="alert alert-success">
            <span class="material-icons-round">check_circle</span>
            {{ 'profile.success_password' | translate }}
          </div>
          <div *ngIf="passwordError" class="alert alert-error">
            <span class="material-icons-round">error</span>
            {{ passwordError }}
          </div>

          <button class="btn btn-primary" type="submit"
                  [disabled]="passwordLoading || !passwordForm.valid || passwords.newPassword !== passwords.confirmPassword">
            <span class="material-icons-round" *ngIf="!passwordLoading">lock_reset</span>
            <span class="material-icons-round spin" *ngIf="passwordLoading">sync</span>
            {{ passwordLoading ? ('profile.changing' | translate) : ('profile.change_btn' | translate) }}
          </button>
        </form>
      </div>

    </div>

    <!-- Suppression du compte -->
    <div class="card delete-card">
      <div class="card-header">
        <span class="material-icons-round card-icon">manage_accounts</span>
          <h2 class="card-title">{{ 'profile.delete_account' | translate }}</h2>
      </div>
      <p class="delete-description">
        {{ 'profile.delete_description' | translate }}
      </p>
      <button class="btn btn-delete" type="button" (click)="showDeleteModal = true">
        <span class="material-icons-round">delete_outline</span>
          {{ 'profile.delete_btn' | translate }}
      </button>
    </div>

    <!-- Modal confirmation suppression -->
    <div class="modal-overlay" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="material-icons-round modal-icon">delete_forever</span>
          <h3 class="modal-title">{{ 'profile.delete_modal_title' | translate }}</h3>
        </div>
        <p class="modal-description">{{ 'profile.delete_modal_desc' | translate }}</p>

        <div class="form-group">
          <label class="form-label">{{ 'profile.delete_password_label' | translate }}</label>
          <input class="form-input" type="password" [(ngModel)]="deletePassword"
                 [placeholder]="'profile.delete_password_placeholder' | translate" />
        </div>

        <div *ngIf="deleteError" class="alert alert-error">
          <span class="material-icons-round">error</span>
          {{ deleteError }}
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" (click)="closeDeleteModal()" [disabled]="deleteLoading">
            {{ 'profile.cancel' | translate }}
          </button>
          <button class="btn btn-delete-confirm" type="button" (click)="confirmDelete()" [disabled]="deleteLoading || !deletePassword">
            <span class="material-icons-round" *ngIf="!deleteLoading">delete_forever</span>
            <span class="material-icons-round spin" *ngIf="deleteLoading">sync</span>
            {{ deleteLoading ? ('profile.deleting' | translate) : ('profile.confirm_delete' | translate) }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }

    .card-icon {
      color: var(--primary-light);
      font-size: 22px;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .form-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 14px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      transition: var(--transition);
      outline: none;

      &:focus {
        border-color: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .hint-error {
      font-size: 0.8rem;
      color: var(--danger);
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.875rem;
      margin-bottom: 16px;

      .material-icons-round { font-size: 18px; }

      &.alert-success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }

      &.alert-error {
        background: var(--danger-bg);
        color: var(--danger);
        border: 1px solid rgba(239, 68, 68, 0.2);
      }
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 11px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-family: 'Inter', sans-serif;
      transition: var(--transition);
      width: 100%;
      justify-content: center;

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-primary {
      background: var(--primary-gradient);
      color: white;
      box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
      &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border);
      &:hover:not(:disabled) { background: var(--border); }
    }

    .btn-danger {
      background: var(--danger);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    }

    .delete-card {
      grid-column: 1 / -1;
      margin-top: 16px;
    }

    .delete-description {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .btn-delete {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border);
      width: auto;
      &:hover:not(:disabled) {
        color: var(--danger);
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.05);
      }
    }

    .btn-delete-confirm {
      background: var(--danger);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      &:hover:not(:disabled) { opacity: 0.9; }
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      width: 100%;
      max-width: 440px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      padding: 0;
    }

    .modal-icon {
      color: var(--danger);
      font-size: 26px;
    }

    .modal-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .modal-description {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin: 0 0 20px 0;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;

      .btn { width: auto; flex: 1; }
    }

    .spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private translate = inject(TranslateService);

  currentUser = this.authService.currentUser;

  currencies = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'MAD', 'DZD', 'TND', 'XOF'];

  profile = { firstName: '', lastName: '', email: '', currency: 'EUR' };
  passwords = { currentPassword: '', newPassword: '', confirmPassword: '' };

  profileLoading = false;
  profileSuccess = false;
  profileError = '';

  passwordLoading = false;
  passwordSuccess = false;
  passwordError = '';

  showDeleteModal = false;
  deletePassword = '';
  deleteLoading = false;
  deleteError = '';

  constructor(private api: ApiService, private authService: AuthService) {}

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (res) => {
        this.profile.firstName = res.firstName;
        this.profile.lastName = res.lastName;
        this.profile.email = res.email;
        this.profile.currency = res.currency || 'EUR';
      }
    });
  }

  saveProfile() {
    this.profileLoading = true;
    this.profileSuccess = false;
    this.profileError = '';

    this.api.updateProfile(this.profile).subscribe({
      next: (res) => {
        this.profileLoading = false;
        this.profileSuccess = true;
        // Mettre à jour le signal utilisateur (sans changer le token)
        const user = this.authService.currentUser();
        if (user) {
          this.authService.currentUser.set({ ...user, ...res });
        }
        setTimeout(() => this.profileSuccess = false, 3000);
      },
      error: (err) => {
        this.profileLoading = false;
        this.profileError = err.error?.error || this.translate.instant('common.error');
      }
    });
  }

  savePassword() {
    this.passwordLoading = true;
    this.passwordSuccess = false;
    this.passwordError = '';

    this.api.changePassword({
      currentPassword: this.passwords.currentPassword,
      newPassword: this.passwords.newPassword
    }).subscribe({
      next: () => {
        this.passwordLoading = false;
        this.passwordSuccess = true;
        this.passwords = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.passwordSuccess = false, 3000);
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordError = err.error?.error || this.translate.instant('common.error');
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletePassword = '';
    this.deleteError = '';
  }

  confirmDelete() {
    this.deleteLoading = true;
    this.deleteError = '';

    this.api.deleteAccount(this.deletePassword).subscribe({
      next: () => {
        this.authService.logout();
      },
      error: (err) => {
        this.deleteLoading = false;
        this.deleteError = err.error?.error || this.translate.instant('common.error');
      }
    });
  }
}
