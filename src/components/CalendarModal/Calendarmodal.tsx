import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAppStore } from "../../stores/useAppStore";
import type { CategoryResponse } from "../../types/categories.type";
import type { TaskCreateRequest } from "../../types/todo.types";
import type { FlattenedTodo } from "../../pages/Calendar/Calendar";
import type { Timeline } from "../../types/timeline.types";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  is_new: boolean; // Thêm prop xác định trạng thái Create/Edit
  editingTask: FlattenedTodo | null;
  selectedDate: Date | null;
  phases: Timeline[];
  categories: CategoryResponse[];
  onUpdateTask: (id: string, updatedTask: any) => Promise<void>;
  onCreateTask: (newTask: TaskCreateRequest) => Promise<void>;
}

export default function CalendarModal({
  isOpen,
  onClose,
  is_new,
  editingTask,
  selectedDate,
  phases,
  categories,
  onUpdateTask,
  onCreateTask,
}: CalendarModalProps) {
  const configId = useAppStore((state) => state.configId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShopping, setIsShopping] = useState(false);
  const [newSubtask, setNewSubtask] = useState<string>("");
  const [subtasks, setSubtasks] = useState<Record<string, boolean>>({});

  // Khởi tạo state dựa vào is_new
  useEffect(() => {
    if (isOpen) {
      if (is_new) {
        // Form tạo mới: Reset toàn bộ
        setIsShopping(false);
        setSubtasks({});
      } else {
        // Form chỉnh sửa: Lấy data từ editingTask
        setIsShopping(editingTask?.is_shopping || false);
        setSubtasks(editingTask?.subtasks ?? {});
      }
      setNewSubtask("");
    }
  }, [isOpen, is_new, editingTask]);

  if (!isOpen) return null;

  const addSubtask = () => {
    const trimmedTitle = newSubtask.trim();
    if (!trimmedTitle) return;

    setSubtasks((prev) => ({
      ...prev,
      [trimmedTitle]: false,
    }));
    setNewSubtask("");
  };

  const removeSubtask = (titleToRemove: string) => {
    setSubtasks((prev) => {
      const next = { ...prev };
      delete next[titleToRemove];
      return next;
    });
  };

  const toggleSubtask = (titleToToggle: string) => {
    setSubtasks((prev) => ({
      ...prev,
      [titleToToggle]: !prev[titleToToggle],
    }));
  };

  const handleSaveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const categoryId = formData.get("category_id");
      if (!categoryId) {
        toast.error("Please select a category.");
        setIsSubmitting(false);
        return;
      }

      const taskPayload: any = {
        title: formData.get("title") as string,
        priority: formData.get("priority") as any,
        status: formData.get("status") as any,
        deadline: new Date(formData.get("deadline") as string).toISOString(),
        timeline_phase_id: formData.get("timeline_phase_id") as string,
        category_id: categoryId.toString(),
        quantity: Number(formData.get("quantity")) || 1, 
        is_shopping: isShopping,
      };

      if (is_new) {
        taskPayload.tet_config_id = configId;
      }

      if (Object.keys(subtasks).length > 0) {
        taskPayload.subtasks = subtasks;
      }

      if (isShopping) {
        taskPayload.estimated_price =
          Number(formData.get("estimated_price")) || 0;
      }

      // Xử lý API dựa vào is_new
      if (is_new) {
        await onCreateTask(taskPayload as TaskCreateRequest);
      } else if (editingTask) {
        await onUpdateTask(editingTask.id, taskPayload);
      }

      onClose();
    } catch (error) {
      console.error("Submit failed", error);
      toast.error("Error saving task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      {" "}
      <form
        onSubmit={handleSaveTask}
        className="bg-card p-6 rounded-2xl w-full max-w-md border border-border  max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-card z-10 py-2">
          <h3 className="text-xl font-bold text-foreground">
            {is_new ? "Create New Task" : "Update Task"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
              Title
            </label>
            <input
              name="title"
              defaultValue={!is_new ? editingTask?.title : ""}
              required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-planner-blue outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                Deadline
              </label>
              <input
                name="deadline"
                type="date"
                defaultValue={
                  !is_new && editingTask?.deadline
                    ? format(new Date(editingTask.deadline), "yyyy-MM-dd")
                    : format(selectedDate ?? Date.now(), "yyyy-MM-dd")
                }
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
              />
            </div>
            {/* Priority */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                Priority
              </label>
              <select
                name="priority"
                defaultValue={!is_new ? editingTask?.priority : "medium"}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Phase Selection */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
              Timeline Phase
            </label>
            <select
              name="timeline_phase_id"
              defaultValue={
                !is_new ? editingTask?.timeline_phase?.id : phases[0]?.id
              }
              required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
              Category
            </label>
            <select
              name="category_id"
              defaultValue={
                !is_new ? editingTask?.category?.id : categories[0]?.id
              }
              required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {categories.map((cate) => (
                <option key={cate.id} value={cate.id}>
                  {cate.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shopping Toggle & Price */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-xl border border-dashed border-border">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_shopping"
                name="is_shopping"
                checked={isShopping}
                onChange={(e) => setIsShopping(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-planner-blue focus:ring-planner-blue"
              />
              <label
                htmlFor="is_shopping"
                className="text-sm font-semibold text-foreground cursor-pointer"
              >
                Is this a Shopping Task?
              </label>
            </div>

            {isShopping && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Estimated Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    name="estimated_price"
                    type="number"
                    defaultValue={!is_new ? editingTask?.estimated_price : ""}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-planner-blue outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a subtask..."
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-planner-blue"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-bold"
              >
                Add
              </button>
            </div>

            {/* Danh sách Subtasks */}
            <div className="space-y-2">
              {Object.entries(subtasks).map(([title, isCompleted], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md border border-border"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleSubtask(title)}
                      className="shrink-0 w-4 h-4 rounded border-gray-300 text-planner-blue cursor-pointer"
                    />
                    <span
                      className={`text-sm truncate ${
                        isCompleted
                          ? "line-through text-muted-foreground opacity-70"
                          : "text-foreground"
                      }`}
                      title={title}
                    >
                      {title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSubtask(title)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors ml-2 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Status & Quantity */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={!is_new ? editingTask?.status : "pending"}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Quantity
                </label>
                <input
                  name="quantity"
                  defaultValue={!is_new ? editingTask?.quantity : 1}
                  type="number"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-planner-blue outline-none"
                />
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-planner-blue hover:bg-blue-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : !is_new
                  ? "Save Changes"
                  : "Create Task"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
