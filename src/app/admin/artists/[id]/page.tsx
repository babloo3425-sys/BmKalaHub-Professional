import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";
import Profile from "@/models/Profile";
import AdminMediaViewer from "./AdminMediaViewer";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminArtistViewPage({
  params,
}: Props) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  const { id } = await params;

  await connectDB();

  const profile = await Profile.findById(id)
    .select(
      "name category location profilePhoto experience contactDetails portfolio resume video audio verified featured blocked deactivated"
    )
    .lean();

  if (!profile) {
    notFound();
  }

  return (
    <main className="admin-view-page">
      <style>{`
        .admin-view-page {
          min-height: 100vh;
          padding: 40px 20px 70px;
          background: var(--background);
          color: var(--text-primary);
        }

        .admin-view-container {
          width: min(980px, 100%);
          margin: 0 auto;
        }

        .admin-view-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .admin-view-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 15px;
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
          background: var(--surface);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .admin-view-label {
          color: var(--primary);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .admin-view-card {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 26px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .admin-view-header {
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 32px;
          background:
            linear-gradient(
              135deg,
              var(--primary-soft),
              #ffffff 65%
            );
          border-bottom: 1px solid var(--border);
        }

        .admin-view-photo,
        .admin-view-placeholder {
          width: 125px;
          height: 125px;
          flex: 0 0 125px;
          border-radius: 50%;
        }

        .admin-view-photo {
          object-fit: cover;
          border: 5px solid #fff;
          box-shadow: var(--shadow-md);
        }

        .admin-view-placeholder {
          display: grid;
          place-items: center;
          color: var(--primary);
          background: #fff;
          font-size: 38px;
          font-weight: 900;
          box-shadow: var(--shadow-sm);
        }

        .admin-view-name {
          margin: 0;
          color: var(--text-primary);
          font-size: clamp(30px, 5vw, 44px);
          line-height: 1.05;
          letter-spacing: -1.5px;
          font-weight: 900;
        }

        .admin-view-category {
          margin-top: 9px;
          color: var(--primary);
          font-size: 15px;
          font-weight: 800;
        }

        .admin-view-location {
          margin-top: 5px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .admin-view-status {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 13px;
        }

        .admin-view-badge {
          display: inline-flex;
          align-items: center;
          min-height: 27px;
          padding: 0 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 900;
        }

        .admin-view-badge.verified {
          color: #176b3a;
          background: #e8f7ee;
          border: 1px solid #bfe8ce;
        }

        .admin-view-badge.featured {
          color: #8a5a00;
          background: #fff5d9;
          border: 1px solid #f1d58b;
        }

        .admin-view-badge.blocked {
          color: #a32121;
          background: #fdeaea;
          border: 1px solid #efc2c2;
        }

        .admin-view-badge.deactivated {
          color: #5f6673;
          background: #eef0f3;
          border: 1px solid #d6dae0;
        }

        .admin-view-body {
          padding: 32px;
        }

        .admin-view-section {
          margin-bottom: 30px;
        }

        .admin-view-section:last-child {
          margin-bottom: 0;
        }

        .admin-view-title {
          margin: 0 0 14px;
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 900;
        }

        .admin-view-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .admin-view-info {
          min-width: 0;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface-soft);
        }

        .admin-view-info-label {
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .07em;
          text-transform: uppercase;
        }

        .admin-view-info-value {
          margin: 6px 0 0;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 700;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .admin-view-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .admin-view-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 43px;
          padding: 0 16px;
          border-radius: 10px;
          color: var(--primary);
          background: var(--primary-soft);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .admin-view-action.primary {
          color: #fff;
          background: var(--primary);
        }

        .admin-media-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .admin-media-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 43px;
          padding: 0 16px;
          border: 0;
          border-radius: 10px;
          color: var(--primary);
          background: var(--primary-soft);
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .admin-media-button.primary {
          color: #fff;
          background: var(--primary);
        }

        .admin-media-viewer {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.78);
        }

        .admin-media-close {
          position: absolute;
          top: 18px;
          right: 20px;
          z-index: 10001;
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          background: #fff;
          color: #111;
          font-size: 26px;
          line-height: 1;
          cursor: pointer;
        }

        .admin-media-image {
          display: block;
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 12px;
        }

        .admin-media-nav {
          position: absolute;
          top: 50%;
          z-index: 10001;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 50%;
          background: #fff;
          color: #111;
          font-size: 32px;
          line-height: 1;
          cursor: pointer;
          transform: translateY(-50%);
        }

        .admin-media-prev {
          left: 20px;
        }

        .admin-media-next {
          right: 20px;
        }

        .admin-media-count {
          position: absolute;
          bottom: 18px;
          left: 50%;
          z-index: 10001;
          padding: 6px 11px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          transform: translateX(-50%);
        }

        .admin-resume-frame {
          position: relative;
          width: min(900px, 94vw);
          height: min(90vh, 900px);
          overflow: hidden;
          border-radius: 18px;
          background: #fff;
        }

        .admin-resume-frame iframe {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
        }

        .admin-video-player {
          display: block;
          width: auto;
          max-width: 90vw;
          max-height: 90vh;
          border-radius: 12px;
        }

        .admin-audio-card {
          width: min(500px, 90vw);
          padding: 28px;
          border-radius: 22px;
          background: #fff;
        }

        .admin-audio-card h3 {
          margin: 0 0 20px;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 800;
        }

        .admin-audio-card audio {
          width: 100%;
        }

        .admin-view-portfolio {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .admin-view-portfolio-item {
          overflow: hidden;
          aspect-ratio: 1;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface-soft);
        }

        .admin-view-portfolio-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @media (max-width: 600px) {
          .admin-view-page {
            padding: 24px 14px 45px;
          }

          .admin-view-header {
            align-items: flex-start;
            gap: 17px;
            padding: 23px 20px;
          }

          .admin-view-photo,
          .admin-view-placeholder {
            width: 86px;
            height: 86px;
            flex-basis: 86px;
          }

          .admin-view-placeholder {
            font-size: 27px;
          }

          .admin-view-name {
            font-size: 27px;
          }

          .admin-view-body {
            padding: 24px 20px 28px;
          }

          .admin-view-grid {
            grid-template-columns: 1fr;
          }

          .admin-view-portfolio {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-view-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .admin-view-action {
            width: 100%;
          }
        
          .admin-media-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .admin-media-button {  
            width: 100%;
         }

          .admin-media-close {
            top: 10px;
            right: 10px;
            width: 36px;
            height: 36px;
          }

          .admin-media-nav {      
            width: 38px;
            height: 38px;
            font-size: 28px;
          }

          .admin-media-prev {
            left: 8px;
          }

          .admin-media-next {
            right: 8px;
          }

          .admin-resume-frame {
            width: 96vw;
            height: 88vh;
            border-radius: 14px;
          }
        }

        @media (max-width: 380px) {
          .admin-view-header {
            gap: 13px;
            padding: 19px 15px;
          }

          .admin-view-photo,
          .admin-view-placeholder {
            width: 72px;
            height: 72px;
            flex-basis: 72px;
          }

          .admin-view-name {
            font-size: 23px;
          }

          .admin-view-body {
            padding-left: 15px;
            padding-right: 15px;
          }
        }
      `}</style>

      <div className="admin-view-container">
        <div className="admin-view-top">
          <div>
            <div className="admin-view-label">
              BmKalaHub Admin
            </div>
          </div>

          <Link
            href="/admin"
            className="admin-view-back"
          >
             Back to Admin
          </Link>
        </div>

        <article className="admin-view-card">
          <header className="admin-view-header">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                className="admin-view-photo"
              />
            ) : (
              <div className="admin-view-placeholder">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="admin-view-name">
                {profile.name}
              </h1>

              <p className="admin-view-category">
                {profile.category}
              </p>

              <p className="admin-view-location">
                {profile.location}
              </p>

              <div className="admin-view-status">
                {profile.verified && (
                  <span className="admin-view-badge verified">
                    ✓ VERIFIED
                  </span>
                )}

                {profile.featured && (
                  <span className="admin-view-badge featured">
                    ★ FEATURED
                  </span>
                )}

                {profile.blocked && (
                  <span className="admin-view-badge blocked">
                    BLOCKED
                  </span>
                )}

                {profile.deactivated && (
                  <span className="admin-view-badge deactivated">
                    DEACTIVATED
                  </span>
                )}
              </div>
            </div>
          </header>

          <div className="admin-view-body">
            <section className="admin-view-section">
              <h2 className="admin-view-title">
                Professional Information
              </h2>

              <div className="admin-view-grid">
                <Info
                  label="Name"
                  value={profile.name}
                />

                <Info
                  label="Category"
                  value={profile.category}
                />

                <Info
                  label="Location"
                  value={profile.location}
                />

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
            </section>

            {profile.portfolio?.length > 0 && (
           <section className="admin-view-section">
           <h2 className="admin-view-title">
             Portfolio
           </h2>

           <AdminMediaViewer
              portfolio={profile.portfolio}
           />
           </section>
         )}

            {(profile.resume ||
             profile.video ||
             profile.audio) && (
           <section className="admin-view-section">
           <h2 className="admin-view-title">
              Portfolio & Media
           </h2>

           <AdminMediaViewer
             portfolio={[]}
             resume={profile.resume}
             video={profile.video}
             audio={profile.audio}
           />
           </section>
          )}
          </div>
        </article>
      </div>
    </main>
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
    <div className="admin-view-info">
      <p className="admin-view-info-label">
        {label}
      </p>

      <p className="admin-view-info-value">
        {value}
      </p>
    </div>
  );
}