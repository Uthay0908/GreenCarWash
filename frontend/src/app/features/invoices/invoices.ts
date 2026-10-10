import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { InvoiceService } from '../../core/services/invoice.service';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { Invoice } from '../../shared/models';

@Component({
  selector: 'app-invoices',
  imports: [StatusBadge, DatePipe],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Invoices {
  readonly invoices = signal<Invoice[]>([]);
  readonly viewingId = signal<number | null>(null);

  constructor(private readonly invoiceService: InvoiceService) {
    this.invoiceService.listMine().subscribe((invoices) => this.invoices.set(invoices));
  }

  toggleView(id: number): void {
    this.viewingId.update((current) => (current === id ? null : id));
  }

  downloadPdf(invoice: Invoice): void {
    if (invoice?.id) {
      this.invoiceService.downloadAndSavePdf(invoice.id, `Invoice-${invoice.invoiceNumber}.pdf`);
    } else {
      window.print();
    }
  }

  printInvoice(): void {
    window.print();
  }
}
