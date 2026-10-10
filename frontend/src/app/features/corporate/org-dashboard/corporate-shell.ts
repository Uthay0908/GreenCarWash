import { ChangeDetectionStrategy, Component, inject, computed, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CorporateService } from '../../../core/services/corporate.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface NavGroup {
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
  selector: 'app-corporate-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './corporate-shell.html',
  styleUrl: './corporate-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateShell implements OnInit {
  private readonly corporate = inject(CorporateService);
  private readonly auth = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly organization = this.corporate.activeOrganization;
  readonly corporateRole = this.corporate.corporateRole;
  readonly currentUser = this.auth.currentUser;
  readonly unreadNotifications = signal<number>(0);
  readonly mobileMenuOpen = signal<boolean>(false);
  readonly showLogoutModal = signal<boolean>(false);

  readonly orgInitial = computed(() => {
    const name = this.organization()?.name || 'Corporate';
    return name.charAt(0).toUpperCase();
  });

  readonly userDisplayName = computed(() => {
    const u = this.currentUser();
    return u?.fullName || u?.email?.split('@')[0] || 'Fleet Admin';
  });

  readonly navGroups: NavGroup[] = [
    {
      name: 'MAIN MENU',
      items: [
        { label: 'Overview Dashboard', path: '/corporate', icon: 'dashboard', exact: true },
        { label: 'Fleet Vehicles', path: '/corporate/fleet', icon: 'fleet' },
        { label: 'Team & Drivers', path: '/corporate/members', icon: 'team' },
        { label: 'Servicing Hubs', path: '/corporate/locations', icon: 'location' },
      ],
    },
    {
      name: 'FLEET OPERATIONS',
      items: [
        { label: 'Bulk & Recurring', path: '/corporate/bookings', icon: 'bookings' },
        { label: 'Service Catalog', path: '/corporate/packages', icon: 'packages' },
        { label: 'Wash History & Live', path: '/corporate/history', icon: 'history' },
        { label: 'Reports & Analytics', path: '/corporate/reports', icon: 'reports' },
      ],
    },
    {
      name: 'FINANCE & BILLING',
      items: [
        { label: 'Payments & Transactions', path: '/corporate/payments', icon: 'payments' },
        { label: 'Billing & Invoices', path: '/corporate/billing', icon: 'billing' },
      ],
    },
    {
      name: 'ACCOUNT & SUPPORT',
      items: [
        { label: 'Notifications', path: '/corporate/notifications', icon: 'notifications' },
        { label: 'Support Help Desk', path: '/corporate/support', icon: 'support' },
        { label: 'Company Profile', path: '/corporate/organization', icon: 'organization' },
      ],
    },
  ];

  ngOnInit(): void {
    // Refresh organization info from backend
    this.corporate.getMyOrganization().subscribe({
      next: () => {},
      error: () => {},
    });

    // Check live unread notifications
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => this.unreadNotifications.set(res?.count || 0),
      error: () => {},
    });
  }

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
    this.corporate.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
