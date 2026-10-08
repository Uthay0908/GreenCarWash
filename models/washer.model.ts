// Mirrors washer-service WasherProfileResponse.
export interface WasherProfile {
  id: number;
  userAccountId: number;
  fullName: string;
  email: string;
  phone: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  stripeConnectedAccountId?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  active: boolean;
  averageRating?: number;
  totalCompletedJobs: number;
  skills: string[];
  createdAt: string;
}

export interface CreateWasherProfileRequest {
  userAccountId: number;
  fullName: string;
  email: string;
  phone: string;
  skills?: string[];
}

export interface UpdateWasherProfileRequest {
  fullName?: string;
  phone?: string;
  skills?: string[];
}

// Mirrors washer-service AvailabilityResponse.
export interface WasherAvailability {
  washerProfileId: number;
  online: boolean;
  serviceRadiusKm?: number;
  baseLatitude?: number;
  baseLongitude?: number;
  currentLatitude?: number;
  currentLongitude?: number;
  maxConcurrentJobs: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  updatedAt: string;
}

export interface AvailabilityUpdateRequest {
  online?: boolean;
  serviceRadiusKm?: number;
  baseLatitude?: number;
  baseLongitude?: number;
  maxConcurrentJobs?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
}

export interface UpdateSkillsRequest {
  skills: string[];
}

export interface AvailabilityBlackoutRequest {
  blackoutDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface AvailabilityBlackoutResponse {
  id: number;
  washerProfileId?: number;
  blackoutDate?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt?: string;
}

export type KycDocumentType =
  | 'NATIONAL_ID'
  | 'DRIVING_LICENSE'
  | 'PROOF_OF_ADDRESS'
  | 'BACKGROUND_CHECK'
  | 'VEHICLE_INSURANCE'
  | 'OTHER'
  | 'ID_CARD'
  | 'POLICE_CLEARANCE'
  | 'INSURANCE';

export interface KycDocumentUploadRequest {
  documentType: KycDocumentType;
  documentNumber: string;
  fileUrl: string;
}

export interface KycDocumentResponse {
  id: number;
  washerProfileId: number;
  documentType: string;
  documentNumber: string;
  fileUrl: string;
  documentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  submittedAt?: string;
  uploadedAt?: string;
  reviewedAt?: string;
}

export type KycDocument = KycDocumentResponse;

export interface KycReviewRequest {
  approved?: boolean;
  approve?: boolean;
  notes?: string;
}

export interface UpdateBankInfoRequest {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
}

export interface UpdateConnectAccountRequest {
  stripeConnectedAccountId: string;
}

export interface WasherNotification {
  id: number;
  eventType: string;
  title: string;
  body: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface OperationalTicketRequest {
  bookingId?: number;
  category: 'GENERAL' | 'SERVICE_ISSUE' | 'VEHICLE_ISSUE' | 'EQUIPMENT_ISSUE';
  subject: string;
  description: string;
  replacementRequested: boolean;
}

export interface WasherPayoutResponse {
  id: number;
  paymentId?: number;
  bookingId: number;
  washerProfileId?: number;
  totalAmount: number;
  platformFeePercentageApplied?: number;
  platformFeeAmount?: number;
  washerAmount: number;
  currency: string;
  stripeConnectedAccountId?: string;
  stripeTransferReference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'HELD';
  failureReason?: string;
  holdReason?: string;
  heldAt?: string;
  createdAt: string;
  completedAt?: string;
}

// Mirrors assignment-service AssignmentStatus enum exactly.
export type AssignmentStatus =
  | 'PENDING'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'TIMED_OUT'
  | 'CANCELLED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ESCALATED'
  | 'FAILED_NO_WASHER_AVAILABLE';

// Mirrors assignment-service AssignmentResponse.
export interface Assignment {
  id: number;
  bookingId: number;
  customerId: number;
  addressId: number;
  washerProfileId: number;
  status: AssignmentStatus;
  offerExpiresAt?: string;
  attemptCount: number;
  etaMinutes?: number;
  acceptedAt?: string;
  arrivedAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;

  customerName?: string;
  vehicleLabel?: string;
  packageName?: string;
  addressLabel?: string;
}

// Mirrors assignment-service WasherPerformanceResponse.
export interface WasherPerformance {
  washerProfileId: number;
  offeredCount: number;
  acceptedCount: number;
  rejectedCount: number;
  timedOutCount: number;
  totalCompletedJobs: number;
  acceptanceRate: number;
  rejectionRate: number;
  timeoutRate: number;
  slaBreachRate: number;
  averageResponseSeconds?: number;
  averageRating?: number;
}
