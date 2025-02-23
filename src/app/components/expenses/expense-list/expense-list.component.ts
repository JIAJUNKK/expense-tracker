import { Component, OnInit, Input, WritableSignal, inject, signal, computed, effect, runInInjectionContext, Injector} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/shared/global.service';
import { CurrencyConversionService } from '../../../services/shared/currenyConversion.service';
import { CurrencyService } from '../../../services/currency.service';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { Expense } from '../../../utils/app.model';
import { CategoryUtils } from '../../../utils/categories.utils';
import { Timestamp } from 'firebase/firestore';
import { ExpenseItemEditComponent } from '../expense-item-edit/expense-item-edit.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, ExpenseItemEditComponent],
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

  isEditModalOpen = signal(false);
  selectedExpense = signal<Expense | null>(null);

  constructor() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (this.filter()) {
          this.fetchExpenses();
        }
      });
      this.expenseService.expenseUpdateNotifier.subscribe(() => {
        console.log("Expense updated, re-fetching expesnes...");
        this.fetchExpenses();
      });
    });
  }

  async fetchExpenses() {
    await this.currencyConversionService.fetchExchangeRates(this.baseCurrency());
    const fetchedExpenses = await this.expenseService.fetchExpenses(this.filter());
    this.expenses.set(fetchedExpenses.map(exp => ({ ...exp, id: exp.id })));
  }

  openEditModal(expense: Expense) {
    const filteredExpense = {
      amount: expense.amount,
      category: expense.category,
      currency: expense.currency,
      date: expense.date,
      item: expense.item,
      notes: expense.notes, 
      id: expense.id,
    };
    this.selectedExpense.set(filteredExpense as Expense);
    this.isEditModalOpen.set(true);
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedExpense.set(null);
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

  updateExpense(updatedExpense: Expense) {
    const originalExpense = this.expenses().find(exp => exp.id === updatedExpense.id);
    if (!originalExpense) return;

    const enrichedExpense = {
      ...updatedExpense,
      color: CategoryUtils.getExpenseColor(updatedExpense.category),
      icon: CategoryUtils.getExpenseIcon(updatedExpense.category),
    };
  
    const updatedExpenses = this.expenses().map(exp => 
      exp.id === updatedExpense.id ? enrichedExpense : exp
    );
  
    this.expenses.set(updatedExpenses);
    this.expenseService.updateExpense(originalExpense, updatedExpense);
    this.closeEditModal();
  }

  ngOnInit() {
    this.fetchExpenses();
  }
}
