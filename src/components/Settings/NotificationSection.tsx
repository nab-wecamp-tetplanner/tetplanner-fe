import { useState } from "react";
import { Save, Bell } from "lucide-react";

const NotificationSection = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    desktopNotifications: true,
    soundNotifications: false,
    showNotificationBadge: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Bell size={20} className="text-(--primary)" /> Notifications
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Configure how you receive alerts and updates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          {
            key: "emailNotifications",
            label: "Email Notifications",
            desc: "Via your registered email",
          },
          {
            key: "taskReminders",
            label: "Task Reminders",
            desc: "Alerts for upcoming deadlines",
          },
          {
            key: "weeklyDigest",
            label: "Weekly Digest",
            desc: "Summary of your progress",
          },
          {
            key: "desktopNotifications",
            label: "Desktop Notifications",
            desc: "Browser push notifications",
          },
          {
            key: "soundNotifications",
            label: "Sound Notifications",
            desc: "Play sounds for alerts",
          },
          {
            key: "showNotificationBadge",
            label: "Notification Badge",
            desc: "Show red dot on app icon",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl shadow-sm hover:border-stone-200 transition-all group"
          >
            <div className="flex-1 pr-4">
              <h3 className="text-sm font-bold text-stone-800 group-hover:text-(--primary) transition-colors">
                {item.label}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
            <button
              onClick={() => handleToggle(item.key as keyof typeof settings)}
              disabled={!isEditing}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
                settings[item.key as keyof typeof settings]
                  ? "bg-(--primary)"
                  : "bg-stone-200"
              } ${!isEditing ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${
                  settings[item.key as keyof typeof settings]
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-stone-50">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-5 py-2 text-xs font-bold text-stone-400"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-6 py-2 bg-(--primary) text-white rounded-lg text-xs font-bold shadow-md hover:opacity-90 transition-all"
            >
              <Save size={16} /> Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-black transition-all"
          >
            Edit Settings
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationSection;
