import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../shared/models';

@Component({
  selector: 'app-vehicle-detail',
  imports: [RouterLink],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleDetail {
  readonly vehicle = signal<Vehicle | undefined>(undefined);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly vehicleService: VehicleService,
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.vehicleService.getById(id).subscribe((v) => this.vehicle.set(v));
  }
}
