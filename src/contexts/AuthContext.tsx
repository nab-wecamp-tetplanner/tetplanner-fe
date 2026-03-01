import { useState, useEffect, type ReactNode } from "react";
import apiClient from "../services/apiClient";
import type { User, UserPermissions } from "../types/auth.types";
import { useAppStore } from "../stores/useAppStore";

import { AuthContext } from "./AuthTypes";
import type { RegisterData, RegisterResponse } from "./AuthTypes";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const userResponse = await apiClient.users.getProfile();

      const user: User = {
        id: userResponse.id ?? 0,
        name: userResponse.name || "User",
        email: userResponse.email || "",
        is_verified: userResponse.is_verified || false,
        image_url: userResponse.image_url || "",
        created_at: userResponse.created_at || "",
        updated_at: userResponse.updated_at || "",
      };

      setCurrentUser(user);
      setIsAuthenticated(true);
      // Lưu bản map chuẩn vào localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");
    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.clear();
      }
    }
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: UserPermissions = await apiClient.auth.login({
        email,
        password,
      });
      localStorage.setItem("token", response.accessToken);
      await checkAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Dọn dẹp storage
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      useAppStore.getState().clearConfig();

      // Reset state
      setCurrentUser(null);
      setIsAuthenticated(false);

      // ĐIỀU HƯỚNG VỀ HOME
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    userData: RegisterData,
  ): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      // Gọi API đăng ký
      const response = await apiClient.auth.signup(userData);

      // Trả về Object để khớp với Interface RegisterResponse
      return {
        message:
          typeof response === "string" ? response : "Registration successful",
        success: true,
      };
    } finally {
      // Luôn tắt loader dù thành công hay lỗi
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        currentUser,
        setCurrentUser, // Rất quan trọng để sync Header
        login,
        logout,
        register,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
