import { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronRight, CirclePlus, X, Trash2 } from "lucide-react";

type SubTask = {
  id: string;
  title: string;
  done: boolean;
};

type TaskProps = {
  id: number;
  title: string;
  done: boolean;
  hasNotes: boolean;
  project?: string;
  priority?: "High" | "Normal" | "Low";
  subTasks?: SubTask[];
};

export default function TaskListWidget() {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  const [tasks, setTasks] = useState<TaskProps[]>([
    { 
      id: 1, title: "House cleaning", done: false, hasNotes: false,
      subTasks: [
        { id: "1-1", title: "Clean living room", done: true },
        { id: "1-2", title: "Wash dishes", done: false }
      ]
    },
    { 
      id: 2, title: "Shopping", done: false, hasNotes: true, 
      subTasks: [{ id: "2-1", title: "Buy milk", done: false }] 
    },
  ]);

  /**
   * Calculates overall completion percentage
   */
  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.done).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  /**
   * Toggles expansion for viewing sub-tasks
   */
  const toggleExpand = (id: number) => {
    setExpandedTasks(prev => 
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    );
  };

  /**
   * Toggles the completion status of a main task
   */
  const updateStatus = (id: number, state: boolean) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: state } : t)));
  };

  /**
   * Toggles the completion status of a sub-task
   */
  const updateSubTaskStatus = (taskId: number, subTaskId: string, state: boolean) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && t.subTasks) {
        return {
          ...t,
          subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, done: state } : st)
        };
      }
      return t;
    }));
  };

  /**
   * Removes a task from the list by ID
   */
  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Processes form data to create a new task entry
   */
  const handleSaveTask = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const project = formData.get("project") as string;
    const priority = formData.get("priority") as TaskProps["priority"];

    if (!title.trim()) return;

    const newTask: TaskProps = {
      id: Date.now(),
      title: title.trim(),
      project: project.trim(),
      priority,
      done: false,
      hasNotes: !!project.trim(),
      subTasks: []
    };

    setTasks(prev => [newTask, ...prev]);
    setIsOpenModal(false);
    e.currentTarget.reset();
  };

  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-slate-50 max-w-md mx-auto">
      {/* Header & Progress */}
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
        
        {/* Progress Bar Container */}
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

      {/* Task List Container */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const isExpanded = expandedTasks.includes(task.id);
          const hasSubTasks = !!(task.subTasks && task.subTasks.length > 0);
          const completedCount = task.subTasks?.filter(st => st.done).length || 0;
          const totalCount = task.subTasks?.length || 0;

          return (
            <div key={task.id} className="flex flex-col border-b border-slate-50 pb-3 last:border-0 group/container">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleExpand(task.id)}
                    className={`p-1 rounded hover:bg-slate-100 transition-colors ${!hasSubTasks && 'invisible'}`}
                  >
                    {isExpanded ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
                  </button>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className={`text-[14px] font-medium transition-colors ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                        {task.title}
                      </p>
                      {hasSubTasks && (
                        <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full font-semibold">
                          {completedCount}/{totalCount}
                        </span>
                      )}
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
                    onClick={() => updateStatus(task.id, !task.done)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-emerald-500"}`}
                  >
                    {task.done && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                </div>
              </div>

              {/* Sub-tasks Render */}
              {isExpanded && hasSubTasks && (
                <div className="ml-9 mt-3 space-y-3 border-l-2 border-slate-100 pl-4">
                  {task.subTasks?.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between group/sub">
                      <span className={`text-[13px] transition-colors ${sub.done ? "text-slate-400 line-through" : "text-slate-600"}`}>
                        {sub.title}
                      </span>
                      <button
                        onClick={() => updateSubTaskStatus(task.id, sub.id, !sub.done)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${sub.done ? "bg-emerald-400 border-emerald-400" : "border-slate-200 hover:border-emerald-400"}`}
                      >
                        {sub.done && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Creation Modal */}
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
                <input name="title" placeholder="Task name" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-all" required autoFocus />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Project</label>
                <input name="project" placeholder="Project name" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Priority</label>
                <select name="priority" defaultValue="Normal" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 transition-all bg-white">
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 mt-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}