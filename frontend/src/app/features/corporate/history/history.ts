import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { CorporateService } from '../../../core/services/corporate.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Booking, BookingTimelineResponse, Invoice, OrganizationVehicle, Vehicle } from '../../../shared/models';

@Component({
  selector: 'app-corporate-history',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, RouterLink, StatusBadge],
  templateUrl: './history.html',
  styleUrl: './history.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateHistory implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly vehicleService = inject(VehicleService);
  private readonly corporate = inject(CorporateService);

  readonly bookings = signal<Booking[]>([]);
  readonly myVehicles = signal<Vehicle[]>([]);
  readonly fleetVehicles = signal<OrganizationVehicle[]>([]);

  readonly vehicleMap = computed(() => {
    const map = new Map<number, Vehicle>();
    for (const v of this.myVehicles()) {
      map.set(v.id, v);
    }
    return map;
  });

  readonly fleetVehicleLabelMap = computed(() => {
    const map = new Map<number, string>();
    for (const fv of this.fleetVehicles()) {
      if (fv.label) {
        map.set(fv.vehicleId, fv.label);
      }
    }
    return map;
  });

  getVehicleTitle(vehicleId?: number): string {
    if (!vehicleId) return 'Fleet Vehicle';
    const match = this.vehicleMap().get(vehicleId);
    if (match) {
      return `${match.make} ${match.model}`;
    }
    const label = this.fleetVehicleLabelMap().get(vehicleId);
    if (label) return label;
    return `Vehicle #${vehicleId}`;
  }

  getVehiclePlate(vehicleId?: number): string {
    if (!vehicleId) return 'N/A';
    const match = this.vehicleMap().get(vehicleId);
    if (match) {
      return match.licensePlate;
    }
    return `Ref #${vehicleId}`;
  }

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly statusFilter = signal<string>('ALL');
  searchQuery = '';

  // Timeline tracking modal
  readonly selectedTimelineBooking = signal<Booking | null>(null);
  readonly timelineEvents = signal<BookingTimelineResponse[]>([]);
  readonly loadingTimeline = signal<boolean>(false);

  // Cancellation modal
  readonly cancelBookingTarget = signal<Booking | null>(null);
  readonly cancelling = signal<boolean>(false);
  cancelReason = 'Fleet schedule changed';

  // Invoice modal
  readonly selectedInvoice = signal<Invoice | null>(null);
  readonly loadingInvoice = signal<boolean>(false);

  readonly toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  readonly filteredBookings = computed(() => {
    let list = this.bookings();
    const filter = this.statusFilter();
    const query = this.searchQuery.trim().toLowerCase();

    if (filter !== 'ALL') {
      if (filter === 'ACTIVE') {
        list = list.filter((b) =>
          ['PENDING', 'ASSIGNMENT_PENDING', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
        );
      } else if (filter === 'COMPLETED') {
        list = list.filter((b) => b.status === 'COMPLETED');
      } else if (filter === 'CANCELLED') {
        list = list.filter((b) => b.status === 'CANCELLED' || b.status === 'FAILED');
      } else {
        list = list.filter((b) => b.status === filter);
      }
    }

    if (query) {
      list = list.filter(
        (b) =>
          b.id.toString().includes(query) ||
          b.vehicleLabel?.toLowerCase().includes(query) ||
          b.packageName?.toLowerCase().includes(query) ||
          b.washerProfileId?.toString().includes(query)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.listMine().subscribe({
      next: (b) => {
        this.bookings.set(b || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load fleet service history from server.');
      },
    });

    this.vehicleService.list().subscribe({
      next: (v) => this.myVehicles.set(v || []),
      error: () => this.myVehicles.set([]),
    });

    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        if (org) {
          this.corporate.listVehicles(org.id).subscribe({
            next: (fv) => this.fleetVehicles.set(fv || []),
            error: () => this.fleetVehicles.set([]),
          });
        }
      },
      error: () => this.fleetVehicles.set([]),
    });
  }

  openTimeline(booking: Booking): void {
    this.selectedTimelineBooking.set(booking);
    this.loadingTimeline.set(true);

    this.bookingService.getTimeline(booking.id).subscribe({
      next: (events) => {
        this.timelineEvents.set(events || []);
        this.loadingTimeline.set(false);
      },
      error: () => {
        this.loadingTimeline.set(false);
        this.showToast('Unable to load live timeline events.', 'error');
      },
    });
  }

  closeTimeline(): void {
    this.selectedTimelineBooking.set(null);
    this.timelineEvents.set([]);
  }

  requestCancel(booking: Booking): void {
    this.cancelBookingTarget.set(booking);
    this.cancelReason = 'Fleet schedule changed';
  }

  closeCancelModal(): void {
    this.cancelBookingTarget.set(null);
  }

  confirmCancel(): void {
    const target = this.cancelBookingTarget();
    if (!target) return;

    this.cancelling.set(true);
    this.bookingService.cancel(target.id, this.cancelReason).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.cancelBookingTarget.set(null);
        this.showToast(`Booking #${target.id} cancelled.`, 'success');
        this.loadBookings();
      },
      error: (err) => {
        this.cancelling.set(false);
        const msg = err?.error?.message || 'Failed to cancel booking.';
        this.showToast(msg, 'error');
      },
    });
  }

  viewInvoice(booking: Booking): void {
    this.loadingInvoice.set(true);
    this.invoiceService.getByBookingId(booking.id).subscribe({
      next: (inv) => {
        this.loadingInvoice.set(false);
        this.selectedInvoice.set(inv);
      },
      error: () => {
        this.loadingInvoice.set(false);
        this.showToast(`No invoice generated yet for Booking #${booking.id}`, 'error');
      },
    });
  }

  closeInvoiceModal(): void {
    this.selectedInvoice.set(null);
  }

  downloadPdf(invoiceId: number, invoiceNum: string): void {
    this.invoiceService.downloadPdf(invoiceId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceNum || 'invoice-' + invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.showToast('PDF download failed. Please try again.', 'error');
      },
    });
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ text, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
