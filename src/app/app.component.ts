import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AuthService } from './core/services/auth.service';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private backButtonListener: any;

  ngOnInit() {
    // Recharger le profil utilisateur depuis l'API si un token JWT existe
    if (this.authService.isAuthenticated()) {
      this.apiService.getProfile().subscribe({
        next: (res) => this.authService.currentUser.set({ ...res, token: this.authService.getToken()! }),
        error: () => this.authService.logout()
      });
    }

    if (Capacitor.isNativePlatform()) {
      this.backButtonListener = App.addListener('backButton', () => {
        if (window.history.length > 1) {
          this.location.back();
        } else {
          App.exitApp();
        }
      });
    }
  }

  ngOnDestroy() {
    this.backButtonListener?.then((l: any) => l.remove());
  }
}
