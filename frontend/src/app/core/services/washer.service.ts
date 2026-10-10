import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Assignment,
  WasherAvailability,
  WasherPerformance,
  WasherProfile,
  CreateWasherProfileRequest,
  UpdateWasherProfileRequest,
  AvailabilityUpdateRequest,
  UpdateSkillsRequest,
  AvailabilityBlackoutRequest,
  AvailabilityBlackoutResponse,
  KycDocumentUploadRequest,
  KycDocumentResponse,
  KycReviewRequest,
  NavigationResponse,
  EtaLocationResponse,
  ChecklistItem,
  UploadServiceEvidenceRequest,
  ServiceEvidenceResponse,
  VerificationResponse,
  SubmitVerificationRequest,
  WaterUsageRequest,
  WaterUsageResponse,
  AdditionalAddOnRequestResponse,
  AdditionalAddOnRequestCreateRequest,
  Booking,
  UpdateBankInfoRequest,
  UpdateConnectAccountRequest,
  WasherNotification,
  OperationalTicketRequest,
  WasherPayoutResponse,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class WasherService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  private readonly _availability = signal<WasherAvailability | null>(null);
  readonly availability = this._availability.asReadonly();
  readonly isOnline = computed(() => !!this._availability()?.online);

  getMyProfile(): Observable<WasherProfile> {
    return this.http.get<WasherProfile>(`${this.gatewayBaseUrl}/api/washers/profile/me`);
  }

  createProfile(request: CreateWasherProfileRequest): Observable<WasherProfile> {
    return this.http.post<WasherProfile>(`${this.gatewayBaseUrl}/api/washers/profile`, request);
  }

  updateProfile(request: UpdateWasherProfileRequest): Observable<WasherProfile> {
    return this.http.put<WasherProfile>(`${this.gatewayBaseUrl}/api/washers/profile/me`, request);
  }

  getMyAvailability(): Observable<WasherAvailability> {
    return this.http.get<WasherAvailability>(`${this.gatewayBaseUrl}/api/washers/profile/me/availability`).pipe(
      tap((avail) => this._availability.set(avail))
    );
  }

  getAvailabilityByWasherId(washerProfileId: number): Observable<WasherAvailability> {
    return this.http.get<WasherAvailability>(`${this.gatewayBaseUrl}/api/washers/${washerProfileId}/availability`);
  }

  updateAvailability(request: AvailabilityUpdateRequest): Observable<WasherAvailability> {
    return this.http.put<WasherAvailability>(`${this.gatewayBaseUrl}/api/washers/profile/me/availability`, request).pipe(
      tap((avail) => this._availability.set(avail))
    );
  }

  setOnline(online: boolean): Observable<WasherAvailability> {
    const current = this._availability();
    if (current) {
      this._availability.set({ ...current, online });
    }
    return this.updateAvailability({ online }).pipe(
      tap({
        next: (avail) => this._availability.set(avail),
        error: () => {
          if (current) {
            this._availability.set(current);
          }
        },
      })
    );
  }

  listOnlineWashers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/washers/availability/online`).pipe(
      map((res: any) => (Array.isArray(res) ? res : []))
    );
  }

  updateLocation(latitude: number, longitude: number): Observable<any> {
    return this.http.put(`${this.gatewayBaseUrl}/api/washers/profile/me/location`, { latitude, longitude });
  }

  updateSkills(washerId: number, skills: string[]): Observable<WasherProfile> {
    return this.http.put<WasherProfile>(`${this.gatewayBaseUrl}/api/washers/${washerId}/skills`, { skills });
  }

  addBlackout(washerId: number, request: AvailabilityBlackoutRequest): Observable<AvailabilityBlackoutResponse> {
    return this.http.post<AvailabilityBlackoutResponse>(`${this.gatewayBaseUrl}/api/washers/${washerId}/availability/blackouts`, request);
  }

  removeBlackout(washerId: number, blackoutId: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/washers/${washerId}/availability/blackouts/${blackoutId}`);
  }

  listMyBookings(status?: string): Observable<any[]> {
    return this.getMyProfile().pipe(
      switchMap((profile) => {
        let url = `${this.gatewayBaseUrl}/api/bookings/washer/${profile.id}`;
        if (status) url += `?status=${status}`;
        return this.http.get<any>(url);
      }),
      map((res: any) => Array.isArray(res) ? res : (res?.content || []))
    );
  }

  getMyPendingRequests(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.gatewayBaseUrl}/api/assignments/my/pending`).pipe(
      map((res: any) => (Array.isArray(res) ? res : []))
    );
  }

  getMyActiveAssignment(): Observable<Assignment | null> {
    return this.http.get<Assignment | null>(`${this.gatewayBaseUrl}/api/assignments/my/active`);
  }

  listMyAssignments(): Observable<any[]> {
    return this.listMyBookings();
  }

  getAssignmentForBooking(bookingId: number): Observable<Assignment> {
    return this.http.get<Assignment>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}`);
  }

  acceptAssignment(bookingId: number): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/accept`, {});
  }

  rejectAssignment(bookingId: number, reason: string): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/reject`, { reason });
  }

  onTheWay(bookingId: number): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/on-the-way`, {});
  }

  updateLiveLocation(bookingId: number, latitude: number, longitude: number): Observable<any> {
    return this.http.put(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/location`, { latitude, longitude });
  }

  arrived(bookingId: number): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/arrived`, {});
  }

  startWash(bookingId: number): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/start`, {});
  }

  getNavigation(bookingId: number): Observable<NavigationResponse> {
    return this.http.get<NavigationResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/navigation`);
  }

  getLocation(bookingId: number): Observable<EtaLocationResponse> {
    return this.http.get<EtaLocationResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/location`);
  }

  updateLocationWithEta(bookingId: number, latitude: number, longitude: number, etaMinutes?: number): Observable<EtaLocationResponse> {
    return this.http.put<EtaLocationResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/location`, { latitude, longitude, etaMinutes });
  }

  getBooking(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}`);
  }

  getChecklist(bookingId: number): Observable<ChecklistItem[]> {
    return this.http.get<ChecklistItem[]>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/checklist`).pipe(
      catchError(() => this.getBooking(bookingId).pipe(map((b: any) => b?.checklist || [])))
    );
  }

  uploadEvidence(bookingId: number, request: UploadServiceEvidenceRequest): Observable<ServiceEvidenceResponse> {
    return this.http.post<ServiceEvidenceResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/verification/evidence`, request);
  }

  submitVerification(bookingId: number, request: SubmitVerificationRequest): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/verification`, request);
  }

  getVerification(bookingId: number): Observable<VerificationResponse> {
    return this.http.get<VerificationResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/verification`);
  }

  completeChecklistItem(bookingId: number, itemId: number): Observable<ChecklistItem[]> {
    return this.http.post<ChecklistItem[]>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/checklist/${itemId}/complete`, {});
  }

  submitInspection(bookingId: number, notes: string, photoUrls: string[]): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/inspection`, {
      beforePhotos: photoUrls,
      existingDamageNotes: notes
    });
  }

  logWaterUsage(bookingId: number, litersUsed: number): Observable<any> {
    return this.http.post(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/water-usage`, { actualWaterUsedLiters: litersUsed });
  }

  recordWaterUsage(bookingId: number, request: WaterUsageRequest): Observable<WaterUsageResponse> {
    return this.http.post<WaterUsageResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/water-usage`, request);
  }

  getWaterSummary(bookingId: number, unit: 'LITERS' | 'GALLONS' = 'LITERS'): Observable<WaterUsageResponse> {
    return this.http.get<WaterUsageResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/water-usage?unit=${unit}`);
  }

  requestAdditionalAddon(bookingId: number, addOnId: number, reason: string): Observable<AdditionalAddOnRequestResponse> {
    return this.http.post<AdditionalAddOnRequestResponse>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/additional-addons`, { addOnId, reason });
  }

  getAdditionalAddons(bookingId: number): Observable<AdditionalAddOnRequestResponse[]> {
    return this.http.get<AdditionalAddOnRequestResponse[]>(`${this.gatewayBaseUrl}/api/bookings/${bookingId}/additional-addons`);
  }

  getMyPerformance(washerId?: number): Observable<WasherPerformance> {
    if (washerId) {
      return this.http.get<WasherPerformance>(`${this.gatewayBaseUrl}/api/assignments/washers/${washerId}/performance`);
    }
    return this.getMyProfile().pipe(
      switchMap((profile) =>
        this.http.get<WasherPerformance>(`${this.gatewayBaseUrl}/api/assignments/washers/${profile.id}/performance`)
      )
    );
  }

  // --- Banking & Payout Credentials ---
  updateBankInfo(request: UpdateBankInfoRequest): Observable<WasherProfile> {
    return this.http.put<WasherProfile>(`${this.gatewayBaseUrl}/api/washers/profile/me/bank-info`, request);
  }

  updateConnectAccount(request: UpdateConnectAccountRequest): Observable<WasherProfile> {
    return this.http.put<WasherProfile>(`${this.gatewayBaseUrl}/api/washers/profile/me/connect-account`, request);
  }

  updateMySkills(skills: string[]): Observable<WasherProfile> {
    return this.http.put<WasherProfile>(`${this.gatewayBaseUrl}/api/washers/profile/me/skills`, { skills });
  }

  // --- Availability Windows / Blackouts / Breaks ---
  listMyBlackouts(): Observable<AvailabilityBlackoutResponse[]> {
    return this.http.get<AvailabilityBlackoutResponse[]>(`${this.gatewayBaseUrl}/api/washers/profile/me/availability/blackouts`);
  }

  addMyBlackout(request: AvailabilityBlackoutRequest): Observable<AvailabilityBlackoutResponse> {
    return this.http.post<AvailabilityBlackoutResponse>(`${this.gatewayBaseUrl}/api/washers/profile/me/availability/blackouts`, request);
  }

  removeMyBlackout(blackoutId: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/washers/profile/me/availability/blackouts/${blackoutId}`);
  }

  // --- KYC ---
  uploadKycDocument(request: KycDocumentUploadRequest): Observable<KycDocumentResponse> {
    return this.http.post<KycDocumentResponse>(`${this.gatewayBaseUrl}/api/kyc/documents`, request);
  }

  getMyKycDocuments(): Observable<KycDocumentResponse[]> {
    return this.http.get<KycDocumentResponse[]>(`${this.gatewayBaseUrl}/api/kyc/documents/me`);
  }

  submitKycForReview(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.gatewayBaseUrl}/api/kyc/submit`, {});
  }

  getKycStatus(): Observable<any> {
    return this.getMyProfile();
  }

  adminListKycDocuments(): Observable<KycDocumentResponse[]> {
    return this.http.get<KycDocumentResponse[]>(`${this.gatewayBaseUrl}/api/kyc/admin/documents`);
  }

  adminReviewKycDocument(documentId: number, request: KycReviewRequest): Observable<KycDocumentResponse> {
    return this.http.put<KycDocumentResponse>(`${this.gatewayBaseUrl}/api/kyc/admin/documents/${documentId}/review`, request);
  }

  // --- Financial Payouts ---
  getMyPayouts(): Observable<WasherPayoutResponse[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/payouts/me`).pipe(
      map((res: any) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  // --- Notifications Center ---
  getMyNotifications(page = 0, size = 20): Observable<{ content: WasherNotification[]; totalElements: number }> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/notifications?page=${page}&size=${size}`).pipe(
      map((res: any) => {
        if (Array.isArray(res)) {
          return { content: res, totalElements: res.length };
        }
        return {
          content: res?.content || [],
          totalElements: res?.totalElements || 0,
        };
      })
    );
  }

  getUnreadNotificationCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.gatewayBaseUrl}/api/notifications/unread-count`);
  }

  markNotificationRead(id: number): Observable<WasherNotification> {
    return this.http.post<WasherNotification>(`${this.gatewayBaseUrl}/api/notifications/${id}/read`, {});
  }

  // --- Help & Support ---
  getFaqs(category?: string): Observable<any[]> {
    const url = category ? `${this.gatewayBaseUrl}/api/faqs?category=${category}` : `${this.gatewayBaseUrl}/api/faqs`;
    return this.http.get<any>(url).pipe(
      map((res: any) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  createOperationalTicket(request: OperationalTicketRequest): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/support/operational`, request);
  }

  getMyOperationalTickets(page = 0, size = 20): Observable<any[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/support/operational/my?page=${page}&size=${size}`).pipe(
      map((res: any) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  // --- Payment & COD Confirmation ---
  getBookingPayment(bookingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/payments/booking/${bookingId}`).pipe(
      map((res: any) => (Array.isArray(res) ? res : res ? [res] : []))
    );
  }

  confirmCashCollected(bookingId: number): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/payments/booking/${bookingId}/cash-collected`, {});
  }

  // --- Leaderboard ---
  getLeaderboard(limit = 20): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/assignments/washers/leaderboard?limit=${limit}`).pipe(
      catchError(() => this.http.get<any[]>(`${this.gatewayBaseUrl}/api/washers/leaderboard?limit=${limit}`)),
      map((res: any) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  // --- Reviews & Ratings ---
  getWasherReviews(washerProfileId: number, page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reviews/washer/${washerProfileId}?page=${page}&size=${size}`);
  }

  // --- Complaints ---
  getWasherComplaints(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/complaints/washer/my?page=${page}&size=${size}`);
  }

  submitComplaintResponse(complaintId: number, response: string): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/complaints/${complaintId}/washer-response`, { response });
  }
}
