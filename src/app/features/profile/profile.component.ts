import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Mon profil</h1>
        <p class="page-subtitle">Gérez vos informations personnelles et votre mot de passe</p>
      </div>
    </div>

    <div class="profile-grid">

      <!-- Infos personnelles -->
      <div class="card">
        <div class="card-header">
          <span class="material-icons-round card-icon">person</span>
          <h2 class="card-title">Informations personnelles</h2>
        </div>

        <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input class="form-input" type="text" name="firstName"
                     [(ngModel)]="profile.firstName" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input class="form-input" type="text" name="lastName"
                     [(ngModel)]="profile.lastName" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nom d'utilisateur</label>
            <input class="form-input" type="text" [value]="currentUser()?.username" disabled />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" name="email"
                   [(ngModel)]="profile.email" required />
          </div>

          <div *ngIf="profileSuccess" class="alert alert-success">
            <span class="material-icons-round">check_circle</span>
            Profil mis à jour avec succès
          </div>
          <div *ngIf="profileError" class="alert alert-error">
            <span class="material-icons-round">error</span>
            {{ profileError }}
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="profileLoading || !profileForm.valid">
            <span class="material-icons-round" *ngIf="!profileLoading">save</span>
            <span class="material-icons-round spin" *ngIf="profileLoading">sync</span>
            {{ profileLoading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      </div>

      <!-- Changement de mot de passe -->
      <div class="card">
        <div class="card-header">
          <span class="material-icons-round card-icon">lock</span>
          <h2 class="card-title">Modifier le mot de passe</h2>
        </div>

        <form (ngSubmit)="savePassword()" #passwordForm="ngForm">
          <div class="form-group">
            <label class="form-label">Mot de passe actuel</label>
            <input class="form-input" type="password" name="currentPassword"
                   [(ngModel)]="passwords.currentPassword" required />
          </div>

          <div class="form-group">
            <label class="form-label">Nouveau mot de passe</label>
            <input class="form-input" type="password" name="newPassword"
                   [(ngModel)]="passwords.newPassword" required minlength="6" />
          </div>

          <div class="form-group">
            <label class="form-label">Confirmer le mot de passe</label>
            <input class="form-input" type="password" name="confirmPassword"
                   [(ngModel)]="passwords.confirmPassword" required />
            <span class="hint-error"
                  *ngIf="passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword">
              Les mots de passe ne correspondent pas
            </span>
          </div>

          <div *ngIf="passwordSuccess" class="alert alert-success">
            <span class="material-icons-round">check_circle</span>
            Mot de passe modifié avec succès
          </div>
          <div *ngIf="passwordError" class="alert alert-error">
            <span class="material-icons-round">error</span>
            {{ passwordError }}
          </div>

          <button class="btn btn-primary" type="submit"
                  [disabled]="passwordLoading || !passwordForm.valid || passwords.newPassword !== passwords.confirmPassword">
            <span class="material-icons-round" *ngIf="!passwordLoading">lock_reset</span>
            <span class="material-icons-round spin" *ngIf="passwordLoading">sync</span>
            {{ passwordLoading ? 'Modification...' : 'Modifier le mot de passe' }}
          </button>
        </form>
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
  currentUser = this.authService.currentUser;

  profile = { firstName: '', lastName: '', email: '' };
  passwords = { currentPassword: '', newPassword: '', confirmPassword: '' };

  profileLoading = false;
  profileSuccess = false;
  profileError = '';

  passwordLoading = false;
  passwordSuccess = false;
  passwordError = '';

  constructor(private api: ApiService, private authService: AuthService) {}

  ngOnInit() {
    this.api.getProfile().subscribe({
      next: (res) => {
        this.profile.firstName = res.firstName;
        this.profile.lastName = res.lastName;
        this.profile.email = res.email;
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
        this.profileError = err.error?.error || 'Erreur lors de la mise à jour';
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
        this.passwordError = err.error?.error || 'Erreur lors du changement de mot de passe';
      }
    });
  }
}
