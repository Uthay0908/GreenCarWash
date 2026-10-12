export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
export interface AdditionalAddOnReview {
  id: number;
  bookingId: number;
  washerProfileId: number;
  washerName?: string;
  customerName?: string;
  addOnId: number;
  addOnName: string;
  price: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  rejectionReason?: string;
}

export interface SystemConfigEntry {
  id: number;
  key: string;
  value: string;
  description: string;
  updatedBy?: number;
  updatedAt?: string;
}

export interface SystemConfigEntryRequest {
  key: string;
  value: string;
  description: string;
}

export interface NotificationTemplate {
  id: number;
  eventType: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  titleTemplate: string;
  bodyTemplate: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationTemplateRequest {
  eventType: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  titleTemplate: string;
  bodyTemplate: string;
}

export interface BroadcastRequest {
  recipientUserIds: number[];
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  title: string;
  body: string;
}

export interface AuditRecord {
  id: number;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payloadJson?: string;
  actorUserId?: number;
  createdAt: string;
}

export interface OrderReportEntry {
  orderNumber: number;
  bookingId: number;
  customerId: number;
  customerName?: string;
  washerProfileId?: number;
  washerName?: string;
  packageId: number;
  packageName: string;
  totalAmount: number;
  waterAllocatedLiters?: number;
  waterUsedLiters?: number;
  waterSavedLiters?: number;
  status: string;
  bookingDate: string;
  completedDate?: string;
}

export interface RevenueSummary {
  fromDate?: string;
  toDate?: string;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface WaterSavingSummary {
  fromDate?: string;
  toDate?: string;
  totalWaterSaved: number;
  totalWaterUsed: number;
  totalAllocated: number;
  percentageSaved: number;
  unit: 'LITERS' | 'GALLONS';
}

export interface AdvancedReport {
  fromDate?: string;
  toDate?: string;
  totalRevenue: number;
  orderCountsByStatus: Record<string, number>;
  revenueByWasher: Record<string, number>;
}

export interface SustainabilitySummary {
  fromDate?: string;
  toDate?: string;
  totalWaterSavedLiters: number;
  estimatedCo2SavedKg: number;
  equivalentTreesPlanted: number;
}

export interface WasherLeaderboardEntry {
  rank: number;
  washerProfileId: number;
  washerName: string;
  acceptanceRate: number;
  averageRating: number;
  totalCompletedJobs: number;
}

export interface CustomerLeaderboardEntry {
  rank: number;
  customerProfileId: number;
  customerName: string;
  totalWaterSavedLiters: number;
  completedWashesCount: number;
}

export interface WasherRejectionStat {
  washerProfileId: number;
  washerName: string;
  rejectionCount: number;
  timeoutCount: number;
  noShowCount: number;
  totalFlaggedEvents: number;
  flagged: boolean;
}

export interface RiskFlag {
  aggregateId: string;
  eventType: string;
  occurrenceCount: number;
  threshold: number;
  flaggedAt: string;
}

export interface DashboardResponse {
  revenue: RevenueSummary;
  waterSaved: WaterSavingSummary;
  advanced: {
    totalRevenue: number;
    ordersByStatus: Record<string, number>;
    revenueByWasher: Array<{ washerProfileId: number; totalRevenue: number; completedOrders: number }>;
  };
}

