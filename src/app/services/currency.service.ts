import { Injectable } from '@angular/core';
import { Currency } from '../utils/app.model';
import { CURRENCIES } from '../utils/currencies';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  getCurrencies(): Currency[] {
    return CURRENCIES;
  }
}
