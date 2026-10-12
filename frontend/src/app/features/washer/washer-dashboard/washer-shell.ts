import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WasherService } from '../../../core/services/washer.service';
import { Subscription, interval } from 'rxjs';

interface WasherNavLink {
  label: string;
  path: string;
  icon: string;
  badge?: number;
  exact?: boolean;
}

@Component({
  selector: 'app-washer-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './washer-shell.html',
  styleUrl: './washer-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherShell implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly washerService = inject(WasherService);
  private readonly router = inject(Router);

  readonly washerName = signal<string>('Partner');
  readonly washerAvatar = signal<string>('W');
  readonly washerRating = signal<number>(5.0);
  readonly isOnline = this.washerService.isOnline;
  readonly pendingOffersCount = signal<number>(0);
  readonly unreadNotificationsCount = signal<number>(0);
  readonly loggingOut = signal<boolean>(false);
  readonly showLogoutConfirm = signal<boolean>(false);

  readonly navLinks: WasherNavLink[] = [
    { label: 'Dashboard', path: '/washer', icon: 'dashboard', exact: true },
    { label: 'My Jobs', path: '/washer/jobs', icon: 'event' },
    { label: 'Availability', path: '/washer/availability', icon: 'schedule' },
    { label: 'Earnings', path: '/washer/earnings', icon: 'payments' },
    { label: 'Leaderboard', path: '/washer/leaderboard', icon: 'leaderboard' },
    { label: 'Reviews & Feedback', path: '/washer/reviews', icon: 'reviews' },
    { label: 'KYC & Documents', path: '/washer/kyc', icon: 'verified_user' },
    { label: 'Notifications', path: '/washer/notifications', icon: 'notifications' },
    { label: 'Support', path: '/washer/support', icon: 'help' },
    { label: 'Profile', path: '/washer/profile', icon: 'account_circle' },
  ];

  readonly mobileNav = [
    { label: 'Home', path: '/washer', icon: 'dashboard', exact: true },
    { label: 'Jobs', path: '/washer/jobs', icon: 'event' },
    { label: 'Earnings', path: '/washer/earnings', icon: 'payments' },
    { label: 'Profile', path: '/washer/profile', icon: 'account_circle' },
  ];

  private pollSub?: Subscription;

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user?.fullName) {
      this.washerName.set(user.fullName);
      this.washerAvatar.set(user.fullName.charAt(0).toUpperCase());
    }

    this.refreshWasherHeader();

    // Check for pending offers and unread notifications every 15s
    this.pollSub = interval(15000).subscribe(() => {
      this.checkPendingOffers();
      this.checkUnreadNotifications();
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  refreshWasherHeader(): void {
    this.washerService.getMyProfile().subscribe({
      next: (profile) => {
        if (profile?.fullName) {
          this.washerName.set(profile.fullName);
          this.washerAvatar.set(profile.fullName.charAt(0).toUpperCase());
        }
        if (profile?.averageRating) {
          this.washerRating.set(profile.averageRating);
        }
      },
      error: () => {},
    });

    this.washerService.getMyAvailability().subscribe({
      next: () => {},
      error: () => {},
    });

    this.checkPendingOffers();
    this.checkUnreadNotifications();
  }

  checkPendingOffers(): void {
    this.washerService.getMyPendingRequests().subscribe({
      next: (offers) => {
        this.pendingOffersCount.set(offers ? offers.length : 0);
      },
      error: () => {},
    });
  }

  checkUnreadNotifications(): void {
    this.washerService.getUnreadNotificationCount().subscribe({
      next: (res) => {
        this.unreadNotificationsCount.set(res?.unreadCount || 0);
      },
      error: () => {},
    });
  }

  toggleOnline(): void {
    const next = !this.isOnline();
    this.washerService.setOnline(next).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  openLogoutModal(): void {
    this.showLogoutConfirm.set(true);
  }

  cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }

  confirmLogout(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    this.auth.logout();
    this.showLogoutConfirm.set(false);
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onLogout(): void {
    this.openLogoutModal();
  }
}
