import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  template: `
    <div class="app-layout">
      <div *ngIf="sidebarOpen()" class="overlay" (click)="sidebarOpen.set(false)"></div>
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        [open]="sidebarOpen()"
        (toggle)="sidebarCollapsed.set(!sidebarCollapsed())"
        (closeSidebar)="sidebarOpen.set(false)" />
      <div class="main-content" [class.collapsed]="sidebarCollapsed()">
        <app-header (toggleSidebar)="toggleMobileSidebar()" />
        <div class="page-container">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-content.collapsed {
      margin-left: 72px;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 199;
    }
  `]
})
export class ShellComponent {
  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);

  toggleMobileSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}
