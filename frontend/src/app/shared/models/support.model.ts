// Mirrors support-service Complaint.ComplaintStatus / ResolutionDecision enums.
export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
export type ResolutionDecision = 'REFUND' | 'CREDIT' | 'NO_ACTION' | 'REWASH';

// Mirrors support-service ComplaintResponse.
export interface Complaint {
  id: number;
  bookingId: number;
  customerId: number;
  washerProfileId?: number;
  assignedAdminId?: number;
  refundId?: number;
  description: string;
  status: ComplaintStatus;
  resolutionDecision?: ResolutionDecision;
  resolutionNotes?: string;
  washerResponse?: string;
  creditAmount?: number;
  rewashRequested: boolean;
  washerRespondedAt?: string;
  createdAt: string;
  resolvedAt?: string;
}

// Mirrors support-service ComplaintRequest.
export interface ComplaintRequest {
  bookingId: number;
  description: string;
}

// Mirrors support-service DamageClaim.ClaimStatus enum.
export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

// Mirrors support-service DamageClaimResponse.
export interface DamageClaim {
  id: number;
  bookingId: number;
  customerId: number;
  washerProfileId?: number;
  description: string;
  status: ClaimStatus;
  claimedAmount?: number;
  approvedAmount?: number;
  decisionNotes?: string;
  evidenceFileUrls: string[];
  createdAt: string;
  resolvedAt?: string;
}

// Mirrors support-service DamageClaimRequest.
export interface DamageClaimRequest {
  bookingId: number;
  description: string;
  claimedAmount?: number;
  evidenceFileUrls?: string[];
}

// Mirrors support-service SupportTicket enums: TicketStatus, RaiserType, TicketCategory.
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'GENERAL' | 'SERVICE_ISSUE' | 'VEHICLE_ISSUE' | 'EQUIPMENT_ISSUE';

// Mirrors support-service SupportTicketResponse. `priority` is a UI-only field mapped onto the
// ticket-creation form per the spec (the real DTO does not carry a distinct priority column -
// category is its closest backend equivalent) - kept separate and clearly commented so it is not
// mistaken for a verified backend field.
export interface SupportTicket {
  id: number;
  customerId?: number;
  washerProfileId?: number;
  bookingId?: number;
  assignedAdminId?: number;
  subject: string;
  description: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  resolution?: string;
  slaDueAt?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SupportTicketRequest {
  bookingId?: number;
  subject: string;
  description: string;
  priority?: TicketPriority;
  category?: TicketCategory;
}

export interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
  active: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}
