import { NavLink, Link } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import ThemeSelector from "../ThemeSelector/ThemeSelector";
import { useEffect, useRef, useState } from "react";
import apiClient from "../../services/apiClient";
import type { TetConfig } from "../../types/tetConfig.types";
import { useAppStore } from "../../stores/useAppStore"; //
import InvitationBell from "../InvitationBell/InvitationBell";
import { ChevronDown, ChevronUp } from "lucide-react";

type NavItem = {
  name: string;
  href: string;
};

type Notification = {
  id: string;
  title: string;
  isRead: boolean;
  created_at?: string;
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export interface ConfigInfo extends TetConfig {
  total_budget: number;
  used_budget: number;
  remaining_budget: number;
  warning_level: string;
  categories: string[];
}
const navItems: NavItem[] = [
  { name: "Homepage", href: "/" },
  { name: "Task management", href: "/task" },
  { name: "Calendar", href: "/calendar" },
  { name: "Finance", href: "/finance" },
  { name: "Transactions", href: "/transaction" },
  { name: "Dashboard", href: "/dashboard" },
];

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuthContext();
  const [, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);

  // Logic Synchronization with Store
  const configId = useAppStore((state) => state.configId); //
  const setConfigId = useAppStore((state) => state.setConfigId); //

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, ] = useState(false);

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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-bg-main border-b border-accent transition-colors duration-300 relative">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <img
          src="src/components/Header/logo.svg"
          alt="Tết Planner Logo"
          className="w-13 h-13 transition-transform duration-300 hover:scale-110"
        />
        <span className="font-bold text-text-main text-lg transition-colors duration-300">
          Tết Planner
        </span>
      </Link>

      {/* Navigation isAuthenticated*/}
      {isAuthenticated && (
        <nav className="flex items-center gap-8 text-sm font-medium">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.href}
              className={({ isActive }) =>
                isActive
                  ? "bg-(--accent) text-(--text-heading) p-2.5 rounded-lg transition-all duration-300 font-bold"
                  : "text-(--text-heading) opacity-70 p-2.5 rounded-lg hover:opacity-100 hover:text-(--primary) transition-all duration-300"
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
          <>
            <div className="relative group">
              <button className="w-48 flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-main border border-accent rounded-lg hover:bg-accent transition-colors">
                <span className="flex-1 truncate">
                  {configs.find((c) => c.id === configId)?.name ||
                    "Select Config"}
                </span>
                <ChevronDown
                  size={16}
                  className="group-hover:hidden shrink-0"
                />
                <ChevronUp
                  size={16}
                  className="hidden group-hover:inline shrink-0"
                />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-(--bg) border border-accent rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-2">
                  {configs.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => setConfigId(config.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm rounded transition-colors ${
                        configId === config.id
                          ? "bg-accent text-text-main font-semibold"
                          : "text-text-main hover:bg-accent"
                      }`}
                    >
                      {config.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
            </div>
            <div className="relative">
              {/* Invitation Notifications */}
              <InvitationBell />

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-(--bg) border border-accent rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-accent flex justify-between items-center">
                    <span className="font-semibold text-text-main">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            await apiClient.notifications.markAllRead();
                            setNotifications(
                              notifications.map((n) => ({
                                ...n,
                                isRead: true,
                              })),
                            );
                          } catch (error) {
                            console.error("Failed to mark all as read:", error);
                          }
                        }}
                        className="text-xs text-primary hover:opacity-80 transition-opacity"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 10).map((n, idx) => (
                      <div
                        key={idx}
                        onClick={async () => {
                          if (!n.isRead) {
                            try {
                              await apiClient.notifications.markAsRead(n.id);
                              setNotifications(
                                notifications.map((notif) =>
                                  notif.id === n.id
                                    ? { ...notif, isRead: true }
                                    : notif,
                                ),
                              );
                            } catch (error) {
                              console.error("Failed to mark as read:", error);
                            }
                          }
                        }}
                        className={`p-3 cursor-pointer transition-colors text-sm ${
                          n.isRead
                            ? "bg-transparent text-text-main opacity-60 hover:bg-accent"
                            : "bg-accent font-semibold text-text-main hover:bg-accent/80"
                        } mb-2 rounded`}
                      >
                        <div className="flex justify-between items-start">
                          <span>{n.title}</span>
                          {n.created_at && (
                            <span className="text-xs opacity-70">
                              {formatTimeAgo(n.created_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {notifications.length > 10 && (
                      <button className="w-full p-2 text-xs text-primary hover:bg-accent rounded">
                        Load More
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300 relative"
              ref={settingsRef}
            ></div>

            <div className="flex items-center gap-3 ml-2 transition-colors duration-300">
              <div className="relative group">
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-primary text-bg-main flex items-center justify-center font-semibold hover:opacity-80 transition-opacity">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </button>
                  <p className="text-sm font-semibold text-text-main">
                    {currentUser?.name}
                  </p>
                </div>

                <div className="absolute right-0 mt-2 w-72 bg-(--bg) border border-accent rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4 border-b border-accent">
                    <p className="text-sm font-semibold text-text-main">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-text-main opacity-60">
                      {currentUser?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="">
                    <Link
                      to="/settings"
                      className="w-full text-left px-4 py-2.5 text-sm text-text-main hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      <span>👤</span>
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="w-full text-left px-4 py-2.5 text-sm text-text-main hover:bg-accent transition-colors flex items-center gap-3"
                    >
                      <span>⚙️</span>
                      Settings
                    </Link>
                    <ThemeSelector />

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-sm text-text-main rounded-b-xl hover:bg-accent transition-colors  flex items-center gap-3"
                    >
                      <span>🚪</span>
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-accent transition-colors duration-300">
            <Link
              to="/login"
              className="text-text-main hover:text-primary font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary text-bg-main px-4 py-2 rounded-md hover:opacity-90 transition-all duration-300"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
