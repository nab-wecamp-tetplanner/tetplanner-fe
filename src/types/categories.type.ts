export interface CategoryCreateRequest {
    name: string;
    icon: string;
    color?: string | null;
    allocated_budget: number;
    tet_config_id: string;
}

export interface CategoryResponse {
    id: string,
    name: string;
    icon: string;
    color: string | null;
    is_system: boolean;
    allocated_budget: number;
    tet_config: {
        id: number
    }
}