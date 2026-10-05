import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_TYPES = [
  "profilePhoto",
  "portfolio",
  "resume",
  "video",
  "audio",
];

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const userId = await verifyAuthToken(token);

  if (!userId) {
    return null;
  }

  await connectDB();

  const user = await User.findById(userId)
    .select("_id role accountType")
    .lean();

  if (!user) {
    return null;
  }

  return user;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        {
          message: "Admin accounts cannot upload artist media.",
        },
        { status: 403 }
      );
    }

    if (user.accountType !== "artist") {
      return NextResponse.json(
        {
          message: "Only artist accounts can upload media.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const type = String(body?.type || "");

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { message: "Invalid upload type." },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `bmkalahub/${user._id}`;

    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json(
      {
        signature,
        timestamp,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cloudinary signature error:", error);

    return NextResponse.json(
      { message: "Unable to create upload signature." },
      { status: 500 }
    );
  }
}