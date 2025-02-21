import { Component, AfterViewInit, Input, WritableSignal, inject, effect, runInInjectionContext, Injector} from '@angular/core';
import Chart from 'chart.js/auto';
import { GlobalService } from '../../../services/shared/global.service';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { ExpenseHelper } from '../../../services/firebase/Firestore/expense.service';
import { Expense } from '../../../utils/app.model';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  templateUrl: './expense-chart.component.html',
  styleUrls: ['./expense-chart.component.scss']
})
export class ExpenseChartComponent implements AfterViewInit {
  private injector = inject(Injector);
  private expenseService = inject(ExpenseService);
  private globalService = inject(GlobalService);
  private chart: Chart | null = null;
  @Input() filter!: WritableSignal<string>; 

  constructor() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.updateChart(); 
      });
    });
  }
  async updateChart() {
    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;

    const expenses = await this.expenseService.fetchExpenses(this.filter());
    const categoryTotals = this.calculateCategoryTotals(expenses);
    const currencySymbol = this.globalService.userCurrency().symbol;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categoryTotals.map(ct => ct.category), // ✅ Y-Axis: Categories
        datasets: [
          {
            label: `Total Spendings (${currencySymbol})`,
            data: categoryTotals.map(ct => ct.total), // ✅ X-Axis: Spendings
            backgroundColor: categoryTotals.map(ct => ExpenseHelper.getExpenseColor(ct.category)),
            categoryPercentage: 0.8, 
            borderRadius: 5,
            barThickness: 20,
          }
        ]
      },
      options: {
        indexAxis: 'y', // ✅ Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: `Spendings (${currencySymbol})`,
            },
          },
          y: {
            title: {
              display: true,
            },
            ticks: {
              autoSkip: false,
              font: {
                size: 10 
              },
            },
            
          }
        },
        plugins: {
          legend: {
            display: true
          }
        },
        layout: {
          padding: {
            right: 0, 
            left: 0,
          },
        }
      }
    });
  }

  calculateCategoryTotals(expenses: Expense[]) {
    const categoryMap: { [category: string]: number } = {};

    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += expense.amount;
    });

    return Object.entries(categoryMap).map(([category, total]) => ({ category, total }));
  }

  ngAfterViewInit() {
    this.updateChart();
  }  
}
