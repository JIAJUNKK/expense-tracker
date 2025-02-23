import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, getDocs, getDoc, doc, query, setDoc, addDoc, Timestamp} from '@angular/fire/firestore';
import { AuthProvider } from '../../../context/auth-provider';
import { Expense } from '../../../utils/app.model';
import { CategoryUtils } from '../../../utils/categories.utils';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private injector = inject(Injector); 
  private firestore = inject(Firestore);
  private authProvider = inject(AuthProvider);

  async fetchExpenses(selectedMonthYear?: string, selectedYear?: string): Promise<Expense[]> {
    if (!this.authProvider.user()) return [];
    const userId = this.authProvider.user()?.uid;
  
    return runInInjectionContext(this.injector, async () => {
      let allExpenses: Expense[] = [];
  
      // Default to the current month and year if no filter is provided
      if (!selectedMonthYear && !selectedYear) {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'short' });
        const year = now.getFullYear().toString();
        selectedMonthYear = `${month}_${year}`;
      }
  
      if (selectedMonthYear) {
        const year = selectedMonthYear.split('_')[1] || new Date().getFullYear().toString();
        const monthRef = collection(this.firestore, `expenses/${userId}/meta/${year}/${selectedMonthYear}`);
        const monthDocs = await getDocs(monthRef);
  
        return monthDocs.docs.map(doc => {
          const data = doc.data() as Expense;
          return {
            id: doc.id,
            ...data,
            category: data['category'],
            item: data['item'],
            color: CategoryUtils.getExpenseColor(data['category']),
            icon: CategoryUtils.getExpenseIcon(data['category']),
          };
        });
      }
  
      // Fetching all expenses for a specific year
      if (selectedYear) {
        console.log(`Fetching all expenses for ${selectedYear}`);
  
        const yearMetaRef = doc(this.firestore, `expenses/${userId}/meta/${selectedYear}`);
        const yearMetaSnap = await getDoc(yearMetaRef);
  
        if (!yearMetaSnap.exists()) {
          console.log(`No expenses found for ${selectedYear}`);
          return [];
        }
  
        const months: string[] = yearMetaSnap.data()['months'] || [];
        for (const monthYear of months) {
          const monthRef = collection(this.firestore, `expenses/${userId}/meta/${selectedYear}/${monthYear}`);
          const monthDocs = await getDocs(monthRef);
  
          const monthExpenses = monthDocs.docs.map(doc => {
            const data = doc.data() as Expense;
            return {
              id: doc.id,
              ...data,
              category: data['category'],
              item: data['item'],
              color: CategoryUtils.getExpenseColor(data['category']),
              icon: CategoryUtils.getExpenseIcon(data['category']),
            };
          });
  
          allExpenses = [...allExpenses, ...monthExpenses];
        }
        return allExpenses;
      }
  
      return allExpenses;
    });
  }

  async getExpenseSummary() {
    return runInInjectionContext(this.injector, async () => { 
      const expenses = await this.fetchExpenses();
      
      const today = new Date().toISOString().split('T')[0];
  
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Set to Sunday
      startOfWeek.setHours(0, 0, 0, 0); // Reset time to midnight
  
      const totalDay = expenses
        .filter(expense => {
          const expenseDate = (expense.date as Timestamp).toDate();
          return expenseDate.toISOString().split('T')[0] === today;
        })
        .reduce((sum, exp) => sum + exp.amount, 0)
        .toFixed(2);
  
      const totalWeek = expenses
        .filter(expense => {
          const expenseDate = (expense.date as Timestamp).toDate();
          return expenseDate >= startOfWeek;
        })
        .reduce((sum, exp) => sum + exp.amount, 0)
        .toFixed(2);
  
      const totalMonth = expenses
        .reduce((sum, exp) => sum + exp.amount, 0)
        .toFixed(2);
  
      return { 
        totalDay, 
        totalWeek, 
        totalMonth,
      };
    });
  }

  async addExpense(expense: Expense): Promise<void> {
    if (!this.authProvider.user()) return;

    const userId = this.authProvider.user()?.uid;
    const date = (expense.date as Timestamp).toDate();
    const year = date.getFullYear().toString();

    const monthYear = `${date.toLocaleString('default', { month: 'short' })}_${year}`;

    return runInInjectionContext(this.injector, async () => { 
      const expenseRef = collection(this.firestore, `expenses/${userId}/meta/${year}/${monthYear}`);
      await addDoc(expenseRef, expense);
      const yearMetaRef = doc(this.firestore, `expenses/${userId}/meta/${year}`);
      const yearMetaSnap = await getDoc(yearMetaRef);
      const existingMonths: string[] = yearMetaSnap.exists() ? yearMetaSnap.data()['months'] : [];
  
      if (!existingMonths.includes(monthYear)) {
        existingMonths.push(monthYear);
        await setDoc(yearMetaRef, { months: existingMonths }, { merge: true });
      }
    });
  }

  async fetchAvailableMonths(year: string): Promise<string[]> {
    if (!this.authProvider.user()) return [];
    const userId = this.authProvider.user()?.uid;
  
    return runInInjectionContext(this.injector, async () => {
      const yearMetaRef = doc(this.firestore, `expenses/${userId}/meta/${year}`);
      const yearMetaSnap = await getDoc(yearMetaRef);
  
      if (!yearMetaSnap.exists()) {
        console.log(`No months found for year ${year}`);
        return [];
      }
  
      return yearMetaSnap.data()['months'] || [];
    });
  }
  
  async fetchAllExpenses(): Promise<Expense[]> {
    if (!this.authProvider.user()) return [];
    const userId = this.authProvider.user()?.uid;
  
    return runInInjectionContext(this.injector, async () => {
      let allExpenses: Expense[] = [];
  
      // Fetch metadata to get all recorded years
      const metaRef = collection(this.firestore, `expenses/${userId}/meta`);
      const yearsSnapshot = await getDocs(metaRef);
  
      for (const yearDoc of yearsSnapshot.docs) {
        const year = yearDoc.id;
        const yearMetaRef = doc(this.firestore, `expenses/${userId}/meta/${year}`);
        const yearMetaSnap = await getDoc(yearMetaRef);
  
        if (yearMetaSnap.exists()) {
          const months: string[] = yearMetaSnap.data()['months'] || [];
  
          for (const monthYear of months) {
            const monthRef = collection(this.firestore, `expenses/${userId}/meta/${year}/${monthYear}`);
            const monthDocs = await getDocs(monthRef);
  
            const monthExpenses = monthDocs.docs.map(doc => {
              const data = doc.data() as Expense;
              return {
                id: doc.id,
                ...data,
                category: data['category'],
                item: data['item'],
                color: CategoryUtils.getExpenseColor(data['category']),
                icon: CategoryUtils.getExpenseIcon(data['category']),
              };
            });
  
            allExpenses = [...allExpenses, ...monthExpenses];
          }
        }
      }
      return allExpenses;
    });
  }
  
  async updateExpense(expense: Expense): Promise<void> {
    if (!this.authProvider.user() || !expense.id) return;
  
    const userId = this.authProvider.user()?.uid;
    const date = (expense.date as Timestamp).toDate();
    const year = date.getFullYear().toString();
    const monthYear = `${date.toLocaleString('default', { month: 'short' })}_${year}`;
  
    return runInInjectionContext(this.injector, async () => {
      const { id, ...expenseData } = expense;
      const expenseRef = doc(this.firestore, `expenses/${userId}/meta/${year}/${monthYear}/${expense.id}`);
      await setDoc(expenseRef, expenseData, { merge: true });
    });
  }
}

