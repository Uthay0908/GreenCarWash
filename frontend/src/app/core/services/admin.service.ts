import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddOn,
  AddOnRequest,
  AdminAssignRequest,
  AuditRecord,
  Booking,
  BroadcastRequest,
  CustomerLeaderboardEntry,
  CustomerProfile,
  KycDocument,
  KycReviewRequest,
  NotificationTemplate,
  NotificationTemplateRequest,
  Page,
  Promotion,
  PromotionRequest,
  RevenueSummary,
  RiskFlag,
  ServiceArea,
  ServiceAreaRequest,
  SustainabilitySummary,
  SystemConfigEntry,
  SystemConfigEntryRequest,
  UpdateCustomerProfileRequest,
  Vehicle,
  WashPackage,
  WashPackageRequest,
  WasherProfile,
  WasherAvailability,
  WasherRejectionStat,
  WasherLeaderboardEntry,
  WaterSavingSummary,
  Complaint,
  DamageClaim,
  Review,
  Refund,
  OrderReportEntry,
  Payment,
  Organization,
  DashboardResponse,
} from '../../shared/models';

export interface AdminDashboardStats {
  totalUsers: number;
  totalBookings: number;
  activeWashers: number;
  revenue: number;
  waterSavedLiters: number;
  pendingDamageClaims: number;
  openSupportTickets: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  readonly gateway = environment.apiUrl;

  // 1. Dashboard & Reports
  getDashboardStats(from?: string, to?: string): Observable<DashboardResponse> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<DashboardResponse>(`${this.gateway}/api/reports/dashboard`, { params });
  }

  listAllPayments(page = 0, size = 20): Observable<Page<Payment>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Payment>>(`${this.gateway}/api/payments`, { params });
  }

  listAllRefunds(page = 0, size = 20): Observable<Page<Refund>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Refund>>(`${this.gateway}/api/refunds`, { params });
  }

  listAllOrganizations(page = 0, size = 20): Observable<Page<Organization>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Organization>>(`${this.gateway}/api/corporate/organizations`, { params });
  }

  // 2. Customers (FR-A-03)
  listUsers(): Observable<CustomerProfile[]> {
    return this.listCustomers('', 0, 50).pipe(map((p) => p.content || []));
  }

  listCustomers(query = '', page = 0, size = 20): Observable<Page<CustomerProfile>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (query) params = params.set('query', query);
    return this.http.get<Page<CustomerProfile>>(`${this.gateway}/api/customers`, { params });
  }

  updateCustomer(id: number, req: UpdateCustomerProfileRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.gateway}/api/customers/${id}`, req);
  }

  toggleCustomerStatus(userId: number, enable: boolean): Observable<unknown> {
    const endpoint = enable ? 'enable' : 'disable';
    return this.http.post(`${this.gateway}/api/auth/admin/users/${userId}/${endpoint}`, {});
  }

  // 3. Washers & KYC (FR-A-04, FR-A-05, FR-A-18, FR-A-29)
  listWashers(kycStatus = '', page = 0, size = 20): Observable<Page<WasherProfile>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (kycStatus && kycStatus !== 'ALL') {
      params = params.set('kycStatus', kycStatus);
    }
    return this.http.get<Page<WasherProfile>>(`${this.gateway}/api/washers`, { params });
  }

  toggleWasherStatus(id: number, activate: boolean): Observable<WasherProfile> {
    const action = activate ? 'reactivate' : 'deactivate';
    return this.http.post<WasherProfile>(`${this.gateway}/api/washers/${id}/${action}`, {});
  }

  getWasherById(id: number): Observable<WasherProfile> {
    return this.http.get<WasherProfile>(`${this.gateway}/api/washers/${id}`);
  }

  getWasherAvailability(washerId: number): Observable<WasherAvailability> {
    return this.http.get<WasherAvailability>(`${this.gateway}/api/washers/${washerId}/availability`);
  }

  getWasherKycDocuments(washerProfileId: number): Observable<KycDocument[]> {
    return this.http.get<KycDocument[]>(`${this.gateway}/api/kyc/washers/${washerProfileId}/documents`);
  }

  reviewWasherKyc(washerProfileId: number, req: KycReviewRequest): Observable<WasherProfile> {
    return this.http.post<WasherProfile>(`${this.gateway}/api/kyc/washers/${washerProfileId}/review`, req);
  }

  getWasherRejectionStats(lookbackHours = 168, minFlaggedEvents = 3): Observable<WasherRejectionStat[]> {
    const params = new HttpParams().set('lookbackHours', lookbackHours).set('minFlaggedEvents', minFlaggedEvents);
    return this.http.get<WasherRejectionStat[]>(`${this.gateway}/api/washers/admin/rejection-stats`, { params });
  }

  // 4. Vehicles (FR-A-06)
  listVehicles(query = '', page = 0, size = 20): Observable<Page<Vehicle>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (query) params = params.set('query', query);
    return this.http.get<Page<Vehicle>>(`${this.gateway}/api/vehicles/admin`, { params });
  }

  getVehicleById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.gateway}/api/vehicles/${id}`);
  }

  toggleVehicleStatus(id: number, activate: boolean): Observable<Vehicle> {
    const action = activate ? 'activate' : 'deactivate';
    return this.http.post<Vehicle>(`${this.gateway}/api/vehicles/admin/${id}/${action}`, {});
  }

  // 5. Packages (FR-A-07)
  listPackages(): Observable<Page<WashPackage>> {
    return this.http.get<any>(`${this.gateway}/api/packages`).pipe(
      map((res: any): Page<WashPackage> => {
        if (Array.isArray(res)) {
          return { content: res, totalElements: res.length, totalPages: 1, size: res.length, number: 0 };
        }
        return {
          content: res?.content || [],
          totalElements: res?.totalElements ?? (res?.content?.length || 0),
          totalPages: res?.totalPages ?? 1,
          size: res?.size ?? (res?.content?.length || 0),
          number: res?.number ?? 0
        };
      })
    );
  }

  createPackage(req: WashPackageRequest): Observable<WashPackage> {
    return this.http.post<WashPackage>(`${this.gateway}/api/packages`, req);
  }

  updatePackage(id: number, req: WashPackageRequest): Observable<WashPackage> {
    return this.http.put<WashPackage>(`${this.gateway}/api/packages/${id}`, req);
  }

  togglePackageStatus(id: number, activate: boolean): Observable<WashPackage> {
    const action = activate ? 'activate' : 'deactivate';
    return this.http.post<WashPackage>(`${this.gateway}/api/packages/${id}/${action}`, {});
  }

  // 6. Add-Ons (FR-A-08)
  listAddOns(): Observable<Page<AddOn>> {
    return this.http.get<any>(`${this.gateway}/api/addons`).pipe(
      map((res: any): Page<AddOn> => {
        if (Array.isArray(res)) {
          return { content: res, totalElements: res.length, totalPages: 1, size: res.length, number: 0 };
        }
        return {
          content: res?.content || [],
          totalElements: res?.totalElements ?? (res?.content?.length || 0),
          totalPages: res?.totalPages ?? 1,
          size: res?.size ?? (res?.content?.length || 0),
          number: res?.number ?? 0
        };
      })
    );
  }

  createAddOn(req: AddOnRequest): Observable<AddOn> {
    return this.http.post<AddOn>(`${this.gateway}/api/addons`, req);
  }

  updateAddOn(id: number, req: AddOnRequest): Observable<AddOn> {
    return this.http.put<AddOn>(`${this.gateway}/api/addons/${id}`, req);
  }

  toggleAddOnStatus(id: number, activate: boolean): Observable<AddOn> {
    const action = activate ? 'activate' : 'deactivate';
    return this.http.post<AddOn>(`${this.gateway}/api/addons/${id}/${action}`, {});
  }

  // 7. Promotions (FR-A-09)
  listPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.gateway}/api/promotions`);
  }

  createPromotion(req: PromotionRequest): Observable<Promotion> {
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const validFromRaw = req.validFrom || req.startsAt || now.toISOString();
    const validToRaw = req.validTo || req.expiresAt || oneYearLater.toISOString();

    const normalizedReq = {
      ...req,
      validFrom: validFromRaw.includes('T') ? validFromRaw : `${validFromRaw}T00:00:00Z`,
      validTo: validToRaw.includes('T') ? validToRaw : `${validToRaw}T23:59:59Z`,
    };
    return this.http.post<Promotion>(`${this.gateway}/api/promotions`, normalizedReq);
  }

  updatePromotion(id: number, req: PromotionRequest): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.gateway}/api/promotions/${id}`, req);
  }

  togglePromotionStatus(id: number, activate: boolean): Observable<Promotion> {
    const action = activate ? 'activate' : 'deactivate';
    return this.http.post<Promotion>(`${this.gateway}/api/promotions/${id}/${action}`, {});
  }

  // 8. Bookings (FR-A-10, FR-A-11, FR-A-12)
  listBookings(status?: string, page = 0, size = 20): Observable<Page<Booking>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<Booking>>(`${this.gateway}/api/bookings/admin`, { params });
  }

  assignWasher(bookingId: number, req: AdminAssignRequest): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/assignments/booking/${bookingId}/admin-assign`, req);
  }

  cancelBooking(id: number, reason: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.gateway}/api/bookings/${id}/admin/cancel`, { reason });
  }

  getBookingTimeline(id: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.gateway}/api/bookings/${id}/timeline`);
  }

  // 9. Service Areas (FR-A-13)
  listServiceAreas(page = 0, size = 10, includeInactive = true): Observable<Page<ServiceArea>> {
    const endpoint = includeInactive ? `${this.gateway}/api/service-areas/admin/all` : `${this.gateway}/api/service-areas`;
    return this.http.get<any>(`${endpoint}?page=${page}&size=${size}`).pipe(
      map((res: any): Page<ServiceArea> => {
        if (Array.isArray(res)) {
          return { content: res, totalElements: res.length, totalPages: 1, size: res.length, number: 0 };
        }
        return {
          content: res?.content || [],
          totalElements: res?.totalElements ?? (res?.content?.length || 0),
          totalPages: res?.totalPages ?? 1,
          size: res?.size ?? (res?.content?.length || 0),
          number: res?.number ?? 0
        };
      })
    );
  }

  createServiceArea(req: ServiceAreaRequest): Observable<ServiceArea> {
    return this.http.post<ServiceArea>(`${this.gateway}/api/service-areas`, req);
  }

  updateServiceArea(id: number, req: ServiceAreaRequest): Observable<ServiceArea> {
    return this.http.put<ServiceArea>(`${this.gateway}/api/service-areas/${id}`, req);
  }

  toggleServiceAreaStatus(id: number, activate: boolean): Observable<ServiceArea> {
    const action = activate ? 'activate' : 'deactivate';
    return this.http.post<ServiceArea>(`${this.gateway}/api/service-areas/${id}/${action}`, {});
  }

  // 10. System Config (FR-A-14)
  listSystemConfigs(): Observable<SystemConfigEntry[]> {
    return this.http.get<SystemConfigEntry[]>(`${this.gateway}/api/admin/system-config`);
  }

  createSystemConfig(req: SystemConfigEntryRequest): Observable<SystemConfigEntry> {
    return this.http.post<SystemConfigEntry>(`${this.gateway}/api/admin/system-config`, req);
  }

  updateSystemConfig(id: number, req: SystemConfigEntryRequest): Observable<SystemConfigEntry> {
    return this.http.put<SystemConfigEntry>(`${this.gateway}/api/admin/system-config/${id}`, req);
  }

  deleteSystemConfig(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gateway}/api/admin/system-config/${id}`);
  }

  // 11. Notification Templates & Broadcast (FR-A-15, FR-A-16)
  listNotificationTemplates(): Observable<NotificationTemplate[]> {
    return this.http.get<NotificationTemplate[]>(`${this.gateway}/api/notifications/admin/templates`);
  }

  createNotificationTemplate(req: NotificationTemplateRequest): Observable<NotificationTemplate> {
    return this.http.post<NotificationTemplate>(`${this.gateway}/api/notifications/admin/templates`, req);
  }

  updateNotificationTemplate(id: number, req: NotificationTemplateRequest): Observable<NotificationTemplate> {
    return this.http.put<NotificationTemplate>(`${this.gateway}/api/notifications/admin/templates/${id}`, req);
  }

  broadcast(req: BroadcastRequest): Observable<void> {
    return this.http.post<void>(`${this.gateway}/api/notifications/admin/broadcast`, req);
  }

  broadcastNotification(req: BroadcastRequest): Observable<void> {
    return this.broadcast(req);
  }

  // 12. Audit Logs & Risk Flags (FR-A-17, FR-A-19)
  getAuditLogs(query?: { aggregateId?: string; eventType?: string; page?: number; size?: number }): Observable<Page<AuditRecord>> {
    let params = new HttpParams();
    const page = query?.page ?? 0;
    const size = query?.size ?? 20;
    params = params.set('page', page).set('size', size);
    if (query?.aggregateId) params = params.set('aggregateId', query.aggregateId);
    if (query?.eventType) params = params.set('eventType', query.eventType);

    return this.http.get<Page<AuditRecord>>(`${this.gateway}/api/reports/audit`, { params });
  }

  listAuditRecords(page = 0, size = 20): Observable<Page<AuditRecord>> {
    return this.getAuditLogs({ page, size });
  }

  getRiskFlags(eventType = 'SlaBreached', minOccurrences = 3, lookbackHours = 168): Observable<RiskFlag[]> {
    const params = new HttpParams().set('eventType', eventType).set('minOccurrences', minOccurrences).set('lookbackHours', lookbackHours);
    return this.http.get<RiskFlag[]>(`${this.gateway}/api/reports/risk-flags`, { params });
  }

  // 13. Sustainability & Operational Reports (FR-A-27, FR-A-28, FR-A-30, FR-A-31, FR-A-32, FR-A-33)
  getRevenueSummary(from?: string, to?: string): Observable<RevenueSummary> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<RevenueSummary>(`${this.gateway}/api/reports/revenue`, { params });
  }

  getWaterSavedSummary(unit = 'LITERS', from?: string, to?: string): Observable<WaterSavingSummary> {
    let params = new HttpParams().set('unit', unit);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<WaterSavingSummary>(`${this.gateway}/api/reports/water-saved`, { params });
  }

  getSustainabilitySummary(unit = 'LITERS', from?: string, to?: string): Observable<SustainabilitySummary> {
    let params = new HttpParams().set('unit', unit);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<SustainabilitySummary>(`${this.gateway}/api/reports/sustainability`, { params });
  }

  getCustomerLeaderboard(limit = 20): Observable<CustomerLeaderboardEntry[]> {
    return this.http.get<CustomerLeaderboardEntry[]>(`${this.gateway}/api/leaderboard/water-saved/all-time?limit=${limit}`);
  }

  getWasherLeaderboard(limit = 20): Observable<WasherLeaderboardEntry[]> {
    return this.http.get<WasherLeaderboardEntry[]>(`${this.gateway}/api/washers/leaderboard?limit=${limit}`);
  }

  listReportOrders(params?: { orderNumber?: number; washerProfileId?: number; packageId?: number; status?: string; page?: number; size?: number }): Observable<Page<OrderReportEntry>> {
    let p = new HttpParams();
    if (params?.orderNumber) p = p.set('orderNumber', params.orderNumber);
    if (params?.washerProfileId) p = p.set('washerProfileId', params.washerProfileId);
    if (params?.packageId) p = p.set('packageId', params.packageId);
    if (params?.status) p = p.set('status', params.status);
    if (params?.page !== undefined) p = p.set('page', params.page);
    if (params?.size !== undefined) p = p.set('size', params.size);
    return this.http.get<Page<OrderReportEntry>>(`${this.gateway}/api/reports/orders`, { params: p });
  }

  exportOrdersCsv(): Observable<Blob> {
    return this.http.get(`${this.gateway}/api/reports/orders/export`, { responseType: 'blob' });
  }

  // 14. Customer Wallet & Loyalty Credits (FR-A-25)
  creditCustomerWallet(customerId: number, req: { amount: number; reason: string }): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/loyalty/wallet/${customerId}/credit`, req);
  }

  // 15. Refunds Management (FR-A-21)
  approveRefund(refundId: number): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/refunds/${refundId}/approve`, {});
  }

  rejectRefund(refundId: number, reason?: string): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/refunds/${refundId}/reject`, { reason });
  }

  immediateRefund(paymentId: number, req: { amount?: number; reason: string }): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/refunds/payments/${paymentId}`, req);
  }

  listRefundsForBooking(bookingId: number): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.gateway}/api/refunds/booking/${bookingId}`);
  }

  // 16. Support Complaints & Damage Claims Resolution (FR-A-24)
  resolveComplaint(id: number, req: { decision: string; notes: string; creditAmount?: number }): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/complaints/${id}/resolve`, req);
  }

  decideDamageClaim(id: number, req: { decision: string; approvedAmount?: number; notes?: string }): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/damage-claims/${id}/decide`, req);
  }

  // 17. Review Moderation (FR-A-23)
  moderateReview(reviewId: number, visible: boolean): Observable<unknown> {
    return this.http.post(`${this.gateway}/api/reviews/${reviewId}/moderate?visible=${visible}`, {});
  }

  listComplaints(status = 'OPEN'): Observable<Page<Complaint>> {
    return this.http.get<Page<Complaint>>(`${this.gateway}/api/complaints?status=${status}`);
  }

  listDamageClaims(status = 'SUBMITTED'): Observable<Page<DamageClaim>> {
    return this.http.get<Page<DamageClaim>>(`${this.gateway}/api/damage-claims?status=${status}`);
  }

  listReviews(page = 0, size = 20): Observable<Page<Review> | Review[]> {
    return this.http.get<Page<Review> | Review[]>(`${this.gateway}/api/reviews?page=${page}&size=${size}`);
  }

  // 18. Dynamic Pricing Rules Management (Phase 3 & Phase 14)
  listDemandPricingRules(page = 0, size = 20): Observable<Page<any>> {
    return this.http.get<Page<any>>(`${this.gateway}/api/pricing-rules/admin/all?page=${page}&size=${size}`);
  }

  createDemandPricingRule(req: { name: string; demandLevel?: string; minActiveBookings?: number; multiplier: number; active?: boolean }): Observable<any> {
    const payload = {
      name: req.name || 'Surge Demand Rule',
      demandLevel: req.demandLevel || 'HIGH',
      multiplier: req.multiplier,
    };
    return this.http.post(`${this.gateway}/api/pricing-rules`, payload);
  }

  updateDemandPricingRule(id: number, req: { name: string; demandLevel?: string; minActiveBookings?: number; multiplier: number; active?: boolean }): Observable<any> {
    const payload = {
      name: req.name || 'Surge Demand Rule',
      demandLevel: req.demandLevel || 'HIGH',
      multiplier: req.multiplier,
    };
    return this.http.put(`${this.gateway}/api/pricing-rules/${id}`, payload);
  }

  activateDemandPricingRule(id: number): Observable<any> {
    return this.http.post(`${this.gateway}/api/pricing-rules/${id}/activate`, {});
  }

  deactivateDemandPricingRule(id: number): Observable<any> {
    return this.http.post(`${this.gateway}/api/pricing-rules/${id}/deactivate`, {});
  }

  listWeatherPricingRules(page = 0, size = 20): Observable<Page<any>> {
    return this.http.get<Page<any>>(`${this.gateway}/api/weather-pricing-rules/admin/all?page=${page}&size=${size}`);
  }

  createWeatherPricingRule(req: { condition?: string; weatherCondition?: string; multiplier: number; active?: boolean }): Observable<any> {
    const payload = {
      weatherCondition: req.weatherCondition || req.condition || 'RAIN',
      multiplier: req.multiplier,
    };
    return this.http.post(`${this.gateway}/api/weather-pricing-rules`, payload);
  }

  updateWeatherPricingRule(id: number, req: { condition?: string; weatherCondition?: string; multiplier: number; active?: boolean }): Observable<any> {
    const payload = {
      weatherCondition: req.weatherCondition || req.condition || 'RAIN',
      multiplier: req.multiplier,
    };
    return this.http.put(`${this.gateway}/api/weather-pricing-rules/${id}`, payload);
  }

  activateWeatherPricingRule(id: number): Observable<any> {
    return this.http.post(`${this.gateway}/api/weather-pricing-rules/${id}/activate`, {});
  }

  deactivateWeatherPricingRule(id: number): Observable<any> {
    return this.http.post(`${this.gateway}/api/weather-pricing-rules/${id}/deactivate`, {});
  }

  listScarcityPricingRules(page = 0, size = 20): Observable<Page<any>> {
    return this.http.get<Page<any>>(`${this.gateway}/api/scarcity-pricing-rules/admin/all?page=${page}&size=${size}`);
  }

  createScarcityPricingRule(req: { minAvailableWashers?: number; maxAvailableWashers?: number; multiplier: number; active?: boolean }): Observable<any> {
    const payload = {
      minAvailableWashers: req.minAvailableWashers ?? 0,
      maxAvailableWashers: req.maxAvailableWashers ?? 2,
      multiplier: req.multiplier,
    };
    return this.http.post(`${this.gateway}/api/scarcity-pricing-rules`, payload);
  }

  updateScarcityPricingRule(id: number, req: { minAvailableWashers?: number; maxAvailableWashers?: number; multiplier: number; active?: boolean }): Observable<any> {
    const payload = {
      minAvailableWashers: req.minAvailableWashers ?? 0,
      maxAvailableWashers: req.maxAvailableWashers ?? 2,
      multiplier: req.multiplier,
    };
    return this.http.put(`${this.gateway}/api/scarcity-pricing-rules/${id}`, payload);
  }

  activateScarcityPricingRule(id: number): Observable<any> {
    return this.http.post(`${this.gateway}/api/scarcity-pricing-rules/${id}/activate`, {});
  }

  deactivateScarcityPricingRule(id: number): Observable<any> {
    return this.http.post(`${this.gateway}/api/scarcity-pricing-rules/${id}/deactivate`, {});
  }

  getDynamicPricingMasterStatus(): Observable<{ dynamicPricingEnabled: boolean }> {
    return this.http.get<{ dynamicPricingEnabled: boolean }>(`${this.gateway}/api/pricing/status`);
  }

  toggleDynamicPricingMaster(enabled?: boolean): Observable<{ dynamicPricingEnabled: boolean }> {
    const body = enabled !== undefined ? { enabled } : {};
    return this.http.post<{ dynamicPricingEnabled: boolean }>(`${this.gateway}/api/pricing/toggle`, body);
  }
}
