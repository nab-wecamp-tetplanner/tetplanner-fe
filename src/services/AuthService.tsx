import type { UserPermissions } from "../types/auth.types";
import apiClient from "./apiClient";

class AuthService {
    async login(email: string, password: string): Promise<UserPermissions> {
        const loginCredentials = {
            email: email,
            password: password
        }
        return await apiClient.auth.login(loginCredentials);
    }

    async logout(): Promise<void> {
        this.clearToken();
    }

    clearToken(): void {
        localStorage.removeItem('token');
    }

    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        return !!token;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}

export const authService = new AuthService();