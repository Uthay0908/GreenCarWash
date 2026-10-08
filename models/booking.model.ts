// Mirrors booking-service BookingStatus enum exactly.
export type BookingStatus =
  | 'PENDING'
  | 'ASSIGNMENT_PENDING'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'ADDITIONAL_PAYMENT_PENDING'
  | 'VERIFICATION_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'PAYMENT_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'DISPUTED'
  | 'EXPIRED';

export interface BookingAddOnLine {
  addOnId: number;
  name?: string;
  addOnName?: string;
  price: number;
}

export interface ChecklistItem {
  id: number;
  source: 'PACKAGE' | 'ADDON';
  name: string;
  displayOrder: number;
  mandatory: boolean;
  completed: boolean;
  completedAt?: string;
}

// Mirrors booking-service BookingResponse
export interface Booking {
  id: number;
  customerId: number;
  vehicleId: number;
  addressId: number;
  packageId: number;
  washerProfileId?: number;
  preferredWasherProfileId?: number;
  bookingType: 'WASH_NOW' | 'SCHEDULED';
  status: BookingStatus;
  scheduledAt?: string;
  customerInstructions?: string;
  packagePrice: number;
  addOnTotal: number;
  discountAmount: number;
  additionalCharges: number;
  surgeAmount: number;
  totalAmount: number;
  allocatedWaterLiters?: number;
  cancellationFeeAmount?: number;
  promotionCode?: string;
  cancellationReason?: string;
  paymentConfirmedAt?: string;
  verifiedAt?: string;
  addOns: BookingAddOnLine[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;

  vehicleLabel?: string;
  packageName?: string;
}

// Mirrors booking-service CreateBookingRequest.
export interface CreateBookingRequest {
  vehicleId: number;
  addressId: number;
  packageId: number;
  addOnIds: number[];
  customerInstructions?: string;
  promotionCode?: string;
  scheduledAt?: string | null;
  preferredWasherProfileId?: number;
}

export interface CancelBookingRequest {
  reason: string;
}

export interface WaterUsageRequest {
  actualWaterUsedLiters: number;
  washMethod?: string;
  notes?: string;
}

export interface WaterUsageResponse {
  bookingId: number;
  allocatedWaterLiters: number;
  actualWaterUsedLiters: number;
  waterSavedLiters: number;
  traditionalBaselineLiters: number;
  waterSavedVsTraditionalLiters: number;
  washMethod: string;
  unit: string;
  recordedAt: string;
}

export interface AdditionalAddOnRequestCreateRequest {
  addOnId: number;
  reason: string;
}

export interface AdditionalAddOnReviewRequest {
  approve: boolean;
  rejectionReason?: string;
}

export interface AdditionalAddOnRequestResponse {
  id: number;
  bookingId: number;
  requestedByWasherProfileId: number;
  addOnId: number;
  addOnName: string;
  addOnPrice?: number;
  price?: number;
  reason: string;
  status: string;
  reviewedByUserId?: number;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface SubmitInspectionReportRequest {
  beforePhotos: string[];
  existingDamageNotes?: string;
  existingDamagePhotos?: string[];
  fuelLevelPercentage?: number;
  odometerReading?: number;
}

export interface InspectionReportResponse {
  id: number;
  bookingId: number;
  washerProfileId: number;
  beforePhotos: string[];
  existingDamageNotes?: string;
  existingDamagePhotos?: string[];
  acknowledgedByCustomer: boolean;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface UploadServiceEvidenceRequest {
  evidenceType: 'PHOTO' | 'VIDEO' | 'BEFORE_PHOTO' | 'AFTER_PHOTO' | 'DAMAGE_PHOTO' | string;
  servicePhase?: 'ARRIVAL' | 'BEFORE_SERVICE' | 'AFTER_SERVICE' | string;
  fileUrl: string;
  notes?: string;
}

export interface ServiceEvidenceResponse {
  id: number;
  bookingId?: number;
  evidenceType: string;
  servicePhase?: string;
  fileUrl: string;
  notes?: string;
  uploadedAt: string;
}

export interface VerificationEvidenceItem {
  evidenceType: 'PHOTO' | 'VIDEO' | string;
  fileUrl: string;
  servicePhase?: 'ARRIVAL' | 'BEFORE_SERVICE' | 'AFTER_SERVICE' | string;
}

export interface SubmitVerificationRequest {
  evidence: VerificationEvidenceItem[];
  checklistCompleted?: boolean;
  evidenceUrls?: string[];
  notes?: string;
}

export interface VerificationResponse {
  id?: number;
  bookingId: number;
  washerProfileId?: number;
  verifiedAt?: string;
  checklistCompleted?: boolean;
  evidenceCount?: number;
  evidence?: ServiceEvidenceResponse[];
}

export interface ConfirmServiceQualityRequest {
  rating: number;
  feedback?: string;
  qualityMet: boolean;
}

export interface ServiceQualityConfirmationResponse {
  id: number;
  bookingId: number;
  customerId: number;
  rating: number;
  feedback?: string;
  qualityMet: boolean;
  confirmedAt: string;
}

export interface BookingTimelineResponse {
  timestamp?: string;
  status?: string;
  actor?: string;
  description?: string;
  fromStatus?: string | null;
  toStatus?: string;
  reason?: string;
  changedAt?: string;
}
