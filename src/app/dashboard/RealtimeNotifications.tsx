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
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

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
      <style>{`
        .artist-notifications {
          width: 100%;
        }

        .artist-notifications-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .artist-notifications-title {
          margin: 0;
          color: #111827;
          font-size: 24px;
          font-weight: 800;
          line-height: 1.2;
        }

        .artist-notifications-description {
          margin: 7px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .artist-notifications-count {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 6px 12px;
          border-radius: 999px;
          background: #eef6ff;
          color: #1976d2;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .artist-notifications-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .artist-notification {
          width: 100%;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          text-align: left;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .artist-notification.unread {
          border-color: #bfdbfe;
          background: #f8fbff;
        }

        .artist-notification.unread:hover {
          border-color: #93c5fd;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
        }

        .artist-notification.read {
          cursor: default;
        }

        .artist-notification.unread {
          cursor: pointer;
        }

        .artist-notification-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .artist-notification-main {
          min-width: 0;
        }

        .artist-notification-title {
          margin: 0;
          color: #111827;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.4;
        }

        .artist-notification-date {
          margin: 5px 0 0;
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.4;
        }

        .artist-notification-message {
          margin: 10px 0 0;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.55;
        }

        .artist-notification-badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
        }

        .artist-notifications-empty {
          padding: 28px 20px;
          border: 1px dashed #d1d5db;
          border-radius: 12px;
          background: #fafafa;
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }

        @media (max-width: 640px) {
          .artist-notifications-header {
            flex-direction: column;
            gap: 12px;
          }

          .artist-notifications-title {
            font-size: 21px;
          }

          .artist-notification {
            padding: 14px;
          }

          .artist-notification-top {
            gap: 10px;
          }

          .artist-notification-title {
            font-size: 14px;
          }

          .artist-notification-message {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="artist-notifications">
        <div className="artist-notifications-header">
          <div>
            <h2 className="artist-notifications-title">
              Notifications
            </h2>

            <p className="artist-notifications-description">
              Important updates from your activity.
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="artist-notifications-count">
              {unreadCount} Unread
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="artist-notifications-empty">
            No notifications yet.
          </div>
        ) : (
          <div className="artist-notifications-list">
            {notifications.map((notification) => (
              <button
                type="button"
                key={notification._id}
                className={`artist-notification ${
                  notification.read ? "read" : "unread"
                }`}
                onClick={() =>
                  !notification.read &&
                  markAsRead(notification._id)
                }
              >
                <div className="artist-notification-top">
                  <div className="artist-notification-main">
                    <p className="artist-notification-title">
                      {notification.title}
                    </p>

                    <p className="artist-notification-date">
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
                    <span className="artist-notification-badge">
                      Unread
                    </span>
                  )}
                </div>

                <p className="artist-notification-message">
                  {notification.message}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}