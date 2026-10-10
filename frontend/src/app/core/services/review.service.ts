import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review, ReviewRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;
  private readonly _reviews = signal<Review[]>([]);

  readonly reviews = this._reviews.asReadonly();

  listMine(): Observable<Review[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reviews/my`).pipe(
      map((res) => Array.isArray(res) ? res : (res?.content || [])),
      tap((list) => this._reviews.set(list))
    );
  }

  submitCustomerReview(bookingId: number, request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.gatewayBaseUrl}/api/reviews/booking/${bookingId}`, request).pipe(
      tap((r) => this._reviews.update((list) => [r, ...list]))
    );
  }

  submit(bookingId: number, request: ReviewRequest): Observable<Review> {
    return this.submitCustomerReview(bookingId, request);
  }

  submitWasherReview(bookingId: number, request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.gatewayBaseUrl}/api/reviews/booking/${bookingId}/washer-review`, request);
  }

  getById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.gatewayBaseUrl}/api/reviews/${id}`);
  }

  getByBookingId(bookingId: number): Observable<Review | null> {
    return this.http.get<Review | null>(`${this.gatewayBaseUrl}/api/reviews/booking/${bookingId}`);
  }

  update(id: number, request: ReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.gatewayBaseUrl}/api/reviews/${id}`, request).pipe(
      tap((updated) => this._reviews.update((list) => list.map((r) => (r.id === id ? updated : r))))
    );
  }

  edit(id: number, request: ReviewRequest): Observable<Review> {
    return this.update(id, request);
  }

  getReviewsForWasher(washerProfileId: number, page = 0, size = 20): Observable<Review[]> {
    return this.http.get<{ content: Review[] } | Review[]>(`${this.gatewayBaseUrl}/api/reviews/washer/${washerProfileId}?page=${page}&size=${size}`).pipe(
      map((res) => (Array.isArray(res) ? res : res.content || []))
    );
  }

  getWasherAverageRating(washerProfileId: number): Observable<number> {
    return this.http.get<number>(`${this.gatewayBaseUrl}/api/reviews/washer/${washerProfileId}/average-rating`);
  }

  moderateReview(reviewId: number, visible: boolean): Observable<Review> {
    return this.http.post<Review>(`${this.gatewayBaseUrl}/api/reviews/${reviewId}/moderate?visible=${visible}`, {});
  }
}
