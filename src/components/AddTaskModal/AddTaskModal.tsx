import React, { useEffect, useState } from "react";
import type {
  Category,
  Member,
  TaskPriority,
  TaskStatus,
} from "../../types/task.types";
import type { Timeline } from "../../types/timeline.types"; // IMPORT TIMELINE TYPE
import "./AddTaskModal.css";
import {
  Calendar,
  CheckSquare,
  Flag,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  User,
  X,
  Clock, // Thêm icon Clock cho Timeline
} from "lucide-react";

import { todoService } from "../../services/todoService";
import { useToast } from "../../hooks/useToast";
import { useAppStore } from "../../stores/useAppStore";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TaskStatus;
  // Make onSave accept the full payload for creation
  onSave: (taskData: any) => void; 
  members?: Member[];
  phases: Timeline[]; 
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  status,
  onSave,
  members = [],
  phases = [], 
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [isShopping, setIsShopping] = useState(false);
  const [estimated_price, setEstimatedPrice] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [timeline_phase_id, setTimelinePhaseId] = useState(""); // NEW STATE FOR PHASE
  const [categories, setCategories] = useState<Category[]>([]);
  const [subTasks, setSubTasks] = useState<Record<string, boolean>>({});
  const [tempSubtask, setTempSubtask] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  
  const configId = useAppStore((state) => state.configId);
  const toast = useToast();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!configId) return;
        const res: any = await todoService.getCategories(configId);
        const list = res || [];
        setCategories(list);
        if (list.length > 0 && !category_id) {
          setCategoryId(list[0].id);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Set default timeline phase when phases are loaded
  useEffect(() => {
    if (phases.length > 0 && !timeline_phase_id) {
      setTimelinePhaseId(phases[0].id);
    }
  }, [phases, timeline_phase_id]);

  if (!isOpen) return null;

  const addSubtask = () => {
    const trimmedSubtask = tempSubtask.trim();
    if (trimmedSubtask && !(trimmedSubtask in subTasks)) {
      setSubTasks({ ...subTasks, [trimmedSubtask]: false });
      setTempSubtask("");
    }
  };

  const removeSubtask = (key: string) => {
    const updated = { ...subTasks };
    delete updated[key];
    setSubTasks(updated);
  };

  // UNIFIED SUBMIT HANDLER
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Task title cannot be empty.");
      return;
    }

    if (!timeline_phase_id) {
      toast.warning("Please select a Timeline Phase.");
      return;
    }

    if (!category_id) {
      toast.warning("Please select a Category.");
      return;
    }

    const taskData = {
      title: title.trim(),
      category_id: category_id,
      timeline_phase_id: timeline_phase_id, // INCLUDED PHASE ID
      tet_config_id: configId,              // INCLUDED CONFIG ID
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      subtasks: Object.keys(subTasks).length > 0 ? subTasks : undefined,
      status: status || ("pending" as TaskStatus),
      is_shopping: isShopping,
      estimated_price: isShopping && estimated_price ? Number(estimated_price) : undefined,
      assigned_to: assignedTo || undefined,
      quantity: 1, // Default quantity
    };

    // Pass data to the parent component (TaskManagement) to handle API call and state update
    onSave(taskData);

    // Reset Form
    setTitle("");
    setPriority("medium");
    setCategoryId(categories.length > 0 ? categories[0].id : "");
    setTimelinePhaseId(phases.length > 0 ? phases[0].id : "");
    setDeadline("");
    setSubTasks({});
    setIsShopping(false);
    setEstimatedPrice("");
    setAssignedTo("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            Add New Task
          </h3>
          <button className="close-button" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Task Title */}
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              className="form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Buy decorations"
              autoFocus
            />
          </div>

          {/* Assigned To */}
          {members.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                <User size={14} /> Assigned To
              </label>
              <div className="assignee-picker">
                {members.map((member) => (
                  <button
                    key={member.user_id}
                    type="button"
                    className={`assignee-picker__item ${assignedTo === member.user_id ? "assignee-picker__item--active" : ""}`}
                    onClick={() =>
                      setAssignedTo(
                        assignedTo === member.user_id ? "" : member.user_id,
                      )
                    }
                    title={member.name}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="assignee-picker__avatar"
                    />
                    <span className="assignee-picker__name">{member.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Phase & Category */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Clock size={14} /> Timeline Phase
              </label>
              <select
                className="form-input"
                value={timeline_phase_id}
                onChange={(e) => setTimelinePhaseId(e.target.value)}
                required
              >
                <option value="" disabled>Select a phase...</option>
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Tag size={14} /> Category
              </label>
              <select
                className="form-input"
                value={category_id}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="" disabled>Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Flag size={14} /> Priority
              </label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} /> Deadline
              </label>
              <input
                className="form-input"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Shopping Toggle & Price */}
          <div className="form-group border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0! flex items-center gap-2 cursor-pointer">
                <ShoppingCart size={14} /> Is this a Shopping Task?
              </label>
              <label className="form-toggle">
                <input
                  type="checkbox"
                  checked={isShopping}
                  onChange={(e) => setIsShopping(e.target.checked)}
                  className="form-toggle__input"
                />
                <span className="form-toggle__switch"></span>
                <span className="form-toggle__text">
                  {isShopping ? "Yes" : "No"}
                </span>
              </label>
            </div>
            
            {isShopping && (
              <input
                className="form-input mt-2"
                type="number"
                value={estimated_price}
                onChange={(e) =>
                  setEstimatedPrice(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="Estimated price ($)"
                min={0}
              />
            )}
          </div>

          {/* Subtasks */}
          <div className="form-group">
            <label className="form-label">
              <CheckSquare size={14} /> Subtasks
            </label>
            <div className="subtask-input-group">
              <input
                className="form-input"
                type="text"
                value={tempSubtask}
                onChange={(e) => setTempSubtask(e.target.value)}
                placeholder="Add a subtask..."
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSubtask())
                }
              />
              <button
                type="button"
                className="btn-add-subtask"
                onClick={addSubtask}
                title="Add Subtask"
              >
                <Plus size={20} />
              </button>
            </div>
            {/* Subtasks List */}
            {Object.keys(subTasks).length > 0 && (
              <ul className="subtask-list mt-2">
                {Object.keys(subTasks).map((key) => (
                  <li key={key} className="subtask-item">
                    <span>• {key}</span>
                    <button
                      type="button"
                      className="btn-remove-subtask"
                      onClick={() => removeSubtask(key)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-submit">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;