"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import "../auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send reset email.");
      }

      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <span className="auth-brand-mark">BM</span>
          <span>BmKalaHub</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-kicker">Account recovery</span>
          <h1>Forgot your password?</h1>
          <p>
            Enter the email address associated with your account and we&apos;ll
            help you reset your password.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email address
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          {message && (
            <p style={{ color: "var(--success)", fontSize: "14px" }}>
              {message}
            </p>
          )}

          {error && (
            <p style={{ color: "var(--danger)", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link href="/login">Back to login</Link>
        </p>

        <Link href="/" className="back-home">
          ← Back to BmKalaHub
        </Link>
      </div>
    </main>
  );
}