import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Vehicle, Booking } from '../../../shared/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-admin-vehicles',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, PaginationComponent],
  templateUrl: './admin-vehicles.html',
  styleUrl: './admin-vehicles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminVehicles implements OnInit {
  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('ALL');

  // Pagination state
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);

  // Vehicle Details Modal
  readonly selectedVehicle = signal<Vehicle | null>(null);
  readonly vehicleBookings = signal<Booking[]>([]);
  readonly loadingDetails = signal<boolean>(false);

  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading.set(true);
    this.admin.listVehicles(this.searchQuery(), this.currentPage(), this.pageSize()).subscribe({
      next: (page) => {
        let list = page.content || [];
        if (this.statusFilter() === 'ACTIVE') {
          list = list.filter((v) => v.active);
        } else if (this.statusFilter() === 'INACTIVE') {
          list = list.filter((v) => !v.active);
        }
        this.vehicles.set(list);
        this.totalElements.set(page.totalElements || list.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadVehicles();
  }

  onStatusChange(filter: string): void {
    this.statusFilter.set(filter);
    this.currentPage.set(0);
    this.loadVehicles();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadVehicles();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadVehicles();
  }

  toggleVehicle(v: Vehicle): void {
    const newStatus = !v.active;
    this.admin.toggleVehicleStatus(v.id, newStatus).subscribe({
      next: () => {
        this.showToast(`Vehicle #${v.id} (${v.make} ${v.model}) ${newStatus ? 'activated' : 'deactivated'} successfully.`);
        this.loadVehicles();
        if (this.selectedVehicle()?.id === v.id) {
          this.selectedVehicle.update((cur) => cur ? { ...cur, active: newStatus } : null);
        }
      },
      error: (err) => {
        this.showToast('Failed to update vehicle status: ' + (err?.error?.message || err?.message || 'Server error'));
      }
    });
  }

  openDetailsModal(v: Vehicle): void {
    this.selectedVehicle.set(v);
    this.loadingDetails.set(true);
    this.vehicleBookings.set([]);

    // Fetch booking history for this vehicle
    this.admin.listBookings(undefined, 0, 100).subscribe({
      next: (res) => {
        const bookings = (res?.content || []).filter((b) => b.vehicleId === v.id);
        this.vehicleBookings.set(bookings);
        this.loadingDetails.set(false);
      },
      error: () => this.loadingDetails.set(false),
    });
  }

  closeDetailsModal(): void {
    this.selectedVehicle.set(null);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
