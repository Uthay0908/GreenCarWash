import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { WasherService } from '../../../core/services/washer.service';
import { CorporateService } from '../../../core/services/corporate.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly washerService = inject(WasherService);
  private readonly corporateService = inject(CorporateService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(190)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{7,15}$/)]],
      role: ['CUSTOMER' as 'CUSTOMER' | 'WASHER' | 'CORPORATE', [Validators.required]],
      companyName: [''],
      billingAddress: [''],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  get f() {
    return this.form.controls;
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  setRole(selectedRole: 'CUSTOMER' | 'WASHER' | 'CORPORATE'): void {
    this.form.patchValue({ role: selectedRole });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (raw.role === 'CORPORATE' && !raw.companyName.trim()) {
      this.errorMessage.set('Please provide your Company / Fleet Name.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    if (raw.role === 'CORPORATE') {
      this.auth
        .register({
          fullName: raw.fullName,
          email: raw.email,
          phone: raw.phone,
          password: raw.password,
          confirmPassword: raw.confirmPassword,
          role: 'CUSTOMER',
        })
        .pipe(
          switchMap((authRes) =>
            this.userService
              .createProfile({
                userAccountId: authRes.user.id,
                fullName: raw.fullName,
                email: raw.email,
                phone: raw.phone,
              })
              .pipe(
                catchError(() => of(null)),
                switchMap(() =>
                  this.corporateService.createOrganization({
                    name: raw.companyName.trim(),
                    billingEmail: raw.email.trim(),
                    billingAddress: raw.billingAddress?.trim() || 'Headquarters',
                  })
                ),
                tap((org) => {
                  localStorage.setItem('gcw_corporate_role', 'OWNER');
                  if (org) {
                    localStorage.setItem('gcw_corporate_org', JSON.stringify(org));
                  }
                })
              )
          )
        )
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/corporate']);
          },
          error: (err) => {
            this.submitting.set(false);
            const msg = err?.message || 'Corporate registration failed. An account with this email may already exist.';
            this.errorMessage.set(msg);
          },
        });
    } else if (raw.role === 'WASHER') {
      this.auth
        .register({
          fullName: raw.fullName,
          email: raw.email,
          phone: raw.phone,
          password: raw.password,
          confirmPassword: raw.confirmPassword,
          role: 'WASHER',
        })
        .pipe(
          switchMap((authRes) =>
            this.washerService
              .createProfile({
                userAccountId: authRes.user.id,
                fullName: raw.fullName,
                email: raw.email,
                phone: raw.phone,
              })
              .pipe(catchError(() => of(null)))
          )
        )
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/washer']);
          },
          error: (err) => {
            this.submitting.set(false);
            const msg = err?.message || 'Registration failed. An account with this email may already exist.';
            this.errorMessage.set(msg);
          },
        });
    } else {
      // CUSTOMER
      this.auth
        .register({
          fullName: raw.fullName,
          email: raw.email,
          phone: raw.phone,
          password: raw.password,
          confirmPassword: raw.confirmPassword,
          role: 'CUSTOMER',
        })
        .pipe(
          switchMap((authRes) =>
            this.userService
              .createProfile({
                userAccountId: authRes.user.id,
                fullName: raw.fullName,
                email: raw.email,
                phone: raw.phone,
              })
              .pipe(catchError(() => of(null)))
          )
        )
        .subscribe({
          next: () => {
            this.submitting.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.submitting.set(false);
            const msg = err?.message || 'Registration failed. An account with this email may already exist.';
            this.errorMessage.set(msg);
          },
        });
    }
  }
}
