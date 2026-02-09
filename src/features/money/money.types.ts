export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  date: string;
  created_at?: string;
}

export interface TransactionInsert {
  amount: number;
  description: string;
  type: 'income' | 'expense';
}

export type MonthKey = `${number}-${string}`; // "YYYY-MM"

export type MonthlyIncome = {
  id: string;
  user_id: string;
  month: MonthKey;
  amount: number;
  created_at: string;
};

export type FixedExpense = {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  created_at: string;
};

export type SavingsEntry = {
  id: string;
  user_id: string;
  month: MonthKey;
  amount: number;
  note: string | null;
  created_at: string;
};
