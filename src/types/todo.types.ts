export interface BaseReference {
  id: string;
}

export interface TodoItem {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed"| "cancelled";
  deadline: string;
  is_overdue: boolean;
  is_shopping: boolean;
  estimated_price?: number;
  quantity?: number;
  purchased: boolean;
  assigned_to: string | null;
  created_at: string;
  deleted_at: string | null;
  tet_config: BaseReference;
  timeline_phase: BaseReference;
  category: BaseReference;
}