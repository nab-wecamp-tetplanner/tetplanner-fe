import  { type TetConfig, type Task  } from '../types/task';

export const MOCK_INITIAL_TASKS: Task[] = [
    {
        id: "task-1",
        title: "Dọn dẹp bàn thờ",
        priority: "high",
        status: "pending",
        is_shopping: false,
        quantity: 1,
        assigned_to: "user-bo", // Giao cho Bố
        created_at: new Date().toISOString(),
        is_overdue: false,
        purchased: false
    },
    {
        id: "task-2",
        title: "Mua sắm mứt Tết",
        priority: "medium",
        status: "in_progress",
        is_shopping: true,
        estimated_price: 500000,
        quantity: 1,
        assigned_to: "user-me", // Giao cho Mẹ
        created_at: new Date().toISOString(),
        is_overdue: false,
        purchased: false
    }
];

export const MOCK_CONFIGS: TetConfig[] = [
    {
        id: "config-1", 
        name: "🧧 Tết Nhà Nội 2026",
        year: 2026,
        total_budget: 50000000
    }
];
export const TIMELINE_PHASES = [
    { id: 'before_tet', name: 'Before Tet' },
    { id: 'phase_30', name: '30 Tet' },
    { id: 'phase_m1', name: 'Mùng 1' },
    { id: 'phase_m2', name: 'Mùng 2' },
    { id: 'phase_m3', name: 'Mùng 3' },
    { id: 'phase_after', name: 'After Tet' },
];

export const COLUMNS = [
    { id: 'pending', label: 'To Do' },
    { id: 'in_progress', label: 'In progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
];

export const MOCK_MEMBERS = [
    { id: 'user-bo', name: 'Dad', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bo&backgroundColor=b6e3f4' },
    { id: 'user-me', name: 'Mom', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me&backgroundColor=ffdfbf' },
    { id: 'user-con', name: 'Myself', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BanThan&backgroundColor=c0aede' },
];