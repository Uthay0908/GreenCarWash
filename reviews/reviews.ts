import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { ReviewService } from '../../core/services/review.service';
import { StarRating } from '../../shared/components/star-rating/star-rating';
import { Booking, Review } from '../../shared/models';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StarRating, DatePipe],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reviews {
  private readonly fb = inject(FormBuilder);
  private readonly reviewService = inject(ReviewService);
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);

  readonly reviews = signal<Review[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Form & modal state
  readonly formVisible = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly photoUrls = signal<string[]>([]);
  readonly newPhotoUrlInput = signal('');
  readonly selectedRatingFilter = signal<number | null>(null);
  readonly previewImageUrl = signal<string | null>(null);

  // Quick feedback suggestion tags
  readonly feedbackTags = [
    '⭐ Spotless Clean',
    '⏱️ Punctual Washer',
    '💧 Water Saver Hero',
    '🤝 Polite & Professional',
    '✨ Detailed Interior',
    '🛡️ Careful with Vehicle',
    '🌿 Truly Eco-Friendly',
  ];

  readonly form = this.fb.nonNullable.group({
    bookingId: [null as number | null, Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(1000)]],
  });

  // Completed bookings that can be reviewed anytime
  readonly reviewableBookings = computed(() => {
    return this.bookings().filter((b) => b.status === 'COMPLETED');
  });

  // Filtered reviews list
  readonly filteredReviews = computed(() => {
    const filter = this.selectedRatingFilter();
    const list = this.reviews();
    if (filter === null) return list;
    return list.filter((r) => r.rating === filter);
  });

  // Statistics
  readonly averageRating = computed(() => {
    const list = this.reviews();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / list.length) * 10) / 10;
  });

  readonly ratingCounts = computed(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of this.reviews()) {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    }
    return counts;
  });

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.reviewService.listMine().subscribe({
      next: (reviews) => {
        this.reviews.set(reviews || []);
        this.loadBookings();
      },
      error: () => {
        this.loadBookings();
      },
    });
  }

  private loadBookings(): void {
    this.bookingService.listMine().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings || []);
        this.loading.set(false);

        // Check if navigated from an order with ?bookingId=...
        const targetId = this.route.snapshot.queryParamMap.get('bookingId');
        if (targetId) {
          const numId = Number(targetId);
          const existingReview = this.reviews().find((r) => r.bookingId === numId);
          if (existingReview) {
            this.openEdit(existingReview);
          } else {
            this.openNewReview(numId);
          }
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openNewReview(bookingId?: number): void {
    this.editingId.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.photoUrls.set([]);
    this.newPhotoUrlInput.set('');

    const targetBookingId = bookingId ?? (this.reviewableBookings()[0]?.id ?? null);
    this.form.reset({
      bookingId: targetBookingId,
      rating: 5,
      comment: '',
    });
    this.formVisible.set(true);
  }

  openEdit(review: Review): void {
    this.editingId.set(review.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.photoUrls.set([...(review.photoUrls || [])]);
    this.newPhotoUrlInput.set('');

    this.form.patchValue({
      bookingId: review.bookingId,
      rating: review.rating,
      comment: review.comment ?? '',
    });
    this.formVisible.set(true);
  }

  cancelForm(): void {
    this.formVisible.set(false);
    this.editingId.set(null);
    this.errorMessage.set(null);
  }

  setRating(value: number): void {
    this.form.controls.rating.setValue(value);
  }

  getRatingText(rating: number): string {
    switch (rating) {
      case 5: return 'Excellent! Exceeded expectations.';
      case 4: return 'Very Good! Clean and prompt.';
      case 3: return 'Good / Satisfactory service.';
      case 2: return 'Fair. Some areas need improvement.';
      case 1: return 'Poor. Unacceptable experience.';
      default: return 'Tap a star to rate.';
    }
  }

  appendTag(tag: string): void {
    const current = this.form.controls.comment.value.trim();
    if (current.includes(tag)) return;
    const updated = current ? `${current} · ${tag}` : tag;
    this.form.controls.comment.setValue(updated);
  }

  addPhotoUrl(inputElem: HTMLInputElement): void {
    const url = inputElem.value.trim();
    if (!url) return;
    if (this.photoUrls().length >= 10) {
      this.errorMessage.set('Maximum 10 photos allowed per review.');
      return;
    }
    this.photoUrls.update((urls) => [...urls, url]);
    inputElem.value = '';
    this.newPhotoUrlInput.set('');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const availableSlots = 10 - this.photoUrls().length;
    if (availableSlots <= 0) {
      this.errorMessage.set('Maximum 10 photos allowed.');
      return;
    }

    const filesToRead = files.slice(0, availableSlots);
    for (const file of filesToRead) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.photoUrls.update((urls) => [...urls, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removePhoto(index: number): void {
    this.photoUrls.update((urls) => urls.filter((_, i) => i !== index));
  }

  openLightbox(url: string): void {
    this.previewImageUrl.set(url);
  }

  closeLightbox(): void {
    this.previewImageUrl.set(null);
  }

  filterByRating(rating: number | null): void {
    this.selectedRatingFilter.set(rating);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { bookingId, rating, comment } = this.form.getRawValue();
    if (!bookingId) {
      this.errorMessage.set('Please select a valid completed booking.');
      return;
    }

    // Client-side duplicate check
    const editing = this.editingId();
    if (!editing) {
      const alreadyReviewed = this.reviews().some((r) => r.bookingId === bookingId);
      if (alreadyReviewed) {
        this.errorMessage.set('A review has already been submitted for this booking. You can edit your existing review below.');
        return;
      }
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    const photos = this.photoUrls();

    if (editing) {
      this.reviewService.edit(editing, { rating, comment, photoUrls: photos }).subscribe({
        next: (updated) => {
          this.submitting.set(false);
          this.reviews.update((list) => list.map((r) => (r.id === editing ? updated : r)));
          this.successMessage.set('Your review has been successfully updated!');
          this.formVisible.set(false);
          setTimeout(() => this.successMessage.set(null), 4000);
        },
        error: (err) => {
          this.submitting.set(false);
          this.handleError(err, bookingId);
        },
      });
    } else {
      this.reviewService.submit(bookingId, { rating, comment, photoUrls: photos }).subscribe({
        next: (created) => {
          this.submitting.set(false);
          this.reviews.update((list) => [created, ...list]);
          this.successMessage.set('Thank you! Your review has been submitted.');
          this.formVisible.set(false);
          setTimeout(() => this.successMessage.set(null), 4000);
        },
        error: (err) => {
          this.submitting.set(false);
          this.handleError(err, bookingId);
        },
      });
    }
  }

  private handleError(err: any, bookingId: number): void {
    if (err?.status === 409 || err?.error?.code === 'REVIEW_ALREADY_EXISTS') {
      this.errorMessage.set(
        'Duplicate review prevented: A review already exists for booking #' +
          bookingId +
          '. You can find and edit it in your review history below.'
      );
      // Reload reviews to sync state
      this.reviewService.listMine().subscribe((list) => this.reviews.set(list || []));
    } else if (err?.error?.message) {
      this.errorMessage.set(err.error.message);
    } else {
      this.errorMessage.set('Unable to submit review right now. Please try again.');
    }
  }

  getBookingDescription(bookingId: number): string {
    const booking = this.bookings().find((b) => b.id === bookingId);
    if (!booking) return `Booking #${bookingId}`;
    return `Order #${booking.id} — ${booking.packageName ?? 'Eco Wash'}`;
  }
}
