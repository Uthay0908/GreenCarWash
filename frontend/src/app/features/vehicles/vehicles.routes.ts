import { Routes } from '@angular/router';

export const VEHICLES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./vehicle-list/vehicle-list').then((m) => m.VehicleList) },
  { path: 'new', loadComponent: () => import('./vehicle-form/vehicle-form').then((m) => m.VehicleForm) },
  { path: ':id', loadComponent: () => import('./vehicle-detail/vehicle-detail').then((m) => m.VehicleDetail) },
  { path: ':id/edit', loadComponent: () => import('./vehicle-form/vehicle-form').then((m) => m.VehicleForm) },
];
