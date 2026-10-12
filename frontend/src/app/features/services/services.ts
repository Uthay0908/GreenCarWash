import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { WashPackage, AddOn } from '../../shared/models';
import {
  CustomerCard,
  CustomerButton,
  CustomerStatusBadge,
  CustomerModal,
  CustomerEmptyState,
  CustomerSkeleton,
} from '../customer/design-system';

export interface PackagePhotoMapping {
  [key: number]: string;
}

const PACKAGE_IMAGES: PackagePhotoMapping = {
  1: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80',
  2: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=80',
  3: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
};

const DEFAULT_PACKAGE_IMAGE = 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=800&auto=format&fit=crop&q=80';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    CustomerCard,
    CustomerButton,
    CustomerModal,
    CustomerEmptyState,
    CustomerSkeleton,
  ],
  templateUrl: './services.html',
  styleUrl: './services.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly packages = signal<WashPackage[]>([]);
  readonly addOns = signal<AddOn[]>([]);

  // Filter state
  readonly selectedVehicleFilter = signal<string>('ALL');
  readonly selectedCategoryFilter = signal<'ALL' | 'EXTERIOR' | 'INTERIOR' | 'PREMIUM'>('ALL');
  readonly activeTab = signal<'PACKAGES' | 'ADDONS'>('PACKAGES');

  // Selected package for modal details
  readonly detailPackage = signal<WashPackage | null>(null);

  // Available vehicle filter options derived from real packages
  readonly vehicleFilterOptions = computed(() => {
    const set = new Set<string>();
    this.packages().forEach((p) => {
      (p.suitableVehicleTypes || []).forEach((v) => set.add(v));
    });
    return ['ALL', ...Array.from(set)];
  });

  // Filtered packages
  readonly filteredPackages = computed(() => {
    const vf = this.selectedVehicleFilter();
    const cf = this.selectedCategoryFilter();

    return this.packages().filter((pkg) => {
      // Vehicle type filter
      const matchesVehicle =
        vf === 'ALL' ||
        !pkg.suitableVehicleTypes ||
        pkg.suitableVehicleTypes.length === 0 ||
        pkg.suitableVehicleTypes.includes(vf);

      // Category filter
      let matchesCategory = true;
      if (cf !== 'ALL') {
        const text = `${pkg.name} ${pkg.description}`.toLowerCase();
        if (cf === 'EXTERIOR') {
          matchesCategory = text.includes('exterior') || text.includes('shine');
        } else if (cf === 'INTERIOR') {
          matchesCategory = text.includes('interior') || text.includes('vacuum') || text.includes('shampoo');
        } else if (cf === 'PREMIUM') {
          matchesCategory = text.includes('ceramic') || text.includes('detox') || text.includes('premium') || pkg.price > 600;
        }
      }

      return matchesVehicle && matchesCategory;
    });
  });

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.loading.set(true);
    this.error.set(null);

    this.catalog.listPackages().subscribe({
      next: (pkgList) => {
        this.packages.set(pkgList || []);
        this.catalog.listAddOns().subscribe({
          next: (addonList) => {
            this.addOns.set(addonList || []);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to load service packages from server.');
      },
    });
  }

  setVehicleFilter(filter: string): void {
    this.selectedVehicleFilter.set(filter);
  }

  setCategoryFilter(category: 'ALL' | 'EXTERIOR' | 'INTERIOR' | 'PREMIUM'): void {
    this.selectedCategoryFilter.set(category);
  }

  setActiveTab(tab: 'PACKAGES' | 'ADDONS'): void {
    this.activeTab.set(tab);
  }

  openPackageDetails(pkg: WashPackage): void {
    this.detailPackage.set(pkg);
  }

  closePackageDetails(): void {
    this.detailPackage.set(null);
  }

  bookPackage(pkg: WashPackage): void {
    this.closePackageDetails();
    this.router.navigate(['/bookings/new'], {
      queryParams: { packageId: pkg.id },
    });
  }

  bookWithAddon(addon: AddOn): void {
    this.router.navigate(['/bookings/new'], {
      queryParams: { addOnId: addon.id },
    });
  }

  getPackageImage(pkg: WashPackage): string {
    return PACKAGE_IMAGES[pkg.id] || DEFAULT_PACKAGE_IMAGE;
  }
}
