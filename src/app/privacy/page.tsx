import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <style>{`
        .privacy-page {
          min-height: 100vh;
          padding: 42px 0 70px;
          background: var(--background);
        }

        .privacy-container {
          width: min(calc(100% - 48px), 1000px);
          margin: 0 auto;
        }

        .privacy-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 52px;
        }

        .privacy-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .privacy-brand img {
          width: 46px;
          height: 46px;
          object-fit: contain;
          border-radius: 50%;
        }

        .privacy-brand strong {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 800;
        }

        .privacy-home {
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

        .privacy-home:hover {
          color: #fff;
          background: var(--primary);
        }

        .privacy-header {
          margin-bottom: 34px;
        }

        .privacy-kicker {
          margin: 0;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .privacy-title {
          margin: 10px 0 0;
          color: var(--text-primary);
          font-size: clamp(38px, 6vw, 58px);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -2.2px;
        }

        .privacy-updated {
          margin: 15px 0 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .privacy-content {
          padding: 30px;
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .privacy-section + .privacy-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid var(--border);
        }

        .privacy-section h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 21px;
          font-weight: 800;
        }

        .privacy-section p {
          margin: 12px 0 0;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.75;
        }

        .privacy-section ul {
          margin: 12px 0 0;
          padding-left: 21px;
          color: var(--text-secondary);
        }

        .privacy-section li {
          margin-top: 8px;
          font-size: 15px;
          line-height: 1.65;
        }

        .privacy-note {
          margin-top: 30px;
          padding: 18px;
          border-radius: 15px;
          background: var(--surface-soft);
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.65;
        }

        .privacy-footer {
          display: flex;
          justify-content: center;
          margin-top: 28px;
        }

        .privacy-back {
          color: var(--primary);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .privacy-back:hover {
          text-decoration: underline;
        }

        @media (max-width: 700px) {
          .privacy-page {
            padding: 24px 0 50px;
          }

          .privacy-container {
            width: min(calc(100% - 32px), 1000px);
          }

          .privacy-top {
            margin-bottom: 38px;
          }

          .privacy-brand img {
            width: 42px;
            height: 42px;
          }

          .privacy-brand strong {
            font-size: 16px;
          }

          .privacy-home {
            min-height: 40px;
            padding: 0 14px;
            font-size: 12px;
          }

          .privacy-title {
            font-size: 40px;
            letter-spacing: -1.7px;
          }

          .privacy-content {
            padding: 21px;
            border-radius: 19px;
          }

          .privacy-section + .privacy-section {
            margin-top: 25px;
            padding-top: 25px;
          }

          .privacy-section h2 {
            font-size: 19px;
          }

          .privacy-section p,
          .privacy-section li {
            font-size: 14px;
          }
        }

        @media (max-width: 380px) {
          .privacy-container {
            width: min(calc(100% - 24px), 1000px);
          }

          .privacy-top {
            gap: 10px;
          }

          .privacy-brand {
            gap: 8px;
          }

          .privacy-brand strong {
            font-size: 14px;
          }

          .privacy-home {
            padding: 0 11px;
          }

          .privacy-title {
            font-size: 34px;
          }

          .privacy-content {
            padding: 17px;
          }
        }
      `}</style>

      <div className="privacy-container">
        <header className="privacy-top">
          <div className="privacy-brand">
            <img src="/BmKalaHub.png" alt="BmKalaHub" />
            <strong>BmKalaHub</strong>
          </div>

          <Link href="/" className="privacy-home">
            Home
          </Link>
        </header>

        <section className="privacy-header">
          
          <h1 className="privacy-title">
            Privacy Policy
          </h1>

          <p className="privacy-updated">
            Last updated: September 2, 2026
          </p>
        </section>

        <article className="privacy-content">
          <section className="privacy-section">
            <h2>1. Introduction</h2>

            <p>
              BmKalaHub respects your privacy and is committed to
              protecting the information you provide while using our
              platform. This Privacy Policy explains what information
              we collect, how it is used, and how it is protected.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Information We Collect</h2>

            <p>
              Depending on how you use BmKalaHub, we may collect
              information that you provide directly to us, including:
            </p>

            <ul>
              <li>Name and email address.</li>
              <li>Artist profile and professional information.</li>
              <li>Category and location information.</li>
              <li>Portfolio and profile media you choose to upload.</li>
              <li>Information provided when contacting or communicating through the platform.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. How We Use Information</h2>

            <p>
              Information may be used to create and manage accounts,
              display artist profiles, provide platform features,
              improve the user experience, maintain platform security,
              and communicate with users when necessary.
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. Artist Profiles and Public Information</h2>

            <p>
              Information that an artist chooses to include in a public
              profile may be visible to other visitors. Artists should
              only publish information they are comfortable making
              publicly available.
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Uploaded Media</h2>

            <p>
              Images, resumes, videos, audio files, and other portfolio
              materials uploaded by users may be stored and displayed
              according to the features and visibility selected by the
              user. Users are responsible for ensuring that they have
              the necessary rights to upload and share such material.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Account Security</h2>

            <p>
              We use reasonable technical and organizational measures
              designed to protect account information and platform data.
              Users are responsible for keeping their login credentials
              confidential and should notify us if they believe their
              account has been accessed without authorization.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Cookies and Technical Data</h2>

            <p>
              BmKalaHub may use cookies or similar technical mechanisms
              where necessary to maintain authentication, security,
              preferences, and core platform functionality.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Third-Party Services</h2>

            <p>
              Some platform features may rely on third-party services
              for hosting, storage, email delivery, authentication, or
              other technical functions. Such services may process
              information as necessary to provide their respective
              functions.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Data Retention</h2>

            <p>
              Information may be retained for as long as necessary to
              provide platform services, maintain security, comply with
              applicable requirements, resolve disputes, or protect
              legitimate platform interests.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Your Choices</h2>

            <p>
              Users may update information associated with their account
              through available profile features. If you want to remove
              information or request assistance regarding your account,
              you may contact BmKalaHub.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Policy Updates</h2>

            <p>
              This Privacy Policy may be updated from time to time as
              BmKalaHub develops new features or changes its practices.
              Updated versions will be published on this page.
            </p>
          </section>

          <div className="privacy-note">
            This page provides general information about BmKalaHub&apos;s
            privacy practices. Specific requirements may vary depending
            on applicable laws, services, and future platform features.
          </div>
        </article>

        <div className="privacy-footer">
          <Link href="/" className="privacy-back">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}