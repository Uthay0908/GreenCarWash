import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AddressService } from '../../../core/services/address.service';
import { Address } from '../../../shared/models';
import {
  CustomerCard,
  CustomerButton,
  CustomerEmptyState,
  CustomerSkeleton,
  CustomerConfirmDialog,
} from '../../customer/design-system';

@Component({
  selector: 'app-address-list',
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
  templateUrl: './address-list.html',
  styleUrl: './address-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressList implements OnInit {
  private readonly addressService = inject(AddressService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly addresses = signal<Address[]>([]);

  // Setting default state
  readonly settingDefaultId = signal<number | null>(null);

  // Deletion modal state
  readonly addressToDelete = signal<Address | null>(null);
  readonly isDeleting = signal(false);

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading.set(true);
    this.error.set(null);

    this.addressService.list().subscribe({
      next: (data) => {
        this.loading.set(false);
        this.addresses.set(data || []);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to load saved addresses from server.';
        this.error.set(msg);
      },
    });
  }

  selectForBooking(a: Address): void {
    this.router.navigate(['/bookings/new'], {
      queryParams: { addressId: a.id, addressLabel: a.label || a.line1 },
    });
  }

  editAddress(a: Address): void {
    this.router.navigate(['/addresses', a.id, 'edit']);
  }

  setDefault(a: Address): void {
    if (a.isDefault || this.settingDefaultId() !== null) return;

    this.settingDefaultId.set(a.id);
    this.addressService.setDefault(a).subscribe({
      next: () => {
        this.settingDefaultId.set(null);
        this.loadAddresses();
      },
      error: (err) => {
        this.settingDefaultId.set(null);
        const msg = err?.error?.message || err?.message || 'Failed to set default address.';
        this.error.set(msg);
      },
    });
  }

  promptDelete(a: Address): void {
    this.addressToDelete.set(a);
  }

  cancelDelete(): void {
    this.addressToDelete.set(null);
  }

  confirmDelete(): void {
    const target = this.addressToDelete();
    if (!target) return;

    this.isDeleting.set(true);
    this.addressService.delete(target.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.addressToDelete.set(null);
        this.loadAddresses();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.addressToDelete.set(null);
        const msg = err?.error?.message || err?.message || 'Failed to delete address.';
        this.error.set(msg);
      },
    });
  }

  labelIcon(label?: string): string {
    const l = (label || '').toLowerCase();
    if (l.includes('home')) return '🏠';
    if (l.includes('office') || l.includes('work')) return '🏢';
    return '📍';
  }
}
