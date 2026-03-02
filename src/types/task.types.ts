import type { TimelineCreateRequest } from "./timeline.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
    id: string;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline?: string;
    is_overdue: boolean;
    is_shopping: boolean;
    estimated_price?: number;
    quantity: number;
    purchased: boolean;
    assigned_to_user?: { id: string };
    created_at: string;
    deleted_at?: string;
    tet_config_id?: string;
    timeline_phase_id?: string;
    category_id?: string;   
    subtasks?: Record<string, boolean>;
}

export interface TimelinePhase {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    display_order: number;
    tet_config_id?: string;
}


export interface TetConfig {
    id: string;
    year: number;
    name: string; 
    total_budget: number;
    created_at?: string;
    deleted_at?: string;
    owner_id?: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Member {
    id: string;
    name: string;
    avatar: string;
    user_id: string;
}

export interface ManagePhasesModalProps {
    isOpen: boolean;
    onClose: () => void;
    phases: any[];
    configId: string;
    onPhaseCreated: (newPhase: TimelineCreateRequest) => void;
    activePhaseId: string;
    onSelectPhase: (phaseId: string) => void;
}