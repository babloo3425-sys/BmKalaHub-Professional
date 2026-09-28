import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import Profile from "@/models/Profile";

export async function GET() {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const profiles = await Profile.find({})
      .select(
        "_id userId name category location profilePhoto experience contactDetails verified featured blocked deactivated createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        profiles,
        total: profiles.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin artists fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch artists." },
      { status: 500 }
    );
  }
}