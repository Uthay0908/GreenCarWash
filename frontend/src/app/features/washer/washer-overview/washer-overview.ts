import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WasherService } from '../../../core/services/washer.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { BookingService } from '../../../core/services/booking.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { Assignment, Booking, WashPackage } from '../../../shared/models';
import { Subscription, interval, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PendingRequestCard {
  assignmentId: number;
  bookingId: number;
  customerId: number;
  etaMinutes: number;
  offerExpiresAt?: string;
  remainingSeconds: number;
  formattedCountdown: string;
  isExpired: boolean;
  packageTitle: string;
  addOnsText: string;
  totalAmount: number;
  payoutAmount: number;
  instructions: string;
  scheduledTime: string;
}

export interface ActiveJobView {
  assignmentId: number;
  bookingId: number;
  status: string;
  customerInstructions: string;
  packageTitle: string;
  addOnsText: string;
  totalAmount: number;
  payoutAmount: number;
  etaMinutes: number;
  scheduledAt: string;
  checklistTotal: number;
  checklistCompleted: number;
}

@Component({
  selector: 'app-washer-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './washer-overview.html',
  styleUrl: './washer-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherOverview implements OnInit, OnDestroy {
  private readonly washerService = inject(WasherService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly bookingService = inject(BookingService);
  private readonly catalogService = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Loading and error states
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly actionInProgress = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Profile and Availability
  readonly washerProfileId = signal<number | null>(null);
  readonly washerName = signal<string>('Partner');
  readonly washerAvatar = signal<string>('W');
  readonly washerLocation = signal<string>('Local Service Radius');
  readonly isOnline = this.washerService.isOnline;
  readonly serviceRadiusKm = signal<number>(25);

  // Statistics
  readonly todayJobsCount = signal<number>(0);
  readonly todayEarnings = signal<number>(0);
  readonly averageRating = signal<number>(4.9);
  readonly completionRate = signal<number>(98);
  readonly totalWashes = signal<number>(0);

  // Active Job
  readonly activeJob = signal<ActiveJobView | null>(null);
  readonly isBusy = computed(() => {
    const job = this.activeJob();
    return !!job && ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(job.status);
  });

  // Pending Requests & Countdowns
  readonly pendingRequests = signal<PendingRequestCard[]>([]);

  // Rejection Modal State
  readonly showRejectModal = signal<boolean>(false);
  readonly rejectingBookingId = signal<number | null>(null);
  readonly rejectReason = signal<string>('Too far from current location');
  readonly rejectCustomReason = signal<string>('');

  // Package Catalog Cache
  private packageCatalog: Map<number, WashPackage> = new Map();

  private timerSub?: Subscription;
  private pollSub?: Subscription;

  ngOnInit(): void {
    this.loadCatalogAndData();

    // Countdown tick every 1 second
    this.timerSub = interval(1000).subscribe(() => {
      this.updateCountdowns();
    });

    // Refresh pending requests and active job every 15s
    this.pollSub = interval(15000).subscribe(() => {
      this.pollActiveAndPending();
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  loadCatalogAndData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Fetch packages for titles, then fetch washer data
    this.catalogService.listPackages().pipe(
      catchError(() => of([]))
    ).subscribe((pkgs) => {
      if (pkgs) {
        pkgs.forEach((p) => this.packageCatalog.set(p.id, p));
      }
      this.fetchDashboardData();
    });
  }

  fetchDashboardData(): void {
    const user = this.auth.currentUser();
    if (user?.fullName) {
      this.washerName.set(user.fullName);
      this.washerAvatar.set(user.fullName.charAt(0).toUpperCase());
    }

    forkJoin({
      profile: this.washerService.getMyProfile().pipe(catchError(() => of(null))),
      availability: this.washerService.getMyAvailability().pipe(catchError(() => of(null))),
      pendingOffers: this.washerService.getMyPendingRequests().pipe(catchError(() => of([]))),
      activeAssignment: this.washerService.getMyActiveAssignment().pipe(catchError(() => of(null))),
      bookings: this.washerService.listMyBookings().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ profile, availability, pendingOffers, activeAssignment, bookings }) => {
        this.loading.set(false);

        // 1. Profile
        if (profile) {
          this.washerProfileId.set(profile.id);
          this.washerName.set(profile.fullName || user?.fullName || 'Partner');
          this.washerAvatar.set((profile.fullName || 'W').charAt(0).toUpperCase());
          if (profile.averageRating != null) {
            this.averageRating.set(profile.averageRating);
          }
          if (profile.totalCompletedJobs != null) {
            this.totalWashes.set(profile.totalCompletedJobs);
          }
        }

        // 2. Availability
        if (availability) {
          if (availability.serviceRadiusKm) {
            this.serviceRadiusKm.set(availability.serviceRadiusKm);
            this.washerLocation.set(`${availability.serviceRadiusKm} km Service Radius`);
          }
        }

        // 3. Stats from bookings
        if (bookings && Array.isArray(bookings)) {
          this.computeStatsFromBookings(bookings);
        }

        // 4. Performance
        if (profile?.id) {
          this.washerService.getMyPerformance(profile.id).pipe(catchError(() => of(null))).subscribe((perf) => {
            if (perf) {
              if (perf.acceptanceRate != null) {
                this.completionRate.set(Math.round(perf.acceptanceRate * 100));
              }
              if (perf.averageRating != null) {
                this.averageRating.set(perf.averageRating);
              }
            }
          });
        }

        // 5. Active Assignment
        if (activeAssignment && activeAssignment.bookingId) {
          this.loadActiveJobDetails(activeAssignment);
        } else {
          this.activeJob.set(null);
        }

        // 6. Pending Offers
        this.processPendingOffers(pendingOffers || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Failed to connect to Washer dashboard service.');
      },
    });
  }

  private pollActiveAndPending(): void {
    this.washerService.getMyActiveAssignment().pipe(catchError(() => of(null))).subscribe((active) => {
      if (active && active.bookingId) {
        if (!this.activeJob() || this.activeJob()?.bookingId !== active.bookingId || this.activeJob()?.status !== active.status) {
          this.loadActiveJobDetails(active);
        }
      } else {
        this.activeJob.set(null);
      }
    });

    this.washerService.getMyPendingRequests().pipe(catchError(() => of([]))).subscribe((offers) => {
      this.processPendingOffers(offers || []);
    });
  }

  private computeStatsFromBookings(bookings: any[]): void {
    const today = new Date().toISOString().slice(0, 10);
    let todayCount = 0;
    let earnings = 0;

    for (const b of bookings) {
      const createdDate = (b.createdAt || b.scheduledAt || '').slice(0, 10);
      if (createdDate === today) {
        todayCount++;
        const total = Number(b.totalAmount) || 0;
        earnings += Math.round(total * 0.7); // 70% washer commission share
      }
    }

    this.todayJobsCount.set(todayCount);
    this.todayEarnings.set(earnings);
    if (!this.totalWashes() && bookings.length > 0) {
      this.totalWashes.set(bookings.filter((b) => b.status === 'COMPLETED').length);
    }
  }

  private loadActiveJobDetails(assignment: Assignment): void {
    this.bookingService.getById(assignment.bookingId).pipe(
      catchError(() => of(null))
    ).subscribe((booking) => {
      const pkg = booking?.packageId ? this.packageCatalog.get(booking.packageId) : null;
      const pkgName = pkg?.name || 'Standard Eco Steam Wash';
      const addOns = booking?.addOns?.map((a: any) => a.addOnName || 'Add-on').join(', ') || '';
      const total = booking?.totalAmount || 399;
      const payout = Math.round(total * 0.7);

      const checklist = booking?.checklist || [];
      const completed = checklist.filter((c: any) => c.completed).length;

      this.activeJob.set({
        assignmentId: assignment.id,
        bookingId: assignment.bookingId,
        status: assignment.status,
        customerInstructions: booking?.customerInstructions || 'Standard customer request',
        packageTitle: pkgName,
        addOnsText: addOns,
        totalAmount: total,
        payoutAmount: payout,
        etaMinutes: assignment.etaMinutes || 5,
        scheduledAt: booking?.scheduledAt || assignment.createdAt,
        checklistTotal: checklist.length,
        checklistCompleted: completed,
      });
    });
  }

  private processPendingOffers(offers: Assignment[]): void {
    const existingMap = new Map(this.pendingRequests().map((r) => [r.assignmentId, r]));
    const cards: PendingRequestCard[] = [];

    for (const off of offers) {
      const remaining = this.calculateRemainingSeconds(off.offerExpiresAt);
      const prev = existingMap.get(off.id);
      const pkg = this.packageCatalog.get(1); // default / resolved
      cards.push({
        assignmentId: off.id,
        bookingId: off.bookingId,
        customerId: off.customerId,
        etaMinutes: off.etaMinutes || (prev ? prev.etaMinutes : 5),
        offerExpiresAt: off.offerExpiresAt,
        remainingSeconds: remaining,
        formattedCountdown: this.formatTime(remaining),
        isExpired: remaining <= 0,
        packageTitle: prev?.packageTitle || pkg?.name || 'Eco Shine Steam Wash',
        addOnsText: prev?.addOnsText || '',
        totalAmount: prev?.totalAmount || 0,
        payoutAmount: prev?.payoutAmount || 0,
        instructions: prev?.instructions || 'Tap to view customer instructions',
        scheduledTime: prev?.scheduledTime || 'Immediate Wash Now',
      });
    }

    this.pendingRequests.set(cards);

    // Fetch booking details for pending offers asynchronously to enrich them with real amounts
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      this.bookingService.getById(c.bookingId).pipe(catchError(() => of(null))).subscribe((b) => {
        if (!b) return;
        const p = b.packageId ? this.packageCatalog.get(b.packageId) : null;
        const addOns = b.addOns?.map((a: any) => a.addOnName).join(', ') || '';
        const total = Number(b.totalAmount) || 0;
        const payout = Math.round(total * 0.7);

        this.pendingRequests.update((list) =>
          list.map((item) =>
            item.bookingId === b.id
              ? {
                  ...item,
                  packageTitle: p?.name || b.packageName || item.packageTitle,
                  addOnsText: addOns,
                  totalAmount: total,
                  payoutAmount: payout,
                  instructions: b.customerInstructions || 'No special instructions',
                }
              : item
          )
        );
      });
    }
  }

  private calculateRemainingSeconds(expiresAt?: string): number {
    if (!expiresAt) return 600;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  }

  private updateCountdowns(): void {
    const current = this.pendingRequests();
    if (current.length === 0) return;

    let hasExpired = false;
    const updated = current.map((c) => {
      const remaining = this.calculateRemainingSeconds(c.offerExpiresAt);
      if (remaining <= 0) hasExpired = true;
      return {
        ...c,
        remainingSeconds: remaining,
        formattedCountdown: this.formatTime(remaining),
        isExpired: remaining <= 0,
      };
    });

    this.pendingRequests.set(updated);

    if (hasExpired) {
      // Re-fetch pending to purge expired from backend
      this.washerService.getMyPendingRequests().subscribe({
        next: (offers) => this.processPendingOffers(offers || []),
        error: () => {},
      });
    }
  }

  private formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // --- Real Online / Offline Toggle ---
  toggleOnline(forceState?: boolean): void {
    const nextState = forceState !== undefined ? forceState : !this.isOnline();
    this.washerService.setOnline(nextState).subscribe({
      next: (res) => {
        this.showToast(res.online ? '🟢 You are ONLINE. Ready for wash requests!' : '⚪ You are OFFLINE. On break.');
      },
      error: () => {
        this.showToast('⚠️ Failed to update online availability.');
      },
    });
  }

  // --- Accept Request ---
  acceptRequest(req: PendingRequestCard): void {
    if (this.isBusy()) {
      this.showToast('⚠️ You already have an active wash in progress. Complete it before accepting another.');
      return;
    }

    if (req.isExpired) {
      this.showToast('⚠️ This request has expired and can no longer be accepted.');
      return;
    }

    this.actionInProgress.set(true);
    this.washerService.acceptAssignment(req.bookingId).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.showToast(`🎉 Accepted wash request #${req.bookingId}! Navigating to active job...`);

        // Remove from pending list
        this.pendingRequests.update((list) => list.filter((r) => r.bookingId !== req.bookingId));

        // Refresh dashboard active job
        this.washerService.getMyActiveAssignment().subscribe({
          next: (active) => {
            if (active) this.loadActiveJobDetails(active);
          },
        });

        // Navigate to active job page
        setTimeout(() => {
          this.router.navigate(['/washer/active-job', req.bookingId]);
        }, 1200);
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`❌ Failed to accept request: ${err?.error?.message || err?.message || 'Offer expired or reassigned'}`);
        // Refresh pending offers
        this.washerService.getMyPendingRequests().subscribe((offers) => this.processPendingOffers(offers || []));
      },
    });
  }

  // --- Reject Request Modal ---
  openRejectModal(bookingId: number): void {
    this.rejectingBookingId.set(bookingId);
    this.rejectReason.set('Too far from current location');
    this.rejectCustomReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectingBookingId.set(null);
  }

  confirmReject(): void {
    const bookingId = this.rejectingBookingId();
    if (!bookingId) return;

    let reason = this.rejectReason();
    if (reason === 'Other' && this.rejectCustomReason().trim()) {
      reason = this.rejectCustomReason().trim();
    }

    this.actionInProgress.set(true);
    this.washerService.rejectAssignment(bookingId, reason).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.closeRejectModal();
        this.showToast(`Request #${bookingId} declined.`);
        this.pendingRequests.update((list) => list.filter((r) => r.bookingId !== bookingId));
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.closeRejectModal();
        this.showToast(`Decline submitted.`);
        this.pendingRequests.update((list) => list.filter((r) => r.bookingId !== bookingId));
      },
    });
  }

  // --- Active Job Status Actions ---
  markOnTheWay(bookingId: number): void {
    this.actionInProgress.set(true);
    this.washerService.onTheWay(bookingId).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.showToast('🚗 Marked as On The Way! Customer notified.');
        this.updateActiveJobStatus('ON_THE_WAY');
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Could not update: ${err?.message || 'Server error'}`);
      },
    });
  }

  markArrived(bookingId: number): void {
    this.actionInProgress.set(true);
    this.washerService.arrived(bookingId).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.showToast('📍 Marked as Arrived at vehicle location!');
        this.updateActiveJobStatus('ARRIVED');
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Could not update: ${err?.message || 'Server error'}`);
      },
    });
  }

  markStartWash(bookingId: number): void {
    this.actionInProgress.set(true);
    this.washerService.startWash(bookingId).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.showToast('🚿 Wash started! Navigating to job inspection...');
        this.updateActiveJobStatus('IN_PROGRESS');
        setTimeout(() => this.router.navigate(['/washer/active-job', bookingId]), 1000);
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Could not start wash: ${err?.message || 'Server error'}`);
      },
    });
  }

  openWorkflow(): void {
    const job = this.activeJob();
    if (job?.bookingId) {
      this.router.navigate(['/washer/active-job', job.bookingId]);
    } else {
      this.router.navigate(['/washer/active-job']);
    }
  }

  openDirections(): void {
    window.open('https://maps.google.com', '_blank');
  }

  private updateActiveJobStatus(status: string): void {
    const current = this.activeJob();
    if (current) {
      this.activeJob.set({ ...current, status });
    }
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
