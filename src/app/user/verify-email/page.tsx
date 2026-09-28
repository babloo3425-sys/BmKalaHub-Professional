"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState(
    "Verifying your email address..."
  );

  useEffect(() => {
    const token = searchParams.get("token");

if (!token) {
  setStatus("error");
  setMessage("Invalid verification link.");
  return;
}

const verificationToken = token;

async function verifyEmail() {
  try {
    const response = await fetch(
      `/api/user/verify-email?token=${encodeURIComponent(
        verificationToken
      )}`,
      
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to verify email."
          );
        }

        setStatus("success");
        setMessage(
          "Your email has been verified successfully."
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify email."
        );
      }
    }

    verifyEmail();
  }, [searchParams]);

  return (
    <main className="verify-email-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .verify-email-page {
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

        .verify-email-card {
          width: 100%;
          max-width: 460px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 34px 32px;
          text-align: center;
          box-shadow:
            0 20px 50px rgba(17, 24, 39, 0.08);
        }

        .verify-email-logo {
          width: 58px;
          height: 58px;
          object-fit: contain;
          border-radius: 50%;
          margin-bottom: 18px;
        }

        .verify-email-brand {
          margin: 0 0 8px;
          color: #111827;
          font-size: 21px;
          font-weight: 800;
        }

        .verify-email-title {
          margin: 0 0 12px;
          color: #111827;
          font-size: 27px;
          line-height: 1.25;
        }

        .verify-email-message {
          margin: 0;
          color: #6b7280;
          font-size: 15px;
          line-height: 1.6;
        }

        .verify-email-success {
          margin-top: 24px;
          padding: 12px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
          font-size: 14px;
          line-height: 1.5;
        }

        .verify-email-error {
          margin-top: 24px;
          padding: 12px;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 14px;
          line-height: 1.5;
        }

        .verify-email-actions {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .verify-email-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 18px;
          border-radius: 8px;
          background: #111827;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .verify-email-button.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        @media (max-width: 600px) {
          .verify-email-page {
            align-items: flex-start;
            padding: 20px 14px;
          }

          .verify-email-card {
            margin-top: 12px;
            padding: 28px 18px;
            border-radius: 14px;
          }

          .verify-email-title {
            font-size: 24px;
          }

          .verify-email-message {
            font-size: 14px;
          }

          .verify-email-actions {
            flex-direction: column;
          }

          .verify-email-button {
            width: 100%;
          }
        }
      `}</style>

      <section className="verify-email-card">
        <img
          src="/BmKalaHub.png"
          alt="BmKalaHub"
          className="verify-email-logo"
        />

        <p className="verify-email-brand">
          BmKalaHub
        </p>

        <h1 className="verify-email-title">
          {status === "loading"
            ? "Verifying your email"
            : status === "success"
              ? "Email Verified"
              : "Verification Failed"}
        </h1>

        <p className="verify-email-message">
          {status === "loading"
            ? "Please wait while we verify your email address."
            : message}
        </p>

        {status === "success" && (
          <div className="verify-email-success">
            Your BmKalaHub user account is now verified.
          </div>
        )}

        {status === "error" && (
          <div className="verify-email-error">
            {message}
          </div>
        )}

        {status !== "loading" && (
          <div className="verify-email-actions">
            {status === "success" ? (
              <Link
                href="/login"
                className="verify-email-button"
              >
                Login
              </Link>
            ) : (
              <Link
                href="/user/signup"
                className="verify-email-button"
              >
                Create Account
              </Link>
            )}

            <Link
              href="/"
              className="verify-email-button secondary"
            >
              Back to Home
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function VerifyEmailFallback() {
  return (
    <main className="verify-email-page">
      <section className="verify-email-card">
        <img
          src="/BmKalaHub.png"
          alt="BmKalaHub"
          className="verify-email-logo"
        />

        <p className="verify-email-brand">
          BmKalaHub
        </p>

        <h1 className="verify-email-title">
          Verifying your email
        </h1>

        <p className="verify-email-message">
          Please wait while we verify your email address.
        </p>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}