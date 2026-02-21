import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient from '../services/apiClient';
import type { User, UserPermissions } from '../types/auth.types';


interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: RegisterData) => Promise<any>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            // Fetch fresh profile from backend
            const userResponse = await apiClient.users.getProfile();
            console.log('User Profile Fetched:', userResponse);

            // Map backend DTO to frontend User interface
            const user: User = {
                id: userResponse.id ?? 0,
                name: userResponse.name || 'User',
                email: userResponse.email || '',
                is_verified: userResponse.is_verified || false,
                image_url: userResponse.image_url || '',
                created_at: userResponse.created_at || null,
                updated_at: userResponse.updated_at || null,
            };   

            setCurrentUser(user);
            setIsAuthenticated(true);   

            // Update localStorage with fresh data
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('token', token); 

        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Optional: if error is 401, maybe logout? 
            // For now, keep existing local state if available, but it might be stale.
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check localStorage for immediate display
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('currentUser');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);               
                setCurrentUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
            }
        }

        // Always try to refresh from server
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);

        try {
            const response : UserPermissions = await apiClient.auth.login({
                email,
                password
            });
            console.log("Đăng nhập thành công:", response);
            console.log("Access Token:", response.accessToken);

            // Save JWT token and user data
            localStorage.setItem('token', response.accessToken);

            const userResponse = await apiClient.users.getProfile();
            console.log('User Profile Fetched:', userResponse);
            
            localStorage.setItem('currentUser', JSON.stringify(userResponse));

            const user: User = {
                id: userResponse.id ?? 0,
                name: userResponse.name || 'User',
                email: userResponse.email || '',
                is_verified: userResponse.is_verified || false,
                image_url: userResponse.image_url || '',
                created_at: userResponse.created_at || null,
                updated_at: userResponse.updated_at || null,
            };   

            setCurrentUser(user);
            setIsAuthenticated(true);
        } catch (error: any) {
            console.error('Đăng nhập thất bại:', error);
            console.error('FULL ERROR OBJECT:', JSON.stringify(error, null, 2));

            // Extract error message from backend response
            let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';

            if (error?.response?.data) {
                let backendMessage = '';
                if (error.response.data.message) {
                    backendMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    backendMessage = error.response.data.error;
                }

                if (backendMessage) {
                    const lowerMessage = backendMessage.toLowerCase();

                    if (lowerMessage.includes('bad credentials')) {
                        errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
                    } else if (lowerMessage.includes('username not found') || lowerMessage.includes('user not found')) {
                        // Security best practice: uses generic message
                        errorMessage = 'Thông tin đăng nhập không đúng. Vui lòng thử lại.';
                    } else if (lowerMessage.includes('account not verified')) {
                        errorMessage = 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực.';
                    } else {
                        errorMessage = backendMessage;
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);

        try {
            // Call logout API to invalidate token on server
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            console.log('Đăng xuất thành công (API)');
        } catch (error) {
            console.error('Đăng xuất thất bại (API):', error);
            // Continue with local logout even if API fails
        } finally {
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');

            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData) => {
        setIsLoading(true);

        try {
            // Call register API
            const response = await apiClient.auth.signup(userData);
            console.log('Đăng ký thành công:', response);

            // Registration successful - user needs to verify email
            return response;
        } catch (error: any) {
            console.error('Đăng ký thất bại:', error);

            // Extract error message
            let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';

            if (error?.response?.data) {
                let backendMessage = '';
                if (error.response.data.message) {
                    backendMessage = error.response.data.message;
                }

                if (backendMessage.toLowerCase().includes('Email already exists')) {
                    errorMessage = 'Email đã được sử dụng. Vui lòng sử dụng email khác.';
                } else if (backendMessage.toLowerCase().includes('username is already in use') ||
                    backendMessage.toLowerCase().includes('username already exists')) {
                    errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
                } else if (backendMessage) {
                    errorMessage = backendMessage;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isLoading,
            currentUser,
            login,
            logout,
            register,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};