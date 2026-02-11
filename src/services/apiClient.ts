import api from "./api";
import { type UserPermissions } from "../types/models.types";
import { type AxiosRequestConfig } from "axios";

type ApiResponse<T> = Promise<T>;
export class ApiClient {
  // Auth endpoints
  auth = {
    login: (data: {
      email: string;
      password: string;
      remember_me?: boolean;
    }): ApiResponse<UserPermissions> => {
      return this.post("/auth/login/local", data);
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async post<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(url, config);
    return response.data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
