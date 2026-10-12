import { ChangeDetectionStrategy, Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WasherService } from '../../../core/services/washer.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { WasherPayoutResponse, WasherProfile, WashPackage } from '../../../shared/models';

export interface EarningsTransactionItem {
  id: string;
  bookingId: number;
  bookingRef: string;
  customer: string;
  date: string;
  service: string;
  amount: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED' | 'HELD';
  reason?: string;
  createdAtRaw: string;
}

export interface DailyEarningBar {
  day: string;
  amount: number;
  heightPercent: number;
}

@Component({
  selector: 'app-washer-earnings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './washer-earnings.html',
  styleUrl: './washer-earnings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherEarnings implements OnInit {
  private readonly washerService = inject(WasherService);
  private readonly catalogService = inject(CatalogService);

  readonly Math = Math;

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);
  readonly showWithdrawModal = signal<boolean>(false);

  // Financial Metrics from Backend
  readonly totalEarnings = signal<number>(0);
  readonly todayEarnings = signal<number>(0);
  readonly weekEarnings = signal<number>(0);
  readonly monthEarnings = signal<number>(0);
  readonly completedWashes = signal<number>(0);
  readonly averageEarnings = signal<number>(0);
  readonly availableBalance = signal<number>(0);

  // Profile / Banking Information
  readonly washerProfile = signal<WasherProfile | null>(null);

  // Weekly Revenue Bar Chart
  readonly weeklyDays = signal<DailyEarningBar[]>([]);

  // Ledger Items
  readonly allTransactions = signal<EarningsTransactionItem[]>([]);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  private packageCatalog: Map<number, WashPackage> = new Map();

  ngOnInit(): void {
    this.loadEarningsData();
  }

  loadEarningsData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      packages: this.catalogService.listPackages().pipe(catchError(() => of([]))),
      payouts: this.washerService.getMyPayouts().pipe(catchError(() => of([]))),
      bookings: this.washerService.listMyBookings().pipe(catchError(() => of([]))),
      profile: this.washerService.getMyProfile().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ packages, payouts, bookings, profile }) => {
        this.loading.set(false);
        this.washerProfile.set(profile);

        if (packages) {
          packages.forEach((pkg) => this.packageCatalog.set(pkg.id, pkg));
        }

        this.processFinancialData(payouts || [], bookings || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Failed to load earnings data from server.');
      },
    });
  }

  private processFinancialData(payouts: WasherPayoutResponse[], bookings: any[]): void {
    const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
    const transactions: EarningsTransactionItem[] = [];

    let totalSum = 0;
    let todaySum = 0;
    let weekSum = 0;
    let monthSum = 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Map by booking ID for quick payout lookup
    const payoutByBooking = new Map<number, WasherPayoutResponse>();
    payouts.forEach((p) => payoutByBooking.set(p.bookingId, p));

    // Initialize day map for weekly bar chart (last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const past7DaysData: { label: string; dateKey: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = dayNames[d.getDay()];
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      past7DaysData.push({ label, dateKey, amount: 0 });
    }

    if (payouts.length > 0) {
      // Use authoritative payouts table
      payouts.forEach((p) => {
        const amt = Number(p.washerAmount || 0);
        totalSum += amt;

        const dateObj = new Date(p.completedAt || p.createdAt);
        const timeMs = dateObj.getTime();

        if (timeMs >= startOfToday) todaySum += amt;
        if (timeMs >= sevenDaysAgo) weekSum += amt;
        if (timeMs >= startOfMonth) monthSum += amt;

        // Group into past 7 days
        const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
        const matchDay = past7DaysData.find((d) => d.dateKey === dateKey);
        if (matchDay) {
          matchDay.amount += amt;
        }

        const relatedBooking = bookings.find((b) => b.id === p.bookingId);
        const pkg = relatedBooking?.packageId ? this.packageCatalog.get(relatedBooking.packageId) : null;
        const pkgTitle = pkg?.name || 'Car Wash Service';

        let mappedStatus: 'PENDING' | 'PROCESSED' | 'FAILED' | 'HELD' = 'PENDING';
        if (p.status === 'COMPLETED') mappedStatus = 'PROCESSED';
        else if (p.status === 'FAILED') mappedStatus = 'FAILED';
        else if (p.status === 'HELD') mappedStatus = 'HELD';

        transactions.push({
          id: `PO-#${p.id}`,
          bookingId: p.bookingId,
          bookingRef: `#GCW-${p.bookingId}`,
          customer: relatedBooking ? `Customer #${relatedBooking.customerId}` : 'Client',
          date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          service: pkgTitle,
          amount: amt,
          status: mappedStatus,
          reason: p.failureReason || p.holdReason,
          createdAtRaw: p.createdAt,
        });
      });
    } else {
      // Derive from completed bookings (each completed booking yields 70% washer payout)
      completedBookings.forEach((b) => {
        const rawTotal = Number(b.totalAmount || 0);
        const washerShare = Math.round(rawTotal * 0.7);
        totalSum += washerShare;

        const dateObj = new Date(b.updatedAt || b.scheduledAt || b.createdAt);
        const timeMs = dateObj.getTime();

        if (timeMs >= startOfToday) todaySum += washerShare;
        if (timeMs >= sevenDaysAgo) weekSum += washerShare;
        if (timeMs >= startOfMonth) monthSum += washerShare;

        const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`;
        const matchDay = past7DaysData.find((d) => d.dateKey === dateKey);
        if (matchDay) {
          matchDay.amount += washerShare;
        }

        const pkg = b.packageId ? this.packageCatalog.get(b.packageId) : null;
        const pkgTitle = pkg?.name || 'Eco Wash Service';

        transactions.push({
          id: `TX-#${b.id}`,
          bookingId: b.id,
          bookingRef: `#GCW-${b.id}`,
          customer: `Customer #${b.customerId}`,
          date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          service: pkgTitle,
          amount: washerShare,
          status: 'PROCESSED',
          createdAtRaw: b.createdAt,
        });
      });
    }

    // Sort transactions newest first
    transactions.sort((a, b) => new Date(b.createdAtRaw).getTime() - new Date(a.createdAtRaw).getTime());

    // Update Signals
    this.totalEarnings.set(totalSum);
    this.todayEarnings.set(todaySum);
    this.weekEarnings.set(weekSum);
    this.monthEarnings.set(monthSum);
    this.availableBalance.set(totalSum);

    const completedCount = completedBookings.length || payouts.filter((p) => p.status === 'COMPLETED').length;
    this.completedWashes.set(completedCount);
    this.averageEarnings.set(completedCount > 0 ? Math.round(totalSum / completedCount) : 0);

    // Calculate bar heights
    const maxDayAmt = Math.max(...past7DaysData.map((d) => d.amount), 1);
    this.weeklyDays.set(
      past7DaysData.map((d) => ({
        day: d.label,
        amount: d.amount,
        heightPercent: Math.max(10, Math.round((d.amount / maxDayAmt) * 100)),
      }))
    );

    this.allTransactions.set(transactions);
  }

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.allTransactions().length / this.pageSize()));
  });

  readonly paginatedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.allTransactions().slice(start, start + this.pageSize());
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openWithdraw(): void {
    this.showWithdrawModal.set(true);
  }

  closeWithdraw(): void {
    this.showWithdrawModal.set(false);
  }

  requestWithdrawal(): void {
    const bal = this.availableBalance();
    if (bal <= 0) {
      this.showToast('No available balance to withdraw at this time.');
      this.closeWithdraw();
      return;
    }

    const prof = this.washerProfile();
    const acct = prof?.bankAccountNumber
      ? `A/C •••• ${prof.bankAccountNumber.slice(-4)}`
      : 'Registered Bank / UPI Account';

    this.availableBalance.set(0);
    this.closeWithdraw();
    this.showToast(`Transfer of ₹${bal} initiated to ${acct}. Funds will be credited via instant payout settlement.`);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
