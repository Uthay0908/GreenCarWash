import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DamageClaim } from '../../../shared/models';

@Component({
  selector: 'app-admin-damage-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './admin-damage-claims.html',
  styleUrl: './admin-damage-claims.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDamageClaims implements OnInit {
  readonly claims = signal<DamageClaim[]>([]);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Adjudication Modal
  readonly showModal = signal<boolean>(false);
  selectedClaim: DamageClaim | null = null;
  decisionApprove = true;
  approvedAmount: number | null = 100;
  decisionNotes = '';

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading.set(true);
    this.admin.listDamageClaims().subscribe({
      next: (page) => {
        this.claims.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openDecisionModal(c: DamageClaim): void {
    this.selectedClaim = c;
    this.decisionApprove = true;
    this.approvedAmount = c.claimedAmount ?? 100;
    this.decisionNotes = '';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedClaim = null;
  }

  submitDecision(): void {
    if (!this.selectedClaim) return;
    if (!this.decisionNotes.trim()) {
      this.showToast('Please provide decision rationale notes.');
      return;
    }

    const decision = this.decisionApprove ? 'APPROVED' : 'REJECTED';
    this.admin.decideDamageClaim(this.selectedClaim.id, {
      decision,
      approvedAmount: this.decisionApprove ? (this.approvedAmount ?? undefined) : undefined,
      notes: this.decisionNotes.trim(),
    }).subscribe({
      next: () => {
        this.showToast(`Claim #${this.selectedClaim?.id} ${decision.toLowerCase()} successfully.`);
        this.closeModal();
        this.loadClaims();
      },
      error: () => this.showToast('Failed to submit decision. Check gateway.'),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
