import { Routes } from '@angular/router';

export const WASHER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./washer-dashboard/washer-shell').then((m) => m.WasherShell),
    children: [
      { path: '', loadComponent: () => import('./washer-overview/washer-overview').then((m) => m.WasherOverview) },
      { path: 'requests', loadComponent: () => import('./washer-requests/washer-requests').then((m) => m.WasherRequests) },
      { path: 'jobs', loadComponent: () => import('./washer-jobs/washer-jobs').then((m) => m.WasherJobs) },
      { path: 'jobs/:bookingId', loadComponent: () => import('./washer-active-job/washer-active-job').then((m) => m.WasherActiveJob) },
      { path: 'active-job', loadComponent: () => import('./washer-active-job/washer-active-job').then((m) => m.WasherActiveJob) },
      { path: 'active-job/:bookingId', loadComponent: () => import('./washer-active-job/washer-active-job').then((m) => m.WasherActiveJob) },
      { path: 'availability', loadComponent: () => import('./washer-availability/washer-availability').then((m) => m.WasherAvailability) },
      { path: 'earnings', loadComponent: () => import('./washer-earnings/washer-earnings').then((m) => m.WasherEarnings) },
      { path: 'reviews', loadComponent: () => import('./washer-reviews/washer-reviews').then((m) => m.WasherReviews) },
      { path: 'leaderboard', loadComponent: () => import('./washer-leaderboard/washer-leaderboard').then((m) => m.WasherLeaderboard) },
      { path: 'kyc', loadComponent: () => import('./washer-kyc/washer-kyc').then((m) => m.WasherKyc) },
      { path: 'notifications', loadComponent: () => import('./washer-notifications/washer-notifications').then((m) => m.WasherNotifications) },
      { path: 'support', loadComponent: () => import('./washer-support/washer-support').then((m) => m.WasherSupport) },
      { path: 'profile', loadComponent: () => import('./washer-profile/washer-profile').then((m) => m.WasherProfile) },
    ],
  },
];
