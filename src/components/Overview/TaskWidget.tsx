import { useState } from "react";

type TaksProps = {
    id: number,
    title: string,
    done: boolean,
    hasNotes: boolean
}


export default function TaskListWidget() {
  const mockTasks = [
  { id: 1, title: 'House cleaning', done: false, hasNotes: false },
  { id: 2, title: 'Shopping', done: false, hasNotes: true },
  { id: 3, title: 'Family reunion', done: false, hasNotes: true },
  { id: 4, title: 'Car book', done: true, hasNotes: false },
  { id: 5, title: 'Visit relatives', done: true, hasNotes: false },
  { id: 6, title: 'Cúng Tết', done: false, hasNotes: false },
];
  const [taks, ] =  useState<TaksProps[]>(mockTasks);

  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-slate-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-slate-800 text-[16px]">
          Today Tasks <span className="text-slate-400 font-normal">(05)</span>
        </h2>
        <button className="text-slate-400 text-2xl font-light hover:text-slate-600">
          +
        </button>
      </div>
      <div className="space-y-5">
        {taks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-[13px] font-medium w-5">
                {task.id}
              </span>
              <p
                className={`text-[14px] font-medium transition-colors ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}
              >
                {task.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {task.hasNotes && !task.done && (
                <div className="flex gap-2 text-slate-400">
                  <span className="text-[12px]">3 📎</span>
                  <span className="text-[12px]">5 💬</span>
                </div>
              )}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  task.done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 text-transparent hover:border-emerald-500"
                } cursor-pointer transition-colors`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
