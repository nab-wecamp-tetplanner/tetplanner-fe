import { Link } from "react-router-dom"; // Thêm useNavigate
import {
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  User as Profile,
  LogOut,
  Palette,
  CheckCheck,
  Settings,
  Plus,
} from "lucide-react";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";
import type { Notification } from "../../types/notification.type";
import type { User } from "../../types/auth.types";
import type { ConfigInfo } from "./Header";

import ThemeSelector from "../ThemeSelector/ThemeSelector";
// TODO: Sửa lại đường dẫn import ConfigModal cho đúng với vị trí file của bạn
import { ConfigModal } from "../ConfigModal";
import { useLoading } from "../../contexts/LoadingContext";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../stores/useAppStore";

interface AuthenticatedActionsProps {
  configs: ConfigInfo[];
  configId: string | null;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
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
  setIsRefresh,
  notifications,
  setNotifications,
  currentUser,
  logout,
}: AuthenticatedActionsProps) => {
  const [showConfig, setShowConfig] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const setConfigId = useAppStore((state) => state.setConfigId);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const configRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  const clearConfig = useAppStore((state) => state.clearConfig);

  // Ref để xử lý delay khi hover giống Nav.jsx
  const accountTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateConfig = async (data: {
    name: string;
    year: number;
    total_budget: number;
  }) => {
    try {
      showLoading();
      const newConfig: any = await apiClient.tetConfigs.create(data);
      const createdId = newConfig.id;
      if (createdId) {
        setConfigId(createdId);
      }
      setIsRefresh(true);
      setIsConfigModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi tạo config:", error);
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      {/* Config dropdown - Giữ nguyên click */}
      <div className="relative" ref={configRef}>
        <button
          onClick={() => {
            setShowNotifications(false);
            setShowAccount(false);
            setShowConfig(!showConfig);
          }}
          className="w-fit max-w-40 flex items-center gap-2 px-3 py-2 text-sm font-medium text-(--text) border border-accent rounded-lg hover:bg-(--primary)/10 transition-colors"
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
          <div className="absolute right-0 mt-2 w-64 bg-(--bg) border border-accent rounded-[1.5rem] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">
                Your Workspaces
              </p>

              {/* Danh sách các Config hiện có */}
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {configs.map((config) => (
                  <button
                    key={config.id}
                    onClick={() => {
                      setConfigId(config.id);
                      setShowConfig(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all ${
                      configId === config.id
                        ? "bg-(--primary)/10 text-(--text) font-bold"
                        : "text-(--text) opacity-70 hover:opacity-100 hover:bg-accent/30"
                    }`}
                  >
                    {config.name}
                  </button>
                ))}
              </div>

              {/* Nút chốt hạ của Nhi nằm ở đây */}
              <div className="mt-2 pt-2 border-t border-accent/50">
                <button
                  onClick={() => {
                    setShowConfig(false);
                    setIsConfigModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-(--text) hover:bg-(--primary)/10 rounded-xl transition-all"
                >
                  <Plus size={14} />
                  Add new plan
                </button>

                <Link
                  to="/config-selector"
                  onClick={() => {
                    clearConfig(); // Xoá ID để ép quay về trang chọn
                    setShowConfig(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full mt-1 py-2.5 text-[10px] font-black text-blue-500 uppercase hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Settings size={12} className="animate-spin-slow" />
                  Manage Workspaces
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Dropdown - Giữ nguyên click */}
      <div className="relative" ref={notificationsRef}>
        <button
          onClick={() => {
            setShowConfig(false);
            setShowAccount(false);
            setShowNotifications(!showNotifications);
          }}
          className="text-(--text) hover:text-(--primary) transition-colors relative translate-y-1 p-1"
        >
          <Bell className="text-(--text) w-5 h-5" fill="currentColor" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-(--bg)"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-(--bg) border border-accent rounded-xl shadow-lg z-50">
            <div className="px-4 py-3 border-b border-accent flex justify-between items-center">
              <span className="font-semibold text-(--text)">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() =>
                    markAllNotificationsAsRead(notifications, setNotifications)
                  }
                  className="text-xs text-(--text) hover:opacity-80 transition-opacity"
                >
                  <CheckCheck size={16} className="inline-block mr-1" />
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {notifications.slice(0, 15).map((n, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (!n.isRead)
                      markNotificationAsRead(
                        n.id,
                        notifications,
                        setNotifications,
                      );
                  }}
                  className={`px-4 py-2.5 cursor-pointer transition-colors text-sm rounded-md ${
                    n.isRead
                      ? "bg-transparent text-(--text) opacity-60 hover:bg-(--primary)/10"
                      : "bg-(--primary)/10 font-semibold text-(--text) hover:bg-(--primary)/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span>{n.title}</span>
                    {n.created_at && (
                      <span className="text-[10px] opacity-70 uppercase tracking-tighter">
                        {formatTimeAgo(n.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length > 15 && (
                <button className="w-full px-4 py-2.5 text-xs text-(--primary) hover:bg-(--primary)/10 rounded-md transition-colors">
                  Load More
                </button>
              )}
              {notifications.length === 0 && (
                <div className="p-6 text-center text-(--text) opacity-70">
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Account Dropdown - Chế độ HOVER XỊN */}
      <div
        className="relative"
        ref={accountRef}
        onMouseEnter={() => {
          if (accountTimeoutRef.current)
            clearTimeout(accountTimeoutRef.current);
          setShowAccount(true);
          setShowConfig(false);
          setShowNotifications(false);
        }}
        onMouseLeave={() => {
          accountTimeoutRef.current = setTimeout(() => {
            setShowAccount(false);
          }, 300); // 300ms delay để rê chuột mượt mà
        }}
      >
        {/* Invisible Bridge: Giúp rê chuột từ avatar xuống menu không bị mất hover */}
        <div className="absolute w-full h-4 bottom-0 left-0 translate-y-full z-10"></div>

        <button className="flex items-center gap-3 py-1 px-2 rounded-full hover:bg-accent/30 transition-all duration-300">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-(--primary) text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-transparent group-hover:ring-(--primary)/30 transition-all">
            {currentUser?.image_url ? (
              <img
                src={currentUser.image_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              currentUser?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-(--text) leading-tight">
              {currentUser?.name}
            </p>
            <p className="text-[10px] text-(--text) opacity-50">Member</p>
          </div>
          <ChevronDown
            size={14}
            className={`opacity-50 transition-transform duration-300 ${showAccount ? "rotate-180" : ""}`}
          />
        </button>

        {showAccount && (
          <div className="absolute right-0 mt-2 w-64 bg-(--bg)/95 backdrop-blur-xl border border-accent rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
            {/* Header của menu */}
            <div className="p-4 bg-accent/20 border-b border-accent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-white">
                  {currentUser?.image_url ? (
                    <img
                      src={currentUser.image_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-(--primary) to-orange-400 text-white flex items-center justify-center font-bold">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-(--text) truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-(--text) opacity-50 truncate">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1.5">
              <Link
                to="/settings"
                onClick={() => setShowAccount(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-(--text) hover:bg-(--primary)/10 rounded-xl transition-all group"
              >
                <span className="p-2 bg-accent/50 rounded-lg group-hover:bg-white transition-colors">
                  <Profile size={16} className="text-(--primary)" />
                </span>
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setShowAccount(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-(--text) hover:bg-(--primary)/10 rounded-xl transition-all group"
              >
                <span className="p-2 bg-accent/50 rounded-lg group-hover:bg-white transition-colors">
                  <Settings size={16} className="text-(--primary)" />
                </span>
                Settings
              </Link>

              <div className="my-1.5 border-t border-accent mx-2"></div>

              <div className="px-3 py-2">
                <div className="flex items-center gap-3 text-xs font-bold text-(--text) opacity-40 uppercase tracking-widest mb-2 px-1">
                  <Palette size={14} />
                  Appearance
                </div>
                <ThemeSelector />
              </div>

              <div className="my-1.5 border-t border-accent mx-2"></div>

              <button
                onClick={() => {
                  clearConfig();
                  logout();
                  setShowAccount(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all group"
              >
                <span className="p-2 bg-red-50 rounded-lg group-hover:bg-white transition-colors">
                  <LogOut size={16} />
                </span>
                <span className="font-semibold">Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfigModal
        isOpen={isConfigModalOpen}
        setIsOpen={setIsConfigModalOpen}
        onSubmit={handleCreateConfig}
      />
    </>
  );
};

export default AuthenticatedActions;
