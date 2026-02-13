import React from 'react'
import type { Task, TaskStatus} from '../../types/task'
import { MOCK_TASKS } from '../../data/mockTasks'
import './TaskManagement.css'
import { LayoutGrid, Plus, MoreHorizontal } from 'lucide-react';
import TaskColumn from '../../components/TaskColumn/TaskColumn';

const TaskManagement: React.FC = () => {

    console.log('Mock tasks:', MOCK_TASKS);
    
    const [tasks, setTasks] = React.useState<Task[]>(MOCK_TASKS);

    const columns: { id: TaskStatus; label: string} [] = [
        { id: 'todo', label: 'To Do' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'done', label: 'Done' },
    ];

    const handleDeleteTask = (taskId: string) => {
        
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }

    const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
            )
        );
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
                />
            ))}
        </div>
    </div>)
}

export default TaskManagement
