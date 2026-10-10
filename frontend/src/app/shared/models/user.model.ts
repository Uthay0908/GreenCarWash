// Mirrors auth-service and user-service DTOs exactly
export type UserRole = 'CUSTOMER' | 'WASHER' | 'ADMIN' | 'CORPORATE';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: UserRole[];
  enabled?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
  user: User;
  tokenType?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email?: string;
  otp?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface SessionResponse {
  id: number;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  lastActiveAt?: string;
  expiresAt?: string;
}

export interface MessageResponse {
  message: string;
}

export interface MeResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface CustomerProfile {
  id: number;
  userAccountId: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  preferredNotificationChannel?: string;
  preferredLanguage?: string;
  enabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerProfileRequest {
  userAccountId: number;
  fullName: string;
  email: string;
  phone: string;
  preferredNotificationChannel?: string;
  preferredLanguage?: string;
}

export interface UpdateCustomerProfileRequest {
  fullName?: string;
  phone?: string;
  preferredNotificationChannel?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
}
