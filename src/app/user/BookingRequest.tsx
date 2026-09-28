"use client";

import { useState } from "react";

type BookingRequestProps = {
  enquiryId: string;
  eventType?: string;
};

export default function BookingRequest({
  enquiryId,
  eventType,
}: BookingRequestProps) {
  const [service, setService] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitBookingRequest() {
    if (sending) {
      return;
    }

    const trimmedService = service.trim();

    if (!trimmedService) {
      setError("Please enter the service you need.");
      return;
    }

    if (!bookingDate) {
      setError("Please select a booking date.");
      return;
    }

    try {
      setSending(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enquiryId,
          service: trimmedService,
          bookingDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to send booking request."
        );
        return;
      }

      setMessage(
        "Booking request sent. The artist can now review it and send you a quote."
      );

      setService("");
      setBookingDate("");
    } catch {
      setError(
        "Something went wrong while sending the booking request."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="booking-request">
      <style jsx>{`
        .booking-request {
          margin: 16px 20px 0;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fafafa;
        }

        .booking-request-header {
          margin-bottom: 13px;
        }

        .booking-request-kicker {
          display: block;
          margin-bottom: 5px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .booking-request-title {
          margin: 0;
          color: #111827;
          font-size: 15px;
          line-height: 1.35;
        }

        .booking-request-description {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.55;
        }

        .booking-request-form {
          display: grid;
          gap: 11px;
        }

        .booking-request-field {
          display: grid;
          gap: 5px;
        }

        .booking-request-field label {
          color: #374151;
          font-size: 11px;
          font-weight: 700;
        }

        .booking-request-field input {
          width: 100%;
          min-height: 40px;
          padding: 9px 11px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          outline: none;
          background: #ffffff;
          color: #111827;
          font: inherit;
          font-size: 13px;
          box-sizing: border-box;
        }

        .booking-request-field input:focus {
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .booking-request-button {
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

        .booking-request-button:hover:not(:disabled) {
          background: #1f2937;
        }

        .booking-request-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .booking-request-message {
          margin: 0;
          padding: 9px 11px;
          border-radius: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          font-size: 12px;
          line-height: 1.5;
        }

        .booking-request-error {
          margin: 0;
          padding: 9px 11px;
          border-radius: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 700px) {
          .booking-request {
            margin-left: 16px;
            margin-right: 16px;
          }
        }

        @media (max-width: 480px) {
          .booking-request {
            margin-left: 12px;
            margin-right: 12px;
            padding: 14px;
          }
        }
      `}</style>

      <div className="booking-request-header">
        <span className="booking-request-kicker">
          BOOKING
        </span>

        <h3 className="booking-request-title">
          Request a Booking
        </h3>

        <p className="booking-request-description">
          {eventType
            ? `Request this ${eventType.toLowerCase()} booking. The artist will review your request and send a quote.`
            : "Send your booking request. The artist will review it and send a quote."}
        </p>
      </div>

      <div className="booking-request-form">
        <div className="booking-request-field">
          <label htmlFor={`booking-service-${enquiryId}`}>
            Service
          </label>

          <input
            id={`booking-service-${enquiryId}`}
            type="text"
            value={service}
            onChange={(event) =>
              setService(event.target.value)
            }
            placeholder="e.g. Theatre performance"
            maxLength={200}
            disabled={sending}
          />
        </div>

        <div className="booking-request-field">
          <label htmlFor={`booking-date-${enquiryId}`}>
            Booking Date
          </label>

          <input
            id={`booking-date-${enquiryId}`}
            type="date"
            value={bookingDate}
            onChange={(event) =>
              setBookingDate(event.target.value)
            }
            min={new Date().toISOString().split("T")[0]}
            disabled={sending}
          />
        </div>

        {message && (
          <p className="booking-request-message">
            {message}
          </p>
        )}

        {error && (
          <p className="booking-request-error">
            {error}
          </p>
        )}

        <button
          type="button"
          className="booking-request-button"
          onClick={submitBookingRequest}
          disabled={
            sending ||
            !service.trim() ||
            !bookingDate
          }
        >
          {sending
            ? "Sending Request..."
            : "Send Booking Request"}
        </button>
      </div>
    </div>
  );
}