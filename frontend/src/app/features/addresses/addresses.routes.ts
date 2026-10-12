import { Routes } from '@angular/router';

export const ADDRESSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./address-list/address-list').then((m) => m.AddressList),
  },
  {
    path: 'new',
    loadComponent: () => import('./address-form/address-form').then((m) => m.AddressForm),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./address-form/address-form').then((m) => m.AddressForm),
  },
];
