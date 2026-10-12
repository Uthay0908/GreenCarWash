import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="gcw-status-badge badge-{{ normalizedClass() }}">
      <span class="badge-dot"></span>
      <span class="badge-label">{{ displayLabel() }}</span>
    </span>
  `,
  styles: [`
    .gcw-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    /* Green / Completed / Active */
    .badge-completed,
    .badge-paid,
    .badge-verified,
    .badge-delivered {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-completed .badge-dot,
    .badge-paid .badge-dot,
    .badge-verified .badge-dot,
    .badge-delivered .badge-dot {
      background: #10b981;
    }

    /* Blue / In Progress / Assigned */
    .badge-in_progress,
    .badge-on_the_way,
    .badge-assigned,
    .badge-arrived {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }
    .badge-in_progress .badge-dot,
    .badge-on_the_way .badge-dot,
    .badge-assigned .badge-dot,
    .badge-arrived .badge-dot {
      background: #3b82f6;
    }

    /* Amber / Pending */
    .badge-pending,
    .badge-assignment_pending,
    .badge-under_review {
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .badge-pending .badge-dot,
    .badge-assignment_pending .badge-dot,
    .badge-under_review .badge-dot {
      background: #f59e0b;
    }

    /* Red / Cancelled / Failed */
    .badge-cancelled,
    .badge-failed,
    .badge-rejected,
    .badge-expired {
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }
    .badge-cancelled .badge-dot,
    .badge-failed .badge-dot,
    .badge-rejected .badge-dot,
    .badge-expired .badge-dot {
      background: #ef4444;
    }

    /* Purple / Disputed / Special */
    .badge-disputed,
    .badge-refunded {
      background: #faf5ff;
      color: #7e22ce;
      border: 1px solid #e9d5ff;
    }
    .badge-disputed .badge-dot,
    .badge-refunded .badge-dot {
      background: #a855f7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerStatusBadge {
  readonly status = input.required<string>();

  readonly normalizedClass = computed(() => {
    return (this.status() || '').toLowerCase().replace(/\s+/g, '_');
  });

  readonly displayLabel = computed(() => {
    return (this.status() || '').replace(/_/g, ' ');
  });
}
