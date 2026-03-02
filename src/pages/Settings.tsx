import { useState, useEffect } from "react";
import { Settings as Account, User, Bell, X } from "lucide-react";
import apiClient from "../services/apiClient";
import type { User as UserType } from "../types/auth.types";
import ProfileSection from "../components/Settings/ProfileSection";
import NotificationSection from "../components/Settings/NotificationSection";
import AccountSection from "../components/Settings/AccountSection";

type SettingsTab = "profile" | "account" | "notification";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.users.getProfile();
        setUserData(response);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Account },
    { id: "notification", label: "Notification", icon: Bell },
  ] as const;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-8 flex flex-col justify-center items-center space-y-4">
          <div className="w-8 h-8 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
          <div className="text-stone-400 text-sm font-medium animate-pulse">
            Loading profile...
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 flex flex-col justify-center items-center space-y-4">
          <div className="text-red-600 text-sm font-bold">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-(--primary) text-white rounded-lg text-xs font-bold"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!userData) {
      return null;
    }

    switch (activeTab) {
      case "profile":
        return <ProfileSection userData={userData} setUserData={setUserData} />;
      case "account":
        return <AccountSection userData={userData} setUserData={setUserData} />;
      case "notification":
        return <NotificationSection />;
      default:
        return null;
    }
  };

  return (
    // Nền ngoài dùng bg-(--bg) nhưng thêm hiệu ứng gradient mờ để tạo chiều sâu
    <div className="min-h-screen bg-(--bg) relative overflow-hidden pt-10 pb-16 transition-all duration-500">
      {/* Decorative Blobs - Giúp trang web bớt trống trải và "basic" */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-(--primary)/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-400/10 blur-[100px] rounded-full" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row bg-white/70 backdrop-blur-xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden min-h-162.5">
          {/* Sidebar: Thiết kế mỏng, trong suốt, icon rực rỡ */}
          <aside
            className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-2xl border-r border-white/20 pt-24 transition-transform 
            md:relative md:translate-x-0 md:pt-0 md:w-56 md:bg-transparent md:border-stone-100/50
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <div className="p-6 md:p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-8 opacity-70">
                Configuration
              </p>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 768) setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 group
                        ${
                          isActive
                            ? "bg-white text-(--primary) shadow-xl shadow-stone-200/50 ring-1 ring-stone-100"
                            : "text-stone-500 hover:text-stone-900 hover:bg-white/50"
                        }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-(--primary)/10" : "bg-stone-100 group-hover:bg-white"}`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={
                            isActive ? "text-(--primary)" : "opacity-60"
                          }
                        />
                      </div>
                      <span
                        className={isActive ? "font-bold" : "font-semibold"}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-white/40 relative">
            {/* Mobile Header Toggle */}
            <div className="md:hidden flex items-center justify-between p-5 bg-white/50 backdrop-blur-md border-b border-white/20">
              <span className="font-bold text-stone-800 uppercase tracking-widest text-xs">
                Settings
              </span>
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 bg-white rounded-xl shadow-sm text-(--primary)"
              >
                <X size={20} className="rotate-45" />
              </button>
            </div>

            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="animate-in fade-in slide-in-from-right-4 duration-700 h-full">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-md z-30 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Settings;
