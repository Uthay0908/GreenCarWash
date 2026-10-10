import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReferralService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  getMyCode(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/referrals/my-code`);
  }

  listMyReferrals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/referrals/my`);
  }

  createReferral(refereeEmail: string): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/referrals`, { refereeEmail });
  }
}
