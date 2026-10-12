import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../shared/models';
import {
  CustomerCard,
  CustomerButton,
  CustomerEmptyState,
  CustomerSkeleton,
  CustomerConfirmDialog,
} from '../../customer/design-system';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CustomerCard,
    CustomerButton,
    CustomerEmptyState,
    CustomerSkeleton,
    CustomerConfirmDialog,
  ],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleList implements OnInit {
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly vehicles = signal<Vehicle[]>([]);

  // Deletion modal state
  readonly vehicleToDelete = signal<Vehicle | null>(null);
  readonly isDeleting = signal(false);

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.vehicleService.list().subscribe({
      next: (data) => {
        this.loading.set(false);
        this.vehicles.set(data || []);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to load vehicles from server.';
        this.error.set(msg);
      },
    });
  }

  selectForBooking(v: Vehicle): void {
    this.router.navigate(['/bookings/new'], {
      queryParams: { vehicleId: v.id, vehicleLabel: `${v.make} ${v.model}` },
    });
  }

  editVehicle(v: Vehicle): void {
    this.router.navigate(['/vehicles', v.id, 'edit']);
  }

  promptDelete(v: Vehicle): void {
    this.vehicleToDelete.set(v);
  }

  cancelDelete(): void {
    this.vehicleToDelete.set(null);
  }

  confirmDelete(): void {
    const target = this.vehicleToDelete();
    if (!target) return;

    this.isDeleting.set(true);
    this.vehicleService.delete(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.vehicleToDelete.set(null);
        this.loadVehicles();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.vehicleToDelete.set(null);
        const msg = err?.error?.message || err?.message || 'Failed to delete vehicle.';
        this.error.set(msg);
      },
    });
  }

  vehicleIcon(type: Vehicle['vehicleType']): string {
    switch (type) {
      case 'MOTORCYCLE': return '🏍️';
      case 'TRUCK': return '🚚';
      case 'SUV':
      case 'MUV': return '🚙';
      default: return '🚗';
    }
  }
}
