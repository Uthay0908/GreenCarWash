import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { BookingService } from '../../../core/services/booking.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Booking, Payment, Vehicle } from '../../../shared/models';

@Component({
  selector: 'app-corporate-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, RouterLink, StatusBadge],
  templateUrl: './corporate-payments.html',
  styleUrl: './corporate-payments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporatePayments implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);

  readonly payments = signal<Payment[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly myVehicles = signal<Vehicle[]>([]);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly activeTab = signal<'TRANSACTIONS' | 'PENDING_SETTLEMENT'>('TRANSACTIONS');
  readonly statusFilter = signal<string>('ALL');
  searchQuery = '';

  // Pay Now Modal for pending bookings
  readonly payTargetBooking = signal<Booking | null>(null);
  readonly paying = signal<boolean>(false);
  paymentMethodToken = 'tok_corp_visa';

  // Retry modal for failed payments
  readonly retryPaymentTarget = signal<Payment | null>(null);
  readonly retrying = signal<boolean>(false);
  retryPaymentToken = 'tok_corp_mastercard';

  readonly toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Unpaid bookings awaiting settlement
  readonly unpaidBookings = computed(() =>
    this.bookings().filter((b) => !b.paymentConfirmedAt && b.status !== 'CANCELLED' && b.status !== 'FAILED')
  );

  readonly unpaidTotalAmount = computed(() =>
    this.unpaidBookings().reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  );

  // Dynamic KPIs strictly calculated from real payment objects
  readonly totalPaid = computed(() =>
    this.payments()
      .filter((p) => this.isSettledStatus(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  readonly pendingAmount = computed(() => {
    const uncharged = this.unpaidTotalAmount();
    const pendingCharges = this.payments()
      .filter((p) => p.status === 'PENDING' || p.status === 'AUTHORIZED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return uncharged + pendingCharges;
  });

  readonly settledCount = computed(
    () => this.payments().filter((p) => this.isSettledStatus(p.status)).length
  );

  readonly pendingChargesCount = computed(
    () => this.payments().filter((p) => p.status === 'PENDING' || p.status === 'AUTHORIZED').length
  );

  readonly failedCount = computed(
    () => this.payments().filter((p) => p.status === 'FAILED' || p.status === 'PAYOUT_FAILED').length
  );

  private isSettledStatus(status?: string): boolean {
    const s = (status || '').toUpperCase();
    return s === 'SUCCEEDED' || s === 'CAPTURED' || s === 'PAYOUT_ELIGIBLE' || s === 'PAYOUT_RELEASED' || s === 'PAID';
  }

  readonly vehicleMap = computed(() => {
    const map = new Map<number, Vehicle>();
    for (const v of this.myVehicles()) {
      map.set(v.id, v);
    }
    return map;
  });

  readonly filteredPayments = computed(() => {
    let list = this.payments();
    const filter = this.statusFilter();
    const q = this.searchQuery.trim().toLowerCase();

    if (filter === 'SUCCEEDED') {
      list = list.filter((p) => this.isSettledStatus(p.status));
    } else if (filter === 'PENDING') {
      list = list.filter((p) => p.status === 'PENDING' || p.status === 'AUTHORIZED');
    } else if (filter === 'FAILED') {
      list = list.filter((p) => p.status === 'FAILED' || p.status === 'PAYOUT_FAILED');
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.id?.toString().includes(q) ||
          p.bookingId?.toString().includes(q) ||
          p.providerReference?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q) ||
          p.status?.toLowerCase().includes(q)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 3) {
        this.loading.set(false);
      }
    };

    this.paymentService.listMine(0, 100).subscribe({
      next: (list) => {
        this.payments.set(list || []);
        checkDone();
      },
      error: () => {
        checkDone();
        this.error.set('Failed to load corporate payment records from server.');
      },
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

  loadPayments(): void {
    this.loadData();
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

  // Pay Now modal handlers
  openPayModal(booking: Booking): void {
    this.payTargetBooking.set(booking);
    this.paymentMethodToken = 'tok_corp_visa';
  }

  closePayModal(): void {
    this.payTargetBooking.set(null);
  }

  confirmPay(): void {
    const booking = this.payTargetBooking();
    if (!booking) return;

    this.paying.set(true);
    this.paymentService.charge(booking.id, this.paymentMethodToken).subscribe({
      next: (pmt) => {
        this.paying.set(false);
        this.closePayModal();
        this.showToast(`Payment of $${booking.totalAmount.toFixed(2)} authorized successfully for Booking #${booking.id}. Official tax invoice generated.`, 'success');
        this.loadData();
      },
      error: (err) => {
        this.paying.set(false);
        const msg = err?.error?.message || 'Payment authorization failed with payment provider.';
        this.showToast(msg, 'error');
      },
    });
  }

  // Retry modal handlers
  openRetry(payment: Payment): void {
    this.retryPaymentTarget.set(payment);
  }

  closeRetry(): void {
    this.retryPaymentTarget.set(null);
  }

  confirmRetry(): void {
    const p = this.retryPaymentTarget();
    if (!p) return;

    this.retrying.set(true);
    this.paymentService.retryPayment(p.id, p.bookingId, this.retryPaymentToken).subscribe({
      next: () => {
        this.retrying.set(false);
        this.retryPaymentTarget.set(null);
        this.showToast(`Payment #${p.id} successfully processed.`, 'success');
        this.loadData();
      },
      error: (err) => {
        this.retrying.set(false);
        const msg = err?.error?.message || 'Payment retry failed with payment provider.';
        this.showToast(msg, 'error');
      },
    });
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ text, type });
    setTimeout(() => this.toast.set(null), 5000);
  }
}
