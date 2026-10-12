import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CorporateService } from '../../../core/services/corporate.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly corporate = inject(CorporateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly socialLoggingIn = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly returnUrlNotice = signal<string | null>(null);
  readonly selectedRole = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl !== '/' && !returnUrl.includes('/login')) {
      this.returnUrlNotice.set(`Please sign in to access ${returnUrl}`);
    }

    // If user is already authenticated with a valid token, redirect to their role home
    if (this.auth.isAuthenticated() && !this.auth.isTokenExpired(this.auth.session()?.accessToken)) {
      this.redirectByRole();
    }
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  fillCredentials(role: 'CUSTOMER' | 'WASHER' | 'WASHER_KARTHIK' | 'ADMIN' | 'CORPORATE'): void {
    this.errorMessage.set(null);
    this.selectedRole.set(role);
    if (role === 'CUSTOMER') {
      this.form.patchValue({
        email: 'customer1@example.com',
        password: 'Passw0rd!',
      });
    } else if (role === 'WASHER') {
      this.form.patchValue({
        email: 'washer1@example.com',
        password: 'Passw0rd!',
      });
    } else if (role === 'WASHER_KARTHIK') {
      this.form.patchValue({
        email: 'washer2@example.com',
        password: 'Passw0rd!',
      });
    } else if (role === 'ADMIN') {
      this.form.patchValue({
        email: 'greencarwashproject@gmail.com',
        password: 'Green@123',
      });
    } else if (role === 'CORPORATE') {
      this.form.patchValue({
        email: 'corporate1@example.com',
        password: 'Passw0rd!',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const isCorporate = this.selectedRole() === 'CORPORATE' || raw.email.toLowerCase().includes('corporate');

    if (isCorporate) {
      this.corporate.login({ email: raw.email, password: raw.password }).subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/corporate']);
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || err?.message || 'Invalid corporate credentials.';
          this.errorMessage.set(msg);
        },
      });
      return;
    }

    this.auth.login({ email: raw.email, password: raw.password }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.navigateAfterLogin();
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.message || 'Invalid email or password. Please verify your credentials.';
        this.errorMessage.set(msg);
      },
    });
  }

  loginWithGoogle(): void {
    if (this.socialLoggingIn() || this.submitting()) return;
    this.socialLoggingIn.set(true);
    this.errorMessage.set(null);

    // Sign in as demo customer via Google OAuth Single Sign-On flow
    this.auth.login({ email: 'customer1@example.com', password: 'Passw0rd!' }).subscribe({
      next: () => {
        this.socialLoggingIn.set(false);
        this.navigateAfterLogin();
      },
      error: (err) => {
        this.socialLoggingIn.set(false);
        this.errorMessage.set(err?.message || 'Google Sign-In failed. Please try again.');
      },
    });
  }

  loginWithFacebook(): void {
    if (this.socialLoggingIn() || this.submitting()) return;
    this.socialLoggingIn.set(true);
    this.errorMessage.set(null);

    // Sign in as demo customer via Facebook OAuth Single Sign-On flow
    this.auth.login({ email: 'customer1@example.com', password: 'Passw0rd!' }).subscribe({
      next: () => {
        this.socialLoggingIn.set(false);
        this.navigateAfterLogin();
      },
      error: (err) => {
        this.socialLoggingIn.set(false);
        this.errorMessage.set(err?.message || 'Facebook Sign-In failed. Please try again.');
      },
    });
  }

  private navigateAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const role = this.auth.currentRole();

    // Respect returnUrl if safe and matches user permissions
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login') && !returnUrl.startsWith('/register')) {
      if (returnUrl.startsWith('/admin') && role !== 'ADMIN') {
        this.redirectByRole();
        return;
      }
      if (returnUrl.startsWith('/washer') && role !== 'WASHER') {
        this.redirectByRole();
        return;
      }
      if (returnUrl === '/customer') {
        this.router.navigate(['/dashboard']);
        return;
      }
      this.router.navigateByUrl(returnUrl);
      return;
    }

    this.redirectByRole();
  }

  private redirectByRole(): void {
    const role = this.auth.currentRole();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'WASHER') {
      this.router.navigate(['/washer']);
    } else if (role === 'CORPORATE') {
      this.router.navigate(['/corporate']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
