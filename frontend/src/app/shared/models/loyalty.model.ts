// Mirrors loyalty-service MembershipTier enum (BRONZE/SILVER/GOLD/PLATINUM, min lifetime points
// 0/500/2000/5000 respectively).
export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

// Mirrors loyalty-service LoyaltyAccountResponse.
export interface LoyaltyAccount {
  customerId: number;
  pointsBalance: number;
  lifetimePointsEarned: number;
  tier: MembershipTier;
}

// Mirrors loyalty-service WalletAccountResponse.
export interface WalletAccount {
  customerId: number;
  balance: number;
}

// Mirrors loyalty-service WalletTransactionResponse.
export interface WalletTransaction {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
}

// Mirrors loyalty-service LeaderboardEntryResponse.
export interface LeaderboardEntry {
  rank: number;
  customerId: number;
  totalWaterSavedLiters: number;
}

// Mirrors loyalty-service CustomerBadgeResponse.
export interface CustomerBadge {
  badgeType: string;
  thresholdLiters: number;
  earnedAt: string;
}

// UI-only aggregate reward tiers shown on the loyalty dashboard; the point thresholds mirror
// MembershipTier's real backend values (500 / 2000 / 5000 lifetime points).
export interface RewardTier {
  tier: MembershipTier;
  pointsRequired: number;
  perks: string[];
}
