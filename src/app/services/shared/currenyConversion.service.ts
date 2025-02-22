import { Injectable, Injector, signal, inject, effect, runInInjectionContext } from '@angular/core';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root',
})
export class CurrencyConversionService {
    private injector = inject(Injector);
    private globalService = inject(GlobalService);
    private exchangeRates = signal<{ [key: string]: number }>({}); 
    private lastFetched = signal<number>(0); 

    constructor() {
        runInInjectionContext(this.injector, () => {
        effect(() => {
            const baseCurrency = this.globalService.userCurrency().abbreviation;
            console.log('CurrencyConversionService: ', baseCurrency);
            this.fetchExchangeRates(baseCurrency);
        });
        });
    }

    async fetchExchangeRates(baseCurrency: string) {
        if (!baseCurrency) return; 

        const now = Date.now();
        if (now - this.lastFetched() < 3600000 && Object.keys(this.exchangeRates()).length) return; // Cache for 1 hour

        try {
        console.log(`Fetching exchange rates for: ${baseCurrency}`);
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        const data = await response.json();
        this.exchangeRates.set(data.rates);
        this.lastFetched.set(now);
        } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        }
    }

    convertAmount(amount: number, fromCurrency: string): number {

        const rates = this.exchangeRates();
        const baseCurrency = this.globalService.userCurrency().abbreviation;

        if (!rates[fromCurrency] || !rates[baseCurrency]) return amount; 
        return (amount / rates[fromCurrency]) * rates[baseCurrency];
    }
}
