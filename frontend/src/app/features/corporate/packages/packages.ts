import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { WashPackage, AddOn } from '../../../shared/models';

@Component({
  selector: 'app-corporate-packages',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporatePackages implements OnInit {
  private readonly catalog = inject(CatalogService);

  readonly packages = signal<WashPackage[]>([]);
  readonly addOns = signal<AddOn[]>([]);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly selectedCategory = signal<string>('ALL');

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.loading.set(true);
    this.error.set(null);

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 2) this.loading.set(false);
    };

    this.catalog.listPackages().subscribe({
      next: (pkgs) => {
        this.packages.set(pkgs || []);
        checkDone();
      },
      error: () => {
        this.error.set('Failed to load service packages from catalog service.');
        checkDone();
      },
    });

    this.catalog.listAddOns().subscribe({
      next: (addons) => {
        this.addOns.set(addons || []);
        checkDone();
      },
      error: () => {
        checkDone();
      },
    });
  }

  filterCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }
}
