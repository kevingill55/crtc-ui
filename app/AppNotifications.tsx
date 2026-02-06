"use client";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import {
  Notification,
  NotificationStatus,
  useNotificationsContext,
} from "./providers/Notifications";

const getNotificationStyles = (status: NotificationStatus) => {
  if (status === NotificationStatus.ERROR) return "bg-red-200";
  if (status === NotificationStatus.SUCCESS) return "bg-green-200";
  if (status === NotificationStatus.WARNING) return "bg-amber-200";
  if (status === NotificationStatus.INFO) return "bg-blue-100";
};

const ToastNotification = ({
  removeNotification,
  notif,
}: {
  notif: Notification;
  removeNotification: (id: string) => void;
}) => {
  useEffect(() => {
    if (notif.expiresIn) {
      setTimeout(() => {
        removeNotification(notif.id);
      }, notif.expiresIn);
    }
  }, [notif, removeNotification]);

  return (
    <div
      className={`p-4 w-full text-sm flex justify-between items-center text-main font-medium shadow-md rounded-lg ${getNotificationStyles(
        notif.status
      )}`}
    >
      <h3>{notif.title}</h3>
      <div>
        <button
          onClick={() => removeNotification(notif.id)}
          className="hover:cursor-pointer hover:bg-gray-50 rounded-full px-1.5 py-1"
        >
          <FontAwesomeIcon icon={faXmark} size="sm" />
        </button>
      </div>
    </div>
  );
};

export const AppNotifications = () => {
  const { notifications, removeNotification } = useNotificationsContext();
  return (
    <div className="fixed md:max-w-[500px] w-full bottom-6 right-6 z-50 space-y-2 p-2">
      {notifications.map((notif) => (
        <ToastNotification
          key={notif.id}
          notif={notif}
          removeNotification={removeNotification}
        />
      ))}
    </div>
  );
};
