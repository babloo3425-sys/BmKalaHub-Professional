import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAuthToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const userId = await verifyAuthToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select(
    "_id name email role accountType"
  );

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);

    return NextResponse.json(
      { message: "Unable to verify session." },
      { status: 500 }
    );
  }
}