


const mockExpiringTasks = [
  { 
    id: 1, 
    title: 'Nộp slide báo cáo ', 
    time: 'Hôm nay, 23:59', 
    urgent: true, 
    icon: '🔥',
    bgColor: 'bg-red-50 text-red-500'
  },
  { 
    id: 2, 
    title: 'Dọn dẹp + Trang trí nhà', 
    time: 'Ngày mai, 09:00', 
    urgent: true, 
    icon: '💻',
    bgColor: 'bg-orange-50 text-orange-500'
  },
  { 
    id: 3, 
    title: 'Mua quà Tết', 
    time: '14 Feb 2026', 
    urgent: false,
    icon: '🥥',
    bgColor: 'bg-emerald-50 text-emerald-500'
  },
];

export default function UpcomingTasksWidget() {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-slate-800 text-[16px]">
        Incomming tasks
        </h2>
        <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-md">
          NOTICE
        </span>
      </div>
      <div className="space-y-4">
        {mockExpiringTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] ${task.bgColor}`}
            >
              {task.icon}
            </div>
            <div className="flex-1 pt-0.5">
              <h4 className="text-[14px] font-bold text-slate-800 leading-tight mb-1.5 line-clamp-2">
                {task.title}
              </h4>
              <div className="flex items-center gap-1.5">
                <svg
                  className={`w-3.5 h-3.5 ${task.urgent ? "text-red-500" : "text-slate-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p
                  className={`text-[12px] font-bold tracking-wide ${task.urgent ? "text-red-500" : "text-slate-500"}`}
                >
                  {task.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
