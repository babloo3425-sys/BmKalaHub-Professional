"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type EnquiryStatus = "new" | "read" | "replied" | "closed";

type Enquiry = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  message: string;
  status: EnquiryStatus;
  unreadCount?: number;
  createdAt: string;
  updatedAt?: string;
};

const statusOptions: {
  value: EnquiryStatus;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadEnquiries() {
      try {
        const response = await fetch("/api/enquiries/received", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Failed to load enquiries."
          );
          return;
        }

        setEnquiries(data.enquiries || []);
      } catch {
        setError(
          "Something went wrong while loading enquiries."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEnquiries();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3002", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log(
        "BmKalaHub Artist Enquiries socket connected:",
        socket.id
      );
    });

    socket.on("connect_error", (socketError) => {
      console.error(
        "BmKalaHub Artist Enquiries socket error:",
        socketError.message
      );
    });

    socket.on("enquiry:new", (incomingEnquiry: Enquiry) => {
      setEnquiries((current) => {
        const existingIndex = current.findIndex(
          (item) => item._id === incomingEnquiry._id
        );

        if (existingIndex === -1) {
          return [incomingEnquiry, ...current];
        }

        const updated = [...current];

        updated[existingIndex] = {
          ...updated[existingIndex],
          ...incomingEnquiry,
        };

        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function updateStatus(
    enquiryId: string,
    status: EnquiryStatus
  ) {
    const previousEnquiries = enquiries;

    setUpdatingId(enquiryId);

    setEnquiries((current) =>
      current.map((enquiry) =>
        enquiry._id === enquiryId
          ? { ...enquiry, status }
          : enquiry
      )
    );

    try {
      const response = await fetch(
        `/api/enquiries/${enquiryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEnquiries(previousEnquiries);
        setError(
          data.message || "Failed to update status."
        );
        return;
      }

      window.dispatchEvent(
  new CustomEvent("bmkalahub:enquiry-status-updated", {
    detail: {
      enquiryId,
      status,
    },
  })
);

      setError("");
    } catch {
      setEnquiries(previousEnquiries);
      setError(
        "Something went wrong while updating status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

     async function deleteEnquiry(enquiryId: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this enquiry?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `/api/enquiries/${enquiryId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.message || "Failed to delete enquiry."
      );
      return;
    }

    setEnquiries((current) =>
      current.filter(
      (enquiry) => enquiry._id !== enquiryId
    )
   );

    window.dispatchEvent(
     new CustomEvent("bmkalahub:enquiry-deleted", {
        detail: { enquiryId },
    })
  );
     } catch {
      setError(
      "Something went wrong while deleting the enquiry."
    );
  }
}

  return (
    <section className="enquiries-section">
      <div className="enquiries-header">
        <div>
          <span className="enquiries-kicker">
            INBOX
          </span>

          <h2>Enquiries</h2>

          <p>
            Messages from people interested in working
            with you.
          </p>
        </div>

        {!loading && !error && (
          <strong className="enquiries-count">
            {enquiries.length}
          </strong>
        )}
      </div>

      {loading && (
        <div className="enquiries-state">
          Loading enquiries...
        </div>
      )}

      {!loading && error && (
        <div className="enquiries-state enquiries-error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        enquiries.length === 0 && (
          <div className="enquiries-empty">
            <strong>No enquiries yet</strong>

            <p>
              When someone contacts you through your public
              profile, their enquiry will appear here.
            </p>
          </div>
        )}

      {!loading &&
        enquiries.length > 0 && (
          <div className="enquiries-list">
            {enquiries.map((enquiry) => (
              <article
                key={enquiry._id}
                className="enquiry-card"
              >
                <div className="enquiry-card-top">
                  <div>
                    <h3>{enquiry.name}</h3>

                    {enquiry.eventType && (
                      <span className="enquiry-event">
                        {enquiry.eventType}
                      </span>
                    )}
                  </div>

                  <span
                    className={`enquiry-status status-${enquiry.status}`}
                  >
                    {enquiry.status}
                  </span>
                </div>

                <div className="enquiry-contact">
                  <span>{enquiry.email}</span>

                  {enquiry.phone && (
                    <span>{enquiry.phone}</span>
                  )}
                </div>

                <p className="enquiry-message">
                  {enquiry.message}
                </p>

                <div className="enquiry-footer">
                  <time
                    className="enquiry-date"
                    dateTime={enquiry.createdAt}
                  >
                    {new Date(
                      enquiry.createdAt
                    ).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>

                  <label className="status-control">
                    <span>Status</span>

                    <select
                      value={enquiry.status}
                      disabled={
                        updatingId === enquiry._id
                      }
                      onChange={(event) =>
                        updateStatus(
                          enquiry._id,
                          event.target
                            .value as EnquiryStatus
                        )
                      }
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                     <button
                       type="button"
                       className="enquiry-delete-button"
                       onClick={() => deleteEnquiry(enquiry._id)}
                       aria-label="Delete enquiry"
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
                  </button>
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}

      <style jsx>{`
        .enquiries-section {
          margin-top: 24px;
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 26px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .enquiries-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .enquiries-kicker {
          color: var(--primary);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .enquiries-header h2 {
          margin: 6px 0 0;
          color: var(--text-primary);
          font-size: 24px;
          font-weight: 800;
        }

        .enquiries-header p {
          margin: 6px 0 0;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.5;
        }

        .enquiries-count {
          min-width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: var(--primary);
          background: var(--primary-soft);
          font-size: 15px;
        }

        .enquiries-state,
        .enquiries-empty {
          padding: 22px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: var(--surface-soft);
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
        }

        .enquiries-empty strong {
          display: block;
          color: var(--text-primary);
          font-size: 15px;
        }

        .enquiries-empty p {
          margin: 6px 0 0;
        }

        .enquiries-error {
          color: #b42318;
        }

        .enquiries-list {
          display: grid;
          gap: 12px;
        }

        .enquiry-card {
          padding: 20px;
          border: 1px solid var(--border);
          border-radius: 17px;
          background: var(--surface-soft);
        }

        .enquiry-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .enquiry-card h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 800;
        }

        .enquiry-event {
          display: inline-block;
          margin-top: 6px;
          color: var(--primary);
          font-size: 12px;
          font-weight: 700;
        }

        .enquiry-status {
          flex: 0 0 auto;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .status-new {
          color: #8a5a00;
          background: #fff5d9;
        }

        .status-read {
          color: #315f8c;
          background: #eaf3fb;
        }

        .status-replied {
          color: #176b3a;
          background: #e8f7ee;
        }

        .status-closed {
          color: #b91c1c;
          background: #fff0f0;
        }

        .enquiry-contact {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;
          margin-top: 13px;
          color: var(--text-secondary);
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .enquiry-message {
          margin: 15px 0 0;
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.65;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .enquiry-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-top: 15px;
        }

        .enquiry-date {
          color: var(--text-muted);
          font-size: 10px;
        }

        .status-control {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-control select {
          min-height: 34px;
          padding: 0 30px 0 10px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .status-control select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .enquiries-section {
            padding: 20px;
            border-radius: 21px;
          }

          .enquiries-header {
            align-items: flex-start;
          }

          .enquiries-header h2 {
            font-size: 21px;
          }

          .enquiries-count {
            min-width: 38px;
            height: 38px;
          }

          .enquiry-card {
            padding: 17px;
          }

          .enquiry-card-top {
            flex-direction: column;
            gap: 9px;
          }

          .enquiry-status {
            align-self: flex-start;
          }

          .enquiry-footer {
            align-items: stretch;
            flex-direction: column;
            gap: 12px;
          }

          .status-control {
            justify-content: space-between;
          }

          .status-control select {
            flex: 1;
            min-width: 0;
          }
        }

        @media (max-width: 380px) {
          .enquiries-section {
            padding: 16px;
          }

          .enquiry-contact {
            flex-direction: column;
            gap: 5px;
          }
        }

          .enquiry-delete-button {
            width: 32px;
            height: 32px;
            flex: 0 0 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
            border-radius: 9px;
            background: #ffffff;
            color: #64748b;
            box-shadow: 0 3px 10px rgba(15, 23, 42, 0.10);
            cursor: pointer;
            transition:
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

          .enquiry-delete-button:hover {
            background: #fff1f2;
            color: #dc2626;
            border-color: #fecdd3;
            transform: translateY(-1px);
            box-shadow: 0 5px 14px rgba(220, 38, 38, 0.14);
        }

          .enquiry-delete-button:active {
            transform: translateY(0);
        }

          .enquiry-delete-button svg {
            width: 16px;
            height: 16px;
        }

       `}</style>
    </section>
  );
}