import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { Expense } from '../../../utils/expense.model';

import { ExpenseHelper } from '../../../services/firebase/Firestore/expense.service';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { GlobalService } from '../../../services/shared/global.service';

@Component({
  selector: 'app-add-expense-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-expense-modal.component.html',
  styleUrls: ['./add-expense-modal.component.scss'],
})
export class AddExpenseModalComponent {
  private expenseService = inject(ExpenseService);
  public modalService = inject(GlobalService);
  private touchStartY = 0;
  private currentTranslateY = 0;
  public modalStyle = {};

  selectedDateText: string = "Select Date";
  categories: string[] = ['Transport', 'Groceries', 'Bill', 'Entertainment', 'Meal', 'Travel'];
  selectedCategoryIcon: string = ExpenseHelper.getExpenseIcon(this.categories[0]);
  today = new Date().toISOString().split('T')[0];

  expense: Expense = {
    category: this.categories[0],
    item: '',
    amount: 0,
    date: Timestamp.fromDate(new Date()),
    icon: this.selectedCategoryIcon,
    notes: '', 
  };

  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent) {
    const touchMoveY = event.touches[0].clientY;
    this.currentTranslateY = Math.max(0, touchMoveY - this.touchStartY); // Prevent moving up
    this.modalStyle = { transform: `translateY(${this.currentTranslateY}px)` };
  }

  onTouchEnd() {
    if (this.currentTranslateY > 150) {
      // Close modal if swiped far enough
      this.modalService.closeExpenseModal();
    } else {
      // Animate back up if not enough swipe distance
      this.modalStyle = { transform: 'translateY(0px)', transition: 'transform 0.3s ease-out' };
    }
  }

  formatAmount(): string {
    return this.expense.amount.toFixed(2); // Ensures two decimal places
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardInput(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace'];
  
    if (!allowedKeys.includes(event.key)) return;
  
    let amountStr = (this.expense.amount * 100).toFixed(0); 
  
    if (event.key === 'Backspace') {
      amountStr = amountStr.slice(0, -1) || '0';
    } else {
      amountStr += event.key;
    }
  
    this.expense.amount = parseFloat(amountStr) / 100;
  }

  addDigit(digit: string) {
    let amountStr = (this.expense.amount * 100).toFixed(0);
  
    if (digit === '⌫') {
      amountStr = amountStr.slice(0, -1) || '0';
    } else if (/^\d$/.test(digit)) {
      amountStr += digit;
    }
  
    this.expense.amount = parseFloat(amountStr) / 100; // Convert back to decimal
  }

  validateAmountInput(event: Event) {
    let input = (event.target as HTMLInputElement).value;
  
    // Remove any non-numeric characters (letters, symbols, etc.)
    input = input.replace(/\D/g, '');
  
    // Ensure at least "0" is present
    if (input === '') {
      input = '0';
    }
  
    // Convert back to decimal format (two decimal places)
    const numericValue = parseFloat(input) / 100;
    this.expense.amount = numericValue;
  }
  
  selectDate() {
    const input = document.createElement('input');
    input.type = 'date';
    input.style.position = 'absolute';
    input.style.opacity = '0';
    document.body.appendChild(input);
  
    input.addEventListener('change', () => {
      if (input.value) {
        this.expense.date = Timestamp.fromDate(new Date(input.value));
      }
      document.body.removeChild(input);
    });
  
    input.click();
  }


  openDatePicker() {
    const dateInput = document.querySelector('.hidden-date-input') as HTMLInputElement;
    if (dateInput) {
      dateInput.showPicker(); // Opens native date picker
    }
  }

  updateDate(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.expense.date = Timestamp.fromDate(new Date(input.value));
      this.selectedDateText = new Date(input.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  
  isFormValid(): boolean {
    return (
      this.expense.item.trim() !== '' && 
      this.expense.category.trim() !== '' && 
      this.expense.amount > 0 &&
      this.expense.date !== null
    );
  }

  updateCategoryIcon() {
    this.selectedCategoryIcon = ExpenseHelper.getExpenseIcon(this.expense.category);
  }

  async addExpense() {
    await this.expenseService.addExpense(this.expense);
    this.modalService.closeExpenseModal();
  }
}
