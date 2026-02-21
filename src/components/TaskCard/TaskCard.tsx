import React from 'react'
import { Clock, Flame, MoreHorizontal, ShoppingCart } from 'lucide-react'
import type { Task } from '../../types/task'
import './TaskCard.css'

interface TaskCardProps {
    task: Task;
    onDeleteTask?: (taskId: string) => void;
    onClick?: () => void;
    isDisssolving?: boolean;
}


const TaskCard: React.FC<TaskCardProps> = ({ task, onDeleteTask, onClick, isDisssolving }) => {

    const getProgress = () => {
        if (task.sub_tasks && task.sub_tasks.length > 0) {
            const completed = task.sub_tasks.filter(st => st.isCompleted).length;
            const total = task.sub_tasks.length;
            return { text: `${completed}/${total}`, percent: `${Math.round((completed / total) * 100)}%` };
        }
        switch(task.status) {
            case 'in_progress':
                return { text: '5/10', percent: '50%' };
            case 'completed':
                return { text: '10/10', percent: '100%' };
            default:
                return { text: '0/10', percent: '0%' };
        }
    }
    const { text: progressText, percent: progressWidth } = getProgress();

    const getCategoryColor = () => {
        switch(task.category_id?.toLowerCase()) {
            case 'design':      return 'tet-tag--rose';
            case 'marketing':   return 'tet-tag--amber';
            case 'product':     return 'tet-tag--jade';
            case 'development': return 'tet-tag--indigo';
            default:            return 'tet-tag--stone';
        }
    };

    /* Special gold trim for high priority */
    const isHighPriority = task.priority === 'high' || task.priority === 'urgent';

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteTask) {
            onDeleteTask(task.id);
        }
    };

    return (
        <div 
            className={`tet-card ${isHighPriority ? 'tet-card--gold' : ''} ${isDisssolving ? 'tet-card--dissolving' : ''}`}
            draggable="true" 
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)} 
            onClick={onClick}
        >
            {/* Gold trim corner for high priority */}
            {isHighPriority && <div className="tet-card__gold-trim"></div>}

            {/* Card body */}
            <div className="tet-card__body">
                {/* Header: Tag + Priority */}
                <div className="tet-card__top">
                    {task.category_id && (
                        <span className={`tet-card__tag ${getCategoryColor()}`}>
                            {task.category_id}
                        </span>
                    )}
                    <div className="tet-card__top-right">
                        {isHighPriority && (
                            <span className="tet-card__priority">
                                <Flame size={12} /> Important
                            </span>
                        )}
                        {task.is_shopping && (
                            <span className="tet-card__priority">
                                <ShoppingCart size={12} />
                            </span>
                        )}
                        <button className="tet-card__more" onClick={handleMoreClick}>
                            <MoreHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className="tet-card__title">{task.title}</h3>

                {/* Assigned to */}
                {task.assigned_to && (
                    <div className="tet-card__meta">
                        <span className="tet-card__project">{task.assigned_to}</span>
                    </div>
                )}

                {/* Progress */}
                <div className="tet-card__progress">
                    <div className="tet-card__progress-bar">
                        <div 
                            className={`tet-card__progress-fill tet-card__progress-fill--${task.status}`} 
                            style={{ width: progressWidth }}
                        ></div>
                    </div>
                    <span className="tet-card__progress-text">{progressText}</span>
                </div>

                {/* Footer: Deadline */}
                <div className="tet-card__footer">
                    <div className="tet-card__stats">
                        {task.deadline && (
                            <span className={`tet-card__date ${task.is_overdue ? 'tet-card__date--urgent' : ''}`}>
                                <Clock size={13} /> {task.deadline}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskCard
