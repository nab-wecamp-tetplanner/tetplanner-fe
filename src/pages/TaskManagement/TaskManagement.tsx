import React from 'react'
import type { Task, TaskStatus} from '../../types/task'
import { MOCK_TASKS } from '../../data/mockTasks'
import './TaskManagement.css'
import { LayoutGrid, Plus, MoreHorizontal } from 'lucide-react';
import TaskColumn from '../../components/TaskColumn/TaskColumn';
import AddTaskModal from '../../components/AddTaskModal/AddTaskModal';

const TaskManagement: React.FC = () => {

    console.log('Mock tasks:', MOCK_TASKS);
    
    const [tasks, setTasks] = React.useState<Task[]>(MOCK_TASKS);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeColumn, setActiveColumn] = React.useState<TaskStatus>('todo');

    const columns: { id: TaskStatus; label: string} [] = [
        { id: 'todo', label: 'To Do' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'done', label: 'Done' },
    ];

    const handleDeleteTask = (taskId: string) => {
        if(window.confirm('Are you sure you want to delete this task?')) {
            console.log(`Deleting task with id: ${taskId}`);
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        }
    }

    const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );
    }

    const handleAddTask = (taskData: Omit<Task, "id" | "progressColor" | "dateColor" | "avatars">) => {
        const newTask: Task = {
        id: Date.now().toString(), // Tạo ID ngẫu nhiên
        title: taskData.title,
        status: activeColumn,      // Status lấy từ cột đang active
        priority: taskData.priority,
        category: taskData.category,
        project: taskData.project,
        dueDate: taskData.dueDate,
        commentsCount: taskData.commentsCount,
        attachmentsCount: taskData.attachmentsCount,
        avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=" + Date.now()] // Random avatar
        }
        setTasks((prevTasks) => [...prevTasks, newTask]);
        console.log('Added new task:', newTask);
    }

    const handleOpenModal = (columnId: TaskStatus) => {
        setActiveColumn(columnId);
        setIsModalOpen(true);
    }

  return (
    <div className="task-page">
        <header className="task-page-header">
            <div className="header-left">
                <h1>Projects</h1>
                <button className='icon-btn-circle'></button>
            </div>

            <div className="header-right">
                <div className="view-options">
                    <button className="view-btn active"><LayoutGrid size={16} /> Board view</button>
                    <button className="view-btn"><Plus size={16} /> Add view</button>
                </div>
            <button className="text-btn">Filter</button>
            <button className="text-btn">Sort</button>
            <button className="icon-btn-border"><MoreHorizontal size={18} /></button>
            <button className="primary-btn">New template</button>
            </div>
        </header>

        <div className="kanban-board">
            {columns.map((column) => (
                <TaskColumn 
                    key={column.id} 
                    label={column.label}
                    status={column.id}
                    tasks={tasks.filter((task) => task.status === column.id)} 
                    onMoveTask={handleMoveTask}
                    onDeleteTask={handleDeleteTask}
                    onAddTask={() => handleOpenModal(column.id)}
                />
            ))}
        </div>

        <AddTaskModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            status={activeColumn}
            onSave={handleAddTask}
        />
    </div>
    )
}

export default TaskManagement
