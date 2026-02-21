import React, { useState } from 'react'
import type { Plan, Task, TaskStatus} from '../../types/task'
import { MOCK_PLANS } from '../../data/mockTasks';
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

    const [plans, setPlans] = React.useState<Plan[]>(MOCK_PLANS);
    const [activePlanId, setActivePlanId] = useState<string>(MOCK_PLANS[0].id);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeColumn, setActiveColumn] = React.useState<TaskStatus>('todo');
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [celebration, setCelebration] = React.useState<{ x: number; y: number } | null>(null);

    const handleCelebrate = (x: number, y: number) => {
        setCelebration(null);

        setTimeout(() => {
            setCelebration({ x, y });
        }, 10);

        setTimeout(() => {
            setCelebration(null);
        }, 2000);

    };

    const activePlan = plans.find(p => p.id === activePlanId);
    const currentTasks = activePlan ? activePlan.tasks : [];

    const columns: { id: TaskStatus; label: string} [] = [
        { id: 'todo', label: 'To Do' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'done', label: 'Done' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    const handleDeleteTask = (taskId: string) => {
    setPlans(prevPlans => prevPlans.map(plan => {
            if (plan.id !== activePlanId) return plan; // Bỏ qua nếu không phải Plan đang mở

            const targetTask = plan.tasks.find(t => t.id === taskId);
            if (!targetTask) return plan;

            let updatedTasks;
            if (targetTask.status === 'cancelled') {
                // Xóa vĩnh viễn khỏi Plan
                const confirmDelete = window.confirm('Bạn có chắc muốn xóa công việc đã hủy? Hành động này không thể hoàn tác.');
                if (!confirmDelete) return plan;
                updatedTasks = plan.tasks.filter(t => t.id !== taskId);
            } else {
                // Soft delete (Chuyển thành cancelled)
                updatedTasks = plan.tasks.map(t =>
                    t.id === taskId ? { ...t, status: 'cancelled' as TaskStatus } : t
                );
            }
            return { ...plan, tasks: updatedTasks };
        }));
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(null);
        }
    };

    const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
        setPlans(prevPlans => prevPlans.map(plan => {
            if (plan.id !== activePlanId) return plan;
            return {
                ...plan,
                tasks: plan.tasks.map(task => 
                    task.id === taskId ? { ...task, status: newStatus } : task
                )
            };
        }));
    }

    const handleAddTask = (taskData: Omit<Task, "id" | "progressColor" | "dateColor" | "avatars">) => {
        const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title,
        status: activeColumn,
        priority: taskData.priority,
        category: taskData.category,
        project: taskData.project,
        dueDate: taskData.dueDate,
        commentsCount: taskData.commentsCount,
        attachmentsCount: taskData.attachmentsCount,
        subTasks: taskData.subTasks,
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=" + Date.now()]
        }
        setPlans(prevPlans => prevPlans.map(plan => {
            if (plan.id === activePlanId) {
                return { ...plan, tasks: [...plan.tasks, newTask] }; // Nhét task vào đúng Plan
            }
            return plan;
        }));
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
        setPlans(prevPlans => prevPlans.map(plan => {
            if (plan.id === activePlanId) {
                return {
                    ...plan,
                    tasks: plan.tasks.map(task => task.id === updatedTask.id ? updatedTask : task)
                };
            }
            return plan;
        }));
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

        <header className="tet-page-header">
            <div className="tet-header-left"> 
                    <div className="plan-selector">
                        <select
                            value={activePlanId}
                            onChange={(e) => setActivePlanId(e.target.value)}
                            className="plan-dropdown-select"
                        >
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.title}
                                </option>
                            ))}
                        </select>
                        {activePlan && (
                            <span className="plan-description" style={{ fontSize: '13px', color: '#d97706', fontWeight: 500 }}>
                                {activePlan.description}
                            </span>
                        )}
                    </div>
                <span className="tet-badge">{currentTasks.length} công việc</span>
            </div>

            <div className="tet-header-right">
                <div className="tet-search-box">
                    <Search size={15} className="tet-search-icon" />
                    <input type="text" placeholder="Tìm kiếm..." className="tet-search-input" />
                </div>
                <div className="tet-view-options">
                    <button className="tet-view-btn active"><LayoutGrid size={15} /> Bảng</button>
                </div>
                <button className="tet-ghost-btn"><SlidersHorizontal size={15} /> Lọc</button>
                <button className="tet-ghost-btn"><ArrowUpDown size={15} /> Sắp xếp</button>
                <button className="tet-primary-btn"><Plus size={16} /> Thêm mới</button>
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
