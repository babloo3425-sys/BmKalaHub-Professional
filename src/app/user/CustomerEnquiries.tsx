"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type EnquiryStatus = "new" | "read" | "replied" | "closed";

type Enquiry = {
  _id: string;
  artistId: {
    _id: string;
    name: string;
    category?: string;
  } | null;
  eventType?: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

type Props = {
  initialEnquiries: Enquiry[];
};

export default function CustomerEnquiries({
  initialEnquiries,
}: Props) {
  const [enquiries, setEnquiries] =
    useState<Enquiry[]>(initialEnquiries);

  const [deletingEnquiryId, setDeletingEnquiryId] =
    useState<string | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3002", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log(
        "BmKalaHub Customer Enquiry Socket connected:",
        socket.id
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "BmKalaHub Customer Enquiry Socket connection error:",
        error.message
      );
    });

    socket.on(
      "enquiry:new",
      (incomingEnquiry: {
        _id: string;
        status: EnquiryStatus;
        updatedAt?: string;
      }) => {
        setEnquiries((currentEnquiries) =>
          currentEnquiries.map((enquiry) =>
            enquiry._id === incomingEnquiry._id
              ? {
                  ...enquiry,
                  status: incomingEnquiry.status,
                  createdAt: enquiry.createdAt,
                }
              : enquiry
          )
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  async function deleteEnquiry(enquiryId: string) {
    if (deletingEnquiryId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this closed enquiry?\n\nIts messages and notifications will also be removed. This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingEnquiryId(enquiryId);

      const response = await fetch(
        `/api/enquiries/${enquiryId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(
          data.message ||
            "Failed to delete enquiry."
        );
        return;
      }

      setEnquiries((currentEnquiries) =>
        currentEnquiries.filter(
          (enquiry) =>
            enquiry._id !== enquiryId
        )
      );
    } catch (error) {
      console.error(
        "Delete customer enquiry error:",
        error
      );

      window.alert(
        "Something went wrong while deleting the enquiry."
      );
    } finally {
      setDeletingEnquiryId(null);
    }
  }

  if (enquiries.length === 0) {
    return (
      <>
        <style jsx>{`
          .customer-enquiry-empty {
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #ffffff;
            color: #6b7280;
            text-align: center;
            font-size: 13px;
          }
        `}</style>

        <p className="customer-enquiry-empty">
          You have not sent any enquiries yet.
        </p>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        .enquiry-list {
          display: grid;
          gap: 12px;
        }

        .enquiry-item {
          position: relative;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 3px 12px
            rgba(15, 23, 42, 0.05);
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            transform 0.18s ease;
        }

        .enquiry-item:hover {
          border-color: #d1d5db;
          box-shadow: 0 6px 18px
            rgba(15, 23, 42, 0.08);
        }

        .item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .item-title {
          margin: 0;
          color: #111827;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.4;
        }

        .item-meta {
          margin: 3px 0 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.4;
        }

        .status-badge {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 26px;
          padding: 0 9px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          background: #f8fafc;
          color: #475569;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .status-closed {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #475569;
        }

        .item-event {
          margin: 12px 0 0;
          color: #374151;
          font-size: 12px;
          font-weight: 700;
        }

        .item-message {
          margin: 7px 0 0;
          color: #4b5563;
          font-size: 13px;
          line-height: 1.55;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .item-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 13px;
        }

        .item-date {
          margin: 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.4;
        }

        .enquiry-delete-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 34px;
          padding: 0 11px;
          flex: 0 0 auto;
          border: 1px solid #fecdd3;
          border-radius: 9px;
          background: #fff1f2;
          color: #be123c;
          box-shadow:
            0 3px 9px
              rgba(190, 24, 93, 0.10),
            inset 0 1px 0
              rgba(255, 255, 255, 0.75);
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .enquiry-delete-button:hover:not(:disabled) {
          background: #ffe4e6;
          border-color: #fda4af;
          color: #be123c;
          transform: translateY(-1px);
          box-shadow:
            0 5px 13px
              rgba(190, 24, 93, 0.15),
            inset 0 1px 0
              rgba(255, 255, 255, 0.75);
        }

        .enquiry-delete-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow:
            0 2px 6px
              rgba(190, 24, 93, 0.10);
        }

        .enquiry-delete-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .enquiry-delete-button svg {
          width: 15px;
          height: 15px;
          flex: 0 0 15px;
        }

        @media (max-width: 600px) {
          .enquiry-item {
            padding: 14px;
          }

          .item-top {
            gap: 8px;
          }

          .item-bottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .enquiry-delete-button {
            width: 100%;
            min-height: 38px;
          }
        }
      `}</style>

      <div className="enquiry-list">
        {enquiries.map((enquiry) => {
          const artist = enquiry.artistId;
          const canDelete =
            enquiry.status === "closed";

          return (
            <div
              className="enquiry-item"
              key={String(enquiry._id)}
            >
              <div className="item-top">
                <div>
                  <p className="item-title">
                    {artist?.name || "Artist"}
                  </p>

                  <p className="item-meta">
                    {artist?.category || "Artist"}
                  </p>
                </div>

                <span
                  className={`status-badge status-${enquiry.status}`}
                >
                  {enquiry.status}
                </span>
              </div>

              <p className="item-event">
                {enquiry.eventType ||
                  "General enquiry"}
              </p>

              <p className="item-message">
                {enquiry.message}
              </p>

              <div className="item-bottom">
                <p className="item-date">
                  {new Date(
                    enquiry.createdAt
                  ).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>

                {canDelete && (
                  <button
                    type="button"
                    className="enquiry-delete-button"
                    onClick={() =>
                      deleteEnquiry(
                        enquiry._id
                      )
                    }
                    disabled={
                      deletingEnquiryId ===
                      enquiry._id
                    }
                    aria-label="Delete closed enquiry"
                    title="Delete enquiry"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
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

                    {deletingEnquiryId ===
                    enquiry._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}