import React from 'react'
import './TaskColumn.css'
import type { Task, TaskStatus } from '../../types/task'
import { Plus, MoreHorizontal } from 'lucide-react'
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

    /* Column accent color based on status */
    const getStatusAccent = () => {
        switch(status) {
            case 'todo': return 'tet-col--amber';
            case 'in-progress': return 'tet-col--rose';
            case 'done': return 'tet-col--emerald';
            default: return 'tet-col--amber';
        }
    };

  return (
    <div 
        className={`tet-col ${getStatusAccent()} ${isOver ? 'tet-col--drag-over' : ''}`} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave}
    >
        {/* Column Header — frosted glass */}
        <div className="tet-col__header">
            <div className="tet-col__title-group">
                <div className="tet-col__dot"></div>
                <h2 className="tet-col__title">{label}</h2>
                <span className="tet-col__count">{tasks.length}</span>
            </div>
            <button className="tet-col__more-btn">
                <MoreHorizontal size={16} />
            </button>
        </div>

        {/* Task List */}
        <div className="tet-col__tasks">
            {tasks.length > 0 ? (
                tasks.map((task) => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onDeleteTask={onDeleteTask} 
                        onClick={() => onTaskClick && onTaskClick(task)} 
                    />
                ))
            ) : (
                <div className={`tet-col__empty ${isOver ? 'tet-col__empty--active' : ''}`}>
                    <span>Kéo thả vào đây</span>
                </div>
            )}

            {/* Drop Zone Indicator */}
            {isOver && tasks.length > 0 && (
                <div className="tet-col__dropzone">
                    <span>Thả vào đây</span>
                </div>
            )}
        </div>

        {/* Add Task Button */}
        <button className="tet-col__add-btn" onClick={onAddTask}>
            <div className="tet-col__add-icon">
                <Plus size={14} />
            </div>
            <span>Thêm công việc</span>
        </button>
    </div>
  )
}

export default TaskColumn
