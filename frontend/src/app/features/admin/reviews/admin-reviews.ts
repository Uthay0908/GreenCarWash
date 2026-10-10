import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { Review } from '../../../shared/models';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, StarRating, DatePipe, PaginationComponent],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviews implements OnInit {
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(page: number = this.currentPage(), size: number = this.pageSize()): void {
    this.loading.set(true);
    this.currentPage.set(page);
    this.pageSize.set(size);

    this.admin.listReviews(page - 1, size).subscribe({
      next: (r: any) => {
        if (r && Array.isArray(r.content)) {
          this.reviews.set(r.content);
          this.totalElements.set(r.totalElements ?? r.content.length);
        } else if (Array.isArray(r)) {
          this.reviews.set(r);
          this.totalElements.set(r.length);
        } else {
          this.reviews.set([]);
          this.totalElements.set(0);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.reviews.set([]);
        this.totalElements.set(0);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadReviews(page, this.pageSize());
  }

  onPageSizeChange(size: number): void {
    this.loadReviews(1, size);
  }

  toggleModeration(r: Review): void {
    const newStatus = r.moderationStatus === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    const isVisible = newStatus === 'VISIBLE';

    this.admin.moderateReview(r.id, isVisible).subscribe({
      next: () => {
        this.reviews.update((list) =>
          list.map((item) => (item.id === r.id ? { ...item, moderationStatus: newStatus } : item))
        );
        this.showToast(`Review #${r.id} visibility set to ${newStatus}.`);
      },
      error: () => this.showToast('Failed to update review moderation status.'),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
