import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Complaint, ComplaintRequest, DamageClaim, DamageClaimRequest, Faq, SupportTicket, SupportTicketRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  private readonly _tickets = signal<SupportTicket[]>([]);
  readonly tickets = this._tickets.asReadonly();

  // --- Customer Support Tickets ---
  createTicket(request: SupportTicketRequest): Observable<SupportTicket> {
    const payload = {
      bookingId: request.bookingId ?? null,
      subject: request.subject,
      description: request.description,
    };
    return this.http.post<SupportTicket>(`${this.gatewayBaseUrl}/api/support`, payload).pipe(
      tap((t) => this._tickets.update((list) => [t, ...list]))
    );
  }

  listMyTickets(page = 0, size = 50): Observable<SupportTicket[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/support/my`, { params }).pipe(
      map((res) => (Array.isArray(res) ? res : res?.content || [])),
      tap((list) => this._tickets.set(list))
    );
  }

  getTicket(id: number): Observable<SupportTicket> {
    return this.getTicketById(id);
  }

  getTicketById(id: number): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.gatewayBaseUrl}/api/support/${id}`);
  }

  // --- Washer Operational Support Tickets ---
  createOperationalTicket(request: any): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${this.gatewayBaseUrl}/api/support/operational`, request);
  }

  listMyOperationalTickets(page = 0, size = 50): Observable<SupportTicket[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/support/operational/my`, { params }).pipe(
      map((res) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  getOperationalTicketById(id: number): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.gatewayBaseUrl}/api/support/operational/${id}`);
  }

  // --- Admin Ticket Management ---
  listAdminTickets(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/support/admin/tickets?page=${page}&size=${size}`);
  }

  assignTicket(id: number, assignedToUserId: number): Observable<SupportTicket> {
    return this.http.put<SupportTicket>(`${this.gatewayBaseUrl}/api/support/admin/tickets/${id}/assign`, { assignedToUserId });
  }

  resolveTicket(id: number, resolutionNotes: string): Observable<SupportTicket> {
    return this.http.put<SupportTicket>(`${this.gatewayBaseUrl}/api/support/admin/tickets/${id}/resolve`, { resolutionNotes });
  }

  // --- Complaints ---
  createComplaint(request: ComplaintRequest): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.gatewayBaseUrl}/api/complaints`, request);
  }

  listMyComplaints(page = 0, size = 50): Observable<Complaint[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/complaints/my`, { params }).pipe(
      map((res) => (Array.isArray(res) ? res : res?.content || []))
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

  updateComplaintStatus(id: number, status: string, notes?: string): Observable<Complaint> {
    return this.http.put<Complaint>(`${this.gatewayBaseUrl}/api/complaints/${id}/status`, { status, notes });
  }

  submitWasherComplaintResponse(id: number, response: string): Observable<Complaint> {
    return this.http.post<Complaint>(`${this.gatewayBaseUrl}/api/complaints/${id}/washer-response`, { response });
  }

  // --- Damage Claims ---
  createDamageClaim(request: DamageClaimRequest): Observable<DamageClaim> {
    return this.http.post<DamageClaim>(`${this.gatewayBaseUrl}/api/damage-claims`, request);
  }

  listMyDamageClaims(page = 0, size = 50): Observable<DamageClaim[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/damage-claims/my`, { params }).pipe(
      map((res) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  getDamageClaim(id: number): Observable<DamageClaim> {
    return this.http.get<DamageClaim>(`${this.gatewayBaseUrl}/api/damage-claims/${id}`);
  }

  listAdminDamageClaims(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/damage-claims/admin?page=${page}&size=${size}`);
  }

  updateDamageClaimStatus(id: number, status: string, approvedAmount?: number, notes?: string): Observable<DamageClaim> {
    return this.http.put<DamageClaim>(`${this.gatewayBaseUrl}/api/damage-claims/${id}/status`, { status, approvedAmount, notes });
  }

  // --- FAQs ---
  getFaqs(category?: string, page = 0, size = 50): Observable<Faq[]> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (category && category !== 'ALL') {
      params = params.set('category', category);
    }
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/faqs`, { params }).pipe(
      map((res) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  getFaqById(id: number): Observable<Faq> {
    return this.http.get<Faq>(`${this.gatewayBaseUrl}/api/faqs/${id}`);
  }

  createFaq(request: { question: string; answer: string; category: string; displayOrder?: number }): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/faqs`, request);
  }

  updateFaq(id: number, request: { question: string; answer: string; category: string; displayOrder?: number }): Observable<any> {
    return this.http.put<any>(`${this.gatewayBaseUrl}/api/faqs/${id}`, request);
  }

  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/faqs/${id}`);
  }
}
