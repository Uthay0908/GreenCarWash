import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly associatedEmail = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    token: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z_-]{6,64}$/)]],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.associatedEmail.set(emailParam);
    }
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (tokenParam) {
      this.form.patchValue({ token: tokenParam });
    }
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { token, newPassword, confirmPassword } = this.form.getRawValue();

    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.auth.resetPassword({ token: token.trim(), newPassword }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.successMessage.set(res?.message || 'Password has been reset successfully. You can now log in.');
      },
      error: (err) => {
        this.submitting.set(false);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Invalid or expired verification code. Please check your email or request a new code.';
        this.errorMessage.set(msg);
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
