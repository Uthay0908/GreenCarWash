import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AddOn, AddOnRequest, PackageTaskRequest } from '../../../shared/models';

@Component({
  selector: 'app-admin-addons',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './admin-addons.html',
  styleUrl: './admin-addons.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAddOns implements OnInit {
  readonly addons = signal<AddOn[]>([]);
  readonly showModal = signal<boolean>(false);
  readonly editingAddOnId = signal<number | null>(null);

  // Form
  name = '';
  description = '';
  price = 9.99;
  tasks: PackageTaskRequest[] = [{ name: 'Perform Add-On Procedure', displayOrder: 1, mandatory: true }];

  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadAddOns();
  }

  loadAddOns(): void {
    this.admin.listAddOns().subscribe((page) => {
      this.addons.set(page.content);
    });
  }

  openCreateModal(): void {
    this.editingAddOnId.set(null);
    this.name = '';
    this.description = '';
    this.price = 12.0;
    this.tasks = [{ name: 'Application of Add-On Treatment', displayOrder: 1, mandatory: true }];
    this.showModal.set(true);
  }

  openEditModal(a: AddOn): void {
    this.editingAddOnId.set(a.id);
    this.name = a.name;
    this.description = a.description;
    this.price = a.price;
    this.tasks = a.tasks.map((t) => ({ name: t.name, displayOrder: t.displayOrder, mandatory: t.mandatory }));
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  addTask(): void {
    this.tasks.push({
      name: 'Additional Step',
      displayOrder: this.tasks.length + 1,
      mandatory: true,
    });
  }

  removeTask(i: number): void {
    this.tasks.splice(i, 1);
    this.tasks.forEach((t, idx) => (t.displayOrder = idx + 1));
  }

  saveAddOn(): void {
    const req: AddOnRequest = {
      name: this.name,
      description: this.description,
      price: this.price,
      tasks: this.tasks,
    };

    const editId = this.editingAddOnId();
    if (editId) {
      this.admin.updateAddOn(editId, req).subscribe({
        next: () => {
          this.showToast(`Add-on #${editId} updated.`);
          this.closeModal();
          this.loadAddOns();
        },
        error: (err) => this.showToast('Failed to update add-on: ' + err.message),
      });
    } else {
      this.admin.createAddOn(req).subscribe({
        next: () => {
          this.showToast('New add-on created.');
          this.closeModal();
          this.loadAddOns();
        },
        error: (err) => this.showToast('Failed to create add-on: ' + err.message),
      });
    }
  }

  toggleActive(a: AddOn): void {
    const newStatus = !a.active;
    this.admin.toggleAddOnStatus(a.id, newStatus).subscribe(() => {
      this.showToast(`Add-on "${a.name}" ${newStatus ? 'activated' : 'deactivated'}.`);
      this.loadAddOns();
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
