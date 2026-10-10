import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message()) {
      <div class="gcw-toast-banner" [class.toast-error]="isError()">
        <span class="toast-icon">{{ isError() ? '⚠️' : '✓' }}</span>
        <span class="toast-text">{{ message() }}</span>
        <button type="button" class="btn-toast-dismiss" (click)="dismissed.emit()">✕</button>
      </div>
    }
  `,
  styles: [`
    .gcw-toast-banner {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 3500;
      background: #064e3b;
      color: #a7f3d0;
      border: 1px solid #059669;
      padding: 0.875rem 1.25rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9375rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 10px 25px rgba(6, 78, 59, 0.25);
      animation: slideUp 0.25s ease;
    }
    .gcw-toast-banner.toast-error {
      background: #7f1d1d;
      color: #fecaca;
      border-color: #ef4444;
      box-shadow: 0 10px 25px rgba(185, 28, 28, 0.25);
    }
    .btn-toast-dismiss {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-weight: 700;
      margin-left: 0.5rem;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerToast {
  readonly message = input<string | null>(null);
  readonly isError = input<boolean>(false);

  readonly dismissed = output<void>();
}
