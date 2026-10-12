import { ChangeDetectionStrategy, Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WasherService } from '../../../core/services/washer.service';
import { WasherNotification } from '../../../shared/models';

export type NotificationTab = 'ALL' | 'BOOKING' | 'PAYMENT' | 'SERVICE';

@Component({
  selector: 'app-washer-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './washer-notifications.html',
  styleUrl: './washer-notifications.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherNotifications implements OnInit {
  private readonly washerService = inject(WasherService);

  readonly loading = signal<boolean>(true);
  readonly actionInProgress = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly activeTab = signal<NotificationTab>('ALL');
  readonly notifications = signal<WasherNotification[]>([]);
  readonly unreadCount = signal<number>(0);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      list: this.washerService.getMyNotifications(0, 50).pipe(catchError(() => of({ content: [], totalElements: 0 }))),
      unread: this.washerService.getUnreadNotificationCount().pipe(catchError(() => of({ unreadCount: 0 }))),
    }).subscribe({
      next: ({ list, unread }) => {
        this.loading.set(false);
        this.notifications.set(list?.content || []);
        this.unreadCount.set(unread?.unreadCount || 0);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Failed to load notifications.');
      },
    });
  }

  readonly filteredNotifications = computed(() => {
    const tab = this.activeTab();
    const list = this.notifications();

    if (tab === 'ALL') return list;

    return list.filter((n) => {
      const type = (n.eventType || '').toUpperCase();
      const title = (n.title || '').toUpperCase();
      const body = (n.body || '').toUpperCase();

      if (tab === 'BOOKING') {
        return type.includes('BOOKING') || type.includes('ASSIGN') || title.includes('BOOKING') || title.includes('ASSIGN');
      }
      if (tab === 'PAYMENT') {
        return type.includes('PAY') || type.includes('CHARGE') || type.includes('REFUND') || title.includes('PAYMENT');
      }
      if (tab === 'SERVICE') {
        return type.includes('SERVICE') || type.includes('ADDON') || type.includes('CHECKLIST') || body.includes('SERVICE');
      }
      return true;
    });
  });

  setTab(tab: NotificationTab): void {
    this.activeTab.set(tab);
  }

  markAsRead(item: WasherNotification, event?: Event): void {
    if (event) event.stopPropagation();
    if (item.read) return;

    this.washerService.markNotificationRead(item.id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === item.id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
        );
        this.unreadCount.update((cnt) => Math.max(0, cnt - 1));
        this.showToast('Notification marked as read.');
      },
      error: () => {
        this.showToast('Could not mark notification as read.');
      },
    });
  }

  markAllAsRead(): void {
    const unreadItems = this.notifications().filter((n) => !n.read);
    if (unreadItems.length === 0) {
      this.showToast('All notifications are already read.');
      return;
    }

    this.actionInProgress.set(true);
    const markRequests = unreadItems.map((n) =>
      this.washerService.markNotificationRead(n.id).pipe(catchError(() => of(null)))
    );

    forkJoin(markRequests).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
        this.unreadCount.set(0);
        this.showToast('All notifications marked as read.');
      },
      error: () => {
        this.actionInProgress.set(false);
        this.showToast('Finished marking notifications as read.');
      },
    });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3000);
  }
}
