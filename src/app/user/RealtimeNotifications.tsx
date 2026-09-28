"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  enquiryId?: string | null;
  messageId?: string | null;
  read: boolean;
  createdAt: string;
};

type Props = {
  initialNotifications: Notification[];
  initialUnreadCount: number;
};

export default function RealtimeNotifications({
  initialNotifications,
  initialUnreadCount,
}: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );

  const [unreadCount, setUnreadCount] =
    useState(initialUnreadCount);

  useEffect(() => {
    const socket = io("http://localhost:3002", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log(
        "BmKalaHub Notification Socket connected:",
        socket.id
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "BmKalaHub Notification Socket connection error:",
        error.message
      );
    });

    socket.on(
      "notification:new",
      (incomingNotification: Notification) => {
        setNotifications((currentNotifications) => {
          if (
            currentNotifications.some(
              (item) => item._id === incomingNotification._id
            )
          ) {
            return currentNotifications;
          }

          return [
            incomingNotification,
            ...currentNotifications,
          ].slice(0, 5);
        });

        if (!incomingNotification.read) {
          setUnreadCount((currentCount) => currentCount + 1);
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        return;
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((currentCount) =>
        Math.max(0, currentCount - 1)
      );
    } catch (error) {
      console.error(
        "Mark notification as read error:",
        error
      );
    }
  }

  return (
    <>
      <div className="item-top">
        <div>
          <h2>Notifications</h2>

          <p className="dashboard-card-description">
            Important updates from your activity.
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="status">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="empty-state">
          No notifications yet.
        </p>
      ) : (
        <div className="message-list">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification._id}
              className={`message-item ${
                !notification.read
                  ? "message-unread"
                  : ""
              }`}
              onClick={() =>
                !notification.read &&
                markAsRead(notification._id)
              }
              style={{
                width: "100%",
                textAlign: "left",
                cursor: notification.read
                  ? "default"
                  : "pointer",
                font: "inherit",
              }}
            >
              <div className="item-top">
                <div>
                  <p className="item-title">
                    {notification.title}
                  </p>

              <p className="item-meta">
               {notification.createdAt
               ? new Date(
               notification.createdAt
              ).toLocaleString("en-IN", {
               timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
              })
            : ""}
            </p>
              </div>

                {!notification.read && (
                  <span className="status">
                    Unread
                  </span>
                )}
              </div>

              <p className="item-message">
                {notification.message}
              </p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}