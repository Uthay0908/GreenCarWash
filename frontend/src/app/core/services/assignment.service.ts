import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AssignmentDto, RecommendedWasherDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private api = inject(ApiService);

  triggerMatching(bookingId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.MATCH(bookingId), {});
  }

  acceptAssignment(assignmentId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.ACCEPT(assignmentId), {});
  }

  rejectAssignment(assignmentId: number, reason: string): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.REJECT(assignmentId), { reason });
  }

  startJourney(assignmentId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.START_JOURNEY(assignmentId), {});
  }

  updateLocation(assignmentId: number, latitude: number, longitude: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.LOCATION(assignmentId), { latitude, longitude });
  }

  getLiveTracking(assignmentId: number): Observable<any> {
    return this.api.get(API_ENDPOINTS.ASSIGNMENTS.TRACKING(assignmentId));
  }

  recordContactAttempt(assignmentId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.CONTACT_ATTEMPT(assignmentId), {});
  }

  reassignStale(assignmentId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.REASSIGN_STALE(assignmentId), {});
  }

  reassign(assignmentId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.REASSIGN(assignmentId), {});
  }

  updateEta(assignmentId: number, etaMinutes: number, currentLat?: number, currentLng?: number): Observable<any> {
    return this.api.put(API_ENDPOINTS.ASSIGNMENTS.ETA(assignmentId), { etaMinutes, currentLat, currentLng });
  }

  confirmArrival(assignmentId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.ARRIVE(assignmentId), {});
  }

  recordNoShow(assignmentId: number): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.NO_SHOW(assignmentId), {});
  }

  getAssignmentById(id: number): Observable<AssignmentDto> {
    return this.api.get<AssignmentDto>(API_ENDPOINTS.ASSIGNMENTS.BY_ID(id));
  }

  getAssignmentByBooking(bookingId: number): Observable<AssignmentDto> {
    return this.api.get<AssignmentDto>(API_ENDPOINTS.ASSIGNMENTS.BY_BOOKING(bookingId));
  }

  getWasherActiveAssignment(washerId: number): Observable<AssignmentDto> {
    return this.api.get<AssignmentDto>(API_ENDPOINTS.ASSIGNMENTS.ACTIVE_BY_WASHER(washerId));
  }

  getWasherPendingRequests(washerId: number): Observable<any[]> {
    return this.api.get<any[]>(API_ENDPOINTS.ASSIGNMENTS.REQUESTS_BY_WASHER(washerId));
  }

  getAssignmentHistory(id: number): Observable<any[]> {
    return this.api.get<any[]>(API_ENDPOINTS.ASSIGNMENTS.HISTORY(id));
  }

  manualOverride(assignmentId: number, washerId: number): Observable<any> {
    return this.api.put(API_ENDPOINTS.ASSIGNMENTS.OVERRIDE(assignmentId), { washerId });
  }

  completeAssignment(assignmentId: number): Observable<any> {
    return this.api.post(`${API_ENDPOINTS.ASSIGNMENTS.BY_ID(assignmentId)}/complete`, {});
  }

  getNearbyWashers(bookingId: number): Observable<RecommendedWasherDto[]> {
    return this.api.get<RecommendedWasherDto[]>(API_ENDPOINTS.ASSIGNMENTS.NEARBY_WASHERS(bookingId));
  }

  assignWasher(bookingId: number, washerId: number, assignedBy: string = 'Admin'): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.ASSIGN_BOOKING(bookingId), { washerId, assignedBy });
  }

  reassignBooking(bookingId: number, washerId: number, reason: string = 'Operational Admin reassignment', assignedBy: string = 'Admin'): Observable<any> {
    return this.api.post(API_ENDPOINTS.ASSIGNMENTS.REASSIGN_BOOKING(bookingId), { washerId, reason, assignedBy });
  }

  getAllAssignments(status?: string): Observable<AssignmentDto[]> {
    const params = status ? { status } : undefined;
    return this.api.get<AssignmentDto[]>(API_ENDPOINTS.ASSIGNMENTS.BASE, params);
  }
}
