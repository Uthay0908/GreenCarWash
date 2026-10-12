import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NotificationService, NotificationItem } from '../../../core/services/notification.service';

@Component({
  selector: 'app-corporate-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './corporate-notifications.html',
  styleUrl: './corporate-notifications.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateNotifications implements OnInit {
  private readonly notificationService = inject(NotificationService);

  readonly notifications = signal<NotificationItem[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly filter = signal<'ALL' | 'UNREAD'>('ALL');

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.read).length
  );

  readonly filteredNotifications = computed(() => {
    const list = this.notifications();
    if (this.filter() === 'UNREAD') {
      return list.filter((n) => !n.read);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set(null);

    this.notificationService.listMine(0, 50).subscribe({
      next: (list) => {
        this.notifications.set(list || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load corporate notifications from server.');
      },
    });
  }

  markRead(notification: NotificationItem): void {
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      },
      error: () => {},
    });
  }

  markAllAsRead(): void {
    const unread = this.notifications().filter((n) => !n.read);
    for (const n of unread) {
      this.markRead(n);
    }
  }

  getIconForEvent(eventType?: string): string {
    const type = (eventType || '').toUpperCase();
    if (type.includes('BOOKING')) return '📅';
    if (type.includes('WASHER')) return '🚗';
    if (type.includes('PAYMENT')) return '💳';
    if (type.includes('INVOICE')) return '📑';
    if (type.includes('SUPPORT')) return '💬';
    return '🔔';
  }
}
