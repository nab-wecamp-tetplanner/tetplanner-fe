import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types";
import type { Notification } from "../../types/notification.type";
import { useAppStore } from "../../stores/useAppStore";
import { useAuthContext } from "../../contexts/AuthTypes";
import AuthenticatedActions from "./AuthenticatedActions";
import UnauthenticatedActions from "./UnauthenticatedActions";
import { ConfigModal } from "../ConfigModal";
import { toast } from "react-toastify";

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
  // --- GIỮ NGUYÊN LOGIC GỐC ---
  const { isAuthenticated, currentUser, logout } = useAuthContext();
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isEdit] = useState<boolean>(false);
  const [editConfig, setEditConfig] = useState<ConfigInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isRefresh, setIsRefresh] = useState<boolean>(true);

  const configId = useAppStore((state) => state.configId);
  // const setConfigId = useAppStore((state) => state.setConfigId);
  useEffect(() => {
    if (!configId || isAuthenticated || configId == null) return;
    setEditConfig(configs.find((c) => c.id === configId) ?? null);
  }, [configId, isAuthenticated, configs]);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const data = await apiClient.tetConfigs.getMyConfigs();
        setConfigs(data as ConfigInfo[]);
        setIsRefresh(false);
      } catch (error) {
        console.error("Failed to fetch configs", error);
      }
    };
    if (isAuthenticated) fetchConfigs();
  }, [isAuthenticated, isRefresh]);

  useEffect(() => {
    const handleClick = () => {
      // if (
      //   settingsRef.current &&
      //   !settingsRef.current.contains(e.target as Node)
      // ) 
      //   setShowSettings(false);
      // }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient.notifications.getAll();
        setNotifications(response);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
  }, [isAuthenticated]);

  const handleSubmit = async (data: {
    year: number;
    name: string;
    total_budget: number;
  }) => {
    if (!isEdit) {
      try {
        if (!configId) return;
        await apiClient.tetConfigs.updateConfig(configId, data);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await apiClient.tetConfigs.create({
          year: data.year,
          name: data.name,
          total_budget: data.total_budget,
        });
      } catch (error) {
        toast.error("Error in creating config");
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-accent transition-colors duration-300 ${isAuthenticated ? "bg-(--bg)" : "bg-white"}`}
    >
      {/* Logo - Giữ nguyên kích thước w-13 h-13 */}
      <Link to="/" className="flex items-center">
        <img
          src="/logo.svg"
          alt="Tet Planner Logo"
          className="w-13 h-13 transition-transform duration-300 hover:scale-110"
        />
        <span className="font-bold text-text-main text-lg transition-colors duration-300">
          Tet Planner
        </span>
      </Link>

      {/* Navigation - Đã đổi từ ô vuông sang gạch chân sát chữ */}
      {isAuthenticated && (
        <nav className="flex items-center gap-6 text-sm font-medium">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.href}
              className={({ isActive }) =>
                `relative px-1 py-2 transition-all duration-300 group ${
                  isActive
                    ? "text-(--text-heading) font-semibold"
                    : "text-(--text-heading) opacity-70 hover:opacity-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.name}
                  {/* Dấu gạch sát chân chữ (bottom-0), chỉ dài bằng chữ nội dung */}
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

      {/* Auth Actions & Profile */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <AuthenticatedActions
            configs={configs}
            configId={configId}
            // setConfigId={setConfigId}
            setIsRefresh={setIsRefresh}
            notifications={notifications}
            setNotifications={setNotifications}
            currentUser={currentUser} 
            logout={logout}
          />
        ) : (
          <UnauthenticatedActions />
        )}
      </div>

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
