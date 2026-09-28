"use client";

import Link from "next/link";

export default function UserAccessPage() {
  return (
    <main className="user-access-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .user-access-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          background: #f7f8fa;
          font-family: Arial, sans-serif;
        }

        .user-access-card {
          width: 100%;
          max-width: 460px;
          padding: 34px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 18px 45px rgba(17, 24, 39, 0.08);
          text-align: center;
        }

        .user-access-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #111827;
          text-decoration: none;
          margin-bottom: 28px;
        }

        .user-access-logo {
          width: 46px;
          height: 46px;
          object-fit: contain;
          border-radius: 50%;
        }

        .user-access-brand-name {
          font-size: 21px;
          font-weight: 800;
        }

        .user-access-kicker {
          margin: 0 0 8px;
          color: #6d28d9;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .user-access-title {
          margin: 0;
          color: #111827;
          font-size: 30px;
          line-height: 1.2;
        }

        .user-access-description {
          margin: 12px 0 28px;
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
        }

        .user-access-actions {
          display: grid;
          gap: 12px;
        }

        .user-access-button {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          width: 100%;
          border-radius: 9px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
        }

        .user-access-login {
          background: #111827;
          color: #ffffff;
        }

        .user-access-signup {
          background: #ffffff;
          color: #111827;
          border: 1px solid #d1d5db;
        }

        .user-access-login:hover {
          background: #1f2937;
        }

        .user-access-signup:hover {
          background: #f9fafb;
        }

        .user-access-back {
          display: inline-block;
          margin-top: 24px;
          color: #6b7280;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .user-access-back:hover {
          color: #111827;
        }

        @media (max-width: 600px) {
          .user-access-page {
            padding: 20px 14px;
            align-items: flex-start;
          }

          .user-access-card {
            margin-top: 30px;
            padding: 26px 18px;
            border-radius: 14px;
          }

          .user-access-title {
            font-size: 27px;
          }

          .user-access-description {
            font-size: 14px;
          }
        }
      `}</style>

      <section className="user-access-card">
        <Link
          href="/"
          className="user-access-brand"
        >
          <img
            src="/BmKalaHub.png"
            alt="BmKalaHub"
            className="user-access-logo"
          />

          <span className="user-access-brand-name">
            BmKalaHub
          </span>
        </Link>

        <p className="user-access-kicker">
          User Account
        </p>

        <h1 className="user-access-title">
          Welcome to BmKalaHub
        </h1>

        <p className="user-access-description">
          Login to your account or create a new account
          to discover artists, send enquiries and manage
          your conversations.
        </p>

        <div className="user-access-actions">
          <Link
            href="/user/signup"
            className="user-access-button user-access-signup"
         >
              Create User Account
          </Link>

          <Link
            href="/login?type=user"
            className="user-access-button user-access-login"
          >
            User Login
          </Link>
        </div>

        <Link
          href="/"
          className="user-access-back"
        >
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}