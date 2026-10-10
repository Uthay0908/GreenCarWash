import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoyaltyAccount,
  RewardTier,
  WalletAccount,
  WalletTransaction,
  LeaderboardEntry,
  CustomerBadge,
} from '../../shared/models';

export const REWARD_TIERS: RewardTier[] = [
  { tier: 'BRONZE', pointsRequired: 0, perks: ['Standard wash booking', 'Earn 1 point per $1 spent'] },
  { tier: 'SILVER', pointsRequired: 500, perks: ['5% off all add-ons', 'Earn 1.25 points per $1 spent', 'Priority customer support'] },
  { tier: 'GOLD', pointsRequired: 2000, perks: ['10% off all wash packages', 'Earn 1.5 points per $1 spent', 'Free windshield treatment each month'] },
  { tier: 'PLATINUM', pointsRequired: 5000, perks: ['15% off everything', 'Earn 2 points per $1 spent', 'VIP scheduling & dedicated washer option'] },
];

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;
  private readonly _account = signal<LoyaltyAccount | null>(null);

  readonly account = this._account.asReadonly();

  getAccount(): Observable<LoyaltyAccount> {
    return this.getMyLoyalty();
  }

  getMyLoyalty(): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.gatewayBaseUrl}/api/loyalty/me`).pipe(
      tap((acc) => this._account.set(acc))
    );
  }

  getMyLoyaltyHistory(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/loyalty/me/history`);
  }

  getWaterSavingsSummary(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/loyalty/water-savings/me`);
  }

  getWallet(): Observable<WalletAccount> {
    return this.http.get<WalletAccount>(`${this.gatewayBaseUrl}/api/loyalty/wallet/me`);
  }

  topUpWallet(amount: number, reason = 'Online Wallet Top Up'): Observable<WalletAccount> {
    return this.http.post<WalletAccount>(`${this.gatewayBaseUrl}/api/loyalty/wallet/topup`, {
      amount,
      reason,
      referenceId: 'TOPUP-' + Date.now(),
    });
  }

  redeemPoints(points: number): Observable<LoyaltyAccount> {
    return this.http.post<LoyaltyAccount>(`${this.gatewayBaseUrl}/api/loyalty/redeem?points=${points}`, {});
  }

  listTransactions(): Observable<WalletTransaction[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/loyalty/wallet/me/history`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  getMyBadges(): Observable<CustomerBadge[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/loyalty/badges/me`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  getMyWaterSavings(unit = 'LITERS'): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/loyalty/water-savings/me?unit=${unit}`);
  }

  // --- Water Leaderboard ---
  getWaterLeaderboardAllTime(limit = 20): Observable<LeaderboardEntry[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/leaderboard/water-saved/all-time?limit=${limit}`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  getWaterLeaderboardMonthly(limit = 20): Observable<LeaderboardEntry[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/leaderboard/water-saved/monthly?limit=${limit}`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  // --- Referrals ---
  getReferralCode(): Observable<any> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/referrals/mine`);
  }

  listMyReferrals(): Observable<any[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/referrals/mine`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  createReferral(referredCustomerId: number, referralCode: string): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/referrals?referredCustomerId=${referredCustomerId}&referralCode=${referralCode}`, {});
  }

  // --- Memberships ---
  listMemberships(): Observable<any[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/memberships`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content ?? [])))
    );
  }

  listRewardTiers(): Observable<RewardTier[]> {
    return new Observable((sub) => {
      sub.next(REWARD_TIERS);
      sub.complete();
    });
  }
}
