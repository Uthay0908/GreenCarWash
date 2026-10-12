import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { MeResponse, SessionResponse } from '../../../shared/models';

import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProfile implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly profile = signal<MeResponse | null>(null);
  readonly sessions = signal<SessionResponse[]>([]);
  readonly loading = signal<boolean>(true);
  readonly savingProfile = signal<boolean>(false);
  readonly savingPassword = signal<boolean>(false);

  readonly profileToast = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  readonly passwordToast = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  readonly showCurrentPassword = signal<boolean>(false);
  readonly showNewPassword = signal<boolean>(false);

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: [{ value: '', disabled: true }],
    phone: ['', [Validators.required, Validators.pattern('^\\+?[1-9]\\d{1,14}$')]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
      ],
    ],
    confirmPassword: ['', [Validators.required]],
  });

  readonly adminInitials = computed(() => {
    const name = this.profile()?.fullName || this.auth.currentUser()?.fullName || 'Admin';
    return name.charAt(0).toUpperCase();
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    this.auth.getMe().subscribe({
      next: (me) => {
        this.profile.set(me);
        this.profileForm.patchValue({
          fullName: me.fullName,
          email: me.email,
          phone: me.phone || '',
        });
        this.loading.set(false);
      },
      error: () => {
        const u = this.auth.currentUser();
        if (u) {
          this.profileForm.patchValue({
            fullName: u.fullName,
            email: u.email,
            phone: u.phone || '',
          });
        }
        this.loading.set(false);
      },
    });

    this.auth.listSessions().subscribe({
      next: (sess) => this.sessions.set(sess || []),
      error: () => {},
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { fullName, phone } = this.profileForm.getRawValue();
    this.savingProfile.set(true);
    this.profileToast.set(null);

    this.auth.updateMyProfile({ fullName, phone }).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.savingProfile.set(false);
        this.setProfileToast('Admin profile details updated successfully!', 'success');
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.setProfileToast(err.error?.message || 'Failed to update admin profile', 'error');
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.setPasswordToast('New passwords do not match.', 'error');
      return;
    }

    this.savingPassword.set(true);
    this.passwordToast.set(null);

    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.setPasswordToast('Password changed successfully! Other sessions were logged out.', 'success');
        // Refresh sessions list
        this.auth.listSessions().subscribe({
          next: (sess) => this.sessions.set(sess || []),
        });
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.setPasswordToast(err.error?.message || 'Failed to change password. Verify your current password.', 'error');
      },
    });
  }

  revokeSession(sessionId: number): void {
    this.auth.revokeSession(sessionId).subscribe({
      next: () => {
        this.sessions.update((list) => list.filter((s) => s.id !== sessionId));
        this.setPasswordToast('Device session revoked successfully.', 'success');
      },
      error: () => {
        this.setPasswordToast('Failed to revoke session.', 'error');
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private setProfileToast(text: string, type: 'success' | 'error'): void {
    this.profileToast.set({ text, type });
    setTimeout(() => this.profileToast.set(null), 4000);
  }

  private setPasswordToast(text: string, type: 'success' | 'error'): void {
    this.passwordToast.set({ text, type });
    setTimeout(() => this.passwordToast.set(null), 4000);
  }
}
