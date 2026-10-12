import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DamageClaim, DamageClaimRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class DamageClaimService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  createDamageClaim(request: DamageClaimRequest): Observable<DamageClaim> {
    return this.http.post<DamageClaim>(`${this.gatewayBaseUrl}/api/damage-claims`, request);
  }

  listMyDamageClaims(): Observable<DamageClaim[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/damage-claims/my`).pipe(
      map((res) => (Array.isArray(res) ? res : res?.content || []))
    );
  }

  getDamageClaim(id: number): Observable<DamageClaim> {
    return this.http.get<DamageClaim>(`${this.gatewayBaseUrl}/api/damage-claims/${id}`);
  }

  listAdminDamageClaims(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/damage-claims/admin?page=${page}&size=${size}`);
  }

  updateStatus(id: number, status: string, approvedAmount?: number, notes?: string): Observable<DamageClaim> {
    return this.http.put<DamageClaim>(`${this.gatewayBaseUrl}/api/damage-claims/${id}/status`, { status, approvedAmount, notes });
  }
}
