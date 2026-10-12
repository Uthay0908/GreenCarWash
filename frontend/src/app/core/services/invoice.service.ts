import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  readonly gatewayBaseUrl = environment.apiBaseUrl || environment.apiUrl;
  private readonly _invoices = signal<Invoice[]>([]);

  readonly invoices = this._invoices.asReadonly();

  listMine(): Observable<Invoice[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/invoices/my`).pipe(
      map((res) => Array.isArray(res) ? res : (res?.content || [])),
      tap((list) => this._invoices.set(list))
    );
  }

  listAll(page = 0, size = 50): Observable<Invoice[]> {
    return this.http.get<any>(`${this.gatewayBaseUrl}/api/invoices?page=${page}&size=${size}`).pipe(
      map((res) => (Array.isArray(res) ? res : (res?.content || [])))
    );
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.gatewayBaseUrl}/api/invoices/${id}`);
  }

  getByBookingId(bookingId: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.gatewayBaseUrl}/api/invoices/booking/${bookingId}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.gatewayBaseUrl}/api/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  downloadAndSavePdf(id: number, filename = `invoice-${id}.pdf`): void {
    this.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Failed to download invoice PDF', err)
    });
  }
}
