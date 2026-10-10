import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { AuditRecord } from '../../../shared/models';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, PaginationComponent],
  templateUrl: './admin-audit-logs.html',
  styleUrl: './admin-audit-logs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAuditLogs implements OnInit {
  readonly auditLogs = signal<AuditRecord[]>([]);
  readonly loading = signal<boolean>(false);
  readonly selectedRecord = signal<AuditRecord | null>(null);

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalElements = signal<number>(0);

  searchQuery = '';
  selectedActionFilter = 'ALL';

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page: number = this.currentPage(), size: number = this.pageSize()): void {
    this.loading.set(true);
    this.currentPage.set(page);
    this.pageSize.set(size);

    this.admin.listAuditRecords(page - 1, size).subscribe({
      next: (pg) => {
        this.auditLogs.set(pg?.content || []);
        this.totalElements.set(pg?.totalElements || (pg?.content || []).length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.auditLogs.set([]);
        this.totalElements.set(0);
      },
    });
  }

  onPageChange(page: number): void {
    this.loadLogs(page, this.pageSize());
  }

  onPageSizeChange(size: number): void {
    this.loadLogs(1, size);
  }

  filteredLogs(): AuditRecord[] {
    const q = this.searchQuery.toLowerCase().trim();
    const act = this.selectedActionFilter;

    return this.auditLogs().filter((r) => {
      const matchesSearch =
        !q ||
        r.aggregateType.toLowerCase().includes(q) ||
        r.aggregateId.toLowerCase().includes(q) ||
        r.eventType.toLowerCase().includes(q) ||
        (r.payloadJson && r.payloadJson.toLowerCase().includes(q));

      const matchesAction = act === 'ALL' || r.eventType === act;

      return matchesSearch && matchesAction;
    });
  }

  viewDetails(r: AuditRecord): void {
    this.selectedRecord.set(r);
  }

  closeDetails(): void {
    this.selectedRecord.set(null);
  }
}
