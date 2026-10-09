import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  AdditionalAddonRequest,
  BookingRequest,
  BookingResponse,
  DynamicChecklistTask,
  InspectionDto,
  RecurringBooking,
  TimeSlotDto,
  PostWashVerificationDto,
  CustomerIssueReportPayload,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private api = inject(ApiService);

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.api.post<BookingResponse>(API_ENDPOINTS.BOOKINGS.BASE, request);
  }

  createWashNow(request: BookingRequest): Observable<BookingResponse> {
    return this.api.post<BookingResponse>(API_ENDPOINTS.BOOKINGS.WASH_NOW, request);
  }

  scheduleBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.api.post<BookingResponse>(API_ENDPOINTS.BOOKINGS.SCHEDULE, request);
  }

  createRecurringBooking(request: Partial<RecurringBooking>): Observable<RecurringBooking> {
    return this.api.post<RecurringBooking>(API_ENDPOINTS.BOOKINGS.RECURRING, request);
  }

  getCustomerRecurringBookings(customerId: number): Observable<RecurringBooking[]> {
    return this.api.get<RecurringBooking[]>(
      API_ENDPOINTS.BOOKINGS.RECURRING_BY_CUSTOMER(customerId),
    );
  }

  getAvailableSlots(date?: string): Observable<TimeSlotDto[]> {
    return this.api.get<TimeSlotDto[]>(API_ENDPOINTS.BOOKINGS.SLOTS, date ? { date } : undefined);
  }

  getBookingById(id: number): Observable<BookingResponse> {
    return this.api.get<BookingResponse>(API_ENDPOINTS.BOOKINGS.BY_ID(id));
  }

  getCustomerBookings(customerId: number): Observable<BookingResponse[]> {
    return this.api.get<BookingResponse[]>(API_ENDPOINTS.BOOKINGS.BY_CUSTOMER(customerId));
  }

  getWasherBookings(washerId: number): Observable<BookingResponse[]> {
    return this.api.get<BookingResponse[]>(API_ENDPOINTS.BOOKINGS.BY_WASHER(washerId));
  }

  getAllBookings(status?: string): Observable<BookingResponse[]> {
    const params: any = { all: true };
    if (status && status !== 'ALL') {
      params.status = status;
    }
    return this.api.get<BookingResponse[]>(API_ENDPOINTS.BOOKINGS.BASE, params);
  }

  cancelBooking(id: number): Observable<any> {
    return this.api.put(API_ENDPOINTS.BOOKINGS.CANCEL(id));
  }

  deleteBooking(id: number): Observable<any> {
    return this.api.delete(API_ENDPOINTS.BOOKINGS.DELETE(id));
  }

  assignWasher(bookingId: number, washerId: number): Observable<any> {
    return this.api.put(API_ENDPOINTS.BOOKINGS.ASSIGN(bookingId), { washerId });
  }

  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.api.put(API_ENDPOINTS.BOOKINGS.STATUS(id), { status });
  }

  confirmPayment(id: number, data?: any): Observable<BookingResponse> {
    return this.api.post<BookingResponse>(`/api/bookings/${id}/confirm-payment`, data || {});
  }

  completeBooking(id: number): Observable<any> {
    return this.api.put(API_ENDPOINTS.BOOKINGS.COMPLETE(id));
  }

  // Checklist
  getChecklist(bookingId: number): Observable<DynamicChecklistTask[]> {
    return this.api.get<DynamicChecklistTask[]>(API_ENDPOINTS.BOOKINGS.CHECKLIST(bookingId));
  }

  updateChecklistTask(bookingId: number, taskId: number, completed: boolean): Observable<any> {
    return this.api.put(API_ENDPOINTS.BOOKINGS.UPDATE_CHECKLIST(bookingId, taskId), { completed });
  }

  // Water Usage
  logWaterUsage(bookingId: number, waterUsedLitres: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.BOOKINGS.WATER_USAGE(bookingId), {
      actualUsedLitres: waterUsedLitres,
      waterUsedLitres,
    });
  }

  recordWaterUsage(
    bookingId: number,
    data: { actualUsedLitres: number; allocatedLitres?: number; washerId?: number; notes?: string },
  ): Observable<any> {
    return this.api.post(API_ENDPOINTS.BOOKINGS.WATER_USAGE(bookingId), data);
  }

  getWaterUsage(
    bookingId: number,
  ): Observable<{
    waterUsedLitres: number;
    waterAllocationLitres: number;
    waterSavedLitres: number;
  }> {
    return this.api.get(API_ENDPOINTS.BOOKINGS.WATER_USAGE(bookingId));
  }

  getWasherWaterSavings(washerId: number): Observable<any> {
    return this.api.get(`/api/bookings/water-savings/washer/${washerId}`);
  }

  // Inspection
  uploadInspection(
    bookingId: number,
    inspection: { inspectionType: 'BEFORE' | 'AFTER'; photoUrls: string[]; notes?: string },
  ): Observable<InspectionDto> {
    return this.api.post<InspectionDto>(API_ENDPOINTS.BOOKINGS.INSPECTION(bookingId), inspection);
  }

  submitPreWashInspection(
    bookingId: number,
    data: { washerId?: number; inspectionNotes?: string; damages?: any[] },
  ): Observable<any> {
    return this.api.post(API_ENDPOINTS.BOOKINGS.INSPECTION(bookingId), data);
  }

  getInspection(bookingId: number): Observable<any> {
    return this.api.get<any>(API_ENDPOINTS.BOOKINGS.INSPECTION(bookingId));
  }

  acknowledgeDamage(bookingId: number): Observable<any> {
    return this.api.put(API_ENDPOINTS.BOOKINGS.ACKNOWLEDGE_DAMAGE(bookingId));
  }

  // Additional Add-on Proposals
  proposeAdditionalAddon(
    bookingId: number,
    addonId: number,
    reason: string,
  ): Observable<AdditionalAddonRequest> {
    return this.api.post<AdditionalAddonRequest>(API_ENDPOINTS.BOOKINGS.PROPOSE_ADDON(bookingId), {
      addonId,
      reason,
    });
  }

  approveAdditionalAddon(bookingId: number, addonRequestId: number): Observable<any> {
    return this.api.put(API_ENDPOINTS.BOOKINGS.APPROVE_ADDON(bookingId, addonRequestId));
  }

  // Rebooking & Smart Recommendation
  rebookService(bookingId: number): Observable<BookingResponse> {
    return this.api.post<BookingResponse>(API_ENDPOINTS.BOOKINGS.REBOOK(bookingId), {});
  }

  getSmartWashRecommendation(customerId: number, vehicleId?: number): Observable<any> {
    const params = vehicleId ? { vehicleId } : undefined;
    return this.api.get<any>(API_ENDPOINTS.BOOKINGS.RECOMMENDATION(customerId), params);
  }

  // Customer-Washer Operational Chat
  sendChatMessage(
    bookingId: number,
    request: { senderId?: number; senderRole: string; senderName?: string; message: string },
  ): Observable<any> {
    return this.api.post(API_ENDPOINTS.BOOKINGS.CHAT(bookingId), request);
  }

  getChatMessages(bookingId: number): Observable<any[]> {
    return this.api.get<any[]>(API_ENDPOINTS.BOOKINGS.CHAT(bookingId));
  }

  markChatMessageRead(bookingId: number, messageId: number): Observable<any> {
    return this.api.patch(`${API_ENDPOINTS.BOOKINGS.CHAT(bookingId)}/${messageId}/read`, {});
  }

  // Post-Wash Photo Verification & Escrow Release Workflow
  submitPostWashVerification(
    bookingId: number,
    request: { washerId: number; imageUrls: string[]; odometerOrBayNote?: string; notes?: string },
  ): Observable<PostWashVerificationDto> {
    return this.api.post<PostWashVerificationDto>(
      API_ENDPOINTS.BOOKINGS.VERIFICATION(bookingId),
      request,
    );
  }

  customerApproveVerification(
    bookingId: number,
    request?: { feedback?: string; rating?: number },
  ): Observable<PostWashVerificationDto> {
    return this.api.post<PostWashVerificationDto>(
      API_ENDPOINTS.BOOKINGS.VERIFICATION_CUSTOMER_APPROVE(bookingId),
      request || {},
    );
  }

  customerReportIssue(
    bookingId: number,
    request: CustomerIssueReportPayload,
  ): Observable<PostWashVerificationDto> {
    return this.api.post<PostWashVerificationDto>(
      API_ENDPOINTS.BOOKINGS.VERIFICATION_REPORT_ISSUE(bookingId),
      request,
    );
  }

  customerRequestRework(
    bookingId: number,
    request: CustomerIssueReportPayload,
  ): Observable<PostWashVerificationDto> {
    return this.api.post<PostWashVerificationDto>(
      `/api/bookings/${bookingId}/verification/customer-request-rework`,
      request,
    );
  }

  customerRaiseDispute(
    bookingId: number,
    request: CustomerIssueReportPayload,
  ): Observable<PostWashVerificationDto> {
    return this.api.post<PostWashVerificationDto>(
      `/api/bookings/${bookingId}/verification/customer-raise-dispute`,
      request,
    );
  }

  getPostWashVerification(bookingId: number): Observable<PostWashVerificationDto> {
    return this.api.get<PostWashVerificationDto>(API_ENDPOINTS.BOOKINGS.VERIFICATION(bookingId));
  }

  approveVerificationAdmin(
    bookingId: number,
    approvedBy?: string,
  ): Observable<PostWashVerificationDto> {
    const url = approvedBy
      ? `${API_ENDPOINTS.BOOKINGS.VERIFICATION_APPROVE(bookingId)}?approvedBy=${encodeURIComponent(approvedBy)}`
      : API_ENDPOINTS.BOOKINGS.VERIFICATION_APPROVE(bookingId);
    return this.api.post<PostWashVerificationDto>(url, {});
  }
}
