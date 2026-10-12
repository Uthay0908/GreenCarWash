import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CorporateService } from '../../../core/services/corporate.service';
import { Organization } from '../../../shared/models';

@Component({
  selector: 'app-admin-organizations',
  imports: [DatePipe],
  templateUrl: './admin-organizations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrganizations {
  readonly organizations = signal<Organization[]>([]);

  constructor(private readonly corporate: CorporateService) {
    this.corporate.getMyOrganization().subscribe((org) => {
      this.organizations.set(org ? [org] : []);
    });
  }
}
