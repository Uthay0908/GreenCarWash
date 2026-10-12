import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Complaint, ComplaintRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  createComplaint(request: ComplaintRequest): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.gatewayBaseUrl}/api/complaints`, request);
  }

  listMyComplaints(): Observable<Complaint[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/complaints/my`).pipe(
      map((res: any) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  getComplaint(id: number): Observable<Complaint> {
    return this.http.get<Complaint>(`${this.gatewayBaseUrl}/api/complaints/${id}`);
  }

  getComplaintByBooking(bookingId: number): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.gatewayBaseUrl}/api/complaints/booking/${bookingId}`);
  }

  listAdminComplaints(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/complaints/admin?page=${page}&size=${size}`);
  }

  updateStatus(id: number, status: string, notes?: string): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.gatewayBaseUrl}/api/complaints/${id}/status`, { status, notes });
  }

  submitWasherResponse(id: number, response: string): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.gatewayBaseUrl}/api/complaints/${id}/washer-response`, { response });
  }
}
