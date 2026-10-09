import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupportService } from '../../../core/services/support.service';
import { TicketPriority } from '../../../shared/models';

@Component({
  selector: 'app-ticket-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-form.html',
  styleUrl: './ticket-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketForm {
  private readonly fb = inject(FormBuilder);
  private readonly support = inject(SupportService);
  private readonly router = inject(Router);

  readonly priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    subject: ['', [Validators.required, Validators.minLength(4)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    priority: ['MEDIUM' as TicketPriority, Validators.required],
  });

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.support.createTicket(this.form.getRawValue()).subscribe((ticket) => {
      this.submitting.set(false);
      this.router.navigate(['/support', ticket.id]);
    });
  }
}
