import React, { useState } from "react";
import type { SubTask, Task, TaskPriority, TaskStatus } from "../../types/task";
import './AddTaskModal.css';
import { Calendar, CheckSquare, Flag, Plus, Tag, Trash2, X } from "lucide-react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TaskStatus;
  onSave: (taskData: Omit<Task, "id" | "progressColor" | "dateColor" | "avatars">) => void;
}


const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, status, onSave }) => {
    
    const [title, setTitle] = useState("");
    const [project, setProject] = useState("");
    const [category, setCategory] = useState("Design");
    const [priority, setPriority] = useState<TaskPriority>("Medium");
    const [deadline, setDeadline] = useState("");
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);
    const [tempSubtask, setTempSubtask] = useState("");

    if(!isOpen) return null;

    const addSubtask = () => {
        const trimmedSubtask = tempSubtask.trim();
        if(trimmedSubtask) {
            setSubTasks([...subTasks, { id: Date.now().toString(), text: trimmedSubtask, isCompleted: false }]);
            setTempSubtask("");
        }
    };

    const removeSubtask = (id: string) => {
        setSubTasks(subTasks.filter(st => st.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(!title.trim()) {
            alert("Task title cannot be empty.");
            return;
        }

        const taskData = {
        title,
        project: project.trim() || 'General',
        category,
        priority,
        dueDate: deadline || 'No Deadline', 
        subTasks,
        status: status || 'todo',
        commentsCount: 0,
        attachmentsCount: 0,
        }

        onSave(taskData);

        setTitle('');
        setPriority('Medium');
        setCategory('General');
        setProject('');
        setDeadline('');
        setSubTasks([]);    
        onClose();
    };


    const addTask = () => {
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }

  return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3 className="modal-title">
                    Add New Task
                    <span style={{ fontSize: '0.8em', color: '#6b7280' }}></span>
                </h3>
                <button className="close-button" onClick={onClose}><X size={20}></X></button>
            </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input 
              className="form-input"
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Design homepage"
              autoFocus
            />
          </div>

            {/* Project Name */}
            <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                className="form-input"
                type="text" 
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="E.g. Dribbble Marketing"
                />
            </div>

            {/* Category & Priority */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label"><Tag size={14} /> Category</label>
                    <select 
                    className="form-input"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    >
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Development">Development</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label"><Flag size={14} /> Priority</label>
                    <select 
                    className="form-input"
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    </select>
                </div>
            </div>

            {/* Deadline */}
            <div className="form-group">
                <label className="form-label"><Calendar size={14} /> Deadline</label>
                <input 
                className="form-input"
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="mm/dd/yyyy"
                />
            </div>

            {/* Subtasks */}
            <div className="form-group">
                <label className="form-label"><CheckSquare size={14} /> Subtasks</label>
                <div className="subtask-input-group">
                    <input 
                        className="form-input"
                        type="text"
                        value={tempSubtask}
                        onChange={(e) => setTempSubtask(e.target.value)}
                        placeholder="Add a subtask..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                    />
                    <button type="button" className="btn-add-subtask" onClick={addSubtask} title="Add Subtask">
                        <Plus size={20} />
                    </button>
                </div>
                {/* Subtasks List */}
                {subTasks.length > 0 && (
                    <ul className="subtask-list">
                        {subTasks.map(st => (
                            <li key={st.id} className="subtask-item">
                                <span>• {st.text}</span>
                                <button type="button" className="btn-remove-subtask" onClick={() => removeSubtask(st.id)} title="Remove">
                                    <Trash2 size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </form>

            <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-submit" onClick={addTask}>Add Task</button>
            </div>
        </div>
    </div>  
    )
}
export default AddTaskModal
