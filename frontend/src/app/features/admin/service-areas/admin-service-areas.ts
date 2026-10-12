import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ServiceArea, ServiceAreaRequest } from '../../../shared/models';

@Component({
  selector: 'app-admin-service-areas',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './admin-service-areas.html',
  styleUrl: './admin-service-areas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminServiceAreas implements OnInit {
  readonly serviceAreas = signal<ServiceArea[]>([]);
  readonly showModal = signal<boolean>(false);

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);

  // Form
  name = '';
  postalCodesInput = '';
  centerLat = 12.9716;
  centerLng = 77.5946;
  radiusKm = 15;

  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadServiceAreas();
  }

  loadServiceAreas(page: number = this.currentPage(), size: number = this.pageSize()): void {
    this.currentPage.set(page);
    this.pageSize.set(size);
    this.admin.listServiceAreas(page - 1, size).subscribe({
      next: (pg) => {
        this.serviceAreas.set(pg?.content || []);
        this.totalElements.set(pg?.totalElements || (pg?.content || []).length);
      },
      error: () => {
        this.serviceAreas.set([]);
        this.totalElements.set(0);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadServiceAreas(page, this.pageSize());
  }

  onPageSizeChange(size: number): void {
    this.loadServiceAreas(1, size);
  }

  openCreateModal(): void {
    this.name = 'Indiranagar Extended Zone';
    this.postalCodesInput = '560038, 560008, 560075';
    this.centerLat = 12.9784;
    this.centerLng = 77.6408;
    this.radiusKm = 12;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveServiceArea(): void {
    const codes = this.postalCodesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const req: ServiceAreaRequest = {
      name: this.name,
      postalCodes: codes,
      centerLatitude: this.centerLat,
      centerLongitude: this.centerLng,
      radiusKm: this.radiusKm,
    };

    this.admin.createServiceArea(req).subscribe({
      next: () => {
        this.showToast(`Service Area "${req.name}" created.`);
        this.closeModal();
        this.loadServiceAreas();
      },
      error: (err) => this.showToast('Failed to create area: ' + err.message),
    });
  }

  toggleActive(area: ServiceArea): void {
    const newStatus = !area.active;
    this.admin.toggleServiceAreaStatus(area.id, newStatus).subscribe(() => {
      this.showToast(`Zone "${area.name}" ${newStatus ? 'activated' : 'deactivated'}.`);
      this.loadServiceAreas();
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
