import { useState, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { Plus, Trash2, X, Edit3, CheckCircle2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import timeGridPlugin from "@fullcalendar/timegrid"; 
import listPlugin from "@fullcalendar/list"; 
import { Header } from "../../components/Header/Header";

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Design UI Dashboard",
    date: "2026-02-12",
    priority: "High",
    project: "Work",
    status: "todo",
  },
  {
    id: "2",
    title: "Go shopping",
    date: "2026-02-12",
    priority: "Normal",
    project: "Home",
    status: "done",
  },
  {
    id: "3",
    title: "Family reunion",
    date: "2026-02-28",
    priority: "High",
    project: "Family",
    status: "todo",
  },
  {
    id: "4",
    title: "Documentation update",
    date: "2026-02-15",
    priority: "Low",
    project: "Docs",
    status: "todo",
  },
];

interface Task {
  id: string;
  title: string;
  date: string;
  priority: "High" | "Normal" | "Low";
  project: string;
  status: "todo" | "done";
}

const columnHelper = createColumnHelper<Task>();

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const calendarRef = useRef<FullCalendar>(null); 
  const handleDateClick = (arg: any) => {
    setSelectedDate(new Date(arg.dateStr));
    const allDays = document.querySelectorAll(".fc-daygrid-day");
    allDays.forEach((el) => el.classList.remove("selected-day-active"));
    arg.dayEl.classList.add("selected-day-active");
  };

  // --- FULLCALENDAR CONFIG ---
  // Add and update tasks
  const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const priority = formData.get("priority") as any;
    const project = formData.get("project") as string;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? { ...t, title, priority, project } : t,
        ),
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
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t,
      ),
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

  // --- TANSTACK TABLE CONFIG ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.date === format(selectedDate, "yyyy-MM-dd"));
  }, [tasks, selectedDate]);

  const columns = [
    columnHelper.display({
      id: "status",
      cell: (info) => (
        <button onClick={() => toggleStatus(info.row.original.id)}>
          <CheckCircle2
            size={18}
            className={
              info.row.original.status === "done"
                ? "text-emerald-500"
                : "text-slate-200"
            }
          />
        </button>
      ),
    }),
    columnHelper.accessor("title", {
      header: "work",
      cell: (info) => (
        <div
          className={`flex flex-col ${info.row.original.status === "done" ? "line-through opacity-50" : ""}`}
        >
          <span className="font-semibold text-slate-700 text-sm">
            {info.getValue()}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            {info.row.original.project}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(info.row.original)}
            className="text-slate-400 hover:text-blue-500"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => deleteTask(info.row.original.id)}
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // --- FULLCALENDAR EVENTS ---
  const calendarEvents = useMemo(() => {
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      start: t.date,
      color:
        t.status === "done"
          ? "#cbd5e1"
          : t.priority === "High"
            ? "#ef4444"
            : "#3b82f6",
    }));
  }, [tasks]);

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="grid grid-cols-12 min-h-[85vh]">
        {/* Calendar (Left column) */}
        <div className="col-span-8 p-6 border-r border-slate-100">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            // Toolbar configuration
            headerToolbar={{
              left: "title",
              center: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
              right: "prev,next today",
            }}
            buttonText={{
              month: "Month",
              week: "Week",
              day: "Day",
              list: "List",
            }}
            events={calendarEvents}
            dateClick={handleDateClick}
            height="80%"
            nowIndicator={true} 
            editable={true}
            selectable={true}
            dayMaxEvents={3}
          />
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <p className="text-xs text-blue-600 font-bold uppercase">
                Done
              </p>
              <p className="text-2xl font-black text-blue-900">85%</p>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl">
              <p className="text-xs text-red-600 font-bold uppercase">
                Overdue
              </p>
              <p className="text-2xl font-black text-red-900">03</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <p className="text-xs text-emerald-600 font-bold uppercase">
                Total Tasks
              </p>
              <p className="text-2xl font-black text-emerald-900">42</p>
            </div>
          </div>
        </div>

        {/* TASK LIST (RIGHT COLUMN) */}
        <div className="col-span-4 p-8 bg-slate-50/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              Tasks: {format(selectedDate, "dd/MM")}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-slate-900 text-white rounded-lg"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 border-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <p className="p-10 text-center text-slate-400 italic">
                No task
              </p>
            )}
          </div>
        </div>
      </main>

      {/* MODAL FOR ADD AND UPDATE*/}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleSaveTask}
            className="bg-white p-6 rounded-2xl w-96 shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingTask ? "Edit task" : "Add a new task"}
              </h3>
              <button type="button" onClick={closeModal}>
                <X />
              </button>
            </div>
            <div className="space-y-4">
              <input
                name="title"
                defaultValue={editingTask?.title}
                placeholder="Tên công việc"
                className="w-full p-3 border rounded-xl"
                required
              />
              <input
                name="project"
                defaultValue={editingTask?.project}
                placeholder="Project"
                className="w-full p-3 border rounded-xl"
              />
              <select
                name="priority"
                defaultValue={editingTask?.priority || "Normal"}
                className="w-full p-3 border rounded-xl"
              >
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
