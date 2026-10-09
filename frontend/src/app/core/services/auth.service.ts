import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ToastService } from './toast.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserAccountResponse,
  UserRole,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  private readonly TOKEN_KEY = 'gcw_access_token';
  private readonly REFRESH_KEY = 'gcw_refresh_token';
  private readonly USER_KEY = 'gcw_user_profile';

  // Reactive State via Signals
  public currentUser = signal<LoginResponse | null>(this.getInitialStoredUser());
  public isLoggedIn = computed(() => !!this.currentUser()?.accessToken);
  public userRole = computed(() => {
    const r = this.currentUser()?.role;
    if (!r) return null;
    const normalized = (r as string).replace(/^ROLE_/, '');
    return (normalized === 'ORGANIZATION' ? 'FLEET' : normalized) as UserRole;
  });

  public isCustomer = computed(() => this.userRole() === 'CUSTOMER');
  public isWasher = computed(() => this.userRole() === 'WASHER');
  public isAdmin = computed(() => this.userRole() === 'ADMIN');
  public isFleet = computed(() => this.userRole() === 'FLEET');

  // Human-readable authoritative role display
  public roleDisplayName = computed(() => {
    const r = this.userRole();
    switch (r) {
      case 'ADMIN':
        return 'Admin';
      case 'CUSTOMER':
        return 'Customer';
      case 'WASHER':
        return 'Washer';
      case 'FLEET':
      case 'ORGANIZATION':
        return 'Fleet';
      default:
        return 'User';
    }
  });

  public formatAvatar(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.startsWith('/') ? url : `/api/media/files/${url}`;
    return `${environment.apiGatewayUrl}${clean}`;
  }

  // Global reactive user avatar URL formatted for gateway
  public userAvatarUrl = computed(() => this.formatAvatar(this.currentUser()?.avatarUrl));

  // Session Expiry Warning Signals (Warning 5 minutes before 24h JWT expires)
  public sessionExpiringSoon = signal<boolean>(false);
  public sessionSecondsRemaining = signal<number>(300);
  private expiryTimer: any = null;
  private countdownInterval: any = null;

  constructor() {
    // If we have token, verify profile without scheduling abrupt timeouts
    if (this.getToken()) {
      this.scheduleSessionWarning(23 * 60 * 60 * 1000);
      const uid = this.getUserId();
      if (uid) {
        this.fetchAndApplyUserProfile(uid);
      }
      this.fetchCurrentProfile().subscribe({
        error: () => {
          // Stale or unverified token; silent ignore so public browsing is unaffected
        },
      });
    }
  }

  public scheduleSessionWarning(durationMs: number = 23 * 60 * 60 * 1000): void {
    this.clearSessionTimers();
    if (typeof window === 'undefined') return;
    this.expiryTimer = setTimeout(() => {
      this.sessionExpiringSoon.set(true);
      this.sessionSecondsRemaining.set(60);
      this.countdownInterval = setInterval(() => {
        const remaining = this.sessionSecondsRemaining() - 1;
        if (remaining <= 0) {
          this.clearSessionTimers();
          this.sessionExpiringSoon.set(false);
          this.logout(true);
        } else {
          this.sessionSecondsRemaining.set(remaining);
        }
      }, 1000);
    }, durationMs);
  }

  public clearSessionTimers(): void {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  public extendSession(): void {
    this.refreshToken().subscribe({
      next: (res) => {
        if (res) {
          this.clearSessionTimers();
          this.sessionExpiringSoon.set(false);
          this.scheduleSessionWarning();
          this.toast.success('Your session has been extended.', 'Session Active');
        }
      },
    });
  }

  register(payload: RegisterRequest): Observable<UserAccountResponse> {
    return this.api.post<UserAccountResponse>(API_ENDPOINTS.AUTH.REGISTER, payload).pipe(
      tap(() => {
        this.toast.success(
          'Registration successful! Please login to your account.',
          'Welcome to GreenCarWash',
        );
      }),
    );
  }

  login(payload: LoginRequest, returnUrl?: string | null): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, payload).pipe(
      tap((response) => {
        this.setSession(response);
        if (response.userId) {
          this.fetchAndApplyUserProfile(response.userId);
        }
        this.toast.success(`Welcome back, ${response.firstName || 'User'}!`, 'Logged In');
        this.redirectAfterLogin(response.role, returnUrl);
      }),
    );
  }

  fetchCurrentProfile(): Observable<UserAccountResponse | null> {
    return this.api.get<UserAccountResponse>(API_ENDPOINTS.AUTH.ME).pipe(
      tap((profile) => {
        const current = this.currentUser();
        if (current && profile) {
          const normalizedRole = ((profile.role as string) || '').replace(/^ROLE_/, '') as UserRole;
          const uid = profile.id || current.userId;
          const resolvedAvatar =
            profile.avatarUrl ||
            (uid ? localStorage.getItem(`gcw_user_avatar_${uid}`) : null) ||
            undefined;
          const updated: LoginResponse = {
            ...current,
            userId: uid,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: normalizedRole,
            avatarUrl: resolvedAvatar,
          };
          this.currentUser.set(updated);
          localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
          if (uid) {
            this.fetchAndApplyUserProfile(uid);
          }
        }
      }),
      catchError(() => of(null)),
    );
  }

  public fetchAndApplyUserProfile(userId: number): void {
    if (!userId) return;
    this.api.get<any>(`/api/users/${userId}`).subscribe({
      next: (profile) => {
        if (profile) {
          const current = this.currentUser();
          if (current) {
            const rawAvatar =
              profile.avatarUrl || localStorage.getItem(`gcw_user_avatar_${userId}`) || undefined;
            const updated: LoginResponse = {
              ...current,
              firstName: profile.firstName || current.firstName,
              lastName: profile.lastName || current.lastName,
              avatarUrl: rawAvatar,
            };
            this.currentUser.set(updated);
            localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
            if (rawAvatar) {
              localStorage.setItem(`gcw_user_avatar_${userId}`, rawAvatar);
            }
          }
        }
      },
      error: () => {
        const stored = localStorage.getItem(`gcw_user_avatar_${userId}`);
        const current = this.currentUser();
        if (stored && current && !current.avatarUrl) {
          const updated: LoginResponse = { ...current, avatarUrl: stored };
          this.currentUser.set(updated);
          localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
        }
      },
    });
  }

  public updateUserAvatar(newAvatarUrl?: string | null): void {
    const current = this.currentUser();
    if (current) {
      const updated: LoginResponse = { ...current, avatarUrl: newAvatarUrl || undefined };
      this.currentUser.set(updated);
      localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    }
    const uid = this.getUserId();
    if (uid) {
      if (newAvatarUrl) {
        localStorage.setItem(`gcw_user_avatar_${uid}`, newAvatarUrl);
      } else {
        localStorage.removeItem(`gcw_user_avatar_${uid}`);
      }
    }
  }

  refreshToken(): Observable<LoginResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(null);
    }

    return this.api.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          this.setSession(response);
        }
      }),
      catchError(() => of(null)),
    );
  }

  logout(notify: boolean = true): void {
    const token = this.getToken();

    this.clearSessionTimers();
    this.sessionExpiringSoon.set(false);

    // 1. Immediately wipe client credentials to prevent further 401s and cross-user leaks
    try {
      sessionStorage.clear();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('gcw_') || key.startsWith('user_') || key.startsWith('customer_'))) {
          if (key !== 'gcw_theme') {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {}

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);

    // 2. Fire server-side logout safely without throwing or intercepting
    if (token) {
      this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {}).subscribe({
        next: () => {},
        error: () => {},
      });
    }

    // 3. User feedback
    if (notify) {
      this.toast.info('You have been logged out securely.', 'Session Ended');
    }
    this.router.navigate(['/login']);
  }

  forgotPassword(identifier: string, method: 'EMAIL' | 'SMS' = 'EMAIL'): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      identifier,
      email: identifier,
      method,
    });
  }

  verifyResetOtp(identifier: string, otp: string): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, {
      identifier,
      email: identifier,
      otp,
    });
  }

  resetPassword(identifier: string, otp: string, newPassword: string): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      identifier,
      email: identifier,
      otp,
      newPassword,
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.api
      .post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: oldPassword,
        oldPassword,
        newPassword,
      })
      .pipe(tap(() => this.toast.success('Password changed successfully.', 'Security')));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  getUserId(): number | null {
    return this.currentUser()?.userId || null;
  }

  public savePendingBooking(context: Record<string, any>): void {
    sessionStorage.setItem('gcw_pending_booking', JSON.stringify(context));
  }

  public getPendingBooking(): Record<string, any> | null {
    const data = sessionStorage.getItem('gcw_pending_booking');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public clearPendingBooking(): void {
    sessionStorage.removeItem('gcw_pending_booking');
  }

  public setSession(authResult: LoginResponse): void {
    const normalizedRole = ((authResult.role as string) || '').replace(/^ROLE_/, '') as UserRole;
    const uid = authResult.userId;
    const storedAvatar = uid ? localStorage.getItem(`gcw_user_avatar_${uid}`) : null;
    const sessionData: LoginResponse = {
      ...authResult,
      role: normalizedRole,
      avatarUrl: authResult.avatarUrl || storedAvatar || undefined,
    };
    if (sessionData.accessToken) {
      localStorage.setItem(this.TOKEN_KEY, sessionData.accessToken);
    }
    if (sessionData.refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, sessionData.refreshToken);
    }
    localStorage.setItem(this.USER_KEY, JSON.stringify(sessionData));
    this.currentUser.set(sessionData);
    this.scheduleSessionWarning();
  }

  private getInitialStoredUser(): LoginResponse | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && parsed.role) {
        parsed.role = ((parsed.role as string) || '').replace(/^ROLE_/, '') as UserRole;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  public redirectAfterLogin(role: UserRole, returnUrl?: string | null): void {
    // 1. If explicit returnUrl was provided
    if (returnUrl && returnUrl !== '/login') {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    // 2. If user initiated a booking prior to login
    const pending = this.getPendingBooking();
    if (pending) {
      this.clearPendingBooking();
      this.router.navigate(['/customer/book'], { queryParams: pending });
      return;
    }

    // 3. Normal role-based redirect
    const targetRole = ((role as string) || '').replace(/^ROLE_/, '');
    switch (targetRole) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'WASHER':
        this.router.navigate(['/washer/dashboard']);
        break;
      case 'FLEET':
      case 'ORGANIZATION':
        this.router.navigate(['/fleet/dashboard']);
        break;
      case 'CUSTOMER':
      default:
        this.router.navigate(['/customer/dashboard']);
        break;
    }
  }
}
