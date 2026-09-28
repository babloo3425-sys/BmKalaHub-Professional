import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = String(searchParams.get("token") || "").trim();

    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
    }).select(
      "+emailVerificationTokenHash +emailVerificationExpires"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified." },
        { status: 200 }
      );
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires.getTime() < Date.now()
    ) {
      return NextResponse.json(
        { message: "This verification link has expired." },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpires = null;
    user.emailVerificationLastSentAt = null;

    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

    return NextResponse.json(
      { message: "Unable to verify email." },
      { status: 500 }
    );
  }
}