import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly submittedEmail = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.form.patchValue({ email: emailParam });
    }
  }

  fillRoleEmail(email: string): void {
    this.form.patchValue({ email });
    this.errorMessage.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.form.getRawValue().email.trim();

    this.auth.forgotPassword(email).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.submittedEmail.set(email);
        this.successMessage.set(
          res?.message || 'If your email is registered in our system, a 6-digit verification code has been dispatched to your inbox.'
        );
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to process password reset request. Please try again.';
        this.errorMessage.set(msg);
      },
    });
  }

  goToReset(): void {
    const email = this.submittedEmail() || this.form.getRawValue().email;
    this.router.navigate(['/reset-password'], { queryParams: { email } });
  }
}
