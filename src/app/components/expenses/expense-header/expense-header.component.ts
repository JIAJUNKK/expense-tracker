import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { CurrencyConversionService } from '../../../services/shared/currenyConversion.service';
import { GlobalService } from '../../../services/shared/global.service';

@Component({
  selector: 'app-expense-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-header.component.html',
  styleUrls: ['./expense-header.component.scss']
})
export class ExpenseHeaderComponent {
  private globalService = inject(GlobalService);
  private currencyConversionService = inject(CurrencyConversionService);
  private expenseService = inject(ExpenseService);

  currencySymbol = computed(() => this.globalService.userCurrency().symbol);
  baseCurrency = computed(() => this.globalService.userCurrency().abbreviation);
  totalSpent = signal<number>(0);

  selectedFilter = signal<'all' | 'year'>('all');
  isDropdownOpen = signal<boolean>(false);

  constructor() {
    this.fetchTotalSpent();
    effect(() => {
      this.fetchTotalSpent(); 
    });
  }

  async fetchTotalSpent() {
    if (this.selectedFilter() === 'all') {
      const expenses = await this.expenseService.fetchAllExpenses();

      const convertedExpenses = expenses.map(expense => ({
        ...expense,
        amount: this.currencyConversionService.convertAmount(expense.amount, expense.currency)
      }));

      const total = convertedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      this.totalSpent.set(total);
    } else {
      const year = new Date().getFullYear().toString();
      const expenses = await this.expenseService.fetchExpenses(undefined, year);
      const convertedExpenses = expenses.map(expense => ({
        ...expense,
        amount: this.currencyConversionService.convertAmount(expense.amount, expense.currency)
      }));
      const total = convertedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      this.totalSpent.set(total);
    }
  }

  toggleDropdown() {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  selectFilter(filter: 'all' | 'year') {
    this.selectedFilter.set(filter);
    this.isDropdownOpen.set(false);
  }
}
