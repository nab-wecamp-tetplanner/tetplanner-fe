import React from "react";
import "./TaskDetailModal.css";
import type { Task, SubTask } from "../../types/task";
import { Calendar, CheckSquare } from "lucide-react";

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

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks =
      task.subTasks?.map((st: SubTask) =>
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
      ) || [];

    const updatedTask = { ...task, subTasks: updatedSubtasks };
    onUpdateTask(updatedTask);
  };

  const completedCount =
    task.subTasks?.filter((st: SubTask) => st.isCompleted).length || 0;
  const totalCount = task.subTasks?.length || 0;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task.title}</h3>
          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>
        
        <h2 className="task-detail-title">{task.title}</h2>
        <div className="task-meta-row">
          <span>
            <Calendar size={14} /> {task.dueDate}
          </span>
          <span>
            In list: <strong>{task.status}</strong>
          </span>
        </div>

        <div className="detail-section">
          <div className="section-header">
            <h3>
              <CheckSquare size={16} /> Subtasks
            </h3>
            <span className="progress-text">{progress}% Completed</span>
          </div>

          <div className="detail-progress-bar">
            <div
              className="detail-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="subtask-list-view">
            {task.subTasks && task.subTasks.length > 0 ? (
              task.subTasks.map((st) => (
                <div
                  key={st.id}
                  className={`subtask-item-row ${st.isCompleted ? "completed" : ""}`}
                  onClick={() => toggleSubtask(st.id)}
                >
                  <input
                    type="checkbox"
                    checked={st.isCompleted}
                    readOnly 
                  />
                  <span>{st.text}</span>
                </div>
              ))
            ) : (
              <p className="empty-text">No subtasks yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
