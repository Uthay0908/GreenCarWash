import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaderboardEntry } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  getWaterSavingLeaderboard(limit = 20): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.gatewayBaseUrl}/api/leaderboard/water-saved/all-time?limit=${limit}`);
  }

  getMonthlyWaterSavingLeaderboard(limit = 20): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.gatewayBaseUrl}/api/leaderboard/water-saved/monthly?limit=${limit}`);
  }
}
