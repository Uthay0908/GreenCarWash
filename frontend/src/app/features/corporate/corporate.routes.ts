import { Routes } from '@angular/router';

export const CORPORATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./org-dashboard/corporate-shell').then((m) => m.CorporateShell),
    children: [
      { path: '', loadComponent: () => import('./org-dashboard/org-dashboard').then((m) => m.OrgDashboard) },
      { path: 'fleet', loadComponent: () => import('./fleet/fleet').then((m) => m.CorporateFleet) },
      { path: 'members', loadComponent: () => import('./members/members').then((m) => m.Members) },
      { path: 'locations', loadComponent: () => import('./locations/locations').then((m) => m.CorporateLocations) },
      { path: 'bookings', loadComponent: () => import('./corporate-bookings/corporate-bookings').then((m) => m.CorporateBookings) },
      { path: 'packages', loadComponent: () => import('./packages/packages').then((m) => m.CorporatePackages) },
      { path: 'history', loadComponent: () => import('./history/history').then((m) => m.CorporateHistory) },
      { path: 'payments', loadComponent: () => import('./payments/corporate-payments').then((m) => m.CorporatePayments) },
      { path: 'billing', loadComponent: () => import('./billing/billing').then((m) => m.Billing) },
      { path: 'reports', loadComponent: () => import('./reports/corporate-reports').then((m) => m.CorporateReports) },
      { path: 'notifications', loadComponent: () => import('./notifications/corporate-notifications').then((m) => m.CorporateNotifications) },
      { path: 'support', loadComponent: () => import('./support/corporate-support').then((m) => m.CorporateSupport) },
      { path: 'organization', loadComponent: () => import('./organization/organization').then((m) => m.OrganizationPage) },
    ],
  },
];
