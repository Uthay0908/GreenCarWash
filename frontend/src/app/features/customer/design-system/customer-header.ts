import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../shared/models';
import { NotificationItem, NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <header class="gcw-customer-header">
      <!-- Left side: Clean Portal Title -->
      <div class="header-left-area">
        <span class="header-portal-title">Customer Portal</span>
      </div>

      <!-- Right side: Notifications & Profile Button -->
      <div class="header-actions-group">

        <!-- Notification Bell & Dropdown Wrapper -->
        <div class="notif-wrapper-anchor">
          <button
            type="button"
            class="btn-header-notif"
            [class.is-open]="showNotifs()"
            (click)="toggleNotifications()"
            title="Notifications & Updates"
            aria-label="Notifications"
          >
            <svg class="notif-bell-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            @if (effectiveUnreadCount() > 0) {
              <span class="notif-unread-dot"></span>
            }
          </button>

          <!-- Notifications Dropdown Popover -->
          @if (showNotifs()) {
            <div class="notif-dropdown-popover">
              <div class="notif-popover-header">
                <div class="notif-title-row">
                  <span class="notif-h-text">Notifications</span>
                  @if (effectiveUnreadCount() > 0) {
                    <span class="notif-count-chip">{{ effectiveUnreadCount() }} New</span>
                  }
                </div>
                @if (effectiveUnreadCount() > 0) {
                  <button type="button" class="btn-mark-all" (click)="markAllAsRead()">
                    Mark all read
                  </button>
                }
              </div>

              <!-- Notifications List -->
              <div class="notif-items-scroll-list">
                @if (notifications().length === 0) {
                  <div class="notif-empty-state">
                    <div class="notif-empty-icon-wrap">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                      </svg>
                    </div>
                    <strong class="notif-empty-title">All caught up!</strong>
                    <span class="notif-empty-desc">No new alerts or service updates.</span>
                  </div>
                } @else {
                  @for (n of notifications(); track n.id) {
                    <div
                      class="notif-item-row"
                      [class.is-unread]="!n.read"
                      (click)="markAsRead(n)"
                    >
                      <div class="notif-type-icon-bubble">
                        @switch (getNotificationIconType(n.eventType || n.channel)) {
                          @case ('booking') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                            </svg>
                          }
                          @case ('water') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                            </svg>
                          }
                          @case ('reward') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                              <polyline points="20 12 20 22 4 22 4 12"></polyline>
                              <rect x="2" y="7" width="20" height="5"></rect>
                              <line x1="12" y1="22" x2="12" y2="7"></line>
                              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                            </svg>
                          }
                          @case ('support') {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          }
                          @default {
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                          }
                        }
                      </div>
                      <div class="notif-text-col">
                        <strong class="notif-title-line">{{ n.title }}</strong>
                        <p class="notif-msg-line">{{ n.message }}</p>
                        <span class="notif-time-line">{{ n.createdAt | date:'shortTime' }}</span>
                      </div>
                      @if (!n.read) {
                        <span class="unread-blue-dot"></span>
                      }
                    </div>
                  }
                }
              </div>

              <div class="notif-popover-footer">
                <a routerLink="/loyalty" [queryParams]="{ tab: 'water' }" (click)="showNotifs.set(false)" class="footer-promo-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                  </svg>
                  Check your eco leaderboard standing →
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Profile Quick Access -->
        <a routerLink="/dashboard/profile" class="btn-header-profile" title="View & Edit Profile" aria-label="Customer Profile">
          <svg class="profile-user-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>
      </div>
    </header>
  `,
  styles: [`
    .gcw-customer-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.875rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 90;
      backdrop-filter: blur(8px);
      background: rgba(255, 255, 255, 0.95);
    }

    .header-user-greeting {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .header-avatar-link {
      text-decoration: none;
    }

    .customer-avatar-pill {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
      transition: transform 0.2s ease;
      overflow: hidden;
    }
    .customer-avatar-pill:hover {
      transform: scale(1.05);
    }
    .header-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .header-eco-brand-badge {
      display: flex;
      align-items: center;
    }

    .header-water-impact-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .header-water-impact-banner:hover {
      background: #d1fae5;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .header-eco-details {
      display: flex;
      flex-direction: column;
    }

    .eco-badge-tag {
      font-size: 0.65rem;
      font-weight: 800;
      color: #059669;
      letter-spacing: 0.05em;
    }

    .eco-badge-val {
      font-size: 0.875rem;
      font-weight: 800;
      color: #065f46;
    }

    .header-actions-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .water-saved-pill {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      font-size: 0.8125rem;
      font-weight: 700;
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .water-saved-pill:hover {
      background: #d1fae5;
    }

    .water-drop-icon {
      font-size: 0.9375rem;
    }

    .notif-wrapper-anchor {
      position: relative;
    }

    .btn-header-notif,
    .btn-header-profile {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      position: relative;
      color: #475569;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .btn-header-notif:hover,
    .btn-header-profile:hover,
    .btn-header-notif.is-open {
      background: #ecfdf5;
      border-color: #10b981;
      color: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .notif-bell-svg,
    .profile-user-svg {
      transition: transform 0.2s ease;
    }
    .btn-header-notif:hover .notif-bell-svg {
      transform: rotate(14deg);
    }
    .btn-header-profile:hover .profile-user-svg {
      transform: scale(1.1);
    }

    .notif-unread-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #ef4444;
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }

    /* Notification Dropdown Popover */
    .notif-dropdown-popover {
      position: absolute;
      top: calc(100% + 12px);
      right: -20px;
      width: 340px;
      max-width: calc(100vw - 32px);
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
      z-index: 1000;
      overflow: hidden;
      animation: popIn 0.2s ease;
    }
    @keyframes popIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .notif-popover-header {
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .notif-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .notif-h-text {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }
    .notif-count-chip {
      background: #ecfdf5;
      color: #047857;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }
    .btn-mark-all {
      background: none;
      border: none;
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-mark-all:hover {
      text-decoration: underline;
    }

    .notif-items-scroll-list {
      max-height: 320px;
      overflow-y: auto;
    }
    .notif-empty-state {
      padding: 2.5rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .notif-empty-ico {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .notif-empty-title {
      font-size: 0.9rem;
      color: #0f172a;
    }
    .notif-empty-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.2rem;
    }

    .notif-item-row {
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid #f8fafc;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
      transition: background 0.15s ease;
      position: relative;
    }
    .notif-item-row:hover {
      background: #f8fafc;
    }
    .notif-item-row.is-unread {
      background: #f0fdf4;
    }
    .notif-type-icon-bubble {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      flex-shrink: 0;
    }
    .notif-text-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .notif-title-line {
      font-size: 0.825rem;
      color: #0f172a;
      line-height: 1.3;
    }
    .notif-msg-line {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
      line-height: 1.3;
    }
    .notif-time-line {
      font-size: 0.675rem;
      color: #94a3b8;
      margin-top: 0.2rem;
    }
    .unread-blue-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      margin-top: 0.4rem;
      flex-shrink: 0;
    }

    .notif-popover-footer {
      padding: 0.75rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }
    .footer-promo-link {
      font-size: 0.75rem;
      font-weight: 700;
      color: #059669;
      text-decoration: none;
    }
    .footer-promo-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .water-saved-pill {
        display: none;
      }
      .customer-greeting-title {
        font-size: 0.9375rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerHeader implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly user = input<User | null>(null);
  readonly location = input<string>('San Francisco, CA');
  readonly waterSaved = input<number>(240);
  readonly unreadNotifs = input<number>(2);

  readonly showNotifs = signal(false);
  readonly notifications = signal<NotificationItem[]>([
    {
      id: 1,
      recipientId: 1,
      title: 'Booking Confirmed',
      message: 'Your Eco Steam Wash is scheduled. Certified washer arriving soon.',
      eventType: 'BOOKING_CONFIRMED',
      read: false,
      channel: 'IN_APP',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      recipientId: 1,
      title: 'Water Saved Milestone! 💧',
      message: 'You have saved over 200 Liters of water with doorstep steam cleaning!',
      eventType: 'WATER_MILESTONE',
      read: false,
      channel: 'IN_APP',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      recipientId: 1,
      title: 'Referral Credit Added',
      message: 'Your friend joined! $15 has been credited to your GreenCarWash wallet.',
      eventType: 'REFERRAL_REWARD',
      read: true,
      channel: 'IN_APP',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  readonly effectiveUnreadCount = computed(() => {
    return this.notifications().filter((n) => !n.read).length;
  });

  readonly firstName = computed(() => {
    const name = this.user()?.fullName || 'Customer';
    return name.split(' ')[0];
  });

  readonly greetingText = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.listMine().subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          this.notifications.set(list);
        }
      },
      error: () => {},
    });
  }

  toggleNotifications(): void {
    this.showNotifs.update((v) => !v);
    if (this.showNotifs()) {
      this.loadNotifications();
    }
  }

  markAsRead(item: NotificationItem): void {
    if (item.read) return;
    this.notifications.update((list) =>
      list.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    this.notificationService.markAsRead(item.id).subscribe({
      error: () => {},
    });
  }

  markAllAsRead(): void {
    this.notifications.update((list) =>
      list.map((n) => ({ ...n, read: true }))
    );
    this.notifications().forEach((n) => {
      this.notificationService.markAsRead(n.id).subscribe({ error: () => {} });
    });
  }

  getNotificationIconType(type?: string): 'booking' | 'water' | 'reward' | 'support' | 'bell' {
    const t = (type || '').toUpperCase();
    if (t.includes('BOOK')) return 'booking';
    if (t.includes('WATER') || t.includes('ECO')) return 'water';
    if (t.includes('REFER') || t.includes('WALLET') || t.includes('CREDIT')) return 'reward';
    if (t.includes('SUPPORT') || t.includes('TICKET')) return 'support';
    return 'bell';
  }
}
