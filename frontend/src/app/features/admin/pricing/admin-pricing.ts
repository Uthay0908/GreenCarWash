import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

type PricingTab = 'demand' | 'weather' | 'scarcity';

@Component({
  selector: 'app-admin-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pricing.html',
  styleUrl: './admin-pricing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPricing implements OnInit {
  private readonly admin = inject(AdminService);

  readonly currentTab = signal<PricingTab>('demand');
  readonly demandRules = signal<any[]>([]);
  readonly weatherRules = signal<any[]>([]);
  readonly scarcityRules = signal<any[]>([]);
  readonly dynamicPricingEnabled = signal<boolean>(true);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // New Rule Modal
  readonly showModal = signal<boolean>(false);
  ruleName = '';
  demandLevel = 'HIGH';
  minActiveBookings = 10;
  weatherCondition = 'RAIN';
  maxAvailableWashers = 2;
  multiplier = 1.25;

  ngOnInit(): void {
    this.loadData();
    this.loadMasterStatus();
  }

  setTab(tab: PricingTab): void {
    this.currentTab.set(tab);
  }

  loadMasterStatus(): void {
    this.admin.getDynamicPricingMasterStatus().subscribe({
      next: (res) => this.dynamicPricingEnabled.set(res?.dynamicPricingEnabled ?? true),
      error: () => this.dynamicPricingEnabled.set(true),
    });
  }

  toggleMasterDynamicPricing(): void {
    const newState = !this.dynamicPricingEnabled();
    this.admin.toggleDynamicPricingMaster(newState).subscribe({
      next: (res) => {
        this.dynamicPricingEnabled.set(res.dynamicPricingEnabled);
        this.showToast(
          res.dynamicPricingEnabled
            ? 'Dynamic Pricing is now ACTIVE. Surge rules will apply.'
            : 'Normal Pricing is now ACTIVE. Flat base package pricing will apply (surge bypassed).'
        );
      },
      error: (err) => this.showToast('Failed to toggle pricing mode: ' + (err?.error?.message || err.message)),
    });
  }

  loadData(): void {
    this.loading.set(true);

    this.admin.listDemandPricingRules().subscribe({
      next: (page) => this.demandRules.set(page?.content || []),
      error: () => this.demandRules.set([]),
    });

    this.admin.listWeatherPricingRules().subscribe({
      next: (page) => this.weatherRules.set(page?.content || []),
      error: () => this.weatherRules.set([]),
    });

    this.admin.listScarcityPricingRules().subscribe({
      next: (page) => {
        this.scarcityRules.set(page?.content || []);
        this.loading.set(false);
      },
      error: () => {
        this.scarcityRules.set([]);
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.ruleName = '';
    this.demandLevel = 'HIGH';
    this.weatherCondition = 'RAIN';
    this.maxAvailableWashers = 2;
    this.multiplier = 1.25;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitRule(): void {
    const tab = this.currentTab();
    if (tab === 'demand') {
      this.admin
        .createDemandPricingRule({
          name: this.ruleName || `${this.demandLevel} Demand Surge`,
          demandLevel: this.demandLevel,
          multiplier: this.multiplier,
          active: true,
        })
        .subscribe({
          next: () => {
            this.showToast('Demand pricing rule created successfully.');
            this.closeModal();
            this.loadData();
          },
          error: (err) => this.showToast('Failed to create demand rule: ' + (err?.error?.message || err.message)),
        });
    } else if (tab === 'weather') {
      this.admin
        .createWeatherPricingRule({
          weatherCondition: this.weatherCondition,
          multiplier: this.multiplier,
          active: true,
        })
        .subscribe({
          next: () => {
            this.showToast('Weather pricing rule created successfully.');
            this.closeModal();
            this.loadData();
          },
          error: (err) => this.showToast('Failed to create weather rule: ' + (err?.error?.message || err.message)),
        });
    } else {
      this.admin
        .createScarcityPricingRule({
          minAvailableWashers: 0,
          maxAvailableWashers: this.maxAvailableWashers,
          multiplier: this.multiplier,
          active: true,
        })
        .subscribe({
          next: () => {
            this.showToast('Scarcity pricing rule created successfully.');
            this.closeModal();
            this.loadData();
          },
          error: (err) => this.showToast('Failed to create scarcity rule: ' + (err?.error?.message || err.message)),
        });
    }
  }

  toggleDemandActive(rule: any): void {
    const action$ = rule.active
      ? this.admin.deactivateDemandPricingRule(rule.id)
      : this.admin.activateDemandPricingRule(rule.id);

    action$.subscribe({
      next: () => {
        this.showToast(`Demand rule #${rule.id} ${rule.active ? 'deactivated' : 'activated'}.`);
        this.loadData();
      },
      error: () => this.showToast('Failed to toggle rule status.'),
    });
  }

  toggleWeatherActive(rule: any): void {
    const action$ = rule.active
      ? this.admin.deactivateWeatherPricingRule(rule.id)
      : this.admin.activateWeatherPricingRule(rule.id);

    action$.subscribe({
      next: () => {
        this.showToast(`Weather rule #${rule.id} ${rule.active ? 'deactivated' : 'activated'}.`);
        this.loadData();
      },
      error: () => this.showToast('Failed to toggle weather rule status.'),
    });
  }

  toggleScarcityActive(rule: any): void {
    const action$ = rule.active
      ? this.admin.deactivateScarcityPricingRule(rule.id)
      : this.admin.activateScarcityPricingRule(rule.id);

    action$.subscribe({
      next: () => {
        this.showToast(`Scarcity rule #${rule.id} ${rule.active ? 'deactivated' : 'activated'}.`);
        this.loadData();
      },
      error: () => this.showToast('Failed to toggle scarcity rule status.'),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
