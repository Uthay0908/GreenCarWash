import { ChangeDetectionStrategy, Component, computed, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WasherService } from '../../../core/services/washer.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { WashPackage } from '../../../shared/models';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface WasherJobItem {
  id: number;
  bookingRef: string;
  customerId?: number;
  vehicleId?: number;
  status: 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  rawStatus: string;
  packageTitle: string;
  customerInstructions: string;
  scheduledAt: string;
  formattedDate: string;
  totalAmount: number;
  payoutAmount: number;
  addOnsText: string;
  checklistTotal: number;
  checklistCompleted: number;
}

export type JobTab = 'ALL' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

@Component({
  selector: 'app-washer-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './washer-jobs.html',
  styleUrl: './washer-jobs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherJobs implements OnInit {
  private readonly washerService = inject(WasherService);
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly activeTab = signal<JobTab>('ONGOING');
  readonly searchQuery = signal<string>('');

  readonly allJobs = signal<WasherJobItem[]>([]);

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(6);

  private packageCatalog: Map<number, WashPackage> = new Map();

  ngOnInit(): void {
    this.catalogService.listPackages().pipe(catchError(() => of([]))).subscribe((pkgs) => {
      if (pkgs) {
        pkgs.forEach((p) => this.packageCatalog.set(p.id, p));
      }
      this.loadJobs();
    });
  }

  loadJobs(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.washerService.listMyBookings().subscribe({
      next: (bookings) => {
        this.loading.set(false);
        const mapped: WasherJobItem[] = (bookings || []).map((b: any) => {
          const pkg = b.packageId ? this.packageCatalog.get(b.packageId) : null;
          const pkgName = pkg?.name || 'Eco Wash Service';
          const addOns = b.addOns?.map((a: any) => a.addOnName).join(', ') || '';
          const total = Number(b.totalAmount || 0);
          const payout = Math.round(total * 0.7);

          const rawSt = String(b.status || 'ASSIGNED');
          let mappedStatus: 'ONGOING' | 'COMPLETED' | 'CANCELLED' = 'ONGOING';
          if (rawSt === 'COMPLETED') {
            mappedStatus = 'COMPLETED';
          } else if (rawSt === 'CANCELLED' || rawSt === 'FAILED') {
            mappedStatus = 'CANCELLED';
          }

          const checklist = b.checklist || [];
          const completedCount = checklist.filter((c: any) => c.completed).length;

          const dateStr = b.scheduledAt || b.createdAt;
          const formatted = dateStr ? new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Scheduled';

          return {
            id: b.id,
            bookingRef: `#GCW-${b.id}`,
            customerId: b.customerId,
            vehicleId: b.vehicleId,
            status: mappedStatus,
            rawStatus: rawSt,
            packageTitle: pkgName,
            customerInstructions: b.customerInstructions || 'No instructions provided',
            scheduledAt: dateStr,
            formattedDate: formatted,
            totalAmount: total,
            payoutAmount: payout,
            addOnsText: addOns,
            checklistTotal: checklist.length,
            checklistCompleted: completedCount,
          };
        });

        this.allJobs.set(mapped);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Failed to retrieve jobs from backend.');
      },
    });
  }

  readonly ongoingCount = computed(() => {
    return this.allJobs().filter((j) => j.status === 'ONGOING').length;
  });

  readonly completedCount = computed(() => {
    return this.allJobs().filter((j) => j.status === 'COMPLETED').length;
  });

  readonly cancelledCount = computed(() => {
    return this.allJobs().filter((j) => j.status === 'CANCELLED').length;
  });

  readonly filteredJobs = computed(() => {
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase().trim();

    return this.allJobs().filter((j) => {
      // Tab matching
      if (tab !== 'ALL' && j.status !== tab) {
        return false;
      }

      // Query matching
      if (!query) return true;
      return (
        j.bookingRef.toLowerCase().includes(query) ||
        j.packageTitle.toLowerCase().includes(query) ||
        j.customerInstructions.toLowerCase().includes(query)
      );
    });
  });

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredJobs().length / this.pageSize()));
  });

  readonly paginatedJobs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredJobs().slice(start, start + this.pageSize());
  });

  setTab(tab: JobTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openActiveJob(jobId?: number): void {
    if (jobId) {
      this.router.navigate(['/washer/active-job', jobId]);
    } else {
      this.router.navigate(['/washer/active-job']);
    }
  }
}
