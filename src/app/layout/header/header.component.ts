import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header">
      <button class="btn btn-icon mobile-menu" (click)="toggleSidebar.emit()">
        <span class="material-icons-round">menu</span>
      </button>

      <div class="header-right">
        <div class="date-display">
          <span class="material-icons-round">calendar_today</span>
          <span>{{ todayLabel }}</span>
        </div>

        <div class="lang-switcher">
          <button class="lang-btn" [class.active]="lang.currentLang() === 'fr'" (click)="lang.setLanguage('fr')">
            🇫🇷 FR
          </button>
          <span class="lang-sep">|</span>
          <button class="lang-btn" [class.active]="lang.currentLang() === 'en'" (click)="lang.setLanguage('en')">
            🇬🇧 EN
          </button>
        </div>

        <div class="user-avatar" [attr.data-tooltip]="userName">
          {{ userInitials }}
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: var(--header-height);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .mobile-menu {
      display: none;
      @media (max-width: 1024px) { display: flex; }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-left: auto;
    }

    .date-display {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;

      .material-icons-round { font-size: 16px; color: var(--primary-light); }

      @media (max-width: 640px) { display: none; }
    }

    .lang-switcher {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 4px 8px;
    }

    .lang-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
      transition: var(--transition);
      font-family: 'Inter', sans-serif;

      &:hover { color: var(--text-primary); }

      &.active {
        color: var(--primary-light);
        font-weight: 700;
      }
    }

    .lang-sep {
      color: var(--border);
      font-size: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 700;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
      transition: var(--transition);

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(108, 99, 255, 0.4);
      }
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  today = new Date();

  constructor(public auth: AuthService, public lang: LanguageService) {}

  get todayLabel(): string {
    const locale = this.lang.currentLang();
    const raw = this.today.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return raw.replace(/\b\w/g, c => c.toUpperCase());
  }

  get userInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return 'U';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  get userName(): string {
    const user = this.auth.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }
}
