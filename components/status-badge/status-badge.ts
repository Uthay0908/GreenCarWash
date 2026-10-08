import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const SUCCESS = new Set(['COMPLETED', 'SUCCEEDED', 'APPROVED', 'RESOLVED', 'ACTIVE', 'VISIBLE', 'EXECUTED', 'ACCEPTED']);
const WARNING = new Set(['PENDING', 'ASSIGNMENT_PENDING', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'ON_THE_WAY', 'ARRIVED', 'OPEN', 'OFFERED', 'HELD', 'PENDING_AUTHORIZATION', 'VERIFICATION_PENDING', 'ADDITIONAL_PAYMENT_PENDING']);
const DANGER = new Set(['CANCELLED', 'FAILED', 'REJECTED', 'DISPUTED', 'EXPIRED', 'PAYMENT_FAILED', 'CLOSED', 'DISMISSED', 'HIDDEN', 'TIMED_OUT', 'ESCALATED', 'FAILED_NO_WASHER_AVAILABLE']);
const INFO = new Set(['REFUNDED', 'PARTIALLY_REFUNDED', 'REFUND_PENDING', 'FULLY_REFUNDED']);

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  readonly status = input.required<string>();

  readonly cssClass = computed(() => {
    const s = this.status();
    if (SUCCESS.has(s)) return 'gcw-badge gcw-badge-success';
    if (WARNING.has(s)) return 'gcw-badge gcw-badge-warning';
    if (DANGER.has(s)) return 'gcw-badge gcw-badge-danger';
    if (INFO.has(s)) return 'gcw-badge gcw-badge-info';
    return 'gcw-badge gcw-badge-neutral';
  });

  readonly label = computed(() =>
    this.status()
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' '),
  );
}
