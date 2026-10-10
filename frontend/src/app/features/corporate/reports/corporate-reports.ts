import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { CorporateService } from '../../../core/services/corporate.service';
import { BookingService } from '../../../core/services/booking.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Booking, FleetBookingRequestSummary, Invoice, Organization, OrganizationVehicle, Payment } from '../../../shared/models';

export interface MonthlySpendStat {
  month: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-corporate-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  templateUrl: './corporate-reports.html',
  styleUrl: './corporate-reports.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateReports implements OnInit {
  private readonly corporate = inject(CorporateService);
  private readonly bookingService = inject(BookingService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly paymentService = inject(PaymentService);

  readonly organization = signal<Organization | null>(null);
  readonly vehicles = signal<OrganizationVehicle[]>([]);
  readonly fleetBookings = signal<FleetBookingRequestSummary[]>([]);
  readonly individualBookings = signal<Booking[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly payments = signal<Payment[]>([]);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // Dynamic Metrics computed strictly from live backend data
  readonly totalVehiclesCount = computed(() => this.vehicles().length);
  readonly totalBookingsCount = computed(() => this.individualBookings().length);

  readonly completedBookingsCount = computed(() =>
    this.individualBookings().filter((b) => b.status === 'COMPLETED').length
  );

  readonly inProgressBookingsCount = computed(() =>
    this.individualBookings().filter((b) =>
      ['PENDING', 'ASSIGNMENT_PENDING', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
    ).length
  );

  readonly cancelledBookingsCount = computed(() =>
    this.individualBookings().filter((b) => b.status === 'CANCELLED' || b.status === 'FAILED').length
  );

  readonly totalLifetimeSpend = computed(() =>
    this.invoices().reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  );

  readonly averageWashCost = computed(() => {
    const count = this.completedBookingsCount();
    if (count === 0) return 0;
    return this.totalLifetimeSpend() / count;
  });

  readonly waterSavedLiters = computed(() => {
    // 150 liters saved per steam/waterless eco-wash compared to 200L traditional hose
    return this.completedBookingsCount() * 150;
  });

  // Dynamic Monthly Spending Breakdown
  readonly monthlySpendStats = computed<MonthlySpendStat[]>(() => {
    const invs = this.invoices();
    if (invs.length === 0) return [];

    const monthMap = new Map<string, { amount: number; count: number }>();
    for (const inv of invs) {
      const d = inv.issuedAt ? new Date(inv.issuedAt) : new Date();
      const monthKey = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const current = monthMap.get(monthKey) || { amount: 0, count: 0 };
      monthMap.set(monthKey, {
        amount: current.amount + (inv.totalAmount || 0),
        count: current.count + 1,
      });
    }

    const maxAmount = Math.max(...Array.from(monthMap.values()).map((v) => v.amount), 1);

    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      amount: data.amount,
      count: data.count,
      percentage: Math.round((data.amount / maxAmount) * 100),
    }));
  });

  // Dynamic Status Distribution Breakdown
  readonly statusDistribution = computed<StatusDistributionItem[]>(() => {
    const total = this.totalBookingsCount();
    if (total === 0) return [];

    const completed = this.completedBookingsCount();
    const active = this.inProgressBookingsCount();
    const cancelled = this.cancelledBookingsCount();

    return [
      {
        status: 'COMPLETED',
        label: 'Completed Services',
        count: completed,
        percentage: Math.round((completed / total) * 100),
        color: '#15803d',
      },
      {
        status: 'ACTIVE',
        label: 'Active & In-Progress',
        count: active,
        percentage: Math.round((active / total) * 100),
        color: '#0284c7',
      },
      {
        status: 'CANCELLED',
        label: 'Cancelled / Failed',
        count: cancelled,
        percentage: Math.round((cancelled / total) * 100),
        color: '#dc2626',
      },
    ];
  });

  ngOnInit(): void {
    this.loadAllReportData();
  }

  loadAllReportData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        if (!org) {
          this.loading.set(false);
          return;
        }
        this.fetchSubsystemData(org.id);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load corporate organization profile.');
      },
    });
  }

  private fetchSubsystemData(orgId: number): void {
    let completedRequests = 0;
    const total = 5;
    const checkDone = () => {
      completedRequests++;
      if (completedRequests >= total) {
        this.loading.set(false);
      }
    };

    this.corporate.listVehicles(orgId).subscribe({
      next: (v) => {
        this.vehicles.set(v || []);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.corporate.listFleetBookings(orgId).subscribe({
      next: (fb) => {
        this.fleetBookings.set(Array.isArray(fb) ? fb : fb?.content || []);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.bookingService.listMine().subscribe({
      next: (b) => {
        this.individualBookings.set(b || []);
        checkDone();
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

    this.paymentService.listMine().subscribe({
      next: (p) => {
        this.payments.set(p || []);
        checkDone();
      },
      error: () => checkDone(),
    });
  }
}
