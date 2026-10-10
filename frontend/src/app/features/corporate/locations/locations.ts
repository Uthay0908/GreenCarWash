import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorporateService } from '../../../core/services/corporate.service';
import { Organization, OrganizationLocation } from '../../../shared/models';

@Component({
  selector: 'app-corporate-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateLocations implements OnInit {
  private readonly corporate = inject(CorporateService);

  readonly organization = signal<Organization | null>(null);
  readonly locations = signal<OrganizationLocation[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly toastMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Add Location Modal
  readonly showModal = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);

  label = '';
  line1 = '';
  line2 = '';
  city = '';
  state = '';
  postalCode = '';
  country = 'India';
  latitude: number | null = null;
  longitude: number | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        if (org) {
          this.loadLocations(org.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load corporate organization profile.');
      },
    });
  }

  private loadLocations(orgId: number): void {
    this.corporate.listLocations(orgId).subscribe({
      next: (locs) => {
        this.locations.set(locs || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load servicing locations from server.');
      },
    });
  }

  openAddModal(): void {
    this.label = '';
    this.line1 = '';
    this.line2 = '';
    this.city = 'Chennai';
    this.state = 'Tamil Nadu';
    this.postalCode = '600001';
    this.country = 'India';
    this.latitude = 13.0827;
    this.longitude = 80.2707;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitAddLocation(): void {
    const org = this.organization();
    if (!org || !this.line1.trim() || !this.city.trim()) {
      this.showToast('Please provide a street address and city.', 'error');
      return;
    }

    this.submitting.set(true);
    this.corporate
      .addLocation(org.id, {
        label: this.label.trim() || 'Fleet Yard / Branch',
        line1: this.line1.trim(),
        line2: this.line2.trim() || undefined,
        city: this.city.trim(),
        state: this.state.trim() || 'Tamil Nadu',
        postalCode: this.postalCode.trim() || '600001',
        country: this.country.trim() || 'India',
        latitude: this.latitude ?? undefined,
        longitude: this.longitude ?? undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showToast('Corporate servicing hub added successfully.', 'success');
          this.closeModal();
          this.loadLocations(org.id);
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || 'Failed to add servicing location.';
          this.showToast(msg, 'error');
        },
      });
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage.set({ text, type });
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
