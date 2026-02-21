import React, { useState } from "react";
import "./TaskDetailModal.css";
import type { Task, SubTask } from "../../types/task";
import { X, Plus, Trash2, Flag, Layers, Calendar, CheckSquare } from "lucide-react";

/* ── Status / Priority lookup ── */
const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  todo:          { label: "To Do",    cls: "tdm-status--todo" },
  "in-progress": { label: "In Progress",   cls: "tdm-status--progress" },
  done:          { label: "Done",  cls: "tdm-status--done" },
  cancelled:     { label: "Cancelled",     cls: "tdm-status--cancel" },
};

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  High:   { label: "High",       cls: "tdm-pri--high" },
  Medium: { label: "Medium", cls: "tdm-pri--med" },
  Low:    { label: "Low",      cls: "tdm-pri--low" },
};

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
}

const TaskDetailModal = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
}: TaskDetailModalProps) => {
  if (!isOpen || !task) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks =
      task.subTasks?.map((st: SubTask) =>
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
      ) || [];

    const isAllCompleted =
      updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.isCompleted);
    const newStatus = isAllCompleted ? "done" : task.status;

    onUpdateTask({ ...task, subTasks: updatedSubtasks, status: newStatus });
  };

  const completedCount =
    task.subTasks?.filter((st: SubTask) => st.isCompleted).length || 0;
  const totalCount = task.subTasks?.length || 0;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;

    const newSubtask: SubTask = {
      id: `subtask-${Date.now()}`,
      text: newSubtaskText,
      isCompleted: false,
    };

    const newStatus = task.status === "done" ? "in-progress" : task.status;
    onUpdateTask({
      ...task,
      subTasks: [...(task.subTasks || []), newSubtask],
      status: newStatus,
    });
    setNewSubtaskText("");
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks =
      task.subTasks?.filter((st) => st.id !== subtaskId) || [];
    onUpdateTask({ ...task, subTasks: updatedSubtasks });
  };

  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
  const priority = PRIORITY_CONFIG[task.priority ?? "Medium"] ?? PRIORITY_CONFIG.Medium;

  return (
    <div className="tdm-overlay" onClick={onClose}>
      <div className="tdm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Shimmer stripe */}
        <div className="tdm-shimmer-bar" />

        {/* ── Header ── */}
        <div className="tdm-header">
          <div className="tdm-badges">
            <span className={`tdm-badge ${status.cls}`}>
              <Layers size={12} /> {status.label}
            </span>
            <span className={`tdm-badge ${priority.cls}`}>
              <Flag size={12} /> {priority.label}
            </span>
          </div>
          <button className="tdm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Title ── */}
        <h2 className="tdm-title">{task.title}</h2>

        {/* ── Meta chips ── */}
        <div className="tdm-meta">
          <span className="tdm-chip">
            <Calendar size={14} /> {task.dueDate}
          </span>
          {task.category && (
            <span className="tdm-chip">
              <Layers size={14} /> {task.category}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="tdm-divider" />

        {/* ── Subtasks section ── */}
        <div className="tdm-section">
          <div className="tdm-section-head">
            <h3>
              <CheckSquare size={16} /> Subtasks
            </h3>
            <span className="tdm-progress-badge">{progress}%</span>
          </div>

          <div className="tdm-progress-track">
            <div
              className="tdm-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="tdm-subtask-list">
            {task.subTasks && task.subTasks.length > 0 ? (
              task.subTasks.map((st, idx) => (
                <div
                  key={st.id}
                  className={`tdm-subtask ${st.isCompleted ? "tdm-subtask--done" : ""}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => toggleSubtask(st.id)}
                >
                  <label className="tdm-checkbox">
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      readOnly
                    />
                    <span className="tdm-checkmark" />
                  </label>
                  <span className="tdm-subtask-text">{st.text}</span>
                  <button
                    className="tdm-del"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubtask(st.id);
                    }}
                    aria-label="Delete subtask"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className="tdm-empty">No subtasks yet.</p>
            )}
          </div>

          {/* Add subtask form */}
          <form className="tdm-add-form" onSubmit={handleAddSubtask}>
            <div className="tdm-input-wrap">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Add Subtask..."
              />
            </div>
            <button type="submit" className="tdm-add-btn" onClick={handleAddSubtask}>
              <Plus size={16} /> Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
