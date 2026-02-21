import  { type TetConfig, type Task  } from '../types/task';

export const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Design new ui presentation",
    status: "todo",
    priority: "High",
    deadline: "2026-02-24",
    is_overdue: false,
    is_shopping: false,
    quantity: 1,
    purchased: false,
    created_at: "2026-01-01T00:00:00Z",
    category_id: "design",
  },
  {
    id: "2",
    title: "Add more ui/ux mockups",
    status: "todo",
    priority: "Medium",
    deadline: "2026-02-25",
    is_overdue: false,
    is_shopping: false,
    quantity: 1,
    purchased: false,
    created_at: "2026-01-01T00:00:00Z",
    category_id: "marketing",
  },
  {
    id: "3",
    title: "Design system update",
    status: "in-progress",
    priority: "High",
    deadline: "2026-03-12",
    is_overdue: false,
    is_shopping: false,
    quantity: 1,
    purchased: false,
    created_at: "2026-01-01T00:00:00Z",
    category_id: "design",
  },
  {
    id: "4",
    title: "Add product to the market",
    status: "done",
    priority: "Low",
    deadline: "2026-01-06",
    is_overdue: false,
    is_shopping: false,
    quantity: 1,
    purchased: false,
    created_at: "2026-01-01T00:00:00Z",
    category_id: "product",
  },
];

export const MOCK_CONFIGS: TetConfig[] = [
    { id: 'p1', year: 2026, name: '🧧 Paternal Family Plans', total_budget: 0, created_at: '2026-01-01T00:00:00Z' },
    { id: 'p2', year: 2026, name: '🌸 Maternal Family Plans', total_budget: 0, created_at: '2026-01-01T00:00:00Z' }
];

export const TIMELINE_PHASES = [
    { id: 'phase_before', name: 'Before Tet' },
    { id: 'phase_30', name: '30 Tet' },
    { id: 'phase_m1', name: 'Mùng 1' },
    { id: 'phase_m2', name: 'Mùng 2' },
    { id: 'phase_m3', name: 'Mùng 3' },
    { id: 'phase_after', name: 'After Tet' },
];

export const COLUMNS = [
    { id: 'PENDING', label: 'To do' },
    { id: 'IN_PROGRESS', label: 'In progress' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'CANCELLED', label: 'Cancelled' },
];