"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to login."
        );
      }

      router.replace("/user");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to login."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="user-login-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .user-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          background: #f7f8fa;
          font-family: Arial, sans-serif;
        }

        .user-login-card {
          width: 100%;
          max-width: 460px;
          padding: 34px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 18px 45px rgba(17, 24, 39, 0.08);
        }

        .user-login-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #111827;
          text-decoration: none;
          margin-bottom: 28px;
        }

        .user-login-logo {
          width: 46px;
          height: 46px;
          object-fit: contain;
          border-radius: 50%;
        }

        .user-login-brand-name {
          font-size: 21px;
          font-weight: 800;
        }

        .user-login-kicker {
          margin: 0 0 8px;
          color: #6d28d9;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .user-login-title {
          margin: 0;
          color: #111827;
          font-size: 30px;
          line-height: 1.2;
        }

        .user-login-description {
          margin: 12px 0 26px;
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
        }

        .user-login-form {
          display: grid;
          gap: 18px;
        }

        .user-login-label {
          display: grid;
          gap: 7px;
          color: #374151;
          font-size: 14px;
          font-weight: 700;
        }

        .user-login-input {
          width: 100%;
          height: 48px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          padding: 0 14px;
          background: #ffffff;
          color: #111827;
          font: inherit;
          outline: none;
        }

        .user-login-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
        }

        .user-password-field {
          position: relative;
        }

        .user-password-field .user-login-input {
          padding-right: 52px;
        }

        .user-password-toggle {
          position: absolute;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
        }

        .user-password-toggle:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .user-password-toggle svg {
          width: 20px;
          height: 20px;
        }

        .user-login-error {
          margin: 0;
          padding: 11px 12px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.5;
        }

        .user-login-submit {
          width: 100%;
          min-height: 48px;
          border: none;
          border-radius: 9px;
          background: #111827;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
        }

        .user-login-submit:hover:not(:disabled) {
          background: #1f2937;
        }

        .user-login-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .user-login-signup {
          margin: 22px 0 0;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 13px;
          text-align: center;
        }

        .user-login-signup a {
          color: #111827;
          font-weight: 800;
          text-decoration: none;
        }

        .user-login-signup a:hover {
          text-decoration: underline;
        }

        .user-login-back {
          display: block;
          margin-top: 18px;
          color: #6b7280;
          text-align: center;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .user-login-back:hover {
          color: #111827;
        }

        @media (max-width: 600px) {
          .user-login-page {
            align-items: flex-start;
            padding: 20px 14px;
          }

          .user-login-card {
            margin-top: 30px;
            padding: 26px 18px;
            border-radius: 14px;
          }

          .user-login-title {
            font-size: 27px;
          }

          .user-login-description {
            font-size: 14px;
          }
        }
      `}</style>

      <section className="user-login-card">
        <Link
          href="/"
          className="user-login-brand"
        >
          <img
            src="/BmKalaHub.png"
            alt="BmKalaHub"
            className="user-login-logo"
          />

          <span className="user-login-brand-name">
            BmKalaHub
          </span>
        </Link>

        <p className="user-login-kicker">
          User Account
        </p>

        <h1 className="user-login-title">
          User Login
        </h1>

        <p className="user-login-description">
          Login to manage your enquiries, messages and
          conversations with artists.
        </p>

        <form
          className="user-login-form"
          onSubmit={handleSubmit}
        >
          <label className="user-login-label">
            Email address

            <input
              className="user-login-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </label>

          <label className="user-login-label">
            Password

            <div className="user-password-field">
              <input
                className="user-login-input"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <button
                type="button"
                className="user-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 8.8 4 10 8-0.4 1.4-1.2 2.7-2.2 3.8" />
                    <path d="M6.6 6.6C4.7 7.9 3.4 9.8 2 12c1.2 4 4.8 8 10 8 1.7 0 3.2-.4 4.5-1" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error && (
            <p className="user-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="user-login-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "User Login"}
          </button>
        </form>

        <p className="user-login-signup">
          Don&apos;t have a user account?{" "}
          <Link href="/user/signup">
            Create User Account
          </Link>
        </p>

        <Link
          href="/user-access"
          className="user-login-back"
        >
          ← Back to User Account
        </Link>
      </section>
    </main>
  );
}