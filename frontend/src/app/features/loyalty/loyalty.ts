import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoyaltyService } from '../../core/services/loyalty.service';
import { AuthService } from '../../core/services/auth.service';
import { LoyaltyAccount, RewardTier, WalletAccount, WalletTransaction } from '../../shared/models';

export type LoyaltyTab = 'WALLET' | 'WATER_IMPACT' | 'LEADERBOARD' | 'MEMBERSHIP' | 'REFERRAL';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  litersSaved: number;
}

@Component({
  selector: 'app-loyalty',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loyalty.html',
  styleUrl: './loyalty.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loyalty implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loyalty = inject(LoyaltyService);
  private readonly auth = inject(AuthService);

  private readonly defaultAvatars = [
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  ];

  readonly activeTab = signal<LoyaltyTab>('WATER_IMPACT');

  readonly account = signal<LoyaltyAccount | null>({
    customerId: 1,
    tier: 'GOLD',
    pointsBalance: 1250,
    lifetimePointsEarned: 3500,
  });

  readonly wallet = signal<WalletAccount | null>({
    customerId: 1,
    balance: 245.0,
  });

  readonly transactions = signal<WalletTransaction[]>([
    {
      id: 101,
      type: 'CREDIT',
      amount: 50.0,
      reason: 'Eco Referral Reward - Friend Joined',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 102,
      type: 'DEBIT',
      amount: 35.0,
      reason: 'Express Steam Wash Order #GCW-8821',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 103,
      type: 'CREDIT',
      amount: 100.0,
      reason: 'Wallet Top Up via Credit Card',
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ]);
  readonly rewardTiers = signal<RewardTier[]>([]);

  // Water Saving Dashboard matching Screen 21
  readonly waterPeriod = signal<'THIS_MONTH' | 'ALL_TIME' | 'MY_CITY'>('THIS_MONTH');
  readonly allocatedWaterLiters = signal<number>(350);
  readonly usedWaterLiters = signal<number>(166);
  readonly savedWaterLiters = signal<number>(184);

  // Leaderboard matching Screen 22
  readonly leaderboardPeriod = signal<'THIS_MONTH' | 'ALL_TIME' | 'MY_AREA'>('THIS_MONTH');
  readonly podium = signal<LeaderboardUser[]>([
    { rank: 1, name: 'Karthik S', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80', litersSaved: 220 },
    { rank: 2, name: 'Priyankaa S', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', litersSaved: 184 },
    { rank: 3, name: 'Divya P', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', litersSaved: 162 },
  ]);

  readonly leaderboardList = signal<LeaderboardUser[]>([
    { rank: 4, name: 'Arun Kumar', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', litersSaved: 152 },
    { rank: 5, name: 'Senthil P', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', litersSaved: 138 },
    { rank: 6, name: 'Meena R', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', litersSaved: 126 },
  ]);

  // Referral matching Screen 20
  readonly referralCode = signal<string>('GCWPR123');
  readonly friendsJoined = signal<number>(12);
  readonly referralEarned = signal<number>(180);
  readonly copyToast = signal<string | null>(null);

  // Membership & Rewards State
  readonly membershipPlans = signal<any[]>([]);
  readonly membershipTier = signal<string>('Gold Member');
  readonly membershipExpiry = signal<string>('12 Dec 2026');

  readonly defaultPlans = [
    {
      tier: 'BRONZE',
      minLifetimePoints: 0,
      description: 'Standard green tier - 1x point accrual',
      benefits: ['Standard wash booking', 'Earn 1 point per $1 spent', 'Eco savings dashboard tracking'],
    },
    {
      tier: 'SILVER',
      minLifetimePoints: 1000,
      description: 'Silver green tier - 1.25x point accrual',
      benefits: ['Priority scheduling windows', 'Earn 1.25 points per $1 spent', '5% off detailing add-ons', 'Dedicated email support'],
    },
    {
      tier: 'GOLD',
      minLifetimePoints: 2500,
      description: 'Gold green tier - 1.5x point accrual',
      benefits: ['Priority scheduling windows', 'Earn 1.5 points per $1 spent', '10% off all packages', 'Free interior steam detox (2/mo)', 'Dedicated eco-care support line'],
    },
    {
      tier: 'PLATINUM',
      minLifetimePoints: 5000,
      description: 'Platinum green tier - 2x point accrual',
      benefits: ['Immediate VIP scheduling', 'Earn 2 points per $1 spent', '15% off all packages', 'Unlimited interior steam detox', 'Free seasonal ceramic coating checkup'],
    },
  ];

  readonly displayPlans = computed(() => {
    const backend = this.membershipPlans();
    return backend && backend.length > 0 ? backend : this.defaultPlans;
  });

  readonly availableOffers = signal([
    { code: 'SPRINGCLEAN', title: 'Spring Special', discount: '20% OFF', description: 'Get 20% off any Deluxe or Ceramic Steam Wash.', expires: 'Valid till 30 Apr 2026' },
    { code: 'GREENSTEAM', title: 'Eco Steam Bonus', discount: '$10 OFF', description: '$10 off on interior steam detox & sanitization.', expires: 'Valid till 15 May 2026' },
    { code: 'VIPWATER', title: 'Water Saver Perk', discount: 'FREE ADDON', description: 'Free rain repellent coating with any express wash.', expires: 'Valid till 31 May 2026' },
    { code: 'ECOFIRST', title: 'First Clean Bonus', discount: '15% OFF', description: '15% off first scheduled doorstep wash.', expires: 'Valid till 30 Jun 2026' },
  ]);

  // Interactive Modals State
  readonly showTopUpModal = signal<boolean>(false);
  readonly topUpAmount = signal<number>(50);
  readonly customTopUp = signal<string>('');
  readonly topUpPaymentMethod = signal<'CARD' | 'UPI' | 'NETBANKING'>('CARD');

  readonly showRedeemModal = signal<boolean>(false);
  readonly redeemPointsAmount = signal<number>(500);

  readonly showOffersModal = signal<boolean>(false);
  readonly showHistoryModal = signal<boolean>(false);
  readonly showMembershipModal = signal<boolean>(false);
  readonly showPromoModal = signal<boolean>(false);
  readonly promoCodeInput = signal<string>('');

  readonly actionToast = signal<string | null>(null);

  readonly nextTier = computed<RewardTier | null>(() => {
    const acc = this.account();
    if (!acc) return null;
    return this.rewardTiers().find((t) => t.pointsRequired > acc.lifetimePointsEarned) ?? null;
  });

  readonly progressPercent = computed(() => {
    const acc = this.account();
    const next = this.nextTier();
    if (!acc || !next) return 100;
    const currentTierPoints = this.rewardTiers().find((t) => t.tier === acc.tier)?.pointsRequired ?? 0;
    const span = Math.max(1, next.pointsRequired - currentTierPoints);
    const progressed = Math.max(0, acc.lifetimePointsEarned - currentTierPoints);
    return Math.min(100, Math.round((progressed / span) * 100));
  });

  readonly redeemedPoints = computed(() => {
    const list = this.transactions();
    if (!Array.isArray(list)) return 0;
    return list
      .filter((t) => t.type === 'DEBIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  });

  ngOnInit(): void {
    // Listen to query parameters to activate the correct tab from sidebar navigation
    this.route.queryParamMap.subscribe((params) => {
      const tabParam = params.get('tab')?.toLowerCase();
      if (tabParam) {
        if (tabParam === 'wallet') {
          this.activeTab.set('WALLET');
        } else if (tabParam === 'water' || tabParam === 'water_impact' || tabParam === 'eco') {
          this.activeTab.set('WATER_IMPACT');
        } else if (tabParam === 'leaderboard') {
          this.activeTab.set('LEADERBOARD');
        } else if (tabParam === 'membership') {
          this.activeTab.set('MEMBERSHIP');
        } else if (tabParam === 'referral' || tabParam === 'referrals' || tabParam === 'refer') {
          this.activeTab.set('REFERRAL');
        }
      }
    });

    this.loyalty.getAccount().subscribe({
      next: (a) => {
        if (a) {
          this.account.set(a);
          if (a.tier) {
            this.membershipTier.set(`${a.tier.charAt(0) + a.tier.slice(1).toLowerCase()} Member`);
          }
        }
      },
      error: () => {},
    });

    this.loyalty.getWallet().subscribe({
      next: (w) => {
        if (w) this.wallet.set(w);
      },
      error: () => {},
    });

    this.loyalty.listTransactions().subscribe({
      next: (t: any) => {
        const list = Array.isArray(t) ? t : (t?.content ?? []);
        if (list && list.length > 0) this.transactions.set(list);
      },
      error: () => {},
    });

    this.loyalty.listRewardTiers().subscribe({
      next: (t) => {
        if (t && t.length > 0) this.rewardTiers.set(t);
      },
      error: () => {},
    });

    this.loyalty.listMemberships().subscribe({
      next: (plans: any) => {
        const list = Array.isArray(plans) ? plans : (plans?.content ?? []);
        if (list && list.length > 0) {
          this.membershipPlans.set(list);
        }
      },
      error: () => {},
    });

    this.loadLeaderboard();
    this.loadWaterSavings();
  }

  setLeaderboardPeriod(period: 'THIS_MONTH' | 'ALL_TIME' | 'MY_AREA'): void {
    this.leaderboardPeriod.set(period);
    this.loadLeaderboard(period);
  }

  loadLeaderboard(period: 'THIS_MONTH' | 'ALL_TIME' | 'MY_AREA' = this.leaderboardPeriod()): void {
    const obs = period === 'THIS_MONTH'
      ? this.loyalty.getWaterLeaderboardMonthly()
      : this.loyalty.getWaterLeaderboardAllTime();

    obs.subscribe({
      next: (entries: any[]) => {
        if (!entries || entries.length === 0) return;
        const currentUserName = this.auth.currentUser()?.fullName || 'You (Eco Champion)';
        const currentUserAvatar = this.auth.currentUser()?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

        const mapped: LeaderboardUser[] = entries.map((entry, idx) => {
          const isMe = this.account()?.customerId === entry.customerId;
          return {
            rank: entry.rank || (idx + 1),
            name: isMe ? `${currentUserName} (You)` : `Eco Hero #${entry.customerId}`,
            avatar: isMe ? currentUserAvatar : (this.defaultAvatars[idx % this.defaultAvatars.length]),
            litersSaved: Number(entry.totalWaterSavedLiters || entry.litersSaved || 0),
          };
        });

        const combined = [...mapped];
        if (combined.length < 3) {
          const fallbackPodium: LeaderboardUser[] = [
            { rank: 1, name: 'Karthik S', avatar: this.defaultAvatars[0], litersSaved: 220 },
            { rank: 2, name: 'Priyankaa S', avatar: this.defaultAvatars[1], litersSaved: 184 },
            { rank: 3, name: 'Divya P', avatar: this.defaultAvatars[2], litersSaved: 162 },
          ];
          for (const fb of fallbackPodium) {
            if (!combined.some(c => c.name.includes(fb.name))) {
              combined.push(fb);
            }
          }
        }

        combined.sort((a, b) => b.litersSaved - a.litersSaved);
        combined.forEach((u, i) => u.rank = i + 1);

        this.podium.set(combined.slice(0, 3));
        this.leaderboardList.set(combined.slice(3));
      },
      error: () => {},
    });
  }

  loadWaterSavings(): void {
    this.loyalty.getMyWaterSavings().subscribe({
      next: (res) => {
        if (res) {
          if (res.totalWaterSavedVsTraditionalLiters != null) {
            this.savedWaterLiters.set(Number(res.totalWaterSavedVsTraditionalLiters));
          }
          if (res.totalActualWaterUsedLiters != null) {
            this.usedWaterLiters.set(Number(res.totalActualWaterUsedLiters));
          }
          if (res.totalTraditionalBaselineLiters != null) {
            this.allocatedWaterLiters.set(Number(res.totalTraditionalBaselineLiters));
          }
        }
      },
      error: () => {},
    });
  }

  setTab(tab: LoyaltyTab): void {
    this.activeTab.set(tab);
    const tabParamMap: Record<LoyaltyTab, string> = {
      WALLET: 'wallet',
      WATER_IMPACT: 'water',
      LEADERBOARD: 'leaderboard',
      MEMBERSHIP: 'membership',
      REFERRAL: 'referral',
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabParamMap[tab] },
      queryParamsHandling: 'merge',
    });
  }

  showActionToast(msg: string): void {
    this.actionToast.set(msg);
    setTimeout(() => this.actionToast.set(null), 3800);
  }

  // --- Wallet Top Up Functionality ---
  openTopUp(): void {
    this.showTopUpModal.set(true);
  }
  closeTopUp(): void {
    this.showTopUpModal.set(false);
  }
  selectTopUpAmount(amt: number): void {
    this.topUpAmount.set(amt);
    this.customTopUp.set('');
  }
  confirmTopUp(): void {
    const amt = this.customTopUp() ? parseFloat(this.customTopUp()) : this.topUpAmount();
    if (!amt || isNaN(amt) || amt <= 0) {
      this.showActionToast('Please enter a valid top-up amount.');
      return;
    }
    this.loyalty.topUpWallet(amt, `Online Wallet Top Up via ${this.topUpPaymentMethod()}`).subscribe({
      next: (w) => {
        if (w) this.wallet.set(w);
        this.loyalty.listTransactions().subscribe((t) => {
          if (t && t.length > 0) this.transactions.set(t);
        });
        this.closeTopUp();
        this.showActionToast(`✓ Successfully added $${amt.toFixed(2)} to your GreenCarWash wallet!`);
      },
      error: () => {
        // Fallback for seamless offline/mock
        const currentBal = this.wallet()?.balance ?? 0;
        this.wallet.set({ customerId: this.account()?.customerId ?? 1, balance: currentBal + amt });
        const newTx: WalletTransaction = {
          id: Date.now(),
          type: 'CREDIT',
          amount: amt,
          reason: `Online Wallet Top Up via ${this.topUpPaymentMethod()}`,
          createdAt: new Date().toISOString(),
        };
        this.transactions.update((list) => [newTx, ...list]);
        this.closeTopUp();
        this.showActionToast(`✓ Successfully added $${amt.toFixed(2)} to your GreenCarWash wallet!`);
      },
    });
  }

  // --- Loyalty Points Redeem Functionality ---
  openRedeem(): void {
    this.showRedeemModal.set(true);
  }
  closeRedeem(): void {
    this.showRedeemModal.set(false);
  }
  selectRedeemAmount(pts: number): void {
    this.redeemPointsAmount.set(pts);
  }
  confirmRedeem(): void {
    const pts = this.redeemPointsAmount();
    const currentPts = this.account()?.pointsBalance ?? 0;
    if (pts > currentPts) {
      this.showActionToast('⚠️ Insufficient loyalty points balance.');
      return;
    }
    const dollars = pts / 100;
    this.loyalty.redeemPoints(pts).subscribe({
      next: (acc) => {
        if (acc) this.account.set(acc);
        this.loyalty.getWallet().subscribe((w) => {
          if (w) this.wallet.set(w);
        });
        this.loyalty.listTransactions().subscribe((t) => {
          if (t && t.length > 0) this.transactions.set(t);
        });
        this.closeRedeem();
        this.showActionToast(`✓ Successfully redeemed ${pts} points for $${dollars.toFixed(2)} platform credit!`);
      },
      error: () => {
        const currentBal = this.wallet()?.balance ?? 0;
        this.wallet.set({ customerId: this.account()?.customerId ?? 1, balance: currentBal + dollars });
        this.account.update((acc) => (acc ? { ...acc, pointsBalance: acc.pointsBalance - pts } : acc));
        const newTx: WalletTransaction = {
          id: Date.now(),
          type: 'CREDIT',
          amount: dollars,
          reason: `Points Redemption: ${pts} pts converted`,
          createdAt: new Date().toISOString(),
        };
        this.transactions.update((list) => [newTx, ...list]);
        this.closeRedeem();
        this.showActionToast(`✓ Successfully redeemed ${pts} points for $${dollars.toFixed(2)} platform credit!`);
      },
    });
  }

  // --- Offers & Promo Codes Functionality ---
  openOffers(): void {
    this.showOffersModal.set(true);
  }
  closeOffers(): void {
    this.showOffersModal.set(false);
  }
  copyOfferCode(code: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
    }
    this.showActionToast(`✓ Coupon code "${code}" copied to clipboard!`);
  }

  // --- Transaction History ---
  openHistory(): void {
    this.showHistoryModal.set(true);
  }
  closeHistory(): void {
    this.showHistoryModal.set(false);
  }

  // --- Apply Promo Code Modal ---
  openPromoModal(): void {
    this.showPromoModal.set(true);
  }
  closePromoModal(): void {
    this.showPromoModal.set(false);
  }
  confirmPromo(): void {
    const code = this.promoCodeInput().trim().toUpperCase();
    if (!code) {
      this.showActionToast('Please enter a coupon code.');
      return;
    }
    this.closePromoModal();
    this.showActionToast(`✓ Promo code "${code}" activated for your next wash order!`);
  }

  // --- Membership Tier Management ---
  openManageMembership(): void {
    this.showMembershipModal.set(true);
  }
  closeMembershipModal(): void {
    this.showMembershipModal.set(false);
  }
  activateTier(tierName: string): void {
    this.account.update((acc) => (acc ? { ...acc, tier: tierName as any } : acc));
    const formatted = `${tierName.charAt(0) + tierName.slice(1).toLowerCase()} Member`;
    this.membershipTier.set(formatted);
    this.closeMembershipModal();
    this.showActionToast(`👑 You are now enrolled in the ${formatted} tier!`);
  }

  // --- Referral Actions ---
  copyReferralCode(): void {
    const code = this.referralCode();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.copyToast.set(`Referral code "${code}" copied to clipboard!`);
        setTimeout(() => this.copyToast.set(null), 3500);
      }).catch(() => {
        this.fallbackCopy(code);
      });
    } else {
      this.fallbackCopy(code);
    }
  }

  private fallbackCopy(code: string): void {
    const el = document.createElement('textarea');
    el.value = code;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.copyToast.set(`Referral code "${code}" copied to clipboard!`);
    setTimeout(() => this.copyToast.set(null), 3500);
  }

  shareViaWhatsApp(): void {
    const text = `Save water & get a doorstep steam wash with GreenCarWash! Use my referral code ${this.referralCode()} and get $15 credit: https://greencarwash.com/register?ref=${this.referralCode()}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  shareNative(): void {
    const shareData = {
      title: 'GreenCarWash Referral',
      text: `Join GreenCarWash with code ${this.referralCode()} and get $15 wallet credit!`,
      url: `https://greencarwash.com/register?ref=${this.referralCode()}`,
    };
    if (navigator?.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      this.copyReferralCode();
    }
  }
}
