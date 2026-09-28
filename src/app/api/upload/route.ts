import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_PORTFOLIO_SIZE = 1 * 1024 * 1024;
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

const PROFILE_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const PORTFOLIO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const RESUME_TYPES = [
  "application/pdf",
];

const VIDEO_TYPES = [
  "video/mp4",
];

const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
];

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
          message:
            "Admin accounts cannot upload artist media.",
        },
        { status: 403 }
      );
    }

    if (user.accountType !== "artist") {
      return NextResponse.json(
        {
          message:
            "Only artist accounts can upload media.",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const type = String(formData.get("type") || "");

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { message: "Invalid upload type." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File is required." },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { message: "File cannot be empty." },
        { status: 400 }
      );
    }

    /*
     * Profile photo
     * JPG, PNG or WEBP - maximum 5 MB.
     */
    if (type === "profilePhoto") {
      if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            message:
              "Profile photo only accepts JPG, PNG or WEBP images.",
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_PROFILE_PHOTO_SIZE) {
        return NextResponse.json(
          {
            message:
              "Profile photo must be 5 MB or smaller.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Portfolio
     * JPG, PNG or WEBP - maximum 1 MB per file.
     */
    if (type === "portfolio") {
      if (!PORTFOLIO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            message:
              "Portfolio only accepts JPG, PNG or WEBP images.",
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_PORTFOLIO_SIZE) {
        return NextResponse.json(
          {
            message:
              "Portfolio image must be 1 MB or smaller.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Resume
     * PDF only - maximum 5 MB.
     */
    if (type === "resume") {
      if (!RESUME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            message:
              "Resume must be a PDF file.",
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_RESUME_SIZE) {
        return NextResponse.json(
          {
            message:
              "Resume must be 5 MB or smaller.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Performance video
     * MP4 only - maximum 50 MB.
     */
    if (type === "video") {
      if (!VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            message:
              "Performance video must be an MP4 file.",
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          {
            message:
              "Performance video must be 50 MB or smaller.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * Performance audio
     * Common audio formats - maximum 20 MB.
     */
    if (type === "audio") {
      if (!AUDIO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            message:
              "Audio must be a supported audio file.",
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_AUDIO_SIZE) {
        return NextResponse.json(
          {
            message:
              "Audio must be 20 MB or smaller.",
          },
          { status: 400 }
        );
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
      resource_type: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bmkalahub/${user._id}`,
          resource_type: "auto",

          ...(type === "portfolio" ||
          type === "profilePhoto"
            ? {
                resource_type: "image",
                transformation: [
                  {
                    width: 1200,
                    height: 1200,
                    crop: "limit",
                    quality: "auto",
                    fetch_format: "auto",
                  },
                ],
              }
            : {}),
        },
        (error, result) => {
          if (error || !result) {
            reject(
              error || new Error("Upload failed.")
            );
            return;
          }

          resolve({
            secure_url: result.secure_url,
            resource_type: result.resource_type,
          });
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        message: "File uploaded successfully.",
        url: result.secure_url,
        resourceType: result.resource_type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { message: "Unable to upload file." },
      { status: 500 }
    );
  }
}