import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Message from "@/models/Message";
import Profile from "@/models/Profile";
import { verifyAuthToken } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = await verifyAuthToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const profile = await Profile.findOne({
      userId,
      blocked: { $ne: true },
      deactivated: { $ne: true },
    }).select("_id");

    if (!profile) {
      return NextResponse.json(
        { message: "Artist profile not found" },
        { status: 404 }
      );
    }

    const enquiries = await Enquiry.find({
      artistId: profile._id,
    })
      .sort({ createdAt: -1 })
      .select(
        "senderId name email phone eventType message status createdAt updatedAt"
      )
      .lean();

     const enquiriesWithUnread = await Promise.all(
     enquiries.map(async (enquiry) => {
     const unreadCount = await Message.countDocuments({
      enquiryId: enquiry._id,
      receiverId: userId,
      read: false,
    });

    return {
      ...enquiry,
      unreadCount,
    };
  })
);

    return NextResponse.json(
    {
      enquiries: enquiriesWithUnread,
      count: enquiriesWithUnread.length,
    },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get received enquiries error:", error);

    return NextResponse.json(
      { message: "Failed to load enquiries" },
      { status: 500 }
    );
  }
}