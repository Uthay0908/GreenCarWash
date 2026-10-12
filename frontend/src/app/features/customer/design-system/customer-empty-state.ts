import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gcw-empty-state">
      <div class="empty-icon-circle">
        @switch (icon()) {
          @case ('car') {
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          }
          @case ('calendar') {
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          }
          @case ('sparkles') {
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 0 0 1.272 1.272L21 12l-5.816 1.915a2 2 0 0 0-1.272 1.272L12 21l-1.912-5.813a2 2 0 0 0-1.272-1.272L3 12l5.816-1.915a2 2 0 0 0 1.272-1.272L12 3z"></path>
            </svg>
          }
          @default {
            @if (icon() === '🚗') {
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2 12v4c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <path d="M9 17h6"></path>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
            } @else if (icon() === '📅') {
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            } @else if (icon() === '✨') {
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l1.912 5.813a2 2 0 0 0 1.272 1.272L21 12l-5.816 1.915a2 2 0 0 0-1.272 1.272L12 21l-1.912-5.813a2 2 0 0 0-1.272-1.272L3 12l5.816-1.915a2 2 0 0 0 1.272-1.272L12 3z"></path>
              </svg>
            } @else {
              <span>{{ icon() }}</span>
            }
          }
        }
      </div>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-description">{{ description() }}</p>
      @if (actionLabel()) {
        <button type="button" class="btn-empty-action" (click)="actionClicked.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .gcw-empty-state {
      padding: 3.5rem 1.5rem;
      border: 2px dashed #e2e8f0;
      border-radius: 18px;
      background: #ffffff;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #ecfdf5;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .empty-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }
    .empty-description {
      margin: 0;
      font-size: 0.9375rem;
      color: #64748b;
      max-width: 420px;
      line-height: 1.5;
    }
    .btn-empty-action {
      margin-top: 0.75rem;
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
      transition: all 0.2s ease;
    }
    .btn-empty-action:hover {
      background: #059669;
      transform: translateY(-1px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEmptyState {
  readonly icon = input<string>('🌱');
  readonly title = input<string>('No items found');
  readonly description = input<string>('There are currently no records to display in this section.');
  readonly actionLabel = input<string | null>(null);

  readonly actionClicked = output<void>();
}
