import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  listMemberships(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/memberships`);
  }

  createMembership(request: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/memberships`, request);
  }
}
