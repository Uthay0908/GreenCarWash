import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly mobileMenuOpen = signal(false);

  constructor(
    readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  dashboardLink(): string {
    const role = this.auth.currentRole();
    if (role === 'ADMIN') return '/admin';
    if (role === 'WASHER') return '/washer';
    if (role === 'CORPORATE') return '/corporate';
    return '/dashboard';
  }

  logout(): void {
    this.auth.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}
