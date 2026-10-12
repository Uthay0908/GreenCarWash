import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../../shared/models';

export interface CustomerNavItem {
  label: string;
  path: string;
  icon: string;
  queryParams?: Record<string, string>;
  exact?: boolean;
}

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="customer-sidebar">
      <!-- Brand Logo Header -->
      <div class="sidebar-brand-header">
        <a routerLink="/dashboard" class="brand-link">
          <div class="brand-icon-hexagon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="2"/>
              <path d="M12 7C9.5 7 8 9.5 8 12C8 14.5 10 16 12 17C14 16 16 14.5 16 12C16 9.5 14.5 7 12 7Z" fill="#10b981"/>
              <path d="M12 9V15" stroke="#064e3b" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="brand-name-group">
            <span class="brand-main">GreenCarWash</span>
            <span class="brand-sub">CUSTOMER PORTAL</span>
          </div>
        </a>
      </div>

      <!-- Customer Profile Snippet -->
      @if (user()) {
        <div class="customer-user-card">
          <div class="user-avatar-circle">
            @if (user()?.avatarUrl) {
              <img [src]="user()?.avatarUrl" [alt]="user()?.fullName" class="user-avatar-img" />
            } @else {
              <span>{{ (user()?.fullName || 'C').charAt(0).toUpperCase() }}</span>
            }
          </div>
          <div class="user-meta-info">
            <span class="user-full-name">{{ user()?.fullName || 'Customer' }}</span>
            <span class="user-email-text">{{ user()?.email || 'customer@greencarwash.com' }}</span>
          </div>
        </div>
      }

      <!-- Navigation Links -->
      <nav class="sidebar-nav-container">
        <div class="nav-section-label">MAIN MENU</div>
        @for (item of navItems; track item.label) {
          <a
            [routerLink]="item.path"
            [queryParams]="item.queryParams"
            routerLinkActive="active-nav-link"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            class="nav-link-row"
          >
            <span class="nav-link-icon">
              @switch (item.icon) {
                @case ('home') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                }
                @case ('bolt') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                }
                @case ('package') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                }
                @case ('clipboard') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M9 12h6M9 16h6"></path>
                  </svg>
                }
                @case ('car') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2"></path>
                    <circle cx="7" cy="17" r="2"></circle>
                    <path d="M9 17h6"></path>
                    <circle cx="17" cy="17" r="2"></circle>
                  </svg>
                }
                @case ('map-pin') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                }
                @case ('credit-card') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                }
                @case ('crown') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
                  </svg>
                }
                @case ('gift') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12"></polyline>
                    <rect x="2" y="7" width="20" height="5"></rect>
                    <line x1="12" y1="22" x2="12" y2="7"></line>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                  </svg>
                }
                @case ('droplet') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                }
                @case ('trophy') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"></path>
                    <path d="M18 4H6v7a6 6 0 0 0 12 0V4z"></path>
                  </svg>
                }
                @case ('star') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                }
                @case ('help') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                }
                @case ('user') {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                }
              }
            </span>
            <span class="nav-link-text">{{ item.label }}</span>
            <span class="active-indicator-bar"></span>
          </a>
        }
      </nav>

      <!-- Bottom Pinned Logout Button with Icon & Label -->
      <div class="sidebar-footer-pinned">
        <button
          type="button"
          class="btn-sidebar-logout"
          (click)="logoutRequested.emit()"
        >
          <span class="logout-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span class="logout-label">Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .customer-sidebar {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      position: sticky;
      top: 0;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.02);
      z-index: 100;
    }

    /* Brand Header */
    .sidebar-brand-header {
      padding: 1.5rem 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }
    .brand-icon-hexagon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ecfdf5;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.15);
    }
    .brand-name-group {
      display: flex;
      flex-direction: column;
    }
    .brand-main {
      font-size: 1.125rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .brand-sub {
      font-size: 0.6875rem;
      font-weight: 800;
      color: #059669;
      letter-spacing: 0.08em;
    }

    /* User Profile Card */
    .customer-user-card {
      padding: 1rem 1.25rem;
      margin: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9375rem;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
      overflow: hidden;
    }
    .user-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .user-meta-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-full-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email-text {
      font-size: 0.75rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Nav items container */
    .sidebar-nav-container {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .sidebar-nav-container::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-nav-container::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 4px;
    }

    .nav-section-label {
      font-size: 0.6875rem;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.05em;
      padding: 0.75rem 0.75rem 0.35rem;
    }

    .nav-link-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: 10px;
      text-decoration: none;
      color: #475569;
      font-weight: 600;
      font-size: 0.875rem;
      position: relative;
      transition: all 0.2s ease;
    }
    .nav-link-row:hover {
      background: #f8fafc;
      color: #0f172a;
    }
    .nav-link-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: color 0.2s ease, transform 0.2s ease;
      flex-shrink: 0;
    }
    .nav-link-row:hover .nav-link-icon {
      color: #059669;
      transform: scale(1.08);
    }
    .nav-link-text {
      flex: 1;
    }

    .active-nav-link {
      background: #ecfdf5 !important;
      color: #047857 !important;
      font-weight: 700 !important;
    }
    .active-nav-link .nav-link-icon {
      color: #047857;
    }
    .active-nav-link .active-indicator-bar {
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 3px;
      background: #10b981;
      border-radius: 3px 0 0 3px;
    }

    /* Pinned Logout Footer */
    .sidebar-footer-pinned {
      padding: 1rem;
      border-top: 1px solid #f1f5f9;
      background: #ffffff;
    }
    .btn-sidebar-logout {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #b91c1c;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-sidebar-logout:hover {
      background: #fee2e2;
      border-color: #fecaca;
      color: #991b1b;
    }
    .logout-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }
    .btn-sidebar-logout:hover .logout-icon {
      transform: translateX(-2px);
    }

    @media (max-width: 900px) {
      .customer-sidebar {
        display: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerSidebar {
  readonly user = input<User | null>(null);
  readonly logoutRequested = output<void>();

  readonly navItems: CustomerNavItem[] = [
    { label: 'Home', path: '/dashboard', icon: 'home', exact: true },
    { label: 'Book a Wash', path: '/bookings/new', icon: 'bolt' },
    { label: 'Services & Packages', path: '/services', icon: 'package' },
    { label: 'My Orders', path: '/bookings', icon: 'clipboard' },
    { label: 'Invoices', path: '/invoices', icon: 'credit-card' },
    { label: 'My Vehicles', path: '/vehicles', icon: 'car' },
    { label: 'My Addresses', path: '/addresses', icon: 'map-pin' },
    { label: 'Wallet & Points', path: '/loyalty', queryParams: { tab: 'wallet' }, icon: 'credit-card' },
    { label: 'Membership', path: '/loyalty', queryParams: { tab: 'membership' }, icon: 'crown' },
    { label: 'Refer & Earn', path: '/loyalty', queryParams: { tab: 'referral' }, icon: 'gift' },
    { label: 'Water Saving', path: '/loyalty', queryParams: { tab: 'water' }, icon: 'droplet' },
    { label: 'Leaderboard', path: '/loyalty', queryParams: { tab: 'leaderboard' }, icon: 'trophy' },
    { label: 'Reviews & Ratings', path: '/reviews', icon: 'star' },
    { label: 'Support & Help', path: '/support', icon: 'help' },
    { label: 'Customer Profile', path: '/dashboard/profile', icon: 'user' },
  ];
}
