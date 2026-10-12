import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CorporateService } from '../services/corporate.service';
import { UserRole } from '../../shared/models';

function makeRoleGuard(expectedRole: UserRole): CanActivateFn {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (auth.hasRole(expectedRole)) {
      return true;
    }

    // Role mismatch: redirect authenticated user to their respective landing portal
    const userRole = auth.currentRole();
    if (userRole === 'ADMIN') {
      return router.createUrlTree(['/admin']);
    }
    if (userRole === 'WASHER') {
      return router.createUrlTree(['/washer']);
    }
    if (userRole === 'CORPORATE') {
      return router.createUrlTree(['/corporate']);
    }
    return router.createUrlTree(['/dashboard']);
  };
}

export const customerGuard: CanActivateFn = makeRoleGuard('CUSTOMER');
export const washerGuard: CanActivateFn = makeRoleGuard('WASHER');
export const adminGuard: CanActivateFn = makeRoleGuard('ADMIN');

export const corporateGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const corporate = inject(CorporateService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const userRole = auth.currentRole();
  if (userRole === 'ADMIN') {
    return router.createUrlTree(['/admin']);
  }
  if (userRole === 'WASHER') {
    return router.createUrlTree(['/washer']);
  }

  // Must have CORPORATE role or an active corporate organization session
  if (auth.hasRole('CORPORATE') || corporate.hasActiveCorporateSession()) {
    return true;
  }

  // Regular customer without corporate org redirected to customer dashboard
  return router.createUrlTree(['/dashboard']);
};

export const customerCanMatch: CanMatchFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() && auth.hasRole('CUSTOMER');
};
