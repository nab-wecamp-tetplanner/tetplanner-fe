// import { useState, useMemo, useRef } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import { format } from "date-fns";
// import { Plus, Trash2, X, Edit3, CheckCircle2 } from "lucide-react";
// import {
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
//   createColumnHelper,
// } from "@tanstack/react-table";
// import timeGridPlugin from "@fullcalendar/timegrid"; 
// import listPlugin from "@fullcalendar/list"; 

// const MOCK_TASKS: Task[] = [
//   {
//     id: "1",
//     title: "Design UI Dashboard",
//     date: "2026-02-12",
//     priority: "High",
//     project: "Work",
//     status: "todo",
//   },
//   {
//     id: "2",
//     title: "Go shopping",
//     date: "2026-02-12",
//     priority: "Normal",
//     project: "Home",
//     status: "done",
//   },
//   {
//     id: "3",
//     title: "Family reunion",
//     date: "2026-02-28",
//     priority: "High",
//     project: "Family",
//     status: "todo",
//   },
//   {
//     id: "4",
//     title: "Documentation update",
//     date: "2026-02-15",
//     priority: "Low",
//     project: "Docs",
//     status: "todo",
//   },
// ];

// interface Task {
//   id: string;
//   title: string;
//   date: string;
//   priority: "High" | "Normal" | "Low";
//   project: string;
//   status: "todo" | "done";
// }

// const columnHelper = createColumnHelper<Task>();

// export default function CalendarPage() {
//   const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);

//   const calendarRef = useRef<FullCalendar>(null); 
//   const handleDateClick = (arg: any) => {
//     setSelectedDate(new Date(arg.dateStr));
//     const allDays = document.querySelectorAll(".fc-daygrid-day");
//     allDays.forEach((el) => el.classList.remove("selected-day-active"));
//     arg.dayEl.classList.add("selected-day-active");
//   };

//   // --- FULLCALENDAR CONFIG ---
//   // Add and update tasks
//   const handleSaveTask = (e: React.SubmitEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const title = formData.get("title") as string;
//     const priority = formData.get("priority") as any;
//     const project = formData.get("project") as string;

//     if (editingTask) {
//       setTasks((prev) =>
//         prev.map((t) =>
//           t.id === editingTask.id ? { ...t, title, priority, project } : t,
//         ),
//       );
//     } else {
//       const newTask: Task = {
//         id: Date.now().toString(),
//         title,
//         date: format(selectedDate, "yyyy-MM-dd"),
//         priority,
//         project,
//         status: "todo",
//       };
//       setTasks((prev) => [...prev, newTask]);
//     }
//     closeModal();
//   };

//   const deleteTask = (id: string) => {
//     if (confirm("Do you want to delete this task?")) {
//       setTasks((prev) => prev.filter((t) => t.id !== id));
//     }
//   };

//   const toggleStatus = (id: string) => {
//     setTasks((prev) =>
//       prev.map((t) =>
//         t.id === id
//           ? { ...t, status: t.status === "done" ? "todo" : "done" }
//           : t,
//       ),
//     );
//   };

//   const openEditModal = (task: Task) => {
//     setEditingTask(task);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingTask(null);
//   };

//   // --- TANSTACK TABLE CONFIG ---
//   const filteredTasks = useMemo(() => {
//     return tasks.filter((t) => t.date === format(selectedDate, "yyyy-MM-dd"));
//   }, [tasks, selectedDate]);

//   const columns = [
//     columnHelper.display({
//       id: "status",
//       cell: (info) => (
//         <button onClick={() => toggleStatus(info.row.original.id)}>
//           <CheckCircle2
//             size={18}
//             className={
//               info.row.original.status === "done"
//                 ? "text-emerald-500"
//                 : "text-slate-200"
//             }
//           />
//         </button>
//       ),
//     }),
//     columnHelper.accessor("title", {
//       header: "work",
//       cell: (info) => (
//         <div
//           className={`flex flex-col ${info.row.original.status === "done" ? "line-through opacity-50" : ""}`}
//         >
//           <span className="font-semibold text-slate-700 text-sm">
//             {info.getValue()}
//           </span>
//           <span className="text-[10px] text-slate-400 font-bold uppercase">
//             {info.row.original.project}
//           </span>
//         </div>
//       ),
//     }),
//     columnHelper.display({
//       id: "actions",
//       cell: (info) => (
//         <div className="flex gap-2">
//           <button
//             onClick={() => openEditModal(info.row.original)}
//             className="text-slate-400 hover:text-blue-500"
//           >
//             <Edit3 size={14} />
//           </button>
//           <button
//             onClick={() => deleteTask(info.row.original.id)}
//             className="text-slate-400 hover:text-red-500"
//           >
//             <Trash2 size={14} />
//           </button>
//         </div>
//       ),
//     }),
//   ];

//   const table = useReactTable({
//     data: filteredTasks,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   // --- FULLCALENDAR EVENTS ---
//   const calendarEvents = useMemo(() => {
//     return tasks.map((t) => ({
//       id: t.id,
//       title: t.title,
//       start: t.date,
//       color:
//         t.status === "done"
//           ? "#cbd5e1"
//           : t.priority === "High"
//             ? "#ef4444"
//             : "#3b82f6",
//     }));
//   }, [tasks]);

//   return (
//     <div className="bg-white min-h-screen w-full">
//       <main className="grid grid-cols-12 min-h-[85vh]">
//         {/* Calendar (Left column) */}
//         <div className="col-span-8 p-6 border-r border-slate-100">
//           <FullCalendar
//             ref={calendarRef}
//             plugins={[
//               dayGridPlugin,
//               timeGridPlugin,
//               listPlugin,
//               interactionPlugin,
//             ]}
//             initialView="dayGridMonth"
//             // Toolbar configuration
//             headerToolbar={{
//               left: "title",
//               center: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
//               right: "prev,next today",
//             }}
//             buttonText={{
//               month: "Month",
//               week: "Week",
//               day: "Day",
//               list: "List",
//             }}
//             events={calendarEvents}
//             dateClick={handleDateClick}
//             height="80%"
//             nowIndicator={true} 
//             editable={true}
//             selectable={true}
//             dayMaxEvents={3}
//           />
//           <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
//             <div className="p-4 bg-blue-50 rounded-2xl">
//               <p className="text-xs text-blue-600 font-bold uppercase">
//                 Done
//               </p>
//               <p className="text-2xl font-black text-blue-900">85%</p>
//             </div>
//             <div className="p-4 bg-red-50 rounded-2xl">
//               <p className="text-xs text-red-600 font-bold uppercase">
//                 Overdue
//               </p>
//               <p className="text-2xl font-black text-red-900">03</p>
//             </div>
//             <div className="p-4 bg-emerald-50 rounded-2xl">
//               <p className="text-xs text-emerald-600 font-bold uppercase">
//                 Total Tasks
//               </p>
//               <p className="text-2xl font-black text-emerald-900">42</p>
//             </div>
//           </div>
//         </div>

//         {/* TASK LIST (RIGHT COLUMN) */}
//         <div className="col-span-4 p-8 bg-slate-50/50">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold">
//               Tasks: {format(selectedDate, "dd/MM")}
//             </h2>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="p-2 bg-slate-900 text-white rounded-lg"
//             >
//               <Plus size={20} />
//             </button>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
//             <table className="w-full">
//               <tbody>
//                 {table.getRowModel().rows.map((row) => (
//                   <tr
//                     key={row.id}
//                     className="border-b last:border-0 border-slate-50"
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <td key={cell.id} className="p-4">
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext(),
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {filteredTasks.length === 0 && (
//               <p className="p-10 text-center text-slate-400 italic">
//                 No task
//               </p>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* MODAL FOR ADD AND UPDATE*/}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
//           <form
//             onSubmit={handleSaveTask}
//             className="bg-white p-6 rounded-2xl w-96 shadow-xl"
//           >
//             <div className="flex justify-between mb-4">
//               <h3 className="font-bold text-md">
//                 {editingTask ? "Edit task" : "Add a new task"}
//               </h3>
//               <button type="button" onClick={closeModal}>
//                 <X />
//               </button>
//             </div>
//             <div className="space-y-4">
//               <input
//                 name="title"
//                 defaultValue={editingTask?.title}
//                 placeholder="Task name"
//                 className="w-full p-3 border rounded-xl"
//                 required
//               />
//               <input
//                 name="project"
//                 defaultValue={editingTask?.project}
//                 placeholder="Project"
//                 className="w-full p-3 border rounded-xl"
//               />
//               <select
//                 name="priority"
//                 defaultValue={editingTask?.priority || "Normal"}
//                 className="w-full p-3 border rounded-xl"
//               >
//                 <option value="High">High</option>
//                 <option value="Normal">Normal</option>
//                 <option value="Low">Low</option>
//               </select>
//               <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold">
//                 Save changes
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { format } from "date-fns";
import { 
  Plus, 
  Trash2, 
  X, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ListTodo,
  Calendar as CalendarIcon
} from "lucide-react";
import "./calendar.css"
// ==========================================
// TYPES & MOCK DATA
// ==========================================
interface Task {
  id: string;
  title: string;
  date: string;
  priority: "High" | "Normal" | "Low";
  project: string;
  status: "todo" | "done";
}

const MOCK_TASKS: Task[] = [
  { id: "1", title: "Design UI Dashboard", date: "2026-02-12", priority: "High", project: "Work", status: "todo" },
  { id: "2", title: "Go shopping", date: "2026-02-12", priority: "Normal", project: "Home", status: "done" },
  { id: "3", title: "Family reunion", date: "2026-02-28", priority: "High", project: "Family", status: "todo" },
  { id: "4", title: "Documentation update", date: "2026-02-15", priority: "Low", project: "Docs", status: "todo" },
];

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const calendarRef = useRef<FullCalendar>(null);

  // --- HANDLERS ---
  const handleDateClick = (arg: any) => {
    setSelectedDate(new Date(arg.dateStr));
    const allDays = document.querySelectorAll(".fc-daygrid-day");
    allDays.forEach((el) => el.classList.remove("selected-day-active"));
    arg.dayEl.classList.add("selected-day-active");
  };

  const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const priority = formData.get("priority") as Task["priority"];
    const project = formData.get("project") as string;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, title, priority, project } : t))
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        date: format(selectedDate, "yyyy-MM-dd"),
        priority,
        project,
        status: "todo",
      };
      setTasks((prev) => [...prev, newTask]);
    }
    closeModal();
  };

  const deleteTask = (id: string) => {
    if (confirm("Do you want to delete this task?")) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t))
    );
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // --- DATA COMPUTATION ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.date === format(selectedDate, "yyyy-MM-dd"));
  }, [tasks, selectedDate]);

  const calendarEvents = useMemo(() => {
    return tasks.map((t) => {
      // Tương tự bảng màu của planner
      let color = "#3b82f6"; // planner-blue
      if (t.status === "done") color = "#10b981"; // planner-green
      else if (t.priority === "High") color = "#ec4899"; // planner-pink

      return {
        id: t.id,
        title: t.title,
        start: t.date,
        color: color,
      };
    });
  }, [tasks]);

  return (
    <div className=" bg-background">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= CỘT TRÁI: CALENDAR VÀ QUICK STATS (8 Cột) ================= */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Calendar Card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 overflow-hidden">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "title",
                  center: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                  right: "prev,next today",
                }}
                buttonText={{ month: "Month", week: "Week", day: "Day", list: "List", today: "Today" }}
                events={calendarEvents}
                dateClick={handleDateClick}
                height={450}
                contentHeight={450}
                nowIndicator={true}
                editable={true}
                selectable={true}
                dayMaxEvents={3}
              />
            </div>

            {/* Quick Stats (Đồng bộ với QuickStats bên Transaction) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-planner-green-light flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-planner-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Done</p>
                  <p className="text-xl font-bold text-planner-green">85%</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-planner-pink-light flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-planner-pink" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Overdue</p>
                  <p className="text-xl font-bold text-planner-pink">03</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-planner-blue-light flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-planner-blue" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Tasks</p>
                  <p className="text-xl font-bold text-planner-blue">42</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI: TASK LIST (4 Cột) ================= */}
          <div className="lg:col-span-4 bg-card rounded-2xl border border-border shadow-sm overflow-hidden sticky top-6">
            
            {/* Header Task List */}
            <div className="font-semibold p-5 border-b border-border flex justify-between items-center bg-card">
              <div>
                <h2 className="text-xl text-foreground">Tasks schedule</h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(selectedDate, "dd MMM yyyy")}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-9 w-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* List Body */}
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-foreground font-medium mb-1">No tasks assigned</p>
                  <p className="text-muted-foreground text-sm">Enjoy your free time!</p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === "done";
                  return (
                    <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group">
                      
                      {/* Checkbox Icon */}
                      <button 
                        onClick={() => toggleStatus(task.id)}
                        className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                          isDone 
                            ? "bg-planner-green-light text-planner-green" 
                            : "bg-muted text-muted-foreground hover:bg-planner-green-light hover:text-planner-green"
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium text-sm block truncate ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            {task.project}
                          </span>
                          <span className="w-1 h-1 bg-border rounded-full" />
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${
                            task.priority === "High" ? "text-planner-pink" : 
                            task.priority === "Normal" ? "text-planner-blue" : "text-planner-amber"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-planner-blue transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-planner-pink transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleSaveTask}
            className="bg-card p-6 rounded-2xl w-full max-w-sm border border-border shadow-lg animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-lg text-foreground">
                {editingTask ? "Edit task" : "New task"}
              </h3>
              <button 
                type="button" 
                onClick={closeModal}
                className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Title</label>
                <input
                  name="title"
                  defaultValue={editingTask?.title}
                  placeholder="E.g. Design UI Dashboard"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Project</label>
                <input
                  name="project"
                  defaultValue={editingTask?.project}
                  placeholder="E.g. Work, Home..."
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Priority</label>
                <select
                  name="priority"
                  defaultValue={editingTask?.priority || "Normal"}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 text-foreground"
                >
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <button className="w-full py-3 mt-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                {editingTask ? "Save changes" : "Create task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}