import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-customer-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="gcw-customer-bottom-nav">
      <a routerLink="/dashboard" routerLinkActive="active-bottom-item" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav-item">
        <span class="nav-icon">
          <svg class="nav-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <span class="nav-label">Home</span>
      </a>

      <a routerLink="/bookings/new" routerLinkActive="active-bottom-item" class="bottom-nav-item item-highlight-book">
        <div class="book-action-bubble">
          <svg class="book-action-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        <span class="nav-label">Book</span>
      </a>

      <a routerLink="/bookings" routerLinkActive="active-bottom-item" class="bottom-nav-item">
        <span class="nav-icon">
          <svg class="nav-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M9 12h6M9 16h6"></path>
          </svg>
        </span>
        <span class="nav-label">Orders</span>
      </a>

      <a routerLink="/loyalty" routerLinkActive="active-bottom-item" class="bottom-nav-item">
        <span class="nav-icon">
          <svg class="nav-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </span>
        <span class="nav-label">Wallet</span>
      </a>

      <a routerLink="/dashboard/profile" routerLinkActive="active-bottom-item" class="bottom-nav-item">
        <span class="nav-icon">
          <svg class="nav-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <span class="nav-label">Profile</span>
      </a>
    </nav>
  `,
  styles: [`
    .gcw-customer-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
      z-index: 1000;
      justify-content: space-around;
      align-items: center;
      padding: 0 0.5rem;
    }

    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.2rem;
      text-decoration: none;
      color: #64748b;
      font-size: 0.6875rem;
      font-weight: 700;
      flex: 1;
      height: 100%;
      transition: color 0.2s ease;
      position: relative;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-svg {
      transition: stroke 0.2s ease, transform 0.2s ease;
    }

    .active-bottom-item {
      color: #059669 !important;
    }
    .active-bottom-item .nav-icon {
      transform: translateY(-2px);
    }
    .active-bottom-item .nav-svg {
      stroke: #059669;
    }

    /* Highlighted Book Bubble in Center */
    .item-highlight-book {
      position: relative;
    }
    .book-action-bubble {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
      margin-top: -18px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .item-highlight-book:hover .book-action-bubble {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
    }
    .book-action-svg {
      display: block;
    }

    @media (max-width: 900px) {
      .gcw-customer-bottom-nav {
        display: flex;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerBottomNav {}
