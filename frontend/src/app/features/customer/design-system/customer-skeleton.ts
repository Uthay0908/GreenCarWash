import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (lineCount() > 1) {
      <div class="skeleton-stack">
        @for (i of lineArray(); track $index) {
          <div
            class="gcw-skeleton-item"
            [style.width]="$index === lineArray().length - 1 ? '60%' : width()"
            [style.height]="height()"
            [style.border-radius]="radius()"
          ></div>
        }
      </div>
    } @else {
      <div
        class="gcw-skeleton-item"
        [style.width]="width()"
        [style.height]="height()"
        [style.border-radius]="radius()"
        [class.skeleton-circle]="circle()"
      ></div>
    }
  `,
  styles: [`
    .gcw-skeleton-item {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }
    .skeleton-circle {
      border-radius: 50% !important;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton-stack {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerSkeleton {
  readonly width = input<string>('100%');
  readonly height = input<string>('20px');
  readonly radius = input<string>('8px');
  readonly circle = input<boolean>(false);
  readonly lines = input<number | string>(1);

  readonly lineCount = computed(() => Number(this.lines()) || 1);
  readonly lineArray = computed(() => Array.from({ length: this.lineCount() }));
}
