"use client";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export enum NotificationStatus {
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  INFO = "INFO",
}

export type Notification = {
  id: string;
  title: string;
  expiresIn?: number; // ms
  status: NotificationStatus;
};

export type NotificationsContextType = {
  notifications: Notification[];
  addNotification: (x: Notification) => void;
  removeNotification: (id: string) => void;
};

export const initialNotificationsContext: NotificationsContextType = {
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
};

const NotificationsContext = createContext<NotificationsContextType>(
  initialNotificationsContext
);

export const generateNotification = (
  args?: Partial<Notification>
): Notification => ({
  id: uuidv4(),
  title: "Test notification :D",
  status: NotificationStatus.INFO,
  ...(args || {}),
});

export const NotificationsProvider = (props: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notif: Notification) => {
    if (notif.id === "temp") {
      notif.id = uuidv4();
    }
    const updatedNotifications: Notification[] = [...notifications];
    updatedNotifications.push(notif);
    setNotifications(updatedNotifications);
  };

  const removeNotification = (id: string) => {
    const updatedNotifications = notifications.filter(
      (notif: Notification) => notif.id !== id
    );
    setNotifications(updatedNotifications);
  };

  return (
    <NotificationsContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {props.children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  return context;
};
