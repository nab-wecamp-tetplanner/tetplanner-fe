import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type {
  Category,
  Member,
  TaskPriority,
  TaskStatus,
} from "../../types/task.types";
import type { Timeline } from "../../types/timeline.types";
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
  Clock,
  Check,
} from "lucide-react";

import { useToast } from "../../hooks/useToast";
import { useAppStore } from "../../stores/useAppStore";
import apiClient from "../../services/apiClient";
import "./AddTaskModal.css";
interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TaskStatus;
  onSave: (taskData: any) => void;
  phases: Timeline[],
  setPhases: Dispatch<SetStateAction<Timeline[]>>
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  members?: Member[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  status,
  onSave,
  phases, 
  setPhases,
  categories,
  setCategories,
  members = [],
  phases: initialPhases = [],
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [isShopping, setIsShopping] = useState(false);
  const [estimated_price, setEstimatedPrice] = useState<number | "">("");
  const [deadline, setDeadline] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [timeline_phase_id, setTimelinePhaseId] = useState("");
  const [subTasks, setSubTasks] = useState<Record<string, boolean>>({});
  const [tempSubtask, setTempSubtask] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");

  const [newPhaseStart, setNewPhaseStart] = useState("");
  const [newPhaseEnd, setNewPhaseEnd] = useState("");
  // const [newPhaseOrder, setNewPhaseOrder] = useState<number | "">("");

  // Data States
  // const [categories, setCategories] = useState<Category[]>([]);
  // const [phases, setPhases] = useState<Timeline[]>(initialPhases);

  // Quick Add UI States
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");

  const configId = useAppStore((state) => state.configId);
  const toast = useToast();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!configId) return;
        const res: any = await apiClient.categories.getByTetConfig(configId);
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
      setPhases(initialPhases);
    }
  }, [isOpen, configId, initialPhases]);

  // Set default timeline phase
  useEffect(() => {
    if (phases.length > 0 && !timeline_phase_id) {
      setTimelinePhaseId(phases[0].id);
    }
  }, [phases, timeline_phase_id]);

  if (!isOpen) return null;

  // Quick Add Handlers
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      if (!configId) return;
      const res: any = await apiClient.categories.create({
        name: newCategoryName,
        icon: "",
        allocated_budget: 12,
        tet_config_id: configId,
      });
      setCategories([...categories, res]);
      setCategoryId(res.id);
      setNewCategoryName("");
      setShowAddCategory(false);
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error("Failed to add category.");
    }
  };

  const handleCreatePhase = async () => {
    if (!newPhaseName.trim()) return;
    try {
      if (!configId) return;
      const res: any = await apiClient.timelinePhases.create({
        name: newPhaseName,
        tet_config_id: configId,
        display_order: (phases?.length ?? 0) + 1,
        start_date: newPhaseStart,
        end_date: newPhaseEnd,
      });
      setPhases([...phases, res]);
      setTimelinePhaseId(res.id);
      setNewPhaseName("");
      setShowAddPhase(false);
      toast.success("Timeline phase added successfully!");
    } catch (error) {
      toast.error("Failed to add phase.");
    }
  };

  // Subtask Handlers
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

  // Submit Handler
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
      timeline_phase_id: timeline_phase_id,
      tet_config_id: configId,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      subtasks: Object.keys(subTasks).length > 0 ? subTasks : undefined,
      status: status || ("pending" as TaskStatus),
      is_shopping: isShopping,
      estimated_price:
        isShopping && estimated_price ? Number(estimated_price) : undefined,
      assigned_to: assignedTo || undefined,
      quantity: 1,
    };

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
    <div
      className="z-[9999] w-1/2 fixed inset-0 z- flex justify-center items-center animate-[fadeIn_0.2s_ease-out] mx-auto 0"
      onClick={onClose}
    >
      {/* Injecting specific keyframes missing in default tailwind */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkPop { from { transform: scale(0); } to { transform: scale(1); } }
      `}</style>

      <div
        className="bg-white/92 backdrop-blur-[16px] border border-stone-300/50 p-8 rounded-[20px] w-[95%] w-fulll shadow-[0_24px_48px_rgba(120,113,108,0.12),0_0_0_1px_rgba(214,211,209,0.2)] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] flex flex-col gap-6 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-stone-400/40 [&::-webkit-scrollbar-thumb]:rounded-[10px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3
            className="m-0 text-[1.35rem] font-bold text-stone-800"
            style={{
              fontFamily: "'Playfair Display', 'Noto Serif', Georgia, serif",
            }}
          >
            Add New Task
          </h3>
          <button
            className="w-[34px] h-[34px] grid place-items-center bg-stone-100/80 border border-stone-300/50 rounded-[10px] text-stone-500 cursor-pointer transition-all duration-200 hover:bg-red-200/40 hover:text-red-600"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Task Title */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px]">
              Task Title
            </label>
            <input
              className="w-full px-[14px] py-[11px] rounded-[10px] border border-stone-300/60 text-[0.9rem] text-stone-800 outline-none transition-all duration-200 bg-white/70 placeholder:text-stone-400 focus:border-amber-600/40 focus:ring-[3px] focus:ring-amber-400/10 focus:bg-white/95"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Buy decorations"
              autoFocus
            />
          </div>

          {/* Assigned To */}
          {/* {members.length > 0 && (
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px]">
                <User size={14} /> Assigned To
              </label>
              <div className="flex gap-[10px] flex-wrap">
                {members.map((member) => (
                  <button
                    key={member.user_id}
                    type="button"
                    className={`flex flex-col items-center gap-[6px] px-[14px] py-[10px] rounded-[14px] border-2 cursor-pointer transition-all duration-250 relative min-w-[72px] ${
                      assignedTo === member.user_id
                        ? "border-amber-600 bg-gradient-to-br from-amber-50/90 to-amber-100/70 shadow-[0_0_0_3px_rgba(251,191,36,0.15),0_4px_14px_rgba(217,119,6,0.12)] after:content-['✓'] after:absolute after:-top-1.5 after:-right-1.5 after:w-5 after:h-5 after:bg-gradient-to-br after:from-amber-600 after:to-amber-700 after:text-white after:rounded-full after:text-[11px] after:font-bold after:flex after:items-center after:justify-center after:shadow-[0_2px_6px_rgba(217,119,6,0.3)] after:animate-[checkPop_0.25s_cubic-bezier(0.34,1.56,0.64,1)]"
                        : "border-stone-300/45 bg-white/50 hover:border-amber-600/35 hover:bg-amber-50/60 hover:-translate-y-[2px] hover:shadow-[0_4px_14px_rgba(217,119,6,0.1)]"
                    }`}
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
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-[0_2px_8px_rgba(120,113,108,0.12)] transition-transform duration-200"
                    />
                    <span
                      className={`text-[0.72rem] font-semibold text-center whitespace-nowrap ${
                        assignedTo === member.user_id ? "text-amber-800" : "text-stone-600"
                      }`}
                    >
                      {member.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )} */}

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
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="assignee-picker__avatar"
                      />
                    ) : (
                      <div className="assignee-picker__avatar-placeholder">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="assignee-picker__name">{member.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-section-divider" />

          {/* Timeline Phase & Category */}
          <div className="flex gap-4">
            {/* Timeline Phase */}
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px]">
                <Clock size={14} /> Timeline Phase
              </label>
              <div className="flex gap-2 items-center">
                <select
                  className="w-full px-[14px] py-[11px] rounded-[10px] border border-stone-300/60 text-[0.9rem] text-stone-800 outline-none transition-all duration-200 bg-white/70 focus:border-amber-600/40 focus:ring-[3px] focus:ring-amber-400/10 focus:bg-white/95 appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%2212%22_fill=%22%2378716c%22_viewBox=%220_0_16_16%22%3E%3Cpath_d=%22M8_11L3_6h10l-5_5z%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-8"
                  value={timeline_phase_id}
                  onChange={(e) => setTimelinePhaseId(e.target.value)}
                  required
                >
                  <option
                    className="bg-[#fdfbf7] text-stone-800"
                    value=""
                    disabled
                  >
                    Select a phase...
                  </option>
                  {phases.map((p) => (
                    <option
                      className="bg-[#fdfbf7] text-stone-800"
                      key={p.id}
                      value={p.id}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`shrink-0 w-[42px] h-[42px] flex items-center justify-center rounded-[10px] transition-all duration-200 ${
                    showAddPhase
                      ? "bg-amber-700 text-white"
                      : "bg-amber-600/10 border border-amber-600/20 text-amber-600 cursor-pointer hover:bg-amber-600 hover:text-white hover:-translate-y-[1px]"
                  }`}
                  onClick={() => setShowAddPhase(!showAddPhase)}
                >
                  <Plus size={18} />
                </button>
              </div>

              {showAddPhase && (
                <div className="flex flex-col gap-[6px] mt-1 p-[6px] bg-white/60 rounded-[10px] border border-dashed border-amber-600 animate-[slideDown_0.25s_ease-out]">
                  <input
                    className="flex-1 bg-white border border-stone-200 px-[10px] py-[8px] rounded-lg text-[0.85rem] outline-none transition-colors duration-200 focus:border-amber-600"
                    placeholder="Phase Name (e.g., Preparation)"
                    value={newPhaseName}
                    onChange={(e) => setNewPhaseName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 w-full bg-white border border-stone-200 px-[10px] py-[8px] rounded-lg text-[0.85rem] outline-none transition-colors duration-200 focus:border-amber-600"
                      value={newPhaseStart}
                      onChange={(e) => setNewPhaseStart(e.target.value)}
                      title="Start Date"
                      required
                    />
                    <input
                      type="date"
                      className="flex-1 w-full bg-white border border-stone-200 px-[10px] py-[8px] rounded-lg text-[0.85rem] outline-none transition-colors duration-200 focus:border-amber-600"
                      value={newPhaseEnd}
                      onChange={(e) => setNewPhaseEnd(e.target.value)}
                      title="End Date"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreatePhase}
                    className="bg-amber-600 text-white border-none py-[8px] rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 hover:bg-amber-700 text-[0.85rem] font-medium"
                  >
                    <Check size={14} /> Save Phase
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px]">
                <Tag size={14} /> Category
              </label>
              <div className="flex gap-2 items-center">
                <select
                  className="w-full px-[14px] py-[11px] rounded-[10px] border border-stone-300/60 text-[0.9rem] text-stone-800 outline-none transition-all duration-200 bg-white/70 focus:border-amber-600/40 focus:ring-[3px] focus:ring-amber-400/10 focus:bg-white/95 appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%2212%22_fill=%22%2378716c%22_viewBox=%220_0_16_16%22%3E%3Cpath_d=%22M8_11L3_6h10l-5_5z%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-8"
                  value={category_id}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option
                    className="bg-[#fdfbf7] text-stone-800"
                    value=""
                    disabled
                  >
                    Select category...
                  </option>
                  {categories.map((cat) => (
                    <option
                      className="bg-[#fdfbf7] text-stone-800"
                      key={cat.id}
                      value={cat.id}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`shrink-0 w-[42px] h-[42px] flex items-center justify-center rounded-[10px] transition-all duration-200 ${
                    showAddCategory
                      ? "bg-amber-700 text-white"
                      : "bg-amber-600/10 border border-amber-600/20 text-amber-600 cursor-pointer hover:bg-amber-600 hover:text-white hover:-translate-y-[1px]"
                  }`}
                  onClick={() => setShowAddCategory(!showAddCategory)}
                >
                  <Plus size={18} />
                </button>
              </div>
              {showAddCategory && (
                <div className="flex gap-[6px] mt-1 p-[6px] bg-white/60 rounded-[10px] border border-dashed border-amber-600 animate-[slideDown_0.25s_ease-out]">
                  <input
                    className="flex-1 bg-white border border-stone-200 px-[10px] py-[8px] rounded-lg text-[0.85rem] outline-none transition-colors duration-200 focus:border-amber-600"
                    placeholder="New category..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="bg-amber-600 text-white border-none w-[34px] rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-amber-700"
                  >
                    <Check size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px]">
                <Flag size={14} /> Priority
              </label>
              <select
                className="w-full px-[14px] py-[11px] rounded-[10px] border border-stone-300/60 text-[0.9rem] text-stone-800 outline-none transition-all duration-200 bg-white/70 focus:border-amber-600/40 focus:ring-[3px] focus:ring-amber-400/10 focus:bg-white/95 appearance-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%2212%22_fill=%22%2378716c%22_viewBox=%220_0_16_16%22%3E%3Cpath_d=%22M8_11L3_6h10l-5_5z%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-8"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option className="bg-[#fdfbf7] text-stone-800" value="low">
                  Low
                </option>
                <option className="bg-[#fdfbf7] text-stone-800" value="medium">
                  Medium
                </option>
                <option className="bg-[#fdfbf7] text-stone-800" value="high">
                  High
                </option>
                <option className="bg-[#fdfbf7] text-stone-800" value="urgent">
                  Urgent
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px]">
                <Calendar size={14} /> Deadline
              </label>
              <input
                className="w-full px-[14px] py-[11px] rounded-[10px] border border-stone-300/60 text-[0.9rem] text-stone-800 outline-none transition-all duration-200 bg-white/70 placeholder:text-stone-400 focus:border-amber-600/40 focus:ring-[3px] focus:ring-amber-400/10 focus:bg-white/95"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="form-section-divider" />

          {/* Shopping Toggle & Price */}
          <div className="flex flex-col gap-2 flex-1 border border-dashed border-stone-300 rounded-lg p-3 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px] !mb-0 cursor-pointer">
                <ShoppingCart size={14} /> Is this a Shopping Task?
              </label>
              <label className="flex items-center gap-[10px] cursor-pointer py-2 select-none">
                <input
                  type="checkbox"
                  checked={isShopping}
                  onChange={(e) => setIsShopping(e.target.checked)}
                  className="hidden peer"
                />
                <span className="relative w-10 h-[22px] bg-stone-300/60 rounded-xl transition-colors duration-250 shrink-0 peer-checked:bg-gradient-to-br peer-checked:from-amber-600 peer-checked:to-amber-700 before:content-[''] before:absolute before:top-[3px] before:left-[3px] before:w-4 before:h-4 before:bg-white before:rounded-full before:transition-transform before:duration-250 before:shadow-[0_1px_4px_rgba(0,0,0,0.1)] peer-checked:before:translate-x-[18px]"></span>
                <span className="text-[0.85rem] font-medium text-stone-600">
                  {isShopping ? "Yes" : "No"}
                </span>
              </label>
            </div>

            {isShopping && (
              <input
                className="w-full mt-2 px-[14px] py-[11px] rounded-[10px] border border-stone-300/60 text-[0.9rem] text-stone-800 outline-none transition-all duration-200 bg-white/70 placeholder:text-stone-400 focus:border-amber-600/40 focus:ring-[3px] focus:ring-amber-400/10 focus:bg-white/95"
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
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-[0.72rem] font-bold text-stone-500 uppercase tracking-[0.06em] flex items-center gap-[6px]">
              <CheckSquare size={14} /> Subtasks
            </label>
            <div className="flex gap-2">
              <input
                className="w-full px-[14px] py-[11px] rounded-[10px] border border-stone-300/60 text-[0.9rem] text-stone-800 outline-none transition-all duration-200 bg-white/70 placeholder:text-stone-400 focus:border-amber-600/40 focus:ring-[3px] focus:ring-amber-400/10 focus:bg-white/95"
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
                className="p-[11px] rounded-[10px] border border-stone-300/50 bg-stone-100/60 text-stone-500 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-amber-400/10 hover:text-amber-700 hover:border-amber-600/30"
                onClick={addSubtask}
                title="Add Subtask"
              >
                <Plus size={20} />
              </button>
            </div>
            {Object.keys(subTasks).length > 0 && (
              <ul className="list-none p-0 m-0 flex flex-col gap-[6px] mt-2">
                {Object.keys(subTasks).map((key) => (
                  <li
                    key={key}
                    className="flex justify-between items-center px-3 py-[10px] bg-stone-100/60 border border-stone-300/40 rounded-[10px] text-[0.85rem] text-stone-700"
                  >
                    <span>• {key}</span>
                    <button
                      type="button"
                      className="bg-transparent border-none text-stone-400 cursor-pointer p-1 flex items-center rounded-md transition-all duration-200 hover:bg-red-200/30 hover:text-red-600"
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

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-stone-300/35">
            <button
              type="button"
              className="px-[22px] py-[11px] rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-200 bg-transparent border border-stone-300/50 text-stone-500 hover:bg-stone-100/60 hover:text-stone-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-[22px] py-[11px] rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-200 bg-gradient-to-br from-amber-600 to-amber-700 border-none text-white shadow-[0_2px_12px_rgba(217,119,6,0.2)] hover:shadow-[0_4px_20px_rgba(217,119,6,0.35)] hover:-translate-y-[1px]"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
