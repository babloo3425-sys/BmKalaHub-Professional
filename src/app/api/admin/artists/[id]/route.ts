import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import Profile from "@/models/Profile";

const ALLOWED_ACTIONS = [
  "verify",
  "feature",
  "block",
  "deactivate",
] as const;

type AdminAction = (typeof ALLOWED_ACTIONS)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const action = String(body.action || "").trim() as AdminAction;

    if (!ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json(
        { message: "Invalid admin action." },
        { status: 400 }
      );
    }

    if (typeof body.value !== "boolean") {
      return NextResponse.json(
        { message: "Action value must be boolean." },
        { status: 400 }
      );
    }

    const value = body.value;

    const updateField: Record<string, boolean> = {};

    if (action === "verify") {
      updateField.verified = value;
    }

    if (action === "feature") {
      updateField.featured = value;
    }

    if (action === "block") {
      updateField.blocked = value;
    }

    if (action === "deactivate") {
      updateField.deactivated = value;
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      {
        $set: updateField,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!profile) {
      return NextResponse.json(
        { message: "Artist profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: `Artist ${action} status updated successfully.`,
        profile: {
          id: profile._id.toString(),
          verified: Boolean(profile.verified),
          featured: Boolean(profile.featured),
          blocked: Boolean(profile.blocked),
          deactivated: Boolean(profile.deactivated),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin artist action error:", error);

    return NextResponse.json(
      { message: "Unable to update artist status." },
      { status: 500 }
    );
  }
}