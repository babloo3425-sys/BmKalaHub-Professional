import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="terms-page">
      <style>{`
        .terms-page {
          min-height: 100vh;
          padding: 42px 0 70px;
          background: var(--background);
        }

        .terms-container {
          width: min(calc(100% - 48px), 1000px);
          margin: 0 auto;
        }

        .terms-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 52px;
        }

        .terms-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .terms-brand img {
          width: 46px;
          height: 46px;
          object-fit: contain;
          border-radius: 50%;
        }

        .terms-brand strong {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 800;
        }

        .terms-home {
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

        .terms-home:hover {
          color: #fff;
          background: var(--primary);
        }

        .terms-header {
          margin-bottom: 34px;
        }

        .terms-kicker {
          margin: 0;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .terms-title {
          margin: 10px 0 0;
          color: var(--text-primary);
          font-size: clamp(38px, 6vw, 58px);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -2.2px;
        }

        .terms-updated {
          margin: 15px 0 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .terms-content {
          padding: 30px;
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .terms-section + .terms-section {
          margin-top: 30px;
          padding-top: 30px;
          border-top: 1px solid var(--border);
        }

        .terms-section h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 21px;
          font-weight: 800;
        }

        .terms-section p {
          margin: 12px 0 0;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.75;
        }

        .terms-section ul {
          margin: 12px 0 0;
          padding-left: 21px;
          color: var(--text-secondary);
        }

        .terms-section li {
          margin-top: 8px;
          font-size: 15px;
          line-height: 1.65;
        }

        .terms-note {
          margin-top: 30px;
          padding: 18px;
          border-radius: 15px;
          background: var(--surface-soft);
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.65;
        }

        .terms-footer {
          display: flex;
          justify-content: center;
          margin-top: 28px;
        }

        .terms-back {
          color: var(--primary);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .terms-back:hover {
          text-decoration: underline;
        }

        @media (max-width: 700px) {
          .terms-page {
            padding: 24px 0 50px;
          }

          .terms-container {
            width: min(calc(100% - 32px), 1000px);
          }

          .terms-top {
            margin-bottom: 38px;
          }

          .terms-brand img {
            width: 42px;
            height: 42px;
          }

          .terms-brand strong {
            font-size: 16px;
          }

          .terms-home {
            min-height: 40px;
            padding: 0 14px;
            font-size: 12px;
          }

          .terms-title {
            font-size: 40px;
            letter-spacing: -1.7px;
          }

          .terms-content {
            padding: 21px;
            border-radius: 19px;
          }

          .terms-section + .terms-section {
            margin-top: 25px;
            padding-top: 25px;
          }

          .terms-section h2 {
            font-size: 19px;
          }

          .terms-section p,
          .terms-section li {
            font-size: 14px;
          }
        }

        @media (max-width: 380px) {
          .terms-container {
            width: min(calc(100% - 24px), 1000px);
          }

          .terms-top {
            gap: 10px;
          }

          .terms-brand {
            gap: 8px;
          }

          .terms-brand strong {
            font-size: 14px;
          }

          .terms-home {
            padding: 0 11px;
          }

          .terms-title {
            font-size: 34px;
          }

          .terms-content {
            padding: 17px;
          }
        }
      `}</style>

      <div className="terms-container">
        <header className="terms-top">
          <div className="terms-brand">
            <img src="/BmKalaHub.png" alt="BmKalaHub" />
            <strong>BmKalaHub</strong>
          </div>

          <Link href="/" className="terms-home">
            Home
          </Link>
        </header>

        <section className="terms-header">
          
          <h1 className="terms-title">
            Terms &amp; Conditions
          </h1>

          <p className="terms-updated">
            Last updated: September 2, 2026
          </p>
        </section>

        <article className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>

            <p>
              By accessing or using BmKalaHub, you agree to these
              Terms &amp; Conditions. If you do not agree with these
              terms, please do not use the platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. About the Platform</h2>

            <p>
              BmKalaHub is an artist discovery and profile platform
              that allows creative professionals to create profiles
              and allows visitors to discover and connect with artists.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. User Accounts</h2>

            <p>
              Users are responsible for providing accurate information
              when creating an account and for keeping their login
              credentials secure. Users are responsible for activity
              carried out through their account.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Artist Profiles</h2>

            <p>
              Artists are responsible for the accuracy of the
              information displayed on their profiles. Users should
              only publish information, images, videos, audio, resumes,
              and other materials that they have the right to share.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Prohibited Use</h2>

            <p>
              BmKalaHub must not be used for unlawful, fraudulent,
              abusive, misleading, or harmful activities. Users must
              not attempt to interfere with the operation or security
              of the platform.
            </p>

            <ul>
              <li>Do not impersonate another person.</li>
              <li>Do not upload unlawful or infringing content.</li>
              <li>Do not misuse another user&apos;s information.</li>
              <li>Do not attempt unauthorized access to platform systems.</li>
              <li>Do not use the platform for spam or abusive activity.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. Public Content</h2>

            <p>
              Information and media intentionally added to a public
              artist profile may be visible to other visitors. Users
              should consider this before publishing personal or
              professional information.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Platform Content and Services</h2>

            <p>
              BmKalaHub may add, modify, suspend, or remove features
              from the platform when necessary. We may also restrict
              access to accounts or content that violates these terms
              or creates a security or safety concern.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Third-Party Services</h2>

            <p>
              BmKalaHub may use third-party services for hosting,
              storage, email delivery, authentication, media processing,
              analytics, or other technical functions. Availability of
              those services may depend on their respective providers.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Intellectual Property</h2>

            <p>
              Users retain responsibility for content they upload.
              By uploading content for display through BmKalaHub,
              users provide the platform with the permission necessary
              to store, process, and display that content as part of
              the platform&apos;s intended functionality.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Disclaimer</h2>

            <p>
              BmKalaHub provides a platform for discovering and
              connecting with creative professionals. We do not
              guarantee the quality, availability, suitability,
              performance, or conduct of any artist listed on the
              platform. Users should independently evaluate artists
              before entering into any professional arrangement.
            </p>
          </section>

          <section className="terms-section">
            <h2>11. Limitation of Liability</h2>

            <p>
              To the extent permitted by applicable law, BmKalaHub
              will not be responsible for indirect, incidental,
              consequential, or other losses arising from use of the
              platform or interactions between users.
            </p>
          </section>

          <section className="terms-section">
            <h2>12. Account Suspension or Removal</h2>

            <p>
              BmKalaHub may suspend, restrict, or remove an account
              where there is a violation of these Terms &amp; Conditions,
              suspected abuse, security concerns, unlawful activity,
              or other circumstances requiring platform protection.
            </p>
          </section>

          <section className="terms-section">
            <h2>13. Changes to These Terms</h2>

            <p>
              These Terms &amp; Conditions may be updated from time to
              time. Changes will be published on this page. Continued
              use of BmKalaHub after an update means that the updated
              terms apply to future use of the platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>14. Contact</h2>

            <p>
              If you have questions regarding these Terms &amp; Conditions,
              please contact BmKalaHub through the official contact
              channel provided on the platform.
            </p>
          </section>

          <div className="terms-note">
            These Terms &amp; Conditions provide the general rules for
            using BmKalaHub. They should be reviewed and updated when
            new platform features, commercial services, or applicable
            legal requirements are introduced.
          </div>
        </article>

        <div className="terms-footer">
          <Link href="/" className="terms-back">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}