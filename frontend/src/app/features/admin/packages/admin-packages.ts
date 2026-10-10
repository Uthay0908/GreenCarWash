import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PackageTaskRequest, WashPackage, WashPackageRequest } from '../../../shared/models';

@Component({
  selector: 'app-admin-packages',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './admin-packages.html',
  styleUrl: './admin-packages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPackages implements OnInit {
  readonly packages = signal<WashPackage[]>([]);
  readonly showModal = signal<boolean>(false);
  readonly editingPackageId = signal<number | null>(null);

  // Form State
  name = '';
  description = '';
  price = 25.0;
  durationMinutes = 30;
  allocatedWaterLiters = 50;
  tasks: PackageTaskRequest[] = [
    { name: 'Initial Rinse', displayOrder: 1, mandatory: true },
    { name: 'Foam Hand Wash', displayOrder: 2, mandatory: true },
    { name: 'Microfiber Dry', displayOrder: 3, mandatory: true },
  ];
  suitableVehicleTypes: string[] = ['SEDAN', 'SUV'];

  readonly allVehicleTypes = ['HATCHBACK', 'SEDAN', 'SUV', 'MUV', 'TRUCK', 'MOTORCYCLE'];
  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.admin.listPackages().subscribe((page) => {
      this.packages.set(page.content);
    });
  }

  openCreateModal(): void {
    this.editingPackageId.set(null);
    this.name = '';
    this.description = '';
    this.price = 29.99;
    this.durationMinutes = 35;
    this.allocatedWaterLiters = 55;
    this.tasks = [
      { name: 'Pre-Wash Pressure Rinse', displayOrder: 1, mandatory: true },
      { name: 'Eco Shampoo Wipe', displayOrder: 2, mandatory: true },
      { name: 'Tire & Rim Detailing', displayOrder: 3, mandatory: true },
    ];
    this.suitableVehicleTypes = ['SEDAN', 'SUV', 'HATCHBACK'];
    this.showModal.set(true);
  }

  openEditModal(pkg: WashPackage): void {
    this.editingPackageId.set(pkg.id);
    this.name = pkg.name;
    this.description = pkg.description;
    this.price = pkg.price;
    this.durationMinutes = pkg.durationMinutes;
    this.allocatedWaterLiters = pkg.allocatedWaterLiters;
    this.tasks = pkg.tasks.map((t) => ({ name: t.name, displayOrder: t.displayOrder, mandatory: t.mandatory }));
    this.suitableVehicleTypes = [...pkg.suitableVehicleTypes];
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  addTask(): void {
    this.tasks.push({
      name: 'New Service Checklist Task',
      displayOrder: this.tasks.length + 1,
      mandatory: true,
    });
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
    this.tasks.forEach((t, i) => (t.displayOrder = i + 1));
  }

  toggleVehicleType(vt: string): void {
    const idx = this.suitableVehicleTypes.indexOf(vt);
    if (idx !== -1) {
      this.suitableVehicleTypes.splice(idx, 1);
    } else {
      this.suitableVehicleTypes.push(vt);
    }
  }

  savePackage(): void {
    const req: WashPackageRequest = {
      name: this.name,
      description: this.description,
      price: this.price,
      durationMinutes: this.durationMinutes,
      allocatedWaterLiters: this.allocatedWaterLiters,
      tasks: this.tasks,
      suitableVehicleTypes: this.suitableVehicleTypes,
    };

    const editId = this.editingPackageId();
    if (editId) {
      this.admin.updatePackage(editId, req).subscribe({
        next: () => {
          this.showToast(`Package #${editId} updated.`);
          this.closeModal();
          this.loadPackages();
        },
        error: (err) => this.showToast('Failed to update package: ' + err.message),
      });
    } else {
      this.admin.createPackage(req).subscribe({
        next: () => {
          this.showToast('New wash package created successfully.');
          this.closeModal();
          this.loadPackages();
        },
        error: (err) => this.showToast('Failed to create package: ' + err.message),
      });
    }
  }

  toggleActive(pkg: WashPackage): void {
    const newStatus = !pkg.active;
    this.admin.togglePackageStatus(pkg.id, newStatus).subscribe(() => {
      this.showToast(`Package "${pkg.name}" ${newStatus ? 'activated' : 'deactivated'}.`);
      this.loadPackages();
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
