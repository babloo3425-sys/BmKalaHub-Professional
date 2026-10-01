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
  artistId?: {
    _id: string;
    name?: string;
    category?: string;
    location?: string;
    profilePhoto?: string;
  };
  service: string;
  bookingDate: string;
  quoteAmount: number;
  quoteNote?: string;
  status: BookingStatus;
  createdAt: string;
};

type CustomerReview = {
  _id: string;
  bookingId: string;
  artistId: string;
  rating: number;
  review: string;
  moderationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
};

type CustomerBookingsProps = {
  bookings: Booking[];
};

export default function CustomerBookings({
  bookings,
}: CustomerBookingsProps) {
  const [items, setItems] = useState(bookings);

  const [respondingId, setRespondingId] =
    useState<string | null>(null);

  const [deletingBookingId, setDeletingBookingId] =
  useState<string | null>(null);

  const [reviewSubmittingId, setReviewSubmittingId] =
    useState<string | null>(null);

  const [reviews, setReviews] = useState<
    Record<string, CustomerReview>
  >({});

  const [reviewRatings, setReviewRatings] = useState<
    Record<string, number>
  >({});

  const [reviewTexts, setReviewTexts] = useState<
    Record<string, string>
  >({});

  const [error, setError] = useState<
    Record<string, string>
  >({});

  const [success, setSuccess] = useState<
    Record<string, string>
  >({});

  // ---------------------------------
  // Realtime booking updates
  // ---------------------------------
  useEffect(() => {
    const socket = io("http://localhost:3002", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("booking:new", (booking: Booking) => {
      setItems((current) => {
        const existingIndex = current.findIndex(
          (item) => item._id === booking._id
        );

        if (existingIndex === -1) {
          return [booking, ...current];
        }

        const updated = [...current];

        updated[existingIndex] = {
          ...updated[existingIndex],
          ...booking,
        };

        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ---------------------------------
  // Load customer's existing reviews
  // ---------------------------------
  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch("/api/reviews");

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        const reviewMap: Record<string, CustomerReview> = {};

        for (const review of data.reviews || []) {
          reviewMap[review.bookingId] = review;
        }

        setReviews(reviewMap);
      } catch {
        // Review loading failure should not
        // break the booking dashboard.
      }
    }

    loadReviews();
  }, []);

  // ---------------------------------
  // Accept / Reject quote
  // ---------------------------------
  async function respondToQuote(
    bookingId: string,
    action: "accept" | "reject"
  ) {
    if (respondingId) {
      return;
    }

    try {
      setRespondingId(bookingId);

      setError((current) => ({
        ...current,
        [bookingId]: "",
      }));

      setSuccess((current) => ({
        ...current,
        [bookingId]: "",
      }));

      const response = await fetch(
        `/api/bookings/${bookingId}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError((current) => ({
          ...current,
          [bookingId]:
            data.message ||
            "Failed to update booking.",
        }));
        return;
      }

      setItems((current) =>
        current.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                status:
                  action === "accept"
                    ? "accepted"
                    : "rejected",
              }
            : booking
        )
      );

      setSuccess((current) => ({
        ...current,
        [bookingId]:
          action === "accept"
            ? "Quote accepted successfully."
            : "Quote rejected successfully.",
      }));
    } catch {
      setError((current) => ({
        ...current,
        [bookingId]:
          "Something went wrong while updating the booking.",
      }));
    } finally {
      setRespondingId(null);
    }
  }

    // ---------------------------------
  // Delete completed booking history
// ---------------------------------
    async function deleteBooking(bookingId: string) {
    if (deletingBookingId) {
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

    setItems((current) =>
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

  // ---------------------------------
  // Submit review
  // ---------------------------------
  async function submitReview(bookingId: string) {
    if (reviewSubmittingId) {
      return;
    }

    const rating = reviewRatings[bookingId];

    if (!rating) {
      setError((current) => ({
        ...current,
        [bookingId]:
          "Please select a rating from 1 to 5.",
      }));
      return;
    }

    const reviewText = (
      reviewTexts[bookingId] || ""
    ).trim();

    if (reviewText.length > 1000) {
      setError((current) => ({
        ...current,
        [bookingId]:
          "Review cannot exceed 1000 characters.",
      }));
      return;
    }

    try {
      setReviewSubmittingId(bookingId);

      setError((current) => ({
        ...current,
        [bookingId]: "",
      }));

      setSuccess((current) => ({
        ...current,
        [bookingId]: "",
      }));

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          rating,
          review: reviewText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError((current) => ({
          ...current,
          [bookingId]:
            data.message ||
            "Failed to submit review.",
        }));
        return;
      }

      if (data.review) {
        setReviews((current) => ({
          ...current,
          [bookingId]: data.review,
        }));
      }

      setReviewTexts((current) => ({
        ...current,
        [bookingId]: "",
      }));

      setSuccess((current) => ({
        ...current,
        [bookingId]:
          "Review submitted successfully. It is pending moderation.",
      }));
    } catch {
      setError((current) => ({
        ...current,
        [bookingId]:
          "Something went wrong while submitting the review.",
      }));
    } finally {
      setReviewSubmittingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <section className="customer-bookings">
        <style jsx>{`
          .customer-bookings {
            width: 100%;
          }

          .empty-state {
            padding: 18px 0 4px;
            color: #6b7280;
            font-size: 14px;
          }
        `}</style>

        <p className="empty-state">
          You have no bookings yet.
        </p>
      </section>
    );
  }

  return (
    <section className="customer-bookings">
      <style jsx>{`
        .customer-bookings {
          width: 100%;
        }

        .booking-list {
          display: grid;
          gap: 12px;
        }

        .booking-item {
          padding: 15px;
          border: 1px solid #eef0f2;
          border-radius: 10px;
        }

        .booking-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .booking-heading {
          min-width: 0;
         flex: 1;
        }

        .booking-top-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .booking-delete-button {
          min-height: 30px;
          padding: 0 11px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #ffffff;
          color: #dc2626;
          font-size: 11px;
          font-weight: 700;
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
          0 5px 12px rgba(220, 38, 38, 0.22);
        }

        .booking-delete-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .booking-delete-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

      @media (max-width: 600px) {
        .booking-top-actions {
          width: 100%;
          justify-content: space-between;
        }

        .booking-delete-button {
          min-height: 34px;
          padding: 0 12px;
        }
      }

        .booking-title {
          margin: 0;
          color: #111827;
          font-size: 15px;
          font-weight: 700;
        }

        .booking-artist {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 12px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #374151;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
          white-space: nowrap;
        }

        .booking-details {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 10px;
          margin-top: 14px;
        }

        .detail {
          padding: 10px;
          border-radius: 8px;
          background: #f9fafb;
        }

        .detail-label {
          display: block;
          margin-bottom: 4px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .detail-value {
          color: #111827;
          font-size: 13px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .quote-box {
          margin-top: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          background: #ffffff;
        }

        .quote-label {
          display: block;
          margin-bottom: 5px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .quote-amount {
          margin: 0;
          color: #111827;
          font-size: 20px;
          font-weight: 800;
        }

        .quote-note {
          margin: 8px 0 0;
          color: #4b5563;
          font-size: 12px;
          line-height: 1.55;
        }

        .actions {
          display: flex;
          gap: 9px;
          margin-top: 13px;
        }

        .button {
          min-height: 40px;
          padding: 0 15px;
          border: 0;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .accept-button {
          background: #111827;
          color: #ffffff;
        }

        .reject-button {
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
        }

        .button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .review-box {
          margin-top: 12px;
          padding: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          background: #fafafa;
        }

        .review-title {
          margin: 0;
          color: #111827;
          font-size: 13px;
          font-weight: 700;
        }

        .review-subtitle {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .rating-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 11px;
        }

        .rating-button {
          min-width: 38px;
          height: 36px;
          padding: 0 9px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: #ffffff;
          color: #374151;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .rating-button-selected {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .review-textarea {
          width: 100%;
          min-height: 82px;
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          font-family: inherit;
          font-size: 12px;
          line-height: 1.5;
          resize: vertical;
          box-sizing: border-box;
          outline: none;
        }

        .review-textarea:focus {
          border-color: #9ca3af;
        }

        .review-submit {
          margin-top: 10px;
          background: #111827;
          color: #ffffff;
        }

        .review-submitted {
          margin-top: 12px;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .review-submitted-title {
          margin: 0;
          color: #111827;
          font-size: 12px;
          font-weight: 700;
        }

        .review-stars {
          margin-top: 5px;
          color: #f59e0b;
          font-size: 13px;
          letter-spacing: 1px;
        }

        .review-submitted-text {
          margin: 6px 0 0;
          color: #4b5563;
          font-size: 12px;
          line-height: 1.5;
        }

        .review-moderation {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 11px;
        }

        .success,
        .error {
          margin: 11px 0 0;
          padding: 9px 10px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
        }

        .success {
          border: 1px solid #a7f3d0;
          background: #ecfdf5;
          color: #047857;
        }

        .error {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        @media (max-width: 600px) {
          .booking-top {
            flex-direction: column;
            gap: 8px;
          }

          .booking-details {
            grid-template-columns: 1fr;
          }

          .actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .button {
            width: 100%;
          }

          .rating-row {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
          }

          .rating-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="booking-list">
        {items.map((booking) => {
          const existingReview = reviews[booking._id];

          return (
            <article
              className="booking-item"
              key={booking._id}
            >
          <div className="booking-top">
          <div className="booking-heading">
          <h3 className="booking-title">
          {booking.service}
          </h3>

          <p className="booking-artist">
             Artist:{" "}
          {booking.artistId?.name ||
            "Artist"}
          </p>
      </div>

      <div className="booking-top-actions">
      <span className="status">
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
                    Artist Category
                  </span>

                  <span className="detail-value">
                    {booking.artistId?.category ||
                      "Creative Professional"}
                  </span>
                </div>
              </div>

              {booking.status === "quoted" && (
                <div className="quote-box">
                  <span className="quote-label">
                    Artist Quote
                  </span>

                  <p className="quote-amount">
                    ₹
                    {booking.quoteAmount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  {booking.quoteNote && (
                    <p className="quote-note">
                      {booking.quoteNote}
                    </p>
                  )}

                  <div className="actions">
                    <button
                      type="button"
                      className="button accept-button"
                      onClick={() =>
                        respondToQuote(
                          booking._id,
                          "accept"
                        )
                      }
                      disabled={
                        respondingId === booking._id
                      }
                    >
                      {respondingId === booking._id
                        ? "Processing..."
                        : "Accept Quote"}
                    </button>

                    <button
                      type="button"
                      className="button reject-button"
                      onClick={() =>
                        respondToQuote(
                          booking._id,
                          "reject"
                        )
                      }
                      disabled={
                        respondingId === booking._id
                      }
                    >
                      Reject Quote
                    </button>
                  </div>
                </div>
              )}

              {booking.status === "completed" &&
                !existingReview && (
                  <div className="review-box">
                    <h4 className="review-title">
                      Rate Your Experience
                    </h4>

                    <p className="review-subtitle">
                      Please rate your experience with
                      this artist.
                    </p>

                    <div className="rating-row">
                      {[1, 2, 3, 4, 5].map(
                        (rating) => (
                          <button
                            key={rating}
                            type="button"
                            className={`rating-button ${
                              reviewRatings[
                                booking._id
                              ] === rating
                                ? "rating-button-selected"
                                : ""
                            }`}
                            onClick={() =>
                              setReviewRatings(
                                (current) => ({
                                  ...current,
                                  [booking._id]:
                                    rating,
                                })
                              )
                            }
                            disabled={
                              reviewSubmittingId ===
                              booking._id
                            }
                          >
                            {rating}
                          </button>
                        )
                      )}
                    </div>

                    <textarea
                      className="review-textarea"
                      value={
                        reviewTexts[booking._id] ||
                        ""
                      }
                      onChange={(event) =>
                        setReviewTexts((current) => ({
                          ...current,
                          [booking._id]:
                            event.target.value,
                        }))
                      }
                      maxLength={1000}
                      placeholder="Write a short review..."
                      disabled={
                        reviewSubmittingId ===
                        booking._id
                      }
                    />

                    <button
                      type="button"
                      className="button review-submit"
                      onClick={() =>
                        submitReview(booking._id)
                      }
                      disabled={
                        reviewSubmittingId ===
                        booking._id
                      }
                    >
                      {reviewSubmittingId === booking._id
                        ? "Submitting..."
                        : "Submit Review"}
                    </button>
                  </div>
                )}

              {existingReview && (
                <div className="review-submitted">
                  <p className="review-submitted-title">
                    Your Review
                  </p>

                  <div className="review-stars">
                    {"★".repeat(existingReview.rating)}
                    {"☆".repeat(
                      5 - existingReview.rating
                    )}
                  </div>

                  {existingReview.review && (
                    <p className="review-submitted-text">
                      {existingReview.review}
                    </p>
                  )}

                  <p className="review-moderation">
                    Status:{" "}
                    {existingReview.moderationStatus}
                  </p>
                </div>
              )}

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
            </article>
          );
        })}
      </div>
    </section>
  );
}