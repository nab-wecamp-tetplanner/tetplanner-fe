import apiClient from "./apiClient";
import type { ShoppingItem, ShoppingCategory } from "../types/shopping.types";

// ==========================================
// TYPES - Backend Structure
// ==========================================

interface BackendTodoItem {
  id: string; // UUID
  title: string;
  description?: string;
  estimated_price: number;
  quantity: number;
  purchased: boolean;
  status: string;
  deadline?: string;
  category_id?: string; // UUID
  tet_config_id: string; // UUID
  is_shopping: boolean;
  created_at: string;
  updated_at: string;
}

interface BackendCategory {
  id: string; // UUID
  name: string;
  icon?: string;
  is_system?: boolean;
  allocated_budget?: number;
  tet_config_id: string; // UUID
  created_at: string;
  updated_at: string;
}

interface BackendBudgetSummary {
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  percentage_used: number;
  warning_level: string;
  categories: Array<{
    category_id: string; // UUID
    category_name: string;
    allocated_budget: number;
    spent: number;
    remaining: number;
  }>;
}

// ==========================================
// FIELD MAPPING HELPERS
// ==========================================

const mapBackendItemToFrontend = (item: BackendTodoItem): ShoppingItem => ({
  id: item.id, // Already string UUID
  name: item.title,
  category: item.category_id || "other",
  price: item.estimated_price,
  quantity: item.quantity,
  status: item.purchased ? "purchased" : "pending",
  dueDate: item.deadline,
});

const mapFrontendItemToBackend = (
  item: Partial<ShoppingItem>,
  tetConfigId: string,
  timelinePhaseId?: string, // Add timeline phase ID
  isUpdate: boolean = false, // Add flag to distinguish create vs update
): Partial<BackendTodoItem> => {
  const payload: any = {
    title: item.name,
    estimated_price: item.price,
    quantity: item.quantity,
    deadline: item.dueDate,
    category_id:
      item.category && item.category.includes("-") ? item.category : undefined,
    tet_config_id: tetConfigId,
    is_shopping: true,
    status: "pending",
    timeline_phase_id: timelinePhaseId || null, // Use provided phase ID
  };

  // Only include 'purchased' for updates, not creates
  if (isUpdate && item.status !== undefined) {
    payload.purchased = item.status === "purchased";
  }

  return payload;
};

const mapBackendCategoryToFrontend = (
  cat: BackendCategory,
): {
  id: string;
  name: string;
  icon: string;
  color: string;
  allocated: number;
  spent: number;
} => ({
  id: cat.id, // Already string UUID
  name: cat.name,
  icon: cat.icon || "Package",
  color: "planner-blue",
  allocated: cat.allocated_budget || 0,
  spent: 0,
});

// ==========================================
// API FUNCTIONS
// ==========================================

export const financeApi = {
  // Budget
  getBudget: async (tetConfigId: string) => {
    // Changed to string
    const data = await apiClient.get<BackendBudgetSummary>(
      `/tet-configs/${tetConfigId}/budget`,
    );
    return {
      total: data.total_budget,
      used: data.used_budget,
      remaining: data.remaining_budget,
      percentageUsed: data.percentage_used,
      warningLevel: data.warning_level,
      categories: data.categories,
    };
  },

  updateBudget: async (tetConfigId: string, totalBudget: number) => {
    // Changed to string
    await apiClient.patch(`/tet-configs/${tetConfigId}/budget`, {
      total_budget: totalBudget,
    });
    return financeApi.getBudget(tetConfigId);
  },

  // Shopping Items
  getItems: async (tetConfigId: string): Promise<ShoppingItem[]> => {
    // Changed to string
    const items = await apiClient.get<BackendTodoItem[]>(
      `/todo-items?tet_config_id=${tetConfigId}&is_shopping=true`,
    );
    return items.map(mapBackendItemToFrontend);
  },

  addItem: async (
    tetConfigId: string, // Changed to string
    item: Omit<ShoppingItem, "id">,
    timelinePhaseId?: string, // Add timeline phase ID parameter
  ): Promise<ShoppingItem> => {
    const backendItem = mapFrontendItemToBackend(
      item,
      tetConfigId,
      timelinePhaseId,
    );

    // Debug logging - FULL OBJECT
    console.log("Adding item - Frontend data:", item);
    console.log(
      "Adding item - Backend payload FULL:",
      JSON.stringify(backendItem, null, 2),
    );
    console.log("tetConfigId:", tetConfigId, "type:", typeof tetConfigId);
    console.log("timelinePhaseId:", timelinePhaseId);

    const created = await apiClient.post<BackendTodoItem>(
      "/todo-items",
      backendItem,
    );
    return mapBackendItemToFrontend(created);
  },

  updateItem: async (
    itemId: string,
    updates: Partial<ShoppingItem>,
    tetConfigId: string, // Changed to string
    timelinePhaseId?: string, // Add timeline phase ID parameter
  ): Promise<ShoppingItem> => {
    const backendUpdates = mapFrontendItemToBackend(
      updates,
      tetConfigId,
      timelinePhaseId,
      true, // isUpdate = true for updates
    );
    const updated = await apiClient.patch<BackendTodoItem>(
      `/todo-items/${itemId}`,
      backendUpdates,
    );
    return mapBackendItemToFrontend(updated);
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/todo-items/${itemId}`);
  },

  // Toggle purchased (2 API calls: PATCH + GET budget)
  toggleItemStatus: async (
    itemId: string,
    purchased: boolean,
    tetConfigId: string, // Changed to string
  ) => {
    const updated = await apiClient.patch<BackendTodoItem>(
      `/todo-items/${itemId}`,
      { purchased },
    );
    const budget = await financeApi.getBudget(tetConfigId);
    return {
      item: mapBackendItemToFrontend(updated),
      budget,
    };
  },

  // Categories
  getCategories: async (tetConfigId: string) => {
    // Changed to string
    const categories = await apiClient.get<BackendCategory[]>(
      `/categories?tet_config_id=${tetConfigId}`,
    );
    return categories.map(mapBackendCategoryToFrontend);
  },

  addCategory: async (
    tetConfigId: string, // Changed to string
    category: { name: string; icon: string; color: string; allocated: number },
  ) => {
    const created = await apiClient.post<BackendCategory>("/categories", {
      name: category.name,
      icon: category.icon,
      allocated_budget: category.allocated,
      tet_config_id: tetConfigId,
    });
    return mapBackendCategoryToFrontend(created);
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`);
  },
};

export default financeApi;
