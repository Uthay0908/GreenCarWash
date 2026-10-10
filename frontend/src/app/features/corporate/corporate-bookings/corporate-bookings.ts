import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorporateService } from '../../../core/services/corporate.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import {
  AddOn,
  FleetBookingRequestSummary,
  FleetScheduleFrequency,
  Organization,
  OrganizationLocation,
  OrganizationVehicle,
  RecurringFleetSchedule,
  Vehicle,
  WashPackage,
} from '../../../shared/models';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-corporate-bookings',
  standalone: true,
  imports: [CommonModule, StatusBadge, DatePipe, FormsModule, RouterLink],
  templateUrl: './corporate-bookings.html',
  styleUrl: './corporate-bookings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateBookings implements OnInit {
  private readonly corporate = inject(CorporateService);
  private readonly catalog = inject(CatalogService);
  private readonly vehicleService = inject(VehicleService);

  readonly activeTab = signal<'BULK' | 'RECURRING'>('BULK');
  readonly statusFilter = signal<string>('ALL');

  readonly organization = signal<Organization | null>(null);
  readonly fleetBookings = signal<FleetBookingRequestSummary[]>([]);
  readonly recurringSchedules = signal<RecurringFleetSchedule[]>([]);
  readonly fleetVehicles = signal<OrganizationVehicle[]>([]);
  readonly myVehicles = signal<Vehicle[]>([]);
  readonly locations = signal<OrganizationLocation[]>([]);
  readonly packages = signal<WashPackage[]>([]);
  readonly addOns = signal<AddOn[]>([]);

  readonly vehicleMap = computed(() => {
    const map = new Map<number, Vehicle>();
    for (const v of this.myVehicles()) {
      map.set(v.id, v);
    }
    return map;
  });

  readonly loading = signal<boolean>(true);
  readonly toastMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Bulk Booking Modal
  readonly showBulkModal = signal<boolean>(false);
  readonly submittingBulk = signal<boolean>(false);
  bulkLocationId: number | null = null;
  bulkPackageId: number | null = null;
  bulkSelectedVehicleIds = signal<number[]>([]);
  bulkSelectedAddOnIds = signal<number[]>([]);
  bulkScheduledDate = '';
  bulkScheduledTime = '09:00';

  // Recurring Schedule Modal
  readonly showRecurringModal = signal<boolean>(false);
  readonly submittingRecurring = signal<boolean>(false);
  recLocationId: number | null = null;
  recPackageId: number | null = null;
  recSelectedVehicleIds = signal<number[]>([]);
  recSelectedAddOnIds = signal<number[]>([]);
  recFrequency: FleetScheduleFrequency = 'WEEKLY';
  recDaysOfWeek = signal<number[]>([1]); // Monday default (1 = Mon ... 7 = Sun)
  recTimeOfDay = '09:00:00';
  recStartDate = '';
  recEndDate = '';

  // Booking Detail Modal
  readonly selectedBookingDetail = signal<FleetBookingRequestSummary | null>(null);
  readonly loadingDetail = signal<boolean>(false);

  // Confirmation states
  readonly confirmCancelBookingId = signal<number | null>(null);
  readonly confirmDeleteScheduleId = signal<number | null>(null);

  // Filtered Bookings
  readonly filteredBookings = computed(() => {
    const filter = this.statusFilter();
    const list = this.fleetBookings();
    if (filter === 'ALL') return list;
    return list.filter((b) => b.status === filter);
  });

  // Package Map for quick name lookup
  readonly packageMap = computed(() => {
    const map = new Map<number, WashPackage>();
    for (const p of this.packages()) {
      map.set(p.id, p);
    }
    return map;
  });

  // Location Map for quick label lookup
  readonly locationMap = computed(() => {
    const map = new Map<number, OrganizationLocation>();
    for (const l of this.locations()) {
      map.set(l.id, l);
    }
    return map;
  });

  readonly daysList = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
  ];

  ngOnInit(): void {
    // Set tomorrow as default scheduled date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.bulkScheduledDate = tomorrow.toISOString().split('T')[0];
    this.recStartDate = tomorrow.toISOString().split('T')[0];

    this.loadData();
    this.loadCatalog();
  }

  setTab(tab: 'BULK' | 'RECURRING'): void {
    this.activeTab.set(tab);
  }

  setStatusFilter(filter: string): void {
    this.statusFilter.set(filter);
  }

  loadData(): void {
    this.loading.set(true);
    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        if (org) {
          this.loadOrgBookingsAndFleet(org.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false),
    });

    this.vehicleService.list().subscribe({
      next: (v) => this.myVehicles.set(v || []),
      error: () => this.myVehicles.set([]),
    });
  }

  getVehicleTitle(v: OrganizationVehicle): string {
    const match = this.vehicleMap().get(v.vehicleId);
    if (match) {
      return `${match.make} ${match.model} (${match.licensePlate})`;
    }
    return v.label || `Vehicle #${v.vehicleId}`;
  }

  getVehicleSubtitle(v: OrganizationVehicle): string {
    const match = this.vehicleMap().get(v.vehicleId);
    const type = match?.vehicleType || 'SEDAN';
    if (v.label) {
      return `${v.label} • Ref #${v.vehicleId} • ${type}`;
    }
    return `Ref #${v.vehicleId} • ${type}`;
  }

  private loadOrgBookingsAndFleet(orgId: number): void {
    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 4) this.loading.set(false);
    };

    this.corporate.listFleetBookings(orgId).subscribe({
      next: (b) => {
        const list = Array.isArray(b) ? b : (b?.content || []);
        this.fleetBookings.set(list);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.corporate.listRecurringSchedules(orgId).subscribe({
      next: (s) => {
        this.recurringSchedules.set(s || []);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.corporate.listVehicles(orgId).subscribe({
      next: (v) => {
        this.fleetVehicles.set(v || []);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.corporate.listLocations(orgId).subscribe({
      next: (locs) => {
        this.locations.set(locs || []);
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  private loadCatalog(): void {
    this.catalog.listPackages().subscribe({
      next: (pkgs) => {
        this.packages.set(pkgs || []);
        if (pkgs && pkgs.length > 0) {
          this.bulkPackageId = pkgs[0].id;
          this.recPackageId = pkgs[0].id;
        }
      },
      error: () => {},
    });

    this.catalog.listAddOns().subscribe({
      next: (addons) => this.addOns.set(addons || []),
      error: () => {},
    });
  }

  // Bulk Booking Modal Actions
  openBulkModal(): void {
    const locs = this.locations();
    this.bulkLocationId = locs.length > 0 ? locs[0].id : null;
    const pkgs = this.packages();
    this.bulkPackageId = pkgs.length > 0 ? pkgs[0].id : null;
    // Pre-select all fleet vehicles by default for convenience
    this.bulkSelectedVehicleIds.set(this.fleetVehicles().map((v) => v.vehicleId));
    this.bulkSelectedAddOnIds.set([]);
    this.showBulkModal.set(true);
  }

  closeBulkModal(): void {
    this.showBulkModal.set(false);
  }

  toggleBulkVehSelection(vehId: number): void {
    this.bulkSelectedVehicleIds.update((current) => {
      if (current.includes(vehId)) {
        return current.filter((id) => id !== vehId);
      } else {
        return [...current, vehId];
      }
    });
  }

  toggleAllBulkVehicles(): void {
    const all = this.fleetVehicles().map((v) => v.vehicleId);
    if (this.bulkSelectedVehicleIds().length === all.length) {
      this.bulkSelectedVehicleIds.set([]);
    } else {
      this.bulkSelectedVehicleIds.set(all);
    }
  }

  toggleBulkAddOn(addOnId: number): void {
    this.bulkSelectedAddOnIds.update((current) => {
      if (current.includes(addOnId)) {
        return current.filter((id) => id !== addOnId);
      } else {
        return [...current, addOnId];
      }
    });
  }

  submitBulkBooking(): void {
    const org = this.organization();
    if (!org) return;

    if (!this.bulkLocationId || !this.bulkPackageId || this.bulkSelectedVehicleIds().length === 0) {
      this.showToast('Please select a location, package, and at least one vehicle.', 'error');
      return;
    }

    const scheduledDateTime = new Date(`${this.bulkScheduledDate}T${this.bulkScheduledTime}:00`).toISOString();

    this.submittingBulk.set(true);
    const payload = {
      locationId: this.bulkLocationId,
      packageId: this.bulkPackageId,
      addOnIds: this.bulkSelectedAddOnIds(),
      vehicleIds: this.bulkSelectedVehicleIds(),
      scheduledAt: scheduledDateTime,
    };

    this.corporate.createBulkBooking(org.id, payload).subscribe({
      next: () => {
        this.submittingBulk.set(false);
        this.closeBulkModal();
        this.showToast('Bulk fleet booking created and executed successfully!', 'success');
        this.loadOrgBookingsAndFleet(org.id);
      },
      error: (err) => {
        this.submittingBulk.set(false);
        const msg = err?.error?.message || 'Failed to create bulk fleet booking.';
        this.showToast(msg, 'error');
      },
    });
  }

  // Cancel Bulk Booking
  requestCancelBooking(id: number): void {
    this.confirmCancelBookingId.set(id);
  }

  cancelCancelBooking(): void {
    this.confirmCancelBookingId.set(null);
  }

  confirmCancelBooking(id: number): void {
    const org = this.organization();
    if (!org) return;

    this.corporate.cancelBulkBooking(org.id, id).subscribe({
      next: () => {
        this.confirmCancelBookingId.set(null);
        this.showToast('Bulk fleet booking request cancelled.', 'success');
        this.loadOrgBookingsAndFleet(org.id);
      },
      error: (err) => {
        this.confirmCancelBookingId.set(null);
        const msg = err?.error?.message || 'Failed to cancel booking.';
        this.showToast(msg, 'error');
      },
    });
  }

  // Execute Pending Booking
  executeBooking(id: number): void {
    const org = this.organization();
    if (!org) return;

    this.corporate.executeBulkBooking(org.id, id).subscribe({
      next: () => {
        this.showToast('Booking request submitted for washer assignment.', 'success');
        this.loadOrgBookingsAndFleet(org.id);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Execution failed.';
        this.showToast(msg, 'error');
      },
    });
  }

  // Detail Modal
  openBookingDetail(bookingId: number): void {
    const org = this.organization();
    if (!org) return;

    this.loadingDetail.set(true);
    this.corporate.getBulkBookingDetail(org.id, bookingId).subscribe({
      next: (detail) => {
        this.loadingDetail.set(false);
        this.selectedBookingDetail.set(detail);
      },
      error: () => {
        this.loadingDetail.set(false);
        this.showToast('Unable to fetch detailed booking status.', 'error');
      },
    });
  }

  closeBookingDetail(): void {
    this.selectedBookingDetail.set(null);
  }

  // Recurring Schedule Modal Actions
  openRecurringModal(): void {
    const locs = this.locations();
    this.recLocationId = locs.length > 0 ? locs[0].id : null;
    const pkgs = this.packages();
    this.recPackageId = pkgs.length > 0 ? pkgs[0].id : null;
    this.recSelectedVehicleIds.set(this.fleetVehicles().map((v) => v.vehicleId));
    this.recSelectedAddOnIds.set([]);
    this.recDaysOfWeek.set([1]);
    this.showRecurringModal.set(true);
  }

  closeRecurringModal(): void {
    this.showRecurringModal.set(false);
  }

  toggleDayOfWeek(dayVal: number): void {
    this.recDaysOfWeek.update((current) => {
      if (current.includes(dayVal)) {
        if (current.length === 1) return current; // Keep at least 1 day
        return current.filter((d) => d !== dayVal);
      } else {
        return [...current, dayVal].sort();
      }
    });
  }

  toggleRecVehSelection(vehId: number): void {
    this.recSelectedVehicleIds.update((current) => {
      if (current.includes(vehId)) {
        return current.filter((id) => id !== vehId);
      } else {
        return [...current, vehId];
      }
    });
  }

  submitRecurringSchedule(): void {
    const org = this.organization();
    if (!org) return;

    if (!this.recLocationId || !this.recPackageId || this.recSelectedVehicleIds().length === 0) {
      this.showToast('Please select location, package, and vehicles.', 'error');
      return;
    }

    this.submittingRecurring.set(true);
    const payload = {
      locationId: this.recLocationId,
      packageId: this.recPackageId,
      addOnIds: this.recSelectedAddOnIds(),
      vehicleIds: this.recSelectedVehicleIds(),
      frequency: this.recFrequency,
      daysOfWeek: this.recDaysOfWeek(),
      timeOfDay: this.recTimeOfDay.length === 5 ? `${this.recTimeOfDay}:00` : this.recTimeOfDay,
      startDate: this.recStartDate,
      endDate: this.recEndDate || undefined,
    };

    this.corporate.createRecurringSchedule(org.id, payload).subscribe({
      next: () => {
        this.submittingRecurring.set(false);
        this.closeRecurringModal();
        this.showToast('Recurring fleet wash schedule created successfully!', 'success');
        this.loadOrgBookingsAndFleet(org.id);
      },
      error: (err) => {
        this.submittingRecurring.set(false);
        const msg = err?.error?.message || 'Failed to create recurring schedule.';
        this.showToast(msg, 'error');
      },
    });
  }

  toggleScheduleActive(s: RecurringFleetSchedule): void {
    const org = this.organization();
    if (!org) return;

    const action$ = s.active
      ? this.corporate.deactivateRecurringSchedule(org.id, s.id)
      : this.corporate.activateRecurringSchedule(org.id, s.id);

    action$.subscribe({
      next: (updated) => {
        this.recurringSchedules.update((list) => list.map((item) => (item.id === s.id ? updated : item)));
        this.showToast(s.active ? 'Schedule paused.' : 'Schedule activated.', 'success');
      },
      error: () => this.showToast('Failed to update schedule status.', 'error'),
    });
  }

  requestDeleteSchedule(id: number): void {
    this.confirmDeleteScheduleId.set(id);
  }

  cancelDeleteSchedule(): void {
    this.confirmDeleteScheduleId.set(null);
  }

  confirmDeleteSchedule(id: number): void {
    const org = this.organization();
    if (!org) return;

    this.corporate.deleteRecurringSchedule(org.id, id).subscribe({
      next: () => {
        this.confirmDeleteScheduleId.set(null);
        this.recurringSchedules.update((list) => list.filter((s) => s.id !== id));
        this.showToast('Recurring fleet schedule deleted.', 'success');
      },
      error: () => {
        this.confirmDeleteScheduleId.set(null);
        this.showToast('Failed to delete schedule.', 'error');
      },
    });
  }

  formatDays(days?: number[]): string {
    if (!days || days.length === 0) return 'None';
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d) => dayNames[d - 1] || `${d}`).join(', ');
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
