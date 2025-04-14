import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Notification,
  NotificationTitle,
  NotificationDescription,
  NotificationClose,
} from "@/components/ui/notification";
import { NotificationItem } from "./NotificationCenter";

interface NotificationToastProps {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
  autoDismiss?: boolean;
  autoDismissTimeout?: number;
}

const NotificationToast = ({
  notification,
  onDismiss,
  autoDismiss = true,
  autoDismissTimeout = 5000,
}: NotificationToastProps) => {
  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, autoDismissTimeout);

      return () => clearTimeout(timer);
    }
  }, [notification.id, onDismiss, autoDismiss, autoDismissTimeout]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      layout
      className="mb-2"
    >
      <Notification variant={notification.variant || "default"}>
        <NotificationTitle>{notification.title}</NotificationTitle>
        <NotificationDescription>
          {notification.description}
        </NotificationDescription>
        <NotificationClose onClick={() => onDismiss(notification.id)} />
      </Notification>
    </motion.div>
  );
};

interface NotificationToastContainerProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
}

export const NotificationToastContainer = ({
  notifications,
  onDismiss,
}: NotificationToastContainerProps) => {
  // Only show the 10 most recent notifications
  const visibleNotifications = notifications.slice(0, 10);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 w-full max-w-sm">
      <AnimatePresence initial={false}>
        {visibleNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
