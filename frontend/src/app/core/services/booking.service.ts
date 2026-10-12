import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Booking,
  CreateBookingRequest,
  ChecklistItem,
  WaterUsageRequest,
  WaterUsageResponse,
  AdditionalAddOnRequestCreateRequest,
  AdditionalAddOnReviewRequest,
  AdditionalAddOnRequestResponse,
  SubmitInspectionReportRequest,
  InspectionReportResponse,
  UploadServiceEvidenceRequest,
  ServiceEvidenceResponse,
  SubmitVerificationRequest,
  VerificationResponse,
  ConfirmServiceQualityRequest,
  ServiceQualityConfirmationResponse,
  BookingTimelineResponse,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;
  private readonly _bookings = signal<Booking[]>([]);

  readonly bookings = this._bookings.asReadonly();

  listMine(): Observable<Booking[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/bookings/my`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? []))),
      tap((list) => this._bookings.set(list))
    );
  }

  getById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.gatewayBaseUrl}/api/bookings/${id}`);
  }

  create(request: CreateBookingRequest, _priceBreakdown?: any, _labels?: any): Observable<Booking> {
    return this.http.post<Booking>(`${this.gatewayBaseUrl}/api/bookings`, request).pipe(
      tap((created) => this._bookings.update((list) => [created, ...list]))
    );
  }

  rebook(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.gatewayBaseUrl}/api/bookings/${id}/rebook`, {}).pipe(
      tap((created) => this._bookings.update((list) => [created, ...list]))
    );
  }

  cancel(id: number, reason: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.gatewayBaseUrl}/api/bookings/${id}/cancel`, { reason }).pipe(
      tap((updated) => {
        this._bookings.update((list) => list.map((b) => (b.id === id ? updated : b)));
      })
    );
  }

  reschedule(id: number, scheduledAt: string): Observable<Booking> {
    return this.http.put<Booking>(`${this.gatewayBaseUrl}/api/bookings/${id}/reschedule`, { scheduledAt }).pipe(
      tap((updated) => {
        this._bookings.update((list) => list.map((b) => (b.id === id ? updated : b)));
      })
    );
  }

  getCancellationFee(id: number): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/bookings/${id}/cancellation-fee`);
  }

  getTimeline(id: number): Observable<BookingTimelineResponse[]> {
    return this.http.get<BookingTimelineResponse[]>(`${this.gatewayBaseUrl}/api/bookings/${id}/timeline`);
  }

  // --- Dynamic Checklist ---
  getChecklist(bookingId: number): Observable<ChecklistItem[]> {
    return this.getById(bookingId).pipe(map((b) => b.checklist || []));
  }

  completeChecklistItem(bookingId: number, itemId: number): Observable<ChecklistItem[]> {
    return this.http.post<ChecklistItem[]>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/checklist/${itemId}/complete`, {});
  }

  // --- Water Usage Tracking ---
  recordWaterUsage(bookingId: number, request: WaterUsageRequest): Observable<WaterUsageResponse> {
    return this.http.post<WaterUsageResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/water-usage`, request);
  }

  getWaterUsage(bookingId: number, unit: 'LITERS' | 'GALLONS' = 'LITERS'): Observable<WaterUsageResponse> {
    return this.http.get<WaterUsageResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/water-usage?unit=${unit}`);
  }

  getWaterSummary(bookingId: number): Observable<WaterUsageResponse> {
    return this.getWaterUsage(bookingId, 'LITERS');
  }

  // --- Mid-service Additional Add-Ons ---
  requestAdditionalAddon(bookingId: number, request: AdditionalAddOnRequestCreateRequest): Observable<AdditionalAddOnRequestResponse> {
    return this.http.post<AdditionalAddOnRequestResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/additional-addons`, request);
  }

  getAdditionalAddons(bookingId: number): Observable<AdditionalAddOnRequestResponse[]> {
    return this.http.get<AdditionalAddOnRequestResponse[]>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/additional-addons`);
  }

  reviewAdditionalAddon(bookingId: number, requestId: number, request: AdditionalAddOnReviewRequest): Observable<AdditionalAddOnRequestResponse> {
    return this.http.post<AdditionalAddOnRequestResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/additional-addons/${requestId}/review`, request);
  }

  // --- Before-wash Vehicle Inspection ---
  submitInspection(bookingId: number, request: SubmitInspectionReportRequest): Observable<InspectionReportResponse> {
    return this.http.post<InspectionReportResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/inspection`, request);
  }

  acknowledgeInspection(bookingId: number): Observable<InspectionReportResponse> {
    return this.http.post<InspectionReportResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/inspection/acknowledge`, {});
  }

  getInspection(bookingId: number): Observable<InspectionReportResponse> {
    return this.http.get<InspectionReportResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/inspection`);
  }

  // --- Post-wash Verification & Evidence Photos ---
  uploadEvidence(bookingId: number, request: UploadServiceEvidenceRequest): Observable<ServiceEvidenceResponse> {
    return this.http.post<ServiceEvidenceResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/verification/evidence`, request);
  }

  submitVerification(bookingId: number, request: SubmitVerificationRequest): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/verification`, request);
  }

  getVerification(bookingId: number): Observable<VerificationResponse> {
    return this.http.get<VerificationResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/verification`);
  }

  // --- Service Quality Confirmation ---
  confirmQuality(bookingId: number, request: ConfirmServiceQualityRequest): Observable<ServiceQualityConfirmationResponse> {
    return this.http.post<ServiceQualityConfirmationResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/quality-confirmation`, request);
  }

  getQuality(bookingId: number): Observable<ServiceQualityConfirmationResponse> {
    return this.http.get<ServiceQualityConfirmationResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/quality-confirmation`);
  }

  // --- Booking Messages ---
  sendMessage(bookingId: number, message: string): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/messages`, { message });
  }

  getMessages(bookingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/messages`);
  }
}
