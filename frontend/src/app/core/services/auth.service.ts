import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  SessionResponse,
  MessageResponse,
  MeResponse,
  User,
  UserRole,
} from '../../shared/models';

const STORAGE_KEY = 'gcw_auth_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  private readonly _session = signal<AuthResponse | null>(this.restoreSession());

  readonly session = this._session.asReadonly();
  readonly currentUser = computed<User | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null && !!this._session()?.accessToken);
  readonly currentRole = computed<UserRole | null>(() => this.currentUser()?.roles?.[0] ?? null);

  /**
   * Real backend authentication via POST /api/auth/login
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.gatewayBaseUrl}/api/auth/login`, {
      email: request.email.trim(),
      password: request.password,
    }).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  /**
   * Real backend registration via POST /api/auth/register
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    const payload = {
      fullName: request.fullName.trim(),
      email: request.email.trim().toLowerCase(),
      phone: request.phone.trim(),
      password: request.password,
      role: request.role,
    };
    return this.http.post<AuthResponse>(`${this.gatewayBaseUrl}/api/auth/register`, payload).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  /**
   * Refresh JWT token via POST /api/auth/refresh
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this._session()?.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post<AuthResponse>(`${this.gatewayBaseUrl}/api/auth/refresh`, { refreshToken }).pipe(
      tap((res) => this.persistSession(res))
    );
  }

  /**
   * Real backend logout via POST /api/auth/logout
   */
  logout(): void {
    const session = this._session();
    const refreshToken = session?.refreshToken;
    const accessToken = session?.accessToken;

    if (refreshToken && accessToken) {
      const headers = { Authorization: `Bearer ${accessToken}` };
      this.http.post<MessageResponse>(`${this.gatewayBaseUrl}/api/auth/logout`, { refreshToken }, { headers }).pipe(
        catchError(() => of(null))
      ).subscribe();
    }

    this._session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('gcw_corporate_org');
    localStorage.removeItem('gcw_corporate_role');
    sessionStorage.clear();
  }

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.gatewayBaseUrl}/api/auth/forgot-password`, { email: email.trim() });
  }

  resetPassword(request: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.gatewayBaseUrl}/api/auth/reset-password`, request);
  }

  verifyEmail(token: string): Observable<MeResponse> {
    return this.http.post<MeResponse>(`${this.gatewayBaseUrl}/api/auth/verify-email`, { token });
  }

  resendVerificationEmail(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.gatewayBaseUrl}/api/auth/verify-email/resend`, {});
  }

  changePassword(request: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.gatewayBaseUrl}/api/auth/change-password`, request);
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.gatewayBaseUrl}/api/auth/me`);
  }

  updateMyProfile(request: { fullName: string; phone?: string }): Observable<MeResponse> {
    return this.http.put<MeResponse>(`${this.gatewayBaseUrl}/api/auth/me`, request).pipe(
      tap((res) => {
        const session = this._session();
        if (session && session.user) {
          const updatedSession: AuthResponse = {
            ...session,
            user: {
              ...session.user,
              fullName: res.fullName,
              phone: res.phone,
            },
          };
          this.persistSession(updatedSession);
        }
      })
    );
  }

  listSessions(): Observable<SessionResponse[]> {
    return this.http.get<SessionResponse[]>(`${this.gatewayBaseUrl}/api/auth/sessions`);
  }

  revokeSession(sessionId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.gatewayBaseUrl}/api/auth/sessions/${sessionId}`);
  }

  disableUser(userId: number): Observable<MeResponse> {
    return this.http.post<MeResponse>(`${this.gatewayBaseUrl}/api/auth/admin/users/${userId}/disable`, {});
  }

  enableUser(userId: number): Observable<MeResponse> {
    return this.http.post<MeResponse>(`${this.gatewayBaseUrl}/api/auth/admin/users/${userId}/enable`, {});
  }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) return false;
    return user.roles.some((r) => roles.includes(r));
  }

  updateCurrentUser(userPatch: Partial<User>): void {
    const current = this._session();
    if (!current || !current.user) return;
    const updatedUser: User = { ...current.user, ...userPatch };
    this.persistSession({ ...current, user: updatedUser });
  }

  setSession(response: AuthResponse): void {
    this.persistSession(response);
  }

  private persistSession(response: AuthResponse): void {
    const rawRoles = response.user?.roles || [];
    const normalizedRoles: UserRole[] = rawRoles.map((r: unknown) => {
      const s = String(r).toUpperCase();
      if (s.includes('ADMIN')) return 'ADMIN';
      if (s.includes('WASHER')) return 'WASHER';
      if (s.includes('CORPORATE')) return 'CORPORATE';
      return 'CUSTOMER';
    });

    const normalizedResponse: AuthResponse = {
      ...response,
      user: {
        ...response.user,
        roles: normalizedRoles.length > 0 ? normalizedRoles : ['CUSTOMER'],
      },
    };

    this._session.set(normalizedResponse);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedResponse));
  }

  isTokenExpired(token?: string | null): boolean {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      // exp is in seconds; return true if within 10 seconds of expiry
      return Date.now() >= (payload.exp * 1000 - 10000);
    } catch {
      return true;
    }
  }

  private restoreSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthResponse;
      if (!parsed?.accessToken) return null;

      // If both access and refresh tokens are expired, invalidate session immediately
      const accessExpired = this.isTokenExpired(parsed.accessToken);
      const refreshExpired = this.isTokenExpired(parsed.refreshToken);

      if (accessExpired && refreshExpired) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }
}
