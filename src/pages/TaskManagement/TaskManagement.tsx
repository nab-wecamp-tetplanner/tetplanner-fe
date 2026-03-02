/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  TetConfig,
  Task,
  TaskStatus,
  Category,
  Member,
} from "../../types/task.types";
import { todoService } from "../../services/todoService";
import { collaboratorService } from "../../services/collaboratorService";

import "./TaskManagement.css";
import { Plus, Calendar } from "lucide-react";
import TaskColumn from "../../components/TaskColumn/TaskColumn";
import AddTaskModal from "../../components/AddTaskModal/AddTaskModal";
import TaskDetailModal from "../../components/TaskDetailModal/TaskDetailModal";
import CelebrationParticles from "../../components/CelebrationParticles/CelebrationParticles";
import {
  Lantern,
  BlossomBranch,
  CloudMotif,
  TraditionalCake,
  MysticKnot,
} from "../../components/Decoratives/Decoratives";
import {
  LuckyEnvelope,
  RewardModal,
} from "../../components/Gamification/Gamification";
import FallingPetals from "../../components/FallingPetals/FallingPetals";
import SharePlanModal from "../../components/SharePlanModal/SharePlanModal";
import ManagePhasesModal from "../../components/ManagePhasesModal/ManagePhasesModal";
import TaskFilter, {
  EMPTY_FILTERS,
} from "../../components/TaskFilter/TaskFilter";
import type { TaskFilters } from "../../components/TaskFilter/TaskFilter";
import { useToast } from "../../hooks/useToast";
import { useAuthContext } from "../../contexts/AuthTypes";
import { useAppStore } from "../../stores/useAppStore";
import apiClient from "../../services/apiClient";
import type { Timeline } from "../../types/timeline.types";

/* ===== Decorative SVG Background Pattern ===== */
const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d6cfc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const TaskManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [configs, setConfigs] = useState<TetConfig[]>([]);
  const toast = useToast();
  const [phases, setPhases] = useState<Timeline[]>([]);

  // const [activeConfigId, setActiveConfigId] = useState<string>(
  //   storeConfigId || "",
  // );
  const activeConfigId = useAppStore((state) => state.configId);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeColumn, setActiveColumn] = React.useState<TaskStatus>("pending");
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [celebration, setCelebration] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [todoItems, setTodoItems] = useState<Task[]>([]);
  const [activePhaseId, setActivePhaseId] = useState<string>("");
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [taskFilters, setTaskFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const { currentUser } = useAuthContext();
  const refreshKey = useAppStore((state) => state.refreshKey);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const configList: any = await todoService.getTetConfigs();
        setConfigs(configList);

        // try {
        //   const categoriesList: any = await todoService.getCategories();
        //   setCategories(categoriesList);
        // } catch (error) {
        //   console.error("Error fetching categories:", error);
        // }

        // const urlConfigId = searchParams.get("config");
        // const targetConfigId =
        //   urlConfigId ||
        //   storeConfigId ||
        //   (configList.length > 0 ? configList[0].id : null);

        // if (targetConfigId) {
        //   setActiveConfigId(targetConfigId);
        // }
      } catch (error) {
        console.error("Lỗi lấy Configs:", error);
      }
    };

    fetchConfigs();
  }, [searchParams, refreshKey]);

  useEffect(() => {
    if (!activeConfigId) return;
    const fetchCategories = async () => {
      const data = await todoService.getCategories(activeConfigId);
      setCategories(data);
    }
    fetchCategories();
  }, [activeConfigId])

  useEffect(() => {
    if (!activeConfigId) return;

    const fetchPhasesAndMembers = async () => {
      // 1.Get Members
      try {
        const data: any =
          await collaboratorService.getCollaborators(activeConfigId);
        const memberList: Member[] = [];

        // Check if current user is the owner
        if (
          data.owner &&
          currentUser &&
          String(data.owner.id) === String(currentUser.id)
        ) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }

        if (data.owner) {
          memberList.push({
            id: data.owner.id,
            user_id: data.owner.user_id || data.owner.id,
            name: data.owner.name || "Owner",
            avatar: data.owner.image_url || "",
          });
        }
        if (data.collaborators) {
          for (const c of data.collaborators) {
            if (c.status === "accepted" || !c.status) {
              memberList.push({
                id: c.user_id,
                user_id: c.user_id,
                name: c.user?.name || "User",
                avatar: c.user?.image_url || "",
              });
            }
          }
        }
        setMembers(memberList);
        console.log("🟢 Members loaded:", memberList.map(m => ({ id: m.id, user_id: m.user_id, name: m.name })));
      } catch (err) {
        console.error("Lỗi lấy Members:", err);
      }

      // 2. Get phases for the selected config
      try {
        const phaseList: any =
          await todoService.getTimelinePhases(activeConfigId);
        setPhases(phaseList);

        if (phaseList.length > 0) {
          setActivePhaseId(phaseList[0].id);
        } else {
          setActivePhaseId("");
        }
      } catch (error) {
        console.error("Lỗi lấy Phase:", error);
      }
    };

    fetchPhasesAndMembers();
  }, [activeConfigId, currentUser]);

  // ==========================================
  // Normalize raw API task → Task shape
  // ==========================================
  const normalizeTask = (raw: any): Task => {
    let assignedToUser: { id: string } | null = null;
    if (
      raw.assigned_to_user &&
      typeof raw.assigned_to_user === "object" &&
      raw.assigned_to_user.id
    ) {
      assignedToUser = { id: String(raw.assigned_to_user.id) };
    } else if (
      typeof raw.assigned_to_user === "string" &&
      raw.assigned_to_user
    ) {
      assignedToUser = { id: raw.assigned_to_user };
    } else if (typeof raw.assigned_to === "string" && raw.assigned_to) {
      assignedToUser = { id: raw.assigned_to };
    } else if (typeof raw.assigned_to === "number" && raw.assigned_to) {
      assignedToUser = { id: String(raw.assigned_to) };
    } else if (
      raw.assigned_to &&
      typeof raw.assigned_to === "object" &&
      raw.assigned_to.id
    ) {
      assignedToUser = { id: String(raw.assigned_to.id) };
    }

    console.log("🟡 normalizeTask raw.assigned_to:", raw.assigned_to, "raw.assigned_to_user:", raw.assigned_to_user, "=> assignedToUser:", assignedToUser);

    return {
      ...raw,
      category_id: raw.category_id ?? raw.category?.id ?? undefined,
      assigned_to_user: assignedToUser,
    };
  };

  // ==========================================
  // auto-fetch tasks when activeConfigId or activePhaseId changes
  // ==========================================
  useEffect(() => {
    const fetchTasks = async () => {
      if (!activeConfigId || !activePhaseId) {
        setTodoItems([]);
        return;
      }

      try {
        setIsLoading(true);
        const response: any = await todoService.getTodoItems(
          activeConfigId,
          activePhaseId,
        );
        const items: Task[] = (response || []).map(normalizeTask);
        setTodoItems(items);
      } catch (error) {
        console.error("Lỗi lấy Tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [activeConfigId, activePhaseId]);

  const handleCelebrate = (x: number, y: number) => {
    setCelebration(null);

    setTimeout(() => {
      setCelebration({ x, y });
    }, 10);

    setTimeout(() => {
      setCelebration(null);
    }, 2000);
  };

  const currentTasks = useMemo(() => {
    let filtered = todoItems;

    // Text search
    if (searchQuery.trim()) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Category filter
    if (taskFilters.categories.length > 0) {
      filtered = filtered.filter(
        (task) =>
          task.category_id && taskFilters.categories.includes(task.category_id),
      );
    }

    // Status filter
    if (taskFilters.statuses.length > 0) {
      filtered = filtered.filter((task) =>
        taskFilters.statuses.includes(task.status),
      );
    }

    // Priority filter
    if (taskFilters.priorities.length > 0) {
      filtered = filtered.filter((task) =>
        taskFilters.priorities.includes(task.priority),
      );
    }

    return filtered;
  }, [todoItems, searchQuery, taskFilters]);

  const columns: { id: TaskStatus; label: string }[] = [
    { id: "pending", label: "To Do" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const handleDeleteTask = async (taskId: string) => {
    const targetTask = todoItems.find((t) => t.id === taskId);
    if (!targetTask) return;

    const isHardDelete = targetTask.status === "cancelled";
    if (isHardDelete) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this cancelled task? This action cannot be undone.",
      );
      if (!confirmDelete) return;
    }
    const backupTasks = [...todoItems];
    if (isHardDelete) {
      setTodoItems((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      setTodoItems((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: "cancelled" as TaskStatus } : t,
        ),
      );
    }
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
    }

    // API call to update status or delete
    try {
      if (isHardDelete) {
        await todoService.deleteTodoItem(taskId);
      } else {
        await todoService.updateTodoItem(taskId, {
          status: "cancelled" as TaskStatus,
        });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setTodoItems(backupTasks);
      toast.error("Failed to update task. Please try again.");
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    const backupTasks = [...todoItems];
    const targetTask = todoItems.find((t) => t.id === taskId);

    // FIX TẠI ĐÂY: Nếu không tìm thấy task thì dừng luôn, không chạy tiếp bên dưới
    if (!targetTask) return;

    const isNowPurchased = newStatus === "completed" && targetTask.is_shopping;

    // Tự động tick subtasks khi xong task
    const completedSubtasks =
      newStatus === "completed" && targetTask.subtasks
        ? Object.fromEntries(
            Object.keys(targetTask.subtasks).map((key) => [key, true]),
          )
        : undefined;

    setTodoItems((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              purchased: isNowPurchased ? true : task.purchased, // PHẢI CÓ DẤU PHẨY Ở ĐÂY
              ...(completedSubtasks ? { subtasks: completedSubtasks } : {}), // Spread subtasks
            }
          : task,
      ),
    );

    try {
      // Gửi API đồng bộ cả 2 trạng thái
      await todoService.updateTodoItem(taskId, { status: newStatus });

      if (completedSubtasks) {
        await Promise.all(
          Object.keys(completedSubtasks).map((name) =>
            todoService.addOrUpdateSubtask(taskId, { name, done: true }),
          ),
        );
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setTodoItems(backupTasks);
      toast.error("Failed to move task. Please try again.");
    }
  };

  const handleAddTask = async (
    taskData: Omit<
      Task,
      "id" | "created_at" | "is_overdue" | "purchased" | "quantity"
    >,
  ) => {
    // API call to create new task
    let newTask: Task;
    const assignedToId = (taskData as any).assigned_to || taskData.assigned_to_user?.id || undefined;
    try {
      const response = await todoService.addTodoItem({
        title: taskData.title,
        priority: taskData.priority,
        status: activeColumn as any,
        deadline: taskData.deadline,
        is_shopping: taskData.is_shopping,
        estimated_price: taskData.estimated_price,
        assigned_to: assignedToId,
        category_id: (taskData as any).category_id,
        subtasks: taskData.subtasks || {},
        tet_config_id: activeConfigId,
        timeline_phase_id: activePhaseId,
      });
      newTask = normalizeTask(response);
      // Fallback: if API response didn't include assigned_to, set it from what we sent
      if (!newTask.assigned_to_user && assignedToId) {
        newTask = { ...newTask, assigned_to_user: { id: String(assignedToId) } };
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.");
      return;
    }

    setTodoItems((prev) => [...prev, newTask]);
    setIsModalOpen(false);
  };
  //MOCK
  // const handleAddTask = (taskData: any) => {
  //     const newTask: Task = {
  //         id: `mock-task-${Date.now()}`,
  //         title: taskData.title,
  //         priority: taskData.priority,
  //         status: activeColumn as any,
  //         deadline: taskData.deadline,
  //         is_shopping: taskData.is_shopping,
  //         estimated_price: taskData.estimated_price,
  //         quantity: taskData.quantity,
  //         assigned_to: taskData.assigned_to,
  //         created_at: new Date().toISOString(),
  //         is_overdue: false,
  //         purchased: false,
  //     };

  //     // Update UI only, no API call
  //     setTodoItems(prev => [...prev, newTask]);
  //     setIsModalOpen(false);
  // };

  const handleOpenModal = (columnId: TaskStatus) => {
    setActiveColumn(columnId);
    setIsModalOpen(true);
  };

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
  };

  const handleUpdateTask = (updatedTask: Task, skipApi: boolean = false) => {
    // API call to update task details
    setTodoItems((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
    setSelectedTask(updatedTask);
    if (skipApi) return;
    todoService
      .updateTodoItem(updatedTask.id, updatedTask)
      .then(() => {
        setTodoItems((prev) =>
          prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
        setSelectedTask(updatedTask);
      })
      .catch((error) => {
        console.error("Error updating task:", error);
        toast.error("Failed to update task. Please try again.");
      });
  };

  const hanldeAddPhase = async (newPhase: any) => {
    const savedPhase = await apiClient.timelinePhases.create(newPhase);
    setPhases((prev) => [...prev, savedPhase]);
    setActivePhaseId(savedPhase.id);
  };

  /* ===== Progress & Gamification Logic ===== */
  const progress = useMemo(() => {
    const total = currentTasks.length;
    if (total === 0)
      return { percent: 0, completed: 0, total: 0, allDone: false };
    const completed = currentTasks.filter(
      (t) => t.status === "completed",
    ).length;
    return {
      percent: Math.round((completed / total) * 100),
      completed,
      total,
      allDone: completed === total && total > 0,
    };
  }, [currentTasks]);

  //budget
  const budgetStats = useMemo(() => {
    const activeConfig = configs.find((c) => c.id === activeConfigId);
    const total = activeConfig?.total_budget || 0;

    const used = currentTasks
      .filter((t) => t.is_shopping && t.status !== "cancelled")
      .reduce((sum, task) => {
        const price = task.estimated_price || 0;
        const qty = task.quantity || 1;
        return sum + price * qty;
      }, 0);

    const percent =
      total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;
    const isWarning = percent >= 80;

    return { total, used, percent, isWarning };
  }, [currentTasks, configs, activeConfigId]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  return (
    <div className="tet-page">
      {/* Background Pattern & Warm Overlay */}
      <div
        className="tet-bg-pattern"
        style={{ backgroundImage: BACKGROUND_PATTERN }}
      ></div>
      <div className="tet-bg-warm-gradient"></div>

      {/* Decorative Elements */}
      <FallingPetals count={20} />
      <Lantern className="tet-deco--top-left" size="lg" />
      <Lantern className="tet-deco--top-right" size="md" />
      <BlossomBranch className="tet-deco--branch-left" variant="apricot" />
      <BlossomBranch className="tet-deco--branch-right" variant="apricot" />
      <BlossomBranch className="tet-deco--branch-center-1" variant="apricot" />
      <BlossomBranch className="tet-deco--branch-center-2" variant="peach" />
      <BlossomBranch className="tet-deco--branch-center-3" variant="apricot" />
      <BlossomBranch className="tet-deco--branch-bottom-left" variant="peach" />
      <BlossomBranch
        className="tet-deco--branch-bottom-right"
        variant="apricot"
      />
      <CloudMotif className="tet-deco--cloud-1" />
      <CloudMotif className="tet-deco--cloud-2" />
      <TraditionalCake className="tet-deco--cake" variant="chung" />

      <header className="tet-page-header h-30 items-start">
        <div className="tet-header-row">
          <div className="tet-collaborators">
            <div className="tet-collaborators__avatars">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="tet-collaborators__avatar"
                  title={m.name}
                >
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="tet-collaborators__avatar-img"
                    />
                  ) : (
                    <span className="tet-collaborators__avatar-placeholder">
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {isOwner && (
                <button
                  className="tet-collaborators__add"
                  title="Add Member"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
            <span className="tet-collaborators__label">Collaborators</span>
          </div>

          <div className="tet-header-right ">
            <div className="tet-search-box h-20 items-start">
              {/* <Search size={15} className="tet-search-icon items-start" /> */}
              <input
                type="text"
                placeholder="Search..."
                className="tet-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <TaskFilter
              phases={phases}
              categories={categories}
              filters={taskFilters}
              onFiltersChange={setTaskFilters}
            />

            {/* Manage Timeline */}
            <div className="flex items-start h-20">
              <button
                className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-all duration-200 border rounded-xl shadow-sm bg-(--bg-glass] border-(--border) text-(--text-muted) hover:text-(--text) hover:bg-(--bg-card)"
                onClick={() => setIsPhaseModalOpen(true)}
                title="Manage timeline phases"
              >
                {/* Use theme primary color instead of hardcoded #dc2626 */}
                <Calendar size={15} className="text-(--primary)" />
                Add timeline
              </button>
            </div>

            <div className="h-20 items-start">
              <button
                className="tet-primary-btn"
                onClick={() => {
                  setActiveColumn("pending");
                  setIsModalOpen(true);
                }}
              >
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Progress Bar ===== */}
      <div className="tet-progress-section">
        <MysticKnot width={140} />
        <div className="tet-progress">
          <div className="tet-progress__header">
            <span className="tet-progress__label">Preparation Progress</span>
            <span className="tet-progress__stats">
              {progress.completed}/{progress.total} tasks · {progress.percent}%
            </span>
          </div>
          <div className="tet-progress__bar">
            <div
              className="tet-progress__fill"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="tet-progress">
          <div className="tet-progress__header">
            <span className="tet-progress__label">
              Shopping Budget
              {budgetStats.isWarning && (
                <span
                  style={{
                    color: "#dc2626",
                    marginLeft: "8px",
                    fontSize: "12px",
                  }}
                >
                  ⚠️ Approaching budget limit!
                </span>
              )}
            </span>
            <span
              className="tet-progress__stats"
              style={{
                color: budgetStats.isWarning ? "#dc2626" : "#4b5563",
                fontWeight: budgetStats.isWarning ? 600 : 400,
              }}
            >
              {formatVND(budgetStats.used)} / {formatVND(budgetStats.total)}
            </span>
          </div>
          {/* Progress bar background (light gray, or light red if warning) */}
          <div
            className="tet-progress__bar"
            style={{
              backgroundColor: budgetStats.isWarning ? "#fee2e2" : "#f3f4f6",
            }}
          >
            <div
              className="tet-progress__fill"
              style={{
                width: `${budgetStats.percent}%`,
                backgroundColor: budgetStats.isWarning ? "#ef4444" : "#10b981",
                transition: "width 0.5s ease-in-out, background-color 0.3s",
              }}
            />
          </div>
        </div>
        <MysticKnot width={140} />
      </div>

      {isLoading ? (
        <div className="tet-loading">Loading tasks...</div>
      ) : (
        <div className="tet-kanban-board">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              label={column.label}
              status={column.id}
              tasks={currentTasks.filter((task) => task.status === column.id)}
              onMoveTask={handleMoveTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={() => handleOpenModal(column.id)}
              onTaskClick={handleOpenTaskDetail}
              onCelebrate={handleCelebrate}
              categories={categories}
              members={members}
            />
          ))}
        </div>
      )}

      <AddTaskModal
        phases={phases}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        status={activeColumn}
        onSave={handleAddTask}
        members={members}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        members={members}
        categories={categories}
      />

      {/* Celebration particles when task dropped in Done */}
      {celebration && (
        <CelebrationParticles
          x={celebration.x}
          y={celebration.y}
          onComplete={() => setCelebration(null)}
        />
      )}

      {/* Lucky Envelope — appears when all tasks are completed */}
      <LuckyEnvelope
        show={progress.allDone && !rewardClaimed}
        onOpen={() => setIsRewardOpen(true)}
      />

      {/* Reward Modal */}
      <RewardModal
        isOpen={isRewardOpen}
        onClose={() => {
          setIsRewardOpen(false);
          setRewardClaimed(true);
        }}
        totalTasks={progress.total}
      />
      {/* Share Modal */}
      <SharePlanModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        configId={activeConfigId ?? ""}
        isOwner={isOwner}
      />

      <ManagePhasesModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        phases={phases}
        configId={activeConfigId ?? ""}
        activePhaseId={activePhaseId}
        onSelectPhase={setActivePhaseId}
        onPhaseCreated={(newPhase) => hanldeAddPhase(newPhase)}
      />
    </div>
  );
};

export default TaskManagement;
