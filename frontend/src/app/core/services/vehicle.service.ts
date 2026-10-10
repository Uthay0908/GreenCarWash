import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicle, VehicleRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;
  private readonly _vehicles = signal<Vehicle[]>([]);

  readonly vehicles = this._vehicles.asReadonly();

  list(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.gatewayBaseUrl}/api/vehicles`).pipe(
      tap((list) => this._vehicles.set(list))
    );
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.gatewayBaseUrl}/api/vehicles/${id}`);
  }

  add(request: VehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.gatewayBaseUrl}/api/vehicles`, request).pipe(
      tap((created) => this._vehicles.update((list) => [...list, created]))
    );
  }

  update(id: number, request: VehicleRequest): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.gatewayBaseUrl}/api/vehicles/${id}`, request).pipe(
      tap((updated) =>
        this._vehicles.update((list) => list.map((v) => (v.id === id ? updated : v)))
      )
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/vehicles/${id}`).pipe(
      tap(() =>
        this._vehicles.update((list) => list.filter((v) => v.id !== id))
      )
    );
  }
}
