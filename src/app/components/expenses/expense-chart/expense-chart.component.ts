import { Component, inject, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  templateUrl: './expense-chart.component.html',
  styleUrls: ['./expense-chart.component.scss']
})
export class ExpenseChartComponent implements AfterViewInit {
  
  ngAfterViewInit() {
    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['1', '5', '10', '15', '20', '25', '31'],
        datasets: [
          {
            label: 'Expenses',
            data: [12, 3, 5, 32, 21, 13, 5],
            backgroundColor: ['#F18C8E', '#568EA6', '#F1D1B5', '#F0B7A4', '#305F72', '#F18C8E', '#F1D1B5']
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
