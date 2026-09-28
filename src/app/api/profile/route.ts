import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import User from "@/models/User";
import Profile from "@/models/Profile";

const MAX_PORTFOLIO_ITEMS = 3;

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

function getStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getPortfolio(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET() {
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
        { message: "Admin accounts cannot access artist profiles." },
        { status: 403 }
      );
    }

    if (user.accountType !== "artist") {
      return NextResponse.json(
        { message: "Only artist accounts can access artist profiles." },
        { status: 403 }
      );
    }

    const profile = await Profile.findOne({
      userId: user._id,
    }).lean();

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { profile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch profile." },
      { status: 500 }
    );
  }
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
        { message: "Admin accounts cannot create artist profiles." },
        { status: 403 }
      );
    }

    if (user.accountType !== "artist") {
      return NextResponse.json(
        { message: "Only artist accounts can create artist profiles." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = getStringValue(body.name);
    const category = getStringValue(body.category);
    const location = getStringValue(body.location);
    const profilePhoto = getStringValue(body.profilePhoto);
    const experience = getStringValue(body.experience);
    const contactDetails = getStringValue(
      body.contactDetails
    );

    const portfolio = getPortfolio(body.portfolio);

    if (portfolio.length > MAX_PORTFOLIO_ITEMS) {
      return NextResponse.json(
        {
          message:
            "You can have a maximum of 3 portfolio images.",
        },
        { status: 400 }
      );
    }

    const resume = getStringValue(body.resume);
    const video = getStringValue(body.video);
    const audio = getStringValue(body.audio);

    if (!name || !category || !location) {
      return NextResponse.json(
        {
          message:
            "Name, category and location are required.",
        },
        { status: 400 }
      );
    }

    const existingProfile = await Profile.findOne({
      userId: user._id,
    });

    if (existingProfile) {
      return NextResponse.json(
        { message: "Profile already exists." },
        { status: 409 }
      );
    }

    const profile = await Profile.create({
      userId: user._id,
      name,
      category,
      location,
      profilePhoto,
      experience,
      contactDetails,
      portfolio,
      resume,
      video,
      audio,
    });

    return NextResponse.json(
      {
        message: "Profile created successfully.",
        profileId: profile._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Profile create error:", error);

    return NextResponse.json(
      { message: "Unable to create profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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
        { message: "Admin accounts cannot update artist profiles." },
        { status: 403 }
      );
    }

    if (user.accountType !== "artist") {
      return NextResponse.json(
        { message: "Only artist accounts can update artist profiles." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = getStringValue(body.name);
    const category = getStringValue(body.category);
    const location = getStringValue(body.location);
    const profilePhoto = getStringValue(body.profilePhoto);
    const experience = getStringValue(body.experience);
    const contactDetails = getStringValue(
      body.contactDetails
    );

    const portfolio = getPortfolio(body.portfolio);

    if (portfolio.length > MAX_PORTFOLIO_ITEMS) {
      return NextResponse.json(
        {
          message:
            "You can have a maximum of 3 portfolio images.",
        },
        { status: 400 }
      );
    }

    const resume = getStringValue(body.resume);
    const video = getStringValue(body.video);
    const audio = getStringValue(body.audio);

    if (!name || !category || !location) {
      return NextResponse.json(
        {
          message:
            "Name, category and location are required.",
        },
        { status: 400 }
      );
    }

    const profile = await Profile.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        name,
        category,
        location,
        profilePhoto,
        experience,
        contactDetails,
        portfolio,
        resume,
        video,
        audio,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      { message: "Unable to update profile." },
      { status: 500 }
    );
  }
}