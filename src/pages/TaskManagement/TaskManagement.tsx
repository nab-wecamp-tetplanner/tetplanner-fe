/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import type { TetConfig, Task, TaskStatus} from '../../types/task'
import { todoService } from '../../services/todoService';
import { MOCK_CONFIGS, TIMELINE_PHASES } from '../../data/mockTasks';
import './TaskManagement.css'
import { LayoutGrid, Plus, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import TaskColumn from '../../components/TaskColumn/TaskColumn';
import AddTaskModal from '../../components/AddTaskModal/AddTaskModal';
import TaskDetailModal from '../../components/TaskDetailModal/TaskDetailModal';
import CelebrationParticles from '../../components/CelebrationParticles/CelebrationParticles';

/* ===== Decorative SVG Background Pattern ===== */
const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d6cfc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* ===== Decorative Lantern Component ===== */
const Lantern: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ className = '', size = 'md' }) => {
    const sizeMap = { sm: { w: 20, h: 32 }, md: { w: 28, h: 44 }, lg: { w: 36, h: 56 } };
    const s = sizeMap[size];
    return (
        <div className={`tet-lantern tet-lantern--${size} ${className}`}>
            <svg width={s.w} height={s.h} viewBox="0 0 28 44" fill="none">
                <rect x="11" y="0" width="6" height="6" rx="1" fill="#b45309" />
                <line x1="14" y1="6" x2="14" y2="10" stroke="#92400e" strokeWidth="1.5" />
                <ellipse cx="14" cy="26" rx="13" ry="16" fill="#dc2626" />
                <ellipse cx="14" cy="26" rx="10" ry="13" fill="#ef4444" opacity="0.7" />
                <ellipse cx="14" cy="26" rx="5" ry="8" fill="#fbbf24" opacity="0.4" />
                <rect x="10" y="42" width="8" height="2" rx="1" fill="#b45309" />
            </svg>
        </div>
    );
};

/* ===== Decorative Blossom Component ===== */
const Blossom: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`tet-blossom ${className}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                    key={angle}
                    cx="10" cy="4" rx="3" ry="5"
                    fill="#f9a8d4"
                    opacity="0.7"
                    transform={`rotate(${angle} 10 10)`}
                />
            ))}
            <circle cx="10" cy="10" r="2.5" fill="#fbbf24" />
        </svg>
    </div>
);

const TaskManagement: React.FC = () => {

    const [configs, setConfigs] = React.useState<TetConfig[]>(MOCK_CONFIGS);
    const [activeConfigId, setActiveConfigId] = useState<string>(MOCK_CONFIGS[0].id);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeColumn, setActiveColumn] = React.useState<TaskStatus>('PENDING');
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [celebration, setCelebration] = React.useState<{ x: number; y: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [todoItems, setTodoItems] = useState<Task[]>([]);
    const [activePhaseId, setActivePhaseId] = useState<string>(TIMELINE_PHASES[0].id);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    useEffect(() => {
        const fetchTasks = async () => {
            if (!activeConfigId || !activePhaseId) return;
            
            try {
                setIsLoading(true);
                // GET /todo-items?tet_config_id=...&timeline_phase_id=...
                const response: any = await todoService.getTodoItems(activeConfigId, activePhaseId);
                setTodoItems(response.data || []); 
            } catch (error) {
                console.error("Error loading Tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [activeConfigId, activePhaseId]);


    const updateTasks = (updateFn: (tasks: Task[]) => Task[]) => {
        setTodoItems(prevTasks => updateFn(prevTasks));
    };

    const handleCelebrate = (x: number, y: number) => {
        setCelebration(null);

        setTimeout(() => {
            setCelebration({ x, y });
        }, 10);

        setTimeout(() => {
            setCelebration(null);
        }, 2000);

    };

    const activeConfig = configs.find(p => p.id === activeConfigId);
    const currentTasks = todoItems;

    const columns: { id: TaskStatus; label: string} [] = [
        { id: 'PENDING', label: 'To Do' },
        { id: 'IN_PROGRESS', label: 'In Progress' },
        { id: 'DONE', label: 'Done' },
        { id: 'CANCELLED', label: 'Cancelled' },
    ];

    const handleDeleteTask = (taskId: string) => {
        const targetTask = todoItems.find(t => t.id === taskId);
        if (!targetTask) return;

        if (targetTask.status === 'CANCELLED') {
            // Permanently delete
            const confirmDelete = window.confirm('Are you sure you want to delete this cancelled task? This action cannot be undone.');
            if (!confirmDelete) return;
            setTodoItems(prev => prev.filter(t => t.id !== taskId));
        } else {
            // Soft delete (Move to cancelled)
            setTodoItems(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: 'CANCELLED' as TaskStatus } : t
            ));
        }
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(null);
        }
    };

    const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
        setTodoItems(prev => prev.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    }

    const handleAddTask = (taskData: Omit<Task, "id" | "created_at" | "is_overdue" | "purchased" | "quantity">) => {
        const newTask: Task = {
            id: Date.now().toString(),
            title: taskData.title,
            status: activeColumn,
            priority: taskData.priority,
            deadline: taskData.deadline,
            is_overdue: false,
            is_shopping: taskData.is_shopping || false,
            quantity: 1,
            purchased: false,
            created_at: new Date().toISOString(),
            category_id: taskData.category_id,
            sub_tasks: taskData.sub_tasks,
            tet_config_id: activeConfigId,
            timeline_phase_id: activePhaseId,
        }
        setTodoItems(prev => [...prev, newTask]);
        setIsModalOpen(false);
    }

    const handleOpenModal = (columnId: TaskStatus) => {
        setActiveColumn(columnId);
        setIsModalOpen(true);
    }

    const handleOpenTaskDetail = (task: Task) => {
        setSelectedTask(task);
    }

    const handleUpdateTask = (updatedTask: Task) => {
        setTodoItems(prev => prev.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        ));
        setSelectedTask(updatedTask); 
    }

  return (
    <div className="tet-page">
        {/* Background Pattern & Warm Overlay */}
        <div className="tet-bg-pattern" style={{ backgroundImage: BACKGROUND_PATTERN }}></div>
        <div className="tet-bg-warm-gradient"></div>

        {/* Decorative Elements */}
        <Lantern className="tet-deco-lantern--left" size="lg" />
        <Lantern className="tet-deco-lantern--right" size="md" />
        <Blossom className="tet-deco-blossom--tl" />
        <Blossom className="tet-deco-blossom--tr" />
        <Blossom className="tet-deco-blossom--bl" />

<header className="tet-page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div className="tet-header-left"> 
                        {/* 1. CHỌN PLAN (TET CONFIG) */}
                        <div className="plan-selector">
                            <select
                                value={activeConfigId}
                                onChange={(e) => setActiveConfigId(e.target.value)}
                                className="plan-dropdown-select"
                            >
                                {configs.map((config) => (
                                    <option key={config.id} value={config.id}>{config.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="tet-header-right">
                        <div className="tet-search-box">
                            <Search size={15} className="tet-search-icon" />
                            <input type="text" placeholder="Search..." className="tet-search-input" />
                        </div>
                        
                        <div className="tet-view-options">
                            <button className="tet-view-btn active"><LayoutGrid size={15} /> Board</button>
                        </div>

                        {/* 2. NÚT LỌC (FILTER) THEO TIMELINE */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                className={`tet-ghost-btn ${isFilterOpen ? 'active' : ''}`}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                style={{ 
                                    backgroundColor: isFilterOpen ? '#fee2e2' : 'transparent',
                                    color: isFilterOpen ? '#dc2626' : 'inherit'
                                }}
                            >
                                <SlidersHorizontal size={15} /> 
                                {TIMELINE_PHASES.find(p => p.id === activePhaseId)?.name || 'Lọc'}
                            </button>

                            {/* Menu Dropdown hiển thị khi bấm nút Lọc */}
                            {isFilterOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '110%',
                                    right: 0,
                                    backgroundColor: '#fff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    zIndex: 100,
                                    minWidth: '150px',
                                    border: '1px solid #f3f4f6'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#6b7280', padding: '4px 8px', marginBottom: '4px', fontWeight: 600 }}>
                                        CHỌN MỐC THỜI GIAN
                                    </div>
                                    {TIMELINE_PHASES.map(phase => (
                                        <div
                                            key={phase.id}
                                            onClick={() => {
                                                setActivePhaseId(phase.id);
                                                setIsFilterOpen(false); // Chọn xong tự đóng menu
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                borderRadius: '6px',
                                                backgroundColor: activePhaseId === phase.id ? '#fef2f2' : 'transparent',
                                                color: activePhaseId === phase.id ? '#dc2626' : '#374151',
                                                fontWeight: activePhaseId === phase.id ? 600 : 400,
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = activePhaseId === phase.id ? '#fef2f2' : '#f3f4f6'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activePhaseId === phase.id ? '#fef2f2' : 'transparent'}
                                        >
                                            {phase.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="tet-ghost-btn"><ArrowUpDown size={15} /> Sort</button>
                        
                        <button className="tet-primary-btn" onClick={() => { setActiveColumn('PENDING'); setIsModalOpen(true); }}>
                            <Plus size={16} /> Add Task
                        </button>
                    </div>
                </div>
            </header>

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
                />
            ))}
        </div>

        <AddTaskModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            status={activeColumn}
            onSave={handleAddTask}
        />

        <TaskDetailModal 
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdateTask={handleUpdateTask}
        />

        {/* Celebration particles when task dropped in Done */}
        {celebration && (
            <CelebrationParticles
                x={celebration.x}
                y={celebration.y}
                onComplete={() => setCelebration(null)}
            />
        )}
    </div>
    )
}

export default TaskManagement
