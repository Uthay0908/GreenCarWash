import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="gcw-footer">
      <div class="gcw-container-wide">
        <!-- Top Impact Banner -->
        <div class="footer-impact-banner gcw-card">
          <div class="banner-left">
            <span class="gcw-pill water-pill">💧 Doorstep Eco Technology</span>
            <h3 class="banner-title">A Cleaner Car. A Greener Tomorrow.</h3>
            <p class="banner-desc">
              Every GreenCarWash service saves up to 200 liters of potable water compared to
              traditional hose washes.
            </p>
          </div>
          <div class="banner-right">
            <a routerLink="/customer/book" class="gcw-btn gcw-btn-primary gcw-btn-lg">
              <span>Book Your First Wash</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="footer-grid">
          <!-- Col 1: Brand Info -->
          <div class="footer-col brand-col">
            <div class="footer-brand">
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
                </svg>
              </div>
              <span class="brand-name">Green<span class="accent">CarWash</span></span>
            </div>
            <p class="footer-bio">
              The premier eco-conscious doorstep car care platform. Precision automotive cleaning
              powered by sustainable water-saving technology.
            </p>
            <div class="footer-badges">
              <span class="cert-pill">✓ 100% Biodegradable</span>
              <span class="cert-pill">✓ Zero Runoff</span>
            </div>
          </div>

          <!-- Col 2: Services -->
          <div class="footer-col">
            <h4 class="footer-heading">Services</h4>
            <ul class="footer-links">
              <li><a routerLink="/packages">Eco Diamond Wash</a></li>
              <li><a routerLink="/packages">Ceramic Coating</a></li>
              <li><a routerLink="/packages">Interior Sanitization</a></li>
              <li><a routerLink="/packages">Engine Bay Detailing</a></li>
              <li><a routerLink="/customer/book">Corporate Fleet Care</a></li>
            </ul>
          </div>

          <!-- Col 3: Customer Journey -->
          <div class="footer-col">
            <h4 class="footer-heading">Customer Care</h4>
            <ul class="footer-links">
              <li><a routerLink="/customer/dashboard">My Dashboard</a></li>
              <li><a routerLink="/customer/bookings">My Bookings</a></li>
              <li><a routerLink="/customer/vehicles">My Garage</a></li>
              <li><a routerLink="/customer/loyalty">Eco Rewards & Tier</a></li>
              <li><a routerLink="/customer/water-saving">My Water Impact</a></li>
              <li><a routerLink="/customer/support">Help & Support Center</a></li>
            </ul>
          </div>

          <!-- Col 4: Operations & Trust -->
          <div class="footer-col">
            <h4 class="footer-heading">Platform & Washers</h4>
            <ul class="footer-links">
              <li><a routerLink="/register">Become a Verified Washer</a></li>
              <li><a routerLink="/washer/dashboard">Washer Workspace</a></li>
              <li><a routerLink="/sustainability">Environmental Reports</a></li>
              <li><a routerLink="/how-it-works">Our 5-Step Process</a></li>
              <li><a routerLink="/admin/dashboard">Admin Command Center</a></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Copyright Strip -->
        <div class="footer-bottom">
          <p>© 2026 GreenCarWash Technologies Inc. All rights reserved.</p>
          <div class="bottom-links">
            <a routerLink="/about">Privacy Policy</a>
            <a routerLink="/about">Terms of Service</a>
            <a routerLink="/sustainability">Conservation Manifesto</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .gcw-footer {
        background: #ffffff;
        border-top: 1px solid var(--gcw-border);
        padding: 4rem 0 2rem;
        margin-top: 5rem;
      }

      .footer-impact-banner {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        background: linear-gradient(135deg, #eff6ff 0%, #e6f4ea 50%, #e0f2fe 100%);
        border: 1px solid rgba(2, 132, 199, 0.25);
        border-radius: var(--radius-xl);
        padding: 2.5rem;
        margin-bottom: 4rem;

        @media (min-width: 992px) {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .banner-title {
        font-size: 1.75rem;
        color: var(--gcw-primary-dark);
        margin: 0.75rem 0 0.5rem;
      }

      .banner-desc {
        max-width: 550px;
        font-size: 0.95rem;
        color: var(--gcw-text-muted);
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2.5rem;
        margin-bottom: 3.5rem;

        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (min-width: 1024px) {
          grid-template-columns: 2fr 1fr 1fr 1fr;
        }
      }

      .brand-col {
        padding-right: 1.5rem;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 1rem;
      }

      .brand-icon {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: var(--radius-sm);
        background: var(--gcw-secondary-light);
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 1.35rem;
          height: 1.35rem;
        }
      }

      .brand-name {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--gcw-primary-dark);

        .accent {
          color: var(--gcw-secondary);
        }
      }

      .footer-bio {
        font-size: 0.9rem;
        color: var(--gcw-text-muted);
        line-height: 1.6;
        margin-bottom: 1.25rem;
      }

      .footer-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .cert-pill {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--gcw-primary);
        background: var(--gcw-surface-hover);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-pill);
        border: 1px solid var(--gcw-border);
      }

      .footer-heading {
        font-size: 1rem;
        color: var(--gcw-text-main);
        margin-bottom: 1.25rem;
      }

      .footer-links {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        li a {
          font-size: 0.9rem;
          color: var(--gcw-text-muted);
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: var(--gcw-primary);
            text-decoration: underline;
          }
        }
      }

      .footer-bottom {
        border-top: 1px solid var(--gcw-border-light);
        padding-top: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        justify-content: space-between;

        @media (min-width: 768px) {
          flex-direction: row;
        }

        p {
          font-size: 0.85rem;
          color: var(--gcw-text-light);
        }
      }

      .bottom-links {
        display: flex;
        gap: 1.5rem;

        a {
          font-size: 0.85rem;
          color: var(--gcw-text-light);
          text-decoration: none;

          &:hover {
            color: var(--gcw-text-muted);
          }
        }
      }
    `,
  ],
})
export class FooterComponent {}
