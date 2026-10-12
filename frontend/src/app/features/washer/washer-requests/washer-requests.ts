import { ChangeDetectionStrategy, Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WasherService } from '../../../core/services/washer.service';
import { BookingService } from '../../../core/services/booking.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Assignment, WashPackage } from '../../../shared/models';
import { Subscription, interval, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PendingRequestDetail {
  assignmentId: number;
  bookingId: number;
  customerId: number;
  customerInstructions: string;
  packageTitle: string;
  addOnsList: string[];
  totalPrice: number;
  payoutPrice: number;
  etaMinutes: number;
  distanceKm: number;
  offerExpiresAt?: string;
  remainingSeconds: number;
  formattedCountdown: string;
  isExpired: boolean;
  requestTime: string;
  status: string;
}

type RequestFilter = 'ALL' | 'NEARBY' | 'HIGH_PAY';

@Component({
  selector: 'app-washer-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './washer-requests.html',
  styleUrl: './washer-requests.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherRequests implements OnInit, OnDestroy {
  private readonly washerService = inject(WasherService);
  private readonly bookingService = inject(BookingService);
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly actionInProgress = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  readonly activeFilter = signal<RequestFilter>('ALL');
  readonly allRequests = signal<PendingRequestDetail[]>([]);

  // Rejection Modal Signals
  readonly showRejectModal = signal<boolean>(false);
  readonly rejectingBookingId = signal<number | null>(null);
  readonly rejectReason = signal<string>('Too far from current location');
  readonly rejectCustomReason = signal<string>('');

  // Active Job & Busy state
  readonly activeJob = signal<any | null>(null);
  readonly isBusy = computed(() => {
    const job = this.activeJob();
    return !!job && ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(job.status);
  });

  // Packages map
  private packageCatalog: Map<number, WashPackage> = new Map();
  private countdownSub?: Subscription;
  private pollSub?: Subscription;

  // Pagination Signals
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(6);

  readonly filteredRequests = computed(() => {
    const filter = this.activeFilter();
    const list = this.allRequests();
    switch (filter) {
      case 'NEARBY':
        return list.filter((r) => r.distanceKm <= 5.0 || r.etaMinutes <= 10);
      case 'HIGH_PAY':
        return list.filter((r) => r.payoutPrice >= 400);
      default:
        return list;
    }
  });

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredRequests().length / this.pageSize()));
  });

  readonly paginatedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredRequests().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.catalogService.listPackages().pipe(catchError(() => of([]))).subscribe((pkgs) => {
      if (pkgs) {
        pkgs.forEach((p) => this.packageCatalog.set(p.id, p));
      }
      this.loadRequests();
    });

    // Countdown interval (every 1s)
    this.countdownSub = interval(1000).subscribe(() => {
      this.updateCountdowns();
    });

    // Periodic poll for new requests (every 12s)
    this.pollSub = interval(12000).subscribe(() => {
      this.pollRequests();
    });
  }

  ngOnDestroy(): void {
    this.countdownSub?.unsubscribe();
    this.pollSub?.unsubscribe();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.washerService.getMyActiveAssignment().pipe(catchError(() => of(null))).subscribe((active) => {
      this.activeJob.set(active);
    });

    this.washerService.getMyPendingRequests().subscribe({
      next: (offers) => {
        this.loading.set(false);
        this.processOffers(offers || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Could not load incoming requests from server.');
      },
    });
  }

  private pollRequests(): void {
    this.washerService.getMyActiveAssignment().pipe(catchError(() => of(null))).subscribe((active) => {
      this.activeJob.set(active);
    });

    this.washerService.getMyPendingRequests().pipe(catchError(() => of([]))).subscribe((offers) => {
      this.processOffers(offers || []);
    });
  }

  private processOffers(offers: Assignment[]): void {
    const list: PendingRequestDetail[] = offers.map((off) => {
      const remaining = this.calculateRemaining(off.offerExpiresAt);
      const pkg = this.packageCatalog.get(1);
      return {
        assignmentId: off.id,
        bookingId: off.bookingId,
        customerId: off.customerId,
        customerInstructions: 'Tap to view customer notes',
        packageTitle: pkg?.name || 'Eco Shine Steam Wash',
        addOnsList: [],
        totalPrice: 0,
        payoutPrice: 0,
        etaMinutes: off.etaMinutes || 5,
        distanceKm: Math.round(((off.etaMinutes || 5) * 0.6) * 10) / 10,
        offerExpiresAt: off.offerExpiresAt,
        remainingSeconds: remaining,
        formattedCountdown: this.formatTime(remaining),
        isExpired: remaining <= 0,
        requestTime: new Date(off.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: off.status,
      };
    });

    this.allRequests.set(list);

    // Enrich with real booking details
    for (const item of list) {
      this.bookingService.getById(item.bookingId).pipe(catchError(() => of(null))).subscribe((b) => {
        if (!b) return;
        const p = b.packageId ? this.packageCatalog.get(b.packageId) : null;
        const addOns = b.addOns?.map((a: any) => a.addOnName) || [];
        const total = b.totalAmount ?? 0;
        const payout = Math.round(total * 0.7);

        this.allRequests.update((current) =>
          current.map((req) =>
            req.bookingId === b.id
              ? {
                  ...req,
                  packageTitle: p?.name || req.packageTitle,
                  addOnsList: addOns,
                  totalPrice: total,
                  payoutPrice: payout,
                  customerInstructions: b.customerInstructions || 'No special instructions provided',
                }
              : req
          )
        );
      });
    }
  }

  private calculateRemaining(expiresAt?: string): number {
    if (!expiresAt) return 600;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  }

  private updateCountdowns(): void {
    const list = this.allRequests();
    if (list.length === 0) return;

    let hasExpired = false;
    const updated = list.map((item) => {
      const remaining = this.calculateRemaining(item.offerExpiresAt);
      if (remaining <= 0) hasExpired = true;
      return {
        ...item,
        remainingSeconds: remaining,
        formattedCountdown: this.formatTime(remaining),
        isExpired: remaining <= 0,
      };
    });

    this.allRequests.set(updated);

    if (hasExpired) {
      // Re-fetch to clear expired offers
      this.washerService.getMyPendingRequests().subscribe({
        next: (offers) => this.processOffers(offers || []),
        error: () => {},
      });
    }
  }

  private formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  setFilter(filter: RequestFilter): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // --- Real Accept Request ---
  acceptRequest(item: PendingRequestDetail): void {
    if (this.isBusy()) {
      this.showToast('⚠️ You currently have an active job in progress. Finish it before accepting another.');
      return;
    }

    if (item.isExpired) {
      this.showToast('⚠️ Request has expired and cannot be accepted.');
      return;
    }

    this.actionInProgress.set(true);
    this.washerService.acceptAssignment(item.bookingId).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.allRequests.update((list) => list.filter((r) => r.bookingId !== item.bookingId));
        this.showToast(`🎉 Accepted wash request #${item.bookingId}! Navigating to active job...`);
        setTimeout(() => {
          this.router.navigate(['/washer/active-job', item.bookingId]);
        }, 1200);
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`❌ Could not accept: ${err?.error?.message || err?.message || 'Offer expired'}`);
        this.loadRequests();
      },
    });
  }

  // --- Real Reject Request Modal ---
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
        this.allRequests.update((list) => list.filter((r) => r.bookingId !== bookingId));
        this.showToast(`Declined request #${bookingId}.`);
      },
      error: () => {
        this.actionInProgress.set(false);
        this.closeRejectModal();
        this.allRequests.update((list) => list.filter((r) => r.bookingId !== bookingId));
        this.showToast(`Decline submitted for #${bookingId}.`);
      },
    });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
