import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddOn, AddOnRequest, Promotion, PromotionRequest, ServiceTask, WashPackage, WashPackageRequest, PackageTaskRequest } from '../../shared/models';

export interface PriceQuoteRequest {
  packageId: number;
  addOnIds?: number[];
  latitude: number;
  longitude: number;
  requestedAt?: string | null;
}

export interface PriceQuoteResponse {
  basePackagePrice: number;
  addOnTotal: number;
  subtotal: number;
  demandMultiplier: number;
  weatherMultiplier: number;
  scarcityMultiplier: number;
  combinedMultiplier: number;
  surgeAmount: number;
  finalPrice: number;
  weatherCondition: string;
  availableWasherCount: number;
}

export interface SlotResponse {
  startTime: string;
  endTime: string;
  availableWasherCount: number;
  available: boolean;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  // --- Packages ---
  listPackages(): Observable<WashPackage[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/packages`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  getPackage(id: number): Observable<WashPackage> {
    return this.http.get<WashPackage>(`${this.gatewayBaseUrl}/api/packages/${id}`);
  }

  getPackageTasks(id: number): Observable<ServiceTask[]> {
    return this.http.get<ServiceTask[]>(`${this.gatewayBaseUrl}/api/packages/${id}/tasks`);
  }

  createPackage(request: WashPackageRequest): Observable<WashPackage> {
    return this.http.post<WashPackage>(`${this.gatewayBaseUrl}/api/packages`, request);
  }

  updatePackage(id: number, request: WashPackageRequest): Observable<WashPackage> {
    return this.http.put<WashPackage>(`${this.gatewayBaseUrl}/api/packages/${id}`, request);
  }

  deletePackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/packages/${id}`);
  }

  addPackageTask(packageId: number, task: PackageTaskRequest): Observable<ServiceTask> {
    return this.http.post<ServiceTask>(`${this.gatewayBaseUrl}/api/packages/${packageId}/tasks`, task);
  }

  deletePackageTask(packageId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/packages/${packageId}/tasks/${taskId}`);
  }

  // --- Add-Ons ---
  listAddOns(): Observable<AddOn[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/addons`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  getAddOn(id: number): Observable<AddOn> {
    return this.http.get<AddOn>(`${this.gatewayBaseUrl}/api/addons/${id}`);
  }

  createAddOn(request: AddOnRequest): Observable<AddOn> {
    return this.http.post<AddOn>(`${this.gatewayBaseUrl}/api/addons`, request);
  }

  updateAddOn(id: number, request: AddOnRequest): Observable<AddOn> {
    return this.http.put<AddOn>(`${this.gatewayBaseUrl}/api/addons/${id}`, request);
  }

  deleteAddOn(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/addons/${id}`);
  }

  // --- Promotions ---
  listPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.gatewayBaseUrl}/api/promotions`);
  }

  listActivePromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.gatewayBaseUrl}/api/promotions/active`);
  }

  createPromotion(request: PromotionRequest): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.gatewayBaseUrl}/api/promotions`, request);
  }

  updatePromotion(id: number, request: PromotionRequest): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.gatewayBaseUrl}/api/promotions/${id}`, request);
  }

  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/promotions/${id}`);
  }

  // --- Pricing & Slots ---
  getQuote(request: PriceQuoteRequest): Observable<PriceQuoteResponse> {
    return this.http.post<PriceQuoteResponse>(`${this.gatewayBaseUrl}/api/pricing/quote`, request);
  }

  calculatePrice(request: any): Observable<PriceQuoteResponse> {
    return this.http.post<PriceQuoteResponse>(`${this.gatewayBaseUrl}/api/pricing/calculate`, request);
  }

  getSlots(request: { date: string; latitude: number; longitude: number }): Observable<SlotResponse[]> {
    return this.http.post<SlotResponse[]>(`${this.gatewayBaseUrl}/api/pricing/slots`, request);
  }

  getWeather(latitude: number, longitude: number): Observable<{ condition: string }> {
    return this.http.get<{ condition: string }>(`${this.gatewayBaseUrl}/api/pricing/weather`, {
      params: { latitude: latitude.toString(), longitude: longitude.toString() }
    });
  }

  validatePromotion(code: string, packageId: number, amount: number): Observable<any> {
    return this.applyPromotion(code, amount);
  }

  applyPromotion(code: string, bookingAmount: number): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/promotions/apply`, { code, bookingAmount });
  }

  // --- Pricing Rules ---
  listPricingRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/pricing-rules`);
  }

  createPricingRule(request: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/pricing-rules`, request);
  }

  updatePricingRule(id: number, request: any): Observable<any> {
    return this.http.put<any>(`${this.gatewayBaseUrl}/api/pricing-rules/${id}`, request);
  }

  deletePricingRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/pricing-rules/${id}`);
  }

  listScarcityPricingRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/scarcity-pricing-rules`);
  }

  listWeatherPricingRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/weather-pricing-rules`);
  }
}
