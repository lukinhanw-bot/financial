export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  is_recurring?: boolean;
  recurring_type?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurring_interval?: number;
  recurring_end_date?: string;
  parent_transaction_id?: string;
  createdAt: string;
}

export interface DailyBalance {
  date: string;
  balance: number;
  transactions: Transaction[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}