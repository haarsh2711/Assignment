export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}