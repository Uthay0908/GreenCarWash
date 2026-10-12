import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  AddLocationRequest,
  AddMemberRequest,
  AddVehicleRequest,
  FleetBookingRequestSummary,
  Organization,
  OrganizationLocation,
  OrganizationMember,
  OrganizationRequest,
  OrganizationVehicle,
  RecurringFleetSchedule,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CorporateService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  readonly gatewayBaseUrl = environment.apiUrl;

  private readonly _organizations = signal<Organization[]>([]);
  readonly organizations = this._organizations.asReadonly();

  readonly activeOrganization = signal<Organization | null>(this.readSavedOrg());
  readonly corporateRole = signal<string | null>(localStorage.getItem('gcw_corporate_role'));
  readonly activeOrgId = computed(() => this.activeOrganization()?.id ?? null);

  private readSavedOrg(): Organization | null {
    try {
      const raw = localStorage.getItem('gcw_corporate_org');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  hasActiveCorporateSession(): boolean {
    return this.activeOrganization() !== null || !!localStorage.getItem('gcw_corporate_org');
  }

  login(request: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/corporate/auth/login`, request).pipe(
      tap((res) => {
        if (res && res.organization) {
          this.activeOrganization.set(res.organization);
          this.corporateRole.set(res.role || 'MEMBER');
          localStorage.setItem('gcw_corporate_org', JSON.stringify(res.organization));
          localStorage.setItem('gcw_corporate_role', res.role || 'MEMBER');
        }
        if (res && res.accessToken) {
          this.auth.setSession({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresInMs: res.expiresInMs || 900000,
            tokenType: res.tokenType || 'Bearer',
            user: {
              id: res.user.id,
              email: res.user.email,
              fullName: res.user.fullName,
              roles: ['CORPORATE'],
            },
          });
        }
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/corporate/auth/me`).pipe(
      tap((res) => {
        if (res && res.organization) {
          this.activeOrganization.set(res.organization);
          this.corporateRole.set(res.role || 'MEMBER');
          localStorage.setItem('gcw_corporate_org', JSON.stringify(res.organization));
          localStorage.setItem('gcw_corporate_role', res.role || 'MEMBER');
        }
      })
    );
  }

  logout(): void {
    this.activeOrganization.set(null);
    this.corporateRole.set(null);
    localStorage.removeItem('gcw_corporate_org');
    localStorage.removeItem('gcw_corporate_role');
    this.auth.logout();
  }

  listMyOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.gatewayBaseUrl}/api/corporate/organizations/me`).pipe(
      tap((orgs) => {
        this._organizations.set(orgs ?? []);
        if (orgs && orgs.length > 0) {
          this.activeOrganization.set(orgs[0]);
          localStorage.setItem('gcw_corporate_org', JSON.stringify(orgs[0]));
        }
      })
    );
  }

  getMyOrganization(): Observable<Organization | null> {
    return this.listMyOrganizations().pipe(
      map((list) => (list && list.length > 0 ? list[0] : null))
    );
  }

  getOrganization(orgId: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}`);
  }

  createOrganization(request: OrganizationRequest): Observable<Organization> {
    return this.http.post<Organization>(`${this.gatewayBaseUrl}/api/corporate/organizations`, request).pipe(
      tap((created) => {
        this._organizations.update((list) => [...list, created]);
        this.activeOrganization.set(created);
        localStorage.setItem('gcw_corporate_org', JSON.stringify(created));
      })
    );
  }

  updateOrganization(orgId: number, request: OrganizationRequest): Observable<Organization> {
    return this.http.put<Organization>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}`, request).pipe(
      tap((updated) => {
        this._organizations.update((list) => list.map((o) => (o.id === orgId ? updated : o)));
        if (this.activeOrganization()?.id === orgId) {
          this.activeOrganization.set(updated);
          localStorage.setItem('gcw_corporate_org', JSON.stringify(updated));
        }
      })
    );
  }

  listMembers(orgId: number): Observable<OrganizationMember[]> {
    return this.http.get<OrganizationMember[]>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/members`);
  }

  addMember(orgId: number, body: AddMemberRequest): Observable<OrganizationMember> {
    return this.http.post<OrganizationMember>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/members`, body);
  }

  removeMember(orgId: number, memberId: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/members/${memberId}`);
  }

  listVehicles(orgId: number): Observable<OrganizationVehicle[]> {
    return this.http.get<OrganizationVehicle[]>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/vehicles`);
  }

  createVehicle(vehicleRequest: {
    make: string;
    model: string;
    year?: number;
    licensePlate: string;
    color?: string;
    vehicleType: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/vehicles`, vehicleRequest);
  }

  addVehicle(orgId: number, vehicleRequest: AddVehicleRequest): Observable<OrganizationVehicle> {
    return this.http.post<OrganizationVehicle>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/vehicles`, vehicleRequest);
  }

  createAndAddVehicle(orgId: number, vehicleData: any, label?: string): Observable<OrganizationVehicle> {
    return this.createVehicle(vehicleData).pipe(
      switchMap((veh) =>
        this.addVehicle(orgId, {
          vehicleId: veh.id,
          label: label || `${veh.make} ${veh.model}`,
        })
      )
    );
  }

  removeVehicle(orgId: number, vehicleId: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/vehicles/${vehicleId}`);
  }

  listLocations(orgId: number): Observable<OrganizationLocation[]> {
    return this.http.get<OrganizationLocation[]>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/locations`);
  }

  addLocation(orgId: number, locationRequest: AddLocationRequest): Observable<OrganizationLocation> {
    return this.http.post<OrganizationLocation>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/locations`, locationRequest);
  }

  listFleetBookings(orgId: number, page = 0, size = 20): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/bulk-bookings`, { params });
  }

  createBulkBooking(orgId: number, request: any): Observable<FleetBookingRequestSummary> {
    return this.http.post<FleetBookingRequestSummary>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/bulk-bookings`, request);
  }

  getBulkBookingDetail(orgId: number, requestId: number): Observable<FleetBookingRequestSummary> {
    return this.http.get<FleetBookingRequestSummary>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/bulk-bookings/${requestId}`);
  }

  cancelBulkBooking(orgId: number, requestId: number): Observable<FleetBookingRequestSummary> {
    return this.http.post<FleetBookingRequestSummary>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/bulk-bookings/${requestId}/cancel`, {});
  }

  executeBulkBooking(orgId: number, requestId: number): Observable<FleetBookingRequestSummary> {
    return this.http.post<FleetBookingRequestSummary>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/bulk-bookings/${requestId}/execute`, {});
  }

  listRecurringSchedules(orgId: number): Observable<RecurringFleetSchedule[]> {
    return this.http.get<RecurringFleetSchedule[]>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/recurring-schedules`);
  }

  createRecurringSchedule(orgId: number, request: any): Observable<RecurringFleetSchedule> {
    return this.http.post<RecurringFleetSchedule>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/recurring-schedules`, request);
  }

  getRecurringScheduleDetail(orgId: number, scheduleId: number): Observable<RecurringFleetSchedule> {
    return this.http.get<RecurringFleetSchedule>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/recurring-schedules/${scheduleId}`);
  }

  activateRecurringSchedule(orgId: number, scheduleId: number): Observable<RecurringFleetSchedule> {
    return this.http.put<RecurringFleetSchedule>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/recurring-schedules/${scheduleId}/activate`, {});
  }

  deactivateRecurringSchedule(orgId: number, scheduleId: number): Observable<RecurringFleetSchedule> {
    return this.http.put<RecurringFleetSchedule>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/recurring-schedules/${scheduleId}/deactivate`, {});
  }

  deleteRecurringSchedule(orgId: number, scheduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/corporate/organizations/${orgId}/recurring-schedules/${scheduleId}`);
  }
}
