export interface AssignmentResponse {
  id: number;
  bookingId: number;
  customerId: number;
  addressId: number;
  washerProfileId: number;
  status: string;
  offerExpiresAt?: string;
  attemptCount: number;
  etaMinutes?: number;
  acceptedAt?: string;
  arrivedAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentHistoryResponse {
  id: number;
  assignmentId: number;
  bookingId: number;
  washerProfileId: number;
  event: string;
  notes?: string;
  timestamp: string;
}

export interface EtaLocationResponse {
  bookingId: number;
  latitude: number;
  longitude: number;
  etaMinutes?: number;
  updatedAt: string;
}

export interface NavigationStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface NavigationResponse {
  bookingId: number;
  origin?: Waypoint;
  destination?: Waypoint;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  route?: Waypoint[];
  computedAt?: string;
  washerLocation?: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number };
  distanceMeters?: number;
  durationSeconds?: number;
  etaMinutes?: number;
  steps?: NavigationStep[];
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  etaMinutes?: number;
}

export interface RejectAssignmentRequest {
  reason: string;
}

export interface AdminAssignRequest {
  washerProfileId: number;
  reason?: string;
}

export interface WasherPerformanceResponse {
  washerProfileId: number;
  offeredCount: number;
  acceptedCount: number;
  rejectedCount: number;
  timedOutCount: number;
  acceptanceRate: number;
  rejectionRate: number;
  timeoutRate: number;
  slaBreachRate: number;
  averageResponseSeconds?: number;
  averageRating: number;
  totalCompletedJobs: number;
}

export interface WasherLeaderboardEntryResponse {
  washerProfileId: number;
  washerName: string;
  averageRating: number;
  completedJobs: number;
  acceptanceRate: number;
  rank: number;
}

export interface ServiceAreaResponse {
  id: number;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  active: boolean;
  city?: string;
  state?: string;
  postalCodePrefix?: string;
  postalCodes?: string[];
}

export type ServiceArea = ServiceAreaResponse;

export interface ServiceAreaRequest {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  postalCodes?: string[];
  city?: string;
  state?: string;
  postalCodePrefix?: string;
  active?: boolean;
}
