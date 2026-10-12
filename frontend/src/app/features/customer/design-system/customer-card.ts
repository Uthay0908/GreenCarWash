import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="gcw-customer-card"
      [class.card-clickable]="clickable()"
      [class.card-elevated]="elevated()"
      [class.card-bordered]="bordered()"
      [class.card-highlight]="highlight()"
    >
      @if (headerTitle()) {
        <div class="card-header">
          <div class="card-title-group">
            @if (headerIcon()) {
              <span class="card-header-icon">{{ headerIcon() }}</span>
            }
            <h3 class="card-header-title">{{ headerTitle() }}</h3>
          </div>
          @if (headerAction()) {
            <div class="card-header-action">
              <ng-content select="[headerAction]"></ng-content>
            </div>
          }
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (hasFooter()) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .gcw-customer-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
    }
    .gcw-customer-card.card-bordered {
      border: 1.5px solid #e2e8f0;
    }
    .gcw-customer-card.card-elevated {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .gcw-customer-card.card-highlight {
      border-color: #10b981;
      background: #f0fdf4;
    }
    .gcw-customer-card.card-clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
      border-color: #10b981;
      cursor: pointer;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .card-title-group {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .card-header-icon {
      font-size: 1.25rem;
    }
    .card-header-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 800;
      color: #0f172a;
    }
    .card-body {
      flex: 1;
    }
    .card-footer {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerCard {
  readonly headerTitle = input<string | null>(null);
  readonly headerIcon = input<string | null>(null);
  readonly headerAction = input<boolean>(false);
  readonly hasFooter = input<boolean>(false);
  readonly clickable = input<boolean>(false);
  readonly elevated = input<boolean>(false);
  readonly bordered = input<boolean>(true);
  readonly highlight = input<boolean>(false);
}
