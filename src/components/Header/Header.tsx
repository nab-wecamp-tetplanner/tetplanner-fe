/* Header.tsx */
import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
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

  // 1. FETCH CONFIGS
  const { data: configs = [] } = useQuery<ConfigInfo[]>({
    queryKey: ["userConfigs"],
    queryFn: async () => {
      const response = await apiClient.tetConfigs.getMyConfigs();
      return response as ConfigInfo[];
    },
    enabled: isAuthenticated,
  });

  // 2. FETCH NOTIFICATIONS
  const { data: notifications = [], refetch: refetchNotifications } = useQuery<
    Notification[]
  >({
    queryKey: ["notifications"],
    queryFn: () => apiClient.notifications.getAll(),
    enabled: isAuthenticated,
  });

  // State local cho UI - CHỈ giữ lại isOpenModal
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  // 1. Derived State: Tự động tính toán config đang edit dựa trên list có sẵn
  // Không dùng State, không dùng useEffect -> Hết lỗi Cascading Render
  const editConfig = configs.find((c) => c.id === configId) ?? null;

  // 2. Xử lý isEdit: Nếu Nhi không có nút bấm "Edit" nào ở Header này,
  // hãy xoá luôn state isEdit. handleSubmit có thể check dựa trên editConfig.
  const isEdit = !!editConfig;

  const handleSubmit = async (data: {
    year: number;
    name: string;
    total_budget: number;
  }) => {
    try {
      // Dùng editConfig thay vì check state isEdit
      if (editConfig) {
        await apiClient.tetConfigs.updateConfig(editConfig.id, data);
        toast.success("Workspace updated!");
      } else {
        await apiClient.tetConfigs.create(data);
        toast.success("New workspace created!");
      }

      queryClient.invalidateQueries({ queryKey: ["userConfigs"] });
      setIsOpenModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed.");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-accent transition-colors duration-300 ${
        isAuthenticated ? "bg-(--bg)" : "bg-white"
      }`}
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center group shrink-0">
        <img
          src="/logo.svg"
          alt="Logo"
          className="w-11 h-11 transition-transform group-hover:scale-105"
        />
        <div className="relative">
          <span
            className="absolute -top-1 -left-1 text-5xl text-amber-900/10 blur-[2px] italic select-none"
            style={{ fontFamily: "'Pinyon Script', cursive" }}
          >
            Tet
          </span>
          <span
            className="relative text-5xl text-amber-900"
            style={{ fontFamily: "'Pinyon Script', cursive" }}
          >
            Tet
          </span>
        </div>
        <span className="ml-2 mt-4 text-xs font-bold tracking-[0.3em] uppercase text-amber-900/40">
          Planner
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
