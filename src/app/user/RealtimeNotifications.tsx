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

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

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

  async function deleteNotification(notificationId: string) {
    if (deletingId) {
      return;
    }

    const notification = notifications.find(
      (item) => item._id === notificationId
    );

    if (!notification) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this notification?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(notificationId);

    try {
      const response = await fetch(
        `/api/notifications?id=${encodeURIComponent(
          notificationId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete notification."
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (item) => item._id !== notificationId
        )
      );

      if (!notification.read) {
        setUnreadCount((currentCount) =>
          Math.max(0, currentCount - 1)
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete notification."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>

    <style jsx>{`
      @keyframes notification-delete-spin {
       to {
       transform: rotate(360deg);
      }
     }
    `}</style>

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
            <div
              key={notification._id}
              className={`message-item ${
                !notification.read
                  ? "message-unread"
                  : ""
              }`}
              style={{
                position: "relative",
              }}
            >
              <button
                type="button"
                aria-label={
                  notification.read
                    ? "Notification"
                    : "Mark notification as read"
                }
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
                  background: "transparent",
                  border: "0",
                  padding: 0,
                  paddingRight: "44px",
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

              <button
                  type="button"
                  aria-label="Delete notification"
                  title="Delete notification"
                  onClick={(event) => {
                  event.stopPropagation();
                  deleteNotification(notification._id);
              }}
                  disabled={deletingId === notification._id}
                  style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  width: "38px",
                  height: "38px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  border: "1px solid #dbe3ee",
                  borderRadius: "10px",
                  background:
                "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)",
                  color: "#64748b",
                  cursor:
                deletingId === notification._id
                ? "wait"
                : "pointer",
                  boxShadow:
                "0 3px 8px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  transition: "all 0.18s ease",
                  opacity:
                deletingId === notification._id
                ? 0.6
                : 1,
             }}
           onMouseEnter={(event) => {
          if (deletingId !== notification._id) {
            event.currentTarget.style.color = "#dc2626";
            event.currentTarget.style.borderColor = "#fecaca";
            event.currentTarget.style.background =
          "linear-gradient(145deg, #fffafa 0%, #fee2e2 100%)";
            event.currentTarget.style.boxShadow =
          "0 5px 14px rgba(220, 38, 38, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9)";
            event.currentTarget.style.transform =
          "translateY(-1px)";
        }
      }}
         onMouseLeave={(event) => {
          event.currentTarget.style.color = "#64748b";
          event.currentTarget.style.borderColor = "#dbe3ee";
          event.currentTarget.style.background =
        "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)";
          event.currentTarget.style.boxShadow =
        "0 3px 8px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)";
          event.currentTarget.style.transform =
        "translateY(0)";
      }}
          >
              {deletingId === notification._id ? (
              <span
              style={{
                width: "15px",
                height: "15px",
                border: "2px solid #cbd5e1",
                borderTopColor: "#64748b",
                borderRadius: "50%",
                display: "block",
                animation: "notification-delete-spin 0.7s linear infinite",
            }}
              />
            ) : (
              <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
             )}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}