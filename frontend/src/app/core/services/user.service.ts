import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerProfile, CreateCustomerProfileRequest, UpdateCustomerProfileRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  createProfile(request: CreateCustomerProfileRequest): Observable<CustomerProfile> {
    return this.http.post<CustomerProfile>(`${this.gatewayBaseUrl}/api/customers/profile`, request);
  }

  getMyProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.gatewayBaseUrl}/api/customers/profile/me`);
  }

  updateMyProfile(request: UpdateCustomerProfileRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.gatewayBaseUrl}/api/customers/profile/me`, request);
  }

  getById(id: number): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.gatewayBaseUrl}/api/customers/${id}`);
  }

  search(query: string = '', page: number = 0, size: number = 20): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/customers?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  }

  updateAsAdmin(id: number, request: UpdateCustomerProfileRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.gatewayBaseUrl}/api/customers/${id}`, request);
  }
}

// Export CustomerService alias for STEP 4 compatibility
export { UserService as CustomerService };
