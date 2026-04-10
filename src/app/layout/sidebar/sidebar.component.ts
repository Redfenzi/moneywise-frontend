import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed" [class.open]="open">
      <div class="sidebar-logo">
        <div class="logo-icon">
          <span class="material-icons-round">account_balance_wallet</span>
        </div>
        <span class="logo-text" *ngIf="!collapsed">MoneyWise</span>
      </div>

      <nav class="sidebar-nav">
        <a *ngFor="let item of navItems"
           [routerLink]="item.route"
           routerLinkActive="active"
           class="nav-item"
           [attr.data-tooltip]="collapsed ? (item.label | translate) : null"
           (click)="closeSidebar.emit()">
          <span class="material-icons-round nav-icon">{{ item.icon }}</span>
          <span class="nav-label" *ngIf="!collapsed">{{ item.label | translate }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout" (click)="auth.logout()">
          <span class="material-icons-round nav-icon">logout</span>
          <span class="nav-label" *ngIf="!collapsed">{{ 'nav.logout' | translate }}</span>
        </button>
      </div>

      <button class="collapse-btn" (click)="toggle.emit()">
        <span class="material-icons-round">{{ collapsed ? 'chevron_right' : 'chevron_left' }}</span>
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: var(--transition);
      z-index: 200;
      overflow: visible;

      &.collapsed {
        width: 72px;

        .logo-text, .nav-label { display: none; }
        .sidebar-logo { justify-content: center; padding: 20px 0; }
        .nav-item { justify-content: center; padding: 14px; }
      }
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid var(--border);

      .logo-icon {
        width: 40px;
        height: 40px;
        background: var(--primary-gradient);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 16px rgba(108, 99, 255, 0.35);

        .material-icons-round {
          font-size: 22px;
          color: white;
        }
      }

      .logo-text {
        font-size: 1.25rem;
        font-weight: 800;
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        white-space: nowrap;
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      border: none;
      background: none;
      font-family: 'Inter', sans-serif;
      text-decoration: none;
      white-space: nowrap;
      width: 100%;

      &:hover {
        background: rgba(108, 99, 255, 0.1);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(108, 99, 255, 0.15);
        color: var(--primary-light);
        font-weight: 600;

        .nav-icon {
          color: var(--primary-light);
        }
      }

      &.logout {
        color: var(--danger);
        &:hover {
          background: var(--danger-bg);
          color: var(--danger);
        }
      }

      .nav-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--border);
    }

    .collapse-btn {
      position: absolute;
      bottom: 80px;
      right: -14px;
      width: 28px;
      height: 28px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
      color: var(--text-secondary);
      z-index: 10;

      .material-icons-round { font-size: 16px; }
      &:hover {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
    }

    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(-100%);
        box-shadow: none;

        &.open {
          transform: translateX(0);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
        }
      }

      .collapse-btn { display: none; }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() open = false;
  @Output() toggle = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'nav.dashboard',    icon: 'dashboard',       route: '/dashboard' },
    { label: 'nav.incomes',      icon: 'trending_up',     route: '/incomes' },
    { label: 'nav.expenses',     icon: 'shopping_cart',   route: '/expenses' },
    { label: 'nav.subscriptions',icon: 'subscriptions',   route: '/subscriptions' },
    { label: 'nav.bank_accounts',icon: 'account_balance', route: '/bank-accounts' },
    { label: 'nav.profile',      icon: 'manage_accounts', route: '/profile' },
  ];

  constructor(public auth: AuthService) {}
}
