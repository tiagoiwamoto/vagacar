import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getToken()) {
        console.log('AuthInterceptor: Received 401, attempting to refresh token...');

        return from(authService.refreshToken()).pipe(
          switchMap((success) => {
            if (success) {
              const newToken = authService.getToken();
              if (newToken) {
                console.log('AuthInterceptor: Token refreshed, retrying request...');
                const newAuthReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(newAuthReq);
              }
            }

            console.log('AuthInterceptor: Token refresh failed, redirecting to login...');
            authService.logout();
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            console.error('AuthInterceptor: Token refresh error:', refreshError);
            authService.logout();
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
