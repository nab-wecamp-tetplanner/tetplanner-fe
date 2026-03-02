import apiClient from "./apiClient";
import type { ShoppingItem } from "../types/shopping.types";
import type { Category } from "../types/dashboard.types";
import type {
  CategoryCreateRequest,
  CategoryResponse,
} from "../types/categories.type";

// ==========================================
// TYPES - Backend Structure
// ==========================================

interface BackendTetConfig {
  id: string;
  year: number;
  name: string;
  total_budget: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

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
  color?: string; // Hex color from backend
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

// Trong services/financeApi.ts

const mapBackendItemToFrontend = (item: BackendTodoItem): ShoppingItem => ({
  id: item.id,
  name: item.title || "",
  category: item.category_id || (item as any).category?.id || "",
  price: item.estimated_price || 0,
  quantity: item.quantity || 1,

  // FIX TẠI ĐÂY: Nếu đã mua (purchased) HOẶC trạng thái là 'completed'
  // thì ĐỀU coi là đã mua (purchased) cho đồng bộ với bên Task
  status:
    item.purchased || item.status === "completed" ? "purchased" : "pending",

  dueDate: item.deadline || new Date().toISOString(),
  timelinePhaseId: (item as any).timeline_phase?.id || undefined,
});

const mapFrontendItemToBackend = (
  item: Partial<ShoppingItem>,
  tetConfigId: string,
  isUpdate: boolean = false, // Add flag to distinguish create vs update
): Partial<BackendTodoItem> => {
  const payload: any = {};

  // Always include these fields
  if (item.name !== undefined) payload.title = item.name;
  if (item.price !== undefined) {
    payload.estimated_price = parseFloat(item.price.toString());
  }
  if (item.quantity !== undefined) payload.quantity = item.quantity;
  if (item.dueDate !== undefined) payload.deadline = item.dueDate;

  // Handle category_id
  if (item.category !== undefined) {
    const categoryValue =
      item.category && item.category !== "other" && item.category.includes("-")
        ? item.category
        : null;

    console.log("Category mapping:", {
      input: item.category,
      isOther: item.category === "other",
      hasHyphen: item.category?.includes("-"),
      output: categoryValue,
    });

    payload.category_id = categoryValue;
  }

  // Handle timeline_phase_id (allow update)
  if (item.timelinePhaseId !== undefined) {
    const phaseValue =
      item.timelinePhaseId && item.timelinePhaseId !== ""
        ? item.timelinePhaseId
        : null;
    payload.timeline_phase_id = phaseValue;
  }

  // Only include these on CREATE, not UPDATE
  if (!isUpdate) {
    payload.tet_config_id = tetConfigId;
    payload.is_shopping = true;
    // timeline_phase_id already handled above
  }

  // Include status field
  if (isUpdate && item.status !== undefined) {
    payload.status = item.status === "purchased" ? "completed" : "pending";
  } else if (!isUpdate) {
    payload.status = "pending";
  }

  return payload;
};

// Trong financeApi.ts

const mapBackendCategoryToFrontend = (
  cat: BackendCategory,
): CategoryResponse => {
  return {
    id: cat.id,
    name: cat.name,
    icon: cat.icon || "Package",
    color: cat.color || "#10b981",
    is_system: cat.is_system || false,
    allocated_budget: cat.allocated_budget || 0,
    tet_config: { id: Number(cat.tet_config_id) },
  };
};

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
    // FIX: Gộp timelinePhaseId vào bên trong object item và đặt isUpdate = false
    const backendItem = mapFrontendItemToBackend(
      { ...item, timelinePhaseId },
      tetConfigId,
      false,
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

    console.log("POST response:", created);
    console.log("POST response category:", (created as any).category);
    console.log("POST response category_id:", created.category_id);

    const mapped = mapBackendItemToFrontend(created);
    console.log("Mapped result:", mapped);
    console.log("Mapped category:", mapped.category);

    return mapped;
  },

  updateItem: async (
    itemId: string,
    updates: Partial<ShoppingItem>,
    tetConfigId: string, // Changed to string
    timelinePhaseId?: string, // Add timeline phase ID parameter
  ): Promise<ShoppingItem> => {
    // FIX: Gộp timelinePhaseId vào bên trong object updates và đặt isUpdate = true
    const backendUpdates = mapFrontendItemToBackend(
      { ...updates, timelinePhaseId },
      tetConfigId,
      true,
    );

    const response = await apiClient.patch<{
      todo_item: BackendTodoItem;
      budget: any;
    }>(`/todo-items/${itemId}`, backendUpdates);

    // Extract todo_item from response
    const updated = response.todo_item;
    return mapBackendItemToFrontend(updated);
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/todo-items/${itemId}`);
  },

  // Toggle purchased (2 API calls: PATCH + GET budget)
  toggleItemStatus: async (
    itemId: string,
    purchased: boolean, // Biến này mang giá trị true/false từ nút bấm UI
    tetConfigId: string,
    currentItem: ShoppingItem,
  ) => {
    try {
      const payload: any = {
        // Gửi cả hai để "bảo đảm" dù Backend dùng cái nào cũng trúng
        status: purchased ? "completed" : "pending",
        // purchased: purchased,3s

        category_id: currentItem.category || null,
        estimated_price: currentItem.price,
        quantity: currentItem.quantity || 1,
      };

      console.log("Toggling item status - payload:", payload);

      const response = await apiClient.patch<{
        todo_item: BackendTodoItem;
        budget: any;
      }>(`/todo-items/${itemId}`, payload);

      const budget = await financeApi.getBudget(tetConfigId);
      return {
        item: mapBackendItemToFrontend(response.todo_item),
        budget,
      };
    } catch (error: any) {
      console.error(
        "Failed to toggle item status:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  // Categories
  getCategories: async (tetConfigId: string) => {
    // Changed to string
    const categories = await apiClient.get<Category[]>(
      `/categories?tet_config_id=${tetConfigId}`,
    );

    return categories;
  },

  addCategory: async (
    tetConfigId: string,
    category: Omit<CategoryCreateRequest, "tet_config_id">, // We omit ID because it's passed separately
  ): Promise<CategoryResponse> => {
    const payload: CategoryCreateRequest = {
      ...category,
      tet_config_id: tetConfigId,
      // Ensure allocated_budget is set even if the Modal sends 'allocated'
      allocated_budget:
        (category as any).allocated || category.allocated_budget || 0,
    };

    console.log("Creating category - payload:", payload);

    const created = await apiClient.post<BackendCategory>(
      "/categories",
      payload,
    );

    console.log("Category created - response:", created);

    return mapBackendCategoryToFrontend(created);
  },

  updateCategory: async (
    categoryId: string,
    updates: { name?: string; color?: string; allocated_budget?: number },
  ) => {
    console.log("Updating category - payload:", updates);

    const updated = await apiClient.patch<BackendCategory>(
      `/categories/${categoryId}`,
      updates,
    );

    console.log("Category updated - response:", updated);

    return mapBackendCategoryToFrontend(updated);
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    await apiClient.delete(`/categories/${categoryId}`);
  },

  // Tet Config Management
  createTetConfig: async (config: {
    year: number;
    name: string;
    total_budget: number;
  }): Promise<BackendTetConfig> => {
    return await apiClient.post<BackendTetConfig>("/tet-configs", config);
  },

  getTetConfigs: async (): Promise<BackendTetConfig[]> => {
    return await apiClient.get<BackendTetConfig[]>("/tet-configs");
  },

  getTetConfig: async (id: string): Promise<BackendTetConfig> => {
    return await apiClient.get<BackendTetConfig>(`/tet-configs/${id}`);
  },

  updateTetConfig: async (
    id: string,
    updates: Partial<{ year: number; name: string; total_budget: number }>,
  ): Promise<BackendTetConfig> => {
    return await apiClient.patch<BackendTetConfig>(
      `/tet-configs/${id}`,
      updates,
    );
  },

  deleteTetConfig: async (id: string): Promise<void> => {
    await apiClient.delete(`/tet-configs/${id}`);
  },
};

export default financeApi;
