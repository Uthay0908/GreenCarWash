import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SupportService } from '../../../core/services/support.service';
import { Complaint, SupportTicket } from '../../../shared/models';

type Tab = 'tickets' | 'complaints';

@Component({
  selector: 'app-admin-support',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-support.html',
  styleUrl: './admin-support.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSupport implements OnInit {
  readonly currentTab = signal<Tab>('tickets');
  readonly tickets = signal<SupportTicket[]>([]);
  readonly complaints = signal<Complaint[]>([]);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Complaint Resolution Modal
  readonly showResolveModal = signal<boolean>(false);
  selectedComplaint: Complaint | null = null;
  resolutionDecision: 'REFUND' | 'CREDIT' | 'REWASH' | 'NO_ACTION' = 'CREDIT';
  creditAmount: number | null = 25.0;
  resolutionNotes = '';

  constructor(
    private readonly admin: AdminService,
    private readonly supportService: SupportService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: Tab): void {
    this.currentTab.set(tab);
  }

  loadData(): void {
    this.loading.set(true);
    this.supportService.listMyTickets().subscribe((t) => {
      this.tickets.set(t);
    });

    this.admin.listComplaints().subscribe({
      next: (page) => {
        this.complaints.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openResolveModal(c: Complaint): void {
    this.selectedComplaint = c;
    this.resolutionDecision = 'CREDIT';
    this.creditAmount = 25.0;
    this.resolutionNotes = '';
    this.showResolveModal.set(true);
  }

  closeResolveModal(): void {
    this.showResolveModal.set(false);
    this.selectedComplaint = null;
  }

  submitResolution(): void {
    if (!this.selectedComplaint) return;
    if (!this.resolutionNotes.trim()) {
      this.showToast('Please provide explanation notes for this resolution.');
      return;
    }

    this.admin.resolveComplaint(this.selectedComplaint.id, {
      decision: this.resolutionDecision,
      notes: this.resolutionNotes.trim(),
      creditAmount: this.resolutionDecision === 'CREDIT' ? (this.creditAmount ?? 0) : undefined,
    }).subscribe({
      next: () => {
        this.showToast(`Complaint #${this.selectedComplaint?.id} successfully resolved with decision ${this.resolutionDecision}.`);
        this.closeResolveModal();
        this.loadData();
      },
      error: () => this.showToast('Failed to resolve complaint. Check gateway.'),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
