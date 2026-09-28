import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <style>{`
        .about-page {
          min-height: 100vh;
          padding: 42px 0 70px;
          background: var(--background);
        }

        .about-container {
          width: min(calc(100% - 48px), 1100px);
          margin: 0 auto;
        }

        .about-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 55px;
        }

        .about-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .about-brand img {
          width: 46px;
          height: 46px;
          object-fit: contain;
          border-radius: 50%;
        }

        .about-brand strong {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 800;
        }

        .about-home {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 17px;
          border-radius: 10px;
          color: var(--primary);
          background: var(--primary-soft);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .about-home:hover {
          color: #fff;
          background: var(--primary);
        }

        .about-hero {
          max-width: 820px;
          margin-bottom: 48px;
        }

        .about-kicker {
          margin: 0;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .about-title {
          margin: 10px 0 0;
          color: var(--text-primary);
          font-size: clamp(38px, 6vw, 64px);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -2.5px;
        }

        .about-intro {
          max-width: 720px;
          margin: 22px 0 0;
          color: var(--text-secondary);
          font-size: 18px;
          line-height: 1.7;
        }

        .about-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .about-card {
          min-width: 0;
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 22px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .about-card.full {
          grid-column: 1 / -1;
        }

        .about-card h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 22px;
          font-weight: 800;
        }

        .about-card p {
          margin: 13px 0 0;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.75;
        }

        .about-points {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .about-point {
          padding: 17px;
          border-radius: 15px;
          background: var(--surface-soft);
        }

        .about-point strong {
          display: block;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 800;
        }

        .about-point span {
          display: block;
          margin-top: 6px;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.5;
        }

        .about-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 25px;
        }

        .about-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 11px;
          color: #fff;
          background: var(--primary);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .about-action.secondary {
          color: var(--primary);
          background: var(--primary-soft);
        }

        .about-action:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 700px) {
          .about-page {
            padding: 24px 0 50px;
          }

          .about-container {
            width: min(calc(100% - 32px), 1100px);
          }

          .about-top {
            margin-bottom: 38px;
          }

          .about-brand img {
            width: 42px;
            height: 42px;
          }

          .about-brand strong {
            font-size: 16px;
          }

          .about-home {
            min-height: 40px;
            padding: 0 14px;
            font-size: 12px;
          }

          .about-title {
            font-size: 40px;
            letter-spacing: -1.8px;
          }

          .about-intro {
            font-size: 16px;
            line-height: 1.65;
          }

          .about-grid {
            grid-template-columns: 1fr;
          }

          .about-card.full {
            grid-column: auto;
          }

          .about-card {
            padding: 21px;
            border-radius: 19px;
          }

          .about-card h2 {
            font-size: 20px;
          }

          .about-points {
            grid-template-columns: 1fr;
          }

          .about-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .about-action {
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .about-container {
            width: min(calc(100% - 24px), 1100px);
          }

          .about-top {
            gap: 10px;
          }

          .about-brand {
            gap: 8px;
          }

          .about-brand strong {
            font-size: 14px;
          }

          .about-home {
            padding: 0 11px;
          }

          .about-title {
            font-size: 34px;
          }

          .about-card {
            padding: 17px;
          }
        }
      `}</style>

      <div className="about-container">
        <header className="about-top">
          <div className="about-brand">
            <img src="/BmKalaHub.png" alt="BmKalaHub" />
            <strong>BmKalaHub</strong>
          </div>

          <Link href="/" className="about-home">
            Home
          </Link>
        </header>

        <section className="about-hero">
          
          <h1 className="about-title">
            A place for creative talent to be discovered.
          </h1>

          <p className="about-intro">
            BmKalaHub is an artist discovery platform built to bring
            creative professionals and people looking for talent closer
            together. Our goal is to make discovering the right artist
            simple, clear, and direct.
          </p>
        </section>

        <section className="about-grid">
          <article className="about-card full">
            <h2>What is BmKalaHub?</h2>

            <p>
              BmKalaHub provides a dedicated space where artists can
              create professional profiles and showcase their skills,
              experience, portfolio, and media. Visitors can explore
              different categories, discover artists, compare profiles,
              and connect with the talent that fits their needs.
            </p>

            <div className="about-points">
              <div className="about-point">
                <strong>Discover</strong>
                <span>
                  Find creative talent across different categories.
                </span>
              </div>

              <div className="about-point">
                <strong>Showcase</strong>
                <span>
                  Give artists a professional place to present their work.
                </span>
              </div>

              <div className="about-point">
                <strong>Connect</strong>
                <span>
                  Make it easier for visitors and artists to connect directly.
                </span>
              </div>
            </div>
          </article>

          <article className="about-card">
            <h2>For Artists</h2>

            <p>
              Artists can build a professional presence on BmKalaHub
              with their profile, category, location, experience,
              portfolio, resume, video, and audio. The platform is
              designed to help creative professionals become easier
              to discover.
            </p>
          </article>

          <article className="about-card">
            <h2>For Visitors</h2>

            <p>
              Visitors can browse artists by category, name, and
              location, open public profiles, explore their work, and
              find suitable creative talent for their requirements.
            </p>
          </article>

          <article className="about-card full">
            <h2>Our Approach</h2>

            <p>
              We believe artist discovery should be professional without
              being complicated. BmKalaHub focuses on clear profiles,
              useful information, straightforward discovery, and direct
              connections between artists and the people looking for them.
            </p>

            <div className="about-actions">
              <Link href="/artists" className="about-action">
                Discover Artists
              </Link>

              <Link
                href="/join"
                className="about-action secondary"
              >
                Join BmKalaHub
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}