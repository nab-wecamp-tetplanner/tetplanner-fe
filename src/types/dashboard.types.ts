export type Transaction = {
  id: string;
  name: string;
  method: string;
  date: string;
  amount: string;
  isIncome: boolean;
  iconText: string;
  iconBg: string;
  iconColor: string;
};

export type Category = {
  id: string;
  name: string;
  percent: string;
  colorClass: string;
  bgClass: string;
  icon: string;
  transactions: Transaction[];
};

export type WeeklyTaskData = {
  week: string;
  tasksDone: number;
  tasksCreated: number;
  totalTasks: number;
};

export type WeeklyFinanceData = {
  week: string;
  income: number;
  expense: number;
};
