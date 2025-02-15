import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';

@Component({
  selector: 'app-expense-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-summary.component.html',
  styleUrls: ['./expense-summary.component.scss']
})
export class ExpenseSummaryComponent implements OnInit {
  private expenseService = inject(ExpenseService);

  totalDay = signal(0);
  totalWeek = signal(0);
  totalMonth = signal(0);

  async fetchExpenseSummary() {
    const summary = await this.expenseService.getExpenseSummary();
    this.totalDay.set(summary.totalDay);
    this.totalWeek.set(summary.totalWeek);
    this.totalMonth.set(summary.totalMonth);
  }

  ngOnInit() {
    this.fetchExpenseSummary();
  }
}
