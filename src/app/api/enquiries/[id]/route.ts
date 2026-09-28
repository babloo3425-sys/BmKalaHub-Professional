import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Profile from "@/models/Profile";
import Notification from "@/models/Notification";
import { verifyAuthToken } from "@/lib/auth";

const allowedStatuses = [
  "new",
  "read",
  "replied",
  "closed",
] as const;

type EnquiryStatus = (typeof allowedStatuses)[number];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        { message: "Invalid enquiry ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status = body.status as EnquiryStatus;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid enquiry status" },
        { status: 400 }
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

    const enquiry = await Enquiry.findOneAndUpdate(
      {
        _id: id,
        artistId: profile._id,
      },
      {
        $set: { status },
      },
      {
        returnDocument: "after",
      }
    )
      .select("_id senderId artistId name email phone eventType message status createdAt updatedAt")
      .lean();

    if (!enquiry) {
      return NextResponse.json(
        { message: "Enquiry not found" },
        { status: 404 }
      );
    }

      const notification = await Notification.create({
      userId: enquiry.senderId,
      type: "enquiry",
      title: "Enquiry status updated",
      message: `Your enquiry status has been updated to ${enquiry.status}.`,
      enquiryId: enquiry._id,
    });

    /*
     * Send realtime enquiry status update to the customer.
     * If Socket.IO is unavailable, the enquiry update itself
     * must still succeed.
     */
    try {
      await fetch("http://localhost:3002/internal/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-socket-internal-secret":
            process.env.SOCKET_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          receiverId: String(enquiry.senderId),
          enquiry: {
            _id: String(enquiry._id),
            artistId: String(enquiry.artistId),
            name: enquiry.name,
            email: enquiry.email,
            phone: enquiry.phone,
            eventType: enquiry.eventType,
            message: enquiry.message,
            status: enquiry.status,
            createdAt: enquiry.createdAt,
            updatedAt: enquiry.updatedAt,
          },
        }),
      });
    } catch (socketError) {
      console.error(
        "Enquiry realtime status event error:",
        socketError
      );
    }

      try {
      await fetch("http://localhost:3002/internal/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-socket-internal-secret":
            process.env.SOCKET_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          receiverId: String(enquiry.senderId),
          notification: {
            _id: String(notification._id),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            enquiryId: String(enquiry._id),
            read: notification.read,
            createdAt: notification.createdAt,
          },
        }),
      });
    } catch (socketError) {
      console.error(
        "Enquiry status notification realtime event error:",
        socketError
      );
    }

    return NextResponse.json(
      {
        message: "Enquiry status updated successfully",
        enquiry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update enquiry status error:", error);

    return NextResponse.json(
      { message: "Failed to update enquiry status" },
      { status: 500 }
    );
  }
}