import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="gcw-card stat-container"
      [ngClass]="{
        'has-glow': isGlow,
        'variant-blue': variant === 'blue',
        'variant-warm': variant === 'warm',
      }"
    >
      <div class="stat-top">
        <div class="stat-icon-wrap" *ngIf="icon">
          <span [innerHTML]="icon"></span>
        </div>
        <span
          class="stat-trend"
          *ngIf="trend"
          [ngClass]="trend.startsWith('+') ? 'trend-up' : 'trend-neutral'"
        >
          {{ trend }}
        </span>
      </div>
      <div class="stat-value-wrap">
        <div
          class="stat-value"
          [ngClass]="variant === 'blue' ? 'water-impact-number' : 'eco-impact-number'"
        >
          {{ value }}
        </div>
        <div class="stat-unit" *ngIf="unit">{{ unit }}</div>
      </div>
      <div class="stat-label">{{ label }}</div>
      <div class="stat-subtext" *ngIf="subtext">{{ subtext }}</div>
    </div>
  `,
  styles: [
    `
      .stat-container {
        padding: 1.5rem;
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: #ffffff;
        position: relative;
        transition:
          transform 0.2s ease,
          box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-3px);
        }

        &.has-glow {
          border-color: rgba(2, 132, 199, 0.3);
          box-shadow: 0 12px 30px -4px rgba(2, 132, 199, 0.12);
        }

        &.variant-blue.has-glow {
          border-color: rgba(2, 132, 199, 0.3);
          box-shadow: 0 12px 30px -4px rgba(2, 132, 199, 0.14);
        }
      }

      .stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.25rem;
      }

      .stat-icon-wrap {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--gcw-secondary-light);
        color: var(--gcw-primary);
        display: flex;
        align-items: center;
        justify-content: center;

        ::ng-deep svg {
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      .variant-blue .stat-icon-wrap {
        background: var(--gcw-blue-light);
        color: var(--gcw-blue-dark);
      }

      .stat-trend {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-pill);

        &.trend-up {
          background: #d1fae5;
          color: #065f46;
        }

        &.trend-neutral {
          background: #f3f4f6;
          color: var(--gcw-text-muted);
        }
      }

      .stat-value-wrap {
        display: flex;
        align-items: baseline;
        gap: 0.35rem;
      }

      .stat-value {
        font-size: 2.2rem;
        letter-spacing: -0.03em;
      }

      .stat-unit {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--gcw-text-muted);
      }

      .stat-label {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--gcw-text-main);
      }

      .stat-subtext {
        font-size: 0.775rem;
        color: var(--gcw-text-light);
      }
    `,
  ],
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() unit?: string;
  @Input() subtext?: string;
  @Input() icon?: string;
  @Input() trend?: string;
  @Input() variant: 'green' | 'blue' | 'warm' = 'green';
  @Input() isGlow: boolean = false;
}
