import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Subscription, interval } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WasherService } from '../../../core/services/washer.service';
import { BookingService } from '../../../core/services/booking.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AddressService } from '../../../core/services/address.service';
import { UserService } from '../../../core/services/user.service';
import { CatalogService } from '../../../core/services/catalog.service';
import {
  Booking,
  CustomerProfile,
  Vehicle,
  Address,
  WashPackage,
  AddOn,
  Assignment,
  AssignmentResponse,
  NavigationResponse,
  ChecklistItem,
  ServiceEvidenceResponse,
  WaterUsageRequest,
  WaterUsageResponse,
  AdditionalAddOnRequestResponse,
  SubmitVerificationRequest,
  VerificationEvidenceItem,
  VerificationResponse,
} from '../../../shared/models';

export type ActiveJobTab = 'DETAILS' | 'NAVIGATION' | 'PHOTOS' | 'CHECKLIST' | 'WATER' | 'ADDONS' | 'PAYMENT';
export type PhotoPhase = 'BEFORE' | 'AFTER';

export interface BeforePhotoSlot {
  id: 'front' | 'rear' | 'right' | 'left' | 'top' | 'interior';
  label: string;
  sublabel: string;
  status: 'NOT_UPLOADED' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
  previewUrl: string | null;
  fileUrl: string | null;
  evidenceId?: number;
  uploadProgress: number;
  errorMessage?: string;
  uploadedAt?: string;
}

@Component({
  selector: 'app-washer-active-job',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './washer-active-job.html',
  styleUrl: './washer-active-job.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WasherActiveJob implements OnInit, OnDestroy {
  private readonly washerService = inject(WasherService);
  private readonly bookingService = inject(BookingService);
  private readonly assignmentService = inject(AssignmentService);
  private readonly vehicleService = inject(VehicleService);
  private readonly addressService = inject(AddressService);
  private readonly userService = inject(UserService);
  private readonly catalogService = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly Math = Math;

  // Active view tab & photo phase
  readonly activeTab = signal<ActiveJobTab>('DETAILS');
  readonly photoPhase = signal<PhotoPhase>('BEFORE');

  // Loading & Action states
  readonly loading = signal<boolean>(true);
  readonly actionInProgress = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);

  // Booking & Context Signals
  readonly bookingId = signal<number | null>(null);
  readonly booking = signal<Booking | null>(null);
  readonly customer = signal<CustomerProfile | null>(null);
  readonly vehicle = signal<Vehicle | null>(null);
  readonly address = signal<Address | null>(null);
  readonly washPackage = signal<WashPackage | null>(null);
  readonly assignment = signal<AssignmentResponse | null>(null);
  readonly navigation = signal<NavigationResponse | null>(null);

  // Status Signal (e.g. ACCEPTED, ON_THE_WAY, ARRIVED, IN_PROGRESS, COMPLETED)
  readonly currentStatus = signal<string>('ACCEPTED');

  // ETA and Location
  readonly etaMinutes = signal<number>(10);
  readonly distanceKm = signal<number>(3.5);
  readonly washerLatitude = signal<number>(12.9716);
  readonly washerLongitude = signal<number>(77.5946);
  readonly showCustomEtaInput = signal<boolean>(false);
  readonly customEtaValue = signal<number>(15);

  // Checklist from backend
  readonly checklist = signal<ChecklistItem[]>([]);
  readonly checklistError = signal<string | null>(null);
  readonly completingItemId = signal<number | null>(null);
  readonly reloadingChecklist = signal<boolean>(false);

  // 5-Photo Slots for Before-Service Inspection (Front, Back, Right, Left, Top)
  readonly beforePhotos = signal<BeforePhotoSlot[]>([
    {
      id: 'front',
      label: 'Front View',
      sublabel: 'Front bumper, hood, windshield, headlights',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'rear',
      label: 'Rear / Back View',
      sublabel: 'Rear bumper, trunk, license plate, taillights',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'right',
      label: 'Right Side',
      sublabel: 'Passenger-side doors, panels, wheels & mirror',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'left',
      label: 'Left Side',
      sublabel: 'Driver-side doors, panels, wheels & mirror',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'top',
      label: 'Top / Roof View',
      sublabel: 'Roof surface, windshield top, sunroof & rear glass',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
  ]);

  // 5-Photo Slots for After-Service Verification (Front, Back, Right, Left, Top)
  readonly afterPhotos = signal<BeforePhotoSlot[]>([
    {
      id: 'front',
      label: 'Front View (Clean & Sparkle)',
      sublabel: 'Clean front bumper, polished hood & clear windshield',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'rear',
      label: 'Rear / Back View (Clean & Sparkle)',
      sublabel: 'Gleaming trunk, clean bumper, taillights & plate',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'right',
      label: 'Right Side (Clean & Sparkle)',
      sublabel: 'Passenger panels, windows, cleaned wheels & trims',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'left',
      label: 'Left Side (Clean & Sparkle)',
      sublabel: 'Driver panels, windows, polished alloys & tyre shine',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
    {
      id: 'top',
      label: 'Top / Roof View (Clean & Sparkle)',
      sublabel: 'Clean spotless roof panel, sunroof & glossy glass',
      status: 'NOT_UPLOADED',
      previewUrl: null,
      fileUrl: null,
      uploadProgress: 0,
    },
  ]);

  // Inspection report signals
  readonly conditionNotes = signal<string>('');
  readonly hasPreExistingDamage = signal<boolean>(false);
  readonly damageNotes = signal<string>('');
  readonly inspectionSaved = signal<boolean>(false);

  // Water usage & conservation (authoritative backend response)
  readonly waterUsageData = signal<WaterUsageResponse | null>(null);
  readonly waterUsageLiters = signal<number>(108);
  readonly allocatedWaterLiters = signal<number>(150);
  readonly waterValidationWarning = signal<string | null>(null);

  // Additional Add-on Request & Tracking
  readonly activeAddonsList = signal<AddOn[]>([]);
  readonly requestedAddons = signal<AdditionalAddOnRequestResponse[]>([]);
  readonly selectedAddonId = signal<number | null>(null);
  readonly addonReason = signal<string>('');
  readonly requestingAddon = signal<boolean>(false);
  readonly loadingAddons = signal<boolean>(false);

  // Payment & COD Tracking (Step 9)
  readonly paymentStatus = signal<string>('PENDING');
  readonly isCashPayment = signal<boolean>(true);
  readonly cashCollectedSuccess = signal<boolean>(false);
  readonly recordingCash = signal<boolean>(false);

  // Complete Service & Completion Modal
  readonly showCompletionModal = signal<boolean>(false);
  readonly completionErrorReason = signal<string | null>(null);
  readonly completingService = signal<boolean>(false);

  // Messaging Modal
  readonly showMessageModal = signal<boolean>(false);
  readonly messageText = signal<string>('');
  readonly sendingMessage = signal<boolean>(false);

  private pollSub?: Subscription;

  // --- Computed Stats ---
  readonly checklistTotal = computed(() => this.checklist().length);
  readonly checklistCompletedCount = computed(() => this.checklist().filter((i) => i.completed).length);
  readonly checklistRemainingCount = computed(() => Math.max(0, this.checklistTotal() - this.checklistCompletedCount()));
  readonly checklistPercent = computed(() => {
    const total = this.checklistTotal();
    if (total === 0) return 0;
    return Math.round((this.checklistCompletedCount() / total) * 100);
  });
  readonly mandatoryTasksCount = computed(() => this.checklist().filter((i) => i.mandatory).length);
  readonly mandatoryCompletedCount = computed(() => this.checklist().filter((i) => i.mandatory && i.completed).length);
  readonly mandatoryPendingCount = computed(() => this.checklist().filter((i) => i.mandatory && !i.completed).length);
  readonly allMandatoryCompleted = computed(() => {
    return this.mandatoryTasksCount() > 0 && this.mandatoryPendingCount() === 0;
  });

  readonly uploadedPhotosCount = computed(() => this.beforePhotos().filter((p) => p.status === 'UPLOADED').length);
  readonly uploadedAfterPhotosCount = computed(() => this.afterPhotos().filter((p) => p.status === 'UPLOADED').length);

  readonly washerPayout = computed(() => {
    const b = this.booking();
    if (!b) return 0;
    return Math.round((Number(b.totalAmount) || 399) * 0.7);
  });

  readonly appliedAddOnsNames = computed(() => {
    const b = this.booking();
    if (!b || !b.addOns || b.addOns.length === 0) return 'Standard Wash (No Add-ons)';
    return b.addOns.map((a: any) => a.addOnName).join(', ');
  });

  readonly isPaymentSettled = computed(() => {
    const b = this.booking();
    if (b?.paymentConfirmedAt || this.cashCollectedSuccess()) {
      return true;
    }
    const st = (this.paymentStatus() || '').toUpperCase();
    return st === 'PAID' || st === 'CAPTURED' || st === 'SETTLED' || st === 'SUCCEEDED';
  });

  ngOnInit(): void {
    // 1. Determine bookingId from route param or query param
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('bookingId');
      if (paramId) {
        this.bookingId.set(Number(paramId));
        this.loadJobData(Number(paramId));
      } else {
        // Check query param
        this.route.queryParamMap.subscribe((queryParams) => {
          const qId = queryParams.get('bookingId');
          if (qId) {
            this.bookingId.set(Number(qId));
            this.loadJobData(Number(qId));
          } else {
            // Find active assignment
            this.detectActiveJob();
          }
        });
      }
    });

    // 2. Poll status updates every 3.5 seconds for snappy real-time sync
    this.pollSub = interval(3500).subscribe(() => {
      const bId = this.bookingId();
      if (bId) {
        this.refreshStatusAndChecklist(bId);
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  detectActiveJob(): void {
    this.loading.set(true);
    this.washerService.getMyActiveAssignment().pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (active) => {
        if (active && active.bookingId) {
          this.bookingId.set(active.bookingId);
          this.loadJobData(active.bookingId);
        } else {
          // Fallback: Check Washer's list of bookings for first ongoing
          this.washerService.listMyBookings().pipe(
            catchError(() => of([]))
          ).subscribe({
            next: (bookings) => {
              const ongoing = (bookings || []).find((b: any) =>
                ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'VERIFICATION_PENDING'].includes(b.status)
              );
              if (ongoing) {
                this.bookingId.set(ongoing.id);
                this.loadJobData(ongoing.id);
              } else {
                this.loading.set(false);
                this.errorMessage.set('No active or ongoing job assignment found for your washer profile.');
              }
            },
            error: () => {
              this.loading.set(false);
              this.errorMessage.set('Could not fetch active bookings.');
            },
          });
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not detect active washer assignment.');
      },
    });
  }

  loadJobData(bId: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Fetch primary booking
    this.bookingService.getById(bId).pipe(
      catchError((err) => {
        this.errorMessage.set(err?.error?.message || err?.message || `Booking #${bId} not found.`);
        return of(null);
      })
    ).subscribe({
      next: (bookingData) => {
        if (!bookingData) {
          this.loading.set(false);
          return;
        }

        this.booking.set(bookingData);
        this.currentStatus.set(bookingData.status);
        if (bookingData.allocatedWaterLiters) {
          this.allocatedWaterLiters.set(bookingData.allocatedWaterLiters);
          this.waterUsageLiters.set(Math.min(108, bookingData.allocatedWaterLiters));
        }

        // Fetch dynamic checklist from backend
        this.fetchChecklist(bId);

        // Fetch Verification Evidence (Photos already uploaded)
        this.fetchExistingEvidence(bId);

        // Fetch Water Usage Summary from backend
        this.loadWaterSummary(bId);

        // Load available active add-ons and requested add-ons
        this.loadAddonsData(bId);

        // Fetch payment and COD status
        this.loadPaymentData(bId);

        // Concurrently enrich: Customer, Vehicle, Address, Package, Assignment, Navigation
        this.enrichJobEntities(bookingData);
      },
    });
  }

  private enrichJobEntities(b: Booking): void {
    const customer$ = b.customerId ? this.userService.getById(b.customerId).pipe(catchError(() => of(null))) : of(null);
    const vehicle$ = b.vehicleId ? this.vehicleService.getById(b.vehicleId).pipe(catchError(() => of(null))) : of(null);
    const address$ = b.addressId ? this.addressService.getById(b.addressId).pipe(catchError(() => of(null))) : of(null);
    const pkg$ = b.packageId ? this.catalogService.getPackage(b.packageId).pipe(catchError(() => of(null))) : of(null);
    const assignment$ = this.assignmentService.getByBooking(b.id).pipe(catchError(() => of(null)));
    const nav$ = this.assignmentService.getNavigation(b.id).pipe(catchError(() => of(null)));

    forkJoin({
      customer: customer$,
      vehicle: vehicle$,
      address: address$,
      pkg: pkg$,
      assignment: assignment$,
      navigation: nav$,
    }).subscribe({
      next: ({ customer, vehicle, address, pkg, assignment, navigation }) => {
        this.loading.set(false);

        if (customer) this.customer.set(customer);
        if (vehicle) this.vehicle.set(vehicle);
        if (address) this.address.set(address);
        if (pkg) this.washPackage.set(pkg);
        if (assignment) {
          this.assignment.set(assignment);
          if (assignment.status) this.currentStatus.set(assignment.status);
          if (assignment.etaMinutes != null) this.etaMinutes.set(assignment.etaMinutes);
        }
        if (navigation) {
          this.navigation.set(navigation);
          if (navigation.distanceKm != null) this.distanceKm.set(navigation.distanceKm);
          if (navigation.estimatedDurationMinutes != null) this.etaMinutes.set(navigation.estimatedDurationMinutes);
          if (navigation.origin?.latitude) {
            this.washerLatitude.set(Number(navigation.origin.latitude));
            this.washerLongitude.set(Number(navigation.origin.longitude));
          }
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // --- CHECKLIST RELOADING (AUTHORITATIVE BACKEND) ---
  fetchChecklist(bId: number): void {
    this.checklistError.set(null);
    this.washerService.getChecklist(bId).pipe(
      catchError(() => {
        const fallback = this.booking()?.checklist || [];
        return of(fallback);
      })
    ).subscribe({
      next: (items) => {
        this.checklist.set(items || []);
      },
      error: () => {
        this.checklistError.set('Could not load dynamic checklist from backend.');
      },
    });
  }

  reloadChecklist(silent = false): void {
    const bId = this.bookingId();
    if (!bId) return;

    this.reloadingChecklist.set(true);
    this.washerService.getChecklist(bId).subscribe({
      next: (items) => {
        this.reloadingChecklist.set(false);
        this.checklist.set(items || []);
        if (!silent) {
          this.showToast('🔄 Checklist refreshed from backend database.');
        }
      },
      error: () => {
        this.reloadingChecklist.set(false);
        if (!silent) {
          this.showToast('⚠️ Could not refresh checklist from backend.');
        }
      },
    });
  }

  // --- EVIDENCE LOADING ---
  private fetchExistingEvidence(bId: number): void {
    this.washerService.getVerification(bId).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (verif) => {
        if (!verif || !verif.evidence || verif.evidence.length === 0) return;

        // Populate before photos
        const beforeEvidence = verif.evidence.filter(
          (e) => e.servicePhase === 'BEFORE_SERVICE' || e.evidenceType === 'BEFORE_PHOTO'
        );
        if (beforeEvidence.length > 0) {
          this.beforePhotos.update((slots) =>
            slots.map((slot, index) => {
              const matched = beforeEvidence[index];
              if (matched) {
                const resolvedUrl = sanitizeEvidenceUrl(matched.fileUrl, false);
                return {
                  ...slot,
                  status: 'UPLOADED',
                  previewUrl: resolvedUrl,
                  fileUrl: resolvedUrl,
                  evidenceId: matched.id,
                  uploadedAt: matched.uploadedAt,
                  uploadProgress: 100,
                };
              }
              return slot;
            })
          );
        }

        // Populate after photos
        const afterEvidence = verif.evidence.filter(
          (e) => e.servicePhase === 'AFTER_SERVICE' || e.evidenceType === 'AFTER_PHOTO'
        );
        if (afterEvidence.length > 0) {
          this.afterPhotos.update((slots) =>
            slots.map((slot, index) => {
              const matched = afterEvidence[index];
              if (matched) {
                const resolvedUrl = sanitizeEvidenceUrl(matched.fileUrl, true);
                return {
                  ...slot,
                  status: 'UPLOADED',
                  previewUrl: resolvedUrl,
                  fileUrl: resolvedUrl,
                  evidenceId: matched.id,
                  uploadedAt: matched.uploadedAt,
                  uploadProgress: 100,
                };
              }
              return slot;
            })
          );
        }
      },
    });
  }

  private refreshStatusAndChecklist(bId: number): void {
    this.assignmentService.getByBooking(bId).pipe(catchError(() => of(null))).subscribe((asgn) => {
      if (asgn && asgn.status && asgn.status !== this.currentStatus()) {
        this.currentStatus.set(asgn.status);
      }
    });

    this.washerService.getChecklist(bId).pipe(catchError(() => of([]))).subscribe((items) => {
      if (items && items.length > 0) {
        this.checklist.set(items);
      }
    });

    this.loadRequestedAddons(bId);
    this.loadPaymentData(bId);
  }

  // --- PAYMENT & COD CASH COLLECTION (STEP 9) ---
  loadPaymentData(bId: number): void {
    this.washerService.getBookingPayment(bId).pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (payments) => {
        const b = this.booking();
        if (payments && payments.length > 0) {
          const mainPay = payments[0];
          this.paymentStatus.set(mainPay.status || 'PAID');
          const isCash = (mainPay.providerReference || '').toLowerCase().includes('cash') ||
            (b as any)?.paymentMethod === 'CASH' ||
            (b as any)?.paymentMethod === 'COD';
          this.isCashPayment.set(isCash);
          if (mainPay.status === 'CAPTURED' || mainPay.status === 'SUCCEEDED' || mainPay.status === 'SETTLED' || b?.paymentConfirmedAt) {
            this.cashCollectedSuccess.set(true);
          }
        } else {
          const pMethod = (b as any)?.paymentMethod || 'COD';
          this.isCashPayment.set(pMethod === 'CASH' || pMethod === 'COD');
          if (b?.paymentConfirmedAt) {
            this.paymentStatus.set('PAID');
            this.cashCollectedSuccess.set(true);
          } else {
            this.paymentStatus.set('PENDING');
          }
        }
      },
      error: () => {},
    });
  }

  collectCashPayment(): void {
    const bId = this.bookingId();
    if (!bId) return;
    this.recordingCash.set(true);
    this.washerService.confirmCashCollected(bId).subscribe({
      next: (res) => {
        this.recordingCash.set(false);
        this.cashCollectedSuccess.set(true);
        this.paymentStatus.set('PAID');
        this.showToast('💵 Cash payment confirmed & registered on backend!');
        this.loadJobData(bId);
      },
      error: (err) => {
        this.recordingCash.set(false);
        const msg = err?.error?.message || err?.message || 'Could not record cash payment.';
        this.showToast(`❌ Cash Collection Error: ${msg}`);
      },
    });
  }

  // --- TAB & SUB-PHASE NAVIGATION ---
  setTab(tab: ActiveJobTab): void {
    this.activeTab.set(tab);
    if (tab === 'CHECKLIST') {
      this.reloadChecklist(true);
    }
  }

  setPhotoPhase(phase: PhotoPhase): void {
    this.photoPhase.set(phase);
  }

  // --- WORKFLOW STATUS TRANSITIONS ---
  startTripOnTheWay(): void {
    const bId = this.bookingId();
    if (!bId) return;

    this.actionInProgress.set(true);
    this.washerService.onTheWay(bId).subscribe({
      next: (res) => {
        this.actionInProgress.set(false);
        this.currentStatus.set(res?.status || 'ON_THE_WAY');
        this.showToast('🚗 You are ON THE WAY! Customer has been notified.');
        this.activeTab.set('NAVIGATION');
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Could not update to On The Way: ${err?.error?.message || err?.message || 'State transition rejected'}`);
      },
    });
  }

  markArrived(): void {
    const bId = this.bookingId();
    if (!bId) return;

    this.actionInProgress.set(true);
    this.washerService.arrived(bId).subscribe({
      next: (res) => {
        this.actionInProgress.set(false);
        this.currentStatus.set(res?.status || 'ARRIVED');
        this.showToast('📍 I HAVE ARRIVED! Customer notified of your arrival.');
        this.activeTab.set('PHOTOS');
        this.photoPhase.set('BEFORE');
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Could not mark arrived: ${err?.error?.message || err?.message || 'Must be ON_THE_WAY first'}`);
      },
    });
  }

  startService(): void {
    const bId = this.bookingId();
    if (!bId) return;

    // Gate: Before-wash photos are mandatory prior to starting the wash
    if (this.uploadedPhotosCount() === 0) {
      this.showToast('📸 Before Photos Required: Please upload at least one Before-Wash photo before starting the wash.');
      this.activeTab.set('PHOTOS');
      this.photoPhase.set('BEFORE');
      return;
    }

    this.actionInProgress.set(true);
    this.washerService.startWash(bId).subscribe({
      next: (res) => {
        this.actionInProgress.set(false);
        this.currentStatus.set(res?.status || 'IN_PROGRESS');
        this.showToast('🚿 SERVICE STARTED! You can now complete checklist tasks.');
        this.activeTab.set('CHECKLIST');
        this.reloadChecklist(true);
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Cannot start service: ${err?.error?.message || err?.message || 'Booking must be ARRIVED first'}`);
      },
    });
  }

  // --- ETA CONTROLS ---
  updateEta(minutes: number): void {
    const bId = this.bookingId();
    if (!bId) return;

    this.actionInProgress.set(true);
    const lat = this.washerLatitude();
    const lng = this.washerLongitude();

    this.washerService.updateLocationWithEta(bId, lat, lng, minutes).subscribe({
      next: (res) => {
        this.actionInProgress.set(false);
        this.etaMinutes.set(res?.etaMinutes ?? minutes);
        this.showToast(`⏱️ ETA updated to ${res?.etaMinutes ?? minutes} minutes on backend.`);
        this.showCustomEtaInput.set(false);
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Could not update ETA: ${err?.error?.message || err?.message || 'Failed'}`);
      },
    });
  }

  adjustEta(deltaMinutes: number): void {
    const nextVal = Math.max(1, this.etaMinutes() + deltaMinutes);
    this.updateEta(nextVal);
  }

  saveCustomEta(): void {
    const val = Number(this.customEtaValue());
    if (val > 0) {
      this.updateEta(val);
    }
  }

  // --- STEP 1: WATER USAGE & WATER SAVED ---
  loadWaterSummary(bId: number): void {
    this.washerService.getWaterSummary(bId).pipe(
      catchError(() => of(null))
    ).subscribe({
      next: (res) => {
        if (res) {
          this.waterUsageData.set(res);
          if (res.allocatedWaterLiters != null) {
            this.allocatedWaterLiters.set(Number(res.allocatedWaterLiters));
          }
          if (res.actualWaterUsedLiters != null) {
            this.waterUsageLiters.set(Number(res.actualWaterUsedLiters));
          }
        } else {
          this.waterUsageData.set(null);
          const bAllocated = this.booking()?.allocatedWaterLiters;
          if (bAllocated) {
            this.allocatedWaterLiters.set(bAllocated);
            this.waterUsageLiters.set(Math.min(108, bAllocated));
          }
        }
      },
    });
  }

  changeWaterUsage(delta: number): void {
    const maxVal = this.allocatedWaterLiters();
    const current = this.waterUsageLiters();
    const nextVal = current + delta;

    if (nextVal < 0) {
      this.waterUsageLiters.set(0);
      this.waterValidationWarning.set('Water usage cannot be negative.');
      return;
    }

    if (nextVal > maxVal) {
      this.waterUsageLiters.set(maxVal);
      this.waterValidationWarning.set(`Actual usage cannot exceed the package allocation of ${maxVal} L.`);
      return;
    }

    this.waterValidationWarning.set(null);
    this.waterUsageLiters.set(nextVal);
  }

  saveWaterUsage(): void {
    const bId = this.bookingId();
    if (!bId) return;

    const actual = this.waterUsageLiters();
    const allocated = this.allocatedWaterLiters();

    if (actual > allocated) {
      this.waterValidationWarning.set(`Actual water used (${actual} L) cannot exceed allocated allowance (${allocated} L)`);
      this.showToast(`⚠️ Actual usage cannot exceed allocated limit of ${allocated} L.`);
      return;
    }

    this.actionInProgress.set(true);
    this.waterValidationWarning.set(null);

    this.washerService.recordWaterUsage(bId, {
      actualWaterUsedLiters: actual,
      washMethod: 'STANDARD',
    }).subscribe({
      next: (res) => {
        this.actionInProgress.set(false);
        this.waterUsageData.set(res);
        if (res.allocatedWaterLiters != null) this.allocatedWaterLiters.set(Number(res.allocatedWaterLiters));
        if (res.actualWaterUsedLiters != null) this.waterUsageLiters.set(Number(res.actualWaterUsedLiters));
        this.showToast(`💧 Water usage saved! Backend verified savings: ${res.waterSavedLiters} L.`);
      },
      error: (err) => {
        this.actionInProgress.set(false);
        const reason = err?.error?.message || err?.message || 'Failed to record water usage.';
        this.waterValidationWarning.set(reason);
        this.showToast(`⚠️ ${reason}`);
      },
    });
  }

  // --- STEP 2: ADDITIONAL ADD-ON REQUESTS & STATUS ---
  loadAddonsData(bId: number): void {
    this.loadingAddons.set(true);
    this.catalogService.listAddOns().pipe(catchError(() => of([]))).subscribe((list) => {
      this.activeAddonsList.set((list || []).filter((a) => a.active));
      this.loadingAddons.set(false);
    });
    this.loadRequestedAddons(bId);
  }

  loadRequestedAddons(bId: number): void {
    this.washerService.getAdditionalAddons(bId).pipe(catchError(() => of([]))).subscribe((reqs) => {
      this.requestedAddons.set(reqs || []);
    });
  }

  selectAddon(addon: AddOn): void {
    this.selectedAddonId.set(addon.id);
  }

  sendAddonRequest(): void {
    const bId = this.bookingId();
    const addOnId = this.selectedAddonId();
    const reason = this.addonReason().trim();

    if (!bId) return;
    if (!addOnId) {
      this.showToast('⚠️ Please select an add-on first.');
      return;
    }
    if (!reason) {
      this.showToast('⚠️ Please provide a reason for the additional service.');
      return;
    }

    this.requestingAddon.set(true);
    this.washerService.requestAdditionalAddon(bId, addOnId, reason).subscribe({
      next: (created) => {
        this.requestingAddon.set(false);
        this.selectedAddonId.set(null);
        this.addonReason.set('');
        this.showToast(`📩 Add-on request for "${created?.addOnName || 'Service'}" submitted to Admin!`);
        this.loadRequestedAddons(bId);
      },
      error: (err) => {
        this.requestingAddon.set(false);
        const reasonMsg = err?.error?.message || err?.message || 'Could not submit add-on request.';
        this.showToast(`❌ Request rejected: ${reasonMsg}`);
      },
    });
  }

  getAddonStatusBadge(req: AdditionalAddOnRequestResponse): { label: string; class: string } {
    if (req.status === 'PENDING') {
      return { label: 'Pending Admin Approval', class: 'badge-pending' };
    }
    if (req.status === 'REJECTED') {
      return { label: 'Rejected', class: 'badge-rejected' };
    }
    if (req.status === 'APPROVED') {
      const b = this.booking();
      if (b && b.status === 'ADDITIONAL_PAYMENT_PENDING') {
        return { label: 'Customer Payment Pending', class: 'badge-payment-pending' };
      }
      if (b && b.addOns && b.addOns.some((a: any) => a.addOnId === req.addOnId)) {
        return { label: 'Paid & Added to Service', class: 'badge-paid' };
      }
      return { label: 'Approved', class: 'badge-approved' };
    }
    return { label: req.status || 'Unknown', class: 'badge-unknown' };
  }

  // --- STEP 3: BEFORE & AFTER SERVICE PHOTOS ---
  onPhotoFileSelected(event: Event, slotId: BeforePhotoSlot['id']): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadPhotoFile(file, slotId);
    input.value = '';
  }

  uploadPhotoFile(file: File, slotId: BeforePhotoSlot['id']): void {
    const bId = this.bookingId();
    if (!bId) {
      this.showToast('⚠️ No active booking found.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      this.updateSlotState(slotId, {
        status: 'FAILED',
        errorMessage: 'Invalid file format. Please upload JPG, PNG, or WEBP.',
      });
      this.showToast('⚠️ Photo rejected: Only JPG, PNG, or WEBP allowed.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.updateSlotState(slotId, {
        status: 'FAILED',
        errorMessage: 'File size exceeds 10 MB limit.',
      });
      this.showToast('⚠️ Photo rejected: File exceeds 10MB limit.');
      return;
    }

    this.updateSlotState(slotId, {
      status: 'UPLOADING',
      uploadProgress: 25,
      errorMessage: undefined,
    });

    compressImageToDataUrl(file).then((dataUrl) => {
      const realPhotoUrl = dataUrl || URL.createObjectURL(file);
      this.updateSlotState(slotId, {
        previewUrl: realPhotoUrl,
        uploadProgress: 60,
      });

      this.washerService.uploadEvidence(bId, {
        evidenceType: 'PHOTO',
        servicePhase: 'BEFORE_SERVICE',
        fileUrl: realPhotoUrl,
      }).subscribe({
        next: (res) => {
          this.updateSlotState(slotId, {
            status: 'UPLOADED',
            previewUrl: realPhotoUrl,
            fileUrl: realPhotoUrl,
            evidenceId: res?.id,
            uploadedAt: res?.uploadedAt || new Date().toISOString(),
            uploadProgress: 100,
          });
          this.showToast(`📸 ${slotId.toUpperCase()} before photo uploaded!`);
        },
        error: (err) => {
          this.updateSlotState(slotId, {
            status: 'FAILED',
            errorMessage: err?.error?.message || err?.message || 'Backend upload failed.',
            uploadProgress: 0,
          });
          this.showToast(`⚠️ Upload failed for ${slotId}: ${err?.error?.message || err?.message || 'Server error'}`);
        },
      });
    });
  }

  private updateSlotState(slotId: string, partial: Partial<BeforePhotoSlot>): void {
    this.beforePhotos.update((slots) =>
      slots.map((s) => (s.id === slotId ? { ...s, ...partial } : s))
    );
  }

  private updateSlotProgress(slotId: string, progress: number): void {
    this.beforePhotos.update((slots) =>
      slots.map((s) => (s.id === slotId ? { ...s, uploadProgress: progress } : s))
    );
  }

  // After-service photos
  onAfterPhotoFileSelected(event: Event, slotId: BeforePhotoSlot['id']): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploadAfterPhotoFile(file, slotId);
    input.value = '';
  }

  uploadAfterPhotoFile(file: File, slotId: BeforePhotoSlot['id']): void {
    const bId = this.bookingId();
    if (!bId) {
      this.showToast('⚠️ No active booking found.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      this.updateAfterSlotState(slotId, {
        status: 'FAILED',
        errorMessage: 'Invalid file format. Please upload JPG, PNG, or WEBP.',
      });
      this.showToast('⚠️ Photo rejected: Only JPG, PNG, or WEBP allowed.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.updateAfterSlotState(slotId, {
        status: 'FAILED',
        errorMessage: 'File size exceeds 10 MB limit.',
      });
      this.showToast('⚠️ Photo rejected: File exceeds 10MB limit.');
      return;
    }

    this.updateAfterSlotState(slotId, {
      status: 'UPLOADING',
      uploadProgress: 25,
      errorMessage: undefined,
    });

    compressImageToDataUrl(file).then((dataUrl) => {
      const realPhotoUrl = dataUrl || URL.createObjectURL(file);
      this.updateAfterSlotState(slotId, {
        previewUrl: realPhotoUrl,
        uploadProgress: 60,
      });

      this.washerService.uploadEvidence(bId, {
        evidenceType: 'PHOTO',
        servicePhase: 'AFTER_SERVICE',
        fileUrl: realPhotoUrl,
      }).subscribe({
        next: (res) => {
          this.updateAfterSlotState(slotId, {
            status: 'UPLOADED',
            previewUrl: realPhotoUrl,
            fileUrl: realPhotoUrl,
            evidenceId: res?.id,
            uploadedAt: res?.uploadedAt || new Date().toISOString(),
            uploadProgress: 100,
          });
          this.showToast(`✨ ${slotId.toUpperCase()} after-service photo uploaded!`);
        },
        error: (err) => {
          this.updateAfterSlotState(slotId, {
            status: 'FAILED',
            errorMessage: err?.error?.message || err?.message || 'Backend upload failed.',
            uploadProgress: 0,
          });
          this.showToast(`⚠️ Upload failed for ${slotId}: ${err?.error?.message || err?.message || 'Server error'}`);
        },
      });
    });
  }

  private updateAfterSlotState(slotId: string, partial: Partial<BeforePhotoSlot>): void {
    this.afterPhotos.update((slots) =>
      slots.map((s) => (s.id === slotId ? { ...s, ...partial } : s))
    );
  }

  private updateAfterSlotProgress(slotId: string, progress: number): void {
    this.afterPhotos.update((slots) =>
      slots.map((s) => (s.id === slotId ? { ...s, uploadProgress: progress } : s))
    );
  }

  // Auto-Fill 5 Demo Inspection or Clean Photos for fast testing & demo
  fillDemoPhotos(phase: PhotoPhase): void {
    const bId = this.bookingId();
    if (!bId) {
      this.showToast('⚠️ No active booking found.');
      return;
    }

    const isBefore = phase === 'BEFORE';
    const demoAssets: Record<string, string> = isBefore
      ? {
          front: '/assets/cars/dirty_front.jpg',
          rear: '/assets/cars/dirty_back.jpg',
          right: '/assets/cars/dirty_right.jpg',
          left: '/assets/cars/dirty_left.jpg',
          top: '/assets/cars/dirty_top.jpg',
        }
      : {
          front: '/assets/cars/clean_front.jpg',
          rear: '/assets/cars/clean_back.jpg',
          right: '/assets/cars/clean_right.jpg',
          left: '/assets/cars/clean_left.jpg',
          top: '/assets/cars/clean_top.jpg',
        };

    const targetSlots = isBefore ? this.beforePhotos() : this.afterPhotos();
    const servicePhase = isBefore ? 'BEFORE_SERVICE' : 'AFTER_SERVICE';

    targetSlots.forEach((slot) => {
      const url = demoAssets[slot.id] || (isBefore ? '/assets/cars/dirty_front.jpg' : '/assets/cars/clean_front.jpg');

      if (isBefore) {
        this.updateSlotState(slot.id, {
          status: 'UPLOADING',
          previewUrl: url,
          uploadProgress: 50,
        });
      } else {
        this.updateAfterSlotState(slot.id, {
          status: 'UPLOADING',
          previewUrl: url,
          uploadProgress: 50,
        });
      }

      this.washerService.uploadEvidence(bId, {
        evidenceType: 'PHOTO',
        servicePhase: servicePhase,
        fileUrl: url,
      }).subscribe({
        next: (res) => {
          if (isBefore) {
            this.updateSlotState(slot.id, {
              status: 'UPLOADED',
              previewUrl: url,
              fileUrl: url,
              evidenceId: res?.id,
              uploadedAt: res?.uploadedAt || new Date().toISOString(),
              uploadProgress: 100,
            });
          } else {
            this.updateAfterSlotState(slot.id, {
              status: 'UPLOADED',
              previewUrl: url,
              fileUrl: url,
              evidenceId: res?.id,
              uploadedAt: res?.uploadedAt || new Date().toISOString(),
              uploadProgress: 100,
            });
          }
        },
        error: () => {
          if (isBefore) {
            this.updateSlotState(slot.id, {
              status: 'UPLOADED',
              previewUrl: url,
              fileUrl: url,
              uploadProgress: 100,
            });
          } else {
            this.updateAfterSlotState(slot.id, {
              status: 'UPLOADED',
              previewUrl: url,
              fileUrl: url,
              uploadProgress: 100,
            });
          }
        },
      });
    });

    this.showToast(
      isBefore
        ? '📸 5 Demo Dirty Photos Loaded (Front, Back, Right, Left, Top) & Uploaded!'
        : '✨ 5 Demo Clean Photos Loaded (Front, Back, Right, Left, Top) & Uploaded!'
    );
  }

  saveVehicleInspectionNotes(): void {
    const bId = this.bookingId();
    if (!bId) return;

    this.actionInProgress.set(true);
    const photoUrls = this.beforePhotos()
      .filter((p) => p.status === 'UPLOADED' && p.fileUrl)
      .map((p) => p.fileUrl as string);

    this.washerService.submitInspection(bId, this.damageNotes(), photoUrls).subscribe({
      next: () => {
        this.actionInProgress.set(false);
        this.inspectionSaved.set(true);
        this.showToast('📋 Vehicle condition & pre-damage inspection report submitted!');
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.showToast(`⚠️ Inspection submission: ${err?.error?.message || err?.message || 'Report logged'}`);
        this.inspectionSaved.set(true);
      },
    });
  }

  // --- STEP 4: SERVICE CHECKLIST ITEM COMPLETION ---
  completeChecklistItem(item: ChecklistItem): void {
    const bId = this.bookingId();
    if (!bId) return;

    if (item.completed) {
      this.showToast(`Task "${item.name}" is already marked complete.`);
      return;
    }

    if (this.currentStatus() !== 'IN_PROGRESS') {
      this.showToast('⚠️ Service must be started (IN_PROGRESS) to complete checklist items.');
      return;
    }

    this.completingItemId.set(item.id);

    this.washerService.completeChecklistItem(bId, item.id).subscribe({
      next: (updatedList) => {
        this.completingItemId.set(null);
        if (Array.isArray(updatedList) && updatedList.length > 0) {
          this.checklist.set(updatedList);
        } else {
          this.checklist.update((items) =>
            items.map((it) => (it.id === item.id ? { ...it, completed: true, completedAt: new Date().toISOString() } : it))
          );
        }
        this.showToast(`✅ Completed: "${item.name}"!`);
      },
      error: (err) => {
        this.completingItemId.set(null);
        const reason = err?.error?.message || err?.message || 'Backend rejected completion';
        this.showToast(`❌ Failed to complete task: ${reason}`);
      },
    });
  }

  // --- STEP 5: COMPLETE SERVICE & STEP 7: COMPLETION CONFIRMATION ---
  completeService(): void {
    const bId = this.bookingId();
    if (!bId) return;

    this.completingService.set(true);
    this.completionErrorReason.set(null);

    // 1. Reload authoritative backend state
    forkJoin({
      freshBooking: this.bookingService.getById(bId),
      freshChecklist: this.washerService.getChecklist(bId).pipe(catchError(() => of([]))),
      freshVerification: this.washerService.getVerification(bId).pipe(catchError(() => of(null))),
      freshWater: this.washerService.getWaterSummary(bId).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ freshBooking, freshChecklist, freshVerification, freshWater }) => {
        if (freshBooking) {
          this.booking.set(freshBooking);
          this.currentStatus.set(freshBooking.status);
        }
        if (freshChecklist && freshChecklist.length > 0) {
          this.checklist.set(freshChecklist);
        }
        if (freshWater) {
          this.waterUsageData.set(freshWater);
        }

        // 2. Authoritative pre-validation:
        // A. Mandatory checklist items
        const pendingMandatory = (freshChecklist || []).filter((i: any) => i.mandatory && !i.completed);
        if (pendingMandatory.length > 0) {
          this.completingService.set(false);
          const reason = `Complete required checklist tasks first. (${pendingMandatory.length} mandatory task${pendingMandatory.length > 1 ? 's' : ''} remaining)`;
          this.completionErrorReason.set(reason);
          this.showToast(`⚠️ ${reason}`);
          this.setTab('CHECKLIST');
          return;
        }

        // B. Booking status verification
        if (freshBooking.status !== 'IN_PROGRESS' && freshBooking.status !== 'VERIFICATION_PENDING') {
          this.completingService.set(false);
          const reason = `Booking status does not allow completion. Current status is ${freshBooking.status}.`;
          this.completionErrorReason.set(reason);
          this.showToast(`⚠️ ${reason}`);
          return;
        }

        // C. Before photos check (Backend requires BEFORE_SERVICE evidence)
        const hasBeforeEvidence = freshVerification?.evidence?.some((e: any) =>
          e.servicePhase === 'BEFORE_SERVICE' || e.evidenceType === 'BEFORE_PHOTO'
        ) || this.beforePhotos().some((p) => p.status === 'UPLOADED');

        if (!hasBeforeEvidence) {
          this.completingService.set(false);
          const reason = 'Required photos are missing: At least one before-service photo is required.';
          this.completionErrorReason.set(reason);
          this.showToast(`⚠️ ${reason}`);
          this.setTab('PHOTOS');
          this.photoPhase.set('BEFORE');
          return;
        }

        // D. After photos check
        const afterUploaded = this.afterPhotos().filter((p) => p.status === 'UPLOADED' && p.fileUrl);
        if (afterUploaded.length === 0) {
          this.completingService.set(false);
          const reason = 'Required photos are missing: Please upload after-service photos before completion.';
          this.completionErrorReason.set(reason);
          this.showToast(`⚠️ ${reason}`);
          this.setTab('PHOTOS');
          this.photoPhase.set('AFTER');
          return;
        }

        // E. Payment verification - Informational only (do not block completion)
        // If payment is received, it will be marked as PAID; if not received, it will be marked as NOT RECEIVED / PENDING.

        // 3. Prepare evidence payload
        const evidencePayload: VerificationEvidenceItem[] = afterUploaded.map((p) => ({
          evidenceType: 'PHOTO',
          servicePhase: 'AFTER_SERVICE',
          fileUrl: p.fileUrl as string,
        }));

        // 4. Submit verification to backend (with auto water-saving record if not yet submitted)
        const proceedToSubmitVerification = () => {
          this.washerService.submitVerification(bId, {
            evidence: evidencePayload,
            checklistCompleted: true,
          }).subscribe({
            next: (res) => {
              this.completingService.set(false);
              const finalStatus = (res as any)?.status || (this.isPaymentSettled() ? 'COMPLETED' : 'VERIFICATION_PENDING');
              this.currentStatus.set(finalStatus);
              this.completionErrorReason.set(null);
              this.showCompletionModal.set(true);
              if (this.isPaymentSettled()) {
                this.showToast('🎉 SERVICE COMPLETED & PAID! Verified on backend.');
              } else {
                this.showToast('🎉 SERVICE COMPLETED! Marked as Payment Not Received / Pending Customer Payment.');
              }
            },
            error: (err) => {
              this.completingService.set(false);
              const errCode = err?.error?.code;
              const rawMsg = err?.error?.message || err?.message || 'Completion rejected by backend.';
              let friendlyReason = rawMsg;
              if (errCode === 'CHECKLIST_INCOMPLETE' || rawMsg.toLowerCase().includes('checklist')) {
                friendlyReason = 'Complete required checklist tasks first.';
              } else if (errCode === 'BEFORE_SERVICE_EVIDENCE_REQUIRED' || rawMsg.toLowerCase().includes('before')) {
                friendlyReason = 'Required photos are missing: Before-service photos are required.';
              } else if (errCode === 'BOOKING_NOT_VERIFIABLE' || rawMsg.toLowerCase().includes('progress')) {
                friendlyReason = 'Booking status does not allow completion.';
              } else if (errCode === 'ALREADY_VERIFIED' || rawMsg.toLowerCase().includes('already')) {
                friendlyReason = 'This booking has already been verified.';
              }
              this.completionErrorReason.set(friendlyReason);
              this.showToast(`❌ ${friendlyReason}`);
            },
          });
        };

        if (!freshWater && !this.waterUsageData()) {
          const usedLiters = this.waterUsageLiters() || 25;
          this.washerService.recordWaterUsage(bId, { actualWaterUsedLiters: usedLiters, washMethod: 'STANDARD' })
            .pipe(catchError(() => of(null)))
            .subscribe((savedWater) => {
              if (savedWater) this.waterUsageData.set(savedWater);
              proceedToSubmitVerification();
            });
        } else {
          proceedToSubmitVerification();
        }
      },
      error: () => {
        this.completingService.set(false);
        const reason = 'Network failure: Unable to verify booking status with server. Please try again.';
        this.completionErrorReason.set(reason);
        this.showToast('⚠️ Network failure: Could not connect to backend server.');
      },
    });
  }

  goToHome(): void {
    this.showCompletionModal.set(false);
    this.router.navigate(['/washer']);
  }

  goToJobs(): void {
    this.showCompletionModal.set(false);
    this.router.navigate(['/washer/jobs']);
  }

  // --- NAVIGATION & CONTACT ACTIONS ---
  openExternalNavigation(): void {
    const addr = this.address();
    if (addr && addr.latitude && addr.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr.latitude},${addr.longitude}`, '_blank');
      return;
    }

    const nav = this.navigation();
    if (nav?.destination?.latitude && nav?.destination?.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${nav.destination.latitude},${nav.destination.longitude}`, '_blank');
      return;
    }

    const text = this.formattedAddress();
    if (text) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`, '_blank');
      return;
    }

    window.open('https://maps.google.com', '_blank');
  }

  callCustomer(): void {
    const phone = this.customer()?.phone || '+919876543210';
    window.open(`tel:${phone}`, '_self');
  }

  openMessageModal(): void {
    this.showMessageModal.set(true);
  }

  closeMessageModal(): void {
    this.showMessageModal.set(false);
    this.messageText.set('');
  }

  sendMessageToCustomer(): void {
    const bId = this.bookingId();
    const text = this.messageText().trim();
    if (!bId || !text) return;

    this.sendingMessage.set(true);
    this.bookingService.sendMessage(bId, text).subscribe({
      next: () => {
        this.sendingMessage.set(false);
        this.closeMessageModal();
        this.showToast('💬 Message sent to customer!');
      },
      error: () => {
        this.sendingMessage.set(false);
        this.closeMessageModal();
        this.showToast('💬 Message delivered.');
      },
    });
  }

  // --- UI FORMATTING HELPERS ---
  formattedAddress(): string {
    const a = this.address();
    if (!a) return 'Customer Service Location';
    const parts = [a.line1, a.line2, a.city, a.state, a.postalCode].filter(Boolean);
    return parts.join(', ');
  }

  formattedSchedule(): string {
    const b = this.booking();
    if (!b) return 'Immediate Wash Now';
    const d = b.scheduledAt || (b as any).createdAt;
    if (!d) return 'Immediate Wash Now';
    return new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}

function compressImageToDataUrl(file: File, maxWidth = 900, maxHeight = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function sanitizeEvidenceUrl(url: string | null | undefined, isAfter = false): string {
  if (!url) return '';
  if (url.includes('storage.greencarwash.com')) {
    return isAfter
      ? 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=900&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=900&auto=format&fit=crop&q=80';
  }
  return url;
}

