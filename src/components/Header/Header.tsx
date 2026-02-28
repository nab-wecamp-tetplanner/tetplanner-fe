import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types";
import type { Notification } from "../../types/notification.type";
import { useAuthContext } from "../../contexts/AuthContext";
import { useAppStore } from "../../stores/useAppStore";

import AuthenticatedActions from "./AuthenticatedActions";
import UnauthenticatedActions from "./UnauthenticatedActions";

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
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Logic Synchronization with Store
  const configId = useAppStore((state) => state.configId);
  const setConfigId = useAppStore((state) => state.setConfigId);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const data = await apiClient.tetConfigs.getMyConfigs();
        setConfigs(data as ConfigInfo[]);
      } catch (error) {
        console.error("Failed to fetch configs", error);
      }
    };
    if (isAuthenticated) fetchConfigs();
  }, [isAuthenticated]);

  // Fetch notifications on mount
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
  }, []);

  return (
    <header
      className={`flex items-center justify-between px-8 py-4 border-b border-accent transition-colors duration-300 relative z-10 ${isAuthenticated ? "bg-(--bg)" : "bg-white"}`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src="/logo.svg"
          alt="Tết Planner Logo"
          className="w-13 h-13 transition-transform duration-300 hover:scale-110"
        />
        <span className="font-bold text-text-main text-lg transition-colors duration-300">
          Tết Planner
        </span>
      </Link>

      {/* Navigation isAuthenticated*/}
      {isAuthenticated && (
        <nav className="flex items-center gap-6 text-sm font-medium">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.href}
              className={({ isActive }) =>
                isActive
                  ? "bg-(--primary)/10 text-(--text-heading) px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold"
                  : "text-(--text-heading) opacity-70 px-4 py-2.5 rounded-lg hover:opacity-100 hover:text-(--primary)/50 transition-all duration-300"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      )}

      {/* Auth Actions & Profile */}
      <div className="flex items-center gap-4 text-sm">
        {isAuthenticated ? (
          <AuthenticatedActions
            configs={configs}
            configId={configId}
            setConfigId={setConfigId}
            notifications={notifications}
            setNotifications={setNotifications}
            currentUser={currentUser}
            logout={logout}
          />
        ) : (
          <UnauthenticatedActions />
        )}
      </div>
    </header>
  );
};
export default Header;
