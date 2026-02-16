import React from 'react'
import { MessageSquare, Paperclip, Clock, Flame, MoreHorizontal } from 'lucide-react'
import type { Task } from '../../types/task'
import './TaskCard.css'

interface TaskCardProps {
    task: Task;
    onDeleteTask?: (taskId: string) => void;
    onClick?: () => void;
}


const TaskCard: React.FC<TaskCardProps> = ({ task, onDeleteTask, onClick }) => {

    const getProgress = () => {
        if (task.subTasks && task.subTasks.length > 0) {
            const completed = task.subTasks.filter(st => st.isCompleted).length;
            const total = task.subTasks.length;
            return { text: `${completed}/${total}`, percent: `${Math.round((completed / total) * 100)}%` };
        }
        switch(task.status) {
            case 'in-progress':
                return { text: '5/10', percent: '50%' };
            case 'done':
                return { text: '10/10', percent: '100%' };
            default:
                return { text: '0/10', percent: '0%' };
        }
    }
    const { text: progressText, percent: progressWidth } = getProgress();

    const getCategoryColor = () => {
        switch(task.category?.toLowerCase()) {
            case 'design':      return 'tet-tag--rose';
            case 'marketing':   return 'tet-tag--amber';
            case 'product':     return 'tet-tag--jade';
            case 'development': return 'tet-tag--indigo';
            default:            return 'tet-tag--stone';
        }
    };

    /* Special gold trim for high priority */
    const isHighPriority = task.priority === 'High';

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteTask) {
            onDeleteTask(task.id);
        }
    };

    return (
        <div 
            className={`tet-card ${isHighPriority ? 'tet-card--gold' : ''}`}
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
                    <span className={`tet-card__tag ${getCategoryColor()}`}>
                        {task.category}
                    </span>
                    <div className="tet-card__top-right">
                        {isHighPriority && (
                            <span className="tet-card__priority">
                                <Flame size={12} /> Quan trọng
                            </span>
                        )}
                        <button className="tet-card__more" onClick={handleMoreClick}>
                            <MoreHorizontal size={15} />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <h3 className="tet-card__title">{task.title}</h3>

                {/* Project meta */}
                <div className="tet-card__meta">
                    <span className="tet-card__project">{task.project}</span>
                </div>

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

                {/* Footer: Avatars + Meta */}
                <div className="tet-card__footer">
                    <div className="tet-card__avatars">
                        {task.avatars.map((avatarUrl, index) => (
                            <img key={index} src={avatarUrl} alt="" className="tet-card__avatar" />
                        ))}
                    </div>
                    
                    <div className="tet-card__stats">
                        {task.commentsCount > 0 && (
                            <span className="tet-card__stat">
                                <MessageSquare size={13} /> {task.commentsCount}
                            </span>
                        )}
                        {task.attachmentsCount > 0 && (
                            <span className="tet-card__stat">
                                <Paperclip size={13} /> {task.attachmentsCount}
                            </span>
                        )}
                        <span className={`tet-card__date ${task.dueDate.toLowerCase().includes('today') || task.dueDate.toLowerCase().includes('urgent') ? 'tet-card__date--urgent' : ''}`}>
                            <Clock size={13} /> {task.dueDate}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskCard
