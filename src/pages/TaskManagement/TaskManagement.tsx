import React from 'react'
import type { Task, TaskStatus} from '../../types/task'
import { MOCK_TASKS } from '../../data/mockTasks'
import './TaskManagement.css'
import { LayoutGrid, Plus, MoreHorizontal } from 'lucide-react';
import TaskCard from '../../components/TaskCard/TaskCard';

const TaskManagement: React.FC = () => {

    console.log('Mock tasks:', MOCK_TASKS);
    
    const [tasks] = React.useState<Task[]>(MOCK_TASKS);

    const columns: { id: TaskStatus; label: string} [] = [
        { id: 'todo', label: 'To Do' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'done', label: 'Done' },
    ];

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
                <div key={column.id} className="kanban-column">
                    <div className="column-info">
                        <h2>{column.label}</h2>
                        <span className="task-count">
                            {tasks.filter(task => task.status === column.id).length}
                        </span>
                        <button className='add-task-btn'><Plus size={14} /> Add new task </button>
                    </div>

                    <div className="task-list">
                        {tasks
                            .filter(task => task.status === column.id)
                            .map((task) => (<TaskCard key={task.id} task={task} />))}
                    </div>
                </div>
            ))}
        </div>
    </div>)
}

export default TaskManagement
