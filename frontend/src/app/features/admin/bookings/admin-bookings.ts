import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { BookingService } from '../../../core/services/booking.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import {
  Booking,
  WasherProfile,
  WaterUsageResponse,
  InspectionReportResponse,
  VerificationResponse,
} from '../../../shared/models';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, StatusBadge, DatePipe, CurrencyPipe, FormsModule, PaginationComponent],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminBookings implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly bookingService = inject(BookingService);

  readonly bookings = signal<Booking[]>([]);
  readonly activeWashers = signal<WasherProfile[]>([]);
  readonly selectedStatus = signal<string>('ALL');
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);

  // Pagination state
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);

  // Booking Details Modal
  readonly selectedBooking = signal<Booking | null>(null);
  readonly bookingWaterUsage = signal<WaterUsageResponse | null>(null);
  readonly bookingInspection = signal<InspectionReportResponse | null>(null);
  readonly bookingVerification = signal<VerificationResponse | null>(null);
  readonly loadingDetails = signal<boolean>(false);

  // Assign Modal
  readonly assigningBooking = signal<Booking | null>(null);
  selectedWasherId: number | null = null;
  assignReason = 'Admin operational dispatch';

  // Timeline Modal
  readonly timelineBooking = signal<Booking | null>(null);
  readonly timelineEvents = signal<any[]>([]);

  // Cancel Modal
  readonly cancellingBooking = signal<Booking | null>(null);
  cancelReason = 'Customer requested cancellation via admin support';

  readonly toastMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBookings();
    this.loadWashers();
  }

  loadBookings(): void {
    this.loading.set(true);
    const statusParam = this.selectedStatus() === 'ALL' ? undefined : this.selectedStatus();
    this.admin.listBookings(statusParam, this.currentPage(), this.pageSize()).subscribe({
      next: (page) => {
        let list = page.content || [];
        const q = this.searchQuery().trim().toLowerCase();
        if (q) {
          list = list.filter((b) =>
            String(b.id).includes(q) ||
            String(b.customerId).includes(q) ||
            String(b.vehicleId).includes(q) ||
            (b.washerProfileId != null && String(b.washerProfileId).includes(q))
          );
        }
        this.bookings.set(list);
        this.totalElements.set(page.totalElements || list.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(0);
    this.loadBookings();
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadBookings();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadBookings();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadBookings();
  }

  loadWashers(): void {
    this.admin.listWashers('APPROVED', 0, 50).subscribe({
      next: (page) => this.activeWashers.set(page.content || []),
      error: () => {},
    });
  }

  // --- Booking Details Modal ---
  openBookingDetails(b: Booking): void {
    this.selectedBooking.set(b);
    this.loadingDetails.set(true);
    this.bookingWaterUsage.set(null);
    this.bookingInspection.set(null);
    this.bookingVerification.set(null);

    // 1. Water Usage
    this.bookingService.getWaterUsage(b.id).subscribe({
      next: (wu) => this.bookingWaterUsage.set(wu),
      error: () => this.bookingWaterUsage.set(null),
    });

    // 2. Inspection report (pre-wash)
    this.bookingService.getInspection(b.id).subscribe({
      next: (insp) => this.bookingInspection.set(insp),
      error: () => this.bookingInspection.set(null),
    });

    // 3. Verification report (post-wash evidence)
    this.bookingService.getVerification(b.id).subscribe({
      next: (ver) => {
        this.bookingVerification.set(ver);
        this.loadingDetails.set(false);
      },
      error: () => {
        this.bookingVerification.set(null);
        this.loadingDetails.set(false);
      },
    });
  }

  closeBookingDetails(): void {
    this.selectedBooking.set(null);
  }

  // --- Assign Modal ---
  openAssignModal(b: Booking): void {
    this.assigningBooking.set(b);
    this.selectedWasherId = b.washerProfileId ?? (this.activeWashers()[0]?.id || null);
    this.assignReason = b.washerProfileId ? 'Operational reassignment' : 'Admin manual dispatch';
  }

  closeAssignModal(): void {
    this.assigningBooking.set(null);
  }

  confirmAssignment(): void {
    const b = this.assigningBooking();
    if (!b || !this.selectedWasherId) return;

    this.admin.assignWasher(b.id, {
      washerProfileId: this.selectedWasherId,
      reason: this.assignReason,
    }).subscribe({
      next: () => {
        this.showToast(`Booking #${b.id} dispatched to washer #${this.selectedWasherId}.`);
        this.closeAssignModal();
        this.loadBookings();
        if (this.selectedBooking()?.id === b.id) {
          this.selectedBooking.update((cur) => cur ? { ...cur, washerProfileId: this.selectedWasherId!, status: 'ASSIGNED' } : null);
        }
      },
      error: (err) => this.showToast('Dispatch failed: ' + (err?.error?.message || err?.message || 'Error')),
    });
  }

  // --- Timeline Modal ---
  openTimelineModal(b: Booking): void {
    this.timelineBooking.set(b);
    this.admin.getBookingTimeline(b.id).subscribe({
      next: (events) => this.timelineEvents.set(events || []),
      error: () => this.timelineEvents.set([]),
    });
  }

  closeTimelineModal(): void {
    this.timelineBooking.set(null);
  }

  // --- Cancel Modal ---
  openCancelModal(b: Booking): void {
    this.cancellingBooking.set(b);
    this.cancelReason = 'Administrative cancellation';
  }

  closeCancelModal(): void {
    this.cancellingBooking.set(null);
  }

  confirmCancel(): void {
    const b = this.cancellingBooking();
    if (!b) return;

    this.admin.cancelBooking(b.id, this.cancelReason).subscribe({
      next: () => {
        this.showToast(`Booking #${b.id} cancelled.`);
        this.closeCancelModal();
        this.loadBookings();
        if (this.selectedBooking()?.id === b.id) {
          this.selectedBooking.update((cur) => cur ? { ...cur, status: 'CANCELLED', cancellationReason: this.cancelReason } : null);
        }
      },
      error: (err) => this.showToast('Cancellation failed: ' + (err?.error?.message || err?.message || 'Error')),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
