import { useState, useMemo, useEffect } from "react";
import { Check, CirclePlus, X, Trash2 } from "lucide-react";
import type { TodoItem } from "../../types/todo.types";
import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types";
// import type { Timeline } from "../../types/timeline.types";
import { useLoading } from "../../contexts/LoadingContext";
import { useAppStore } from "../../stores/useAppStore";

interface TaskInfo extends TetConfig {
  tasks: TodoItem[];
}

export default function TaskListWidget() {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  // const [, setExpandedTasks] = useState<string[]>([]);
  const [tasksByConfig, setTasksByConfig] = useState<Record<string, TaskInfo>>(
    {},
  );
  // const [timelines, setTimelines] = useState<Timeline[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const configId = useAppStore((state) => state.configId);  

  /**
   * Fetches todos for all provided configuration IDs.
   * Uses Promise.all for concurrent requests and optimal performance.
   */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!configId) return;
        showLoading();
            // Fetch Config details and Tasks simultaneously for each ID
        const [config, configData, taskItems] = await Promise.all([
          apiClient.tetConfigs.getConfigById(configId),
          apiClient.tetConfigs.getBudgetSummary(configId),
          apiClient.todos.getAll({ tetConfigId: configId }),
        ]);

    
        // Convert array results back to a Record object
        const newTasksByConfig: Record<string, TaskInfo> = {
          [configId]: {
            ...configData,
            tasks: taskItems,
            ...config,
          },
        };

        setTasksByConfig(newTasksByConfig);
      } catch (error) {
        console.error("Failed to synchronize tasks and configs:", error);
      }
    };

    fetchAllData();
  }, [configId]);

  /**
   * Derives completion percentage based on the 'status' field.
   */
  const progress = useMemo(() => {
    if (Object.keys(tasksByConfig).length === 0) return 0;
    let totalTasks = 0;
    let completedTasks = 0;

    Object.values(tasksByConfig).forEach((config) => {
      totalTasks += config.tasks.length;
      completedTasks += config.tasks.filter(
        (t) => t.status === "completed",
      ).length;
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [tasksByConfig]);

  // const toggleExpand = (id: string) => {
  //   setExpandedTasks((prev) =>
  //     prev.includes(id)
  //       ? prev.filter((taskId) => taskId !== id)
  //       : [...prev, id],
  //   );
  // };

  /**
   * Updates task status by mapping boolean toggle to TodoItem status enum.
   */
  const updateStatus = (id: string, isDone: boolean) => {
    setTasksByConfig((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((configId) => {
        updated[configId] = {
          ...updated[configId],
          tasks: updated[configId].tasks.map((t) =>
            t.id === id
              ? { ...t, status: isDone ? "completed" : "pending" }
              : t,
          ),
        };
      });
      return updated;
    });
  };

  const deleteTask = async (id: string) => {
    try {
      showLoading();
      await apiClient.todos.delete(id);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      hideLoading();
    }
    setTasksByConfig((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((configId) => {
        updated[configId] = {
          ...updated[configId],
          tasks: updated[configId].tasks.filter((t) => t.id !== id),
        };
      });
      return updated;
    });
  };

  const updateSubtaskStatus = (
    taskId: string,
    subtaskKey: string,
    isDone: boolean,
  ) => {
    setTasksByConfig((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((configId) => {
        updated[configId] = {
          ...updated[configId],
          tasks: updated[configId].tasks.map((t) => {
            if (t.id === taskId && t.subtasks) {
              return {
                ...t,
                subtasks: {
                  ...t.subtasks,
                  [subtaskKey]: isDone,
                },
              };
            }
            return t;
          }),
        };
      });
      return updated;
    });
  };

  /**
   * Handles submission and constructs a new TodoItem following the schema.
   */
  const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const priority = formData.get("priority") as TodoItem["priority"];
    const deadline = formData.get("deadline") as string;
    const is_shopping = formData.get("is_shopping") === "true";
    const estimated_price = Number(formData.get("estimated_price")) || 0;
    const quantity = Number(formData.get("quantity")) || 1;

    if (!title.trim()) return;

    const requestBody = {
      title: title.trim(),
      priority: priority,
      status: "pending" as const,
      deadline: new Date(deadline).toISOString(),
      is_shopping: is_shopping,
      estimated_price: estimated_price,
      quantity: quantity,
      tet_config_id: configId ?? "",
      timeline_phase_id: "c5c00fee-7d49-40f3-a18f-c0c467b67598",
      category_id: "56e8e6c4-f139-4735-8439-2325445cd185",
    };

    try {
      const response = await apiClient.todos.create(requestBody);
      console.log("Created task response:", response);

      setTasksByConfig((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((configId) => {
          updated[configId] = {
            ...updated[configId],
            tasks: [
              { ...requestBody, id: response.id || crypto.randomUUID() } as any,
              ...updated[configId].tasks,
            ],
          };
        });
        return updated;
      });

      setIsOpenModal(false);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error in creating tasks:", error);
    }
  };

  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-slate-50 mx-auto">
      {/* Header Section */}
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 text-[16px]">
            Tasks{" "}
            <span className="text-slate-400 font-normal">
              (
              {Object.values(tasksByConfig).reduce(
                (acc, config) => acc + config.tasks.length,
                0,
              )}
              )
            </span>
          </h2>
          <CirclePlus
            onClick={() => setIsOpenModal(true)}
            className="text-gray-400 hover:text-black cursor-pointer transition-colors"
          />
        </div>

        {/* Progress Visualization */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            <span>Progress</span>
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
        {/* {tasks.map((task) => {
          const isDone = task.status === "completed";

          return (
            <div
              key={task.id}
              className="flex flex-col border-b border-slate-50 pb-3 last:border-0 group/container"
            >
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-[14px] font-medium transition-colors ${isDone ? "text-slate-400 line-through" : "text-slate-700"}`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                          task.priority === "urgent"
                            ? "bg-red-100 text-red-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
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
                    {isDone && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })} */}

        {/* Main Task List */}
        {Object.values(tasksByConfig).map((configInfo) => (
          <div
            key={configInfo.id}
            className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100"
          >
            {/* Header: Config Information */}
            <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
              <h2 className="font-bold text-slate-800 text-sm">
                {configInfo.name}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Year: {configInfo.year}
              </span>
            </div>

            {/* List: Task Items */}
            <div className="space-y-3">
              {configInfo.tasks.map((task) => {
                const isDone = task.status === "completed";
                const subtaskCount = task.subtasks
                  ? Object.keys(task.subtasks).length
                  : 0;

                return (
                  <div key={task.id} className="">
                    <div>
                      <div className="flex items-center gap-3">
                        {/* Check button */}
                        <button
                          onClick={() => updateStatus(task.id, !isDone)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDone
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-slate-300 hover:border-emerald-500"
                          }`}
                        >
                          {isDone && (
                            <Check
                              className="w-3 h-3 text-white"
                              strokeWidth={4}
                            />
                          )}
                        </button>

                        <div className="flex flex-row items-center gap-2">
                          <p
                            className={`text-sm font-medium transition-colors ${
                              isDone
                                ? "text-slate-400 line-through"
                                : "text-slate-700"
                            }`}
                          >
                            {task.title}
                          </p>
                          {/* Hiển thị Priority */}
                          <span
                            className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                              {
                                low: "bg-green-100 text-green-600",
                                medium: "bg-yellow-100 text-yellow-600",
                                high: "bg-red-100 text-red-600",
                                urgent: "bg-purple-100 text-purple-600",
                              }[task.priority] || "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Nút xóa hiện khi hover */}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="group-hover/item:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RENDERING SUBTASKS */}
                    {task.subtasks && subtaskCount > 0 && (
                      <div className="mt-2 ml-[10px] pl-5 border-l border-slate-100 space-y-2">
                        {Object.entries(task.subtasks).map(
                          ([subtaskName, subIsDone]) => (
                            <div
                              key={subtaskName}
                              className="flex items-center justify-between group/sub"
                            >
                              <div className="flex items-center gap-2">
                                {/* Checkbox cho Subtask */}
                                <button
                                  onClick={() =>
                                    updateSubtaskStatus(
                                      task.id,
                                      subtaskName,
                                      !subIsDone,
                                    )
                                  }
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    subIsDone
                                      ? "bg-emerald-400 border-emerald-400"
                                      : "border-slate-400 hover:border-emerald-400"
                                  }`}
                                >
                                  {subIsDone && (
                                    <Check
                                      className="w-2.5 h-2.5 text-white"
                                      strokeWidth={5}
                                    />
                                  )}
                                </button>

                                <span
                                  className={`text-xs ${subIsDone ? "text-slate-600 line-through" : "text-slate-700"}`}
                                >
                                  {subtaskName}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {configInfo.tasks.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  No tasks assigned yet.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Creation Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleSaveTask}
            className="bg-white p-6 rounded-2xl w-[450px] shadow-xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">New Task</h3>
              <button
                type="button"
                onClick={() => setIsOpenModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/*Title*/}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Task Title
                </label>
                <input
                  name="title"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:border-slate-900 transition-all outline-none"
                  placeholder="VD: Dọn dẹp nhà cửa..."
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full p-3 text-sm border border-slate-200 rounded-xl bg-white outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                {/* Deadline */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              {/* Shopping Toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  name="is_shopping"
                  value="true"
                  id="is_shopping"
                  className="w-4 h-4 accent-slate-900"
                />
                <label
                  htmlFor="is_shopping"
                  className="text-sm font-medium text-slate-700"
                >
                  Is this a shopping task?
                </label>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Estimated Price (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="estimated_price"
                    defaultValue="0"
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    defaultValue="1"
                    min="1"
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
