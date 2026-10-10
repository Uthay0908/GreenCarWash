import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./invoices').then((m) => m.Invoices) },
];
