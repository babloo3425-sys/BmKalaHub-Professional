import Link from "next/link";
import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";

const categories = [
  "Musician",
  "Singer",
  "Performer",
  "DJ",
  "Photographer",
  "Dancer",
  "Band",
  "Decorator",
];

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    location?: string;
    featured?: string;
  }>;
}) {
  await connectDB();

  const params = await searchParams;

  const category = params.category?.trim();
  const search = params.search?.trim();
  const location = params.location?.trim();
  const featured = params.featured === "true";

  const query: Record<string, unknown> = {
    blocked: { $ne: true },
    deactivated: { $ne: true },
  };

  if (category) {
    query.category = {
      $regex: `^${category}$`,
      $options: "i",
    };
  }

  if (search) {
    query.name = {
      $regex: search,
      $options: "i",
    };
  }

  if (location) {
    query.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (featured) {
    query.featured = true;
  }

  const profiles = await Profile.find(query)
    .select(
      "name category location profilePhoto experience portfolio verified featured"
    )
    .sort({ createdAt: -1 })
    .lean();

  const pageTitle = featured
    ? "Featured Artists"
    : "Discover Artists";

  const activeCategory = category || "";

  return (
    <main className="artists-page">
      <style>{`
        .artists-page {
          min-height: 100vh;
          padding: 34px 20px 70px;
          background: var(--background);
          color: var(--text-primary);
        }

        .artists-container {
          width: min(1220px, 100%);
          margin: 0 auto;
        }

        .artists-header {
          margin-bottom: 24px;
        }

        .artists-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 22px;
          color: var(--text-primary);
          font-size: 19px;
          font-weight: 800;
          text-decoration: none;
        }

        .artists-brand-mark {
          width: 46px;
          height: 46px;
          display: block;
          object-fit: contain;
          border-radius: 50%;
        }

        .artists-header-main {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .artists-heading {
          min-width: 0;
        }

        .artists-title {
          margin: 0;
          font-size: clamp(36px, 5vw, 58px);
          line-height: .98;
          letter-spacing: -2px;
          font-weight: 900;
        }

        .artists-title-accent {
          color: var(--primary);
        }

        .artists-subtitle {
          max-width: 650px;
          margin: 12px 0 0;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.6;
        }

        .artists-home {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .artists-search-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 210px auto;
          gap: 12px;
          margin-top: 26px;
        }

        .artists-search-input,
        .artists-location-input {
          width: 100%;
          min-height: 50px;
          box-sizing: border-box;
          padding: 0 16px;
          border: 1px solid var(--border);
          border-radius: 13px;
          background: var(--surface);
          color: var(--text-primary);
          font: inherit;
          font-size: 13px;
          outline: none;
          box-shadow: var(--shadow-sm);
        }

        .artists-search-input:focus,
        .artists-location-input:focus {
          border-color: var(--primary);
          box-shadow:
            0 0 0 3px rgba(99, 62, 255, .10),
            var(--shadow-sm);
        }

        .artists-search-button {
          min-height: 50px;
          padding: 0 20px;
          border: 0;
          border-radius: 13px;
          background: var(--primary);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .artists-filters {
          display: flex;
          align-items: center;
          gap: 9px;
          overflow-x: auto;
          padding: 2px 1px 7px;
          margin-top: 18px;
          scrollbar-width: thin;
        }

        .artists-filter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 16px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--surface);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .artists-filter.active {
          border-color: var(--primary);
          background: var(--primary);
          color: #fff;
        }

        .artists-filter:hover {
          border-color: var(--primary);
        }

        .artists-results-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin: 12px 0 16px;
        }

        .artists-count {
          margin: 0;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 700;
        }

        .artists-sort {
          display: inline-flex;
          align-items: center;
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .artists-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .artist-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .artist-card:hover {
          transform: translateY(-3px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .artist-photo-wrap {
          position: relative;
          overflow: hidden;
          background: var(--surface-soft);
        }

        .artist-photo,
        .artist-placeholder {
          display: block;
          width: 100%;
          aspect-ratio: 4 / 3;
        }

        .artist-photo {
          object-fit: cover;
        }

        .artist-placeholder {
          display: grid;
          place-items: center;
          color: var(--primary);
          background: var(--primary-soft);
          font-size: 42px;
          font-weight: 900;
        }

        .artist-image-top {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 6px;
          pointer-events: none;
        }

        .artist-featured-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          min-height: 28px;
          padding: 0 11px;
          border-radius: 999px;
          background: #ffd34d;
          color: #654700;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .2px;
          white-space: nowrap;
          box-shadow: 0 3px 9px rgba(0, 0, 0, .14);
        }

        .artist-media-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: rgba(0, 0, 0, .72);
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
          margin-left: auto;
        }

        .artist-name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .artist-verified-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 27px;
          padding: 0 10px;
          border-radius: 999px;
          background: #e7f8ed;
          border: 1px solid #b9e8c9;
          color: #178044;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .3px;
          white-space: nowrap;
        }

        .artist-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 15px;
        }

        .artist-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .artist-actions .profile-action {
          border: 1px solid var(--primary);
          background: #ffffff !important;
          color: var(--primary) !important;
        }

        .artist-actions .enquiry-action {
          border: 1px solid var(--primary);
          background: var(--primary) !important;
          color: #ffffff !important;
       }

        .artist-actions .profile-action:hover {
          background: var(--primary-soft) !important;
        }

        .artist-actions .enquiry-action:hover {
          background: var(--primary) !important;
          opacity: 0.92;
        }
        .artist-body {
          padding: 15px;
        }

        .artist-name {
          margin: 0;
          color: var(--text-primary);
          font-size: 18px;
          line-height: 1.2;
          font-weight: 900;
        }

        .artist-category {
          margin: 5px 0 0;
          color: var(--text-secondary);
          font-size: 12px;
          line-height: 1.4;
        }

        .artist-location {
          margin: 7px 0 0;
          color: var(--text-secondary);
          font-size: 12px;
          line-height: 1.4;
        }

        .artist-experience {
          display: -webkit-box;
          margin: 9px 0 0;
          color: var(--text-secondary);
          font-size: 12px;
          line-height: 1.45;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .artist-actions {
          display: grid;
          grid-template-columns: 1fr;
          margin-top: 13px;
        }

        .artist-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 39px;
          border: 1px solid var(--primary);
          border-radius: 9px;
          background: transparent;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .artist-action:hover {
          background: var(--primary-soft);
        }

        .empty-artists {
          padding: 60px 20px;
          border: 1px dashed var(--border);
          border-radius: 20px;
          background: var(--surface);
          text-align: center;
        }

        .empty-artists h2 {
          margin: 0;
          font-size: 22px;
        }

        .empty-artists p {
          margin: 8px 0 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .artists-bottom-note {
          width: fit-content;
          max-width: 100%;
          margin: 28px auto 0;
          padding: 12px 22px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--text-primary);
          text-align: center;
          font-size: 12px;
          font-weight: 800;
        }

        .artists-bottom-note span {
          color: var(--text-secondary);
          font-weight: 600;
        }

        @media (max-width: 1050px) {
          .artists-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .artists-search-row {
            grid-template-columns: minmax(0, 1fr) 190px auto;
          }
        }

        @media (max-width: 800px) {
          .artists-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .artists-header-main {
            align-items: flex-start;
            flex-direction: column;
          }

          .artists-home {
            width: 100%;
            box-sizing: border-box;
          }

          .artists-search-row {
            grid-template-columns: 1fr 1fr;
          }

          .artists-search-button {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 560px) {
          .artists-page {
            padding: 24px 14px 48px;
          }

          .artists-brand {
            margin-bottom: 18px;
            font-size: 18px;
          }

          .artists-brand-mark {
            width: 44px;
            height: 44px;
          }

          .artists-title {
            font-size: 36px;
            letter-spacing: -1.4px;
          }

          .artists-subtitle {
            font-size: 13px;
          }

          .artists-search-row {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .artists-search-button {
            grid-column: auto;
            width: 100%;
          }

          .artists-results-bar {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
          }

          .artists-sort {
            width: 100%;
            box-sizing: border-box;
            justify-content: center;
          }

          .artists-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .artist-body {
            padding: 16px;
          }

          .artist-name {
            font-size: 19px;
          }

          .artists-bottom-note {
            width: 100%;
            box-sizing: border-box;
            border-radius: 16px;
          }
        
          .artist-featured-badge {
            height: 26px;
            min-height: 26px;
            padding: 0 10px;
            font-size: 8px;
          }

          .artist-media-count {
            height: 26px;
            min-height: 26px;
            padding: 0 9px;
            font-size: 8px;
          }

          .artist-image-top {
            top: 8px;
            left: 8px;
            right: 8px;
          }
        }
 
       `}</style>

        <div className="artists-container">
        <header className="artists-header">
          <Link href="/" className="artists-brand">
            <img
              src="/BmKalaHub.png"
              alt="BmKalaHub"
              className="artists-brand-mark"
            />
            <span>BmKalaHub</span>
          </Link>

          <div className="artists-header-main">
            <div className="artists-heading">
              <h1 className="artists-title">
                Discover{" "}
                <span className="artists-title-accent">
                  Artists
                </span>
              </h1>

              <p className="artists-subtitle">
                Find the perfect artist for your next
                event, project or collaboration.
              </p>
            </div>

            <Link
              href="/"
              className="artists-home"
            >
              Back to Home
            </Link>
          </div>

          <form
            action="/artists"
            method="GET"
            className="artists-search-row"
          >
            {featured && (
              <input
                type="hidden"
                name="featured"
                value="true"
              />
            )}

            <input
              type="search"
              name="search"
              defaultValue={search || ""}
              placeholder="Search artists by name..."
              className="artists-search-input"
              aria-label="Search artists by name"
            />

            <input
              type="search"
              name="location"
              defaultValue={location || ""}
              placeholder="All locations"
              className="artists-location-input"
              aria-label="Search by location"
            />

            <button
              type="submit"
              className="artists-search-button"
            >
              Search Artists
            </button>
          </form>

          <nav
            className="artists-filters"
            aria-label="Artist categories"
          >
            <Link
              href={
                featured
                  ? "/artists?featured=true"
                  : "/artists"
              }
              className={`artists-filter ${
                !activeCategory
                  ? "active"
                  : ""
              }`}
            >
              All
            </Link>

            {categories.map((item) => {
              const params = new URLSearchParams();

              params.set("category", item);

              if (featured) {
                params.set("featured", "true");
              }

              return (
                <Link
                  key={item}
                  href={`/artists?${params.toString()}`}
                  className={`artists-filter ${
                    activeCategory.toLowerCase() ===
                    item.toLowerCase()
                      ? "active"
                      : ""
                  }`}
                >
                  {item}
                </Link>
              );
            })}

            <Link
              href="/categories"
              className="artists-filter"
            >
              More
            </Link>
          </nav>
        </header>

        <div className="artists-results-bar">
          <p className="artists-count">
            {profiles.length} artist
            {profiles.length === 1 ? "" : "s"} found
          </p>

          {featured ? (
            <Link
              href="/artists"
              className="artists-sort"
            >
              Showing: Featured
            </Link>
          ) : (
            <Link
              href="/artists?featured=true"
              className="artists-sort"
            >
              Sort: Featured
            </Link>
          )}
        </div>

        {profiles.length === 0 ? (
          <div className="empty-artists">
            <h2>No artists found</h2>

            <p>
              Try another category, artist name or
              location.
            </p>
          </div>
          ) : (
          <div className="artists-grid">
            {profiles.map((profile) => (
            <article
            key={profile._id.toString()}
            className="artist-card"
         >
          <div className="artist-photo-wrap">
            {profile.profilePhoto ? (
        <img
          src={profile.profilePhoto}
          alt={profile.name}
          className="artist-photo"
        />
      ) : (
        <div className="artist-placeholder">
          {profile.name
            .charAt(0)
            .toUpperCase()}
        </div>
       )}

        <div className="artist-image-top">
        {profile.featured && (
          <span className="artist-featured-badge">
            FEATURED
          </span>
        )}

          {profile.portfolio?.length > 0 && (
          <span className="artist-media-count">
            {profile.portfolio.length}{" "}
            {profile.portfolio.length === 1
              ? "image"
              : "images"}
          </span>
        )}
      </div>
    </div>

      <div className="artist-body">
      <div className="artist-name-row">
        <h2 className="artist-name">
          {profile.name}
        </h2>

        {profile.verified && (
          <span className="artist-verified-badge">
            VERIFIED
          </span>
        )}
      </div>

      <p className="artist-category">
        {profile.category}
      </p>

      <p className="artist-location">
        {profile.location}
      </p>

      {profile.experience && (
        <p className="artist-experience">
          {profile.experience}
        </p>
      )}

      <div className="artist-actions">
        <Link
          href={`/profile/${profile._id}`}
          className="artist-action profile-action"
        >
          View Profile
        </Link>

        <Link
          href={`/profile/${profile._id}`}
          className="artist-action enquiry-action"
        >
          Send Enquiry
        </Link>
       </div>
      </div>
      </article>
     ))}
    </div>
    )}

          {profiles.length > 0 && (
          <div className="artists-bottom-note">
            Discover talented artists
            <span>
              {" "}
              for performances, productions,
              events and collaborations.
            </span>
          </div>
        )}
      </div>
    </main>
  );
}