import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CorporateService } from '../../../core/services/corporate.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import {
  DriverStatus,
  FleetDriver,
  MemberRole,
  Organization,
  OrganizationMember,
  OrganizationVehicle,
  Vehicle,
} from '../../../shared/models';

export interface PredefinedAccount {
  userAccountId: number;
  fullName: string;
  email: string;
  phone: string;
  roleHint: string;
}

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './members.html',
  styleUrl: './members.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Members implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly corporate = inject(CorporateService);
  private readonly vehicleService = inject(VehicleService);

  readonly activeTab = signal<'TEAM' | 'DRIVERS'>('TEAM');
  readonly organization = signal<Organization | null>(null);
  readonly members = signal<OrganizationMember[]>([]);
  readonly drivers = signal<FleetDriver[]>([]);
  readonly fleetVehicles = signal<OrganizationVehicle[]>([]);
  readonly allVehicles = signal<Vehicle[]>([]);

  readonly loading = signal<boolean>(true);
  readonly formVisible = signal<boolean>(false);
  readonly formMode = signal<'TEAM' | 'DRIVER'>('TEAM');
  readonly adding = signal<boolean>(false);

  // Search & Filter
  readonly teamSearch = signal<string>('');
  readonly teamRoleFilter = signal<string>('ALL');
  readonly driverSearch = signal<string>('');
  readonly driverStatusFilter = signal<string>('ALL');

  // Confirmation modals
  readonly confirmRemoveId = signal<number | null>(null);
  readonly confirmRemoveDriverId = signal<number | null>(null);

  // Details Modal
  readonly selectedDetailItem = signal<{ type: 'MEMBER' | 'DRIVER'; data: any } | null>(null);

  // Reassign Driver Vehicle Modal
  readonly driverToReassign = signal<FleetDriver | null>(null);
  reassignVehicleSelect: number | null = null;

  // Toast
  readonly toastMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Pre-seeded company accounts for quick member addition
  readonly quickAccounts: PredefinedAccount[] = [
    {
      userAccountId: 2,
      fullName: 'Demo Customer',
      email: 'customer1@example.com',
      phone: '+1 (555) 000-0002',
      roleHint: 'Registered Customer / Fleet Driver',
    },
    {
      userAccountId: 1,
      fullName: 'System Admin',
      email: 'admin@example.com',
      phone: '+1 (555) 000-0001',
      roleHint: 'System Administrator',
    },
    {
      userAccountId: 3,
      fullName: 'Demo Washer',
      email: 'washer1@example.com',
      phone: '+1 (555) 000-0003',
      roleHint: 'Field Service Specialist',
    },
    {
      userAccountId: 4,
      fullName: 'Demo Fleet Manager',
      email: 'corporate1@example.com',
      phone: '+1 (555) 019-4820',
      roleHint: 'Logistics Operations Lead',
    },
  ];

  // Team Member Add Form
  selectedQuickAccountId: number | null = 2;
  readonly teamForm = this.fb.nonNullable.group({
    userAccountId: [2 as number | null, [Validators.required, Validators.min(1)]],
    fullName: ['Demo Customer', [Validators.required]],
    email: ['customer1@example.com', [Validators.required, Validators.email]],
    phone: ['+1 (555) 000-0002'],
    role: ['ADMIN' as MemberRole, Validators.required],
    department: ['Fleet Operations'],
  });

  // Fleet Driver Add Form
  readonly driverForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    licenseNumber: ['', [Validators.required]],
    assignedVehicleId: [null as number | null],
    status: ['AVAILABLE' as DriverStatus, Validators.required],
  });

  // Computed metrics
  readonly totalTeamCount = computed(() => this.members().length);
  readonly ownerCount = computed(() => this.members().filter((m) => m.role === 'OWNER').length);
  readonly adminCount = computed(() => this.members().filter((m) => m.role === 'ADMIN').length);
  readonly memberRoleCount = computed(() => this.members().filter((m) => m.role === 'MEMBER').length);

  readonly totalDriversCount = computed(() => this.drivers().length);
  readonly availableDriversCount = computed(() => this.drivers().filter((d) => d.status === 'AVAILABLE').length);
  readonly onRouteDriversCount = computed(() => this.drivers().filter((d) => d.status === 'ON_ROUTE').length);
  readonly offDutyDriversCount = computed(() => this.drivers().filter((d) => d.status === 'OFF_DUTY').length);
  readonly assignedVehiclesCount = computed(() => this.drivers().filter((d) => !!d.assignedVehicleId).length);

  // Filtered lists
  readonly filteredMembers = computed<OrganizationMember[]>(() => {
    const q = this.teamSearch().trim().toLowerCase();
    const role = this.teamRoleFilter().toUpperCase();
    let list = this.members();

    if (role !== 'ALL') {
      list = list.filter((m) => m.role === role);
    }
    if (q) {
      list = list.filter(
        (m) =>
          (m.fullName && m.fullName.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          String(m.userAccountId).includes(q) ||
          m.role.toLowerCase().includes(q)
      );
    }
    return list;
  });

  readonly filteredDrivers = computed<FleetDriver[]>(() => {
    const q = this.driverSearch().trim().toLowerCase();
    const st = this.driverStatusFilter().toUpperCase();
    let list = this.drivers();

    if (st !== 'ALL') {
      list = list.filter((d) => d.status === st);
    }
    if (q) {
      list = list.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.licenseNumber.toLowerCase().includes(q) ||
          (d.assignedVehicleLabel && d.assignedVehicleLabel.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    const cachedOrg = this.corporate.activeOrganization();
    if (cachedOrg) {
      this.organization.set(cachedOrg);
      this.loadDrivers(cachedOrg.id);
      this.loadFleetVehicles(cachedOrg.id);
      this.members.set(this.getDefaultMembers(cachedOrg.id).map((m) => this.enrichMemberProfile(m)));
      this.loading.set(false);
      this.loadMembers(cachedOrg.id);
    }
    this.loadData();
  }

  loadData(): void {
    if (!this.organization()) {
      this.loading.set(true);
    }
    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        if (org) {
          this.organization.set(org);
          this.loadMembers(org.id);
          this.loadFleetVehicles(org.id);
          this.loadDrivers(org.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  loadMembers(orgId: number): void {
    this.corporate.listMembers(orgId).subscribe({
      next: (mList) => {
        // Enrich any members where fullName is missing
        const list = (mList && mList.length > 0) ? mList : this.getDefaultMembers(orgId);
        const enriched = list.map((m) => this.enrichMemberProfile(m));
        this.members.set(enriched);
        this.loadDrivers(orgId);
        this.loading.set(false);
      },
      error: () => {
        if (this.members().length === 0) {
          this.members.set(this.getDefaultMembers(orgId).map((m) => this.enrichMemberProfile(m)));
        }
        this.loadDrivers(orgId);
        this.loading.set(false);
      },
    });
  }

  private getDefaultMembers(orgId: number): OrganizationMember[] {
    return [
      {
        id: 1,
        organizationId: orgId,
        userAccountId: 4,
        role: 'OWNER',
        addedAt: '2026-10-05T16:06:31Z',
        fullName: 'Demo Fleet Manager',
        email: 'corporate1@example.com',
        phone: '+1 (555) 019-4820',
      },
      {
        id: 2,
        organizationId: orgId,
        userAccountId: 1,
        role: 'ADMIN',
        addedAt: '2026-10-05T16:06:31Z',
        fullName: 'System Admin',
        email: 'admin@example.com',
        phone: '+1 (555) 000-0001',
      },
      {
        id: 3,
        organizationId: orgId,
        userAccountId: 2,
        role: 'ADMIN',
        addedAt: '2026-10-07T16:36:10Z',
        fullName: 'Demo Customer',
        email: 'customer1@example.com',
        phone: '+1 (555) 000-0002',
      },
    ];
  }

  private enrichMemberProfile(member: OrganizationMember): OrganizationMember {
    if (member.fullName && member.email) {
      return member;
    }
    // Match against known seed accounts or defaults
    const match = this.quickAccounts.find((a) => a.userAccountId === member.userAccountId);
    if (match) {
      return {
        ...member,
        fullName: member.fullName || match.fullName,
        email: member.email || match.email,
        phone: member.phone || match.phone,
      };
    }
    return {
      ...member,
      fullName: member.fullName || `Fleet Member #${member.userAccountId}`,
      email: member.email || `member${member.userAccountId}@ecofleet.corp`,
      phone: member.phone || '+1 (555) 010-0000',
    };
  }

  loadFleetVehicles(orgId: number): void {
    this.corporate.listVehicles(orgId).subscribe({
      next: (fVehs) => {
        if (fVehs && fVehs.length > 0) {
          this.fleetVehicles.set(fVehs);
        } else {
          this.setFallbackVehicles(orgId);
        }
      },
      error: () => this.setFallbackVehicles(orgId),
    });
    this.vehicleService.list().subscribe({
      next: (vehs) => {
        this.allVehicles.set(vehs || []);
      },
      error: () => {},
    });
  }

  private setFallbackVehicles(orgId: number): void {
    if (this.fleetVehicles().length === 0) {
      this.fleetVehicles.set([
        { id: 1, organizationId: orgId, vehicleId: 1, label: 'Tesla Model 3 [ECO-FLEET-01]', addedAt: '2026-10-05T16:06:31Z' },
        { id: 2, organizationId: orgId, vehicleId: 2, label: 'Hyundai Ioniq 5 [TN09EV9999]', addedAt: '2026-10-06T12:00:00Z' },
        { id: 3, organizationId: orgId, vehicleId: 3, label: 'Ford F-150 Lightning [FLEET-TRK-01]', addedAt: '2026-10-07T14:30:00Z' },
      ]);
    }
  }

  loadDrivers(orgId: number): void {
    const key = `gcw_org_drivers_${orgId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.drivers.set(parsed);
          return;
        }
      } catch {
        // Fallback to initial seed
      }
    }

    // Seed realistic corporate fleet drivers for this organization
    const initial: FleetDriver[] = [
      {
        id: 1,
        organizationId: orgId,
        fullName: 'Rajesh Kumar',
        email: 'rajesh.k@ecofleet.com',
        phone: '+1 (555) 234-8891',
        licenseNumber: 'CDL-NY-90821',
        status: 'AVAILABLE',
        assignedVehicleId: 1,
        assignedVehicleLabel: 'Tesla Model 3 [ECO-FLEET-01]',
        totalWashesCompleted: 18,
        rating: 4.9,
        joinedAt: new Date(Date.now() - 32 * 86400000).toISOString(),
      },
      {
        id: 2,
        organizationId: orgId,
        fullName: 'David Chen',
        email: 'david.c@ecofleet.com',
        phone: '+1 (555) 789-0123',
        licenseNumber: 'CDL-CA-44821',
        status: 'ON_ROUTE',
        assignedVehicleId: 2,
        assignedVehicleLabel: 'Hyundai Ioniq 5 [TN09EV9999]',
        totalWashesCompleted: 24,
        rating: 5.0,
        joinedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
      {
        id: 3,
        organizationId: orgId,
        fullName: 'Elena Rostova',
        email: 'elena.r@ecofleet.com',
        phone: '+1 (555) 456-7890',
        licenseNumber: 'CDL-TX-12903',
        status: 'AVAILABLE',
        assignedVehicleId: null,
        assignedVehicleLabel: undefined,
        totalWashesCompleted: 9,
        rating: 4.8,
        joinedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 4,
        organizationId: orgId,
        fullName: 'Marcus Vance',
        email: 'marcus.v@ecofleet.com',
        phone: '+1 (555) 678-9012',
        licenseNumber: 'CDL-IL-67341',
        status: 'OFF_DUTY',
        assignedVehicleId: null,
        assignedVehicleLabel: undefined,
        totalWashesCompleted: 14,
        rating: 4.7,
        joinedAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
    ];

    this.drivers.set(initial);
    this.saveDrivers(orgId, initial);
  }

  private saveDrivers(orgId: number, list: FleetDriver[]): void {
    localStorage.setItem(`gcw_org_drivers_${orgId}`, JSON.stringify(list));
  }

  // --- TAB & FORM SWITCHING ---
  switchTab(tab: 'TEAM' | 'DRIVERS'): void {
    this.activeTab.set(tab);
    this.formMode.set(tab === 'DRIVERS' ? 'DRIVER' : 'TEAM');
  }

  openAddForm(mode: 'TEAM' | 'DRIVER'): void {
    this.formMode.set(mode);
    this.formVisible.set(true);
  }

  toggleForm(): void {
    this.formVisible.update((v) => !v);
  }

  closeForm(): void {
    this.formVisible.set(false);
  }

  // Quick account selection for team form
  onQuickAccountSelected(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const val = select.value;
    if (val === 'CUSTOM') {
      this.selectedQuickAccountId = null;
      this.teamForm.patchValue({
        userAccountId: null,
        fullName: '',
        email: '',
        phone: '',
      });
      return;
    }
    const accId = Number(val);
    const found = this.quickAccounts.find((a) => a.userAccountId === accId);
    if (found) {
      this.selectedQuickAccountId = found.userAccountId;
      this.teamForm.patchValue({
        userAccountId: found.userAccountId,
        fullName: found.fullName,
        email: found.email,
        phone: found.phone,
      });
    }
  }

  // Add Member submit
  submitAddMember(): void {
    const org = this.organization();
    if (!org) return;

    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    this.adding.set(true);
    const { userAccountId, role, fullName, email, phone } = this.teamForm.getRawValue();

    this.corporate.addMember(org.id, { userAccountId: userAccountId!, role }).subscribe({
      next: (member) => {
        this.adding.set(false);
        const enriched: OrganizationMember = {
          ...member,
          fullName: member.fullName || fullName,
          email: member.email || email,
          phone: member.phone || phone,
        };
        this.members.update((list) => [...list, enriched]);
        this.formVisible.set(false);
        this.showToast(`Team member "${enriched.fullName}" added successfully as ${role}.`, 'success');
      },
      error: (err) => {
        this.adding.set(false);
        const msg = err?.error?.message || 'Failed to add member. Please check account ID.';
        this.showToast(msg, 'error');
      },
    });
  }

  // Add Driver submit
  submitAddDriver(): void {
    const org = this.organization();
    if (!org) return;

    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.adding.set(true);
    const val = this.driverForm.getRawValue();

    let vehicleLabel: string | undefined = undefined;
    if (val.assignedVehicleId) {
      const matchOrgVeh = this.fleetVehicles().find(
        (fv) => fv.id === val.assignedVehicleId || fv.vehicleId === val.assignedVehicleId
      );
      vehicleLabel = matchOrgVeh?.label || `Vehicle #${val.assignedVehicleId}`;
    }

    const newDriver: FleetDriver = {
      id: Date.now(),
      organizationId: org.id,
      fullName: val.fullName.trim(),
      email: val.email.trim(),
      phone: val.phone.trim(),
      licenseNumber: val.licenseNumber.trim().toUpperCase(),
      status: val.status,
      assignedVehicleId: val.assignedVehicleId,
      assignedVehicleLabel: vehicleLabel,
      totalWashesCompleted: 0,
      rating: 5.0,
      joinedAt: new Date().toISOString(),
    };

    const updated = [newDriver, ...this.drivers()];
    this.drivers.set(updated);
    this.saveDrivers(org.id, updated);
    this.adding.set(false);
    this.formVisible.set(false);
    this.driverForm.reset({ status: 'AVAILABLE', assignedVehicleId: null });
    this.showToast(`Fleet Driver "${newDriver.fullName}" registered successfully.`, 'success');
  }

  // --- ACTIONS ON TEAM MEMBERS ---
  requestRemoveMember(id: number): void {
    this.confirmRemoveId.set(id);
  }

  cancelRemoveMember(): void {
    this.confirmRemoveId.set(null);
  }

  confirmRemoveMember(id: number): void {
    const org = this.organization();
    if (!org) return;

    this.corporate.removeMember(org.id, id).subscribe({
      next: () => {
        this.confirmRemoveId.set(null);
        this.members.update((list) => list.filter((m) => m.id !== id));
        this.showToast('Member removed from organization.', 'success');
      },
      error: (err) => {
        this.confirmRemoveId.set(null);
        const msg = err?.error?.message || 'Failed to remove member. The last owner cannot be removed.';
        this.showToast(msg, 'error');
      },
    });
  }

  // --- ACTIONS ON DRIVERS ---
  cycleDriverStatus(driver: FleetDriver): void {
    const org = this.organization();
    if (!org) return;

    const nextStatus: Record<DriverStatus, DriverStatus> = {
      AVAILABLE: 'ON_ROUTE',
      ON_ROUTE: 'OFF_DUTY',
      OFF_DUTY: 'AVAILABLE',
    };
    const newStatus = nextStatus[driver.status];

    const updated = this.drivers().map((d) => (d.id === driver.id ? { ...d, status: newStatus } : d));
    this.drivers.set(updated);
    this.saveDrivers(org.id, updated);

    // If modal is open, update modal view
    const currentModal = this.selectedDetailItem();
    if (currentModal && currentModal.type === 'DRIVER' && currentModal.data.id === driver.id) {
      this.selectedDetailItem.set({
        type: 'DRIVER',
        data: { ...currentModal.data, status: newStatus },
      });
    }

    this.showToast(`Driver ${driver.fullName} status updated to ${newStatus.replace('_', ' ')}.`, 'success');
  }

  openReassignModal(driver: FleetDriver): void {
    this.selectedDetailItem.set(null);
    this.driverToReassign.set(driver);
    this.reassignVehicleSelect = driver.assignedVehicleId ?? null;
  }

  closeReassignModal(): void {
    this.driverToReassign.set(null);
    this.reassignVehicleSelect = null;
  }

  confirmReassignVehicle(): void {
    const driver = this.driverToReassign();
    const org = this.organization();
    if (!driver || !org) return;

    const selectedId = this.reassignVehicleSelect;
    let newLabel: string | undefined = undefined;

    if (selectedId) {
      const match = this.fleetVehicles().find((fv) => fv.id === selectedId || fv.vehicleId === selectedId);
      newLabel = match?.label || `Vehicle #${selectedId}`;
    }

    const updated = this.drivers().map((d) =>
      d.id === driver.id
        ? {
            ...d,
            assignedVehicleId: selectedId,
            assignedVehicleLabel: newLabel,
          }
        : d
    );

    this.drivers.set(updated);
    this.saveDrivers(org.id, updated);
    this.closeReassignModal();

    // Update details modal if active
    const currentModal = this.selectedDetailItem();
    if (currentModal && currentModal.type === 'DRIVER' && currentModal.data.id === driver.id) {
      this.selectedDetailItem.set({
        type: 'DRIVER',
        data: {
          ...currentModal.data,
          assignedVehicleId: selectedId,
          assignedVehicleLabel: newLabel,
        },
      });
    }

    this.showToast(
      selectedId
        ? `Driver ${driver.fullName} assigned to ${newLabel}.`
        : `Vehicle unassigned for ${driver.fullName}.`,
      'success'
    );
  }

  requestRemoveDriver(id: number): void {
    this.confirmRemoveDriverId.set(id);
  }

  cancelRemoveDriver(): void {
    this.confirmRemoveDriverId.set(null);
  }

  confirmRemoveDriver(id: number): void {
    const org = this.organization();
    if (!org) return;

    const updated = this.drivers().filter((d) => d.id !== id);
    this.drivers.set(updated);
    this.saveDrivers(org.id, updated);
    this.confirmRemoveDriverId.set(null);
    if (this.selectedDetailItem()?.data?.id === id) {
      this.closeDetailModal();
    }
    this.showToast('Driver removed from fleet roster.', 'success');
  }

  // --- DETAILS MODAL ---
  openDetailModal(type: 'MEMBER' | 'DRIVER', data: any): void {
    this.selectedDetailItem.set({ type, data });
  }

  closeDetailModal(): void {
    this.selectedDetailItem.set(null);
  }

  getInitials(name: string): string {
    if (!name) return 'FL';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
