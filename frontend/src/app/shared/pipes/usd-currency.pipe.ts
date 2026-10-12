import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usdCurrency',
  standalone: true,
})
export class UsdCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || value === '') return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }
}
