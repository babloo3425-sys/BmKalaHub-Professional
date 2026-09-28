import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="contact-page">
      <style>{`
        .contact-page {
          min-height: 100vh;
          padding: 42px 0 70px;
          background: var(--background);
        }

        .contact-container {
          width: min(calc(100% - 48px), 1000px);
          margin: 0 auto;
        }

        .contact-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 55px;
        }

        .contact-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-brand img {
          width: 46px;
          height: 46px;
          object-fit: contain;
          border-radius: 50%;
        }

        .contact-brand strong {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 800;
        }

        .contact-home {
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

        .contact-home:hover {
          color: #fff;
          background: var(--primary);
        }

        .contact-hero {
          max-width: 760px;
          margin-bottom: 38px;
        }

        .contact-kicker {
          margin: 0;
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .contact-title {
          margin: 10px 0 0;
          color: var(--text-primary);
          font-size: clamp(38px, 6vw, 58px);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -2.2px;
        }

        .contact-intro {
          max-width: 680px;
          margin: 20px 0 0;
          color: var(--text-secondary);
          font-size: 17px;
          line-height: 1.7;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .contact-card {
          min-width: 0;
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 22px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
        }

        .contact-card.full {
          grid-column: 1 / -1;
        }

        .contact-icon {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          border-radius: 12px;
          color: var(--primary);
          background: var(--primary-soft);
        }

        .contact-icon svg {
          width: 21px;
          height: 21px;
          display: block;
        }

        .contact-card h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 21px;
          font-weight: 800;
        }

        .contact-card p {
          margin: 11px 0 0;
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.7;
        }

        .contact-email {
          display: inline-flex;
          margin-top: 18px;
          color: var(--primary);
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .contact-email:hover {
          text-decoration: underline;
        }

        .contact-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          margin-top: 20px;
          padding: 0 18px;
          border-radius: 11px;
          color: #fff;
          background: var(--primary);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .contact-action:hover {
          transform: translateY(-1px);
        }

        .contact-note {
          padding: 18px;
          border-radius: 15px;
          background: var(--surface-soft);
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.65;
        }

        .contact-footer {
          display: flex;
          justify-content: center;
          margin-top: 28px;
        }

        .contact-back {
          color: var(--primary);
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .contact-back:hover {
          text-decoration: underline;
        }

        @media (max-width: 700px) {
          .contact-page {
            padding: 24px 0 50px;
          }

          .contact-container {
            width: min(calc(100% - 32px), 1000px);
          }

          .contact-top {
            margin-bottom: 38px;
          }

          .contact-brand img {
            width: 42px;
            height: 42px;
          }

          .contact-brand strong {
            font-size: 16px;
          }

          .contact-home {
            min-height: 40px;
            padding: 0 14px;
            font-size: 12px;
          }

          .contact-title {
            font-size: 40px;
            letter-spacing: -1.7px;
          }

          .contact-intro {
            font-size: 16px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }

          .contact-card.full {
            grid-column: auto;
          }

          .contact-card {
            padding: 21px;
            border-radius: 19px;
          }

          .contact-card h2 {
            font-size: 19px;
          }

          .contact-card p {
            font-size: 14px;
          }

          .contact-email {
            font-size: 14px;
          }

          .contact-action {
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .contact-container {
            width: min(calc(100% - 24px), 1000px);
          }

          .contact-top {
            gap: 10px;
          }

          .contact-brand {
            gap: 8px;
          }

          .contact-brand strong {
            font-size: 14px;
          }

          .contact-home {
            padding: 0 11px;
          }

          .contact-title {
            font-size: 34px;
          }

          .contact-card {
            padding: 17px;
          }
        }
      `}</style>

      <div className="contact-container">
        <header className="contact-top">
          <div className="contact-brand">
            <img src="/BmKalaHub.png" alt="BmKalaHub" />
            <strong>BmKalaHub</strong>
          </div>

          <Link href="/" className="contact-home">
            Home
          </Link>
        </header>

        <section className="contact-hero">
          
          <h1 className="contact-title">
            Contact Us
          </h1>

          <p className="contact-intro">
            Have a question, need assistance, or want to get in touch
            with BmKalaHub? We are here to help.
          </p>
        </section>

        <section className="contact-grid">
          <article className="contact-card">
            <div className="contact-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </div>

            <h2>Email Us</h2>

            <p>
              For general questions, support, profile assistance, or
              other BmKalaHub enquiries, you can contact us by email.
            </p>

            <a
              href="mailto:noreply@bmtheaterhub.com"
              className="contact-email"
            >
              noreply@bmtheaterhub.com
            </a>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=noreply%40bmtheaterhub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-action"
            >
               Send Email
            </a>
          </article>

          <article className="contact-card">
            <div className="contact-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <h2>Support</h2>

            <p>
              If you experience a problem with your account, profile,
              uploaded media, or another platform feature, please
              include enough details in your message so we can
              understand the issue.
            </p>
          </article>

          <article className="contact-card full">
            <h2>Before You Contact Us</h2>

            <p>
              For account-related questions, please use the email
              address associated with your BmKalaHub account whenever
              possible. Do not send passwords or other sensitive
              security information by email.
            </p>

            <div className="contact-note">
              BmKalaHub is an artist discovery platform. For
              professional arrangements between artists and visitors,
              please communicate and make decisions carefully based on
              the information available on the relevant profile.
            </div>
          </article>
        </section>

        <div className="contact-footer">
          <Link href="/" className="contact-back">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}