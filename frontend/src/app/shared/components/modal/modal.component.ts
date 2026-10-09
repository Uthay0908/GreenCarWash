import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-container gcw-card" [style.max-width]="maxWidth">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <button class="modal-close-btn" (click)="close.emit()" aria-label="Close dialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(11, 25, 18, 0.45);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        animation: fadeIn 0.2s ease-out;
      }

      .modal-container {
        width: 100%;
        background: #ffffff;
        border-radius: var(--radius-xl);
        padding: 2rem;
        box-shadow: var(--shadow-floating);
        max-height: 90vh;
        overflow-y: auto;
        animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--gcw-border-light);
        padding-bottom: 1rem;
      }

      .modal-title {
        font-size: 1.35rem;
        color: var(--gcw-text-main);
      }

      .modal-subtitle {
        font-size: 0.85rem;
        color: var(--gcw-text-muted);
        margin-top: 0.2rem;
      }

      .modal-close-btn {
        background: #f3f4f6;
        border: none;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gcw-text-muted);
        cursor: pointer;
        transition: all 0.2s ease;

        svg {
          width: 1.15rem;
          height: 1.15rem;
        }

        &:hover {
          background: #e5e7eb;
          color: var(--gcw-text-main);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scaleUp {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() maxWidth: string = '560px';
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
