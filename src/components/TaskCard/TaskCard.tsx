import React, { useState } from "react";
import {
  Clock,
  Flame,
  MoreHorizontal,
  ShoppingCart,
  BadgeDollarSign,
  ChevronDown,
  ChevronUp,
  User,
  Flag,
  CheckCircle2,
  Circle,
  Package,
  AlertCircle,
} from "lucide-react";
import type { Task, Category, Member } from "../../types/task.types";
import "./TaskCard.css";

interface TaskCardProps {
  task: Task;
  onDeleteTask?: (taskId: string) => void;
  onClick?: (task: Task) => void;
  isDissolving?: boolean;
  categories?: Category[];
  members?: Member[];
}

/* ── Status / Priority config ── */
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "To Do", cls: "tet-status--todo" },
  in_progress: { label: "In Progress", cls: "tet-status--progress" },
  completed: { label: "Completed", cls: "tet-status--done" },
  cancelled: { label: "Cancelled", cls: "tet-status--cancel" },
};

const PRIORITY_LABEL: Record<string, { label: string; cls: string }> = {
  urgent: { label: "Urgent", cls: "tet-pri--urgent" },
  high: { label: "High", cls: "tet-pri--high" },
  medium: { label: "Medium", cls: "tet-pri--med" },
  low: { label: "Low", cls: "tet-pri--low" },
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDeleteTask,
  onClick,
  isDissolving,
  categories,
  members,
}) => {
  const [expanded, setExpanded] = useState(false);

  /* Resolve category name from UUID */
  const categoryName = categories?.find(
    (c) => String(c.id) === String(task.category_id),
  )?.name;
  // try to match either user_id or member.id, since the API may refer to either
  const assignedMember = members?.find(
    (m) =>
      String(m.user_id) === String(task.assigned_to_user?.id) ||
      String(m.id) === String(task.assigned_to_user?.id),
  );

  /* ── Subtask progress ── */
  const subtaskEntries = task.subtasks ? Object.entries(task.subtasks) : [];
  const subtaskTotal = subtaskEntries.length;
  const subtaskDone = subtaskEntries.filter(([, v]) => v).length;
  const progressPercent =
    subtaskTotal > 0
      ? Math.round((subtaskDone / subtaskTotal) * 100)
      : task.status === "completed"
        ? 100
        : task.status === "in_progress"
          ? 50
          : 0;
  const progressText =
    subtaskTotal > 0 ? `${subtaskDone}/${subtaskTotal}` : `${progressPercent}%`;

  const getCategoryColor = () => {
    const name = (categoryName || "").toLowerCase();
    switch (name) {
      case "design":
        return "tet-tag--rose";
      case "marketing":
        return "tet-tag--amber";
      case "product":
        return "tet-tag--jade";
      case "development":
        return "tet-tag--indigo";
      default:
        return "tet-tag--stone";
    }
  };

  const isHighPriority = task.priority === "high" || task.priority === "urgent";
  const status = STATUS_LABEL[task.status] ?? STATUS_LABEL.pending;
  const priority = PRIORITY_LABEL[task.priority] ?? PRIORITY_LABEL.medium;

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteTask) onDeleteTask(task.id);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleCardClick = () => {
    console.log(
      "🔵 TaskCard.handleCardClick called, onClick defined?",
      !!onClick,
      "task:",
      task,
    );
    if (onClick) {
      console.log("✅ Calling onClick with task:", task);
      onClick(task);
    } else {
      console.warn("❌ onClick prop is undefined!");
    }
  };

  return (
    <div
      className={`tet-card ${isHighPriority ? "tet-card--gold" : ""} ${isDissolving ? "tet-card--dissolving" : ""}`}
      draggable="true"
      onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
    >
      {/* Gold trim corner for high priority */}
      {isHighPriority && <div className="tet-card__gold-trim"></div>}

      {/* Card body */}
      <div className="tet-card__body">
        {/* ── Row 1: Category tag + badges + actions ── */}
        <div className="tet-card__top">
          <div className="tet-card__top-left">
            {task.category_id && categoryName && (
              <span className={`tet-card__tag ${getCategoryColor()}`}>
                {categoryName}
              </span>
            )}
            <span className={`tet-card__badge ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <div className="tet-card__top-right">
            <span className={`tet-card__badge ${priority.cls}`}>
              <Flag size={10} /> {priority.label}
            </span>
            {task.is_overdue && task.status !== "completed" && (
              <span className="tet-card__badge tet-badge--overdue">
                <AlertCircle size={10} /> Overdue
              </span>
            )}
            {task.is_shopping && (
              <span className="tet-card__badge tet-badge--shopping">
                <ShoppingCart size={10} />
              </span>
            )}
            <button className="tet-card__more" onClick={handleMoreClick}>
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        {/* ── Title (click opens detail modal) ── */}
        <h3 className="tet-card__title" onClick={handleCardClick}>
          {task.title}
        </h3>

        {/* ── Priority indicator for urgent/high ── */}
        {isHighPriority && (
          <div className="tet-card__priority-bar">
            <Flame size={12} />
            <span>
              {task.priority === "urgent" ? "Urgent Priority" : "High Priority"}
            </span>
          </div>
        )}

        {/* ── Attribute chips row ── */}
        <div className="tet-card__chips">
          {task.deadline && (
            <span
              className={`tet-card__chip ${task.is_overdue ? "tet-card__chip--overdue" : ""}`}
            >
              <Clock size={11} />
              <span>
                {new Date(task.deadline).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </span>
          )}
          {task.estimated_price != null && task.estimated_price > 0 && (
            <span className="tet-card__chip tet-card__chip--price">
              <BadgeDollarSign size={11} />
              {new Intl.NumberFormat("vi-VN").format(task.estimated_price)}{" "}
              ₫{" "}
            </span>
          )}
          {task.is_shopping && task.quantity > 0 && (
            <span className="tet-card__chip">
              <Package size={11} /> x{task.quantity}
            </span>
          )}
        </div>

        {/* ── Progress bar ── */}
        <div className="tet-card__progress">
          <div className="tet-card__progress-bar">
            <div
              className={`tet-card__progress-fill tet-card__progress-fill--${task.status}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="tet-card__progress-text">{progressText}</span>
        </div>

        {/* ── Footer: Assignee + Expand toggle ── */}
        <div className="tet-card__footer">
          {assignedMember ? (
            <div className="tet-card__assignee" title={assignedMember.name}>
              <img
                src={assignedMember.avatar}
                alt={assignedMember.name}
                className="tet-card__assignee-avatar"
              />
              <span className="tet-card__assignee-name">
                {assignedMember.name}
              </span>
            </div>
          ) : (
            <div className="tet-card__assignee tet-card__assignee--none">
              <User size={14} />
              <span className="tet-card__assignee-name">Unassigned</span>
            </div>
          )}
          <div className="tet-card__footer-actions">
            <button
              className="tet-card__detail-btn"
              onClick={handleCardClick}
              title="View details"
            >
              Details
            </button>
            {subtaskTotal > 0 && (
              <button
                className="tet-card__expand-btn"
                onClick={handleExpandToggle}
                title="Show subtasks"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        {/* ── Expandable subtask section ── */}
        {expanded && subtaskTotal > 0 && (
          <div className="tet-card__expand">
            <div className="tet-card__expand-header">
              <span>Subtasks</span>
              <span className="tet-card__expand-count">
                {subtaskDone}/{subtaskTotal}
              </span>
            </div>
            <ul className="tet-card__subtask-list">
              {subtaskEntries.map(([title, done]) => (
                <li
                  key={title}
                  className={`tet-card__subtask ${done ? "tet-card__subtask--done" : ""}`}
                >
                  {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                  <span>{title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
