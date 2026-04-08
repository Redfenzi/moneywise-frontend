import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
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
          <span>{{ today | date:'EEEE d MMMM yyyy' : '' : 'fr' }}</span>
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

  constructor(public auth: AuthService) {}

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
