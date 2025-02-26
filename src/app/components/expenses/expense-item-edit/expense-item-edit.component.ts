import { Component, inject, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { Expense } from '../../../utils/app.model';
import { DateUtils } from '../../../utils/date.utils';
import { CategoryUtils } from '../../../utils/categories.utils';
import { UserService } from '../../../services/firebase/Firestore/user.service';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { CurrencyService } from '../../../services/currency.service';
import { AuthProvider } from '../../../context/auth-provider';

import { CurrencyDropdownComponent } from '../../currency-dropdown/currency-dropdown.component';
@Component({
  selector: 'app-expense-item-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyDropdownComponent],
  templateUrl: './expense-item-edit.component.html',
  styleUrls: ['./expense-item-edit.component.scss'],
})
export class ExpenseItemEditComponent {
  private userService = inject(UserService);
  private expenseService = inject(ExpenseService);
  private currencyService = inject(CurrencyService);
  private authProvider = inject(AuthProvider);

  CategoryUtils = CategoryUtils;
  @Input() expense!: Expense;
  @Output() closeModal = new EventEmitter<void>();
  @Output() expenseUpdated = new EventEmitter<Expense>();

  currencyList = this.currencyService.getCurrencies();
  userCategories = signal<string[]>([]);
  editedExpense = signal<Expense>({ ...this.expense });
  editedDate = signal<string>('');
  isClosing = signal<boolean>(false);
  isCurrencyDropdownOpen = signal<boolean>(false);

  currencySymbol = signal<string>(this.editedExpense().currency);

  async fetchUserCategories() {
    const userId = this.authProvider.user()?.uid;
    if (userId) {
      const categories = await this.userService.getUserCategories(userId);
      this.userCategories.set(categories);
    }
  }

  toggleCurrencyDropdown() {
    this.isCurrencyDropdownOpen.set(!this.isCurrencyDropdownOpen());
  }

  animateClose() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.closeModal.emit();
    }, 300); 
  }

  selectCurrency(currencyAbbr: string) {
    this.editedExpense.set({
      ...this.editedExpense(),
      currency: currencyAbbr,
    });
    this.currencySymbol.set(this.getCurrencySymbol(currencyAbbr));
    this.isCurrencyDropdownOpen.set(false);
  }

  getCurrencySymbol(currencyAbbr: string): string {
    const currency = this.currencyList.find(c => c.abbreviation === currencyAbbr);
    return currency ? currency.symbol : currencyAbbr;
  }

  isSaveDisabled(): boolean {
    const originalExpense = this.expense;
    const updatedExpense = this.editedExpense();

    const noChanges = JSON.stringify(originalExpense) === JSON.stringify(updatedExpense);
    const invalidAmount = updatedExpense.amount === null || updatedExpense.amount === undefined || updatedExpense.amount === 0;
    const invalidItem = !updatedExpense.item || updatedExpense.item.trim() === '';

    return noChanges || invalidAmount || invalidItem;
  }

  saveChanges() {
    if (this.isSaveDisabled()) return;
    const originalExpense = this.expense;
    const updatedExpense: Expense = {
      ...this.editedExpense(),
      date: DateUtils.convertDateToTimestamp(this.editedDate()),
    };
    this.expenseService.updateExpense(originalExpense, updatedExpense).then(() => {
      this.expenseUpdated.emit(updatedExpense);
      this.closeModal.emit();
      this.animateClose();
    });
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event) {
    const dropdown = document.querySelector('.currency-dropdown');
    const button = document.querySelector('.currency-selector-wrapper');

    if (
      this.isCurrencyDropdownOpen() &&
      dropdown &&
      !dropdown.contains(event.target as Node) &&
      button &&
      !button.contains(event.target as Node)
    ) {
      this.isCurrencyDropdownOpen.set(false);
    }
  }
  
  async ngOnInit() {
    document.body.style.overflow = 'hidden';
    this.editedDate.set(DateUtils.convertTimestampToDate(this.expense.date as Timestamp));
    this.editedExpense.set({ ...this.expense });
    this.currencySymbol.set(this.getCurrencySymbol(this.editedExpense().currency));
    await this.fetchUserCategories();
  }
  ngOnDestroy() {
    document.body.style.overflow = '';
  }
}
