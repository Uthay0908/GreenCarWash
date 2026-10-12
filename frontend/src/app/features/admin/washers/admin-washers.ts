import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  Booking,
  KycDocument,
  KycReviewRequest,
  WasherAvailability,
  WasherLeaderboardEntry,
  WasherProfile,
  WasherRejectionStat,
} from '../../../shared/models';

type WasherTab = 'directory' | 'kyc-queue' | 'rejection-stats' | 'leaderboard';

@Component({
  selector: 'app-admin-washers',
  standalone: true,
  imports: [CommonModule, StatusBadge, DatePipe, DecimalPipe, FormsModule, PaginationComponent],
  templateUrl: './admin-washers.html',
  styleUrl: './admin-washers.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminWashers implements OnInit {
  readonly currentTab = signal<WasherTab>('directory');
  readonly washers = signal<WasherProfile[]>([]);
  readonly pendingKycWashers = signal<WasherProfile[]>([]);
  readonly rejectionStats = signal<WasherRejectionStat[]>([]);
  readonly leaderboard = signal<WasherLeaderboardEntry[]>([]);
  readonly statusFilter = signal<string>('ALL');
  readonly loading = signal<boolean>(false);

  // Pagination for Washer Directory
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);

  // Pagination for KYC Queue
  readonly kycPage = signal<number>(0);
  readonly kycPageSize = signal<number>(10);
  readonly kycTotalElements = signal<number>(0);

  // Detailed Washer View Modal
  readonly detailsWasher = signal<WasherProfile | null>(null);
  readonly washerAvailability = signal<WasherAvailability | null>(null);
  readonly washerBookings = signal<Booking[]>([]);
  readonly washerDocuments = signal<KycDocument[]>([]);
  readonly loadingDetails = signal<boolean>(false);

  // KYC Review State
  readonly reviewingWasher = signal<WasherProfile | null>(null);
  readonly showKycModal = signal<boolean>(false);
  readonly reviewForm = signal<KycReviewRequest>({ approve: true, notes: '' });

  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadWashers();
    this.loadPendingKyc();
    this.loadRejectionStats();
    this.loadLeaderboard();
  }

  setTab(tab: WasherTab): void {
    this.currentTab.set(tab);
  }

  loadWashers(): void {
    this.loading.set(true);
    const kycParam = this.statusFilter() === 'ALL' ? '' : this.statusFilter();
    this.admin.listWashers(kycParam, this.currentPage(), this.pageSize()).subscribe({
      next: (page) => {
        this.washers.set(page.content || []);
        this.totalElements.set(page.totalElements || 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadWashers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadWashers();
  }

  loadPendingKyc(): void {
    this.admin.listWashers('PENDING', this.kycPage(), this.kycPageSize()).subscribe({
      next: (page) => {
        this.pendingKycWashers.set(page.content || []);
        this.kycTotalElements.set(page.totalElements || 0);
      },
      error: () => {},
    });
  }

  onKycPageChange(page: number): void {
    this.kycPage.set(page);
    this.loadPendingKyc();
  }

  onKycPageSizeChange(size: number): void {
    this.kycPageSize.set(size);
    this.kycPage.set(0);
    this.loadPendingKyc();
  }

  loadRejectionStats(): void {
    this.admin.getWasherRejectionStats(168, 3).subscribe({
      next: (stats) => this.rejectionStats.set(stats || []),
      error: () => {},
    });
  }

  loadLeaderboard(): void {
    this.admin.getWasherLeaderboard(20).subscribe({
      next: (lb) => this.leaderboard.set(lb || []),
      error: () => {},
    });
  }

  // --- Washer Details Modal ---
  openWasherDetails(w: WasherProfile): void {
    this.detailsWasher.set(w);
    this.loadingDetails.set(true);
    this.washerAvailability.set(null);
    this.washerBookings.set([]);
    this.washerDocuments.set([]);

    // 1. Fetch live availability
    this.admin.getWasherAvailability(w.id).subscribe({
      next: (avail) => this.washerAvailability.set(avail),
      error: () => this.washerAvailability.set(null),
    });

    // 2. Fetch KYC documents
    this.admin.getWasherKycDocuments(w.id).subscribe({
      next: (docs) => this.washerDocuments.set(docs || []),
      error: () => this.washerDocuments.set([]),
    });

    // 3. Fetch bookings assigned to this washer
    this.admin.listBookings(undefined, 0, 100).subscribe({
      next: (page) => {
        const bookings = (page?.content || []).filter(
          (b) => b.washerProfileId === w.id || (b as any).washerId === w.id
        );
        this.washerBookings.set(bookings);
        this.loadingDetails.set(false);
      },
      error: () => this.loadingDetails.set(false),
    });
  }

  closeWasherDetails(): void {
    this.detailsWasher.set(null);
  }

  // --- Status & KYC Actions ---
  toggleWasherActive(w: WasherProfile): void {
    const newStatus = !w.active;
    this.admin.toggleWasherStatus(w.id, newStatus).subscribe({
      next: () => {
        this.showToast(`Washer #${w.id} (${w.fullName}) ${newStatus ? 'reactivated' : 'deactivated'}.`);
        this.loadWashers();
        if (this.detailsWasher()?.id === w.id) {
          this.detailsWasher.update((cur) => cur ? { ...cur, active: newStatus } : null);
        }
      },
      error: (err) => this.showToast('Failed to update washer status: ' + (err?.error?.message || err?.message || 'Server error')),
    });
  }

  quickApprove(w: WasherProfile): void {
    this.admin.reviewWasherKyc(w.id, { approve: true, notes: 'Fast-track administrator operational approval' }).subscribe({
      next: () => {
        this.showToast(`Washer #${w.id} (${w.fullName}) has been KYC-approved.`);
        this.loadWashers();
        this.loadPendingKyc();
        if (this.detailsWasher()?.id === w.id) {
          this.detailsWasher.update((cur) => cur ? { ...cur, kycStatus: 'APPROVED' } : null);
        }
      },
      error: (err) => this.showToast('Approval failed: ' + (err?.message || 'Error')),
    });
  }

  openKycReview(w: WasherProfile): void {
    this.reviewingWasher.set(w);
    this.reviewForm.set({ approve: true, notes: '' });
    this.admin.getWasherKycDocuments(w.id).subscribe({
      next: (docs) => {
        this.washerDocuments.set(docs || []);
        this.showKycModal.set(true);
      },
      error: () => {
        this.washerDocuments.set([]);
        this.showKycModal.set(true);
      }
    });
  }

  closeKycModal(): void {
    this.showKycModal.set(false);
    this.reviewingWasher.set(null);
  }

  submitKycReview(): void {
    const w = this.reviewingWasher();
    if (!w) return;

    this.admin.reviewWasherKyc(w.id, this.reviewForm()).subscribe({
      next: () => {
        const action = this.reviewForm().approve ? 'approved' : 'rejected';
        this.showToast(`KYC for ${w.fullName} has been ${action}.`);
        this.closeKycModal();
        this.loadWashers();
        this.loadPendingKyc();
        if (this.detailsWasher()?.id === w.id) {
          this.detailsWasher.update((cur) => cur ? { ...cur, kycStatus: this.reviewForm().approve ? 'APPROVED' : 'REJECTED' } : null);
        }
      },
      error: (err) => this.showToast('KYC review failed: ' + (err?.error?.message || err?.message || 'Error')),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
