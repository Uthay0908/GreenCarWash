import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private baseUrl = environment.apiGatewayUrl;

  private formatUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }

    return this.http.get<any>(this.formatUrl(endpoint), { params: httpParams }).pipe(
      map(res => this.unwrapResponse<T>(res)),
      catchError(err => this.handleError(err))
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<any>(this.formatUrl(endpoint), body).pipe(
      map(res => this.unwrapResponse<T>(res)),
      catchError(err => this.handleError(err))
    );
  }

  put<T>(endpoint: string, body?: any): Observable<T> {
    return this.http.put<any>(this.formatUrl(endpoint), body || {}).pipe(
      map(res => this.unwrapResponse<T>(res)),
      catchError(err => this.handleError(err))
    );
  }

  patch<T>(endpoint: string, body?: any): Observable<T> {
    return this.http.patch<any>(this.formatUrl(endpoint), body || {}).pipe(
      map(res => this.unwrapResponse<T>(res)),
      catchError(err => this.handleError(err))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<any>(this.formatUrl(endpoint)).pipe(
      map(res => this.unwrapResponse<T>(res)),
      catchError(err => this.handleError(err))
    );
  }

  getBlob(endpoint: string, params?: Record<string, any>): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }

    return this.http.get(this.formatUrl(endpoint), {
      params: httpParams,
      responseType: 'blob'
    }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private unwrapResponse<T>(res: any): T {
    // If backend wrapped in ApiResponse { success, message, data }
    if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
      return res.data as T;
    }
    return res as T;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    // Only toast on client-actionable errors (avoid spamming if token refresh is handling it)
    if (error.status !== 401) {
      console.warn(`[API ${error.status}]`, errorMessage);
    }

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      raw: error
    }));
  }
}
