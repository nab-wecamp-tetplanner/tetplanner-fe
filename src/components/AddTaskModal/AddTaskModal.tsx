import React, { useState } from "react";
import type { SubTask, Task, TaskPriority, TaskStatus } from "../../types/task";
import './AddTaskModal.css';
import { Calendar, CheckSquare, Flag, Plus, ShoppingCart, Tag, Trash2, User, X } from "lucide-react";
import { MOCK_MEMBERS } from "../../data/mockTasks";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TaskStatus;
  onSave: (taskData: Omit<Task, "id" | "created_at" | "is_overdue" | "purchased" | "quantity">) => void;
}


const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, status, onSave }) => {
    
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [isShopping, setIsShopping] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState<number | ''>('');
    const [deadline, setDeadline] = useState('');
    const [categoryId, setCategoryId] = useState('General');
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);
    const [tempSubtask, setTempSubtask] = useState('');
    const [assignedTo, setAssignedTo] = useState<string>('');

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
        category_id: categoryId,
        priority,
        deadline: deadline || undefined, 
        sub_tasks: subTasks,
        status: status || 'pending' as TaskStatus,
        is_shopping: isShopping,
        estimated_price: estimatedPrice || undefined,
        assigned_to: assignedTo || undefined,
        }

        onSave(taskData);

        setTitle('');
        setPriority('medium');
        setCategoryId('General');
        setDeadline('');
        setSubTasks([]);    
        setIsShopping(false);
        setEstimatedPrice('');
        setAssignedTo('');
        onClose();
    };


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

            <div className="form-group">
                <label className="form-label"><User size={14} /> Assigned To</label>
                <div className="assignee-picker">
                    {MOCK_MEMBERS.map(member => (
                        <button
                            key={member.id}
                            type="button"
                            className={`assignee-picker__item ${assignedTo === member.id ? 'assignee-picker__item--active' : ''}`}
                            onClick={() => setAssignedTo(assignedTo === member.id ? '' : member.id)}
                            title={member.name}
                        >
                            <img src={member.avatar} alt={member.name} className="assignee-picker__avatar" />
                            <span className="assignee-picker__name">{member.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Category & Priority */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label"><Tag size={14} /> Category</label>
                    <select 
                    className="form-input"
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {/* Deadline & Shopping */}
            <div className="form-row">
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
                <div className="form-group">
                    <label className="form-label"><ShoppingCart size={14} /> Shopping Item</label>
                    <label className="form-toggle">
                        <input 
                            type="checkbox" 
                            checked={isShopping}
                            onChange={(e) => setIsShopping(e.target.checked)}
                            className="form-toggle__input"
                        />
                        <span className="form-toggle__switch"></span>
                        <span className="form-toggle__text">{isShopping ? 'Yes' : 'No'}</span>
                    </label>
                    {isShopping && (
                        <input
                            className="form-input"
                            type="number"
                            value={estimatedPrice}
                            onChange={(e) => setEstimatedPrice(e.target.value ? Number(e.target.value) : '')}
                            placeholder="Estimated price"
                            min={0}
                        />
                    )}
                </div>
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

            <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-submit" >Add Task</button>
            </div>
        </form>
        </div>
    </div>
    ) 
}

export default AddTaskModal
