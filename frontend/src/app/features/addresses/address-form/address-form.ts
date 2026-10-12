import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddressService } from '../../../core/services/address.service';
import { AddressRequest } from '../../../shared/models';
import { CustomerCard, CustomerButton } from '../../customer/design-system';

export interface AddressLabelPreset {
  label: string;
  icon: string;
}

const LABEL_PRESETS: AddressLabelPreset[] = [
  { label: 'Home', icon: '🏠' },
  { label: 'Office', icon: '🏢' },
  { label: 'Other', icon: '📍' },
];

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CustomerCard, CustomerButton],
  templateUrl: './address-form.html',
  styleUrl: './address-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly addressService = inject(AddressService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly labelPresets = LABEL_PRESETS;
  readonly selectedPreset = signal<string>('Home');

  readonly editingId = signal<number | null>(null);
  readonly submitting = signal(false);
  readonly detectingGps = signal(false);
  readonly gpsNotice = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    label: ['Home', [Validators.required, Validators.maxLength(40)]],
    line1: ['', [Validators.required, Validators.maxLength(200)]],
    line2: ['', [Validators.maxLength(200)]],
    city: ['Chennai', [Validators.required, Validators.maxLength(100)]],
    state: ['Tamil Nadu', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4,10}$/)]],
    country: ['India', [Validators.required, Validators.maxLength(100)]],
    latitude: [null as number | null],
    longitude: [null as number | null],
    accessInstructions: ['', [Validators.maxLength(500)]],
    parkingShadeNotes: ['', [Validators.maxLength(500)]],
    serviceable: [true],
    isDefault: [false],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editingId.set(id);
      this.addressService.getById(id).subscribe({
        next: (a) => {
          if (a) {
            this.form.patchValue({
              label: a.label || 'Home',
              line1: a.line1,
              line2: a.line2 || '',
              city: a.city,
              state: a.state,
              postalCode: a.postalCode,
              country: a.country || 'India',
              latitude: a.latitude ?? null,
              longitude: a.longitude ?? null,
              accessInstructions: a.accessInstructions || '',
              parkingShadeNotes: a.parkingShadeNotes || '',
              serviceable: a.serviceable ?? true,
              isDefault: a.isDefault ?? false,
            });
            this.selectedPreset.set(a.label || 'Other');
          }
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.message || 'Failed to load address details.');
        },
      });
    }
  }

  choosePreset(preset: AddressLabelPreset): void {
    this.selectedPreset.set(preset.label);
    this.form.patchValue({ label: preset.label });
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.gpsNotice.set('Geolocation is not supported by your browser.');
      return;
    }

    this.detectingGps.set(true);
    this.gpsNotice.set('Detecting your GPS coordinates…');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        this.form.patchValue({
          latitude: lat,
          longitude: lng,
        });

        this.gpsNotice.set(`GPS pinned (${lat}°N, ${lng}°E). Fetching street address…`);

        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(6000) }
          );
          if (resp.ok) {
            const data = await resp.json();
            const addr = data.address || {};

            const house = addr.house_number || addr.building || '';
            const road = addr.road || addr.pedestrian || addr.street || addr.residential || addr.neighbourhood || '';
            const suburb = addr.suburb || addr.neighbourhood || addr.subdistrict || '';
            const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Erode';
            const state = addr.state || 'Tamil Nadu';
            const rawPostcode = addr.postcode ? String(addr.postcode).replace(/\s+/g, '') : '';
            const country = addr.country || 'India';

            const line1Parts = [house, road].filter(Boolean);
            const line1 = line1Parts.length > 0 ? line1Parts.join(', ') : (suburb || 'Doorstep Location');
            const line2 = suburb && suburb !== line1 ? suburb : (data.display_name?.split(',')[1]?.trim() || '');

            this.form.patchValue({
              line1: line1.slice(0, 200),
              line2: line2.slice(0, 200),
              city: city.slice(0, 100),
              state: state.slice(0, 100),
              postalCode: rawPostcode || this.form.controls.postalCode.value || '638001',
              country: country.slice(0, 100),
              latitude: lat,
              longitude: lng,
            });

            this.gpsNotice.set(`✓ Complete address fetched: ${line1}, ${city}, ${state} (${lat}°N, ${lng}°E)`);
          } else {
            this.gpsNotice.set(`GPS Coordinates pinned: ${lat}°N, ${lng}°E. Please fill street number.`);
          }
        } catch {
          this.gpsNotice.set(`GPS Coordinates pinned: ${lat}°N, ${lng}°E. Please confirm address details.`);
        } finally {
          this.detectingGps.set(false);
        }
      },
      (err) => {
        this.detectingGps.set(false);
        this.gpsNotice.set(`GPS error: ${err.message}. You can manually enter your address.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload: AddressRequest = {
      label: raw.label.trim(),
      line1: raw.line1.trim(),
      line2: raw.line2.trim() || undefined,
      city: raw.city.trim(),
      state: raw.state.trim(),
      postalCode: raw.postalCode.trim(),
      country: raw.country.trim() || 'India',
      latitude: raw.latitude ?? undefined,
      longitude: raw.longitude ?? undefined,
      accessInstructions: raw.accessInstructions.trim() || undefined,
      parkingShadeNotes: raw.parkingShadeNotes.trim() || undefined,
      serviceable: raw.serviceable,
      isDefault: raw.isDefault,
    };

    const id = this.editingId();
    const request$ = id
      ? this.addressService.update(id, payload)
      : this.addressService.add(payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/addresses';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || err?.message || 'Failed to save address. Please check inputs.';
        this.errorMessage.set(msg);
      },
    });
  }
}
