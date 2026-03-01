/* Header.tsx */
import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types";
import type { Notification } from "../../types/notification.type";
import { useAppStore } from "../../stores/useAppStore";
import { useAuthContext } from "../../contexts/AuthTypes";
import AuthenticatedActions from "./AuthenticatedActions";
import UnauthenticatedActions from "./UnauthenticatedActions";
import { ConfigModal } from "../ConfigModal";

type NavItem = {
  name: string;
  href: string;
};

export interface ConfigInfo extends TetConfig {
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  warning_level: string;
  categories: string[];
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Tasks", href: "/task" },
  { name: "Calendar", href: "/calendar" },
  { name: "Finance", href: "/finance" },
  { name: "Transactions", href: "/transaction" },
  { name: "Dashboard", href: "/dashboard" },
];

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuthContext();
  const configId = useAppStore((state) => state.configId);
  const queryClient = useQueryClient();

  // 1. FETCH CONFIGS BẰNG USEQUERY (Tự động cập nhật khi invalidate)
  const { data: configs = [] } = useQuery<ConfigInfo[]>({
    queryKey: ["userConfigs"],
    queryFn: async () => {
      const response = await apiClient.tetConfigs.getMyConfigs();
      return response as ConfigInfo[];
    },
    enabled: isAuthenticated, // Chỉ chạy khi đã login
  });

  // 2. FETCH NOTIFICATIONS BẰNG USEQUERY
  const { data: notifications = [], refetch: refetchNotifications } = useQuery<
    Notification[]
  >({
    queryKey: ["notifications"],
    queryFn: () => apiClient.notifications.getAll(),
    enabled: isAuthenticated,
  });

  // State local cho UI
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editConfig, setEditConfig] = useState<ConfigInfo | null>(null);

  // Đồng bộ hóa config đang edit khi id hoặc list thay đổi
  useEffect(() => {
    if (configId && configs.length > 0) {
      setEditConfig(configs.find((c) => c.id === configId) ?? null);
    }
  }, [configId, configs]);

  // Hàm xử lý tạo/sửa config
  const handleSubmit = async (data: {
    year: number;
    name: string;
    total_budget: number;
  }) => {
    try {
      if (isEdit && configId) {
        await apiClient.tetConfigs.updateConfig(configId, data);
        toast.success("Workspace updated!");
      } else {
        await apiClient.tetConfigs.create(data);
        toast.success("New workspace created!");
      }

      // ĐÂY LÀ CHÌA KHÓA: Ép Header load lại data mới mà không cần reload trang
      queryClient.invalidateQueries({ queryKey: ["userConfigs"] });
      setIsOpenModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed. Please try again.");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-accent transition-colors duration-300 ${
        isAuthenticated ? "bg-(--bg)" : "bg-white"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src="/logo.svg"
          alt="Tet Planner Logo"
          className="w-13 h-13 transition-transform duration-300 hover:scale-110"
        />
        <span className="font-bold text-(--text) text-lg ml-2">
          Tet Planner
        </span>
      </Link>

      {/* Navigation */}
      {isAuthenticated && (
        <nav className="flex items-center gap-6 text-sm font-medium">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.href}
              className={({ isActive }) =>
                `relative px-1 py-2 transition-all duration-300 group ${
                  isActive
                    ? "text-(--text) font-semibold"
                    : "text-(--text) opacity-70 hover:opacity-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-(--primary) rounded-full transition-transform duration-300 origin-left ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100 opacity-50"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <AuthenticatedActions
            configs={configs}
            configId={configId}
            setIsRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["userConfigs"] })
            }
            notifications={notifications}
            setNotifications={() => refetchNotifications()}
            currentUser={currentUser}
            logout={logout}
          />
        ) : (
          <UnauthenticatedActions />
        )}
      </div>

      {/* Modal */}
      {isOpenModal && (
        <ConfigModal
          isOpen={isOpenModal}
          setIsOpen={setIsOpenModal}
          isEdit={isEdit}
          editConfig={editConfig}
          onSubmit={handleSubmit}
        />
      )}
    </header>
  );
};

export default Header;
