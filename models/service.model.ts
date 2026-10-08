// Mirrors catalog-service task response (used by both packages and add-ons).
export interface ServiceTask {
  id: number;
  name: string;
  displayOrder: number;
  mandatory: boolean;
}

export interface PackageTaskRequest {
  name: string;
  displayOrder: number;
  mandatory: boolean;
}

// Mirrors catalog-service WashPackageResponse.
export interface WashPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  allocatedWaterLiters: number;
  active: boolean;
  tasks: ServiceTask[];
  suitableVehicleTypes: string[];
}

export interface WashPackageRequest {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  allocatedWaterLiters: number;
  tasks: PackageTaskRequest[];
  suitableVehicleTypes: string[];
}

// Mirrors catalog-service AddOnResponse.
export interface AddOn {
  id: number;
  name: string;
  description: string;
  price: number;
  active: boolean;
  tasks: ServiceTask[];
}

export interface AddOnRequest {
  name: string;
  description: string;
  price: number;
  tasks: PackageTaskRequest[];
}

// Mirrors catalog-service Promotion entities and DTOs.
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Promotion {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
}

export interface PromotionRequest {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
}

export interface PromotionApplyRequest {
  code: string;
  bookingAmount: number;
}

export interface PromotionApplyResponse {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}
