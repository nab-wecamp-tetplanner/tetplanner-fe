import React from 'react'
import { MessageSquare,MoreHorizontal,Paperclip } from 'lucide-react'
import type { Task } from '../../types/task'
import './TaskCard.css'

interface TaskCardProps {
    task: Task;
}


const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const getProgress = () => {
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

    return (
        <div className="task-card" draggable="true" onDragStart={(e) => {
            e.dataTransfer.setData('taskId', task.id);
        }}>
            <div className="card-header">
                <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>
                <MoreHorizontal size={16} className="more-icon" />  
            </div>

            <h4 className="task-title">{task.title}</h4>

            <div className="task-meta">
                <span className="project-name">{task.project}</span>
                <span className="dot"></span>
                <span className="category-name">{task.category}</span>
            </div>

            <div className="progress-section">
                <div className="progress-info">
                    <span>Progress</span>
                    <span className="progress-count">{progressText}</span>
                </div>
                <div className="progress-bar">
                    <div 
                        className={`progress-fill ${task.status}`}
                        style={{ width: progressWidth }}
                    ></div>
                </div>

                <div className="card-footer">
                    <span className="due-date">
                        {task.dueDate}
                    </span>
                    <div className="footer-right">
                        <div className="avatar-group">
                            {task.avatars.map((avatarUrl, index) => (
                                <img key={index} src={avatarUrl} alt={`Avatar ${index + 1}`} className="avatar" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="comments-attachments">
                <span className="comments-count"> <MessageSquare />{task.commentsCount}</span>
                <span className="attachments-count"><Paperclip /> {task.attachmentsCount}</span>
            </div>
        </div>
    )
}




export default TaskCard
