import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssignmentResponse,
  AssignmentHistoryResponse,
  EtaLocationResponse,
  NavigationResponse,
  LocationUpdateRequest,
  RejectAssignmentRequest,
  AdminAssignRequest,
  WasherPerformanceResponse,
  WasherLeaderboardEntryResponse,
  ServiceAreaResponse,
  ServiceAreaRequest,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  getMyPending(): Observable<AssignmentResponse[]> {
    return this.http.get<AssignmentResponse[]>(`${this.gatewayBaseUrl}/api/assignments/my/pending`);
  }

  getMyActive(): Observable<AssignmentResponse | null> {
    return this.http.get<AssignmentResponse | null>(`${this.gatewayBaseUrl}/api/assignments/my/active`);
  }

  getByBooking(bookingId: number): Observable<AssignmentResponse> {
    return this.http.get<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}`);
  }

  getHistory(bookingId: number): Observable<AssignmentHistoryResponse[]> {
    return this.http.get<AssignmentHistoryResponse[]>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/history`);
  }

  accept(bookingId: number): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/accept`, {});
  }

  reject(bookingId: number, request: RejectAssignmentRequest): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/reject`, request);
  }

  markOnTheWay(bookingId: number): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/on-the-way`, {});
  }

  markArrived(bookingId: number): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/arrived`, {});
  }

  markServiceStarted(bookingId: number): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/start`, {});
  }

  adminAssign(bookingId: number, request: AdminAssignRequest): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/admin-assign`, request);
  }

  autoAssign(bookingId: number): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/auto-assign`, {});
  }

  selectWasher(bookingId: number, washerProfileId: number): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/select-washer/${washerProfileId}`, {});
  }

  updateLocation(bookingId: number, request: LocationUpdateRequest): Observable<EtaLocationResponse> {
    return this.http.put<EtaLocationResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/location`, request);
  }

  getLocation(bookingId: number): Observable<EtaLocationResponse> {
    return this.http.get<EtaLocationResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/location`);
  }

  getNavigation(bookingId: number): Observable<NavigationResponse> {
    return this.http.get<NavigationResponse>(`${this.gatewayBaseUrl}/api/assignments/booking/${bookingId}/navigation`);
  }

  getPerformance(washerProfileId: number): Observable<WasherPerformanceResponse> {
    return this.http.get<WasherPerformanceResponse>(`${this.gatewayBaseUrl}/api/assignments/washers/${washerProfileId}/performance`);
  }

  getPerformanceLeaderboard(): Observable<WasherLeaderboardEntryResponse[]> {
    return this.http.get<WasherLeaderboardEntryResponse[]>(`${this.gatewayBaseUrl}/api/assignments/washers/performance/leaderboard`);
  }

  // Service Areas
  listServiceAreas(): Observable<ServiceAreaResponse[]> {
    return this.http.get<ServiceAreaResponse[]>(`${this.gatewayBaseUrl}/api/assignments/service-areas`);
  }

  createServiceArea(request: ServiceAreaRequest): Observable<ServiceAreaResponse> {
    return this.http.post<ServiceAreaResponse>(`${this.gatewayBaseUrl}/api/assignments/service-areas`, request);
  }

  updateServiceArea(id: number, request: ServiceAreaRequest): Observable<ServiceAreaResponse> {
    return this.http.put<ServiceAreaResponse>(`${this.gatewayBaseUrl}/api/assignments/service-areas/${id}`, request);
  }

  deleteServiceArea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/assignments/service-areas/${id}`);
  }
}
