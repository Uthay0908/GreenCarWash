import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="gcw-modal-backdrop" (click)="backdropClick()">
        <div class="gcw-modal-card" [style.max-width.px]="maxWidth()" (click)="$event.stopPropagation()">
          @if (title()) {
            <div class="modal-header">
              <h3 class="modal-title">{{ title() }}</h3>
              <button type="button" class="btn-modal-close" (click)="closed.emit()">✕</button>
            </div>
          }
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (hasFooter()) {
            <div class="modal-footer">
              <ng-content select="[modalFooter]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .gcw-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }
    .gcw-modal-card {
      background: #ffffff;
      border-radius: 20px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.25s ease;
    }
    .modal-header {
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }
    .btn-modal-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #f1f5f9;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .btn-modal-close:hover {
      background: #fee2e2;
      color: #b91c1c;
    }
    .modal-body {
      padding: 1.5rem 1.75rem;
      flex: 1;
    }
    .modal-footer {
      padding: 1rem 1.75rem;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
      border-radius: 0 0 20px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0.8; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerModal {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string | null>(null);
  readonly maxWidth = input<number>(540);
  readonly hasFooter = input<boolean>(false);
  readonly closeOnBackdrop = input<boolean>(true);

  readonly closed = output<void>();

  backdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }
}
