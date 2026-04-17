import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
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

        <div class="user-menu-wrapper" (click)="$event.stopPropagation()">
          <div class="user-avatar" (click)="toggleDropdown()">
            {{ userInitials }}
          </div>
          <div class="user-dropdown" *ngIf="dropdownOpen">
            <div class="user-dropdown-header">
              <span class="user-dropdown-name">{{ userName }}</span>
            </div>
            <button class="dropdown-item" routerLink="/profile" (click)="dropdownOpen = false">
              <span class="material-icons-round">person</span>
              {{ 'nav.profile' | translate }}
            </button>
            <button class="dropdown-item dropdown-item--danger" (click)="logout()">
              <span class="material-icons-round">logout</span>
              {{ 'nav.logout' | translate }}
            </button>
          </div>
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
      color: var(--primary-light);
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(108, 99, 255, 0.25);
      transition: var(--transition);

      &:hover {
        box-shadow: 0 6px 18px rgba(108, 99, 255, 0.4);
        transform: translateY(-1px);
      }

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

    .user-menu-wrapper {
      position: relative;
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

    .user-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 200px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      z-index: 200;
      animation: fadeInDown 0.15s ease;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .user-dropdown-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }

    .user-dropdown-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 11px 16px;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: var(--transition);
      text-align: left;

      .material-icons-round { font-size: 18px; }

      &:hover {
        background: var(--bg-primary);
        color: var(--text-primary);
      }

    }

    .dropdown-item--danger {
      color: #ef4444;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
    }
  `]
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  today = new Date();
  dropdownOpen = false;

  constructor(public auth: AuthService, public lang: LanguageService, private router: Router) {}

  @HostListener('document:click')
  closeDropdown() { this.dropdownOpen = false; }

  toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; }

  logout() {
    this.dropdownOpen = false;
    this.auth.logout();
  }

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
