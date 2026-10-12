import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Invoice } from '../../../shared/models';

@Component({
  selector: 'app-admin-invoices',
  imports: [StatusBadge, DatePipe],
  templateUrl: './admin-invoices.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInvoices {
  readonly invoices = signal<Invoice[]>([]);

  constructor(private readonly invoiceService: InvoiceService) {
    this.invoiceService.listAll().subscribe((i) => this.invoices.set(i));
  }
}
