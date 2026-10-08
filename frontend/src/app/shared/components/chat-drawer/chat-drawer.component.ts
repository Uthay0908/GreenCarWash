import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingChatMessageDto } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-booking-chat-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-overlay" *ngIf="isOpen" (click)="closeDrawer()">
      <div class="chat-drawer" (click)="$event.stopPropagation()">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="header-info">
            <span class="chat-status-dot"></span>
            <div>
              <h4>Booking Live Operational Chat</h4>
              <p>Direct communication for Booking #{{ bookingId }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="closeDrawer()" title="Close chat">✕</button>
        </div>

        <!-- Quick Pre-set Operational Phrases -->
        <div class="quick-phrases">
          <button
            type="button"
            class="phrase-chip"
            *ngFor="let p of quickPhrases"
            (click)="selectPhrase(p)"
          >
            {{ p }}
          </button>
        </div>

        <!-- Messages Area -->
        <div class="chat-messages" #scrollContainer>
          <div *ngIf="loading()" class="chat-loading">
            <span>Loading message thread...</span>
          </div>

          <div *ngIf="!loading() && messages().length === 0" class="no-messages">
            <div class="msg-icon">💬</div>
            <p>
              No messages yet. Send a direct operational update regarding car location, keys, or
              service status.
            </p>
          </div>

          <div
            *ngFor="let m of messages()"
            class="message-row"
            [class.outgoing]="m.senderRole === userRole"
            [class.incoming]="m.senderRole !== userRole"
          >
            <div class="message-bubble">
              <span class="sender-tag">{{
                m.senderRole === userRole ? 'You' : m.senderName || m.senderRole
              }}</span>
              <p class="msg-text">{{ m.message }}</p>
              <span class="msg-time">{{
                m.createdAt ? (m.createdAt | date: 'shortTime') : 'Just now'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Chat Input Bar -->
        <form (ngSubmit)="sendMessage()" class="chat-input-bar">
          <input
            type="text"
            placeholder="Type operational update..."
            [(ngModel)]="newMessageText"
            name="msg"
            [disabled]="sending()"
            autocomplete="off"
          />
          <button type="submit" class="send-btn" [disabled]="sending() || !newMessageText.trim()">
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 1050;
        display: flex;
        justify-content: flex-end;
      }

      .chat-drawer {
        width: 100%;
        max-width: 440px;
        height: 100%;
        background: #09120c;
        border-left: 1px solid rgba(2, 132, 199, 0.2);
        display: flex;
        flex-direction: column;
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.7);
        animation: slideIn 0.25s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }

      .chat-header {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.02);
      }

      .header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chat-status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 10px #10b981;
      }

      .header-info h4 {
        margin: 0;
        color: #f8fafc;
        font-size: 0.98rem;
        font-weight: 600;
      }

      .header-info p {
        margin: 2px 0 0 0;
        color: #94a3b8;
        font-size: 0.75rem;
      }

      .close-btn {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 4px 8px;
      }

      .quick-phrases {
        display: flex;
        gap: 6px;
        padding: 10px 16px;
        overflow-x: auto;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.01);
      }

      .phrase-chip {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        font-size: 0.72rem;
        padding: 5px 10px;
        border-radius: 999px;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s;
      }

      .phrase-chip:hover {
        background: rgba(2, 132, 199, 0.15);
        color: #34d399;
        border-color: rgba(2, 132, 199, 0.3);
      }

      .chat-messages {
        flex: 1;
        padding: 18px 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .no-messages {
        margin: auto;
        text-align: center;
        padding: 20px;
        color: #64748b;
        font-size: 0.82rem;
      }

      .msg-icon {
        font-size: 2rem;
        margin-bottom: 8px;
      }

      .message-row {
        display: flex;
        width: 100%;
      }

      .message-row.outgoing {
        justify-content: flex-end;
      }

      .message-row.incoming {
        justify-content: flex-start;
      }

      .message-bubble {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;
        line-height: 1.4;
      }

      .message-row.outgoing .message-bubble {
        background: linear-gradient(135deg, #0369a1 0%, #047857 100%);
        color: #ffffff;
        border-bottom-right-radius: 3px;
      }

      .message-row.incoming .message-bubble {
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #f1f5f9;
        border-bottom-left-radius: 3px;
      }

      .sender-tag {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 3px;
        color: rgba(255, 255, 255, 0.8);
      }

      .message-row.incoming .sender-tag {
        color: #38bdf8;
      }

      .msg-text {
        margin: 0;
        word-break: break-word;
      }

      .msg-time {
        font-size: 0.65rem;
        align-self: flex-end;
        margin-top: 4px;
        opacity: 0.7;
      }

      .chat-input-bar {
        padding: 14px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        gap: 10px;
        background: rgba(255, 255, 255, 0.02);
      }

      .chat-input-bar input {
        flex: 1;
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        color: #f1f5f9;
        font-size: 0.85rem;
      }

      .chat-input-bar input:focus {
        outline: none;
        border-color: #10b981;
      }

      .send-btn {
        padding: 0 18px;
        background: #10b981;
        color: #060d09;
        border: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background 0.15s;
      }

      .send-btn:hover:not(:disabled) {
        background: #34d399;
      }

      .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .chat-loading {
        text-align: center;
        padding: 20px;
        color: #94a3b8;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class BookingChatDrawerComponent implements OnInit, OnChanges, OnDestroy {
  private bookingService = inject(BookingService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private pollSubscription?: Subscription;

  @Input() bookingId: number = 0;
  @Input() userRole: 'CUSTOMER' | 'WASHER' = 'CUSTOMER';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  messages = signal<BookingChatMessageDto[]>([]);
  loading = signal<boolean>(false);
  sending = signal<boolean>(false);
  newMessageText: string = '';

  quickPhrases: string[] = [];

  ngOnInit(): void {
    this.setupQuickPhrases();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen && this.bookingId) {
        this.loadMessages();
        this.startPolling();
      } else {
        this.stopPolling();
      }
    }
    if (changes['bookingId'] && this.isOpen && this.bookingId) {
      this.loadMessages();
    }
    if (changes['userRole']) {
      this.setupQuickPhrases();
    }
  }

  setupQuickPhrases(): void {
    if (this.userRole === 'CUSTOMER') {
      this.quickPhrases = [
        'Vehicle is parked in Bay 3B',
        'Gate access code is #4829',
        'Keys are with front desk',
        'Please focus on the wheels',
        'Thank you so much!',
      ];
    } else {
      this.quickPhrases = [
        'I have arrived at your vehicle',
        'Pre-wash inspection complete',
        'Starting high-pressure eco steam',
        'Finishing up interior detailing',
        'Wash completed! Photos uploaded',
      ];
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.scrollContainer?.nativeElement) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 60);
  }

  loadMessages(silent = false): void {
    if (!silent) {
      this.loading.set(true);
    }
    this.bookingService.getChatMessages(this.bookingId).subscribe({
      next: (msgs) => {
        const prevCount = this.messages().length;
        this.messages.set(msgs || []);
        this.loading.set(false);
        if (!silent || (msgs && msgs.length > prevCount)) {
          this.scrollToBottom();
        }
      },
      error: () => {
        if (!silent) {
          this.messages.set([]);
          this.loading.set(false);
        }
      },
    });
  }

  startPolling(): void {
    this.stopPolling();
    this.pollSubscription = timer(3000, 5000).subscribe(() => {
      if (this.isOpen && this.bookingId && !this.sending()) {
        this.loadMessages(true);
      }
    });
  }

  stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = undefined;
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  selectPhrase(phrase: string): void {
    this.newMessageText = phrase;
  }

  sendMessage(): void {
    if (!this.newMessageText.trim()) return;

    const text = this.newMessageText.trim();
    this.sending.set(true);

    const currentUser = this.authService.currentUser();
    const resolvedName = [currentUser?.firstName, currentUser?.lastName]
      .filter(Boolean)
      .join(' ') || (this.userRole === 'CUSTOMER' ? 'Customer' : 'Washer');

    this.bookingService
      .sendChatMessage(this.bookingId, {
        message: text,
        senderRole: this.userRole,
        senderId: this.authService.getUserId() ?? undefined,
        senderName: resolvedName,
      })
      .subscribe({
        next: (sent) => {
          this.messages.update((prev) => [...prev, sent]);
          this.newMessageText = '';
          this.sending.set(false);
          this.scrollToBottom();
        },
        error: (err) => {
          this.sending.set(false);
          const msg = err?.error?.message || 'Failed to deliver message. Please retry.';
          this.toast.error(msg);
        },
      });
  }

  closeDrawer(): void {
    this.close.emit();
  }
}
