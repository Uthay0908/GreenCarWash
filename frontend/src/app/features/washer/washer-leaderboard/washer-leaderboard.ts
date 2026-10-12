import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WasherService } from '../../../core/services/washer.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface WasherLeaderboardEntry {
  rank: number;
  washerProfileId: number;
  washerName?: string;
  averageRating: number;
  totalCompletedJobs: number;
  acceptanceRate: number;
  slaBreachRate: number;
  totalWaterSavedLiters: number;
  isCurrentWasher?: boolean;
}

@Component({
  selector: 'app-washer-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe],
  templateUrl: './washer-leaderboard.html',
  styleUrl: './washer-leaderboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherLeaderboard implements OnInit {
  private readonly washerService = inject(WasherService);

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly currentWasherProfileId = signal<number | null>(null);
  readonly currentWasherRank = signal<number | null>(null);
  readonly leaderboard = signal<WasherLeaderboardEntry[]>([]);

  readonly totalRankedWashers = signal<number>(0);

  ngOnInit(): void {
    this.loadLeaderboardData();
  }

  loadLeaderboardData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.washerService.getMyProfile().pipe(
      catchError(() => of(null))
    ).subscribe((profile) => {
      if (profile?.id) {
        this.currentWasherProfileId.set(profile.id);
      }

      this.washerService.getLeaderboard(50).subscribe({
        next: (rows) => {
          this.loading.set(false);
          const currentId = this.currentWasherProfileId();
          const mapped: WasherLeaderboardEntry[] = (rows || []).map((r: any, idx: number) => {
            const isMe = currentId != null && Number(r.washerProfileId) === currentId;
            if (isMe) {
              this.currentWasherRank.set(r.rank || idx + 1);
            }
            return {
              rank: r.rank || idx + 1,
              washerProfileId: r.washerProfileId,
              washerName: isMe ? (profile?.fullName || `Partner #${r.washerProfileId}`) : `Partner #${r.washerProfileId}`,
              averageRating: Number(r.averageRating) || 5.0,
              totalCompletedJobs: Number(r.totalCompletedJobs) || 0,
              acceptanceRate: Number(r.acceptanceRate) || 1.0,
              slaBreachRate: Number(r.slaBreachRate) || 0.0,
              totalWaterSavedLiters: Number(r.totalWaterSavedLiters) || 0,
              isCurrentWasher: isMe,
            };
          });

          this.leaderboard.set(mapped);
          this.totalRankedWashers.set(mapped.length);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || err?.message || 'Could not load leaderboard data from server.');
        },
      });
    });
  }
}
