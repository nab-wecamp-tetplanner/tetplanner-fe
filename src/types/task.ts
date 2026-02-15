import type { ReactNode } from 'react';

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface SubTask {
    id: string;
    text: string;
    isCompleted: boolean;
}

export interface Task {
    id: string;
    title: string;
    project: string;
    category: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    avatars: string[];
    commentsCount: number;
    attachmentsCount: number;
    icon?: ReactNode;
    iconColor?: string;
    subTasks?: SubTask[];
}