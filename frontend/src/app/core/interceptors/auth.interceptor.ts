import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const PUBLIC_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/corporate/auth/login',
];

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isPublic = PUBLIC_URLS.some((url) => req.url.includes(url));
  const token = auth.session()?.accessToken;

  let requestToForward = req;
  if (!isPublic && token) {
    requestToForward = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(requestToForward).pipe(
    catchError((error: any) => {
      const status = error?.status ?? error?.statusCode;

      // Handle 401 Unauthorized for authenticated endpoints
      if (status === 401 && !isPublic && !req.url.includes('/api/auth/refresh')) {
        const refreshToken = auth.session()?.refreshToken;

        if (!refreshToken) {
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return auth.refreshToken().pipe(
            switchMap((newSession) => {
              isRefreshing = false;
              refreshTokenSubject.next(newSession.accessToken);

              const retriedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newSession.accessToken}` },
              });
              return next(retriedReq);
            }),
            catchError((refreshErr) => {
              isRefreshing = false;
              refreshTokenSubject.next(null);
              auth.logout();
              router.navigate(['/login']);
              return throwError(() => refreshErr);
            })
          );
        } else {
          // A refresh request is already in-flight: wait for the new access token and then retry
          return refreshTokenSubject.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((newToken) => {
              const retriedReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next(retriedReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
