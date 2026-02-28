import apiClient from "./apiClient";
import type { Notification } from "../types/notification.type";

export const markAllNotificationsAsRead = async (
  notifications: Notification[],
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
): Promise<void> => {
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
    throw error;
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
  notifications: Notification[],
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
): Promise<void> => {
  try {
    await apiClient.notifications.markAsRead(notificationId);
    setNotifications(
      notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif,
      ),
    );
  } catch (error) {
    console.error("Failed to mark as read:", error);
    throw error;
  }
};
