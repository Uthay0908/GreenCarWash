import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="gcw-header">
      <div class="gcw-container-wide header-inner">
        <!-- Brand Logo -->
        <a routerLink="/" class="brand-logo" aria-label="GreenCarWash Home">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                fill="rgba(2, 132, 199, 0.25)"
                stroke="#0284C7"
              ></path>
              <path
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"
                stroke="#075985"
              ></path>
              <circle cx="7" cy="17" r="2" stroke="#075985"></circle>
              <circle cx="17" cy="17" r="2" stroke="#075985"></circle>
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">Green<span class="accent">CarWash</span></span>
            <span class="brand-tagline">Doorstep Eco Care</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link"
            >Home</a
          >
          <a routerLink="/services" routerLinkActive="active" class="nav-link">Services</a>
          <a routerLink="/packages" routerLinkActive="active" class="nav-link">Packages</a>
          <a routerLink="/how-it-works" routerLinkActive="active" class="nav-link">How It Works</a>
          <a routerLink="/sustainability" routerLinkActive="active" class="nav-link eco-nav">
            <span class="nav-drop">💧</span> Sustainability
          </a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">About</a>
        </nav>

        <!-- Right Side: Impact Badge + Auth / Action CTA -->
        <div class="header-actions">
          <div class="gcw-pill water-pill header-impact-pill">
            <span class="pill-dot"></span>
            <span>200L Saved/Wash</span>
          </div>

          <!-- Logged In User Pill -->
          <ng-container *ngIf="authService.isLoggedIn(); else guestActions">
            <div class="user-pill-container">
              <a [routerLink]="getDashboardRoute()" class="user-profile-badge">
                <div class="user-avatar">
                  {{ (authService.currentUser()?.firstName || 'U')[0] }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ authService.currentUser()?.firstName }}</span>
                  <span class="user-role">{{ authService.currentUser()?.role }}</span>
                </div>
              </a>
              <button class="logout-btn" (click)="authService.logout()" title="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </ng-container>

          <!-- Guest Actions -->
          <ng-template #guestActions>
            <div class="guest-btns">
              <a routerLink="/login" class="gcw-btn gcw-btn-ghost gcw-btn-sm">Sign In</a>
              <a
                routerLink="/customer/book"
                class="gcw-btn gcw-btn-primary gcw-btn-sm header-book-btn"
              >
                <span>Book Wash</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </ng-template>

          <!-- Mobile Menu Toggle Button -->
          <button class="mobile-toggle" (click)="toggleMobileMenu()" aria-label="Toggle navigation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Navigation -->
      <div class="mobile-drawer" *ngIf="isMobileOpen()">
        <nav class="mobile-nav-links">
          <a routerLink="/" (click)="closeMobile()" class="mobile-nav-link">Home</a>
          <a routerLink="/services" (click)="closeMobile()" class="mobile-nav-link">Services</a>
          <a routerLink="/packages" (click)="closeMobile()" class="mobile-nav-link">Packages</a>
          <a routerLink="/how-it-works" (click)="closeMobile()" class="mobile-nav-link"
            >How It Works</a
          >
          <a routerLink="/sustainability" (click)="closeMobile()" class="mobile-nav-link"
            >Sustainability</a
          >
          <a routerLink="/about" (click)="closeMobile()" class="mobile-nav-link">About</a>

          <div class="mobile-nav-divider"></div>

          <ng-container *ngIf="authService.isLoggedIn(); else mobileGuest">
            <a
              [routerLink]="getDashboardRoute()"
              (click)="closeMobile()"
              class="mobile-nav-link highlight"
            >
              My Dashboard ({{ authService.currentUser()?.role }})
            </a>
            <button
              (click)="authService.logout(); closeMobile()"
              class="mobile-nav-link text-danger"
            >
              Log Out
            </button>
          </ng-container>

          <ng-template #mobileGuest>
            <div class="mobile-auth-grid">
              <a routerLink="/login" (click)="closeMobile()" class="gcw-btn gcw-btn-secondary"
                >Sign In</a
              >
              <a routerLink="/customer/book" (click)="closeMobile()" class="gcw-btn gcw-btn-primary"
                >Book Now</a
              >
            </div>
          </ng-template>
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      .gcw-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--gcw-border);
        transition: all 0.3s ease;
      }

      .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 4.75rem;
        gap: 1.5rem;
      }

      .brand-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        flex-shrink: 0;
      }

      .brand-icon {
        width: 2.75rem;
        height: 2.75rem;
        border-radius: var(--radius-md);
        background: #e0f2fe;
        border: 1px solid rgba(2, 132, 199, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-sm);

        svg {
          width: 1.6rem;
          height: 1.6rem;
        }
      }

      .brand-name {
        font-family: var(--font-display);
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--gcw-primary-dark);
        letter-spacing: -0.03em;
        line-height: 1.1;
        display: block;

        .accent {
          color: var(--gcw-secondary);
        }
      }

      .brand-tagline {
        font-size: 0.725rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--gcw-text-light);
        display: block;
      }

      .desktop-nav {
        display: none;
        align-items: center;
        gap: 1.75rem;

        @media (min-width: 992px) {
          display: flex;
        }
      }

      .nav-link {
        font-size: 0.925rem;
        font-weight: 600;
        color: var(--gcw-text-muted);
        text-decoration: none;
        position: relative;
        transition: color 0.2s ease;
        padding: 0.25rem 0;

        &:hover {
          color: var(--gcw-primary);
        }

        &.active {
          color: var(--gcw-primary);

          &::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            right: 0;
            height: 2.5px;
            background: var(--gcw-secondary);
            border-radius: 2px;
          }
        }

        &.eco-nav {
          color: var(--gcw-blue-dark);
          font-weight: 700;
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .header-impact-pill {
        display: none;
        @media (min-width: 1200px) {
          display: inline-flex;
        }

        .pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gcw-blue);
        }
      }

      .user-pill-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .user-profile-badge {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.35rem 0.85rem 0.35rem 0.4rem;
        background: var(--gcw-surface-hover);
        border: 1px solid var(--gcw-border);
        border-radius: var(--radius-pill);
        text-decoration: none;
        transition: all 0.2s;

        &:hover {
          border-color: var(--gcw-secondary);
          transform: translateY(-1px);
        }
      }

      .user-avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: var(--gcw-primary);
        color: #ffffff;
        font-size: 0.85rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
      }

      .user-name {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--gcw-text-main);
      }

      .user-role {
        font-size: 0.675rem;
        font-weight: 700;
        color: var(--gcw-secondary-dark);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .logout-btn {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 50%;
        background: #f3f4f6;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gcw-text-muted);
        cursor: pointer;
        transition: all 0.2s;

        svg {
          width: 1rem;
          height: 1rem;
        }

        &:hover {
          background: #fee2e2;
          color: #dc2626;
        }
      }

      .guest-btns {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .header-book-btn {
        display: none;
        @media (min-width: 576px) {
          display: inline-flex;
        }
      }

      .mobile-toggle {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--gcw-border-light);
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gcw-text-main);
        cursor: pointer;

        svg {
          width: 1.35rem;
          height: 1.35rem;
        }

        @media (min-width: 992px) {
          display: none;
        }
      }

      .mobile-drawer {
        border-top: 1px solid var(--gcw-border);
        background: #ffffff;
        padding: 1.25rem 1.5rem 1.75rem;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);

        @media (min-width: 992px) {
          display: none;
        }
      }

      .mobile-nav-links {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .mobile-nav-link {
        font-size: 1rem;
        font-weight: 600;
        color: var(--gcw-text-main);
        text-decoration: none;
        padding: 0.5rem 0;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;

        &.highlight {
          color: var(--gcw-primary);
          font-weight: 700;
        }

        &.text-danger {
          color: #dc2626;
        }
      }

      .mobile-nav-divider {
        height: 1px;
        background: var(--gcw-border-light);
        margin: 0.5rem 0;
      }

      .mobile-auth-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class HeaderComponent {
  public authService = inject(AuthService);
  public isMobileOpen = signal<boolean>(false);

  toggleMobileMenu() {
    this.isMobileOpen.update((v) => !v);
  }

  closeMobile() {
    this.isMobileOpen.set(false);
  }

  getDashboardRoute(): string {
    const role = this.authService.userRole();
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'WASHER':
        return '/washer/dashboard';
      case 'CUSTOMER':
      default:
        return '/customer/dashboard';
    }
  }
}
