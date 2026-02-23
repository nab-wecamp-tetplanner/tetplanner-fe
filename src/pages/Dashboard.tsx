import { Calendar } from "lucide-react";
import { TaskOverview } from "../components/Dashboard/TaskOverview";
import { BudgetOverview } from "../components/Dashboard/BudgetOverview";

const PageHeader = () => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8">
    <div>
      <p className="text-sm font-medium text-primary mb-1 tracking-wide uppercase">
        Dashboard
      </p>
      <h1 className="text-4xl font-serif text-foreground mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Manage your tasks and track your financial status
      </p>
    </div>
    <div className="mt-4 md:mt-0 flex items-center gap-1 bg-card p-1 rounded-xl border border-border text-sm font-medium text-muted-foreground">
      <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold">
        This month
      </button>
      <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-xs">
        Last month
      </button>
      <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-xs">
        This year
      </button>
      <button className="px-3 py-1.5 hover:bg-muted rounded-lg text-xs flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" />
        Custom
      </button>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <PageHeader />
        <TaskOverview />
        <BudgetOverview />
      </main>
    </div>
  );
}
