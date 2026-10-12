import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleType } from '../../../shared/models';
import { CustomerCard, CustomerButton } from '../../customer/design-system';

export interface VehiclePhotoPreset {
  label: string;
  type: VehicleType;
  url: string;
}

const PHOTO_PRESETS: VehiclePhotoPreset[] = [
  {
    label: 'White Compact SUV',
    type: 'SUV',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sedan Metallic Gray',
    type: 'SEDAN',
    url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80',
  },
  {
    label: 'Modern Hatchback Red',
    type: 'HATCHBACK',
    url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=500&auto=format&fit=crop&q=80',
  },
  {
    label: 'Urban Motorcycle Dark',
    type: 'MOTORCYCLE',
    url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=80',
  },
];

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CustomerCard, CustomerButton],
  templateUrl: './vehicle-form.html',
  styleUrl: './vehicle-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vehicleService = inject(VehicleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly vehicleTypes: VehicleType[] = ['HATCHBACK', 'SEDAN', 'SUV', 'MUV', 'TRUCK', 'MOTORCYCLE'];
  readonly presets = PHOTO_PRESETS;

  readonly editingId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly uploadedImage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    make: ['', [Validators.required, Validators.maxLength(60)]],
    model: ['', [Validators.required, Validators.maxLength(60)]],
    color: ['', [Validators.maxLength(30)]],
    licensePlate: ['', [Validators.required, Validators.maxLength(20)]],
    vehicleType: ['SEDAN' as VehicleType, [Validators.required]],
    imageUrl: ['', [Validators.maxLength(10000000)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editingId.set(id);
      this.vehicleService.getById(id).subscribe({
        next: (v) => {
          if (v) {
            this.form.patchValue({
              make: v.make,
              model: v.model,
              color: v.color || '',
              licensePlate: v.licensePlate,
              vehicleType: v.vehicleType,
              imageUrl: v.imageUrl || '',
              notes: v.notes || '',
            });
            if (v.imageUrl) {
              this.uploadedImage.set(v.imageUrl);
            }
          }
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load vehicle details.');
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Please select an image file (PNG, JPG, WEBP).');
        return;
      }
      this.errorMessage.set(null);

      const reader = new FileReader();
      reader.onload = () => {
        const rawUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          // Scale to max 900px maintaining aspect ratio
          const maxDim = 900;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            this.uploadedImage.set(compressed);
            this.form.patchValue({ imageUrl: compressed });
          } else {
            this.uploadedImage.set(rawUrl);
            this.form.patchValue({ imageUrl: rawUrl });
          }
        };
        img.onerror = () => {
          this.uploadedImage.set(rawUrl);
          this.form.patchValue({ imageUrl: rawUrl });
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  removeUploadedPhoto(): void {
    this.uploadedImage.set(null);
    this.form.patchValue({ imageUrl: '' });
  }

  selectPreset(preset: VehiclePhotoPreset): void {
    this.uploadedImage.set(preset.url);
    this.form.patchValue({
      imageUrl: preset.url,
      vehicleType: preset.type,
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload = {
      make: raw.make.trim(),
      model: raw.model.trim(),
      color: raw.color.trim() || undefined,
      licensePlate: raw.licensePlate.trim().toUpperCase(),
      vehicleType: raw.vehicleType,
      imageUrl: raw.imageUrl.trim() || undefined,
      notes: raw.notes.trim() || undefined,
    };

    const id = this.editingId();
    const request$ = id
      ? this.vehicleService.update(id, payload)
      : this.vehicleService.add(payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/vehicles';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to save vehicle. Please check inputs.';
        this.errorMessage.set(msg);
      },
    });
  }
}
