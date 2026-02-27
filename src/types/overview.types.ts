import type { TetConfigSummary } from "./tetConfig.types";
import type { TodoItem } from "./todo.types";

export interface OverviewConfig{
    id: string;
    year: number;
    name: string; 
    total_budget: number;
    created_at?: string;
    deleted_at?: string;
    owner_id?: string;
    config_summary: TetConfigSummary,
    phases: {
        id: string,
        name: string,
        start_date: string,
        end_date: string,
        display_order: number;
        tet_config: {
            id: string
        },
        tasks: TodoItem[]
    }[],
    
}