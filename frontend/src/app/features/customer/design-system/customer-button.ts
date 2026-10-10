import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CustomerButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'eco';
export type CustomerButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-customer-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      class="gcw-customer-btn btn-{{ variant() }} btn-{{ size() }}"
      [class.btn-block]="block() || fullWidth()"
      [class.btn-loading]="loading()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="btn-spinner"></span>
      } @else if (icon()) {
        <span class="btn-icon">{{ icon() }}</span>
      }
      <span class="btn-text">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    .gcw-customer-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      border: 1px solid transparent;
      outline: none;
      font-family: inherit;
    }
    .gcw-customer-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
    .btn-block {
      width: 100%;
    }

    /* Sizes */
    .btn-sm {
      padding: 0.45rem 0.85rem;
      font-size: 0.8125rem;
      border-radius: 8px;
    }
    .btn-md {
      padding: 0.65rem 1.25rem;
      font-size: 0.9375rem;
      border-radius: 10px;
    }
    .btn-lg {
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
      border-radius: 14px;
    }

    /* Variants */
    .btn-primary {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    .btn-primary:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
    }

    .btn-secondary {
      background: #0f172a;
      color: #ffffff;
    }
    .btn-secondary:hover:not(:disabled) {
      background: #1e293b;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
    }
    .btn-outline:hover:not(:disabled) {
      border-color: #10b981;
      color: #059669;
      background: #f0fdf4;
    }

    .btn-danger {
      background: #fee2e2;
      color: #b91c1c;
      border-color: #fecaca;
    }
    .btn-danger:hover:not(:disabled) {
      background: #ef4444;
      color: #ffffff;
      border-color: #ef4444;
    }

    .btn-ghost {
      background: transparent;
      color: #64748b;
    }
    .btn-ghost:hover:not(:disabled) {
      background: #f1f5f9;
      color: #0f172a;
    }

    .btn-eco {
      background: linear-gradient(135deg, #065f46 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(6, 95, 70, 0.3);
    }
    .btn-eco:hover:not(:disabled) {
      background: linear-gradient(135deg, #047857 0%, #10b981 100%);
      transform: translateY(-1px);
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerButton {
  readonly variant = input<CustomerButtonVariant>('primary');
  readonly size = input<CustomerButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly block = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);
  readonly icon = input<string | null>(null);

  readonly clicked = output<MouseEvent>();
}
