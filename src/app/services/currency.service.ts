import { Injectable } from '@angular/core';
import { Currency } from '../utils/app.model';
import { CURRENCIES } from '../utils/currencies';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private currencyMap: { [key: string]: { symbol: string; flag: string } } = Object.fromEntries(
    CURRENCIES.map(({ abbreviation, symbol, flag }) => [abbreviation, { symbol, flag }])
  );

  getCurrencies(): Currency[] {
    return CURRENCIES;
  }

  getCurrencySymbol(abbreviation: string): string {
    return this.currencyMap[abbreviation]?.symbol || '';
  }

  getCurrencyFlag(abbreviation: string): string {
    return this.currencyMap[abbreviation]?.flag || '';
  }
}
