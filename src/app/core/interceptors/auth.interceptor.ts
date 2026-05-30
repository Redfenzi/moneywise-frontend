import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const isPublicAuthEndpoint = req.url.includes('/auth/');

  // Pour les endpoints publics (/auth/*), on envoie sans token
  if (isPublicAuthEndpoint) {
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  // Pour les endpoints protégés : vérifier l'expiration avant d'envoyer
  if (token && !auth.isAuthenticated()) {
    auth.logout();
    return throwError(() => new Error('Token expiré'));
  }

  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
