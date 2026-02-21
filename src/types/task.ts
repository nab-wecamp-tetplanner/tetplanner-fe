export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
    id: string;
    text: string;
    isCompleted: boolean;
}

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
    assigned_to?: string;
    created_at: string;
    deleted_at?: string;
    tet_config_id?: string;
    timeline_phase_id?: string;
    category_id?: string;
    sub_tasks?: SubTask[];
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