import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address, AddressRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;
  private readonly _addresses = signal<Address[]>([]);

  readonly addresses = this._addresses.asReadonly();

  list(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.gatewayBaseUrl}/api/addresses`).pipe(
      tap((addresses) => this._addresses.set(addresses || []))
    );
  }

  getById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.gatewayBaseUrl}/api/addresses/${id}`);
  }

  add(address: AddressRequest): Observable<Address> {
    return this.http.post<Address>(`${this.gatewayBaseUrl}/api/addresses`, address).pipe(
      tap((created) => {
        this._addresses.update((list) => {
          if (created.isDefault) {
            return [...list.map((a) => ({ ...a, isDefault: false })), created];
          }
          return [...list, created];
        });
      })
    );
  }

  update(id: number, address: AddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.gatewayBaseUrl}/api/addresses/${id}`, address).pipe(
      tap((updated) => {
        this._addresses.update((list) =>
          list.map((a) => {
            if (a.id === id) return updated;
            if (updated.isDefault) return { ...a, isDefault: false };
            return a;
          })
        );
      })
    );
  }

  setDefault(address: Address): Observable<Address> {
    const payload: AddressRequest = {
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      accessInstructions: address.accessInstructions,
      parkingShadeNotes: address.parkingShadeNotes,
      serviceable: address.serviceable ?? true,
      isDefault: true,
    };
    return this.update(address.id, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.gatewayBaseUrl}/api/addresses/${id}`).pipe(
      tap(() => this._addresses.update((list) => list.filter((a) => a.id !== id)))
    );
  }
}

