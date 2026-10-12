import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WasherService } from '../../../core/services/washer.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface WasherReviewItem {
  id: number;
  bookingId: number;
  customerId: number;
  rating: number;
  comment: string;
  photoUrls?: string[];
  createdAt: string;
}

export interface WasherComplaintItem {
  id: number;
  bookingId: number;
  customerId: number;
  complaintType: string;
  description: string;
  evidenceUrls?: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  washerResponse?: string;
  resolutionDecision?: string;
  createdAt: string;
}

@Component({
  selector: 'app-washer-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './washer-reviews.html',
  styleUrl: './washer-reviews.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherReviews implements OnInit {
  private readonly washerService = inject(WasherService);

  readonly activeTab = signal<'REVIEWS' | 'COMPLAINTS'>('REVIEWS');
  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly washerProfileId = signal<number | null>(null);
  readonly reviews = signal<WasherReviewItem[]>([]);
  readonly complaints = signal<WasherComplaintItem[]>([]);

  // Review Summary
  readonly averageRating = signal<number>(5.0);
  readonly totalReviewsCount = signal<number>(0);

  // Washer Complaint Response Modal
  readonly respondingComplaint = signal<WasherComplaintItem | null>(null);
  readonly responseText = signal<string>('');
  readonly submittingResponse = signal<boolean>(false);

  ngOnInit(): void {
    this.loadProfileAndData();
  }

  loadProfileAndData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.washerService.getMyProfile().pipe(
      catchError(() => of(null))
    ).subscribe((profile) => {
      if (profile?.id) {
        this.washerProfileId.set(profile.id);
        if (profile.averageRating != null) {
          this.averageRating.set(profile.averageRating);
        }
        this.fetchReviews(profile.id);
        this.fetchComplaints();
      } else {
        this.loading.set(false);
        this.errorMessage.set('Could not load partner profile credentials.');
      }
    });
  }

  fetchReviews(profileId: number): void {
    this.washerService.getWasherReviews(profileId).pipe(
      catchError(() => of({ content: [] }))
    ).subscribe((res) => {
      this.loading.set(false);
      const list = Array.isArray(res) ? res : (res?.content || []);
      this.reviews.set(list);
      this.totalReviewsCount.set(list.length);
      if (list.length > 0) {
        const sum = list.reduce((acc: number, r: any) => acc + (r.rating || 5), 0);
        this.averageRating.set(Math.round((sum / list.length) * 10) / 10);
      }
    });
  }

  fetchComplaints(): void {
    this.washerService.getWasherComplaints().pipe(
      catchError(() => of({ content: [] }))
    ).subscribe((res) => {
      const list = Array.isArray(res) ? res : (res?.content || []);
      this.complaints.set(list);
    });
  }

  setTab(tab: 'REVIEWS' | 'COMPLAINTS'): void {
    this.activeTab.set(tab);
  }

  openResponseModal(complaint: WasherComplaintItem): void {
    this.respondingComplaint.set(complaint);
    this.responseText.set(complaint.washerResponse || '');
  }

  closeResponseModal(): void {
    this.respondingComplaint.set(null);
    this.responseText.set('');
  }

  submitResponse(): void {
    const complaint = this.respondingComplaint();
    const text = this.responseText().trim();
    if (!complaint || !text) return;

    this.submittingResponse.set(true);
    this.washerService.submitComplaintResponse(complaint.id, text).subscribe({
      next: () => {
        this.submittingResponse.set(false);
        this.closeResponseModal();
        this.showToast('✅ Response successfully recorded on complaint ticket.');
        this.fetchComplaints();
      },
      error: (err) => {
        this.submittingResponse.set(false);
        this.showToast(`⚠️ Could not submit response: ${err?.error?.message || err?.message || 'Server error'}`);
      },
    });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
