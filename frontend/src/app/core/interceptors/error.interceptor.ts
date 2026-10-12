import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export interface BackendFieldViolation {
  field: string;
  message: string;
}

export interface BackendErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  code?: string;
  message?: string;
  path?: string;
  correlationId?: string;
  details?: BackendFieldViolation[];
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error instanceof ErrorEvent) {
        // Client-side network error
        errorMessage = `Network Error: ${error.error.message}`;
      } else {
        const backendError = error.error as BackendErrorResponse;

        // If backend returned structured details (validation errors)
        if (backendError?.details && Array.isArray(backendError.details) && backendError.details.length > 0) {
          const fieldMsgs = backendError.details.map((d) => `${d.field}: ${d.message}`).join(', ');
          errorMessage = `${backendError.message || 'Validation error'}: ${fieldMsgs}`;
        } else if (backendError?.message) {
          errorMessage = backendError.message;
        } else {
          switch (error.status) {
            case 400:
              errorMessage = 'Invalid request. Please check the entered data.';
              break;
            case 401:
              if (req.url.includes('/api/auth/login')) {
                errorMessage = 'Invalid email or password. Please verify your credentials.';
              } else {
                errorMessage = 'Session expired. Please log in again.';
              }
              break;
            case 403:
              errorMessage = 'Access denied. You do not have permission to perform this action.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 409:
              errorMessage = 'Conflict: Record or operation conflicts with existing data.';
              break;
            case 500:
            case 502:
            case 503:
              errorMessage = 'Service temporarily unavailable. Please try again shortly.';
              break;
            default:
              errorMessage = `Error ${error.status}: Something went wrong.`;
              break;
          }
        }
      }

      console.warn(`[HTTP Error ${error.status} at ${req.url}]:`, errorMessage);
      const customErr = new Error(errorMessage) as any;
      customErr.status = error.status;
      customErr.error = error.error;
      customErr.statusText = error.statusText;
      customErr.url = req.url;
      return throwError(() => customErr);
    })
  );
};
