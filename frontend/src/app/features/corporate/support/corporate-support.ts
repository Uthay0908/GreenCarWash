import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../../core/services/support.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { SupportTicket } from '../../../shared/models';

@Component({
  selector: 'app-corporate-support',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, StatusBadge],
  templateUrl: './corporate-support.html',
  styleUrl: './corporate-support.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateSupport implements OnInit {
  private readonly supportService = inject(SupportService);

  readonly tickets = signal<SupportTicket[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  // New ticket modal
  readonly showCreateModal = signal<boolean>(false);
  readonly submittingTicket = signal<boolean>(false);
  newSubject = '';
  newDescription = '';
  newBookingId: number | null = null;

  // Ticket detail modal
  readonly selectedTicket = signal<SupportTicket | null>(null);

  readonly toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading.set(true);
    this.error.set(null);

    this.supportService.listMyTickets(0, 50).subscribe({
      next: (list) => {
        this.tickets.set(list || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load corporate support tickets from server.');
      },
    });
  }

  openCreateModal(): void {
    this.newSubject = '';
    this.newDescription = '';
    this.newBookingId = null;
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitTicket(): void {
    if (!this.newSubject.trim() || !this.newDescription.trim()) {
      this.showToast('Please provide a subject and description.', 'error');
      return;
    }

    this.submittingTicket.set(true);
    this.supportService
      .createTicket({
        subject: this.newSubject.trim(),
        description: this.newDescription.trim(),
        bookingId: this.newBookingId ?? undefined,
      })
      .subscribe({
        next: () => {
          this.submittingTicket.set(false);
          this.closeCreateModal();
          this.showToast('Support ticket created successfully. Our team will review it.', 'success');
          this.loadTickets();
        },
        error: (err) => {
          this.submittingTicket.set(false);
          const msg = err?.error?.message || 'Failed to submit support ticket.';
          this.showToast(msg, 'error');
        },
      });
  }

  viewTicket(t: SupportTicket): void {
    this.selectedTicket.set(t);
  }

  closeDetailModal(): void {
    this.selectedTicket.set(null);
  }

  private showToast(text: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ text, type });
    setTimeout(() => this.toast.set(null), 4000);
  }
}
