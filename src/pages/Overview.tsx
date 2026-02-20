import BudgetCard from "../components/Overview/BudgetCard";
import TransactionsTableWidget from "../components/Overview/RecentTransaction";
import TaskListWidget from "../components/Overview/TaskWidget";
import UpcomingTasksWidget from "../components/Overview/UpcommingTasksWidget";
import CalendarWidget from "../components/Overview/CalendarWidget/CalendarWidget";

export default function Overview() {
  return (
    <div className="mb-10 min-h-screen bg-[#F8FAFC] font-sans">
      <div className="mx-4 mt-6 relative overflow-hidden bg-slate-950 rounded-md p-10 md:p-16 shadow-2xl shadow-slate-900/20 border border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)]"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-600/30 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-b from-transparent to-slate-950/80 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-bold tracking-widest uppercase backdrop-blur-md shadow-lg shadow-amber-500/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            </span>
            Tết Planner Pro
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-snug">
            Làm chủ thời gian, làm chủ chi tiêu
            <br className="hidden md:block mt-2" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-orange-400 to-amber-400 drop-shadow-sm">
            Tận hưởng cuộc sống
            </span>
          </h1>
        </div>
      </div>

      <div className="mt-8 mx-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Buget Cards */}
          <div className="space-y-6 flex flex-col">
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
            <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
              <TransactionsTableWidget />
            </div>
          </div>

          {/* Col 2: Tasks */}
          <div className="space-y-6">
            <TaskListWidget />
            <UpcomingTasksWidget />
          </div>

          {/* Col 3: Calendar and Progress Tracking */}
          <div className="space-y-6">
            <CalendarWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
