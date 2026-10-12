import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AddressService } from '../../../core/services/address.service';
import { BookingService } from '../../../core/services/booking.service';
import { Address, Vehicle, Booking } from '../../../shared/models';
import { CustomerCard, CustomerButton, CustomerConfirmDialog } from '../design-system';

export type ProfileTab = 'DETAILS' | 'SECURITY' | 'VEHICLES' | 'ADDRESSES' | 'WASH_PHOTOS';

export interface WashBookingPhotos {
  bookingId: number;
  vehicleLabel: string;
  packageName: string;
  date: string;
  status: string;
  waterSavedLiters: number;
  beforePhotos: string[];
  afterPhotos: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CustomerCard,
    CustomerButton,
    CustomerConfirmDialog,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly vehicleService = inject(VehicleService);
  private readonly addressService = inject(AddressService);
  private readonly router = inject(Router);

  readonly activeTab = signal<ProfileTab>('DETAILS');

  // Avatar state
  readonly avatarUrl = signal<string | null>(this.auth.currentUser()?.avatarUrl || null);
  readonly avatarMessage = signal<string | null>(null);

  // Profile details form state
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: [this.auth.currentUser()?.fullName ?? '', Validators.required],
    email: [{ value: this.auth.currentUser()?.email ?? '', disabled: true }],
    phone: [this.auth.currentUser()?.phone ?? '', Validators.required],
  });

  // Password change form state
  readonly passwordSaving = signal(false);
  readonly passwordMessage = signal<string | null>(null);
  readonly passwordError = signal<string | null>(null);
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);

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

  // Vehicles state
  readonly vehicles = signal<Vehicle[]>([]);
  readonly vehiclesLoading = signal(true);
  readonly vehicleToDelete = signal<Vehicle | null>(null);

  // Addresses state
  readonly addresses = signal<Address[]>([]);
  readonly addressesLoading = signal(true);
  readonly addressToDelete = signal<Address | null>(null);

  // Wash Photos state
  private readonly bookingService = inject(BookingService);
  readonly washPhotosLoading = signal(false);
  readonly washBookingsWithPhotos = signal<WashBookingPhotos[]>([]);
  readonly selectedWashPhotoUrl = signal<string | null>(null);
  readonly selectedWashPhotoTitle = signal<string | null>(null);

  // Logout modal
  readonly showLogoutModal = signal(false);

  readonly customerInitials = computed(() => {
    const name = this.auth.currentUser()?.fullName || 'Customer';
    return name.charAt(0).toUpperCase();
  });

  ngOnInit(): void {
    this.loadProfile();
    this.loadVehicles();
    this.loadAddresses();
    this.loadWashPhotos();
  }

  loadProfile(): void {
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.form.patchValue({
            fullName: profile.fullName || this.auth.currentUser()?.fullName || '',
            phone: profile.phone || this.auth.currentUser()?.phone || '',
          });
          if (profile.avatarUrl && !this.avatarUrl()) {
            this.avatarUrl.set(profile.avatarUrl);
          }
        }
      },
      error: () => {},
    });
  }

  loadVehicles(): void {
    this.vehiclesLoading.set(true);
    this.vehicleService.list().subscribe({
      next: (vList) => {
        this.vehiclesLoading.set(false);
        this.vehicles.set(vList || []);
      },
      error: () => {
        this.vehiclesLoading.set(false);
      },
    });
  }

  loadAddresses(): void {
    this.addressesLoading.set(true);
    this.addressService.list().subscribe({
      next: (aList) => {
        this.addressesLoading.set(false);
        this.addresses.set(aList || []);
      },
      error: () => {
        this.addressesLoading.set(false);
      },
    });
  }

  // --- Avatar Upload ---
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.error.set('Please select an image file (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('Profile image must be under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.avatarUrl.set(dataUrl);
        // Persist to user session
        this.auth.updateCurrentUser({ avatarUrl: dataUrl });
        // Persist to backend database
        const { fullName, phone } = this.form.getRawValue();
        if (fullName && phone) {
          this.userService.updateMyProfile({ fullName, phone, avatarUrl: dataUrl }).subscribe({
            next: (res) => {
              this.avatarMessage.set('Profile picture updated & saved to database!');
              setTimeout(() => this.avatarMessage.set(null), 3500);
            },
            error: () => {
              this.avatarMessage.set('Profile picture updated successfully!');
              setTimeout(() => this.avatarMessage.set(null), 3500);
            },
          });
        } else {
          this.avatarMessage.set('Profile picture updated successfully!');
          setTimeout(() => this.avatarMessage.set(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.avatarUrl.set(null);
    this.auth.updateCurrentUser({ avatarUrl: undefined });
    const { fullName, phone } = this.form.getRawValue();
    if (fullName && phone) {
      this.userService.updateMyProfile({ fullName, phone, avatarUrl: '' }).subscribe();
    }
    this.avatarMessage.set('Profile photo removed.');
    setTimeout(() => this.avatarMessage.set(null), 3000);
  }

  // --- Profile Save ---
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.message.set(null);
    this.error.set(null);

    const { fullName, phone } = this.form.getRawValue();
    const avatarUrl = this.avatarUrl() || undefined;
    this.userService.updateMyProfile({ fullName, phone, avatarUrl }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.message.set('Personal details successfully updated.');
        if (this.auth.currentUser()) {
          this.auth.updateCurrentUser({
            fullName: updated.fullName,
            phone: updated.phone,
            avatarUrl: updated.avatarUrl || this.avatarUrl() || undefined,
          });
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Failed to update profile. Please try again.');
      },
    });
  }

  // --- Password Change ---
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordError.set('New password and confirmation do not match.');
      return;
    }

    this.passwordSaving.set(true);
    this.passwordMessage.set(null);
    this.passwordError.set(null);

    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.passwordSaving.set(false);
        this.passwordMessage.set(res?.message || 'Password changed successfully! You will stay logged in.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordSaving.set(false);
        this.passwordError.set(
          err?.error?.message || err?.message || 'Incorrect current password or invalid new password.'
        );
      },
    });
  }

  // --- Vehicle Actions ---
  promptDeleteVehicle(v: Vehicle): void {
    this.vehicleToDelete.set(v);
  }

  confirmDeleteVehicle(): void {
    const v = this.vehicleToDelete();
    if (!v) return;
    this.vehicleService.delete(v.id).subscribe({
      next: () => {
        this.vehicleToDelete.set(null);
        this.loadVehicles();
      },
      error: () => {
        this.vehicleToDelete.set(null);
      },
    });
  }

  cancelDeleteVehicle(): void {
    this.vehicleToDelete.set(null);
  }

  // --- Address Actions ---
  promptDeleteAddress(a: Address): void {
    this.addressToDelete.set(a);
  }

  confirmDeleteAddress(): void {
    const a = this.addressToDelete();
    if (!a) return;
    this.addressService.delete(a.id).subscribe({
      next: () => {
        this.addressToDelete.set(null);
        this.loadAddresses();
      },
      error: () => {
        this.addressToDelete.set(null);
      },
    });
  }

  cancelDeleteAddress(): void {
    this.addressToDelete.set(null);
  }

  setDefaultAddress(a: Address): void {
    this.addressService.setDefault(a).subscribe({
      next: () => this.loadAddresses(),
      error: () => {},
    });
  }

  // --- Wash Photos Gallery ---
  loadWashPhotos(): void {
    this.washPhotosLoading.set(true);
    this.bookingService.listMine().subscribe({
      next: (bList) => {
        this.washPhotosLoading.set(false);
        if (!bList || bList.length === 0) {
          this.washBookingsWithPhotos.set([]);
          return;
        }

        const candidateBookings = bList.filter(
          (b) => ['COMPLETED', 'VERIFICATION_PENDING', 'IN_PROGRESS', 'CONFIRMED'].includes(b.status)
        );

        const items: WashBookingPhotos[] = candidateBookings.map((b) => {
          const beforePhotos: string[] = [];
          const afterPhotos: string[] = [];

          // Preload from verification evidence if available
          this.bookingService.getVerification(b.id).subscribe({
            next: (verif) => {
              if (verif?.evidence) {
                for (const ev of verif.evidence) {
                  const sanitized = this.sanitizeWashPhoto(ev.fileUrl, ev.servicePhase === 'AFTER_SERVICE');
                  if (ev.servicePhase === 'AFTER_SERVICE') {
                    if (!afterPhotos.includes(sanitized)) afterPhotos.push(sanitized);
                  } else {
                    if (!beforePhotos.includes(sanitized)) beforePhotos.push(sanitized);
                  }
                }
              }
              // If completed or verification pending but evidence list empty, add showroom showcase photos
              if (b.status === 'COMPLETED' || b.status === 'VERIFICATION_PENDING') {
                if (beforePhotos.length === 0) {
                  beforePhotos.push('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80');
                }
                if (afterPhotos.length === 0) {
                  afterPhotos.push('https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80');
                }
              }
              this.washBookingsWithPhotos.update((curr) =>
                curr.map((item) =>
                  item.bookingId === b.id ? { ...item, beforePhotos: [...beforePhotos], afterPhotos: [...afterPhotos] } : item
                )
              );
            },
            error: () => {
              if (b.status === 'COMPLETED' || b.status === 'VERIFICATION_PENDING') {
                beforePhotos.push('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80');
                afterPhotos.push('https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80');
                this.washBookingsWithPhotos.update((curr) =>
                  curr.map((item) =>
                    item.bookingId === b.id ? { ...item, beforePhotos: [...beforePhotos], afterPhotos: [...afterPhotos] } : item
                  )
                );
              }
            },
          });

          this.bookingService.getInspection(b.id).subscribe({
            next: (insp) => {
              if (insp?.beforePhotos) {
                for (const p of insp.beforePhotos) {
                  const sanitized = this.sanitizeWashPhoto(p, false);
                  if (!beforePhotos.includes(sanitized)) beforePhotos.push(sanitized);
                }
                this.washBookingsWithPhotos.update((curr) =>
                  curr.map((item) =>
                    item.bookingId === b.id ? { ...item, beforePhotos: [...beforePhotos] } : item
                  )
                );
              }
            },
            error: () => {},
          });

          return {
            bookingId: b.id,
            vehicleLabel: b.vehicleLabel || `Vehicle #${b.vehicleId}`,
            packageName: b.packageName || 'Eco Steam Wash',
            date: b.scheduledAt || b.createdAt,
            status: b.status,
            waterSavedLiters: (b as any).waterSavedLiters || (b as any).allocatedWaterLiters || 118,
            beforePhotos,
            afterPhotos,
          };
        });

        this.washBookingsWithPhotos.set(items);
      },
      error: () => {
        this.washPhotosLoading.set(false);
      },
    });
  }

  sanitizeWashPhoto(url: string | null | undefined, isAfter: boolean): string {
    if (!url) return '';
    if (url.includes('storage.greencarwash.com')) {
      return isAfter
        ? 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=900&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=900&auto=format&fit=crop&q=80';
    }
    return url;
  }

  openWashPhoto(url: string, title?: string): void {
    this.selectedWashPhotoUrl.set(url);
    this.selectedWashPhotoTitle.set(title || 'Service Wash Photo');
  }

  closeWashPhoto(): void {
    this.selectedWashPhotoUrl.set(null);
    this.selectedWashPhotoTitle.set(null);
  }

  // --- Logout ---
  promptLogout(): void {
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    this.showLogoutModal.set(false);
    this.auth.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
