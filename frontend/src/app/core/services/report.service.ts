import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reports/dashboard`);
  }

  getOrderReports(from?: string, to?: string): Observable<any> {
    let url = `${this.gatewayBaseUrl}/api/reports/orders`;
    const params: string[] = [];
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  getSalesReport(from?: string, to?: string): Observable<any> {
    let url = `${this.gatewayBaseUrl}/api/reports/sales`;
    const params: string[] = [];
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<any>(url);
  }

  getUserReports(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reports/users`);
  }

  getLocationReports(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reports/locations`);
  }

  getWaterSavingReport(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reports/water-saving`);
  }

  getAdvancedReports(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reports/advanced`);
  }

  getSustainabilitySummary(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reports/sustainability/summary`);
  }

  getRiskFlags(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/reports/risk-flags`);
  }

  getAuditRecords(page = 0, size = 50): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/reports/audit-records?page=${page}&size=${size}`);
  }

  // --- System Configuration ---
  getSystemConfig(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/admin/system-config`);
  }

  getSystemConfigByKey(key: string): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/admin/system-config/${key}`);
  }

  updateSystemConfig(key: string, value: string): Observable<any> {
    return this.http.put<any>(`${this.gatewayBaseUrl}/api/admin/system-config/${key}`, { value });
  }
}
