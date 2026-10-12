import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WasherService } from '../../../core/services/washer.service';
import { AuthService } from '../../../core/services/auth.service';
import { WasherProfile, WasherPerformance, WasherAvailability, UpdateBankInfoRequest } from '../../../shared/models';

@Component({
  selector: 'app-washer-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './washer-profile.html',
  styleUrl: './washer-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherProfileComponent implements OnInit {
  private readonly washerService = inject(WasherService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Core Profile Data
  readonly profile = signal<WasherProfile | null>(null);
  readonly performance = signal<WasherPerformance | null>(null);
  readonly availability = signal<WasherAvailability | null>(null);

  // Skills Editing
  readonly skillsList = signal<string[]>([]);
  readonly newSkillInput = signal<string>('');

  // Service Area Editing
  readonly serviceRadiusKm = signal<number>(10);
  readonly baseLatitude = signal<number>(12.9716);
  readonly baseLongitude = signal<number>(77.5946);

  // Bank Info Modal
  readonly showBankModal = signal<boolean>(false);
  readonly bankHolderName = signal<string>('');
  readonly bankAccountNumber = signal<string>('');
  readonly bankIfscCode = signal<string>('');
  readonly bankError = signal<string | null>(null);

  // Logout Modal
  readonly showLogoutModal = signal<boolean>(false);
  readonly loggingOut = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAllProfileData();
  }

  loadAllProfileData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.washerService.getMyProfile().pipe(
      catchError((err) => {
        this.errorMessage.set(err?.message || 'Failed to load profile.');
        return of(null);
      })
    ).subscribe((prof) => {
      this.loading.set(false);
      if (!prof) return;

      this.profile.set(prof);
      this.skillsList.set(Array.isArray(prof.skills) ? [...prof.skills] : []);

      // Pre-fill bank modal fields
      this.bankHolderName.set(prof.bankAccountHolderName || prof.fullName || '');
      this.bankAccountNumber.set(prof.bankAccountNumber || '');
      this.bankIfscCode.set(prof.bankIfscCode || 'HDFC0001234');

      // Load Performance
      this.washerService.getMyPerformance(prof.id).pipe(catchError(() => of(null))).subscribe((perf) => {
        if (perf) this.performance.set(perf);
      });

      // Load Availability
      this.washerService.getMyAvailability().pipe(catchError(() => of(null))).subscribe((avail) => {
        if (avail) {
          this.availability.set(avail);
          if (avail.serviceRadiusKm) this.serviceRadiusKm.set(avail.serviceRadiusKm);
          if (avail.baseLatitude) this.baseLatitude.set(avail.baseLatitude);
          if (avail.baseLongitude) this.baseLongitude.set(avail.baseLongitude);
        }
      });
    });
  }

  // --- Skills Management ---
  addSkill(): void {
    const val = this.newSkillInput().trim().toUpperCase().replace(/\s+/g, '_');
    if (!val) return;

    const current = this.skillsList();
    if (current.includes(val)) {
      this.showToast('Skill already in your profile capabilities.');
      return;
    }

    const updated = [...current, val];
    this.skillsList.set(updated);
    this.newSkillInput.set('');

    this.washerService.updateMySkills(updated).subscribe({
      next: (res) => {
        this.profile.set(res);
        this.showToast(`Skill '${val}' added and saved.`);
      },
      error: () => {
        this.skillsList.set(current);
        this.showToast('Failed to update skills on server.');
      },
    });
  }

  removeSkill(skill: string): void {
    const current = this.skillsList();
    const updated = current.filter((s) => s !== skill);
    this.skillsList.set(updated);

    this.washerService.updateMySkills(updated).subscribe({
      next: (res) => {
        this.profile.set(res);
        this.showToast(`Skill '${skill}' removed.`);
      },
      error: () => {
        this.skillsList.set(current);
        this.showToast('Failed to remove skill on server.');
      },
    });
  }

  // --- Service Area & Radius ---
  saveServiceArea(): void {
    this.saving.set(true);
    this.washerService.updateAvailability({
      serviceRadiusKm: this.serviceRadiusKm(),
      baseLatitude: this.baseLatitude(),
      baseLongitude: this.baseLongitude(),
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.availability.set(res);
        this.showToast(`Operating radius (${res.serviceRadiusKm} km) updated successfully.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err?.message || 'Failed to update service area.');
      },
    });
  }

  // --- Bank Info Modal ---
  openBankModal(): void {
    const prof = this.profile();
    this.bankHolderName.set(prof?.bankAccountHolderName || prof?.fullName || '');
    this.bankAccountNumber.set(prof?.bankAccountNumber || '');
    this.bankIfscCode.set(prof?.bankIfscCode || 'HDFC0001234');
    this.bankError.set(null);
    this.showBankModal.set(true);
  }

  closeBankModal(): void {
    this.showBankModal.set(false);
    this.bankError.set(null);
  }

  saveBankInfo(): void {
    const name = this.bankHolderName().trim();
    const acct = this.bankAccountNumber().trim();
    const ifsc = this.bankIfscCode().trim().toUpperCase();

    if (!name || name.length < 3) {
      this.bankError.set('Please enter a valid account holder name.');
      return;
    }
    if (!acct || !/^[0-9]{6,20}$/.test(acct)) {
      this.bankError.set('Account number must be 6 to 20 digits.');
      return;
    }
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      this.bankError.set('IFSC code must be valid (e.g., HDFC0001234).');
      return;
    }

    const payload: UpdateBankInfoRequest = {
      accountHolderName: name,
      accountNumber: acct,
      ifscCode: ifsc,
    };

    this.washerService.updateBankInfo(payload).subscribe({
      next: (res) => {
        this.profile.set(res);
        this.closeBankModal();
        this.showToast('Direct deposit bank details verified and updated.');
      },
      error: (err) => {
        this.bankError.set(err?.message || 'Failed to save bank information.');
      },
    });
  }

  // --- Logout Flow ---
  openLogoutModal(): void {
    this.showLogoutModal.set(true);
  }

  closeLogoutModal(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    this.loggingOut.set(true);
    this.auth.logout();
    this.showLogoutModal.set(false);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}

export { WasherProfileComponent as WasherProfile };
