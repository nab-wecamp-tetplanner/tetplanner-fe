import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout'];

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response, // Return full response for headers access
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (!error.response) {
            return Promise.reject(error);
        }

        const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        if (isAuthEndpoint || originalRequest._retry) {
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;