import { ChangeDetectionStrategy, Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorporateService } from '../../../core/services/corporate.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Booking, FleetBookingRequestSummary, Invoice, Organization, Vehicle } from '../../../shared/models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Billing implements OnInit {
  private readonly corporate = inject(CorporateService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly bookingService = inject(BookingService);
  private readonly paymentService = inject(PaymentService);
  private readonly vehicleService = inject(VehicleService);

  readonly organization = signal<Organization | null>(null);
  readonly fleetBookings = signal<FleetBookingRequestSummary[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly myVehicles = signal<Vehicle[]>([]);

  readonly loading = signal<boolean>(true);
  readonly activeTab = signal<'INVOICES' | 'UNBILLED'>('INVOICES');
  readonly selectedInvoice = signal<Invoice | null>(null);
  readonly downloadingId = signal<number | null>(null);

  // Settle & Generate Invoice modal
  readonly settlingBooking = signal<Booking | null>(null);
  readonly settling = signal<boolean>(false);
  paymentMethodToken = 'tok_corp_visa';

  readonly toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  readonly executedCount = computed(() =>
    this.fleetBookings().filter((b) => b.status === 'COMPLETED').length
  );

  readonly totalBilled = computed(() =>
    this.invoices().reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  );

  readonly totalRefunded = computed(() =>
    this.invoices().reduce((sum, inv) => sum + (inv.refundedAmount || 0), 0)
  );

  readonly unbilledBookings = computed(() =>
    this.bookings().filter((b) => !b.paymentConfirmedAt && b.status !== 'CANCELLED' && b.status !== 'FAILED')
  );

  readonly unbilledTotal = computed(() =>
    this.unbilledBookings().reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  );

  readonly vehicleMap = computed(() => {
    const map = new Map<number, Vehicle>();
    for (const v of this.myVehicles()) {
      map.set(v.id, v);
    }
    return map;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 4) {
        this.loading.set(false);
      }
    };

    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        if (org) {
          this.corporate.listFleetBookings(org.id).subscribe({
            next: (b) => {
              this.fleetBookings.set(Array.isArray(b) ? b : b.content || []);
              checkDone();
            },
            error: () => checkDone(),
          });
        } else {
          checkDone();
        }
      },
      error: () => checkDone(),
    });

    this.invoiceService.listMine().subscribe({
      next: (invs) => {
        this.invoices.set(invs || []);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.bookingService.listMine().subscribe({
      next: (b) => {
        this.bookings.set(b || []);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.vehicleService.list().subscribe({
      next: (v) => {
        this.myVehicles.set(v || []);
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  getVehicleTitle(vehicleId?: number): string {
    if (!vehicleId) return 'Fleet Vehicle';
    const match = this.vehicleMap().get(vehicleId);
    if (match) {
      return `${match.make} ${match.model}`;
    }
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

  viewDetails(invoice: Invoice): void {
    if (this.selectedInvoice()?.id === invoice.id) {
      this.selectedInvoice.set(null);
    } else {
      this.selectedInvoice.set(invoice);
    }
  }

  closeModal(): void {
    this.selectedInvoice.set(null);
  }

  openSettleModal(booking: Booking): void {
    this.settlingBooking.set(booking);
    this.paymentMethodToken = 'tok_corp_visa';
  }

  closeSettleModal(): void {
    this.settlingBooking.set(null);
  }

  confirmSettle(): void {
    const booking = this.settlingBooking();
    if (!booking) return;

    this.settling.set(true);
    this.paymentService.charge(booking.id, this.paymentMethodToken).subscribe({
      next: () => {
        this.settling.set(false);
        this.closeSettleModal();
        this.showToast(`Booking #${booking.id} settled successfully! Official tax invoice has been generated.`, 'success');
        this.loadData();
      },
      error: (err) => {
        this.settling.set(false);
        const msg = err?.error?.message || 'Payment settlement failed with payment gateway.';
        this.showToast(msg, 'error');
      },
    });
  }

  downloadPdf(invoice: Invoice, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.downloadingId.set(invoice.id);
    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob) => {
        this.downloadingId.set(null);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.invoiceNumber || 'invoice-' + invoice.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.downloadingId.set(null);
        this.showToast(`Could not download invoice #${invoice.invoiceNumber || invoice.id}. A printable invoice view is available in the table.`, 'error');
      },
    });
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ text, type });
    setTimeout(() => this.toast.set(null), 5000);
  }
}
