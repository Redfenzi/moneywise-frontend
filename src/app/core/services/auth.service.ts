import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'mw_token';

  currentUser = signal<AuthResponse | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.API}/login`, request).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(request: RegisterRequest) {
    return this.http.post<{message: string}>(`${this.API}/register`, request);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    this.currentUser.set(res);
  }
}
