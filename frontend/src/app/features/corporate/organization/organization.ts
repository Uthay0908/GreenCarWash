import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CorporateService } from '../../../core/services/corporate.service';
import { AuthService } from '../../../core/services/auth.service';
import { Organization } from '../../../shared/models';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './organization.html',
  styleUrl: './organization.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly corporate = inject(CorporateService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentOrg = signal<Organization | null>(null);
  readonly currentUser = this.auth.currentUser;
  readonly corporateRole = this.corporate.corporateRole;

  readonly loading = signal<boolean>(true);
  readonly isEditing = signal<boolean>(false);
  readonly saving = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    billingEmail: ['', [Validators.email, Validators.maxLength(200)]],
    billingAddress: ['', [Validators.maxLength(500)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.loadOrganization();
  }

  loadOrganization(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.corporate.getMyOrganization().subscribe({
      next: (org) => {
        this.loading.set(false);
        if (org) {
          this.currentOrg.set(org);
          this.populateForm(org);
        } else {
          this.currentOrg.set(null);
          this.isEditing.set(true);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Unable to load organization details. Please check your connection.');
      },
    });
  }

  private populateForm(org: Organization): void {
    this.form.patchValue({
      name: org.name,
      billingEmail: org.billingEmail ?? '',
      billingAddress: org.billingAddress ?? '',
    });
  }

  startEditing(): void {
    const org = this.currentOrg();
    if (org) {
      this.populateForm(org);
    }
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    const org = this.currentOrg();
    if (org) {
      this.populateForm(org);
      this.isEditing.set(false);
    }
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const val = this.form.getRawValue();
    const existing = this.currentOrg();

    const request$ = existing
      ? this.corporate.updateOrganization(existing.id, val)
      : this.corporate.createOrganization(val);

    request$.subscribe({
      next: (savedOrg) => {
        this.saving.set(false);
        this.currentOrg.set(savedOrg);
        this.isEditing.set(false);
        this.successMessage.set(
          existing
            ? 'Organization profile updated successfully.'
            : 'Corporate organization registered successfully!'
        );
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to save organization settings.';
        this.errorMessage.set(msg);
      },
    });
  }

  logout(): void {
    this.corporate.logout();
    this.router.navigate(['/login']);
  }
}
