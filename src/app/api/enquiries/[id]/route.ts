import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Profile from "@/models/Profile";
import Notification from "@/models/Notification";
import Message from "@/models/Message";
import { verifyAuthToken } from "@/lib/auth";

const allowedStatuses = [
  "new",
  "read",
  "replied",
  "closed",
] as const;

type EnquiryStatus = (typeof allowedStatuses)[number];

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  return await verifyAuthToken(token);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
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
      .select(
        "_id senderId artistId name email phone eventType message status createdAt updatedAt"
      )
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid enquiry ID" },
        { status: 400 }
      );
    }

    /*
     * Find the current user's active artist profile.
     * This allows the artist who owns the enquiry
     * to delete it as well.
     */
    const profile = await Profile.findOne({
      userId,
      blocked: { $ne: true },
      deactivated: { $ne: true },
    })
      .select("_id")
      .lean();

    /*
     * The enquiry can belong to either:
     * 1. The customer who sent it
     * 2. The artist who received it
     */
    const enquiry = await Enquiry.findOne({
      _id: id,
      $or: [
        { senderId: userId },
        ...(profile
          ? [{ artistId: profile._id }]
          : []),
      ],
    })
      .select("_id senderId artistId status")
      .lean();

    if (!enquiry) {
      return NextResponse.json(
        { message: "Enquiry not found" },
        { status: 404 }
      );
    }

    /*
     * Only closed enquiries can be permanently deleted.
     * This prevents accidental deletion of an active enquiry.
     */
    if (enquiry.status !== "closed") {
      return NextResponse.json(
        {
          message:
            "Only closed enquiries can be deleted.",
        },
        { status: 400 }
      );
    }

    /*
     * Remove related conversation messages.
     * Both customer and artist messages belong
     * to this enquiry.
     */
    await Message.deleteMany({
      enquiryId: enquiry._id,
    });

    /*
     * Remove notifications generated for this enquiry.
     */
    await Notification.deleteMany({
      enquiryId: enquiry._id,
    });

    /*
     * Finally remove the enquiry itself.
     *
     * The ownership check is repeated here so that
     * the enquiry cannot be deleted by another user.
     */
    const deletedEnquiry =
      await Enquiry.findOneAndDelete({
        _id: enquiry._id,
        status: "closed",
        $or: [
          { senderId: userId },
          ...(profile
            ? [{ artistId: profile._id }]
            : []),
        ],
      })
        .select("_id")
        .lean();

    if (!deletedEnquiry) {
      return NextResponse.json(
        { message: "Enquiry could not be deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Enquiry deleted successfully",
        enquiryId: String(deletedEnquiry._id),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Delete enquiry error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to delete enquiry" },
      { status: 500 }
    );
  }
}