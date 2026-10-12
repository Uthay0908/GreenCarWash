import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SupportService } from '../../../core/services/support.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { SupportTicket } from '../../../shared/models';

@Component({
  selector: 'app-ticket-detail',
  imports: [RouterLink, StatusBadge, DatePipe],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketDetail {
  readonly ticket = signal<SupportTicket | undefined>(undefined);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly support: SupportService,
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.support.getTicket(id).subscribe((t) => this.ticket.set(t));
  }
}
