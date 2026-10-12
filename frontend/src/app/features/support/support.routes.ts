import { Routes } from '@angular/router';

export const SUPPORT_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./support-hub').then((m) => m.SupportHub) },
  { path: 'new', loadComponent: () => import('./ticket-form/ticket-form').then((m) => m.TicketForm) },
  { path: ':id', loadComponent: () => import('./ticket-detail/ticket-detail').then((m) => m.TicketDetail) },
];
