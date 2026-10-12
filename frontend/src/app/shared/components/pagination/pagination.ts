import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly currentPage = input<number>(0);
  readonly pageSize = input<number>(10);
  readonly totalElements = input<number>(0);
  readonly pageSizeOptions = input<number[]>([10, 20, 50]);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    const total = this.totalElements();
    return size > 0 ? Math.ceil(total / size) : 0;
  });

  readonly startItem = computed(() => {
    if (this.totalElements() === 0) return 0;
    return this.currentPage() * this.pageSize() + 1;
  });

  readonly endItem = computed(() => {
    const end = (this.currentPage() + 1) * this.pageSize();
    return Math.min(end, this.totalElements());
  });

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const visible: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) visible.push(i);
    } else {
      visible.push(0);
      let start = Math.max(1, current - 1);
      let end = Math.min(total - 2, current + 1);

      if (start > 1) visible.push(-1); // indicator for ellipsis
      for (let i = start; i <= end; i++) visible.push(i);
      if (end < total - 2) visible.push(-2); // indicator for ellipsis
      visible.push(total - 1);
    }
    return visible;
  });

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }

  onSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const val = Number(select.value);
    if (val && val !== this.pageSize()) {
      this.pageSizeChange.emit(val);
    }
  }
}
