export interface TetConfig {
    id: string;
    year: number;
    name: string;
    total_budget: number;
    created_at: string;
    deleted_at: string | null;
    owner: {
        id: string;
    };
}

export interface TetConfigSummary {
    total_budget: number;
    used_budget: number;
    remaining_budget: number;
    percentage_used: number;
    warning_level: "ok" | "warning" | "critical";
    categories: {
        id: string;
        name: string;
        icon: string;
        allocated_budget: number;
        used_budget: number;
        remaining_budget: number;
        percentage_used: number;
        warning_level: "ok" | "warning" | "critical";
    }[]
}