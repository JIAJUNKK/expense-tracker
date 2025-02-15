import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { Expense } from '../../../utils/expense.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  expenses = signal<Expense[]>([]);

  async fetchExpenses() {
    const fetchedExpenses = await this.expenseService.fetchExpenses();
    this.expenses.set(fetchedExpenses);
    console.log(fetchedExpenses);
  }

  ngOnInit() {
    this.fetchExpenses();
  }
}
