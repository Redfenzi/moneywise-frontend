import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'mw_lang';
  private translate = inject(TranslateService);

  currentLang = signal<AppLanguage>(this.loadLang());

  constructor() {
    this.translate.use(this.currentLang());
  }

  setLanguage(lang: AppLanguage) {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.currentLang.set(lang);
    this.translate.use(lang);
  }

  private loadLang(): AppLanguage {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === 'en' ? 'en' : 'fr';
  }
}
