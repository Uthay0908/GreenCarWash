import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SupportHub } from './support-hub';
import { SupportService } from '../../core/services/support.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { DamageClaimService } from '../../core/services/damage-claim.service';
import { BookingService } from '../../core/services/booking.service';
import { of } from 'rxjs';

describe('SupportHub Component', () => {
  let component: SupportHub;

  const mockFaqs = [
    {
      id: 1,
      category: 'SERVICES',
      question: 'What is waterless wash?',
      answer: 'It saves water and uses polymers.',
      active: true,
      displayOrder: 1,
    },
    {
      id: 2,
      category: 'PAYMENTS',
      question: 'How do refunds work?',
      answer: 'Refunds are processed within 2 days.',
      active: true,
      displayOrder: 2,
    },
  ];

  const mockTickets = [
    {
      id: 10,
      subject: 'Issue with booking schedule',
      description: 'Need to shift time by 1 hour.',
      status: 'OPEN' as const,
      category: 'GENERAL' as const,
      priority: 'MEDIUM' as const,
      createdAt: '2026-03-01T10:00:00Z',
    },
  ];

  const mockComplaints = [
    {
      id: 20,
      bookingId: 101,
      customerId: 1,
      description: 'Washer missed the front bumper.',
      status: 'RESOLVED' as const,
      resolutionDecision: 'CREDIT' as const,
      creditAmount: 100,
      rewashRequested: false,
      createdAt: '2026-03-02T10:00:00Z',
    },
  ];

  const mockClaims = [
    {
      id: 30,
      bookingId: 101,
      customerId: 1,
      description: 'Scratch on the mirror.',
      status: 'APPROVED' as const,
      claimedAmount: 1500,
      approvedAmount: 1500,
      evidenceFileUrls: ['https://example.com/damage1.jpg'],
      createdAt: '2026-03-03T10:00:00Z',
    },
  ];

  const mockBookings = [
    {
      id: 101,
      customerId: 1,
      vehicleId: 2,
      addressId: 3,
      packageId: 4,
      packageName: 'Eco Super Foam',
      status: 'COMPLETED' as const,
      scheduledAt: '2026-03-01T09:00:00Z',
      price: 499,
      totalPrice: 499,
      waterSavedLiters: 200,
    },
  ];

  beforeEach(async () => {
    const supportServiceStub = {
      getFaqs: () => of(mockFaqs),
      listMyTickets: () => of(mockTickets),
      createTicket: vi.fn().mockReturnValue(of({ ...mockTickets[0], id: 11 })),
    };

    const complaintServiceStub = {
      listMyComplaints: () => of(mockComplaints),
      createComplaint: vi.fn().mockReturnValue(of({ ...mockComplaints[0], id: 21 })),
    };

    const claimServiceStub = {
      listMyDamageClaims: () => of(mockClaims),
      createDamageClaim: vi.fn().mockReturnValue(of({ ...mockClaims[0], id: 31 })),
    };

    const bookingServiceStub = {
      listMine: () => of(mockBookings),
    };

  await TestBed.configureTestingModule({
      imports: [SupportHub],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SupportService, useValue: supportServiceStub },
        { provide: ComplaintService, useValue: complaintServiceStub },
        { provide: DamageClaimService, useValue: claimServiceStub },
        { provide: BookingService, useValue: bookingServiceStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SupportHub);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load faqs, tickets, complaints, and damage claims', () => {
    expect(component).toBeTruthy();
    expect(component.faqs().length).toBe(2);
    expect(component.tickets().length).toBe(1);
    expect(component.complaints().length).toBe(1);
    expect(component.claims().length).toBe(1);
  });

  it('should filter FAQs by search query', () => {
    component.faqSearchQuery.set('refund');
    expect(component.filteredFaqs().length).toBe(1);
    expect(component.filteredFaqs()[0].question).toContain('refunds');
  });

  it('should toggle FAQ expansion state', () => {
    component.toggleFaq(2);
    expect(component.isFaqExpanded(2)).toBe(true);
    component.toggleFaq(2);
    expect(component.isFaqExpanded(2)).toBe(false);
  });

  it('should open complaint modal and pre-populate first booking', () => {
    component.openComplaintModal();
    expect(component.showComplaintModal()).toBe(true);
    expect(component.complaintForm.controls.bookingId.value).toBe(101);
  });

  it('should open damage claim modal and validate claimed amount', () => {
    component.openClaimModal();
    expect(component.showClaimModal()).toBe(true);
    component.claimForm.controls.claimedAmount.setValue(null);
    expect(component.claimForm.invalid).toBe(true);
    component.claimForm.controls.claimedAmount.setValue(500);
    component.claimForm.controls.description.setValue('Rear bumper paint scuff during wash');
    expect(component.claimForm.valid).toBe(true);
  });
});
