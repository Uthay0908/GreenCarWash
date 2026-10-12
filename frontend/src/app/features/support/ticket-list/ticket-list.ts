import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupportService } from '../../../core/services/support.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { SupportTicket } from '../../../shared/models';

@Component({
  selector: 'app-ticket-list',
  imports: [RouterLink, StatusBadge, DatePipe],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketList {
  readonly tickets = signal<SupportTicket[]>([]);

  constructor(private readonly support: SupportService) {
    this.support.listMyTickets().subscribe((tickets) => this.tickets.set(tickets));
  }

  priorityClass(priority: SupportTicket['priority']): string {
    switch (priority) {
      case 'URGENT': return 'gcw-badge gcw-badge-danger';
      case 'HIGH': return 'gcw-badge gcw-badge-warning';
      case 'MEDIUM': return 'gcw-badge gcw-badge-info';
      default: return 'gcw-badge gcw-badge-neutral';
    }
  }
}
