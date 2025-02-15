import { Timestamp } from 'firebase/firestore';

export interface Expense {
  id?: string;
  category: string;
  item: string;
  amount: number;
  date: Timestamp | null;
  notes?: string;
  color?: string;
  icon?: string;
}
