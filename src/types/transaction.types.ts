export interface Transaction {
  id: string;
  amount: string;
  type: 'expense' | 'income';
  note: string;
  transaction_date: string;
  category: string | null;
  recorded_by_user: {
    name: string;
  };
};