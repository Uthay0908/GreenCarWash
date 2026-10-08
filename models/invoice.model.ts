// Mirrors invoice-service InvoiceItemResponse.
export interface InvoiceItem {
  description: string;
  amount: number;
}

// Mirrors invoice-service InvoiceResponse (RefundStatus enum: NONE, PARTIALLY_REFUNDED, FULLY_REFUNDED).
export interface Invoice {
  id: number;
  bookingId: number;
  customerId: number;
  invoiceNumber: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  refundedAmount: number;
  items: InvoiceItem[];
  issuedAt: string;
  refundStatus: 'NONE' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED';
}
