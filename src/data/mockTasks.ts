import  { type Plan, type Task } from '../types/task';

export const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Design new ui presentation",
    project: "Dribbble marketing",
    category: "Design",
    status: "todo",
    priority: "High",
    dueDate: "24 Aug 2022",
    avatars: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    ],
    commentsCount: 7,
    attachmentsCount: 2,
  },
  {
    id: "2",
    title: "Add more ui/ux mockups",
    project: "Pinterest promotion",
    category: "Marketing",
    status: "todo",
    priority: "Medium",
    dueDate: "25 Aug 2022",
    avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=John"],
    commentsCount: 2,
    attachmentsCount: 0,
  },
  {
    id: "3",
    title: "Design system update",
    project: "Oreo website project",
    category: "Design",
    status: "in-progress",
    priority: "High",
    dueDate: "12 Nov 2022",
    avatars: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    ],
    commentsCount: 12,
    attachmentsCount: 5,
  },
  {
    id: "4",
    title: "Add product to the market",
    project: "Ui8 marketplace",
    category: "Product",
    status: "done",
    priority: "Low",
    dueDate: "6 Jan 2022",
    avatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=Sam"],
    commentsCount: 0,
    attachmentsCount: 1,
  },
];

export const MOCK_PLANS: Plan[] = [
    { id: 'p1', title: '🧧 paternal family plans', description: 'Chuẩn bị đồ đạc và dọn dẹp nhà Nội', tasks: [] },
    { id: 'p2', title: '🌸 maternal family plans', description: 'Mua sắm quà cáp về thăm Ngoại', tasks: [] }
];
