import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  User as Profile,
  Settings,
  LogOut,
  Palette,
} from "lucide-react";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";
import type { Notification } from "../../types/notification.type";
import type { User } from "../../types/auth.types";
import type { ConfigInfo } from "./Header";

import ThemeSelector from "../ThemeSelector/ThemeSelector";

interface AuthenticatedActionsProps {
  configs: ConfigInfo[];
  configId: string | null;
  setConfigId: (id: string) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: User | null;
  logout: () => void;
}

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

const AuthenticatedActions = ({
  configs,
  configId,
  setConfigId,
  notifications,
  setNotifications,
  currentUser,
  logout,
}: AuthenticatedActionsProps) => {
  const [showConfig, setShowConfig] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const configRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        configRef.current &&
        !configRef.current.contains(target) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(target) &&
        accountRef.current &&
        !accountRef.current.contains(target)
      ) {
        setShowConfig(false);
        setShowNotifications(false);
        setShowAccount(false);
      }
    };

    if (showConfig || showNotifications || showAccount) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showConfig, showNotifications, showAccount]);

  return (
    <>
      {/* Config dropdown */}
      <div className="relative" ref={configRef}>
        <button
          onClick={() => {
            setShowNotifications(false);
            setShowAccount(false);
            setShowConfig(!showConfig);
          }}
          className="w-fit max-w-40 flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-main border border-accent rounded-lg hover:bg-(--primary)/10 transition-colors"
        >
          <span className="flex-1 truncate">
            {configs.find((c) => c.id === configId)?.name || "Select your plan"}
          </span>
          <ChevronDown
            size={16}
            className={showConfig ? "hidden" : "shrink-0"}
          />
          <ChevronUp size={16} className={showConfig ? "shrink-0" : "hidden"} />
        </button>

        {showConfig && (
          <div className="absolute right-0 mt-2 w-56 bg-(--bg) border border-accent rounded-lg shadow-lg z-50">
            <div className="px-2.5 py-3">
              {configs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => {
                    setConfigId(config.id);
                    setShowConfig(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-md transition-colors ${
                    configId === config.id
                      ? "bg-(--primary)/10 text-text-main font-semibold"
                      : "text-text-main hover:bg-(--primary)/10 hover:text-text-main/80"
                  }`}
                >
                  {config.name}
                </button>
              ))}
              <button className="w-full text-left px-4 py-2.5 text-sm text-text-main hover:bg-(--primary)/10 rounded-md transition-colors font-medium border-t border-accent mt-2 pt-2">
                + Add new plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Dropdown */}
      <div className="relative" ref={notificationsRef}>
        <button
          onClick={() => {
            setShowConfig(false);
            setShowAccount(false);
            setShowNotifications(!showNotifications);
          }}
          className="text-text-main hover:text-(--primary) transition-colors relative translate-y-1"
        >
          <Bell
            className="w-5 h-5"
            fill={showNotifications ? "currentColor" : undefined}
          />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-(--bg) border border-accent rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-accent flex justify-between items-center">
              <span className="font-semibold text-text-main">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() =>
                    markAllNotificationsAsRead(notifications, setNotifications)
                  }
                  className="text-xs text-primary hover:opacity-80 transition-opacity"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.slice(0, 15).map((n, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (!n.isRead) {
                      markNotificationAsRead(
                        n.id,
                        notifications,
                        setNotifications,
                      );
                    }
                  }}
                  className={`p-3 cursor-pointer transition-colors text-sm ${
                    n.isRead
                      ? "bg-transparent text-text-main opacity-60 hover:bg-(--primary)/10"
                      : "bg-accent font-semibold text-text-main hover:bg-(--primary)/10/80"
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
              {notifications.length > 15 && (
                <button className="w-full p-2 text-xs text-primary hover:bg-(--primary)/10 rounded">
                  Load More
                </button>
              )}
              {notifications.length === 0 && (
                <div className="p-8 text-center text-text-main opacity-70">
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Account dropdown */}
      <div className="flex items-center gap-3 transition-colors duration-300">
        <div className="relative" ref={accountRef}>
          <button
            onClick={() => {
              setShowConfig(false);
              setShowNotifications(false);
              setShowAccount(!showAccount);
            }}
            className="flex items-center gap-3 hover:opacity-85"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-bg-main flex items-center justify-center font-semibold  transition-opacity cursor-pointer">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-semibold text-text-main">
              {currentUser?.name}
            </p>
          </button>

          {showAccount && (
            <div className="absolute right-0 mt-2 w-64 bg-(--bg) border border-accent rounded-xl shadow-lg z-50">
              <div className="p-4 border-b border-accent">
                <p className="text-sm font-semibold text-text-main">
                  {currentUser?.name}
                </p>
                <p className="text-xs text-text-main opacity-60">
                  {currentUser?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div>
                <Link
                  to="/settings"
                  onClick={() => setShowAccount(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-main hover:bg-(--primary)/10 transition-colors flex items-center gap-3"
                >
                  <Profile size={16} />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowAccount(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-main hover:bg-(--primary)/10 transition-colors flex items-center gap-3"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <div className="w-full px-4 flex flex-col gap-3 border-y border-accent py-3">
                  <div className="text-left text-sm text-text-main flex items-center gap-3">
                    <Palette size={16} />
                    Theme
                  </div>
                  <ThemeSelector />
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowAccount(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-main rounded-b-xl hover:bg-(--primary)/10 transition-colors flex items-center gap-3"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthenticatedActions;
