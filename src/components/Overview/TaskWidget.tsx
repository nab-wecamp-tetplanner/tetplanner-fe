import { useState, useMemo, useEffect } from "react";
import { Check,  CirclePlus, X, Trash2 } from "lucide-react";
import type { TodoItem } from "../../types/todo.types";
import apiClient from "../../services/apiClient";

export default function TaskListWidget({ tetConfigs }: { tetConfigs: string[] }) {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [, setExpandedTasks] = useState<string[]>([]); // ID is string per TodoItem interface
  const [tasks, setTasks] = useState<TodoItem[]>([]);

  /**
   * Fetches todos for all provided configuration IDs.
   * Uses Promise.all for concurrent requests and optimal performance.
   */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const results = await Promise.all(
          tetConfigs.map(configId => apiClient.todos.getAll({ tetConfigId: configId }))
        );
        setTasks(results.flat());
      } catch (error) {
        console.error("Failed to synchronize tasks:", error);
      }
    };

    if (tetConfigs.length > 0) fetchTasks();
  }, [tetConfigs]);

  /**
   * Derives completion percentage based on the 'status' field.
   */
  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  // const toggleExpand = (id: string) => {
  //   setExpandedTasks(prev => 
  //     prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
  //   );
  // };

  /**
   * Updates task status by mapping boolean toggle to TodoItem status enum.
   */
  const updateStatus = (id: string, isDone: boolean) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: isDone ? "completed" : "pending" } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Handles submission and constructs a new TodoItem following the schema.
   */
  const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const priority = formData.get("priority") as TodoItem["priority"];

    if (!title.trim()) return;

    const newTask: TodoItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      priority: priority,
      status: "pending",
      deadline: new Date().toISOString(),
      is_overdue: false,
      is_shopping: false,
      purchased: false,
      assigned_to: null,
      created_at: new Date().toISOString(),
      deleted_at: null,
      tet_config: { id: tetConfigs[0] || "" },
      timeline_phase: { id: "default" },
      category: { id: "default" }
    };

    setTasks(prev => [newTask, ...prev]);
    setIsOpenModal(false);
    e.currentTarget.reset();
  };

  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-slate-50 max-w-md mx-auto">
      {/* Header Section */}
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 text-[16px]">
            Today Tasks <span className="text-slate-400 font-normal">({tasks.length})</span>
          </h2>
          <CirclePlus 
            onClick={() => setIsOpenModal(true)} 
            className="text-gray-400 hover:text-black cursor-pointer transition-colors"
          />
        </div>
        
        {/* Progress Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            <span>Daily Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Task List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const isDone = task.status === "completed";
          
          return (
            <div key={task.id} className="flex flex-col border-b border-slate-50 pb-3 last:border-0 group/container">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className={`text-[14px] font-medium transition-colors ${isDone ? "text-slate-400 line-through" : "text-slate-700"}`}>
                        {task.title}
                      </p>
                      {/* Priority Badge */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover/container:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => updateStatus(task.id, !isDone)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-emerald-500"}`}
                  >
                    {isDone && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleSaveTask}
            className="bg-white p-6 rounded-2xl w-96 shadow-xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">New Task</h3>
              <button type="button" onClick={() => setIsOpenModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                <input name="title" className="w-full p-3 border border-slate-200 rounded-xl focus:border-slate-900 transition-all outline-none" required autoFocus />
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Priority</label>
                <select name="priority" defaultValue="medium" className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 mt-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}