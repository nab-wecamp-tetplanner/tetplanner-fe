import React from 'react'
import './TaskColumn.css'
import type { Task, TaskStatus } from '../../types/task'
import { Plus } from 'lucide-react'
import TaskCard from '../TaskCard/TaskCard'

interface TaskColumnProps {
    label: string;
    status: TaskStatus;
    tasks: Task[];
    onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
    onDeleteTask: (taskId: string) => void;
    onAddTask: () => void;
    onTaskClick?: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ label, status, tasks, onMoveTask, onDeleteTask, onAddTask, onTaskClick }) => {

    const [isOver, setIsOver] = React.useState(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        if(taskId) {
            onMoveTask(taskId, status);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };
  return (
    <div className={`column-header ${isOver ? 'drag-over' : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
    style={{ 
         backgroundColor: isOver ? '#f0f9ff' : 'transparent',
         transition: 'background-color 0.2s'
      }}>
        <div className="header-top">
            <h2 className="column-title">{label}</h2>
            <span className="task-count">{tasks.length}</span>
        </div>
        <div className="header-bottom">
            <button className='add-task-btn' onClick={onAddTask}><Plus size={16} /> Add new task </button>
        </div>
        <div className="task-list">
            {tasks.length > 0 ? (tasks.map((task) => (<TaskCard key={task.id} task={task} onDeleteTask={onDeleteTask} onClick={() => onTaskClick && onTaskClick(task)} />))) : (<p className="empty-column-placeholder">Drop tasks here</p>)}
        </div>
    </div>
  )
}

export default TaskColumn
