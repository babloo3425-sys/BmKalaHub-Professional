import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Email address is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your BmKalaHub password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #17151f;">
          <h2>BmKalaHub</h2>

          <p>We received a request to reset your password.</p>

          <p>This link will expire in <strong>15 minutes</strong>.</p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #6946f5;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>If you did not request a password reset, you can safely ignore this email.</p>

          <p>— BmKalaHub</p>
        </div>
      `,
    });

    return NextResponse.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}