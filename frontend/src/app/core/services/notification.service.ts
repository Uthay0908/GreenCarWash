import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  id: number;
  recipientId?: number;
  title: string;
  message: string;
  body?: string;
  referenceId?: string;
  eventType: string;
  read: boolean;
  channel?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  id?: number;
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;

  private readonly _notifications = signal<NotificationItem[]>([]);
  readonly notifications = this._notifications.asReadonly();

  listMine(page = 0, size = 50): Observable<NotificationItem[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/notifications?page=${page}&size=${size}`).pipe(
      map((res) => {
        const raw = Array.isArray(res) ? res : (res?.content || []);
        return raw.map((item: any) => ({
          ...item,
          message: item.body || item.message || '',
          body: item.body || item.message || '',
        }));
      }),
      tap((list) => this._notifications.set(list))
    );
  }

  getUnreadCount(): Observable<{ count: number; unreadCount: number }> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/notifications/unread-count`).pipe(
      map((res) => {
        const c = res?.unreadCount ?? res?.count ?? 0;
        return { count: c, unreadCount: c };
      })
    );
  }

  markAsRead(id: number): Observable<NotificationItem> {
    return this.http.post<NotificationItem>(`${this.gatewayBaseUrl}/api/notifications/${id}/read`, {}).pipe(
      tap(() =>
        this._notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
      )
    );
  }

  getPreferences(): Observable<NotificationPreference> {
    return this.http.get<NotificationPreference>(`${this.gatewayBaseUrl}/api/notifications/preferences`);
  }

  updatePreferences(preferences: Partial<NotificationPreference>): Observable<NotificationPreference> {
    return this.http.put<NotificationPreference>(`${this.gatewayBaseUrl}/api/notifications/preferences`, preferences);
  }

  broadcast(request: { title: string; message: string; targetRole?: string }): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/notifications/admin/broadcast`, request);
  }

  listTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.gatewayBaseUrl}/api/notifications/admin/templates`);
  }

  createTemplate(request: any): Observable<any> {
    return this.http.post<any>(`${this.gatewayBaseUrl}/api/notifications/admin/templates`, request);
  }
}
