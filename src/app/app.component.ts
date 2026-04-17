import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements OnInit, OnDestroy {
  private location = inject(Location);
  private backButtonListener: any;

  ngOnInit() {
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
