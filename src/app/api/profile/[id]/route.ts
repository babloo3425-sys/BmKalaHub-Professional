import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await connectDB();

    const profile = await Profile.findById(id)
      .select(
        "name category location profilePhoto experience contactDetails portfolio resume video audio"
      )
      .lean();

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
    console.error("Public profile fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch profile." },
      { status: 500 }
    );
  }
}