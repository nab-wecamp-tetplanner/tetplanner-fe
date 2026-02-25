import React from 'react'
import { Clock, Flame, MoreHorizontal, ShoppingCart, DollarSign } from 'lucide-react'
import type { Task, Category, Member } from '../../types/task'
import './TaskCard.css'

interface TaskCardProps {
    task: Task;
    onDeleteTask?: (taskId: string) => void;
    onClick?: (task: Task) => void;
    isDissolving?: boolean;
    categories?: Category[];
    members?: Member[];
}


const TaskCard: React.FC<TaskCardProps> = ({ task, onDeleteTask, onClick, isDissolving, categories, members }) => {

    /* Resolve category name from UUID */
    const categoryName = categories?.find(c => c.id === task.category_id)?.name;

    const getProgress = () => {
        if (task.subtasks && Object.keys(task.subtasks).length > 0) {
            const values = Object.values(task.subtasks);
            const total = values.length;
            const completed = values.filter(Boolean).length;
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
        const name = (categoryName || '').toLowerCase();
        switch(name) {
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
            className={`tet-card ${isHighPriority ? 'tet-card--gold' : ''} ${isDissolving ? 'tet-card--dissolving' : ''}`}
            draggable="true" 
            onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)} 
            onClick={() => onClick && onClick(task)}
        >
            {/* Gold trim corner for high priority */}
            {isHighPriority && <div className="tet-card__gold-trim"></div>}

            {/* Card body */}
            <div className="tet-card__body">
                {/* Header: Tag + Priority */}
                <div className="tet-card__top">
                    {task.category_id && categoryName && (
                        <span className={`tet-card__tag ${getCategoryColor()}`}>
                            {categoryName}
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

                {/* Footer: Deadline + Price + Assignee */}
                <div className="tet-card__footer">
                    <div className="tet-card__stats">
                        {task.deadline && (
                            <span className={`tet-card__date ${task.is_overdue ? 'tet-card__date--urgent' : ''}`}>
                                <Clock size={13} /> {task.deadline}
                            </span>
                        )}
                        {task.estimated_price != null && task.estimated_price > 0 && (
                            <span className="tet-card__price">
                                <DollarSign size={12} />
                                {task.estimated_price.toLocaleString('vi-VN')}
                            </span>
                        )}
                    </div>
                    {(() => {
                        const member = members?.find(m => m.id === task.assigned_to);
                        return member ? (
                            <div className="tet-card__assignee" title={member.name}>
                                <img 
                                    src={member.avatar} 
                                    alt={member.name} 
                                    className="tet-card__assignee-avatar" 
                                />
                            </div>
                        ) : null;
                    })()}
                </div>
            </div>
        </div>
    )
}

export default TaskCard
