import { ChangeDetectionStrategy, Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { SystemConfigEntry } from '../../../shared/models';

@Component({
  selector: 'app-admin-system-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-system-config.html',
  styleUrl: './admin-system-config.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSystemConfig implements OnInit {
  readonly entries = signal<SystemConfigEntry[]>([]);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);

  // Edit / Add modal
  readonly showModal = signal<boolean>(false);
  isEditing = false;
  editingId: number | null = null;
  configKey = '';
  configValue = '';
  configDescription = '';

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs(): void {
    this.loading.set(true);
    this.admin.listSystemConfigs().subscribe({
      next: (list) => {
        this.entries.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.configKey = '';
    this.configValue = '';
    this.configDescription = '';
    this.showModal.set(true);
  }

  openEditModal(entry: SystemConfigEntry): void {
    this.isEditing = true;
    this.editingId = entry.id;
    this.configKey = entry.key;
    this.configValue = entry.value;
    this.configDescription = entry.description;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveConfig(): void {
    if (!this.configKey.trim() || !this.configValue.trim()) return;

    const payload = {
      key: this.configKey.trim(),
      value: this.configValue.trim(),
      description: this.configDescription.trim(),
    };

    if (this.isEditing && this.editingId != null) {
      this.admin.updateSystemConfig(this.editingId, payload).subscribe({
        next: () => {
          this.showToast(`Configuration '${this.configKey}' successfully updated.`);
          this.closeModal();
          this.loadConfigs();
        },
        error: () => this.showToast('Failed to update configuration.'),
      });
    } else {
      this.admin.createSystemConfig(payload).subscribe({
        next: () => {
          this.showToast(`Configuration '${this.configKey}' successfully created.`);
          this.closeModal();
          this.loadConfigs();
        },
        error: () => this.showToast('Failed to create configuration.'),
      });
    }
  }

  deleteConfig(entry: SystemConfigEntry): void {
    if (!confirm(`Are you sure you want to delete config key '${entry.key}'?`)) return;

    this.admin.deleteSystemConfig(entry.id).subscribe({
      next: () => {
        this.showToast(`Configuration '${entry.key}' deleted.`);
        this.loadConfigs();
      },
      error: () => this.showToast('Failed to delete configuration.'),
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
