import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WasherService } from '../../../core/services/washer.service';
import { WasherAvailability as WasherAvailabilityModel, AvailabilityBlackoutResponse, AvailabilityBlackoutRequest } from '../../../shared/models';

@Component({
  selector: 'app-washer-availability',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './washer-availability.html',
  styleUrl: './washer-availability.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherAvailability implements OnInit {
  private readonly washerService = inject(WasherService);

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Availability signals
  readonly isOnline = this.washerService.isOnline;
  readonly workingHoursStart = signal<string>('08:00');
  readonly workingHoursEnd = signal<string>('20:00');
  readonly maxConcurrentJobs = signal<number>(1);
  readonly serviceRadiusKm = signal<number>(10);
  readonly baseLatitude = signal<number>(12.9716);
  readonly baseLongitude = signal<number>(77.5946);

  // Blackouts list
  readonly blackoutsList = signal<AvailabilityBlackoutResponse[]>([]);

  // Add Blackout Modal
  readonly showBlackoutModal = signal<boolean>(false);
  readonly newBlackoutDate = signal<string>('');
  readonly newStartTime = signal<string>('');
  readonly newEndTime = signal<string>('');
  readonly newReason = signal<string>('');
  readonly isFullDay = signal<boolean>(true);
  readonly blackoutError = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAvailabilityData();
  }

  loadAvailabilityData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      avail: this.washerService.getMyAvailability().pipe(catchError(() => of(null))),
      blackouts: this.washerService.listMyBlackouts().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ avail, blackouts }) => {
        this.loading.set(false);
        if (avail) {
          if (avail.workingHoursStart) this.workingHoursStart.set(avail.workingHoursStart.slice(0, 5));
          if (avail.workingHoursEnd) this.workingHoursEnd.set(avail.workingHoursEnd.slice(0, 5));
          if (avail.maxConcurrentJobs) this.maxConcurrentJobs.set(avail.maxConcurrentJobs);
          if (avail.serviceRadiusKm) this.serviceRadiusKm.set(avail.serviceRadiusKm);
          if (avail.baseLatitude) this.baseLatitude.set(avail.baseLatitude);
          if (avail.baseLongitude) this.baseLongitude.set(avail.baseLongitude);
        }
        this.blackoutsList.set(blackouts || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Failed to load availability settings.');
      },
    });
  }

  toggleOnline(): void {
    const next = !this.isOnline();
    this.washerService.setOnline(next).subscribe({
      next: (res) => {
        this.showToast(`Status changed to ${res.online ? 'Online (Available for Wash Dispatch)' : 'Offline (On Break)'}`);
      },
      error: () => {
        this.showToast('Could not update online status on server.');
      },
    });
  }

  saveSchedulePreferences(): void {
    this.saving.set(true);
    this.washerService.updateAvailability({
      online: this.isOnline(),
      workingHoursStart: this.workingHoursStart(),
      workingHoursEnd: this.workingHoursEnd(),
      maxConcurrentJobs: this.maxConcurrentJobs(),
      serviceRadiusKm: this.serviceRadiusKm(),
      baseLatitude: this.baseLatitude(),
      baseLongitude: this.baseLongitude(),
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.showToast('Working hours and dispatch preferences saved successfully.');
      },
      error: (err) => {
        this.saving.set(false);
        this.showToast(err?.message || 'Failed to save availability preferences.');
      },
    });
  }

  // --- Blackout / Break Windows ---
  openAddBlackoutModal(): void {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.newBlackoutDate.set(tomorrow);
    this.newStartTime.set('13:00');
    this.newEndTime.set('15:00');
    this.newReason.set('Maintenance & Recharge');
    this.isFullDay.set(true);
    this.blackoutError.set(null);
    this.showBlackoutModal.set(true);
  }

  closeAddBlackoutModal(): void {
    this.showBlackoutModal.set(false);
    this.blackoutError.set(null);
  }

  saveBlackout(): void {
    const date = this.newBlackoutDate().trim();
    if (!date) {
      this.blackoutError.set('Please select an unavailability date.');
      return;
    }

    const payload: AvailabilityBlackoutRequest = {
      blackoutDate: date,
      reason: this.newReason().trim() || undefined,
    };

    if (!this.isFullDay()) {
      if (!this.newStartTime() || !this.newEndTime()) {
        this.blackoutError.set('Please specify both start and end times for partial-day breaks.');
        return;
      }
      payload.startTime = this.newStartTime();
      payload.endTime = this.newEndTime();
    }

    this.washerService.addMyBlackout(payload).subscribe({
      next: (created) => {
        this.closeAddBlackoutModal();
        this.showToast('Unavailability window recorded successfully.');
        this.loadAvailabilityData();
      },
      error: (err) => {
        this.blackoutError.set(err?.error?.message || err?.message || 'Failed to record unavailability window.');
      },
    });
  }

  removeBlackout(id: number): void {
    this.washerService.removeMyBlackout(id).subscribe({
      next: () => {
        this.showToast('Unavailability window removed.');
        this.loadAvailabilityData();
      },
      error: (err) => {
        this.showToast(err?.message || 'Failed to remove unavailability window.');
      },
    });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
