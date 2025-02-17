import { Component, OnInit, Input, WritableSignal, inject, signal, computed, effect, runInInjectionContext, Injector} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalService } from '../../../services/shared/global.service';
import { ExpenseService } from '../../../services/firebase/Firestore/expense.service';
import { Expense } from '../../../utils/app.model';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  private injector = inject(Injector);
  private expenseService = inject(ExpenseService);
  private globalService = inject(GlobalService);

  @Input() filter!: WritableSignal<string>;
  expenses = signal<Expense[]>([]);
  currencySymbol = computed(() => this.globalService.userCurrency().symbol);


  constructor() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.fetchExpenses(); 
      });
    });
  }

  async fetchExpenses() {
    const fetchedExpenses = await this.expenseService.fetchExpenses(this.filter());
    this.expenses.set(fetchedExpenses);
  }

  ngOnInit() {
    this.fetchExpenses();
  }
}
