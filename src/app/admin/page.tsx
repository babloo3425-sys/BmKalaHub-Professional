"use client";

import { useEffect, useState } from "react";

type Artist = {
  _id: string;
  name: string;
  category: string;
  location: string;
  profilePhoto?: string;
  experience?: string;
  contactDetails?: string;
  verified?: boolean;
  featured?: boolean;
  blocked?: boolean;
  deactivated?: boolean;
};

 type AdminReview = {
  _id: string;
  bookingId: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  } | null;
  artist: {
    _id: string;
    name: string;
    category: string;
    location: string;
    profilePhoto?: string;
  } | null;
  rating: number;
  review: string;
  moderationStatus:
    | "pending"
    | "approved"
    | "rejected";
  createdAt: string;
  updatedAt: string;
};

export default function AdminPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState("");

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewActionLoading, setReviewActionLoading] =
  useState("");
  const [reviewError, setReviewError] = useState("");

  async function handleAction(
    artistId: string,
    action: "verify" | "feature" | "block" | "deactivate",
    currentValue: boolean,
    label: string
  ) {
    const confirmed = window.confirm(
      `${currentValue ? "Remove" : "Apply"} ${label} status?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(`${artistId}-${action}`);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/artists/${artistId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            value: !currentValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to update ${label}.`
        );
      }

      setArtists((current) =>
        current.map((item) =>
          item._id === artistId
            ? {
                ...item,
                verified:
                  data.profile.verified,
                featured:
                  data.profile.featured,
                blocked:
                  data.profile.blocked,
                deactivated:
                  data.profile.deactivated,
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to update ${label}.`
      );
    } finally {
      setActionLoading("");
    }
  }

     async function handleReviewAction(
  reviewId: string,
  action: "approve" | "reject"
) {
  const label =
    action === "approve"
      ? "Approve"
      : "Reject";

  const confirmed = window.confirm(
    `${label} this review?`
  );

  if (!confirmed) {
    return;
  }

  setReviewActionLoading(
    `${reviewId}-${action}`
  );

  setReviewError("");

  try {
    const response = await fetch(
      `/api/admin/reviews/${reviewId}`,
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
      throw new Error(
        data.message ||
          `Unable to ${action} review.`
      );
    }

    setReviews((current) =>
      current.map((item) =>
        item._id === reviewId
          ? {
              ...item,
              moderationStatus:
                data.review.moderationStatus,
              updatedAt:
                data.review.updatedAt,
            }
          : item
      )
    );
  } catch (err) {
    setReviewError(
      err instanceof Error
        ? err.message
        : `Unable to ${action} review.`
    );
  } finally {
    setReviewActionLoading("");
  }
}

  useEffect(() => {
    async function loadArtists() {
      try {
        const response = await fetch("/api/admin/artists", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load artists."
          );
        }

        setArtists(data.profiles || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load artists."
        );
      } finally {
        setLoading(false);
      }
    }

    loadArtists();
  }, []);

      useEffect(() => {
  async function loadReviews() {
    try {
      const response = await fetch(
        "/api/admin/reviews",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load reviews."
        );
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Unable to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  }

  loadReviews();
}, []);

  return (
    <main className="admin-page">
      <style>{`
        .admin-page {
          min-height: 100vh;
          padding: 42px 20px 70px;
          background: var(--background);
          color: var(--text-primary);
        }

        .admin-container {
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        .admin-header {
          margin-bottom: 30px;
        }

        .admin-brand {
         display: flex;
         align-items: center;
         gap: 14px;
         margin-bottom: 24px;
        }

        .admin-brand-mark {
         width: 48px;
         height: 48px;
         display: block;
         object-fit: contain;
         border-radius: 50%;
        }

        .admin-brand-name {
         color: var(--text-primary);
         font-size: 20px;
         font-weight: 800;
        }

        .admin-header-top {
         display: flex;
         align-items: flex-start;
         justify-content: space-between;
         gap: 20px;
        }

        .admin-home-button {
         display: inline-flex;
         align-items: center;
         justify-content: center;
         min-height: 44px;
         padding: 0 18px;
         border-radius: 11px;
         color: var(--primary);
         background: var(--primary-soft);
         font-size: 13px;
         font-weight: 800;
         text-decoration: none;
         white-space: nowrap;
         transition:
         background 160ms ease,
         color 160ms ease;
        }

        .admin-home-button:hover {
         color: #fff;
         background: var(--primary);
        }

        .admin-kicker {
          margin: 0 0 7px;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .admin-title {
          margin: 0;
          font-size: clamp(30px, 5vw, 46px);
          line-height: 1.05;
          letter-spacing: -1.5px;
        }

        .admin-subtitle {
          max-width: 700px;
          margin: 12px 0 0;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.7;
        }

        .admin-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 25px;
        }

        .admin-stat {
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .admin-stat-label {
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .admin-stat-value {
          margin-top: 7px;
          color: var(--text-primary);
          font-size: 26px;
          font-weight: 800;
        }

        .admin-list {
          display: grid;
          gap: 14px;
        }

                .admin-reviews-section {
          margin-bottom: 30px;
        }

        .admin-section-header {
          margin-bottom: 14px;
        }

        .admin-section-title {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
        }

        .admin-section-subtitle {
          margin: 6px 0 0;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
        }

        .admin-review-list {
          display: grid;
          gap: 12px;
        }

        .admin-review {
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .admin-review-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .admin-review-customer {
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 800;
        }

        .admin-review-email {
          margin-top: 4px;
          color: var(--text-muted);
          font-size: 11px;
        }

        .admin-review-rating {
          color: #f5b301;
          font-size: 16px;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .admin-review-artist {
          margin-top: 10px;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
        }

        .admin-review-text {
          margin: 10px 0 0;
          color: var(--text-primary);
          font-size: 13px;
          line-height: 1.6;
        }

        .admin-review-status {
          display: inline-flex;
          margin-top: 11px;
          padding: 4px 8px;
          border-radius: 7px;
          background: var(--surface-soft);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .admin-review-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 13px;
        }

        .admin-review-action {
          min-height: 36px;
          padding: 0 13px;
          border: 0;
          border-radius: 8px;
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .admin-review-action.approve {
          background: #16835b;
        }

        .admin-review-action.reject {
          background: #c62828;
        }

        .admin-review-action:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .admin-review-date {
          margin-top: 9px;
          color: var(--text-muted);
          font-size: 10px;
        }

        @media (max-width: 600px) {
          .admin-review-top {
            flex-direction: column;
          }

          .admin-review-actions {
            width: 100%;
          }

          .admin-review-action {
            flex: 1;
          }
        }

        .admin-artist {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .admin-photo,
        .admin-placeholder {
          width: 76px;
          height: 76px;
          flex: 0 0 76px;
          border-radius: 50%;
        }

        .admin-photo {
          object-fit: cover;
        }

        .admin-placeholder {
          display: grid;
          place-items: center;
          color: var(--primary);
          background: var(--primary-soft);
          font-size: 25px;
          font-weight: 800;
        }

        .admin-artist-info {
          min-width: 0;
          flex: 1;
        }

        .admin-artist-name {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .admin-artist-meta {
          margin-top: 5px;
          color: var(--text-secondary);
          font-size: 13px;
        }

        .admin-status {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 9px;
        }

        .admin-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .admin-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 13px;
          border: 0;
          border-radius: 9px;
          color: #fff;
          background: var(--primary);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          transition:
            transform 160ms ease,
            opacity 160ms ease;
        }

        .admin-action:hover {
          transform: translateY(-1px);
        }

        .admin-action:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .admin-action.feature {
          background: #b77900;
        }

        .admin-action.block {
          background: #c62828;
        }

        .admin-action.deactivate {
          background: #5f6673;
        }

        .admin-action.view {
          background: var(--text-primary);
        }

        @media (max-width: 700px) {
        
        .admin-brand {
         gap: 10px;
         margin-bottom: 18px;
        }

        .admin-brand-mark {
         width: 44px;
         height: 44px;
        }

        .admin-brand-name {
         font-size: 18px;
       }

        .admin-header-top {
         flex-direction: column;
         align-items: stretch;
         gap: 14px;
        }

        .admin-home-button {
         width: 100%;
         box-sizing: border-box;
         min-height: 40px;
         padding: 0 14px;
         font-size: 12px;
         text-align: center;
        }

        .admin-actions {
            width: 100%;
          }

          .admin-action {
            flex: 1 1 calc(50% - 8px);
          }
        }

        .admin-badge {
          padding: 4px 8px;
          border-radius: 7px;
          background: var(--surface-soft);
          color: var(--text-secondary);
          font-size: 10px;
          font-weight: 800;
        }

        .admin-error,
        .admin-empty {
          padding: 30px 20px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          text-align: center;
          color: var(--text-secondary);
        }

        @media (max-width: 700px) {
          .admin-page {
            padding: 25px 14px 45px;
          }

          .admin-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-artist {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .admin-summary {
            grid-template-columns: 1fr 1fr;
          }

          .admin-artist {
            gap: 12px;
            padding: 15px;
          }

          .admin-photo,
          .admin-placeholder {
            width: 62px;
            height: 62px;
            flex-basis: 62px;
          }

          .admin-artist-name {
            font-size: 17px;
          }
        }
      `}</style>

      <div className="admin-container">
        <header className="admin-header">
      <div className="admin-brand">
  <img
    src="/BmKalaHub.png"
    alt="BmKalaHub"
    className="admin-brand-mark"
  />
  <span className="admin-brand-name">BmKalaHub</span>
  </div>

  <div className="admin-header-top">
  <div>
    <p className="admin-kicker">ADMIN</p>

    <h1 className="admin-title">
      Artist Management
    </h1>
  </div>

  <a
    href="/"
    className="admin-home-button"
  >
    Home
  </a>
</div>

      <p className="admin-subtitle">
         Manage artist profiles, verification,
         featured status and account visibility.
      </p>
      </header>

        {!loading && !error && (
          <div className="admin-summary">
            <div className="admin-stat">
              <div className="admin-stat-label">
                Total Artists
              </div>
              <div className="admin-stat-value">
                {artists.length}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-label">
                Verified
              </div>
              <div className="admin-stat-value">
                {artists.filter((artist) => artist.verified).length}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-label">
                Featured
              </div>
              <div className="admin-stat-value">
                {artists.filter((artist) => artist.featured).length}
              </div>
            </div>

            <div className="admin-stat">
              <div className="admin-stat-label">
                Blocked
              </div>
              <div className="admin-stat-value">
                {artists.filter((artist) => artist.blocked).length}
              </div>
            </div>
          </div>
        )}

                      <section className="admin-reviews-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              Reviews Management
            </h2>

            <p className="admin-section-subtitle">
              Review submitted by customers. Pending
              reviews require moderation before appearing
              on public artist profiles.
            </p>
          </div>

          {reviewsLoading && (
            <div className="admin-empty">
              Loading reviews...
            </div>
          )}

          {!reviewsLoading && reviewError && (
            <div className="admin-error">
              {reviewError}
            </div>
          )}

          {!reviewsLoading &&
            !reviewError &&
            reviews.length === 0 && (
              <div className="admin-empty">
                No reviews found.
              </div>
            )}

          {!reviewsLoading &&
            !reviewError &&
            reviews.length > 0 && (
              <div className="admin-review-list">
                {reviews.map((review) => (
                  <article
                    key={review._id}
                    className="admin-review"
                  >
                    <div className="admin-review-top">
                      <div>
                        <div className="admin-review-customer">
                          {review.customer?.name ||
                            "Customer"}
                        </div>

                        {review.customer?.email && (
                          <div className="admin-review-email">
                            {review.customer.email}
                          </div>
                        )}
                      </div>

                      <div className="admin-review-rating">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(
                          5 - review.rating
                        )}
                      </div>
                    </div>

                    <div className="admin-review-artist">
                      Artist:{" "}
                      {review.artist?.name ||
                        "Unknown Artist"}
                    </div>

                    {review.review && (
                      <p className="admin-review-text">
                        {review.review}
                      </p>
                    )}

                    <span className="admin-review-status">
                      {review.moderationStatus}
                    </span>

                    <div className="admin-review-date">
                      Submitted:{" "}
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </div>

                    {review.moderationStatus ===
                      "pending" && (
                      <div className="admin-review-actions">
                        <button
                          type="button"
                          className="admin-review-action approve"
                          disabled={
                            reviewActionLoading ===
                            `${review._id}-approve`
                          }
                          onClick={() =>
                            handleReviewAction(
                              review._id,
                              "approve"
                            )
                          }
                        >
                          {reviewActionLoading ===
                          `${review._id}-approve`
                            ? "Approving..."
                            : "✓ Approve"}
                        </button>

                        <button
                          type="button"
                          className="admin-review-action reject"
                          disabled={
                            reviewActionLoading ===
                            `${review._id}-reject`
                          }
                          onClick={() =>
                            handleReviewAction(
                              review._id,
                              "reject"
                            )
                          }
                        >
                          {reviewActionLoading ===
                          `${review._id}-reject`
                            ? "Rejecting..."
                            : "✕ Reject"}
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
        </section>

        {loading && (
          <div className="admin-empty">
            Loading artists...
          </div>
        )}

        {!loading && error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {!loading && !error && artists.length === 0 && (
          <div className="admin-empty">
            No artist profiles found.
          </div>
        )}

        {!loading && !error && artists.length > 0 && (
          <div className="admin-list">
            {artists.map((artist) => (
              <article
                key={artist._id}
                className="admin-artist"
              >
                {artist.profilePhoto ? (
                  <img
                    src={artist.profilePhoto}
                    alt={artist.name}
                    className="admin-photo"
                  />
                ) : (
                  <div className="admin-placeholder">
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="admin-artist-info">
                  <h2 className="admin-artist-name">
                    {artist.name}
                  </h2>

                  <p className="admin-artist-meta">
                    {artist.category} • {artist.location}
                  </p>

                  <div className="admin-status">
                    {artist.verified && (
                      <span className="admin-badge">
                        Verified
                      </span>
                    )}

                    {artist.featured && (
                      <span className="admin-badge">
                        Featured
                      </span>
                    )}

                    {artist.blocked && (
                      <span className="admin-badge">
                        Blocked
                      </span>
                    )}

                    {artist.deactivated && (
                      <span className="admin-badge">
                        Deactivated
                      </span>
                    )}
                  </div>

                    <div className="admin-actions">
                    <a
                      href={`/admin/artists/${artist._id}`}
                      className="admin-action view"
                    >
                         👁 View
                    </a>

                    <button
                      type="button"
                      className="admin-action"
                      disabled={
                        actionLoading ===
                        `${artist._id}-verify`
                      }
                      onClick={() =>
                        handleAction(
                          artist._id,
                          "verify",
                          Boolean(artist.verified),
                          "Verify"
                        )
                      }
                    >
                      {artist.verified
                        ? "✓ Unverify"
                        : "✓ Verify"}
                    </button>

                    <button
                      type="button"
                      className="admin-action feature"
                      disabled={
                        actionLoading ===
                        `${artist._id}-feature`
                      }
                      onClick={() =>
                        handleAction(
                          artist._id,
                          "feature",
                          Boolean(artist.featured),
                          "Feature"
                        )
                      }
                    >
                      {artist.featured
                        ? "★ Unfeature"
                        : "★ Feature"}
                    </button>

                    <button
                      type="button"
                      className="admin-action block"
                      disabled={
                        actionLoading ===
                        `${artist._id}-block`
                      }
                      onClick={() =>
                        handleAction(
                          artist._id,
                          "block",
                          Boolean(artist.blocked),
                          "Block"
                        )
                      }
                    >
                      {artist.blocked
                        ? "⊘ Unblock"
                        : "⊘ Block"}
                    </button>

                    <button
                      type="button"
                      className="admin-action deactivate"
                      disabled={
                        actionLoading ===
                        `${artist._id}-deactivate`
                      }
                      onClick={() =>
                        handleAction(
                          artist._id,
                          "deactivate",
                          Boolean(artist.deactivated),
                          "Deactivate"
                        )
                      }
                    >
                      {artist.deactivated
                        ? "▶ Activate"
                        : "Ⅱ Deactivate"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}