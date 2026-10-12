import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { DamageClaimService } from '../../core/services/damage-claim.service';
import { SupportService } from '../../core/services/support.service';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import {
  Booking,
  ClaimStatus,
  Complaint,
  ComplaintRequest,
  ComplaintStatus,
  DamageClaim,
  DamageClaimRequest,
  Faq,
  SupportTicket,
  SupportTicketRequest,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../shared/models';

export type SupportTab = 'faq' | 'tickets' | 'complaints' | 'claims';

@Component({
  selector: 'app-support-hub',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadge, DatePipe],
  templateUrl: './support-hub.html',
  styleUrl: './support-hub.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportHub implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supportService = inject(SupportService);
  private readonly complaintService = inject(ComplaintService);
  private readonly claimService = inject(DamageClaimService);
  private readonly bookingService = inject(BookingService);

  // Tab State
  readonly activeTab = signal<SupportTab>('faq');
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Data Signals
  readonly faqs = signal<Faq[]>([]);
  readonly tickets = signal<SupportTicket[]>([]);
  readonly complaints = signal<Complaint[]>([]);
  readonly claims = signal<DamageClaim[]>([]);
  readonly bookings = signal<Booking[]>([]);

  // FAQ State
  readonly faqSearchQuery = signal('');
  readonly selectedFaqCategory = signal<string>('ALL');
  readonly expandedFaqIds = signal<Set<number>>(new Set([1]));
  readonly faqHelpfulFeedback = signal<Record<number, boolean>>({});

  // Filters
  readonly ticketStatusFilter = signal<string>('ALL');
  readonly complaintStatusFilter = signal<string>('ALL');
  readonly claimStatusFilter = signal<string>('ALL');

  // Modal / Detail drawer states
  readonly showTicketModal = signal(false);
  readonly showComplaintModal = signal(false);
  readonly showClaimModal = signal(false);

  readonly selectedTicket = signal<SupportTicket | null>(null);
  readonly selectedComplaint = signal<Complaint | null>(null);
  readonly selectedClaim = signal<DamageClaim | null>(null);

  // Evidence photos for damage claims
  readonly claimEvidenceUrls = signal<string[]>([]);
  readonly previewImageUrl = signal<string | null>(null);

  // Reactive Forms
  readonly ticketForm = this.fb.nonNullable.group({
    bookingId: [null as number | null],
    subject: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    priority: ['MEDIUM' as TicketPriority, Validators.required],
    category: ['GENERAL' as TicketCategory, Validators.required],
  });

  // Complaint form strictly uses actual backend DTO: { bookingId: number, description: string }
  readonly complaintForm = this.fb.nonNullable.group({
    bookingId: [null as number | null, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  // Damage claim form strictly uses actual backend DTO: { bookingId, description, claimedAmount, evidenceFileUrls }
  readonly claimForm = this.fb.nonNullable.group({
    bookingId: [null as number | null, Validators.required],
    claimedAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  // Default fallback FAQs if backend has no initial records
  private readonly fallbackFaqs: Faq[] = [
    {
      id: 1,
      category: 'SERVICES',
      question: 'How does GreenCarWash eco-friendly waterless washing work?',
      answer:
        'We use high-grade biodegradable polymers and lubricants that encapsulate dirt particles on contact, lifting them gently from the vehicle clearcoat. Microfiber towels absorb the encapsulated dirt without scratching, saving over 200 liters of fresh water per wash!',
      active: true,
      displayOrder: 1,
    },
    {
      id: 2,
      category: 'BOOKINGS',
      question: 'Do I need to be present at the car during the exterior wash?',
      answer:
        'No! For exterior wash packages, our verified mobile washer can service your vehicle at your parked location (home driveway, office parking, or apartment slot) as long as access is clear. You can unlock remotely if interior cleaning is selected.',
      active: true,
      displayOrder: 2,
    },
    {
      id: 3,
      category: 'BOOKINGS',
      question: 'Can I reschedule or cancel a booked car wash?',
      answer:
        'Yes. You can reschedule or cancel directly from "My Orders" up to 2 hours before the scheduled appointment with a full refund to your original payment method or wallet.',
      active: true,
      displayOrder: 3,
    },
    {
      id: 4,
      category: 'PAYMENTS',
      question: 'What happens if a wash does not meet quality expectations?',
      answer:
        'Customer satisfaction is guaranteed. You can file a Complaint from this portal within 48 hours of service completion. Our operations team can authorize a complimentary rewash, instant wallet credit, or full refund.',
      active: true,
      displayOrder: 4,
    },
    {
      id: 5,
      category: 'CLAIMS',
      question: 'What is the procedure for reporting accidental vehicle damage?',
      answer:
        'In the rare event of accidental vehicle scratches or equipment issues, submit a Damage Claim under the "Damage Claims" tab. Attach clear photo evidence and specify the estimated repair amount. Our claims committee inspects evidence and resolves claims within 3 business days.',
      active: true,
      displayOrder: 5,
    },
    {
      id: 6,
      category: 'PAYMENTS',
      question: 'How do wallet credits and Green Loyalty points work?',
      answer:
        'Any compensation credits from resolved claims or loyalty rewards appear immediately in your Green Wallet. They can be applied to any future booking during checkout.',
      active: true,
      displayOrder: 6,
    },
  ];

  // Computed FAQ Categories
  readonly faqCategories = computed(() => {
    const list = this.faqs();
    const set = new Set<string>();
    for (const item of list) {
      if (item.category) set.add(item.category);
    }
    return ['ALL', ...Array.from(set)];
  });

  // Filtered FAQs
  readonly filteredFaqs = computed(() => {
    const query = this.faqSearchQuery().toLowerCase().trim();
    const category = this.selectedFaqCategory();
    let list = this.faqs();

    if (category !== 'ALL') {
      list = list.filter((f) => f.category === category);
    }
    if (query) {
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query) ||
          f.category.toLowerCase().includes(query)
      );
    }
    return list;
  });

  // Filtered Tickets
  readonly filteredTickets = computed(() => {
    const filter = this.ticketStatusFilter();
    const list = this.tickets();
    if (filter === 'ALL') return list;
    return list.filter((t) => t.status === filter);
  });

  // Filtered Complaints
  readonly filteredComplaints = computed(() => {
    const filter = this.complaintStatusFilter();
    const list = this.complaints();
    if (filter === 'ALL') return list;
    return list.filter((c) => c.status === filter);
  });

  // Filtered Damage Claims
  readonly filteredClaims = computed(() => {
    const filter = this.claimStatusFilter();
    const list = this.claims();
    if (filter === 'ALL') return list;
    return list.filter((c) => c.status === filter);
  });

  ngOnInit(): void {
    // Check route query params for active tab or action
    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab') as SupportTab;
      if (tab && ['faq', 'tickets', 'complaints', 'claims'].includes(tab)) {
        this.activeTab.set(tab);
      }
      const action = params.get('action');
      if (action === 'new-ticket') this.openTicketModal();
      if (action === 'new-complaint') this.openComplaintModal();
      if (action === 'new-claim') this.openClaimModal();
    });

    this.loadAllData();
  }

  setTab(tab: SupportTab): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }

  loadAllData(): void {
    this.loading.set(true);

    // 1. FAQs
    this.supportService.getFaqs().subscribe({
      next: (faqs) => {
        if (faqs && faqs.length > 0) {
          this.faqs.set(faqs);
        } else {
          this.faqs.set(this.fallbackFaqs);
        }
      },
      error: () => {
        this.faqs.set(this.fallbackFaqs);
      },
    });

    // 2. Bookings (for selection in forms)
    this.bookingService.listMine().subscribe({
      next: (bookings) => this.bookings.set(bookings || []),
      error: () => {},
    });

    // 3. Tickets
    this.supportService.listMyTickets().subscribe({
      next: (tickets) => this.tickets.set(tickets || []),
      error: () => {},
    });

    // 4. Complaints
    this.complaintService.listMyComplaints().subscribe({
      next: (complaints) => this.complaints.set(complaints || []),
      error: () => {},
    });

    // 5. Damage Claims
    this.claimService.listMyDamageClaims().subscribe({
      next: (claims) => {
        this.claims.set(claims || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // --- FAQ Actions ---
  toggleFaq(id: number): void {
    this.expandedFaqIds.update((set) => {
      const copy = new Set(set);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  }

  isFaqExpanded(id: number): boolean {
    return this.expandedFaqIds().has(id);
  }

  setFaqFeedback(id: number, helpful: boolean): void {
    this.faqHelpfulFeedback.update((map) => ({ ...map, [id]: helpful }));
  }

  // --- Ticket Actions ---
  openTicketModal(bookingId?: number): void {
    this.errorMessage.set(null);
    this.ticketForm.reset({
      bookingId: bookingId ?? null,
      subject: '',
      description: '',
      priority: 'MEDIUM',
      category: 'GENERAL',
    });
    this.showTicketModal.set(true);
  }

  closeTicketModal(): void {
    this.showTicketModal.set(false);
  }

  viewTicketDetails(ticket: SupportTicket): void {
    this.selectedTicket.set(ticket);
  }

  closeTicketDetails(): void {
    this.selectedTicket.set(null);
  }

  submitTicket(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    const formVal = this.ticketForm.getRawValue();

    const request: SupportTicketRequest = {
      bookingId: formVal.bookingId ?? undefined,
      subject: formVal.subject,
      description: formVal.description,
      priority: formVal.priority,
      category: formVal.category,
    };

    this.supportService.createTicket(request).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.tickets.update((list) => [created, ...list]);
        this.closeTicketModal();
        this.setTab('tickets');
        this.showSuccess(`Support Ticket #${created.id} created successfully! Our team will respond shortly.`);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to submit support ticket. Please check your inputs.');
      },
    });
  }

  // --- Complaint Actions ---
  openComplaintModal(bookingId?: number): void {
    this.errorMessage.set(null);
    this.complaintForm.reset({
      bookingId: bookingId ?? (this.bookings()[0]?.id ?? null),
      description: '',
    });
    this.showComplaintModal.set(true);
  }

  closeComplaintModal(): void {
    this.showComplaintModal.set(false);
  }

  viewComplaintDetails(complaint: Complaint): void {
    this.selectedComplaint.set(complaint);
  }

  closeComplaintDetails(): void {
    this.selectedComplaint.set(null);
  }

  submitComplaint(): void {
    if (this.complaintForm.invalid) {
      this.complaintForm.markAllAsTouched();
      return;
    }

    const val = this.complaintForm.getRawValue();
    if (!val.bookingId) {
      this.errorMessage.set('Please select an associated wash booking.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request: ComplaintRequest = {
      bookingId: val.bookingId,
      description: val.description,
    };

    this.complaintService.createComplaint(request).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.complaints.update((list) => [created, ...list]);
        this.closeComplaintModal();
        this.setTab('complaints');
        this.showSuccess(`Complaint #${created.id} submitted. Our quality assurance team is reviewing the case.`);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err?.error?.code === 'NOT_YOUR_BOOKING') {
          this.errorMessage.set('You can only file complaints for bookings that belong to your account.');
        } else {
          this.errorMessage.set(err?.error?.message || 'Failed to file complaint. Please verify your booking selection.');
        }
      },
    });
  }

  // --- Damage Claim Actions ---
  openClaimModal(bookingId?: number): void {
    this.errorMessage.set(null);
    this.claimEvidenceUrls.set([]);
    this.claimForm.reset({
      bookingId: bookingId ?? (this.bookings()[0]?.id ?? null),
      claimedAmount: null,
      description: '',
    });
    this.showClaimModal.set(true);
  }

  closeClaimModal(): void {
    this.showClaimModal.set(false);
  }

  viewClaimDetails(claim: DamageClaim): void {
    this.selectedClaim.set(claim);
  }

  closeClaimDetails(): void {
    this.selectedClaim.set(null);
  }

  addClaimEvidenceUrl(inputElem: HTMLInputElement): void {
    const url = inputElem.value.trim();
    if (!url) return;
    if (this.claimEvidenceUrls().length >= 8) {
      this.errorMessage.set('Maximum 8 evidence photos allowed.');
      return;
    }
    this.claimEvidenceUrls.update((urls) => [...urls, url]);
    inputElem.value = '';
  }

  onClaimFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const availableSlots = 8 - this.claimEvidenceUrls().length;
    if (availableSlots <= 0) {
      this.errorMessage.set('Maximum 8 evidence photos allowed.');
      return;
    }

    const filesToRead = files.slice(0, availableSlots);
    for (const file of filesToRead) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.claimEvidenceUrls.update((urls) => [...urls, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removeClaimPhoto(index: number): void {
    this.claimEvidenceUrls.update((urls) => urls.filter((_, i) => i !== index));
  }

  submitDamageClaim(): void {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    const val = this.claimForm.getRawValue();
    if (!val.bookingId || !val.claimedAmount) {
      this.errorMessage.set('Booking and positive claim amount are required.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request: DamageClaimRequest = {
      bookingId: val.bookingId,
      description: val.description,
      claimedAmount: Number(val.claimedAmount),
      evidenceFileUrls: this.claimEvidenceUrls(),
    };

    this.claimService.createDamageClaim(request).subscribe({
      next: (created) => {
        this.submitting.set(false);
        this.claims.update((list) => [created, ...list]);
        this.closeClaimModal();
        this.setTab('claims');
        this.showSuccess(`Damage Claim #${created.id} submitted with status SUBMITTED. Inspection in progress.`);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to submit damage claim. Please check the inputs.');
      },
    });
  }

  // --- Lightbox / Image Viewer ---
  openLightbox(url: string): void {
    this.previewImageUrl.set(url);
  }

  closeLightbox(): void {
    this.previewImageUrl.set(null);
  }

  // Helper getters
  getBookingLabel(bookingId?: number): string {
    if (!bookingId) return 'General Inquiry';
    const b = this.bookings().find((x) => x.id === bookingId);
    if (!b) return `Booking #${bookingId}`;
    return `Order #${b.id} — ${b.packageName || 'Eco Wash'}`;
  }

  priorityBadgeClass(priority?: string): string {
    switch (priority) {
      case 'URGENT': return 'gcw-badge gcw-badge-danger';
      case 'HIGH': return 'gcw-badge gcw-badge-warning';
      case 'MEDIUM': return 'gcw-badge gcw-badge-info';
      default: return 'gcw-badge gcw-badge-neutral';
    }
  }

  complaintStatusBadgeClass(status: ComplaintStatus): string {
    switch (status) {
      case 'RESOLVED': return 'gcw-badge gcw-badge-success';
      case 'UNDER_REVIEW': return 'gcw-badge gcw-badge-warning';
      case 'DISMISSED': return 'gcw-badge gcw-badge-neutral';
      default: return 'gcw-badge gcw-badge-info';
    }
  }

  claimStatusBadgeClass(status: ClaimStatus): string {
    switch (status) {
      case 'APPROVED': return 'gcw-badge gcw-badge-success';
      case 'UNDER_REVIEW': return 'gcw-badge gcw-badge-warning';
      case 'REJECTED': return 'gcw-badge gcw-badge-danger';
      default: return 'gcw-badge gcw-badge-info';
    }
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 5000);
  }
}
