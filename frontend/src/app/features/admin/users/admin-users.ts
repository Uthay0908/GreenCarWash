import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CustomerProfile, UpdateCustomerProfileRequest, Booking, Vehicle, Payment } from '../../../shared/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, PaginationComponent],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsers implements OnInit {
  readonly customers = signal<CustomerProfile[]>([]);
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);

  // Pagination state
  readonly currentPage = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);

  // Details Modal state
  readonly selectedCustomer = signal<CustomerProfile | null>(null);
  readonly customerBookings = signal<Booking[]>([]);
  readonly customerVehicles = signal<Vehicle[]>([]);
  readonly customerPayments = signal<Payment[]>([]);
  readonly loadingDetails = signal<boolean>(false);

  // Edit Modal state
  readonly editingCustomer = signal<CustomerProfile | null>(null);
  readonly editForm = signal<UpdateCustomerProfileRequest>({ fullName: '', phone: '', preferredLanguage: 'EN' });

  // Notifications
  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.admin.listCustomers(this.searchQuery(), this.currentPage(), this.pageSize()).subscribe({
      next: (page) => {
        this.customers.set(page.content || []);
        this.totalElements.set(page.totalElements || 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(): void {
    this.currentPage.set(0);
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCustomers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadCustomers();
  }

  toggleAccountStatus(c: CustomerProfile): void {
    const newStatus = !c.enabled;
    this.admin.toggleCustomerStatus(c.userAccountId, newStatus).subscribe({
      next: () => {
        this.showToast(`Account #${c.userAccountId} (${c.fullName}) ${newStatus ? 'activated' : 'deactivated'} successfully.`);
        this.loadCustomers();
        if (this.selectedCustomer()?.id === c.id) {
          this.selectedCustomer.update((cur) => cur ? { ...cur, enabled: newStatus } : null);
        }
      },
      error: (err) => {
        this.showToast('Failed to update status: ' + (err?.error?.message || err?.message || 'Server error'));
      }
    });
  }

  // --- Customer Details ---
  openDetailsModal(c: CustomerProfile): void {
    this.selectedCustomer.set(c);
    this.loadingDetails.set(true);
    this.customerBookings.set([]);
    this.customerVehicles.set([]);
    this.customerPayments.set([]);

    // 1. Fetch customer's vehicles
    this.admin.listVehicles(c.fullName || String(c.id), 0, 50).subscribe({
      next: (res) => {
        const vehicles = (res?.content || []).filter((v) => v.customerProfileId === c.id);
        this.customerVehicles.set(vehicles);
      },
      error: () => {},
    });

    // 2. Fetch customer's bookings
    this.admin.listBookings(undefined, 0, 100).subscribe({
      next: (res) => {
        const bookings = (res?.content || []).filter((b) => b.customerId === c.id);
        this.customerBookings.set(bookings);
        this.loadingDetails.set(false);
      },
      error: () => this.loadingDetails.set(false),
    });

    // 3. Fetch customer's payments
    this.admin.listAllPayments(0, 100).subscribe({
      next: (res) => {
        const payments = (res?.content || []).filter((p) => p.customerId === c.id);
        this.customerPayments.set(payments);
      },
      error: () => {},
    });
  }

  closeDetailsModal(): void {
    this.selectedCustomer.set(null);
  }

  // --- Customer Edit ---
  openEditModal(c: CustomerProfile): void {
    this.editingCustomer.set(c);
    this.editForm.set({
      fullName: c.fullName,
      phone: c.phone,
      preferredLanguage: c.preferredLanguage || 'EN',
    });
  }

  closeEditModal(): void {
    this.editingCustomer.set(null);
  }

  saveCustomer(): void {
    const c = this.editingCustomer();
    if (!c) return;

    this.admin.updateCustomer(c.id, this.editForm()).subscribe({
      next: () => {
        this.showToast(`Customer #${c.id} updated successfully.`);
        this.closeEditModal();
        this.loadCustomers();
      },
      error: (err) => this.showToast('Failed to update customer: ' + (err.message || 'Error')),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
