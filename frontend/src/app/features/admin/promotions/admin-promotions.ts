import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DiscountType, Promotion, PromotionRequest } from '../../../shared/models';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './admin-promotions.html',
  styleUrl: './admin-promotions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPromotions implements OnInit {
  readonly promotions = signal<Promotion[]>([]);
  readonly showModal = signal<boolean>(false);

  // Form
  code = '';
  description = '';
  discountType: DiscountType = 'PERCENTAGE';
  discountValue = 15;
  minBookingAmount = 25;
  maxDiscountAmount = 15;
  usageLimit = 500;
  validFrom = new Date().toISOString().slice(0, 10);
  validTo = '2027-12-31';

  readonly toastMessage = signal<string | null>(null);

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.admin.listPromotions().subscribe((promos) => {
      this.promotions.set(promos);
    });
  }

  openCreateModal(): void {
    this.code = 'SAVE' + Math.floor(10 + Math.random() * 90);
    this.description = 'Special promotional discount';
    this.discountType = 'PERCENTAGE';
    this.discountValue = 20;
    this.minBookingAmount = 25;
    this.maxDiscountAmount = 20;
    this.usageLimit = 500;
    this.validFrom = new Date().toISOString().slice(0, 10);
    this.validTo = '2027-12-31';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  savePromotion(): void {
    const fromIso = this.validFrom.includes('T') ? this.validFrom : `${this.validFrom}T00:00:00Z`;
    const toIso = this.validTo.includes('T') ? this.validTo : `${this.validTo}T23:59:59Z`;

    const req: PromotionRequest = {
      code: this.code.trim().toUpperCase(),
      description: this.description,
      discountType: this.discountType,
      discountValue: this.discountValue,
      minBookingAmount: this.minBookingAmount,
      maxDiscountAmount: this.maxDiscountAmount,
      usageLimit: this.usageLimit,
      validFrom: fromIso,
      validTo: toIso,
      startsAt: fromIso,
      expiresAt: toIso,
    };

    this.admin.createPromotion(req).subscribe({
      next: () => {
        this.showToast(`Promotion code ${req.code} created.`);
        this.closeModal();
        this.loadPromotions();
      },
      error: (err) => this.showToast('Failed to create promotion: ' + err.message),
    });
  }

  toggleActive(p: Promotion): void {
    const newStatus = !p.active;
    this.admin.togglePromotionStatus(p.id, newStatus).subscribe(() => {
      this.showToast(`Coupon ${p.code} ${newStatus ? 'activated' : 'deactivated'}.`);
      this.loadPromotions();
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
