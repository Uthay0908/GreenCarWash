import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Payment, Refund } from '../../../shared/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

type Tab = 'payments' | 'refund-requests';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, PaginationComponent],
  templateUrl: './admin-payments.html',
  styleUrl: './admin-payments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPayments implements OnInit {
  readonly currentTab = signal<Tab>('payments');
  readonly payments = signal<Payment[]>([]);
  readonly refunds = signal<Refund[]>([]);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Pagination for Payments tab
  readonly paymentsPage = signal<number>(0);
  readonly paymentsPageSize = signal<number>(10);
  readonly paymentsTotal = signal<number>(0);

  // Pagination for Refunds tab
  readonly refundsPage = signal<number>(0);
  readonly refundsPageSize = signal<number>(10);
  readonly refundsTotal = signal<number>(0);

  // Search filter
  searchBookingId: number | null = null;

  // Issue Direct Refund Modal
  readonly showRefundModal = signal<boolean>(false);
  refundPaymentId: number | null = null;
  refundAmount: number | null = null;
  refundReason = '';

  // Reject Refund Modal
  readonly showRejectModal = signal<boolean>(false);
  selectedRefundId: number | null = null;
  rejectReason = '';

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadRefunds();
  }

  setTab(tab: Tab): void {
    this.currentTab.set(tab);
    if (tab === 'payments') {
      this.loadPayments();
    } else {
      this.loadRefunds();
    }
  }

  loadPayments(): void {
    this.loading.set(true);
    this.admin.listAllPayments(this.paymentsPage(), this.paymentsPageSize()).subscribe({
      next: (page) => {
        this.payments.set(page.content || []);
        this.paymentsTotal.set(page.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.payments.set([]);
      },
    });
  }

  onPaymentsPageChange(page: number): void {
    this.paymentsPage.set(page);
    this.loadPayments();
  }

  onPaymentsPageSizeChange(size: number): void {
    this.paymentsPageSize.set(size);
    this.paymentsPage.set(0);
    this.loadPayments();
  }

  loadRefunds(): void {
    this.loading.set(true);
    if (this.searchBookingId) {
      this.admin.listRefundsForBooking(this.searchBookingId).subscribe({
        next: (list) => {
          this.refunds.set(list || []);
          this.refundsTotal.set(list?.length || 0);
          this.loading.set(false);
        },
        error: () => {
          this.refunds.set([]);
          this.loading.set(false);
        }
      });
      return;
    }

    this.admin.listAllRefunds(this.refundsPage(), this.refundsPageSize()).subscribe({
      next: (page) => {
        this.refunds.set(page.content || []);
        this.refundsTotal.set(page.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.refunds.set([]);
        this.loading.set(false);
      },
    });
  }

  onRefundsPageChange(page: number): void {
    this.refundsPage.set(page);
    this.loadRefunds();
  }

  onRefundsPageSizeChange(size: number): void {
    this.refundsPageSize.set(size);
    this.refundsPage.set(0);
    this.loadRefunds();
  }

  searchRefunds(): void {
    this.refundsPage.set(0);
    this.loadRefunds();
  }

  clearRefundSearch(): void {
    this.searchBookingId = null;
    this.refundsPage.set(0);
    this.loadRefunds();
  }

  openRefundModal(payment: Payment): void {
    this.refundPaymentId = payment.id;
    this.refundAmount = payment.amount;
    this.refundReason = '';
    this.showRefundModal.set(true);
  }

  closeRefundModal(): void {
    this.showRefundModal.set(false);
    this.refundPaymentId = null;
  }

  submitDirectRefund(): void {
    if (!this.refundPaymentId || !this.refundReason.trim()) {
      this.showToast('Please provide a reason for the refund.');
      return;
    }

    this.admin.immediateRefund(this.refundPaymentId, {
      amount: this.refundAmount ?? undefined,
      reason: this.refundReason.trim(),
    }).subscribe({
      next: () => {
        this.showToast(`Refund processed successfully for payment #${this.refundPaymentId}`);
        this.closeRefundModal();
        this.loadPayments();
        this.loadRefunds();
      },
      error: () => this.showToast('Refund failed. Check payment gateway.'),
    });
  }

  approveRefund(refund: Refund): void {
    if (!confirm(`Approve refund #${refund.id} of $${refund.amount.toFixed(2)} for Booking #${refund.bookingId}?`)) return;

    this.admin.approveRefund(refund.id).subscribe({
      next: () => {
        this.showToast(`Refund #${refund.id} approved successfully.`);
        this.loadRefunds();
        this.loadPayments();
      },
      error: (err) => this.showToast('Failed to approve refund: ' + (err?.error?.message || err?.message || 'Error')),
    });
  }

  openRejectModal(refund: Refund): void {
    this.selectedRefundId = refund.id;
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.selectedRefundId = null;
  }

  submitRejectRefund(): void {
    if (!this.selectedRefundId) return;

    this.admin.rejectRefund(this.selectedRefundId, this.rejectReason).subscribe({
      next: () => {
        this.showToast(`Refund #${this.selectedRefundId} rejected.`);
        this.closeRejectModal();
        this.loadRefunds();
      },
      error: (err) => this.showToast('Failed to reject refund: ' + (err?.error?.message || err?.message || 'Error')),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
