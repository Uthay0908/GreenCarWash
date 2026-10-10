import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

export interface AdminNavGroup {
  name: string;
  items: {
    label: string;
    path: string;
    icon: string;
    exact?: boolean;
    badge?: string;
  }[];
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly showLogoutModal = signal<boolean>(false);
  readonly unreadNotifications = signal<number>(2);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly pageTitle = computed(() => {
    const url = this.currentUrl().split('?')[0];
    if (url.includes('/admin/users')) return 'Customers Management';
    if (url.includes('/admin/vehicles')) return 'Platform Vehicles';
    if (url.includes('/admin/washers')) return 'Washers & KYC Verification';
    if (url.includes('/admin/bookings')) return 'System Bookings';
    if (url.includes('/admin/payments')) return 'Payments & Refund Queue';
    if (url.includes('/admin/reviews')) return 'Reviews & Moderation';
    if (url.includes('/admin/reports')) return 'Loyalty & Rewards';
    if (url.includes('/admin/service-areas')) return 'Service Area Zones';
    if (url.includes('/admin/promotions')) return 'Promotions & Discounts';
    if (url.includes('/admin/pricing')) return 'Dynamic Pricing Rules';
    if (url.includes('/admin/system-config')) return 'System Settings';
    if (url.includes('/admin/audit-logs')) return 'Audit Trail & Compliance';
    if (url.includes('/admin/profile')) return 'Admin Profile & Security';
    return 'Dashboard Overview';
  });

  readonly userDisplayName = computed(() => {
    const u = this.currentUser();
    return u?.fullName || 'Super Administrator';
  });

  readonly adminEmail = computed(() => {
    return this.currentUser()?.email || 'greencarwashproject@gmail.com';
  });

  readonly navGroups: AdminNavGroup[] = [
    {
      name: 'CORE MANAGEMENT',
      items: [
        { label: 'Dashboard', path: '/admin', icon: 'dashboard', exact: true },
        { label: 'Customers', path: '/admin/users', icon: 'users' },
        { label: 'Vehicles', path: '/admin/vehicles', icon: 'vehicles' },
        { label: 'Washers', path: '/admin/washers', icon: 'washers' },
        { label: 'Bookings', path: '/admin/bookings', icon: 'bookings' },
      ],
    },
    {
      name: 'FINANCE & COMMERCE',
      items: [
        { label: 'Payments & Invoices', path: '/admin/payments', icon: 'payments' },
        { label: 'Dynamic Pricing', path: '/admin/pricing', icon: 'pricing' },
        { label: 'Promotions', path: '/admin/promotions', icon: 'promotions' },
        { label: 'Loyalty & Rewards', path: '/admin/reports', icon: 'loyalty' },
      ],
    },
    {
      name: 'OPERATIONS & COVERAGE',
      items: [
        { label: 'Service Areas', path: '/admin/service-areas', icon: 'service-areas' },
        { label: 'Reviews', path: '/admin/reviews', icon: 'reviews' },
      ],
    },
    {
      name: 'SYSTEM & COMPLIANCE',
      items: [
        { label: 'System Settings', path: '/admin/system-config', icon: 'settings' },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: 'audit-logs' },
        { label: 'Admin Profile', path: '/admin/profile', icon: 'profile' },
      ],
    },
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  promptLogout(): void {
    this.showLogoutModal.set(true);
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }

  confirmLogout(): void {
    this.showLogoutModal.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
