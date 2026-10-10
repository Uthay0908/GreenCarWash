import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="gcw-drawer-backdrop" (click)="closed.emit()">
        <div class="gcw-drawer-panel" [style.max-width.px]="width()" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <h3 class="drawer-title">{{ title() }}</h3>
            <button type="button" class="btn-drawer-close" (click)="closed.emit()">✕</button>
          </div>
          <div class="drawer-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .gcw-drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 2500;
      display: flex;
      justify-content: flex-end;
      animation: fadeIn 0.2s ease;
    }
    .gcw-drawer-panel {
      width: 100%;
      height: 100%;
      background: #ffffff;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.25s ease;
    }
    .drawer-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .drawer-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }
    .btn-drawer-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: #f1f5f9;
      color: #64748b;
      cursor: pointer;
      font-weight: 700;
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDrawer {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Details');
  readonly width = input<number>(450);

  readonly closed = output<void>();
}
