import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Booking, ServiceArea } from '../../../shared/models';

export interface AreaItem {
  name: string;
  volume: number;
}

export interface RecentBooking {
  id: string;
  customerName: string;
  vehicle: string;
  service: string;
  status: string;
  statusClass: string;
  amount: number;
}

export interface ServiceBreakdownItem {
  name: string;
  count: number;
  pct: number;
  colorClass: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  // Timeframe selector
  selectedTimeframe = 'Last 7 Days';
  dateRangeLabel = 'Current Real-time Overview';

  // 4 Main KPI Cards
  readonly customerCount = signal<number>(0);
  readonly washerCount = signal<number>(0);
  readonly bookingCount = signal<number>(0);
  readonly revenueAmount = signal<number>(0);
  readonly waterSavedAmount = signal<number>(0);
  readonly pendingKycCount = signal<number>(0);
  readonly fleetCount = signal<number>(0);
  readonly vehicleCount = signal<number>(0);

  // Status Breakdown (computed dynamically from backend)
  readonly completedCount = signal<number>(0);
  readonly completedPct = signal<number>(0);
  readonly inProgressCount = signal<number>(0);
  readonly inProgressPct = signal<number>(0);
  readonly pendingCount = signal<number>(0);
  readonly pendingPct = signal<number>(0);
  readonly cancelledCount = signal<number>(0);
  readonly cancelledPct = signal<number>(0);

  // Bookings Trend (dynamically calculated from real booking records)
  readonly trendDays = signal<{ day: string; count: number; heightPercent: number }[]>([]);

  // Real Service Areas from assignment-service
  readonly serviceAreas = signal<AreaItem[]>([]);

  // Real Service / Package breakdown
  readonly serviceBreakdown = signal<ServiceBreakdownItem[]>([]);

  // Recent Real Bookings
  readonly recentBookings = signal<RecentBooking[]>([]);
  readonly loading = signal<boolean>(false);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.refreshLiveMetrics();
  }

  onTimeframeChange(timeframe: string): void {
    this.selectedTimeframe = timeframe;
    this.refreshLiveMetrics();
  }

  private getDateRange(): { from?: string; to?: string; label: string } {
    const now = new Date();
    const to = now.toISOString();

    switch (this.selectedTimeframe) {
      case 'Today': {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { from: start.toISOString(), to, label: 'Today (Real-time)' };
      }
      case 'Last 7 Days': {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { from: start.toISOString(), to, label: 'Past 7 Days' };
      }
      case 'Last 30 Days': {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { from: start.toISOString(), to, label: 'Past 30 Days' };
      }
      case 'This Month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { from: start.toISOString(), to, label: 'Current Month' };
      }
      case 'All Time':
      default:
        return { from: undefined, to: undefined, label: 'All Time Historical' };
    }
  }

  refreshLiveMetrics(): void {
    this.loading.set(true);
    const { from, to, label } = this.getDateRange();
    this.dateRangeLabel = label;

    // 1. Live Customers count from user-service
    this.admin.listCustomers('', 0, 1).subscribe({
      next: (page) => {
        if (page && page.totalElements != null) {
          this.customerCount.set(page.totalElements);
        }
      },
      error: () => {},
    });

    // 2. Live Washers (active & pending KYC) from washer-service
    this.admin.listWashers('APPROVED', 0, 1).subscribe({
      next: (page) => {
        if (page && page.totalElements != null) {
          this.washerCount.set(page.totalElements);
        }
      },
      error: () => {},
    });

    this.admin.listWashers('PENDING', 0, 1).subscribe({
      next: (page) => {
        if (page && page.totalElements != null) {
          this.pendingKycCount.set(page.totalElements);
        }
      },
      error: () => {},
    });

    // 3. Live Vehicles count from vehicle-service
    this.admin.listVehicles('', 0, 1).subscribe({
      next: (page) => {
        if (page && page.totalElements != null) {
          this.vehicleCount.set(page.totalElements);
        }
      },
      error: () => {},
    });

    // 4. Live Corporate Organizations count from corporate-service
    this.admin.listAllOrganizations(0, 1).subscribe({
      next: (page) => {
        if (page && page.totalElements != null) {
          this.fleetCount.set(page.totalElements);
        }
      },
      error: () => {},
    });

    // 5. Aggregate Dashboard & Analytics from reporting-service
    this.admin.getDashboardStats(from, to).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res && res.revenue) {
          const rev = res.revenue.totalRevenue ?? res.revenue.netRevenue ?? 0;
          this.revenueAmount.set(Math.round(rev));
        }
        if (res && res.waterSaved) {
          this.waterSavedAmount.set(Math.round(res.waterSaved.totalWaterSaved ?? 0));
        }
        if (res && res.advanced && res.advanced.ordersByStatus) {
          const orders = res.advanced.ordersByStatus;
          const completed = Number(orders['COMPLETED'] || 0);
          const inProgress = Number(orders['IN_PROGRESS'] || orders['ACCEPTED'] || 0);
          const created = Number(orders['CREATED'] || 0) + Number(orders['ASSIGNED'] || 0) + Number(orders['PENDING'] || 0);
          const cancelled = Number(orders['CANCELLED'] || 0);
          const total = completed + inProgress + created + cancelled;

          this.completedCount.set(completed);
          this.inProgressCount.set(inProgress);
          this.pendingCount.set(created);
          this.cancelledCount.set(cancelled);

          if (total > 0) {
            this.completedPct.set(Math.round((completed / total) * 100));
            this.inProgressPct.set(Math.round((inProgress / total) * 100));
            this.pendingPct.set(Math.round((created / total) * 100));
            this.cancelledPct.set(Math.round((cancelled / total) * 100));
          } else {
            this.completedPct.set(0);
            this.inProgressPct.set(0);
            this.pendingPct.set(0);
            this.cancelledPct.set(0);
          }
        }
      },
      error: () => {
        this.loading.set(false);
        this.revenueAmount.set(0);
      },
    });

    // 6. Real Bookings for Trend Chart, Service Breakdown, and Recent Table
    this.admin.listBookings(undefined, 0, 100).subscribe({
      next: (page) => {
        if (page && page.totalElements != null) {
          this.bookingCount.set(page.totalElements);
        }
        const bookings: Booking[] = page?.content || [];
        this.computeBookingTrend(bookings);
        this.computeServiceBreakdown(bookings);
        this.populateRecentBookings(bookings.slice(0, 6));
      },
      error: () => {},
    });

    // 7. Real Service Areas from assignment-service
    this.admin.listServiceAreas().subscribe({
      next: (res) => {
        const list = res?.content || [];
        if (list.length > 0) {
          const mapped: AreaItem[] = list.map((a: ServiceArea) => ({
            name: `${a.name} (${a.city})`,
            volume: a.active ? 1 : 0,
          }));
          this.serviceAreas.set(mapped);
        } else {
          this.serviceAreas.set([]);
        }
      },
      error: () => {
        this.serviceAreas.set([]);
      },
    });
  }

  private computeBookingTrend(bookings: Booking[]): void {
    // Generate buckets for last 7 days of real calendar
    const daysMap: { [key: string]: number } = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysList: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = dayNames[d.getDay()];
      daysList.push(dayLabel);
      daysMap[dayLabel] = 0;
    }

    // Filter bookings matching the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    bookings.forEach((b) => {
      if (b.createdAt) {
        const bDate = new Date(b.createdAt);
        if (bDate >= sevenDaysAgo) {
          const dayLabel = dayNames[bDate.getDay()];
          if (daysMap[dayLabel] !== undefined) {
            daysMap[dayLabel]++;
          }
        }
      }
    });

    let maxCount = Math.max(...Object.values(daysMap), 1);
    const trend = daysList.map((day) => {
      const count = daysMap[day] || 0;
      const heightPercent = maxCount > 0 && count > 0 ? Math.round((count / maxCount) * 100) : 8;
      return { day, count, heightPercent };
    });

    this.trendDays.set(trend);
  }

  private computeServiceBreakdown(bookings: Booking[]): void {
    if (bookings.length === 0) {
      this.serviceBreakdown.set([]);
      return;
    }

    const packageNames: { [id: number]: string } = {
      1: 'Eco Express Shine',
      2: 'Premium Ceramic Steam',
      3: 'Deep Interior & Exterior Detox',
    };
    const packageColors: { [id: number]: string } = {
      1: 'basic-dot',
      2: 'premium-dot',
      3: 'deluxe-dot',
    };

    const countByPackage: { [id: number]: number } = {};
    bookings.forEach((b) => {
      const pId = b.packageId || 1;
      countByPackage[pId] = (countByPackage[pId] || 0) + 1;
    });

    const total = bookings.length;
    const items: ServiceBreakdownItem[] = Object.keys(countByPackage).map((idStr) => {
      const pId = Number(idStr);
      const count = countByPackage[pId];
      const pct = Math.round((count / total) * 100);
      return {
        name: packageNames[pId] || `Package #${pId}`,
        count,
        pct,
        colorClass: packageColors[pId] || 'basic-dot',
      };
    });

    this.serviceBreakdown.set(items);
  }

  private populateRecentBookings(bookings: Booking[]): void {
    const packageNames: { [id: number]: string } = {
      1: 'Eco Express Shine',
      2: 'Premium Ceramic Steam',
      3: 'Deep Interior & Exterior Detox',
    };

    const mapped: RecentBooking[] = bookings.map((b) => {
      const isCompleted = b.status === 'COMPLETED';
      const isInProgress = b.status === 'IN_PROGRESS' || b.status === 'ACCEPTED';
      const isCancelled = b.status === 'CANCELLED' || b.status === 'REFUNDED';

      let statusDisplay: string = b.status;
      let statusClass = 'status-pending';

      if (isCompleted) {
        statusDisplay = 'Completed';
        statusClass = 'status-completed';
      } else if (isInProgress) {
        statusDisplay = 'In Progress';
        statusClass = 'status-inprogress';
      } else if (isCancelled) {
        statusDisplay = b.status === 'REFUNDED' ? 'Refunded' : 'Cancelled';
        statusClass = 'status-cancelled';
      } else {
        statusDisplay = 'Pending';
        statusClass = 'status-pending';
      }

      return {
        id: `#GCW${b.id}`,
        customerName: `Customer #${b.customerId}`,
        vehicle: `Vehicle #${b.vehicleId}`,
        service: packageNames[b.packageId] || `Package #${b.packageId}`,
        status: statusDisplay,
        statusClass,
        amount: b.totalAmount || b.packagePrice || 0,
      };
    });

    this.recentBookings.set(mapped);
  }
}
