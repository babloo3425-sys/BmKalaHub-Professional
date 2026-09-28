import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Message from "@/models/Message";
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

    const enquiries = await Enquiry.find({
      senderId: userId,
    })
      .populate({
        path: "artistId",
        select: "name category location profilePhoto",
      })
      .sort({ createdAt: -1 })
      .select(
        "artistId name email phone eventType message status createdAt updatedAt"
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
    console.error("Get sent enquiries error:", error);

    return NextResponse.json(
      { message: "Failed to load enquiries" },
      { status: 500 }
    );
  }
}