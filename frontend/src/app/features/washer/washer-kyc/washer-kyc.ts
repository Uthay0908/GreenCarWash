import { ChangeDetectionStrategy, Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WasherService } from '../../../core/services/washer.service';
import { KycDocumentResponse, KycDocumentType, WasherProfile } from '../../../shared/models';

export interface RequiredDocDef {
  type: KycDocumentType;
  title: string;
  description: string;
  required: boolean;
}

@Component({
  selector: 'app-washer-kyc',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './washer-kyc.html',
  styleUrl: './washer-kyc.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherKyc implements OnInit {
  private readonly washerService = inject(WasherService);

  readonly loading = signal<boolean>(true);
  readonly submitting = signal<boolean>(false);
  readonly toastMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly washerProfile = signal<WasherProfile | null>(null);
  readonly uploadedDocuments = signal<KycDocumentResponse[]>([]);

  // Document Upload Form Modal
  readonly showUploadModal = signal<boolean>(false);
  readonly selectedDocType = signal<KycDocumentType>('NATIONAL_ID');
  readonly documentNumberInput = signal<string>('');
  readonly filePreviewUrl = signal<string | null>(null);
  readonly uploadError = signal<string | null>(null);

  // Document Viewer Modal
  readonly showViewModal = signal<boolean>(false);
  readonly viewingDocument = signal<KycDocumentResponse | null>(null);

  readonly requiredDocList: RequiredDocDef[] = [
    {
      type: 'NATIONAL_ID',
      title: 'Aadhaar / National Identity Card',
      description: 'Official government photo identification card for KYC verification.',
      required: true,
    },
    {
      type: 'DRIVING_LICENSE',
      title: 'Commercial Driving License',
      description: 'Valid driving license required for mobile van or on-site service dispatch.',
      required: true,
    },
    {
      type: 'PROOF_OF_ADDRESS',
      title: 'Proof of Residential Address',
      description: 'Recent electricity, water bill, or registered rental agreement.',
      required: false,
    },
    {
      type: 'BACKGROUND_CHECK',
      title: 'Police Clearance / Background Verification',
      description: 'Police certificate certifying background clearance for customer safety.',
      required: true,
    },
    {
      type: 'VEHICLE_INSURANCE',
      title: 'Equipment & Vehicle Insurance',
      description: 'Insurance certificate covering equipment and mobile dispatch kit.',
      required: false,
    },
  ];

  ngOnInit(): void {
    this.loadKycData();
  }

  loadKycData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      profile: this.washerService.getMyProfile().pipe(catchError(() => of(null))),
      docs: this.washerService.getMyKycDocuments().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ profile, docs }) => {
        this.loading.set(false);
        this.washerProfile.set(profile);
        this.uploadedDocuments.set(docs || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.message || 'Failed to retrieve KYC records.');
      },
    });
  }

  getDocForType(type: KycDocumentType): KycDocumentResponse | undefined {
    return this.uploadedDocuments().find((d) => d.documentType === type);
  }

  openUploadModal(type?: KycDocumentType): void {
    if (type) {
      this.selectedDocType.set(type);
    }
    this.documentNumberInput.set('');
    this.filePreviewUrl.set(null);
    this.uploadError.set(null);
    this.showUploadModal.set(true);
  }

  closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.uploadError.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreviewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveDocumentUpload(): void {
    const docNumber = this.documentNumberInput().trim();
    const fileUrl = this.filePreviewUrl();

    if (!docNumber) {
      this.uploadError.set('Please provide a document identifier or reference number.');
      return;
    }
    if (!fileUrl) {
      this.uploadError.set('Please select or upload a document image/PDF.');
      return;
    }

    this.submitting.set(true);
    this.uploadError.set(null);

    this.washerService.uploadKycDocument({
      documentType: this.selectedDocType(),
      documentNumber: docNumber,
      fileUrl: fileUrl,
    }).subscribe({
      next: (doc) => {
        this.submitting.set(false);
        this.closeUploadModal();
        this.showToast(`Document uploaded successfully: ${doc.documentType}`);
        this.loadKycData();
      },
      error: (err) => {
        this.submitting.set(false);
        this.uploadError.set(err?.error?.message || err?.message || 'Failed to upload document to KYC system.');
      },
    });
  }

  submitForReview(): void {
    this.submitting.set(true);
    this.washerService.submitKycForReview().subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.showToast(res?.message || 'KYC submitted for compliance officer review!');
        this.loadKycData();
      },
      error: (err) => {
        this.submitting.set(false);
        this.showToast(err?.error?.message || err?.message || 'Could not submit KYC documents for review.');
      },
    });
  }

  openViewModal(doc: KycDocumentResponse): void {
    this.viewingDocument.set(doc);
    this.showViewModal.set(true);
  }

  closeViewModal(): void {
    this.showViewModal.set(false);
    this.viewingDocument.set(null);
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
