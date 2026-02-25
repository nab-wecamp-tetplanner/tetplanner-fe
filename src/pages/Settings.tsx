import { useState } from "react";
import { Settings as Account, User, Palette, Bell, X } from "lucide-react";
import ProfileSection from "../components/Settings/ProfileSection";
import NotificationSection from "../components/Settings/NotificationSection";
import AccountSection from "../components/Settings/AccountSection";

type SettingsTab = "profile" | "appearance" | "notification" | "account";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Account },
    // { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notification", label: "Notification", icon: Bell },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "account":
        return <AccountSection />;
      case "notification":
        return <NotificationSection />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-(--bg) pt-20">
      <div className="flex gap-6 max-w-7xl mx-auto px-4 pb-12">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-(--accent) border-gray-200 pt-24 transition-transform md:relative md:translate-x-0 md:pt-0 rounded-lg shadow-sm border ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between mb-6 md:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as SettingsTab);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-gray-100/50 text-(--text) border-l-4 border-(--primary)"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overlay for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 md:mb-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div className="dark:border-gray-700 bg-(--accent) border-gray-200 pt-24 transition-transform md:relative md:translate-x-0 md:pt-0 rounded-lg shadow-sm border">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
