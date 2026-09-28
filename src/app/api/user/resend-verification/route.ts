import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";

const RESEND_COOLDOWN_MS = 60 * 1000;
const VERIFICATION_EXPIRY_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Email address is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email,
      role: "user",
      accountType: "customer",
    }).select(
      "+emailVerificationTokenHash +emailVerificationExpires +emailVerificationLastSentAt"
    );

    /*
     * Use the same response for unknown, verified,
     * and non-customer accounts to avoid account enumeration.
     */
    const genericMessage =
      "If this account requires email verification, a verification email will be sent.";

    if (!user) {
      return NextResponse.json(
        { message: genericMessage },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: genericMessage },
        { status: 200 }
      );
    }

    if (
      user.emailVerificationLastSentAt &&
      Date.now() -
        user.emailVerificationLastSentAt.getTime() <
        RESEND_COOLDOWN_MS
    ) {
      return NextResponse.json(
        {
          message:
            "Please wait 60 seconds before requesting another verification email.",
        },
        { status: 429 }
      );
    }

    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const verificationExpires = new Date(
      Date.now() + VERIFICATION_EXPIRY_MS
    );

    user.emailVerificationTokenHash =
      verificationTokenHash;

    user.emailVerificationExpires =
      verificationExpires;

    user.emailVerificationLastSentAt =
      new Date();

    await user.save();

    const verificationBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://bmkalahub.com"
        : "http://localhost:3001";

    const verificationUrl =
      `${verificationBaseUrl}/user/verify-email?token=${verificationToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your BmKalaHub email address",
        html: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Verify your BmKalaHub email</title>
            </head>

            <body
              style="
                margin:0;
                padding:0;
                background:#f5f7fb;
                font-family:Arial,Helvetica,sans-serif;
                color:#111827;
              "
            >
              <div style="padding:40px 16px;">
                <div
                  style="
                    max-width:560px;
                    margin:0 auto;
                    background:#ffffff;
                    border:1px solid #e5e7eb;
                    border-radius:16px;
                    padding:32px;
                  "
                >
                  <h1
                    style="
                      margin:0 0 12px;
                      font-size:24px;
                      line-height:1.3;
                    "
                  >
                    Verify your BmKalaHub email
                  </h1>

                  <p
                    style="
                      margin:0 0 18px;
                      font-size:15px;
                      line-height:1.6;
                      color:#4b5563;
                    "
                  >
                    Hello ${user.name},
                  </p>

                  <p
                    style="
                      margin:0 0 24px;
                      font-size:15px;
                      line-height:1.6;
                      color:#4b5563;
                    "
                  >
                    Please verify your email address to activate
                    your BmKalaHub user account.
                  </p>

                  <a
                    href="${verificationUrl}"
                    style="
                      display:inline-block;
                      padding:13px 22px;
                      background:#111827;
                      color:#ffffff;
                      text-decoration:none;
                      border-radius:8px;
                      font-size:14px;
                      font-weight:700;
                    "
                  >
                    Verify Email
                  </a>

                  <p
                    style="
                      margin:24px 0 0;
                      font-size:13px;
                      line-height:1.6;
                      color:#6b7280;
                    "
                  >
                    This verification link will expire in 30 minutes.
                  </p>

                  <p
                    style="
                      margin:18px 0 0;
                      font-size:12px;
                      line-height:1.6;
                      color:#9ca3af;
                    "
                  >
                    If you did not request this email, you can
                    safely ignore it.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error(
        "Resend verification email error:",
        emailError
      );

      return NextResponse.json(
        {
          message:
            "Unable to send verification email. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: genericMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return NextResponse.json(
      { message: "Unable to process the request." },
      { status: 500 }
    );
  }
}