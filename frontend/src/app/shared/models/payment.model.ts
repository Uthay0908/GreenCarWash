// Mirrors payment-service PaymentStatus enum exactly.
export type PaymentStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'PAYOUT_ELIGIBLE'
  | 'PAYOUT_RELEASED'
  | 'PAYOUT_FAILED';

// Mirrors payment-service PaymentResponse.
export interface Payment {
  id: number;
  bookingId: number;
  customerId: number;
  type: 'INITIAL' | 'ADDITIONAL';
  flow: 'ESCROW' | 'SIMPLE';
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerReference?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Mirrors payment-service ChargeRequest.
export interface ChargeRequest {
  bookingId: number;
  paymentMethodToken: string;
}

// Mirrors payment-service RefundRequest.
export interface RefundRequest {
  amount?: number | null;
  reason: string;
}

// Mirrors payment-service RefundResponse.
export interface Refund {
  id: number;
  paymentId: number;
  bookingId: number;
  amount: number;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  providerReference?: string;
  requestedByCustomer: boolean;
  createdAt: string;
  completedAt?: string;
}

// Mirrors payment-service PayoutResponse (washer earnings, admin-visible + washer /me).
export interface Payout {
  id: number;
  paymentId: number;
  bookingId: number;
  washerProfileId: number;
  totalAmount: number;
  platformFeePercentageApplied: number;
  platformFeeAmount: number;
  washerAmount: number;
  currency: string;
  status: 'PENDING' | 'HELD' | 'COMPLETED' | 'FAILED';
  holdReason?: string;
  heldAt?: string;
  releasedAt?: string;
  createdAt: string;
  completedAt?: string;
}
