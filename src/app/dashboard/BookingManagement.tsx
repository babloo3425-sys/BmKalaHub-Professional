"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type BookingStatus =
  | "pending"
  | "quoted"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

type Booking = {
  _id: string;
  customerId?: {
    _id: string;
    name?: string;
    email?: string;
  };
  enquiryId?: {
    _id: string;
    eventType?: string;
    message?: string;
  };
  service: string;
  bookingDate: string;
  quoteAmount: number;
  quoteNote?: string;
  status: BookingStatus;
  createdAt: string;
};

type BookingManagementProps = {
  bookings: Booking[];
};

export default function BookingManagement({
  bookings,
}: BookingManagementProps) {
  const [realtimeBookings, setRealtimeBookings] =
    useState<Booking[]>(bookings);

  useEffect(() => {
    const socket = io("http://localhost:3002", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("booking:new", (incomingBooking: Booking) => {
      setRealtimeBookings((current) => {
        const existingIndex = current.findIndex(
          (item) => item._id === incomingBooking._id
        );

        if (existingIndex === -1) {
          return [incomingBooking, ...current];
        }

        const updated = [...current];

        updated[existingIndex] = {
          ...updated[existingIndex],
          ...incomingBooking,
        };

        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const [quoteAmount, setQuoteAmount] = useState<
    Record<string, string>
  >({});

  const [quoteNote, setQuoteNote] = useState<
    Record<string, string>
  >({});

  const [sendingId, setSendingId] = useState<string | null>(
    null
  );

  const [completingId, setCompletingId] =
    useState<string | null>(null);

  const [deletingBookingId, setDeletingBookingId] =
    useState<string | null>(null);

  const [success, setSuccess] = useState<
    Record<string, string>
  >({});

  const [error, setError] = useState<
    Record<string, string>
  >({});

  async function sendQuote(bookingId: string) {
    if (sendingId || completingId) {
      return;
    }

    const amount = Number(quoteAmount[bookingId]);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError((current) => ({
        ...current,
        [bookingId]:
          "Please enter a valid quote amount.",
      }));
      return;
    }

    const note = (quoteNote[bookingId] || "").trim();

    try {
      setSendingId(bookingId);

      setError((current) => ({
        ...current,
        [bookingId]: "",
      }));

      setSuccess((current) => ({
        ...current,
        [bookingId]: "",
      }));

      const response = await fetch(
        `/api/bookings/${bookingId}/quote`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quoteAmount: amount,
            quoteNote: note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError((current) => ({
          ...current,
          [bookingId]:
            data.message ||
            "Failed to send quote.",
        }));
        return;
      }

      setRealtimeBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                quoteAmount: data.booking.quoteAmount,
                quoteNote: data.booking.quoteNote,
                status: data.booking.status,
              }
            : booking
        )
      );

      setSuccess((current) => ({
        ...current,
        [bookingId]:
          "Quote sent successfully.",
      }));
    } catch {
      setError((current) => ({
        ...current,
        [bookingId]:
          "Something went wrong while sending the quote.",
      }));
    } finally {
      setSendingId(null);
    }
  }

  async function completeBooking(bookingId: string) {
    if (sendingId || completingId) {
      return;
    }

    try {
      setCompletingId(bookingId);

      setError((current) => ({
        ...current,
        [bookingId]: "",
      }));

      setSuccess((current) => ({
        ...current,
        [bookingId]: "",
      }));

      const response = await fetch(
        `/api/bookings/${bookingId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError((current) => ({
          ...current,
          [bookingId]:
            data.message ||
            "Failed to complete booking.",
        }));
        return;
      }

      setRealtimeBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status: "completed",
              }
            : booking
        )
      );

      setSuccess((current) => ({
        ...current,
        [bookingId]:
          "Booking marked as completed.",
      }));
    } catch {
      setError((current) => ({
        ...current,
        [bookingId]:
          "Something went wrong while completing the booking.",
      }));
    } finally {
      setCompletingId(null);
    }
  }

      async function deleteBooking(bookingId: string) {
      if (sendingId || completingId || deletingBookingId) {
     return;
   }

    const confirmed = window.confirm(
    "Delete this booking from your history? This action cannot be undone."
  );

  if (!confirmed) {
    return;
  }

    try {
    setDeletingBookingId(bookingId);

    setError((current) => ({
      ...current,
      [bookingId]: "",
    }));

    setSuccess((current) => ({
      ...current,
      [bookingId]: "",
    }));

    const response = await fetch("/api/bookings", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError((current) => ({
        ...current,
        [bookingId]:
          data.message ||
          "Failed to delete booking.",
      }));
      return;
    }

    setRealtimeBookings((current) =>
      current.filter(
        (booking) => booking._id !== bookingId
      )
    );
  } catch {
    setError((current) => ({
      ...current,
      [bookingId]:
        "Something went wrong while deleting the booking.",
    }));
  } finally {
    setDeletingBookingId(null);
  }
}

  if (realtimeBookings.length === 0) {
    return (
      <section className="booking-management">
        <style jsx>{`
          .booking-management {
            width: 100%;
          }

          .empty {
            padding: 24px 20px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #ffffff;
            color: #6b7280;
            font-size: 13px;
            text-align: center;
          }
        `}</style>

        <div className="empty">
          No booking requests yet.
        </div>
      </section>
    );
  }

  return (
    <section className="booking-management">
      <style jsx>{`
        .booking-management {
          width: 100%;
        }

        .booking-list {
          display: grid;
          gap: 16px;
        }

        .booking-card {
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #ffffff;
        }

        .booking-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 15px;
        }

        .booking-title {
          margin: 0;
          color: #111827;
          font-size: 16px;
          line-height: 1.4;
        }

        .booking-customer {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        .booking-status {
          flex-shrink: 0;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #374151;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .booking-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .booking-delete-button {
          min-height: 32px;
          padding: 0 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;

          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #ffffff;
          color: #dc2626;

          font-size: 11px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;

          cursor: pointer;

          box-shadow:
          0 3px 8px rgba(15, 23, 42, 0.10),
          0 1px 2px rgba(220, 38, 38, 0.08);

          transition:
          background 0.18s ease,
          color 0.18s ease,
          border-color 0.18s ease,
          transform 0.18s ease,
          box-shadow 0.18s ease;
        }

        .booking-delete-button:hover:not(:disabled) {
          background: #dc2626;
          color: #ffffff;
          border-color: #dc2626;

          transform: translateY(-1px);

          box-shadow:
          0 6px 14px rgba(220, 38, 38, 0.22);
        }

        .booking-delete-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow:
          0 3px 7px rgba(220, 38, 38, 0.16);
        }

        .booking-delete-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .booking-delete-button svg {
          width: 14px;
          height: 14px;
         flex: 0 0 14px;
        }

        .booking-details {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 10px;
          margin-bottom: 15px;
        }

        .detail {
          padding: 10px 11px;
          border-radius: 9px;
          background: #f9fafb;
        }

        .detail-label {
          display: block;
          margin-bottom: 4px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .detail-value {
          color: #111827;
          font-size: 13px;
          line-height: 1.45;
          word-break: break-word;
        }

        .enquiry-message {
          margin: 0 0 16px;
          padding: 12px;
          border-left: 3px solid #d1d5db;
          background: #f9fafb;
          color: #4b5563;
          font-size: 12px;
          line-height: 1.6;
        }

        .quote-section {
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        }

        .quote-title {
          margin: 0 0 11px;
          color: #111827;
          font-size: 13px;
          font-weight: 800;
        }

        .quote-form {
          display: grid;
          gap: 10px;
        }

        .field {
          display: grid;
          gap: 5px;
        }

        .field label {
          color: #374151;
          font-size: 11px;
          font-weight: 700;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          outline: none;
          background: #ffffff;
          color: #111827;
          font: inherit;
          font-size: 13px;
        }

        .field input {
          min-height: 40px;
          padding: 9px 11px;
        }

        .field textarea {
          min-height: 80px;
          padding: 9px 11px;
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #111827;
          box-shadow:
            0 0 0 3px
            rgba(17, 24, 39, 0.08);
        }

        .quote-button {
          min-height: 40px;
          padding: 0 16px;
          border: 0;
          border-radius: 9px;
          background: #111827;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .quote-button:hover:not(:disabled) {
          background: #1f2937;
        }

        .quote-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .complete-section {
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
        }

        .complete-button {
          width: 100%;
          min-height: 42px;
          padding: 0 16px;
          border: 0;
          border-radius: 9px;
          background: #111827;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .complete-button:hover:not(:disabled) {
          background: #1f2937;
        }

        .complete-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success {
          margin: 0;
          padding: 9px 11px;
          border: 1px solid #a7f3d0;
          border-radius: 8px;
          background: #ecfdf5;
          color: #047857;
          font-size: 12px;
        }

        .error {
          margin: 0;
          padding: 9px 11px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
        }

        @media (max-width: 600px) {
          .booking-header {
            flex-direction: column;
            gap: 8px;
          }

          .booking-details {
            grid-template-columns: 1fr;
          }

          .booking-header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .booking-delete-button {
            min-height: 34px;
            padding: 0 12px;
          }
        }

        @media (max-width: 480px) {
          .booking-card {
            padding: 14px;
          }
        }
      `}</style>

      <div className="booking-list">
        {realtimeBookings.map((booking) => {
          const isPending =
            booking.status === "pending";

          const isAccepted =
            booking.status === "accepted";

          return (
            <article
              key={booking._id}
              className="booking-card"
            >
              <div className="booking-header">
                <div>
                  <h3 className="booking-title">
                    {booking.service}
                  </h3>

                  <p className="booking-customer">
                    Customer:{" "}
                    {booking.customerId?.name ||
                      "Customer"}
                  </p>
                </div>

            <div className="booking-header-actions">
            <span className="booking-status">
              {booking.status}
            </span>

            {(booking.status === "rejected" ||
              booking.status === "cancelled" ||
              booking.status === "completed") && (
            <button
                type="button"
                className="booking-delete-button"
                onClick={() =>
              deleteBooking(booking._id)
            }
              disabled={
              deletingBookingId === booking._id
            }
              aria-label="Delete booking"
              title="Delete booking"
          >
            {deletingBookingId === booking._id
             ? "Deleting..."
             : "Delete"}
           </button>
        )}
     </div>
</div>

              <div className="booking-details">
                <div className="detail">
                  <span className="detail-label">
                    Booking Date
                  </span>

                  <span className="detail-value">
                    {new Date(
                      booking.bookingDate
                    ).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="detail">
                  <span className="detail-label">
                    Event Type
                  </span>

                  <span className="detail-value">
                    {booking.enquiryId?.eventType ||
                      "Not specified"}
                  </span>
                </div>
              </div>

              {booking.enquiryId?.message && (
                <p className="enquiry-message">
                  {booking.enquiryId.message}
                </p>
              )}

              {isPending && (
                <div className="quote-section">
                  <h4 className="quote-title">
                    Send Quote
                  </h4>

                  <div className="quote-form">
                    <div className="field">
                      <label
                        htmlFor={`quote-amount-${booking._id}`}
                      >
                        Quote Amount
                      </label>

                      <input
                        id={`quote-amount-${booking._id}`}
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Enter amount"
                        value={
                          quoteAmount[booking._id] ||
                          ""
                        }
                        onChange={(event) =>
                          setQuoteAmount(
                            (current) => ({
                              ...current,
                              [booking._id]:
                                event.target.value,
                            })
                          )
                        }
                        disabled={
                          sendingId === booking._id ||
                          completingId === booking._id
                        }
                      />
                    </div>

                    <div className="field">
                      <label
                        htmlFor={`quote-note-${booking._id}`}
                      >
                        Quote Note
                      </label>

                      <textarea
                        id={`quote-note-${booking._id}`}
                        maxLength={2000}
                        placeholder="Add details about your quote..."
                        value={
                          quoteNote[booking._id] ||
                          ""
                        }
                        onChange={(event) =>
                          setQuoteNote(
                            (current) => ({
                              ...current,
                              [booking._id]:
                                event.target.value,
                            })
                          )
                        }
                        disabled={
                          sendingId === booking._id ||
                          completingId === booking._id
                        }
                      />
                    </div>

                    {success[booking._id] && (
                      <p className="success">
                        {success[booking._id]}
                      </p>
                    )}

                    {error[booking._id] && (
                      <p className="error">
                        {error[booking._id]}
                      </p>
                    )}

                    <button
                      type="button"
                      className="quote-button"
                      onClick={() =>
                        sendQuote(booking._id)
                      }
                      disabled={
                        sendingId === booking._id ||
                        completingId === booking._id ||
                        !quoteAmount[booking._id]
                      }
                    >
                      {sendingId === booking._id
                        ? "Sending Quote..."
                        : "Send Quote"}
                    </button>
                  </div>
                </div>
              )}

              {isAccepted && (
                <div className="complete-section">
                  <button
                    type="button"
                    className="complete-button"
                    onClick={() =>
                      completeBooking(booking._id)
                    }
                    disabled={
                      completingId === booking._id ||
                      sendingId === booking._id
                    }
                  >
                    {completingId === booking._id
                      ? "Completing..."
                      : "Mark Booking as Completed"}
                  </button>
                </div>
              )}

              {success[booking._id] && !isPending && (
                <p className="success">
                  {success[booking._id]}
                </p>
              )}

              {error[booking._id] && !isPending && (
                <p className="error">
                  {error[booking._id]}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}