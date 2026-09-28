import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";
import Review from "@/models/Review";
import PerformanceVideo from "./PerformanceVideo";
import AudioPlayer from "./AudioPlayer";
import ResumeViewer from "./ResumeViewer";
import PortfolioGallery from "./PortfolioGallery";
import EnquiryForm from "./EnquiryForm";
import "../../auth.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  await connectDB();

  const profile = await Profile.findOne({
  _id: id,
  blocked: { $ne: true },
  deactivated: { $ne: true },
})
  .select(
    "name category location profilePhoto experience contactDetails portfolio resume video audio verified featured"
  )
  .lean();

if (!profile) {
  notFound();
}

const reviews = await Review.find({
  artistId: profile._id,
  moderationStatus: "approved",
})
  .populate({
    path: "customerId",
    select: "name",
  })
  .sort({ createdAt: -1 })
  .lean();

const reviewCount = reviews.length;

const averageRating =
  reviewCount > 0
    ? (
        reviews.reduce(
          (total, item) => total + Number(item.rating),
          0
        ) / reviewCount
      ).toFixed(1)
    : "0.0";
    
  return (
    <>
      <style>{`
        .public-profile-page {
          min-height: 100vh;
          padding: 32px 20px 70px;
          background: #faf9fc;
        }

        .public-profile-container {
          width: min(100%, 980px);
          margin: 0 auto;
        }

        .public-profile-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .public-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 800;
        }

        .public-brand-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #fff;
          background: var(--primary);
          font-size: 12px;
        }

        .public-home {
          color: var(--primary);
          font-size: 13px;
          font-weight: 800;
        }

        .public-card {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 28px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .public-header {
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 36px;
          background:
            linear-gradient(
              135deg,
              var(--primary-soft),
              #ffffff 65%
            );
          border-bottom: 1px solid var(--border);
        }

        .public-header > div {
         min-width: 0;
         flex: 1;
        }

        .public-badges {
         max-width: 100%;
        }

        .public-badge {
         max-width: 100%;
         overflow: hidden;
         text-overflow: ellipsis;
        }

        .public-photo,
        .public-photo-placeholder {
          width: 132px;
          height: 132px;
          flex: 0 0 132px;
          border-radius: 50%;
        }

        .public-photo {
          object-fit: cover;
          border: 5px solid #fff;
          box-shadow: var(--shadow-md);
        }

        .public-photo-placeholder {
          display: grid;
          place-items: center;
          color: var(--primary);
          background: #fff;
          font-size: 40px;
          font-weight: 800;
          box-shadow: var(--shadow-sm);
        }

        .public-name {
          color: var(--text-primary);
          font-size: clamp(30px, 5vw, 46px);
          line-height: 1.05;
          letter-spacing: -1.8px;
          font-weight: 800;
        }

                .public-badges {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }

        .public-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .5px;
          white-space: nowrap;
        }

        .public-badge-verified {
          color: #176b3a;
          background: #e8f7ee;
          border: 1px solid #bfe8ce;
        }

        .public-badge-featured {
          color: #8a5a00;
          background: #fff5d9;
          border: 1px solid #f1d58b;
        }

        @media (max-width: 600px) {
          .public-badges {
            gap: 6px;
            margin-top: 8px;
          }

          .public-badge {
            min-height: 26px;
            padding: 0 8px;
            font-size: 9px;
          }
        }

        .public-category {
          margin-top: 10px;
          color: var(--primary);
          font-size: 16px;
          font-weight: 800;
        }

        .public-location {
          margin-top: 6px;
          color: var(--text-secondary);
          font-size: 14px;
        }

                .public-rating-summary {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 9px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 700;
        }

        .public-rating-stars {
          color: #f5b301;
          font-size: 17px;
          letter-spacing: 1px;
        }

        .public-rating-summary strong {
          color: var(--text-primary);
          font-size: 14px;
        }

        .public-body {
          padding: 32px 36px 38px;
        }

        .public-section {
          margin-bottom: 32px;
        }

        .public-section:last-child {
          margin-bottom: 0;
        }

        .public-section-title {
          margin-bottom: 15px;
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 800;
        }

        .public-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .public-info-column {
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .public-info {
          width: 100%;
          box-sizing: border-box;
          padding: 17px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: var(--surface-soft);
        }
 
        .public-info-label {
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .7px;
          text-transform: uppercase;
        }

        .public-info-value {
          margin-top: 7px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 700;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .public-info:first-child .public-info-value {
          max-height: 120px;
          overflow-y: auto;
          padding-right: 6px;
       }

        .public-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .public-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 17px;
          border-radius: 11px;
          color: var(--primary);
          background: var(--primary-soft);
          font-size: 13px;
          font-weight: 800;
        }

        .public-action.primary {
          color: #fff;
          background: var(--primary);
        }

        .performance-video-viewer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.78);
}

.performance-video-close {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 10000;
  border: 0;
  padding: 0;
  background: #fff;
  color: #111;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.performance-video-player {
  display: block;
  width: auto;
  max-width: 90vw;
  max-height: 90vh;
}

        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .portfolio-item {
          overflow: hidden;
          aspect-ratio: 1;
          border-radius: 14px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
        }

        .portfolio-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

                .portfolio-item {
          width: 100%;
          padding: 0;
          border: 1px solid var(--border);
          cursor: pointer;
          appearance: none;
        }

        .portfolio-viewer {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.88);
        }

        .portfolio-viewer-image {
          display: block;
          max-width: min(92vw, 1100px);
          max-height: 86vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .portfolio-viewer-close {
          position: absolute;
          top: 20px;
          right: 22px;
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          font-size: 28px;
          line-height: 1;
          cursor: pointer;
        }

        .portfolio-viewer-nav {
          position: absolute;
          top: 50%;
          width: 46px;
          height: 46px;
          border: 0;
          border-radius: 50%;
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          font-size: 34px;
          line-height: 1;
          cursor: pointer;
          transform: translateY(-50%);
        }

        .portfolio-viewer-prev {
          left: 22px;
        }

        .portfolio-viewer-next {
          right: 22px;
        }

        .portfolio-viewer-count {
          position: absolute;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }

        .portfolio-viewer-close:hover,
        .portfolio-viewer-nav:hover {
          background: rgba(255, 255, 255, 0.22);
        }

        @media (max-width: 600px) {
          .portfolio-viewer {
            padding: 14px;
          }

          .portfolio-viewer-image {
            max-width: 94vw;
            max-height: 80vh;
            border-radius: 8px;
          }

          .portfolio-viewer-close {
            top: 12px;
            right: 12px;
            width: 38px;
            height: 38px;
            font-size: 25px;
          }

          .portfolio-viewer-nav {
            width: 40px;
            height: 40px;
            font-size: 29px;
          }

          .portfolio-viewer-prev {
            left: 10px;
          }

          .portfolio-viewer-next {
            right: 10px;
          }
        }

        @media (max-width: 600px) {
          .public-profile-page {
            padding: 18px 14px 45px;
          }

          .public-profile-top {
            margin-bottom: 17px;
          }

          .public-brand {
            font-size: 16px;
          }

          .public-home {
            font-size: 12px;
          }

          .public-header {
            align-items: flex-start;
            gap: 18px;
            padding: 23px 20px;
          }

          .public-photo,
          .public-photo-placeholder {
            width: 86px;
            height: 86px;
            flex-basis: 86px;
          }

          .public-photo-placeholder {
            font-size: 27px;
          }

          .public-name {
            font-size: 27px;
            letter-spacing: -1px;
          }

          .public-category {
            font-size: 14px;
          }

          .public-location {
            font-size: 13px;
          }

          .public-body {
            padding: 24px 20px 28px;
          }

          .public-info-grid {
            grid-template-columns: 1fr;
          }

          .portfolio-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .public-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .public-action {
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .public-profile-page {
            padding-left: 11px;
            padding-right: 11px;
          }

          .public-header {
            gap: 13px;
            padding: 19px 15px;
          }

          .public-photo,
          .public-photo-placeholder {
            width: 72px;
            height: 72px;
            flex-basis: 72px;
          }

          .public-name {
            font-size: 23px;
          }

          .public-body {
            padding-left: 15px;
            padding-right: 15px;
          }
        }

          @media (max-width: 600px) {
          .public-header {
            flex-wrap: wrap;
        }

          .public-header > div {
            min-width: 0;
            flex: 1 1 0;
        }

          .public-badges {
            width: 100%;
            max-width: none;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
        }

          .public-badge {
            flex: 0 0 auto;
            width: fit-content;
            max-width: none;
            box-sizing: border-box;
            overflow: visible;
            text-overflow: clip;
            white-space: nowrap;
         }
       }

          @media (max-width: 600px) {
          .public-header {
            display: grid;
            grid-template-columns: 86px minmax(0, 1fr);
           gap: 10px 18px;
           align-items: start;
        }

          .public-header > div {
            display: contents;
         }

          .public-name {
            grid-column: 2;
            min-width: 0;
         }

          .public-badges,
          .public-category,
          .public-location {
            grid-column: 1 / -1;
        }

          .public-badges {
            width: 100%;
            min-width: 0;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 7px;
            margin-top: 0;
       }

          .public-badge {
            flex: 0 0 auto;
            width: auto;
            max-width: none;
            min-width: 0;
            overflow: visible;
            text-overflow: clip;
            white-space: nowrap;
       }

          .public-category {
            margin-top: 0;
        }

          .public-location {
            margin-top: 0;
          }
        }

          @media (max-width: 380px) {
          .public-header {
            grid-template-columns: 72px minmax(0, 1fr);
            gap: 8px 13px;
        }
      }

          .public-review-summary {
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: var(--surface-soft);
          margin-bottom: 14px;
        }

        .public-review-average {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .public-review-big-rating {
          color: var(--text-primary);
          font-size: 30px;
          font-weight: 900;
        }

        .public-review-big-stars {
          color: #f5b301;
          font-size: 20px;
          letter-spacing: 1px;
        }

        .public-review-count {
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 700;
        }

        .public-review-list {
          display: grid;
          gap: 12px;
        }

        .public-review-card {
          padding: 17px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: var(--surface);
        }

        .public-review-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .public-review-top strong {
          color: var(--text-primary);
          font-size: 14px;
        }

        .public-review-stars {
          color: #f5b301;
          font-size: 16px;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .public-review-text {
          margin-top: 9px;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.55;
        }

        .public-review-date {
          margin-top: 9px;
          color: var(--text-muted);
          font-size: 11px;
        }

        @media (max-width: 600px) {
          .public-review-top {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

          .public-review-big-rating {
            font-size: 26px;
          }
        }

  `}</style>

      <main className="public-profile-page">
        <div className="public-profile-container">
          <div className="public-profile-top">
            <Link href="/" className="public-brand">
              <img
                src="/BmKalaHub.png"
                alt="BmKalaHub"
                className="public-brand-mark"
             />
              <span>BmKalaHub</span>
            </Link>

            <Link href="/" className="public-home">
              Home
            </Link>
          </div>

          <article className="public-card">
            <header className="public-header">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="public-photo"
                />
              ) : (
                <div className="public-photo-placeholder">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="public-name">
                  {profile.name}
                </h1>
              
              {(profile.verified || profile.featured) && (
              <div className="public-badges">
              {profile.verified && (
             <span className="public-badge public-badge-verified">
                   ✅ VERIFIED ARTIST
             </span>
            )}

             {profile.featured && (
             <span className="public-badge public-badge-featured">
                  ⭐ FEATURED ARTIST
            </span>
           )}
            </div>
           )}
                <p className="public-category">
                  {profile.category}
                </p>

                <p className="public-location">
                  {profile.location}
                </p>

              {reviewCount > 0 && (
                <div className="public-rating-summary">
                <span className="public-rating-stars">
              {"★".repeat(Math.round(Number(averageRating)))}
                </span>

              <strong>{averageRating}</strong>

              <span>
                ({reviewCount}{" "}
               {reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
           )}
          </div>

          </header>
            <div className="public-body">
              <section className="public-section">
                <h2 className="public-section-title">
                  Professional information
                </h2>

                <div className="public-info-grid">
  <div className="public-info-column">
    <Info
      label="Experience"
      value={profile.experience || "Not added"}
    />

    <Info
      label="Contact"
      value={
        profile.contactDetails || "Not added"
      }
    />
  </div>

  <div className="public-info-column">
    <Info
      label="Location"
      value={profile.location}
    />

    <Info
      label="Category"
      value={profile.category}
    />
  </div>
</div>

                    {reviewCount > 0 && (
                <section className="public-section">
                  <h2 className="public-section-title">
                    Reviews & Ratings
                  </h2>

                  <div className="public-review-summary">
                    <div className="public-review-average">
                      <span className="public-review-big-rating">
                        {averageRating}
                      </span>

                      <span className="public-review-big-stars">
                        {"★".repeat(
                          Math.round(Number(averageRating))
                        )}
                      </span>

                      <span className="public-review-count">
                        Based on {reviewCount}{" "}
                        {reviewCount === 1
                          ? "review"
                          : "reviews"}
                      </span>
                    </div>
                  </div>

                  <div className="public-review-list">
                    {reviews.map((item) => {
                      const customer = item.customerId as unknown as {
                        name?: string;
                      };

                      return (
                        <article
                          key={String(item._id)}
                          className="public-review-card"
                        >
                          <div className="public-review-top">
                            <strong>
                              {customer?.name || "Customer"}
                            </strong>

                            <span className="public-review-stars">
                              {"★".repeat(Number(item.rating))}
                            </span>
                          </div>

                          {item.review && (
                            <p className="public-review-text">
                              {item.review}
                            </p>
                          )}

                          <p className="public-review-date">
                            {new Date(
                              item.createdAt
                            ).toLocaleDateString("en-IN")}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              </section>

              {profile.portfolio?.length > 0 && (
              <section className="public-section">
              <h2 className="public-section-title">
                 Portfolio
              </h2>

              <PortfolioGallery
               images={profile.portfolio}
              />
              </section>
             )}
              {(profile.resume ||
                profile.video ||
                profile.audio) && (
                <section className="public-section">
                  <h2 className="public-section-title">
                    Portfolio & Media
                  </h2>

                  <div className="public-actions">
                    {profile.resume && (
                    <ResumeViewer resumeUrl={profile.resume} />
                  )}

                    {profile.video && (
                    <PerformanceVideo videoUrl={profile.video} />
                  )}

                    {profile.audio && (
                    <AudioPlayer audioUrl={profile.audio} />
                  )}
                  </div>
                </section>
              )}

              {profile.contactDetails && (
                <section className="public-section">
                  <div className="public-actions">
                    <a
                      href={`https://wa.me/${profile.contactDetails.replace(
                        /[^0-9]/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="public-action primary"
                    >
                      Contact Artist
                    </a>
                  </div>
                </section>
              )}
             <EnquiryForm artistId={profile._id.toString()} />
            </div>
          </article>
        </div>
      </main>
    </>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="public-info">
      <p className="public-info-label">{label}</p>
      <p className="public-info-value">{value}</p>
    </div>
  );
}