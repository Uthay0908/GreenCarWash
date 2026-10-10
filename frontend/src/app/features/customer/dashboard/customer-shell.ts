import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoyaltyService } from '../../../core/services/loyalty.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import {
  CustomerSidebar,
  CustomerHeader,
  CustomerBottomNav,
  CustomerConfirmDialog,
} from '../design-system';

@Component({
  selector: 'app-customer-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    CustomerSidebar,
    CustomerHeader,
    CustomerBottomNav,
    CustomerConfirmDialog,
  ],
  templateUrl: './customer-shell.html',
  styleUrl: './customer-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerShell implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loyaltyService = inject(LoyaltyService);
  private readonly notificationService = inject(NotificationService);
  private readonly userService = inject(UserService);

  readonly showLogoutModal = signal(false);
  readonly waterSaved = signal(240);
  readonly unreadNotifications = signal(2);

  ngOnInit(): void {
    // Sync current customer profile details (name, phone, avatar) from backend
    this.userService.getMyProfile().subscribe({
      next: (profile) => {
        if (profile && profile.fullName) {
          this.auth.updateCurrentUser({
            fullName: profile.fullName,
            phone: profile.phone || undefined,
            avatarUrl: profile.avatarUrl || undefined,
          });
        }
      },
      error: () => {},
    });
    // Dynamically retrieve water saved summary
    this.loyaltyService.getWaterSavingsSummary().subscribe({
      next: (summary) => {
        if (summary && summary.totalWaterSaved != null) {
          const val = Number(summary.totalWaterSaved);
          if (val > 0) this.waterSaved.set(val);
        }
      },
      error: () => {},
    });

    // Dynamically retrieve unread notification count
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        if (res && res.count != null) {
          this.unreadNotifications.set(res.count);
        }
      },
      error: () => {},
    });
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
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
