import { useState } from 'react';
import { Save } from 'lucide-react';

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
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveChanges = () => {
    console.log('Saving notification settings:', settings);
    setIsEditing(false);
  };

  const notificationOptions = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
    },
    {
      key: 'taskReminders',
      label: 'Task Reminders',
      description: 'Get reminded about upcoming tasks',
    },
    {
      key: 'weeklyDigest',
      label: 'Weekly Digest',
      description: 'Receive a weekly summary of your activities',
    },
    {
      key: 'desktopNotifications',
      label: 'Desktop Notifications',
      description: 'Show notifications on your desktop',
    },
    {
      key: 'soundNotifications',
      label: 'Sound Notifications',
      description: 'Play sound when you receive notifications',
    },
    {
      key: 'showNotificationBadge',
      label: 'Notification Badge',
      description: 'Show notification badge on app icon',
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Notifications
      </h2>

      <div className="space-y-4">
        {notificationOptions.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
            <button
              onClick={() => handleToggle(key as keyof typeof settings)}
              disabled={!isEditing}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                settings[key as keyof typeof settings]
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${!isEditing ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                  settings[key as keyof typeof settings]
                    ? 'translate-x-9'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={18} />
              Save changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            Edit Settings
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationSection;
