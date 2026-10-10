import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard/admin-shell').then((m) => m.AdminShell),
    children: [
      { path: '', loadComponent: () => import('./admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard) },
      { path: 'users', loadComponent: () => import('./users/admin-users').then((m) => m.AdminUsers) },
      { path: 'washers', loadComponent: () => import('./washers/admin-washers').then((m) => m.AdminWashers) },
      { path: 'vehicles', loadComponent: () => import('./vehicles/admin-vehicles').then((m) => m.AdminVehicles) },
      { path: 'packages', loadComponent: () => import('./packages/admin-packages').then((m) => m.AdminPackages) },
      { path: 'addons', loadComponent: () => import('./addons/admin-addons').then((m) => m.AdminAddOns) },
      { path: 'promotions', loadComponent: () => import('./promotions/admin-promotions').then((m) => m.AdminPromotions) },
      { path: 'bookings', loadComponent: () => import('./bookings/admin-bookings').then((m) => m.AdminBookings) },
      { path: 'service-areas', loadComponent: () => import('./service-areas/admin-service-areas').then((m) => m.AdminServiceAreas) },
      { path: 'payments', loadComponent: () => import('./payments/admin-payments').then((m) => m.AdminPayments) },
      { path: 'invoices', loadComponent: () => import('./invoices/admin-invoices').then((m) => m.AdminInvoices) },
      { path: 'reviews', loadComponent: () => import('./reviews/admin-reviews').then((m) => m.AdminReviews) },
      { path: 'damage-claims', loadComponent: () => import('./damage-claims/admin-damage-claims').then((m) => m.AdminDamageClaims) },
      { path: 'support', loadComponent: () => import('./support/admin-support').then((m) => m.AdminSupport) },
      { path: 'organizations', loadComponent: () => import('./organizations/admin-organizations').then((m) => m.AdminOrganizations) },
      { path: 'reports', loadComponent: () => import('./reports/admin-reports').then((m) => m.AdminReports) },
      { path: 'pricing', loadComponent: () => import('./pricing/admin-pricing').then((m) => m.AdminPricing) },
      { path: 'audit-logs', loadComponent: () => import('./audit-logs/admin-audit-logs').then((m) => m.AdminAuditLogs) },
      { path: 'system-config', loadComponent: () => import('./system-config/admin-system-config').then((m) => m.AdminSystemConfig) },
      { path: 'profile', loadComponent: () => import('./profile/admin-profile').then((m) => m.AdminProfile) },
    ],
  },
];
