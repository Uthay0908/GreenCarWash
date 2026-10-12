import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorporateService } from '../../../core/services/corporate.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import {
  Organization,
  OrganizationVehicle,
  Vehicle,
} from '../../../shared/models';

export interface DisplayFleetVehicle {
  id: number;
  vehicleId: number;
  label?: string;
  make: string;
  model: string;
  licensePlate: string;
  vehicleType: string;
  color?: string;
  year?: number;
  createdAt?: string;
}

@Component({
  selector: 'app-corporate-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './fleet.html',
  styleUrl: './fleet.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateFleet implements OnInit {
  private readonly corporate = inject(CorporateService);
  private readonly vehicleService = inject(VehicleService);

  readonly fleetFilter = signal<string>('ALL');
  searchQuery = '';

  readonly organization = signal<Organization | null>(null);
  readonly fleetVehicles = signal<OrganizationVehicle[]>([]);
  readonly myVehicles = signal<Vehicle[]>([]);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly toastMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Add Vehicle Modal
  readonly showAddVehicleModal = signal<boolean>(false);
  readonly addMode = signal<'EXISTING' | 'NEW'>('NEW');
  readonly submittingVehicle = signal<boolean>(false);

  // Link existing
  selectedVehicleId: number | null = null;
  manualVehicleId: number | null = null;
  fleetVehicleLabel = '';

  // Create new vehicle
  newMake = '';
  newModel = '';
  newLicensePlate = '';
  newVehicleType = 'SEDAN';
  newColor = '';
  newYear: number = new Date().getFullYear();

  // Confirmation state
  readonly confirmRemoveVehicleId = signal<number | null>(null);

  // Enriched real fleet vehicles
  readonly enrichedFleetVehicles = computed<DisplayFleetVehicle[]>(() => {
    const list = this.fleetVehicles();
    const my = this.myVehicles();
    const map = new Map<number, Vehicle>(my.map((v) => [v.id, v]));

    return list.map((fv) => {
      const match = map.get(fv.vehicleId);
      return {
        id: fv.id,
        vehicleId: fv.vehicleId,
        label: fv.label,
        make: match?.make || 'Fleet',
        model: match?.model || `Vehicle #${fv.vehicleId}`,
        licensePlate: match?.licensePlate || `VEH-${fv.vehicleId}`,
        vehicleType: match?.vehicleType || 'SEDAN',
        color: match?.color || fv.color || 'White',
        createdAt: fv.addedAt,
      };
    });
  });

  readonly filteredVehicles = computed<DisplayFleetVehicle[]>(() => {
    const filter = this.fleetFilter().toUpperCase();
    const q = this.searchQuery.trim().toLowerCase();
    let list = this.enrichedFleetVehicles();

    if (filter !== 'ALL') {
      list = list.filter((v) => v.vehicleType.toUpperCase() === filter);
    }
    if (q) {
      list = list.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.licensePlate.toLowerCase().includes(q) ||
          (v.label && v.label.toLowerCase().includes(q))
      );
    }
    return list;
  });

  // Filter available user vehicles not yet added to corporate fleet
  readonly unassignedVehicles = computed(() => {
    const assignedIds = new Set(this.fleetVehicles().map((fv) => fv.vehicleId));
    return this.myVehicles().filter((v) => !assignedIds.has(v.id));
  });

  ngOnInit(): void {
    this.loadData();
  }

  setFleetFilter(filter: string): void {
    this.fleetFilter.set(filter);
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        if (org) {
          this.loadFleet(org.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load corporate organization.');
      },
    });

    this.vehicleService.list().subscribe({
      next: (v) => this.myVehicles.set(v || []),
      error: () => this.myVehicles.set([]),
    });
  }

  private loadFleet(orgId: number): void {
    this.corporate.listVehicles(orgId).subscribe({
      next: (v) => {
        this.fleetVehicles.set(v || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to fetch corporate vehicles from server.');
      },
    });
  }

  openAddVehicleModal(): void {
    this.selectedVehicleId = this.unassignedVehicles().length > 0 ? this.unassignedVehicles()[0].id : null;
    this.manualVehicleId = null;
    this.fleetVehicleLabel = '';
    this.newMake = '';
    this.newModel = '';
    this.newLicensePlate = '';
    this.newVehicleType = 'SEDAN';
    this.newColor = 'White';
    this.newYear = new Date().getFullYear();
    this.addMode.set(this.unassignedVehicles().length > 0 ? 'EXISTING' : 'NEW');
    this.showAddVehicleModal.set(true);
  }

  closeAddVehicleModal(): void {
    this.showAddVehicleModal.set(false);
  }

  submitAddVehicle(): void {
    const org = this.organization();
    if (!org) return;

    this.submittingVehicle.set(true);

    if (this.addMode() === 'EXISTING') {
      const targetVehicleId = this.selectedVehicleId || this.manualVehicleId;
      if (!targetVehicleId) {
        this.showToast('Please select a vehicle or enter a Vehicle ID to add.', 'error');
        this.submittingVehicle.set(false);
        return;
      }

      this.corporate
        .addVehicle(org.id, {
          vehicleId: targetVehicleId,
          label: this.fleetVehicleLabel.trim() || undefined,
        })
        .subscribe({
          next: () => {
            this.submittingVehicle.set(false);
            this.showToast('Vehicle added to corporate fleet successfully.', 'success');
            this.closeAddVehicleModal();
            this.loadFleet(org.id);
          },
          error: (err) => {
            this.submittingVehicle.set(false);
            const msg = err?.error?.message || 'Failed to add vehicle to fleet.';
            this.showToast(msg, 'error');
          },
        });
    } else {
      // Create new vehicle in vehicle-service then link to corporate
      if (!this.newMake.trim() || !this.newModel.trim() || !this.newLicensePlate.trim()) {
        this.showToast('Please fill in Make, Model, and License Plate.', 'error');
        this.submittingVehicle.set(false);
        return;
      }

      const vehicleData = {
        make: this.newMake.trim(),
        model: this.newModel.trim(),
        licensePlate: this.newLicensePlate.trim().toUpperCase(),
        vehicleType: this.newVehicleType,
        color: this.newColor.trim() || 'White',
        year: this.newYear || new Date().getFullYear(),
      };

      this.corporate
        .createAndAddVehicle(org.id, vehicleData, this.fleetVehicleLabel.trim())
        .subscribe({
          next: () => {
            this.submittingVehicle.set(false);
            this.showToast('New corporate vehicle registered and added to fleet.', 'success');
            this.closeAddVehicleModal();
            // Refresh customer vehicle cache as well
            this.vehicleService.list().subscribe({
              next: (v) => this.myVehicles.set(v || []),
            });
            this.loadFleet(org.id);
          },
          error: (err) => {
            this.submittingVehicle.set(false);
            const msg = err?.error?.message || 'Failed to register corporate vehicle.';
            this.showToast(msg, 'error');
          },
        });
    }
  }

  requestRemoveVehicle(vehicleId: number): void {
    this.confirmRemoveVehicleId.set(vehicleId);
  }

  cancelRemoveVehicle(): void {
    this.confirmRemoveVehicleId.set(null);
  }

  confirmRemoveVehicle(vehicleId: number): void {
    const org = this.organization();
    if (!org) return;

    this.corporate.removeVehicle(org.id, vehicleId).subscribe({
      next: () => {
        this.confirmRemoveVehicleId.set(null);
        this.showToast('Vehicle removed from corporate fleet.', 'success');
        this.loadFleet(org.id);
      },
      error: () => {
        this.confirmRemoveVehicleId.set(null);
        this.showToast('Failed to remove vehicle.', 'error');
      },
    });
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
