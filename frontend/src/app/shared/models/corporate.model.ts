// Mirrors corporate-service OrganizationResponse.
export interface Organization {
  id: number;
  ownerUserAccountId: number;
  name: string;
  billingEmail?: string;
  billingAddress?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRequest {
  name: string;
  billingEmail?: string;
  billingAddress?: string;
}

// Mirrors corporate-service OrganizationMember.MemberRole enum.
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

// Mirrors corporate-service OrganizationMemberResponse.
export interface OrganizationMember {
  id: number;
  organizationId: number;
  userAccountId: number;
  role: MemberRole;
  addedAt: string;

  // Enriched member profile fields
  fullName?: string;
  email?: string;
  phone?: string;
}

export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'OFF_DUTY';

export interface FleetDriver {
  id: number;
  organizationId: number;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  assignedVehicleId?: number | null;
  assignedVehicleLabel?: string;
  totalWashesCompleted: number;
  rating?: number;
  joinedAt: string;
}

export interface AddMemberRequest {
  userAccountId: number;
  role: MemberRole;
}

// Mirrors corporate-service OrganizationLocationResponse
export interface OrganizationLocation {
  id: number;
  organizationId: number;
  label?: string;
  addressId: number;
  createdAt: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddLocationRequest {
  label?: string;
  addressId?: number;
  addrLabel?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Mirrors corporate-service OrganizationVehicleResponse
export interface OrganizationVehicle {
  id: number;
  organizationId: number;
  vehicleId: number;
  label?: string;
  addedAt: string;
  make?: string;
  model?: string;
  licensePlate?: string;
  vehicleType?: string;
  color?: string;
}

export interface AddVehicleRequest {
  vehicleId: number;
  label?: string;
}

// Mirrors corporate-service FleetBookingRequestResponse.
export interface FleetBookingRequestSummary {
  id: number;
  organizationId: number;
  requestedByUserAccountId: number;
  packageId: number;
  locationId: number;
  addOnIds: number[];
  scheduledAt: string;
  status: 'PENDING' | 'PENDING_AUTHORIZATION' | 'PROCESSING' | 'COMPLETED' | 'EXECUTED' | 'PARTIALLY_FAILED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  itemCount?: number;
  items?: Array<{
    id: number;
    vehicleId: number;
    bookingId?: number;
    status: string;
    errorMessage?: string;
  }>;
}

// Mirrors corporate-service RecurringFleetSchedule.Frequency and RecurringScheduleResponse.
export type FleetScheduleFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface RecurringFleetSchedule {
  id: number;
  organizationId: number;
  locationId: number;
  packageId: number;
  addOnIds: number[];
  vehicleIds: number[];
  frequency: FleetScheduleFrequency;
  daysOfWeek: number[];
  timeOfDay: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  nextRunAt?: string;
  createdAt: string;
}
