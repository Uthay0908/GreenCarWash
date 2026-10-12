import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, ChargeRequest, Refund, RefundRequest, Payout } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;
  private readonly _payments = signal<Payment[]>([]);

  readonly payments = this._payments.asReadonly();

  charge(bookingId: number, paymentMethodToken: string): Observable<Payment> {
    return this.http
      .post<Payment>(`${this.gatewayBaseUrl}/api/payments/charge`, {
        bookingId,
        paymentMethodToken,
      })
      .pipe(
        tap((p) => this._payments.update((list) => [p, ...list]))
      );
  }

  chargeAdditional(additionalAddOnRequestId: number, paymentMethodToken: string): Observable<Payment> {
    return this.http
      .post<Payment>(`${this.gatewayBaseUrl}/api/payments/charge-additional`, {
        additionalAddOnRequestId,
        paymentMethodToken,
      })
      .pipe(
        tap((p) => this._payments.update((list) => [p, ...list]))
      );
  }

  retryPayment(paymentId: number, bookingId: number, paymentMethodToken: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.gatewayBaseUrl}/api/payments/${paymentId}/retry`, {
      bookingId,
      paymentMethodToken,
    });
  }

  getPaymentForBooking(bookingId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.gatewayBaseUrl}/api/payments/booking/${bookingId}`);
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.gatewayBaseUrl}/api/payments/${id}`);
  }

  listMine(page = 0, size = 20): Observable<Payment[]> {
    return this.http
      .get<{ content: Payment[] } | Payment[]>(`${this.gatewayBaseUrl}/api/payments/my?page=${page}&size=${size}`)
      .pipe(
        map((res) => (Array.isArray(res) ? res : res.content || [])),
        tap((list) => this._payments.set(list))
      );
  }

  listMyPayments(page = 0, size = 20): Observable<Payment[]> {
    return this.listMine(page, size);
  }

  // --- Refunds ---
  requestRefundByCustomer(paymentId: number, amount: number | null, reason: string): Observable<Refund> {
    return this.http.post<Refund>(`${this.gatewayBaseUrl}/api/refunds/payments/${paymentId}/request`, { amount, reason });
  }

  requestRefundAsAdmin(paymentId: number, amount: number | null, reason: string): Observable<Refund> {
    return this.http.post<Refund>(`${this.gatewayBaseUrl}/api/refunds/payments/${paymentId}`, { amount, reason });
  }

  approveRefund(refundId: number): Observable<Refund> {
    return this.http.post<Refund>(`${this.gatewayBaseUrl}/api/refunds/${refundId}/approve`, {});
  }

  rejectRefund(refundId: number, reason: string): Observable<Refund> {
    return this.http.post<Refund>(`${this.gatewayBaseUrl}/api/refunds/${refundId}/reject`, { reason });
  }

  getRefund(id: number): Observable<Refund> {
    return this.http.get<Refund>(`${this.gatewayBaseUrl}/api/refunds/${id}`);
  }

  listRefundsForPayment(paymentId: number): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.gatewayBaseUrl}/api/refunds/payment/${paymentId}`);
  }

  // --- Payouts ---
  listPayouts(): Observable<Payout[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/payouts`).pipe(
      map((res) => (Array.isArray(res) ? res : res.content || []))
    );
  }

  executePayout(payoutId: number): Observable<Payout> {
    return this.http.post<Payout>(`${this.gatewayBaseUrl}/api/payouts/${payoutId}/execute`, {});
  }

  holdPayout(payoutId: number, reason: string): Observable<Payout> {
    return this.http.post<Payout>(`${this.gatewayBaseUrl}/api/payouts/${payoutId}/hold`, { reason });
  }

  releasePayout(payoutId: number): Observable<Payout> {
    return this.http.post<Payout>(`${this.gatewayBaseUrl}/api/payouts/${payoutId}/release`, {});
  }
}
