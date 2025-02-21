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
  currency: string;
}

export interface Currency {
  name: string;
  abbreviation: string;
  symbol: string;
  flag: string;
}