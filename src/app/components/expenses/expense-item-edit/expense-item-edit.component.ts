import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
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

@Component({
  selector: 'app-expense-item-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
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


  async fetchUserCategories() {
    const userId = this.authProvider.user()?.uid;
    if (userId) {
      const categories = await this.userService.getUserCategories(userId);
      this.userCategories.set(categories);
    }
  }

  animateClose() {
    this.isClosing.set(true);
    setTimeout(() => {
      this.closeModal.emit();
    }, 300); 
  }

  saveChanges() {
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

  async ngOnInit() {
    this.editedDate.set(DateUtils.convertTimestampToDate(this.expense.date as Timestamp));
    this.editedExpense.set({ ...this.expense });
    await this.fetchUserCategories();
  }
}
