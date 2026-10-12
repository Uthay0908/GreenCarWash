import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly contactMessage = signal<string>('');
  readonly toastMessage = signal<string | null>(null);

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  sendMessage(): void {
    if (!this.contactMessage().trim()) return;
    this.showToast('Thank you! Our doorstep wash specialist will call you shortly.');
    this.contactMessage.set('');
  }
}
