import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Booking, Vehicle, WashPackage } from '../../../shared/models';
import {
  CustomerCard,
  CustomerButton,
  CustomerStatusBadge,
  CustomerEmptyState,
  CustomerSkeleton,
} from '../design-system';

export interface EnrichedPackage extends WashPackage {
  image: string;
  popular?: boolean;
}

const PACKAGE_IMAGES: Record<string, string> = {
  'Eco Express Shine': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80',
  'Premium Ceramic Steam': 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&auto=format&fit=crop&q=80',
  'Deep Interior & Exterior Detox': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80',
};

const DEFAULT_PKG_IMAGE = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CustomerCard,
    CustomerButton,
    CustomerStatusBadge,
    CustomerEmptyState,
    CustomerSkeleton,
  ],
  templateUrl: './dashboard-overview.html',
  styleUrl: './dashboard-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardOverview implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly bookingService = inject(BookingService);
  private readonly loyaltyService = inject(LoyaltyService);
  private readonly vehicleService = inject(VehicleService);
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);

  private pollSub?: Subscription;

  // User meta
  readonly customerName = computed(() => this.auth.currentUser()?.fullName || 'Valued Customer');
  readonly customerFirstName = computed(() => {
    const full = this.auth.currentUser()?.fullName || 'Customer';
    return full.split(' ')[0];
  });
  readonly customerLocation = signal<string>('San Francisco, CA');
  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  // Section 1: Active Booking State
  readonly bookingLoading = signal(true);
  readonly bookingError = signal<string | null>(null);
  readonly activeBooking = signal<Booking | null>(null);

  // Section 2: Vehicles State
  readonly vehiclesLoading = signal(true);
  readonly vehiclesError = signal<string | null>(null);
  readonly vehicles = signal<Vehicle[]>([]);

  // Section 3: Popular Packages State
  readonly packagesLoading = signal(true);
  readonly packagesError = signal<string | null>(null);
  readonly packages = signal<EnrichedPackage[]>([]);

  // Section 4: Water Saving State
  readonly waterLoading = signal(true);
  readonly waterError = signal<string | null>(null);
  readonly waterSavedLiters = signal<number>(0);
  readonly bathtubsSaved = computed(() => Math.max(1, Math.round(this.waterSavedLiters() / 60)));

  // Section 5: Loyalty & Wallet State
  readonly loyaltyLoading = signal(true);
  readonly loyaltyError = signal<string | null>(null);
  readonly loyaltyPoints = signal<number>(0);
  readonly loyaltyTier = signal<string>('BRONZE');
  readonly walletBalance = signal<number>(0);
  readonly activeOffersCount = signal<number>(3);

  // Section 6: Recent Orders State
  readonly ordersLoading = signal(true);
  readonly ordersError = signal<string | null>(null);
  readonly recentOrders = signal<Booking[]>([]);

  ngOnInit(): void {
    this.refreshAll();
    // Poll every 3 seconds for active order status updates
    this.pollSub = interval(3000).subscribe(() => {
      this.loadActiveBookingAndOrders(true);
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  refreshAll(): void {
    this.loadActiveBookingAndOrders();
    this.loadVehicles();
    this.loadPackages();
    this.loadLoyaltyAndWater();
  }

  // --- 1 & 6: Active Booking & Recent Orders ---
  loadActiveBookingAndOrders(silent = false): void {
    if (!silent) {
      this.bookingLoading.set(true);
      this.bookingError.set(null);
      this.ordersLoading.set(true);
      this.ordersError.set(null);
    }

    this.bookingService.listMine().subscribe({
      next: (list) => {
        if (!silent) {
          this.bookingLoading.set(false);
          this.ordersLoading.set(false);
        }

        if (!list || list.length === 0) {
          this.activeBooking.set(null);
          this.recentOrders.set([]);
          return;
        }

        const ACTIVE_STATUSES = [
          'PENDING',
          'ASSIGNMENT_PENDING',
          'ASSIGNED',
          'ACCEPTED',
          'ON_THE_WAY',
          'ARRIVED',
          'IN_PROGRESS',
          'ADDITIONAL_PAYMENT_PENDING',
          'VERIFICATION_PENDING',
          'BOOKED',
          'CONFIRMED',
        ];

        // Sort latest first by id
        const sortedList = [...list].sort((a, b) => b.id - a.id);

        // Find current live booking
        const live = sortedList.find((b) => ACTIVE_STATUSES.includes(b.status));
        this.activeBooking.set(live || null);

        // Recent orders (up to 4 past/current orders)
        this.recentOrders.set(sortedList.slice(0, 4));

        // If waterSaved from completed bookings is available, accumulate
        const completedWashes = list.filter((b) => b.status === 'COMPLETED');
        if (completedWashes.length > 0 && this.waterSavedLiters() === 0) {
          this.waterSavedLiters.set(completedWashes.length * 40);
        }
      },
      error: (err) => {
        this.bookingLoading.set(false);
        this.ordersLoading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to load booking details.';
        this.bookingError.set(msg);
        this.ordersError.set(msg);
      },
    });
  }

  // --- 2: Vehicles ---
  loadVehicles(): void {
    this.vehiclesLoading.set(true);
    this.vehiclesError.set(null);

    this.vehicleService.list().subscribe({
      next: (data) => {
        this.vehiclesLoading.set(false);
        this.vehicles.set(data || []);
      },
      error: (err) => {
        this.vehiclesLoading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to load registered vehicles.';
        this.vehiclesError.set(msg);
      },
    });
  }

  // --- 3: Catalog Packages ---
  loadPackages(): void {
    this.packagesLoading.set(true);
    this.packagesError.set(null);

    this.catalogService.listPackages().subscribe({
      next: (data) => {
        this.packagesLoading.set(false);
        const enriched: EnrichedPackage[] = (data || []).map((p, idx) => ({
          ...p,
          image: PACKAGE_IMAGES[p.name] || DEFAULT_PKG_IMAGE,
          popular: idx === 1 || p.name.includes('Ceramic'),
        }));
        this.packages.set(enriched);
      },
      error: (err) => {
        this.packagesLoading.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to load wash catalog packages.';
        this.packagesError.set(msg);
      },
    });
  }

  // --- 4 & 5: Water Savings & Loyalty ---
  loadLoyaltyAndWater(): void {
    this.loyaltyLoading.set(true);
    this.loyaltyError.set(null);
    this.waterLoading.set(true);
    this.waterError.set(null);

    // Fetch Loyalty
    this.loyaltyService.getMyLoyalty().subscribe({
      next: (acc) => {
        this.loyaltyLoading.set(false);
        if (acc) {
          this.loyaltyPoints.set(acc.pointsBalance ?? 0);
          this.loyaltyTier.set(acc.tier || 'BRONZE');
        }
      },
      error: () => {
        this.loyaltyLoading.set(false);
      },
    });

    // Fetch Water Savings Summary
    this.loyaltyService.getWaterSavingsSummary().subscribe({
      next: (res) => {
        this.waterLoading.set(false);
        if (res && res.totalWaterSaved != null) {
          const val = Number(res.totalWaterSaved) || 0;
          this.waterSavedLiters.set(val > 0 ? val : 0);
        }
      },
      error: () => {
        this.waterLoading.set(false);
      },
    });

    // Fetch Wallet
    this.loyaltyService.getWallet().subscribe({
      next: (wallet) => {
        if (wallet && wallet.balance != null) {
          this.walletBalance.set(wallet.balance);
        }
      },
      error: () => {},
    });
  }

  // Live Tracking Stage Helpers
  getLiveStage(status?: string): number {
    if (!status) return 1;
    switch (status) {
      case 'PENDING':
      case 'ASSIGNMENT_PENDING':
      case 'BOOKED':
      case 'CONFIRMED':
        return 1;
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 2;
      case 'ON_THE_WAY':
        return 3;
      case 'ARRIVED':
      case 'IN_PROGRESS':
      case 'ADDITIONAL_PAYMENT_PENDING':
      case 'VERIFICATION_PENDING':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  }

  getLiveStatusHeadline(status?: string): string {
    if (!status) return 'Wash Booked — Waiting for Assignment';
    switch (status) {
      case 'PENDING':
      case 'ASSIGNMENT_PENDING':
      case 'BOOKED':
      case 'CONFIRMED':
        return 'Wash Booked — Assigning Certified Technician';
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 'Washer Assigned — Prepping Waterless Steam Equipment';
      case 'ON_THE_WAY':
        return 'Washer On The Way — Arriving at Your Doorstep';
      case 'ARRIVED':
        return 'Washer Arrived — Inspection & Setup Underway';
      case 'IN_PROGRESS':
        return 'Eco Steam Washing in Progress — 100% Water-Saving Clean';
      case 'VERIFICATION_PENDING':
        return 'Quality Inspection — Uploading Completion Photos';
      case 'COMPLETED':
        return 'Wash Completed — Sparkle Clean!';
      default:
        return 'Wash in Progress';
    }
  }

  getLiveStatusDesc(status?: string): string {
    if (!status) return 'Your wash booking is confirmed. We are assigning a top-rated washer in your neighborhood.';
    switch (status) {
      case 'PENDING':
      case 'ASSIGNMENT_PENDING':
        return 'Your wash booking is confirmed! Our smart dispatch engine is assigning a top-rated washer in your neighborhood.';
      case 'ASSIGNED':
      case 'ACCEPTED':
        return 'Technician has accepted your booking and is preparing biodegradable eco solutions.';
      case 'ON_THE_WAY':
        return 'Technician is en route with mobile steam equipment. Please ensure parking spot access.';
      case 'ARRIVED':
        return 'Washer has parked nearby and has initiated pre-wash digital inspection.';
      case 'IN_PROGRESS':
        return 'Exterior and interior steam cleaning is active. Pure steam sanitizes and preserves 300+ liters of water.';
      case 'VERIFICATION_PENDING':
        return 'Washing finished! Technician is reviewing checklist items and capturing after-wash photos.';
      default:
        return 'Active doorstep wash service in progress.';
    }
  }

  getLiveEta(status?: string): string {
    if (!status) return 'Scheduled';
    switch (status) {
      case 'ON_THE_WAY':
        return 'ETA ~12 mins';
      case 'ARRIVED':
        return 'At Location';
      case 'IN_PROGRESS':
        return '~20 mins left';
      case 'VERIFICATION_PENDING':
        return 'Finalizing';
      default:
        return 'Scheduled';
    }
  }

  // Helper actions
  bookPackage(pkg: EnrichedPackage): void {
    this.router.navigate(['/bookings/new'], {
      queryParams: { packageId: pkg.id, packageName: pkg.name },
    });
  }

  callWasher(): void {
    window.open('tel:+18005550199', '_self');
  }

  chatWasher(): void {
    this.router.navigate(['/support']);
  }
}
