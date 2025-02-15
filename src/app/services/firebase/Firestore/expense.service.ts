import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, getDocs, query, addDoc } from '@angular/fire/firestore';
import { AuthProvider } from '../../../context/auth-provider';

export interface Expense {
  id?: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  color?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private injector = inject(Injector); 
  private firestore = inject(Firestore);
  private authProvider = inject(AuthProvider);

  private getExpenseCollection(): string {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' });
    const year = now.getFullYear();
    return `${month}_${year}`;
  }

  async fetchExpenses(): Promise<Expense[]> {
    if (!this.authProvider.user()) return [];

    const userId = this.authProvider.user()?.uid;
    const monthYear = this.getExpenseCollection();

    return runInInjectionContext(this.injector, async () => {
      const expenseRef = collection(this.firestore, `expenses/${userId}/${monthYear}`);
      const expenseQuery = query(expenseRef);
      const expenseDocs = await getDocs(expenseQuery);

      return expenseDocs.docs.map(doc => {
        const data = doc.data() as Expense;
        return {
          id: doc.id,
          ...data,
          category: data['type'],
          color: ExpenseHelper.getExpenseColor(data['type']),
          icon: ExpenseHelper.getExpenseIcon(data['type'])
        };
      });
    });
  }

  async getExpenseSummary() {
    return runInInjectionContext(this.injector, async () => { 
      const expenses = await this.fetchExpenses();
      const today = new Date().toISOString().split('T')[0];

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to Sunday

      const totalDay = expenses
        .filter(expense => expense.date.startsWith(today))
        .reduce((sum, exp) => sum + exp.amount, 0)
        .toFixed(2);

      const totalWeek = expenses
        .filter(expense => new Date(expense.date) >= startOfWeek)
        .reduce((sum, exp) => sum + exp.amount, 0)
        .toFixed(2);

      const totalMonth = expenses
        .reduce((sum, exp) => sum + exp.amount, 0)
        .toFixed(2);

      return { 
        totalDay: parseFloat(totalDay), 
        totalWeek: parseFloat(totalWeek), 
        totalMonth: parseFloat(totalMonth) 
      };
    });
  }

  async addExpense(expense: Expense): Promise<void> {
    if (!this.authProvider.user()) return;

    const userId = this.authProvider.user()?.uid;
    const monthYear = this.getExpenseCollection();

    return runInInjectionContext(this.injector, async () => { 
      const expenseRef = collection(this.firestore, `expenses/${userId}/${monthYear}`);
      await addDoc(expenseRef, expense);
    });
  }
}

/**
 * 🔹 Utility class for expense-related helper functions
 */
export class ExpenseHelper {
  static getExpenseColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      Transport: '#D4F8C9',
      Groceries: '#FFD3B4',
      Bill: '#FFB3B3',
      Entertainment: '#E5D3FF',
      Meal: '#A3C4BC',
      Travel: '#F9D5E5'
    };
    return colorMap[type] || '#E0E0E0';
  }

  static getExpenseIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      Transport: 'fas fa-bus',
      Groceries: 'fas fa-shopping-cart',
      Bill: 'fas fa-file-invoice',
      Entertainment: 'fas fa-music',
      Meal: 'fas fa-utensils',
      Travel: 'fas fa-plane'
    };
    return iconMap[type] || 'fas fa-question-circle';
  }
}
