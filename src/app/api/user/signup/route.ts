import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const verificationExpires = new Date(
      Date.now() + 30 * 60 * 1000
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      accountType: "customer",
      emailVerified: false,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpires: verificationExpires,
      emailVerificationLastSentAt: new Date(),
    });

    const verificationBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://bmkalahub.com"
        : "http://localhost:3001";

    const verificationUrl =
      `${verificationBaseUrl}/user/verify-email?token=${verificationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "Verify your BmKalaHub email address",
        html: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                    Hello ${name},
                  </p>

                  <p
                    style="
                      margin:0 0 24px;
                      font-size:15px;
                      line-height:1.6;
                      color:#4b5563;
                    "
                  >
                    Please verify your email address to activate your
                    BmKalaHub user account.
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
                    If you did not create this account, you can safely
                    ignore this email.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error(
        "Customer verification email error:",
        emailError
      );

      await User.deleteOne({ _id: user._id });

      return NextResponse.json(
        {
          message:
            "Unable to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Account created. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer signup error:", error);

    return NextResponse.json(
      { message: "Unable to create account." },
      { status: 500 }
    );
  }
}