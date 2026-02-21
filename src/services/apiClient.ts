import api from "./api";
import type { UserPermissions } from "../types/auth.types";
import { type AxiosRequestConfig } from "axios";
import type { TodoItem } from "../types/todo.types";
import type { TetConfig } from "../types/tetConfig.types";
import type { Category } from "../types/categories.type";
import type { User } from "../types/auth.types";

interface BackendResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

type ApiResponse<T> = Promise<T>;
export class ApiClient {
  // Auth endpoints
  auth = {
    signup: (data: {
      name: string;
      email: string;
      password: string;
    }): ApiResponse<string> => {
      return this.post("/auth/signup", data);
    },
    
    login: (data: {
      email: string;
      password: string;
      remember_me?: boolean;
    }): ApiResponse<UserPermissions> => {
      return this.post("/auth/login", data);
    },

    verify: (data: { email: string; code: string }): ApiResponse<void> => {
      return this.post("/auth/verify-otp", data);
    },

    forgotPassword: (data: { email: string }): ApiResponse<void> => {
      return this.post("/auth/forgot-password", data);
    },

    resetPassword: (data: {
      email: string;
      newPassword: string;
    }): ApiResponse<void> => {
      return this.post("/auth/reset-password", data);
    },

    changePassword: (data: {
      oldPassword: string;
      newPassword: string;
    }): ApiResponse<void> => {
      return this.post("/auth/change-password", data);
    },
  };

  // User endpoints
  users = {
    getProfile: (): ApiResponse<User> => {
      return this.get("/users/me");
    },
    updateProfile: (data: {
      name?: string;
      image_url?: string;
    }): ApiResponse<User> => {
      return this.put("/users/me", data);
    },
    uploadAvatar: (file: File): ApiResponse<User> => {
      const formData = new FormData();
      formData.append("file", file);
      return this.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
  };

  // Tet configs endpoints
  tetConfigs = {
    create: (data: {
      year: number;
      name: string;
      total_budget: number;
    }): ApiResponse<TetConfig> => {
      return this.post("/tet-configs", data);
    },
    getMyConfigs: (): ApiResponse<TetConfig[]> => {
      return this.get("/tet-configs");
    },

    getConfigById: (id: string): ApiResponse<TetConfig> => {
      return this.get("/tet-configs/" + id);
    },

    getBudgetSummary: (tetConfigId: string): ApiResponse<any> => {
      return this.get("/tet-configs/" + tetConfigId + "/budget");
    },

    updateConfig: (
      id: string,
      data: { 
        name?: string;
        total_budget?: number;
       }
    ): ApiResponse<TetConfig> => {
      return this.patch("/tet-configs/" + id, data);    
    },

    updateBudget: (
      id: string,
      data: {
        total_budget: number;
      }): ApiResponse<TetConfig> => {
        return this.patch("/tet-configs/" + id + "/budget", data);
      },
    deleteConfig: (id: string): ApiResponse<void> => {
      return this.delete("/tet-configs/" + id);
    }
  };

  // Category endpoints
  categories = {
    create: (data: {
      name: string;
      icon: string;
      allocated_budget: number;
      tet_config_id: string;
    }): ApiResponse<Category> => {
      return this.post("/categories", data);
    },

    getByTetConfig: (tetConfigId: string): ApiResponse<Category[]> => {
      return this.get("/categories?tet_config_id=" + tetConfigId);
    },

    getById: (id: string): ApiResponse<Category> => {
      return this.get("/categories/" + id);
    },

    update: (
      id: string,
      data: {
        name?: string;
        icon?: string;
        allocated_budget?: number;
      }
    ) : ApiResponse<Category> => {
      return this.patch("/categories/" + id, data);
    },

    delete: (id: string): ApiResponse<string> => {
      return this.delete("/categories/" + id);
    }
    
  }

  // To-do endpoints
  todos = {
    create: (data: {
      title: string;
      priority: "low" | "medium" | "high" | "urgent";
      status: "pending" | "in_progress" | "completed" | "cancelled";
      deadline: Date;
      is_shopping: boolean;
      estimated_price?: number;
      quantity?: number;
      assigned_to?: string;
      tet_config_id: string;
      timeline_phase_id: string;
      category_id: string;
    }): ApiResponse<any> => {
      return this.post("/todo-items", data);
    },

    getAll: (data: {
      tetConfigId: string;
      timelinePhaseId?: string;
    }): ApiResponse<TodoItem[]> => {
      return this.get(
        "/todo-items?tet_config_id=" +
          data.tetConfigId +
          (data.timelinePhaseId
            ? "&timeline_phase_id=" + data.timelinePhaseId
            : ""),
      );
    },

    getById: (id: string): ApiResponse<TodoItem> => {
      return this.get("/todo-items/" + id);
    },

    update: (
      id: string,
      data: {
        title?: string;
        priority?: "low" | "medium" | "high" | "urgent";
        status?: "pending" | "in_progress" | "completed" | "cancelled";
        deadline?: Date;
        is_shopping?: boolean;
        estimated_price?: number;
        quantity?: number;
        assigned_to?: string;
        tet_config_id?: string;
        timeline_phase_id?: string;
        category_id?: string;
      },
    ): ApiResponse<any> => {
      return this.patch("/todo-items/" + id, data);
    },

    delete: (id: string): ApiResponse<any> => {
      return this.delete("/todo-items/" + id);
    },
  };

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // AxiosResponse.data bây giờ là BackendResponse<T>
    const response = await api.get<BackendResponse<T>>(url, config);
    // Trả về response.data.data (chính là T)
    return response.data.data;
  }

  public async post<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await api.post<BackendResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async put<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await api.put<BackendResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async patch<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await api.patch<BackendResponse<T>>(url, data, config);
    return response.data.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<BackendResponse<T>>(url, config);
    return response.data.data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
