import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { Expense } from '../../../utils/app.model';
import { DateUtils } from '../../../utils/date.utils';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { CurrencyService } from '../../../services/currency.service';

@Component({
  selector: 'app-expense-item-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expense-item-edit.component.html',
  styleUrls: ['./expense-item-edit.component.scss'],
})
export class ExpenseItemEditComponent {
  private expenseService = inject(ExpenseService);
  private currencyService = inject(CurrencyService);

  @Input() expense!: Expense;
  @Output() closeModal = new EventEmitter<void>();
  @Output() expenseUpdated = new EventEmitter<Expense>();

  currencyList = this.currencyService.getCurrencies();
  editedExpense = signal<Expense>({ ...this.expense });
  editedDate = signal<string>('');

  saveChanges() {
    const originalExpense = this.expense;
    const updatedExpense: Expense = {
      ...this.editedExpense(),
      date: DateUtils.convertDateToTimestamp(this.editedDate()),
    };
    this.expenseService.updateExpense(originalExpense, updatedExpense).then(() => {
      this.expenseUpdated.emit(updatedExpense);
      this.closeModal.emit();
    });
  }

  ngOnInit() {
    console.log(this.expense);
    this.editedDate.set(DateUtils.convertTimestampToDate(this.expense.date as Timestamp));
    this.editedExpense.set({ ...this.expense });
  }
}
