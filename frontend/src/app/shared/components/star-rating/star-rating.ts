import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRating {
  readonly rating = input(0);
  readonly readonly = input(false);
  readonly ratingChange = output<number>();

  readonly stars = computed(() => [1, 2, 3, 4, 5]);

  select(value: number): void {
    if (this.readonly()) return;
    this.ratingChange.emit(value);
  }
}
