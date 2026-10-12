import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CorporateService } from '../../../core/services/corporate.service';
import { AuthService } from '../../../core/services/auth.service';
import { InvoiceService } from '../../../core/services/invoice.service';
import { NotificationService, NotificationItem } from '../../../core/services/notification.service';
import { SupportService } from '../../../core/services/support.service';
import {
  FleetBookingRequestSummary,
  Invoice,
  Organization,
  OrganizationLocation,
  OrganizationMember,
  OrganizationVehicle,
  RecurringFleetSchedule,
  SupportTicket,
} from '../../../shared/models';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './org-dashboard.html',
  styleUrl: './org-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgDashboard implements OnInit {
  private readonly corporate = inject(CorporateService);
  private readonly auth = inject(AuthService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly notificationService = inject(NotificationService);
  private readonly supportService = inject(SupportService);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly currentUser = this.auth.currentUser;
  readonly organization = this.corporate.activeOrganization;
  readonly corporateRole = this.corporate.corporateRole;

  readonly vehicles = signal<OrganizationVehicle[]>([]);
  readonly locations = signal<OrganizationLocation[]>([]);
  readonly members = signal<OrganizationMember[]>([]);
  readonly fleetBookings = signal<FleetBookingRequestSummary[]>([]);
  readonly recurringSchedules = signal<RecurringFleetSchedule[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly tickets = signal<SupportTicket[]>([]);

  // 100% Dynamic Computed Metrics strictly from backend data
  readonly totalVehicles = computed(() => this.vehicles().length);
  readonly totalLocations = computed(() => this.locations().length);
  readonly totalMembers = computed(() => this.members().length);
  readonly totalBulkBookings = computed(() => this.fleetBookings().length);

  readonly executedBookingsCount = computed(
    () => this.fleetBookings().filter((b) => b.status === 'COMPLETED' || (b.status as string) === 'EXECUTED').length
  );
  readonly pendingBookingsCount = computed(
    () => this.fleetBookings().filter((b) => b.status === 'PENDING' || b.status === 'PENDING_AUTHORIZATION').length
  );

  readonly activeSchedulesCount = computed(
    () => this.recurringSchedules().filter((s) => s.active).length
  );

  readonly totalSpend = computed(() =>
    this.invoices().reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  );

  readonly totalRefunded = computed(() =>
    this.invoices().reduce((sum, inv) => sum + (inv.refundedAmount || 0), 0)
  );

  readonly openTicketsCount = computed(
    () => this.tickets().filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  );

  readonly recentBookings = computed(() => this.fleetBookings().slice(0, 5));
  readonly recentNotifications = computed(() => this.notifications().slice(0, 4));

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        if (!org) {
          this.loading.set(false);
          return;
        }
        this.fetchOrgMetrics(org.id);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load corporate organization profile from server.');
      },
    });
  }

  private fetchOrgMetrics(orgId: number): void {
    let completedRequests = 0;
    const totalRequests = 7;
    const checkCompletion = () => {
      completedRequests++;
      if (completedRequests >= totalRequests) {
        this.loading.set(false);
      }
    };

    this.corporate.listVehicles(orgId).subscribe({
      next: (v) => {
        this.vehicles.set(v || []);
        checkCompletion();
      },
      error: () => checkCompletion(),
    });

    this.corporate.listLocations(orgId).subscribe({
      next: (locs) => {
        this.locations.set(locs || []);
        checkCompletion();
      },
      error: () => checkCompletion(),
    });

    this.corporate.listMembers(orgId).subscribe({
      next: (m) => {
        this.members.set(m || []);
        checkCompletion();
      },
      error: () => checkCompletion(),
    });

    this.corporate.listFleetBookings(orgId).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : res?.content || [];
        this.fleetBookings.set(list);
        checkCompletion();
      },
      error: () => checkCompletion(),
    });

    this.corporate.listRecurringSchedules(orgId).subscribe({
      next: (s) => {
        this.recurringSchedules.set(s || []);
        checkCompletion();
      },
      error: () => checkCompletion(),
    });

    this.invoiceService.listMine().subscribe({
      next: (invs) => {
        this.invoices.set(invs || []);
        checkCompletion();
      },
      error: () => checkCompletion(),
    });

    this.notificationService.listMine(0, 5).subscribe({
      next: (notifs) => {
        this.notifications.set(notifs || []);
        checkCompletion();
      },
      error: () => checkCompletion(),
    });

    this.supportService.listMyTickets(0, 10).subscribe({
      next: (t) => {
        this.tickets.set(t || []);
      },
      error: () => {},
    });
  }
}
