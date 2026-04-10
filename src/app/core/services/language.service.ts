import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'mw_lang';

  currentLang = signal<AppLanguage>(this.loadLang());

  setLanguage(lang: AppLanguage) {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.currentLang.set(lang);
  }

  private loadLang(): AppLanguage {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === 'en' ? 'en' : 'fr';
  }
}
