import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton-block"
      [ngStyle]="{ width: width, height: height, 'border-radius': radius }"
    ></div>
  `,
  styles: [
    `
      .skeleton-block {
        background: linear-gradient(90deg, #f0f4f1 25%, #e2e8f0 50%, #f0f4f1 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        display: inline-block;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '1.25rem';
  @Input() radius: string = 'var(--radius-sm)';
}
