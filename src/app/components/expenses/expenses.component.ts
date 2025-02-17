import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseHeaderComponent } from './expense-header/expense-header.component';
import { ExpenseFilterBarComponent } from './expense-filter-bar/expense-filter-bar.component';
import { ExpenseListComponent } from './expense-list/expense-list.component'; 
import { ExpenseSummaryComponent } from './expense-summary/expense-summary.component';
import { ExpenseChartComponent } from './expense-chart/expense-chart.component';

export interface Expense {
  id?: string;
  type: string;
  amount: number;
  date: Date;
  notes?: string;
}

const EXPENSE_TYPES = [
  'Transport', 'Groceries', 'Bill', 'Entertainment', 'Meal', 'Travel'
];

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ExpenseHeaderComponent,
    ExpenseFilterBarComponent,
    ExpenseListComponent, 
    ExpenseSummaryComponent, 
    ExpenseChartComponent
  ],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {
  filter = signal<string>(''); 

  onFilterChange(selectedFilter: string) {
    this.filter.set(selectedFilter);
  }
}
