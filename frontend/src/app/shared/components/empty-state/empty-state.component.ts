import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-card gcw-card text-center">
      <div class="empty-icon-circle">
        <svg
          *ngIf="icon === 'car'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"
          ></path>
          <circle cx="7" cy="17" r="2"></circle>
          <path d="M9 17h6"></path>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
        <svg
          *ngIf="icon === 'calendar'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <svg
          *ngIf="icon === 'bell'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <svg
          *ngIf="icon !== 'car' && icon !== 'calendar' && icon !== 'bell'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          ></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-desc">{{ message }}</p>
      <div class="empty-action" *ngIf="actionLabel">
        <button class="gcw-btn gcw-btn-primary" (click)="actionClicked.emit()">
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .empty-state-card {
        padding: 3.5rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        border: 1px dashed var(--gcw-border);
        border-radius: var(--radius-xl);
      }

      .empty-icon-circle {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 50%;
        background: var(--gcw-surface-hover);
        color: var(--gcw-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;

        svg {
          width: 2.25rem;
          height: 2.25rem;
        }
      }

      .empty-title {
        font-size: 1.25rem;
        color: var(--gcw-text-main);
        margin-bottom: 0.5rem;
      }

      .empty-desc {
        font-size: 0.925rem;
        color: var(--gcw-text-muted);
        max-width: 400px;
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title: string = 'No data available';
  @Input() message: string = 'There are no items recorded yet.';
  @Input() icon: string = 'box';
  @Input() actionLabel?: string;
  @Output() actionClicked = new EventEmitter<void>();
}
