import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-layout">
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggle)="sidebarCollapsed.set(!sidebarCollapsed())" />
      <div class="main-content" [class.collapsed]="sidebarCollapsed()">
        <app-header (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())" />
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
  `]
})
export class ShellComponent {
  sidebarCollapsed = signal(false);
}
