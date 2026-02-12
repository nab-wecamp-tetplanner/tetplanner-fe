import React from 'react'
import './TaskColumn.css'
import type { Task, TaskStatus } from '../../types/task'
import { Plus } from 'lucide-react'
import TaskCard from '../TaskCard/TaskCard'

interface TaskColumnProps {
    label: string;
    status: TaskStatus;
    tasks: Task[];
}

const TaskColumn: React.FC<TaskColumnProps> = ({ label, tasks }) => {
  return (
    <div className="column-header">
        <div className="header-top">
            <h2 className="column-title">{label}</h2>
            <span className="task-count">{tasks.length}</span>
        </div>
        <div className="header-bottom">
            <button className='add-task-btn'><Plus size={16} /> Add new task </button>
        </div>
        <div className="task-list">
            {tasks.length > 0 ? (tasks.map((task) => (<TaskCard key={task.id} task={task} />))) : (<p className="empty-column-placeholder">Drop tasks here</p>)}
        </div>
    </div>
  )
}

export default TaskColumn
