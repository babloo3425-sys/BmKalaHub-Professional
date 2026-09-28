"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import "../auth.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUserLogin = searchParams.get("type") === "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      setMessage(data.message);

      setEmail("");
      setPassword("");

      const accountType = data?.user?.accountType;
      const role = data?.user?.role;

      if (role === "admin") {
        router.replace("/admin");
      } else if (accountType === "customer") {
        router.replace("/user");
      } else {
        const profileResponse = await fetch(
          "/api/profile",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (profileResponse.ok) {
          router.replace("/dashboard");
        } else if (profileResponse.status === 404) {
          router.replace("/profile/create");
        } else {
          router.replace("/dashboard");
        }
      }

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
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          <img
            src="/BmKalaHub.png"
            alt="BmKalaHub"
            className="auth-brand-logo"
          />

          <span>BmKalaHub</span>
        </Link>

        <div className="auth-heading">
          <span className="auth-kicker">
            {isUserLogin
              ? "User Account"
              : "Welcome back"}
          </span>

          <h1>
            {isUserLogin
              ? "User Login"
              : "Login to your account"}
          </h1>

          <p>
            {isUserLogin
              ? "Access your BmKalaHub user account to discover artists, send enquiries and manage conversations."
              : "Access your BmKalaHub profile and connect with creative talent."}
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">
            Email address

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </label>

          <label htmlFor="password">
            Password

            <div className="password-field">
              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
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
                className="password-toggle"
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

          <div className="auth-options">
            <label className="remember-option">
              <input
                type="checkbox"
                name="remember"
              />
              <span>Remember me</span>
            </label>

            <Link href="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {message && (
            <p
              style={{
                color: "var(--success)",
                fontSize: "14px",
              }}
            >
              {message}
            </p>
          )}

          {error && (
            <p
              style={{
                color: "var(--danger)",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {isUserLogin
            ? "Don't have a user account?"
            : "Don't have an account?"}{" "}
          <Link
            href={
              isUserLogin
                ? "/user/signup"
                : "/join"
            }
          >
            {isUserLogin
              ? "Create User Account"
              : "Create an account"}
          </Link>
        </p>

        <Link
          href="/"
          className="back-home"
        >
          ← Back to BmKalaHub
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}