import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Reviews } from './reviews';
import { ReviewService } from '../../core/services/review.service';
import { BookingService } from '../../core/services/booking.service';
import { of } from 'rxjs';

describe('Reviews Component', () => {
  let component: Reviews;
  let httpTesting: HttpTestingController;

  const mockReviews = [
    {
      id: 1,
      bookingId: 101,
      customerId: 1,
      washerProfileId: 5,
      reviewType: 'CUSTOMER_TO_WASHER' as const,
      rating: 5,
      comment: 'Super clean and eco-friendly!',
      photoUrls: ['https://example.com/p1.jpg'],
      moderationStatus: 'VISIBLE' as const,
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
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
    {
      id: 102,
      customerId: 1,
      vehicleId: 2,
      addressId: 3,
      packageId: 4,
      packageName: 'Waterless Express',
      status: 'COMPLETED' as const,
      scheduledAt: '2026-03-02T11:00:00Z',
      price: 299,
      totalPrice: 299,
      waterSavedLiters: 150,
    },
  ];

  beforeEach(async () => {
    const reviewServiceStub = {
      listMine: () => of(mockReviews),
      submit: vi.fn(),
      edit: vi.fn(),
      reviews: of(mockReviews),
    };

    const bookingServiceStub = {
      listMine: () => of(mockBookings),
      bookings: of(mockBookings),
    };

    await TestBed.configureTestingModule({
      imports: [Reviews],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReviewService, useValue: reviewServiceStub },
        { provide: BookingService, useValue: bookingServiceStub },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Reviews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load reviews and reviewable bookings', () => {
    expect(component).toBeTruthy();
    expect(component.reviews().length).toBe(1);
    // Booking 101 is already reviewed, so only Booking 102 should be in reviewableBookings
    expect(component.reviewableBookings().length).toBe(1);
    expect(component.reviewableBookings()[0].id).toBe(102);
  });

  it('should calculate average rating correctly', () => {
    expect(component.averageRating()).toBe(5);
  });

  it('should open review form for a specific booking and set values', () => {
    component.openNewReview(102);
    expect(component.formVisible()).toBe(true);
    expect(component.form.controls.bookingId.value).toBe(102);
    expect(component.form.controls.rating.value).toBe(5);
  });

  it('should append feedback tags into comment', () => {
    component.form.controls.comment.setValue('Great service');
    component.appendTag('⭐ Spotless Clean');
    expect(component.form.controls.comment.value).toContain('⭐ Spotless Clean');
  });

  it('should prevent duplicate submission on client side if booking already has review', () => {
    component.openNewReview(101); // 101 already reviewed
    component.submit();
    expect(component.errorMessage()).toContain('A review has already been submitted');
  });
});
