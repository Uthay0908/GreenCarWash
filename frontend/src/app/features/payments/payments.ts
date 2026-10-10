import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { Payment } from '../../shared/models';

@Component({
  selector: 'app-payments',
  imports: [StatusBadge, DatePipe],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Payments {
  readonly payments = signal<Payment[]>([]);

  constructor(private readonly paymentService: PaymentService) {
    this.paymentService.listMyPayments().subscribe((p) => this.payments.set(p));
  }
}
