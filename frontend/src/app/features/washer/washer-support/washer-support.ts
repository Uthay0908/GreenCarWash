import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WasherService } from '../../../core/services/washer.service';
import { OperationalTicketRequest } from '../../../shared/models';

interface FaqItem {
  id?: number;
  question: string;
  answer: string;
  category: string;
  open?: boolean;
}

@Component({
  selector: 'app-washer-support',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './washer-support.html',
  styleUrls: ['./washer-support.css'],
})
export class WasherSupport implements OnInit {
  private readonly washerService = inject(WasherService);
  private readonly fb = inject(FormBuilder);

  activeTab = signal<'faqs' | 'tickets' | 'create' | 'contact'>('faqs');
  searchQuery = signal<string>('');
  selectedFaqCategory = signal<string>('ALL');

  loadingFaqs = signal<boolean>(false);
  faqs = signal<FaqItem[]>([]);

  loadingTickets = signal<boolean>(false);
  tickets = signal<any[]>([]);
  ticketFilter = signal<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  submittingTicket = signal<boolean>(false);
  ticketSuccess = signal<string | null>(null);
  ticketError = signal<string | null>(null);

  recentBookings = signal<any[]>([]);

  ticketForm: FormGroup = this.fb.group({
    category: ['EQUIPMENT_ISSUE', Validators.required],
    bookingId: [''],
    subject: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    replacementRequested: [false],
  });

  // Comprehensive fallback washer FAQs in case backend FAQ table is not yet seeded by Admin
  readonly defaultWasherFaqs: FaqItem[] = [
    {
      question: 'What should I do if high-pressure wash equipment malfunctions on-site?',
      answer: 'Immediately pause the wash session and switch off the main water valve. Navigate to Help & Support > Create Ticket, select "Equipment Malfunction", and check "Request Immediate Replacement". Our mobile dispatch team will deliver a backup pressure kit within 30-45 minutes.',
      category: 'EQUIPMENT',
      open: false,
    },
    {
      question: 'How do I report actual water consumption after completing a wash?',
      answer: 'In the Active Job screen under the "Water" tab, view your allocated water limit (e.g. 150L). Enter your exact meter reading in the "Actual Liters Used" field and submit. Water saved is automatically logged and contributed to your Eco-Score.',
      category: 'WATER',
      open: false,
    },
    {
      question: 'What happens if a customer does not show up or the vehicle is inaccessible?',
      answer: 'Wait at the designated location for at least 15 minutes and call the customer via the contact card. If still unreachable, raise a "Service Issue" ticket and contact Dispatch. You will still receive base compensation for arriving at the location.',
      category: 'BOOKINGS',
      open: false,
    },
    {
      question: 'When and how are my wash earnings paid out?',
      answer: 'Completed job earnings are credited immediately to your pending balance. Automatic bank transfers are processed every Tuesday and Friday to your linked bank account. You can track all settlements under the Earnings tab.',
      category: 'PAYMENTS',
      open: false,
    },
    {
      question: 'How do I add an extra service (like ceramic wax or interior deep shampoo)?',
      answer: 'Navigate to Active Job > Add-ons tab. Select the required add-on and submit a request. The customer receives a push notification on their phone to approve and pay. Do not perform the additional service until the status shows "APPROVED".',
      category: 'SERVICE',
      open: false,
    },
    {
      question: 'What is required for KYC document re-verification?',
      answer: 'If any document expires or is rejected, visit KYC & Documents to review the reviewer comments. Re-upload a clear high-resolution photo of your Driving License or National ID and tap "Submit for Review". Verification completes in under 24 hours.',
      category: 'ACCOUNT',
      open: false,
    },
  ];

  ngOnInit(): void {
    this.loadFaqs();
    this.loadTickets();
    this.loadRecentBookings();
  }

  loadFaqs(): void {
    this.loadingFaqs.set(true);
    this.washerService.getFaqs().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const mapped: FaqItem[] = data.map((f: any) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.category || 'GENERAL',
            open: false,
          }));
          this.faqs.set(mapped);
        } else {
          this.faqs.set(this.defaultWasherFaqs);
        }
        this.loadingFaqs.set(false);
      },
      error: () => {
        this.faqs.set(this.defaultWasherFaqs);
        this.loadingFaqs.set(false);
      },
    });
  }

  loadTickets(): void {
    this.loadingTickets.set(true);
    this.washerService.getMyOperationalTickets(0, 50).subscribe({
      next: (items) => {
        this.tickets.set(items || []);
        this.loadingTickets.set(false);
      },
      error: () => {
        this.tickets.set([]);
        this.loadingTickets.set(false);
      },
    });
  }

  loadRecentBookings(): void {
    this.washerService.listMyBookings().subscribe({
      next: (b) => this.recentBookings.set(b || []),
      error: () => this.recentBookings.set([]),
    });
  }

  toggleFaq(faq: FaqItem): void {
    faq.open = !faq.open;
  }

  get filteredFaqs(): FaqItem[] {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedFaqCategory();

    return this.faqs().filter((f) => {
      const matchCat = cat === 'ALL' || f.category.toUpperCase() === cat.toUpperCase();
      const matchQ = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }

  get filteredTickets(): any[] {
    const filter = this.ticketFilter();
    if (filter === 'ALL') return this.tickets();
    return this.tickets().filter((t) => t.status === filter);
  }

  get openTicketsCount(): number {
    return this.tickets().filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  }

  submitTicket(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.submittingTicket.set(true);
    this.ticketSuccess.set(null);
    this.ticketError.set(null);

    const val = this.ticketForm.value;
    const req: OperationalTicketRequest = {
      category: val.category,
      subject: val.subject.trim(),
      description: val.description.trim(),
      replacementRequested: !!val.replacementRequested,
      bookingId: val.bookingId ? Number(val.bookingId) : undefined,
    };

    this.washerService.createOperationalTicket(req).subscribe({
      next: (res) => {
        this.submittingTicket.set(false);
        this.ticketSuccess.set(`Ticket #${res.id} created successfully! Our dispatch supervisor has been notified.`);
        this.ticketForm.reset({
          category: 'EQUIPMENT_ISSUE',
          bookingId: '',
          subject: '',
          description: '',
          replacementRequested: false,
        });
        this.loadTickets();
        setTimeout(() => {
          this.activeTab.set('tickets');
          this.ticketSuccess.set(null);
        }, 1800);
      },
      error: (err) => {
        this.submittingTicket.set(false);
        this.ticketError.set(err?.error?.message || 'Failed to submit ticket. Please try again or call dispatch.');
      },
    });
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'RESOLVED':
        return 'Resolved';
      case 'CLOSED':
        return 'Closed';
      default:
        return status;
    }
  }

  formatCategory(cat: string): string {
    switch (cat) {
      case 'EQUIPMENT_ISSUE':
        return 'Equipment Malfunction';
      case 'SERVICE_ISSUE':
        return 'Service Complication';
      case 'VEHICLE_ISSUE':
        return 'Vehicle Issue';
      case 'GENERAL':
        return 'General Query';
      default:
        return cat;
    }
  }
}
