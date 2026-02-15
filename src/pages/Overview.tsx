import { Header } from "../components/Header/Header";
import BudgetCard from "../components/Overview/BudgetCard";
import TransactionsTableWidget from "../components/Overview/RecentTransaction";
import TaskListWidget from "../components/Overview/TaskWidget";
import UpcomingTasksWidget from "../components/Overview/UpcommingTasksWidget";
import CalendarWidget from "../components/Overview/CalendarWidget/CalendarWidget";

export default function Overview() {
  return (
    <div className="mb-4">
      <Header />
      <div className="mt-4 mx-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Buget Cards */}
          <div className="space-y-6">
            <BudgetCard
              icon="🛍️"
              title="Sắm đồ Tết"
              spent={5000000}
              total={10000000}
              progress={50}
              color="bg-[#5B63D3]"
            />
            <BudgetCard 
              icon="🏮"
              title="Trang trí nhà cửa"
              spent={8500000}
              total={10000000}
              progress={85}
              color="bg-[#E94B8A]"
            />
            <TransactionsTableWidget />
          </div>
          {/* Col 2: Tasks */}
          <div className="space-y-6">
              <TaskListWidget />
              <UpcomingTasksWidget />
          </div>
          {/* Col 3: Calendar and Progress Tracking  */}
          <div className="space-y-6">
            <CalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
