// src/contexts/AuthTypes.ts
import React, { createContext, useContext } from "react";
import type { User } from "../types/auth.types";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Thêm Interface này để thay thế cho 'any'
export interface RegisterResponse {
  message?: string;
  success?: boolean;
  user?: User;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // SỬA TẠI ĐÂY: Thay Promise<any> bằng Promise<RegisterResponse>
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
