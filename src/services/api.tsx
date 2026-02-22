import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from 'react-toastify'; 
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
}

const AUTH_ENDPOINTS = ['/auth/login', '/auth/signup', '/auth/refresh', '/auth/logout'];

const api = axios.create({
    baseURL: "https://tetplanner-be.onrender.com",
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

// Response interceptor - Global Error Handler
api.interceptors.response.use(
    (response) => response, 
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Nếu mất kết nối mạng hoặc server sập hoàn toàn
        if (!error.response) {
            toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!");
            return Promise.reject(error);
        }

        const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint =>
            originalRequest.url?.includes(endpoint)
        );

        const status = error.response.status;
        // Lấy message từ backend trả về (tuỳ chỉnh lại theo đúng key mà backend của bạn dùng)
        const data = error.response.data as any;
        const serverMessage = data?.message || "Đã có lỗi xảy ra";

        // Bỏ qua việc bắn toast cho các endpoint auth
        if (!isAuthEndpoint) {
            switch (status) {
                case 400:
                    toast.warning(serverMessage); 
                    break;
                case 401:
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                    // Gọi hàm logout() hoặc redirect về /login
                    break;
                case 403:
                    toast.error("Bạn không có quyền thực hiện thao tác này!");
                    break;
                case 404:
                    toast.info("Không tìm thấy dữ liệu yêu cầu.");
                    break;
                case 500:
                    toast.error("Lỗi hệ thống! Vui lòng thử lại sau.");
                    break;
                default:
                    toast.error(serverMessage);
            }
        }

        if (isAuthEndpoint || originalRequest._retry) {
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;