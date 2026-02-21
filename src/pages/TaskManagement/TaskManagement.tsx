/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react'
import type { TetConfig, Task, TaskStatus} from '../../types/task'
import { todoService } from '../../services/todoService';
import { MOCK_CONFIGS, MOCK_MEMBERS, TIMELINE_PHASES, MOCK_INITIAL_TASKS } from '../../data/mockTasks';
import './TaskManagement.css'
import { LayoutGrid, Plus, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import TaskColumn from '../../components/TaskColumn/TaskColumn';
import AddTaskModal from '../../components/AddTaskModal/AddTaskModal';
import TaskDetailModal from '../../components/TaskDetailModal/TaskDetailModal';
import CelebrationParticles from '../../components/CelebrationParticles/CelebrationParticles';
import { Lantern, BlossomBranch, CloudMotif, TraditionalCake, MysticKnot } from '../../components/Decoratives/Decoratives';
import { LuckyEnvelope, RewardModal } from '../../components/Gamification/Gamification';
import FallingPetals from '../../components/FallingPetals/FallingPetals';

/* ===== Decorative SVG Background Pattern ===== */
const BACKGROUND_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d6cfc4' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

const TaskManagement: React.FC = () => {

    const [configs] = React.useState<TetConfig[]>(MOCK_CONFIGS);
    const [activeConfigId, setActiveConfigId] = useState<string>(MOCK_CONFIGS[0].id);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeColumn, setActiveColumn] = React.useState<TaskStatus>('pending');
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [celebration, setCelebration] = React.useState<{ x: number; y: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [todoItems, setTodoItems] = useState<Task[]>(MOCK_INITIAL_TASKS);
    const [activePhaseId, setActivePhaseId] = useState<string>(TIMELINE_PHASES[0].id);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isRewardOpen, setIsRewardOpen] = useState(false);
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


    const handleCelebrate = (x: number, y: number) => {
        setCelebration(null);

        setTimeout(() => {
            setCelebration({ x, y });
        }, 10);

        setTimeout(() => {
            setCelebration(null);
        }, 2000);

    };

    const currentTasks = todoItems;

    const columns: { id: TaskStatus; label: string} [] = [
        { id: 'pending', label: 'To Do' },
        { id: 'in_progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    const handleDeleteTask = async(taskId: string) => {
        const targetTask = todoItems.find(t => t.id === taskId);
        if (!targetTask) return;

        const isHardDelete = targetTask.status === 'cancelled';
        if (isHardDelete) {
            const confirmDelete = window.confirm('Are you sure you want to delete this cancelled task? This action cannot be undone.');
            if (!confirmDelete) return;
        } 
        const backupTasks = [...todoItems];
        if (isHardDelete) {
            setTodoItems(prev => prev.filter(t => t.id !== taskId));
        } else {
            setTodoItems(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: 'cancelled' as TaskStatus } : t
            ));
        }
        if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(null);
        }

        // API call to update status or delete
        try {
            if (isHardDelete) {
                await todoService.deleteTodoItem(taskId);
            } else {
                await todoService.updateTodoItemStatus(taskId, 'cancelled' as TaskStatus);
            }
        } catch (error) {
            console.error("Error updating task status:", error);
            setTodoItems(backupTasks); 
            alert("Failed to update task. Please try again.");
        }
    };

    // const handleMoveTask = async(taskId: string, newStatus: TaskStatus) => {
    //     const backupTasks = [...todoItems];
        
    //     setTodoItems(prev => prev.map(task =>
    //         task.id === taskId ? { ...task, status: newStatus } : task
    //     ));

    //     // API call to update status
    //     try {
    //         await todoService.updateTodoItemStatus(taskId, newStatus);
    //     } catch (error) {
    //         console.error("Error updating task status:", error);
    //         setTodoItems(backupTasks); 
    //         alert("Failed to move task. Please try again.");
    //     }
    // }

    //MOCK
    const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
        setTodoItems(prev => prev.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
        if (newStatus === 'completed') {
            handleCelebrate(window.innerWidth / 2, window.innerHeight / 2);
        }
    }
    // const handleAddTask = async(taskData: Omit<Task, "id" | "created_at" | "is_overdue" | "purchased" | "quantity">) => {
    //     // API call to create new task
    //     let newTask: Task;
    //     try {
    //         const response = await todoService.addTodoItem({
    //             ...taskData,
    //             tet_config_id: activeConfigId,
    //             timeline_phase_id: activePhaseId,
    //         });
    //         newTask = (response as { data: Task }).data;
    //     } catch (error) {
    //         console.error("Error creating task:", error);
    //         alert("Failed to create task. Please try again.");
    //         return;
    //     }

    //     setTodoItems(prev => [...prev, newTask]);
    //     setIsModalOpen(false);
    // }
    //MOCK
    const handleAddTask = (taskData: any) => {
        const newTask: Task = {
            id: `mock-task-${Date.now()}`, 
            title: taskData.title,
            priority: taskData.priority,
            status: activeColumn as any,
            deadline: taskData.deadline,
            is_shopping: taskData.is_shopping,
            estimated_price: taskData.estimated_price,
            quantity: taskData.quantity,
            assigned_to: taskData.assigned_to, 
            created_at: new Date().toISOString(),
            is_overdue: false,
            purchased: false,
        };

        // Update UI only, no API call
        setTodoItems(prev => [...prev, newTask]);
        setIsModalOpen(false);
    };

    const handleOpenModal = (columnId: TaskStatus) => {
        setActiveColumn(columnId);
        setIsModalOpen(true);
    }

    const handleOpenTaskDetail = (task: Task) => {
        setSelectedTask(task);
    }

    const handleUpdateTask = (updatedTask: Task) => {
        // API call to update task details
        todoService.updateTodoItem(updatedTask.id, updatedTask)
            .then(() => {
                setTodoItems(prev => prev.map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                ));
                setSelectedTask(updatedTask); 
            })
            .catch((error) => {
                console.error("Error updating task:", error);
                alert("Failed to update task. Please try again.");
            });
    }

    /* ===== Progress & Gamification Logic ===== */
    const progress = useMemo(() => {
        const total = currentTasks.length;
        if (total === 0) return { percent: 0, completed: 0, total: 0, allDone: false };
        const completed = currentTasks.filter(t => t.status === 'completed').length;
        return {
            percent: Math.round((completed / total) * 100),
            completed,
            total,
            allDone: completed === total && total > 0,
        };
    }, [currentTasks]);

  return (
    <div className="tet-page">
        {/* Background Pattern & Warm Overlay */}
        <div className="tet-bg-pattern" style={{ backgroundImage: BACKGROUND_PATTERN }}></div>
        <div className="tet-bg-warm-gradient"></div>

        {/* Decorative Elements */}
        <FallingPetals count={20} />
        <Lantern className="tet-deco--top-left" size="lg" />
        <Lantern className="tet-deco--top-right" size="md" />
        <BlossomBranch className="tet-deco--branch-left" variant="apricot" />
        <BlossomBranch className="tet-deco--branch-right" variant="apricot" />
        <BlossomBranch className="tet-deco--branch-center-1" variant="apricot" />
        <BlossomBranch className="tet-deco--branch-center-2" variant="peach" />
        <BlossomBranch className="tet-deco--branch-center-3" variant="apricot" />
        <BlossomBranch className="tet-deco--branch-bottom-left" variant="peach" />
        <BlossomBranch className="tet-deco--branch-bottom-right" variant="apricot" />
        <CloudMotif className="tet-deco--cloud-1" />
        <CloudMotif className="tet-deco--cloud-2" />
        <TraditionalCake className="tet-deco--cake" variant="chung" />

        <header className="tet-page-header">
                <div className="tet-header-row">
                    <div className="tet-header-left"> 
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

                    <div className="tet-collaborators">
                            <div className="tet-collaborators__avatars">
                                {MOCK_MEMBERS.map((member, index) => (
                                    <img 
                                        key={member.id} 
                                        src={member.avatar} 
                                        alt={member.name} 
                                        title={member.name}
                                        className="tet-collaborators__avatar"
                                        style={{ zIndex: MOCK_MEMBERS.length - index }}
                                    />
                                ))}
                                <button className="tet-collaborators__add" title="Add Member">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <span className="tet-collaborators__label">Collaborators</span>
                        </div>

                    <div className="tet-header-right">
                        <div className="tet-search-box">
                            <Search size={15} className="tet-search-icon" />
                            <input type="text" placeholder="Search..." className="tet-search-input" />
                        </div>
                        
                        <div className="tet-view-options">
                            <button className="tet-view-btn active"><LayoutGrid size={15} /> Board</button>
                        </div>

                        {/* Filter by Timeline */}
                        <div className="tet-filter-wrapper">
                            <button 
                                className={`tet-ghost-btn ${isFilterOpen ? 'tet-ghost-btn--active' : ''}`}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <SlidersHorizontal size={15} /> 
                                {TIMELINE_PHASES.find(p => p.id === activePhaseId)?.name || 'Filter'}
                            </button>

                            {/* Filter Dropdown Menu */}
                            {isFilterOpen && (
                                <div className="tet-filter-dropdown">
                                    <div className="tet-filter-dropdown__title">
                                        Filter by Timeline Phase
                                    </div>
                                    {TIMELINE_PHASES.map(phase => (
                                        <div
                                            key={phase.id}
                                            className={`tet-filter-dropdown__item ${activePhaseId === phase.id ? 'tet-filter-dropdown__item--active' : ''}`}
                                            onClick={() => {
                                                setActivePhaseId(phase.id);
                                                setIsFilterOpen(false); 
                                            }}
                                        >
                                            {phase.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="tet-ghost-btn"><ArrowUpDown size={15} /> Sort</button>
                        
                        <button className="tet-primary-btn" onClick={() => { setActiveColumn('pending'); setIsModalOpen(true); }}>
                            <Plus size={16} /> Add Task
                        </button>
                    </div>
                </div>
            </header>

        {/* ===== Progress Bar ===== */}
        <div className="tet-progress-section">
            <MysticKnot width={140} />
            <div className="tet-progress">
                <div className="tet-progress__header">
                    <span className="tet-progress__label">
                        Preparation Progress
                    </span>
                    <span className="tet-progress__stats">
                        {progress.completed}/{progress.total} tasks · {progress.percent}%
                    </span>
                </div>
                <div className="tet-progress__bar">
                    <div
                        className="tet-progress__fill"
                        style={{ width: `${progress.percent}%` }}
                    />
                </div>
            </div>
            <MysticKnot width={140} />
        </div>

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

        {/* Lucky Envelope — appears when all tasks are completed */}
        <LuckyEnvelope
            show={progress.allDone}
            onOpen={() => setIsRewardOpen(true)}
        />

        {/* Reward Modal */}
        <RewardModal
            isOpen={isRewardOpen}
            onClose={() => setIsRewardOpen(false)}
            totalTasks={progress.total}
        />
    </div>
    )
}

export default TaskManagement
