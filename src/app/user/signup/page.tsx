"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create account."
        );
      }

      setError("");
      setMessage(
      data.message ||
      "Account created. Please check your email to verify your account."
    );

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="user-signup-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .user-signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background:
            radial-gradient(
              circle at top,
              rgba(124, 58, 237, 0.12),
              transparent 34%
            ),
            #f7f8fa;
          font-family: Arial, sans-serif;
        }

        .user-signup-card {
          width: 100%;
          max-width: 460px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 32px;
          box-shadow:
            0 20px 50px rgba(17, 24, 39, 0.08);
        }

        .user-signup-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #111827;
          text-decoration: none;
          margin-bottom: 30px;
        }

        .user-signup-logo {
          width: 46px;
          height: 46px;
          object-fit: contain;
          border-radius: 50%;
        }

        .user-signup-brand-name {
          font-size: 21px;
          font-weight: 800;
        }

        .user-signup-kicker {
          display: inline-block;
          margin-bottom: 8px;
          color: #6d28d9;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .user-signup-title {
          margin: 0;
          color: #111827;
          font-size: 30px;
          line-height: 1.2;
        }

        .user-signup-description {
          margin: 10px 0 26px;
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
        }

        .user-signup-form {
          display: grid;
          gap: 18px;
        }

        .user-signup-label {
          display: grid;
          gap: 7px;
          color: #374151;
          font-size: 14px;
          font-weight: 700;
        }

        .user-signup-input {
          width: 100%;
          height: 48px;
          border: 1px solid #d1d5db;
          border-radius: 9px;
          padding: 0 14px;
          background: #ffffff;
          color: #111827;
          font: inherit;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .user-signup-input:focus {
          border-color: #7c3aed;
          box-shadow:
            0 0 0 3px rgba(124, 58, 237, 0.12);
        }

        .user-password-field {
          position: relative;
        }

        .user-password-field .user-signup-input {
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

        .user-password-help {
          margin: -2px 0 0;
          color: #6b7280;
          font-size: 12px;
          font-weight: 400;
        }

        .user-signup-error {
          margin: 0;
          padding: 11px 12px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 13px;
          line-height: 1.5;
        }

        .user-signup-submit {
          width: 100%;
          min-height: 48px;
          border: none;
          border-radius: 9px;
          background: #111827;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .user-signup-submit:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .user-signup-submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .user-signup-note {
          margin: 22px 0 0;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
          text-align: center;
        }

        .user-back-home {
          display: block;
          margin-top: 18px;
          color: #4b5563;
          text-align: center;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
        }

        .user-back-home:hover {
          color: #111827;
        }

        @media (max-width: 600px) {
          .user-signup-page {
            align-items: flex-start;
            padding: 20px 14px;
          }

          .user-signup-card {
            margin-top: 12px;
            padding: 24px 18px;
            border-radius: 14px;
          }

          .user-signup-brand {
            margin-bottom: 24px;
          }

          .user-signup-logo {
            width: 42px;
            height: 42px;
          }

          .user-signup-brand-name {
            font-size: 19px;
          }

          .user-signup-title {
            font-size: 27px;
          }

          .user-signup-description {
            font-size: 14px;
          }
        }
      `}</style>

      <section className="user-signup-card">
        <Link
          href="/"
          className="user-signup-brand"
        >
          <img
            src="/BmKalaHub.png"
            alt="BmKalaHub"
            className="user-signup-logo"
          />

          <span className="user-signup-brand-name">
            BmKalaHub
          </span>
        </Link>

        <div>
          <span className="user-signup-kicker">
            User Account
          </span>

          <h1 className="user-signup-title">
            Create your account
          </h1>

          <p className="user-signup-description">
            Create your account to discover artists,
            send enquiries and manage conversations.
          </p>
        </div>

        <form
          className="user-signup-form"
          onSubmit={handleSubmit}
        >
          <label className="user-signup-label">
            Full name

            <input
              className="user-signup-input"
              type="text"
              name="name"
              placeholder="Your full name"
              autoComplete="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </label>

          <label className="user-signup-label">
            Email address

            <input
              className="user-signup-input"
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

          <label className="user-signup-label">
            Password

            <div className="user-password-field">
              <input
                className="user-signup-input"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Create a password"
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                required
              />

              <button
                type="button"
                className="user-password-toggle"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                aria-pressed={showPassword}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {showPassword ? (
                    <>
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.3A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a17.4 17.4 0 0 1-3.1 4.3" />
                      <path d="M6.1 6.1C3.4 8.1 2 12 2 12s3.5 8 10 8a10.7 10.7 0 0 0 4.1-.8" />
                    </>
                  ) : (
                    <>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>

            <span className="user-password-help">
              Minimum 8 characters
            </span>
          </label>

           {message && (
          <p
          style={{
           margin: 0,
           padding: "11px 12px",
           border: "1px solid #bbf7d0",
           borderRadius: "8px",
           background: "#f0fdf4",
           color: "#166534",
           fontSize: "13px",
           lineHeight: 1.5,
         }}
        >
          {message}
        </p>
       )}

          {error && (
            <p className="user-signup-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="user-signup-submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="user-signup-note">
           Check your email and verify your account before logging in.
        </p>

        <p
        style={{
         margin: "18px 0 0",
         textAlign: "center",
         color: "#6b7280",
         fontSize: "13px",
       }}
       >
         Already have an account?{" "}
      <Link
         href="/login?type=user"
         style={{
          color: "#6d28d9",
          fontWeight: 800,
          textDecoration: "none",
         }}
        >
         Login
       </Link>
      </p>

      <Link
        href="/"
        className="user-back-home"
      >
         ← Back to Home
       </Link>
      </section>
    </main>
  );
}