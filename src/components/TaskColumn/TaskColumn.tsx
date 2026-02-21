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
    onCelebrate?: (x: number, y: number) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ label, status, tasks, onMoveTask, onDeleteTask, onAddTask, onTaskClick, onCelebrate }) => {

    const [isOver, setIsOver] = React.useState(false);
    const [dissolvingTaskId, setDissolvingTaskId] = React.useState<string | null>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        const taskId = e.dataTransfer.getData('taskId');
        if(taskId) {
            if (status === 'DONE' && onCelebrate) {
                /* Trigger celebration at drop location */
                const rect = e.currentTarget.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = e.clientY;
                onCelebrate(cx, cy);
                setDissolvingTaskId(taskId);
                /* Delay the actual move so the dissolve animation plays */
                setTimeout(() => {
                    onMoveTask(taskId, status);
                    setDissolvingTaskId(null);
                }, 650);
            } else {
                onMoveTask(taskId, status);
            }
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
            case 'PENDING': return 'tet-col--amber';
            case 'IN_PROGRESS': return 'tet-col--rose';
            case 'DONE': return 'tet-col--emerald';
            case 'CANCELLED': return 'tet-col--slate';
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
                        isDisssolving={dissolvingTaskId === task.id}
                    />
                ))
            ) : (
                <div className={`tet-col__empty ${isOver ? 'tet-col__empty--active' : ''}`}>
                    <span>Drop here</span>
                </div>
            )}

            {/* Drop Zone Indicator */}
            {isOver && tasks.length > 0 && (
                <div className="tet-col__dropzone">
                    <span>Drop here</span>
                </div>
            )}
        </div>

        {/* Add Task Button */}
        <button className="tet-col__add-btn" onClick={onAddTask}>
            <div className="tet-col__add-icon">
                <Plus size={14} />
            </div>
            <span>Add Task</span>
        </button>
    </div>
  )
}

export default TaskColumn
