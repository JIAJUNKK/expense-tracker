import { Component, inject, signal, OnInit, computed, effect, Input, WritableSignal, runInInjectionContext, Injector} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../../../utils/app.model';
import { GlobalService } from '../../../services/shared/global.service';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-expense-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-summary.component.html',
  styleUrls: ['./expense-summary.component.scss']
})
export class ExpenseSummaryComponent implements OnInit {
  private injector = inject(Injector);
  private expenseService = inject(ExpenseService);
  private globalService = inject(GlobalService);

  @Input() filter!: WritableSignal<string>; // ✅ Accepts the selected filter

  currencySymbol = computed(() => this.globalService.userCurrency().symbol);

  totalDay = signal('0.00'); 
  totalWeek = signal('0.00');
  totalMonth = signal('0.00');
  totalYear = signal('0.00');

  // Extract year dynamically from the filter
  selectedMonthYear = computed(() => this.filter() || this.getCurrentMonthYear()); 
  selectedYear = computed(() => this.selectedMonthYear().split('_')[1]); 

  isCurrentMonth = computed(()=>this.selectedMonthYear() === this.getCurrentMonthYear());

  constructor() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.fetchExpenseSummary(); 
      });
    });
  }

  ngOnInit() {
    this.fetchExpenseSummary();
  }

  async fetchExpenseSummary() {
    const monthYear = this.selectedMonthYear();
    const year = this.selectedYear();

    const expenses = await this.expenseService.fetchExpenses(monthYear, year);
    
    console.log(`Fetching expenses for: ${monthYear}`);

    // Calculate total monthly spend
    const totalMonthValue = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    this.totalMonth.set(totalMonthValue.toFixed(2));

    // Fetch total yearly spend
    const yearlyExpenses = await this.expenseService.fetchExpenses(undefined, year);
    const totalYearValue = yearlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    this.totalYear.set(totalYearValue.toFixed(2));

    // Calculate daily and weekly spend
    this.calculateDailySpend(expenses);
    this.calculateWeeklySpend(expenses);
  }

  calculateDailySpend(expenses: Expense[]) {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const currentMonthYear = this.getCurrentMonthYear();

    if (this.selectedMonthYear() === currentMonthYear) {
      // If viewing the current month, calculate today's spend
      const totalDayValue = expenses
        .filter(exp => {
          const expenseDate = (exp.date as Timestamp).toDate().toISOString().split('T')[0];
          return expenseDate === todayString;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      this.totalDay.set(totalDayValue.toFixed(2));
    } else {
      // If viewing past months, calculate the average daily spend
      if (expenses.length > 0) {
        const totalMonthValue = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const [month, year] = this.selectedMonthYear().split('_');
        const daysInMonth = new Date(parseInt(year), this.getMonthIndex(month) + 1, 0).getDate();
        const avgDailySpend = totalMonthValue / daysInMonth;

        console.log(`Avg Daily Spend: ${avgDailySpend}`);
        this.totalDay.set(avgDailySpend.toFixed(2));
      } else {
        this.totalDay.set('0.00');
      }
    }
  }

  calculateWeeklySpend(expenses: Expense[]) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Move to Sunday (start of the week)
    startOfWeek.setHours(0, 0, 0, 0); // Reset to start of the day

    const currentMonthYear = this.getCurrentMonthYear();

    if (this.selectedMonthYear() === currentMonthYear) {
      // **For the current month, calculate expenses within the current week**
      const totalWeekValue = expenses
        .filter(exp => {
          const expenseDate = (exp.date as Timestamp).toDate();
          return expenseDate >= startOfWeek;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      this.totalWeek.set(totalWeekValue.toFixed(2));
    } else {
      // **For past months, calculate the average weekly spend**
      if (expenses.length > 0) {
        const totalMonthValue = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const [month, year] = this.selectedMonthYear().split('_');
        const daysInMonth = new Date(parseInt(year), this.getMonthIndex(month) + 1, 0).getDate();
        const weeksInMonth = Math.ceil(daysInMonth / 7);

        const avgWeeklySpend = totalMonthValue / weeksInMonth;
        console.log(`Avg Weekly Spend: ${avgWeeklySpend}`);
        this.totalWeek.set(avgWeeklySpend.toFixed(2));
      } else {
        this.totalWeek.set('0.00');
      }
    }
  }

  getMonthIndex(month: string): number {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(month);
  }

  getCurrentMonthYear(): string {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear().toString();
    return `${month}_${year}`;
  }
}
