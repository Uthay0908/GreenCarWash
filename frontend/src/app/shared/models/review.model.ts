// Mirrors review-service ReviewResponse (reviewType: CUSTOMER_TO_WASHER | WASHER_TO_CUSTOMER;
// moderationStatus: VISIBLE | HIDDEN).
export interface Review {
  id: number;
  bookingId: number;
  customerId: number;
  washerProfileId: number;
  reviewType: 'CUSTOMER_TO_WASHER' | 'WASHER_TO_CUSTOMER';
  rating: number;
  comment?: string;
  photoUrls: string[];
  moderationStatus: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
  updatedAt: string;

  // UI-only convenience field (washer display name), not part of the real DTO.
  washerName?: string;
}

// Mirrors review-service ReviewRequest.
export interface ReviewRequest {
  rating: number;
  comment?: string;
  photoUrls?: string[];
}
