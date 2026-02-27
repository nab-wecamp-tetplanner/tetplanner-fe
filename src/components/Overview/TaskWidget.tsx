import { useState, useMemo, useEffect } from "react";
import { Check, CirclePlus, Trash2, Edit3 } from "lucide-react";
import type { TaskCreateRequest, TodoItem } from "../../types/todo.types";
import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types";
// import type { Timeline } from "../../types/timeline.types";
import { useLoading } from "../../contexts/LoadingContext";
import { useAppStore } from "../../stores/useAppStore";
import CalendarModal from "../CalendarModal/Calendarmodal";
import type { CategoryResponse } from "../../types/categories.type";
import type { Timeline } from "../../types/timeline.types";
import { toast } from "react-toastify";

interface TaskInfo extends TetConfig {
  tasks: TodoItem[];
}

export default function TaskListWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState<boolean>(true);
  const triggerRefresh = useAppStore((state) => state.triggerRefresh);

  // const [, setExpandedTasks] = useState<string[]>([]);
  const [tasksByConfig, setTasksByConfig] = useState<Record<string, TaskInfo>>(
    {},
  );
  // const [timelines, setTimelines] = useState<Timeline[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [phases, setPhases] = useState<Timeline[]>([]);
const [editingTask, setEditingTask] = useState<any>(null);
  const configId = useAppStore((state) => state.configId);

  const fetchAllData = async () => {
    try {
      if (!configId) return;
      showLoading();
      // Fetch Config details and Tasks simultaneously for each ID
      const [config, configData, taskItems, phasesData] = await Promise.all([
        apiClient.tetConfigs.getConfigById(configId),
        apiClient.tetConfigs.getBudgetSummary(configId),
        apiClient.todos.getAll({ tetConfigId: configId }),
        apiClient.timelinePhases.getByConfigId(configId),
      ]);

      // Convert array results back to a Record object
      const newTasksByConfig: Record<string, TaskInfo> = {
        [configId]: {
          ...configData,
          tasks: taskItems,
          ...config,
        },
      };

      setPhases(phasesData);
      setTasksByConfig(newTasksByConfig);
    } catch (error) {
      console.error("Failed to synchronize tasks and configs:", error);
    } finally {
      hideLoading();
    }
  };

  /**
   * Fetches todos for all provided configuration IDs.
   * Uses Promise.all for concurrent requests and optimal performance.
   */
  useEffect(() => {
    fetchCategories();
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

  /**
   * Updates task status by mapping boolean toggle to TodoItem status enum.
   */
  const updateStatus = async (id: string, isDone: boolean) => {
    try {
      showLoading();
      await apiClient.todos.update(id, {
        status: isDone ? "completed" : "pending",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      triggerRefresh()
      hideLoading();
    }

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
      triggerRefresh();
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

  const fetchCategories = async () => {
    if (!configId) return;
    try {
      showLoading();
      const categoriesData =
        await apiClient.categories.getByTetConfig(configId);
      setCategories(categoriesData);
    } catch (error) {
      console.log(error);
    } finally {
      hideLoading();
    }
  };

  const createTask = async (newTask: TaskCreateRequest) => {
    try {
       await apiClient.todos.create(newTask);
      fetchAllData();
    } catch (error) {
      toast.error("Error in creating tassk");
    } finally {
      hideLoading();
    }
  };

  const updateTask = async (id: string, updateTask: any) => {
    try {
       await apiClient.todos.update(id, updateTask);
      fetchAllData();
    } catch (error) {
      console.error("Lỗi khi tạo task:", error);
      toast.error("Error in creating tassk");
    } finally {
      hideLoading();
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
            onClick={() => setIsModalOpen(true)}
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
                const phaseName = phases.find((p) => p.id === task.timeline_phase.id)?.name ?? "Not found";

                return (
                  <div key={task.id} className="">
                    <div className=" flex flex-row items-center justify-between">
                      <div className="flex flex-row gap-3 items-center ">
                        {/* Check button */}
                        <div className="w-5 h-5">
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
                                className="w-5 h-5 text-white"
                                strokeWidth={4}
                              />
                            )}
                          </button>
                        </div>

                        <p
                          className={`w-10/12 text-sm font-medium transition-colors ${
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
                      </div>
                      <div className="flex flex-row justify-evenly items-center">
                        <button
                          onClick={() => {
                            setEditingTask({
                              ...task,
                              phaseName: phaseName
                            })
                            setIsModalOpen(true)
                            setIsNew(false)
                          }}
                          className="p-2 hover:bg-muted rounded-lg text-slate-300 hover:text-planner-blue transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="group-hover/item:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                 

                    {/* RENDERING SUBTASKS */}
                    {task.subtasks && subtaskCount > 0 && (
                      <div className="mt-2 ml-2.5 pl-5 border-l border-slate-100 space-y-2">
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
                          )
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

         {isModalOpen && (
            <CalendarModal
              is_new={isNew}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              editingTask={editingTask}
              selectedDate={null}
              phases={phases}
              categories={categories}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
            />
          )}
    </div>
  );
}
