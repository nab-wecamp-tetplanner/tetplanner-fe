import { Link } from "react-router-dom";
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
  User as Profile,
  LogOut,
  Palette,
  CheckCheck,
  Settings,
  Plus,
  Edit3,
  Trash2,
  FolderKanban,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/notificationService";
import type { Notification } from "../../types/notification.type";
import type { User } from "../../types/auth.types";
import type { ConfigInfo } from "./Header";

import ThemeSelector from "../ThemeSelector/ThemeSelector";
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

  // --- STATES FOR CONFIG MODAL ---
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editConfigData, setEditConfigData] = useState<ConfigInfo | null>(null);

  // --- STATE FOR DELETE MODAL ---
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);

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

  // HANDLER: SAVE (CREATE OR UPDATE)
  const handleSubmitConfig = async (data: {
    name: string;
    year: number;
    total_budget: number;
  }) => {
    try {
      showLoading();
      if (isEditMode && editConfigData?.id) {
        // CALL UPDATE API
        await apiClient.tetConfigs.updateConfig(editConfigData.id, data);
        // toast.success("Plan updated successfully!");
      } else {
        // CALL CREATE API
        const newConfig: any = await apiClient.tetConfigs.create(data);
        const createdId = newConfig?.id || newConfig?.data?.id;
        if (createdId) {
          setConfigId(createdId);
        }
        toast.success("New plan created successfully!");
      }
      setIsRefresh(true);
      setIsConfigModalOpen(false);
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("An error occurred. Please try again!");
    } finally {
      hideLoading();
    }
  };

  // HANDLER: DELETE
  const handleDeleteConfirm = async () => {
    if (!deleteConfigId) return;
    try {
      showLoading();
      await apiClient.tetConfigs.deleteConfig(deleteConfigId);
      // toast.success("Plan deleted successfully!");

      // If the currently selected plan is deleted, reset the selection
      if (configId === deleteConfigId) {
        setConfigId("");
      }
      setIsRefresh(true);
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Cannot delete this plan!");
    } finally {
      setDeleteConfigId(null);
      hideLoading();
    }
  };

  return (
    <>
      {/* Config dropdown */}
      <div className="relative" ref={configRef}>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="group flex items-center gap-3 px-4 py-2 bg-(--primary)/2 border border-(--primary)/10 rounded-xl hover:bg-(--primary)/5 hover:border-(--primary)/30 transition-all duration-300 max-w-[180px] shrink-0"
        >
          {/* Icon Plan nhỏ xinh làm điểm nhấn */}
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-(--bg) border border-(--primary)/10 shadow-sm group-hover:text-(--primary) transition-colors">
            <FolderKanban
              size={14}
              className="opacity-60 group-hover:opacity-100"
            />
          </div>

          {/* Tên Plan: Chặn đứng vụ thụt hàng bằng truncate */}
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="text-[10px] font-normal text-(--primary) opacity-70 tracking-widest leading-none mb-0.5">
              Workspace
            </span>
            <span className="text-[13px] font-bold text-(--text) truncate w-full leading-none">
              {configs.find((c) => c.id === configId)?.name || "Select plan"}
            </span>
          </div>

          <ChevronDown
            size={14}
            className={`opacity-30 transition-transform duration-300 ${showConfig ? "rotate-180" : ""}`}
          />
        </button>

        {showConfig && (
          <div className="absolute right-0 mt-3 w-64 bg-(--bg)/95 backdrop-blur-xl border border-accent rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
            <div className="flex flex-col">
              {/* Header nhỏ gọn */}
              <div className="px-4 py-3 border-b border-accent/40 flex justify-between items-center bg-accent/5">
                <span className="text-[11px] font-bold text-(--text) opacity-40 tracking-tight">
                  Workspaces
                </span>
                <span className="text-[10px] bg-(--primary)/10 text-(--primary) px-1.5 py-0.5 rounded-md font-bold">
                  {configs.length}
                </span>
              </div>
              {/* Danh sách Workspace - Thiết kế dạng Tiles */}
              <div className="p-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                {configs.map((config) => {
                  const isActive = configId === config.id;
                  return (
                    <div
                      key={config.id}
                      className={`group relative flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-(--primary)/10 shadow-sm"
                          : "hover:bg-accent/40"
                      }`}
                    >
                      {/* Nội dung chính: Cố định chiều rộng để không đẩy layout */}
                      <button
                        onClick={() => {
                          setConfigId(config.id);
                          setShowConfig(false);
                        }}
                        className="flex-1 flex items-center gap-3 min-w-0"
                      >
                        {/* Indicator: Vạch màu lề trái siêu mảnh khi Active */}
                        <div
                          className={`w-1 h-5 rounded-full transition-all ${isActive ? "bg-(--primary)" : "bg-transparent"}`}
                        />

                        <span
                          className={`text-[13.5px] truncate transition-colors ${
                            isActive
                              ? "font-bold text-(--text)"
                              : "text-(--text) opacity-70 group-hover:opacity-100"
                          }`}
                        >
                          {config.name}
                        </span>
                      </button>

                      {/* Action Buttons: Hiện ra mượt mà với hiệu ứng trượt nhẹ */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditMode(true);
                            setEditConfigData(config);
                            setIsConfigModalOpen(true);
                            setShowConfig(false);
                          }}
                          className="p-1.5 hover:bg-(--bg) rounded-lg text-(--text) opacity-40 hover:opacity-100 hover:text-(--primary) hover:shadow-sm"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfigId(config.id);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 opacity-40 hover:opacity-100 hover:shadow-sm"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Footer: Phẳng & Thoáng */}
              <div className="p-2 bg-accent/5 border-t border-accent/40">
                {/* Đổi từ button sang Link để điều hướng trang */}
                <Link
                  to="/config-selector"
                  onClick={() => {
                    clearConfig(); // Xóa ID hiện tại để báo hiệu là đang muốn tạo mới/chọn lại
                    setShowConfig(false);
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-(--bg) hover:shadow-md border border-transparent hover:border-accent/60"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-(--primary)/10 text-(--primary) group-hover:bg-(--primary) group-hover:text-white transition-all duration-300 shadow-sm">
                    <Plus size={16} strokeWidth={3} />
                  </div>

                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-[13px] font-bold text-(--text) group-hover:text-(--primary) transition-colors">
                      Go to Selector
                    </span>
                    <span className="text-[10px] text-(--text) opacity-40 font-medium truncate w-full">
                      Manage or create a new plan
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Dropdown */}
      <div className="relative" ref={notificationsRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="group relative p-2 rounded-xl hover:bg-accent/20 transition-all duration-300"
        >
          {/* Dùng chuông có fill màu nhẹ khi có thông báo để nhìn "đắt tiền" hơn */}
          <Bell
            className={`w-5.5 h-5.5 transition-all ${
              unreadCount > 0
                ? "text-(--primary) fill-(--primary)/10"
                : "text-(--text) opacity-40 group-hover:opacity-100"
            }`}
            strokeWidth={2.5}
          />

          {/* BADGE SỐ MINI: Style "Cart-style" đè góc */}
          {unreadCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
              {/* Hiệu ứng Ping phát sáng phía dưới (Optional cho thêm xịn) */}
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></span>

              <div className="relative min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-(--bg) rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[9px] font-black text-white leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            </div>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-3 w-80 bg-(--bg)/95 backdrop-blur-xl border border-accent rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            {/* Header Dropdown */}
            <div className="px-4 py-3.5 border-b border-accent/40 flex justify-between items-center bg-accent/5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-(--text)">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-(--primary)/10 text-(--primary) text-[10px] font-bold rounded-md">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={() =>
                    markAllNotificationsAsRead(notifications, setNotifications)
                  }
                  className="p-1.5 hover:bg-(--bg) rounded-lg text-(--text) opacity-40 hover:opacity-100 hover:text-(--primary) transition-all"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                </button>
              )}
            </div>

            {/* List thông báo */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-1.5">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((n, idx) => (
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
                    className={`group relative flex gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      n.isRead
                        ? "hover:bg-accent/30 opacity-60"
                        : "bg-(--primary)/5 hover:bg-(--primary)/10 shadow-sm"
                    }`}
                  >
                    {/* Indicator chấm tròn cho tin chưa đọc */}
                    {!n.isRead && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-(--primary) rounded-full shadow-[0_0_8px_var(--primary)]" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span
                          className={`text-[13px] truncate pr-2 ${!n.isRead ? "font-bold text-(--text)" : "text-(--text-muted)"}`}
                        >
                          {n.title}
                        </span>
                        {n.created_at && (
                          <span className="text-[9px] font-bold opacity-40 whitespace-nowrap pt-0.5">
                            {formatTimeAgo(n.created_at)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-(--text-muted) line-clamp-2 leading-relaxed">
                        {n.message ||
                          "You have a new update in your workspace."}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 flex flex-col items-center justify-center opacity-30">
                  <Bell size={32} strokeWidth={1} className="mb-2" />
                  <p className="text-xs font-medium">All caught up!</p>
                </div>
              )}
            </div>

            {/* Footer (Tùy chọn) */}
            <div className="p-2 border-t border-accent/40 bg-accent/5">
              <button className="w-full py-2 text-[11px] font-bold text-(--text) opacity-50 hover:opacity-100 transition-all">
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

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
          }, 300);
        }}
      >
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
            {/* Header of menu */}
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

      {/* --- MODAL EDIT & CREATE NEW --- */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        setIsOpen={setIsConfigModalOpen}
        isEdit={isEditMode}
        editConfig={editConfigData}
        onSubmit={handleSubmitConfig}
      />

      {/* --- CONFIRMATION MODAL DELETE --- */}
      {deleteConfigId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-(--bg) border border-accent p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-(--text) mb-2">
              Delete this plan?
            </h3>
            <p className="text-sm text-(--text) opacity-70 mb-6">
              Are you sure you want to delete this plan? All associated data
              will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfigId(null)}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-(--text) hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthenticatedActions;
