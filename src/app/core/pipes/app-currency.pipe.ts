import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false
})
export class AppCurrencyPipe implements PipeTransform {
  private cp = new CurrencyPipe('fr');

  constructor(private auth: AuthService, private lang: LanguageService) {}

  transform(value: number | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const currency = this.auth.currentUser()?.currency || 'EUR';
    const locale = this.lang.currentLang() === 'en' ? 'en-US' : 'fr';
    return this.cp.transform(value, currency, 'symbol', '1.2-2', locale);
  }
}
