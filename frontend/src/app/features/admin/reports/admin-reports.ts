import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import {
  CustomerLeaderboardEntry,
  OrderReportEntry,
  RevenueSummary,
  SustainabilitySummary,
  WaterSavingSummary,
} from '../../../shared/models';

type ReportTab = 'financial' | 'orders-export' | 'sustainability' | 'leaderboard';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReports implements OnInit {
  readonly currentTab = signal<ReportTab>('financial');

  readonly revenue = signal<RevenueSummary | null>(null);
  readonly waterSavings = signal<WaterSavingSummary | null>(null);
  readonly sustainability = signal<SustainabilitySummary | null>(null);
  readonly waterLeaderboard = signal<CustomerLeaderboardEntry[]>([]);
  readonly orders = signal<OrderReportEntry[]>([]);

  waterUnit: 'LITERS' | 'GALLONS' = 'LITERS';
  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadAllReports();
  }

  setTab(tab: ReportTab): void {
    this.currentTab.set(tab);
  }

  loadAllReports(): void {
    this.admin.getRevenueSummary().subscribe({
      next: (r) => this.revenue.set(r),
      error: () => this.revenue.set(null),
    });
    this.admin.getWaterSavedSummary(this.waterUnit).subscribe({
      next: (w) => this.waterSavings.set(w),
      error: () => this.waterSavings.set(null),
    });
    this.admin.getSustainabilitySummary().subscribe({
      next: (s) => this.sustainability.set(s),
      error: () => this.sustainability.set(null),
    });
    this.admin.getCustomerLeaderboard().subscribe({
      next: (lb) => this.waterLeaderboard.set(lb),
      error: () => this.waterLeaderboard.set([]),
    });
    this.admin.listReportOrders().subscribe({
      next: (page) => this.orders.set(page.content || []),
      error: () => this.orders.set([]),
    });
  }

  changeWaterUnit(unit: 'LITERS' | 'GALLONS'): void {
    this.waterUnit = unit;
    this.admin.getWaterSavedSummary(unit).subscribe((w) => this.waterSavings.set(w));
  }

  downloadCsv(): void {
    this.admin.exportOrdersCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `greencarwash-orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showToast('CSV report export downloaded successfully.');
      },
      error: () => this.showToast('Export failed. Check gateway permissions.'),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
