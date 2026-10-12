import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="confirm-dialog-backdrop" (click)="cancelled.emit()">
        <div class="confirm-dialog-card" (click)="$event.stopPropagation()">
          <div class="confirm-icon-wrap" [class.is-danger]="isDanger()">
            @if (icon() === '🚪' || icon() === 'logout') {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            } @else {
              <span>{{ icon() }}</span>
            }
          </div>

          <h3 class="confirm-title">{{ title() }}</h3>
          <p class="confirm-message">{{ message() }}</p>

          <div class="confirm-actions-row">
            <button
              type="button"
              class="btn-cancel"
              (click)="cancelled.emit()"
            >
              {{ cancelLabel() }}
            </button>
            <button
              type="button"
              class="btn-confirm"
              [class.btn-danger]="isDanger()"
              (click)="confirmed.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-dialog-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      padding: 1.5rem;
      animation: fadeIn 0.15s ease;
    }

    .confirm-dialog-card {
      background: #ffffff;
      border-radius: 20px;
      max-width: 420px;
      width: 100%;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.875rem;
      animation: zoomIn 0.2s ease;
    }

    .confirm-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #ecfdf5;
      color: #047857;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }
    .confirm-icon-wrap.is-danger {
      background: #fef2f2;
      color: #b91c1c;
    }

    .confirm-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }

    .confirm-message {
      margin: 0;
      font-size: 0.9375rem;
      color: #64748b;
      line-height: 1.5;
    }

    .confirm-actions-row {
      display: flex;
      gap: 0.75rem;
      width: 100%;
      margin-top: 1rem;
    }

    .btn-cancel,
    .btn-confirm {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9375rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-cancel {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }
    .btn-cancel:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .btn-confirm {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);
    }
    .btn-confirm:hover {
      background: #059669;
    }

    .btn-confirm.btn-danger {
      background: #ef4444;
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
    }
    .btn-confirm.btn-danger:hover {
      background: #dc2626;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes zoomIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerConfirmDialog {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Are you sure you want to log out?');
  readonly message = input<string>('You will need to sign in again to access your vehicles and bookings.');
  readonly icon = input<string>('🚪');
  readonly isDanger = input<boolean>(true);
  readonly confirmLabel = input<string>('Log Out');
  readonly cancelLabel = input<string>('Cancel');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
