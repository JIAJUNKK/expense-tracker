import { Component, OnInit, Input, WritableSignal, inject, signal, computed, effect, runInInjectionContext, Injector} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/shared/global.service';
import { CurrencyConversionService } from '../../../services/shared/currenyConversion.service';
import { CurrencyService } from '../../../services/currency.service';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { Expense } from '../../../utils/app.model';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  private injector = inject(Injector);
  private expenseService = inject(ExpenseService);
  private currencyService = inject(CurrencyService);
  private globalService = inject(GlobalService);
  private currencyConversionService = inject(CurrencyConversionService);

  @Input() filter!: WritableSignal<string>;
  expenses = signal<Expense[]>([]);
  groupedExpenses = computed(() => this.groupExpensesByDate(this.expenses()));
  currencySymbol = computed(() => this.globalService.userCurrency().symbol);
  baseCurrency = computed(() => this.globalService.userCurrency().abbreviation);


  constructor() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (this.filter()) {
          this.fetchExpenses();
        }
      });
    });
  }

  async fetchExpenses() {
    await this.currencyConversionService.fetchExchangeRates(this.baseCurrency());
    const fetchedExpenses = await this.expenseService.fetchExpenses(this.filter());
    this.expenses.set(fetchedExpenses);
  }

  groupExpensesByDate(expenses: Expense[]): { date: string; items: Expense[] }[] {
    const grouped: { [key: string]: Expense[] } = {};

    expenses.forEach(expense => {
      const date = (expense.date as Timestamp).toDate().toDateString(); // Format date
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(expense);
    });

    return Object.keys(grouped).map(date => ({
      date,
      items: grouped[date]
    }));
  }

  getConvertedAmount(expense: Expense): string {
    if (expense.currency === this.baseCurrency()) {
      return ''; 
    }
    const convertedAmount = this.currencyConversionService.convertAmount(expense.amount, expense.currency);
    return `${this.currencySymbol()}${convertedAmount.toFixed(2)}`;
  }

  getCurrencySymbol(currencyAbbr: string): string {
    return this.currencyService.getCurrencySymbol(currencyAbbr);
  }

  getCurrencyFlag(currencyAbbr: string): string {
    return this.currencyService.getCurrencyFlag(currencyAbbr);
  }

  ngOnInit() {
    this.fetchExpenses();
  }
}
