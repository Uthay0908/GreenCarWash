import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import {
  NotificationTemplate,
  NotificationTemplateRequest,
  BroadcastRequest,
} from '../../../shared/models';

type Tab = 'templates' | 'broadcast';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNotifications implements OnInit {
  readonly currentTab = signal<Tab>('templates');
  readonly templates = signal<NotificationTemplate[]>([]);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Template Modal
  readonly showTemplateModal = signal<boolean>(false);
  isEditingTemplate = false;
  editingTemplateId: number | null = null;
  formEventType = '';
  formChannel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' = 'EMAIL';
  formTitleTemplate = '';
  formBodyTemplate = '';

  // Broadcast Form
  broadcastTitle = '';
  broadcastBody = '';
  broadcastRecipientsRaw = '';
  broadcastChannel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' = 'PUSH';
  readonly isBroadcasting = signal<boolean>(false);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  setTab(tab: Tab): void {
    this.currentTab.set(tab);
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.admin.listNotificationTemplates().subscribe({
      next: (list) => {
        this.templates.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateTemplate(): void {
    this.isEditingTemplate = false;
    this.editingTemplateId = null;
    this.formEventType = '';
    this.formChannel = 'EMAIL';
    this.formTitleTemplate = '';
    this.formBodyTemplate = '';
    this.showTemplateModal.set(true);
  }

  openEditTemplate(tmpl: NotificationTemplate): void {
    this.isEditingTemplate = true;
    this.editingTemplateId = tmpl.id;
    this.formEventType = tmpl.eventType;
    this.formChannel = tmpl.channel;
    this.formTitleTemplate = tmpl.titleTemplate;
    this.formBodyTemplate = tmpl.bodyTemplate;
    this.showTemplateModal.set(true);
  }

  closeTemplateModal(): void {
    this.showTemplateModal.set(false);
  }

  saveTemplate(): void {
    if (!this.formEventType.trim() || !this.formTitleTemplate.trim() || !this.formBodyTemplate.trim()) {
      return;
    }

    const payload: NotificationTemplateRequest = {
      eventType: this.formEventType.trim().toUpperCase(),
      channel: this.formChannel,
      titleTemplate: this.formTitleTemplate.trim(),
      bodyTemplate: this.formBodyTemplate.trim(),
    };

    if (this.isEditingTemplate && this.editingTemplateId) {
      this.admin.updateNotificationTemplate(this.editingTemplateId, payload).subscribe({
        next: () => {
          this.showToast('Notification template updated successfully.');
          this.closeTemplateModal();
          this.loadTemplates();
        },
        error: () => this.showToast('Failed to update notification template.'),
      });
    } else {
      this.admin.createNotificationTemplate(payload).subscribe({
        next: () => {
          this.showToast('Notification template created successfully.');
          this.closeTemplateModal();
          this.loadTemplates();
        },
        error: () => this.showToast('Failed to create notification template.'),
      });
    }
  }

  sendBroadcast(): void {
    if (!this.broadcastTitle.trim() || !this.broadcastBody.trim()) {
      this.showToast('Title and Message Body are required.');
      return;
    }

    const recipientIds = this.broadcastRecipientsRaw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    if (recipientIds.length === 0) {
      this.showToast('Please enter at least one valid user ID (e.g. 100, 101, 700).');
      return;
    }

    this.isBroadcasting.set(true);
    const req: BroadcastRequest = {
      recipientUserIds: recipientIds,
      title: this.broadcastTitle.trim(),
      body: this.broadcastBody.trim(),
      channel: this.broadcastChannel,
    };

    this.admin.broadcastNotification(req).subscribe({
      next: () => {
        this.isBroadcasting.set(false);
        this.showToast(`Broadcast dispatched to ${recipientIds.length} users successfully!`);
        this.broadcastTitle = '';
        this.broadcastBody = '';
        this.broadcastRecipientsRaw = '';
      },
      error: () => {
        this.isBroadcasting.set(false);
        this.showToast('Broadcast failed to deliver. Check gateway / notification service.');
      },
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
