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

    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const verificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      accountType: "artist",
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
        subject: "Verify your BmKalaHub artist account",
        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              color: #222;
            "
          >
            <h2 style="margin-bottom: 8px;">
              Welcome to BmKalaHub
            </h2>

            <p style="font-size: 18px;">
              Hello <strong>${name}</strong>,
            </p>

            <p style="line-height: 1.7;">
              Your BmKalaHub artist account has been created successfully.
              Please verify your email address before logging in.
            </p>

            <div style="margin: 30px 0;">
              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background: #111827;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                "
              >
                Verify Email
              </a>
            </div>

            <p style="line-height: 1.7;">
              This verification link will remain valid for
              <strong>24 hours</strong>.
            </p>

            <p
              style="
                color: #666;
                font-size: 14px;
                line-height: 1.7;
              "
            >
              If you did not create this BmKalaHub account,
              you can safely ignore this email.
            </p>

            <hr
              style="
                border: none;
                border-top: 1px solid #eee;
                margin: 30px 0;
              "
            />

            <p style="font-size: 13px; color: #777;">
              © BmKalaHub
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      await User.deleteOne({ email });

      console.error(
        "Join verification email error:",
        emailError
      );

      return NextResponse.json(
        {
          message:
            "Account could not be created because verification email could not be sent.",
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
    console.error("Join error:", error);

    return NextResponse.json(
      { message: "Unable to create account." },
      { status: 500 }
    );
  }
}