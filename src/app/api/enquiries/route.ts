import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Profile from "@/models/Profile";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { verifyAuthToken } from "@/lib/auth";
import { cookies } from "next/headers";
export async function POST(request: NextRequest) {
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

   const user = await User.findById(userId)
   .select("role accountType")
   .lean();

  if (!user) {
  return NextResponse.json(
    { message: "User not found" },
    { status: 404 }
  );
 }

  if (user.role === "admin") {
  return NextResponse.json(
    { message: "Admin accounts cannot send enquiries" },
    { status: 403 }
  );
 }

  if (user.accountType !== "customer") {
  return NextResponse.json(
    { message: "Only customer accounts can send enquiries" },
    { status: 403 }
  );
 }

  if (!userId) {
  return NextResponse.json(
    { message: "Authentication required" },
    { status: 401 }
  );
}

    const body = await request.json();

    const artistId = String(body.artistId || "").trim();
    const phone = String(body.phone || "").trim();
    const eventType = String(body.eventType || "").trim();
    const message = String(body.message || "").trim();

    if (!artistId || !message) {
      return NextResponse.json(
        { message: "Artist and message are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(artistId)) {
      return NextResponse.json(
        { message: "Invalid artist ID" },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { message: "Message is too long" },
        { status: 400 }
      );
    }

    const artist = await Profile.findOne({
      _id: artistId,
      blocked: { $ne: true },
      deactivated: { $ne: true },
    }).select("_id userId name");

    if (!artist) {
      return NextResponse.json(
        { message: "Artist not found" },
        { status: 404 }
      );
    }

    if (String(artist.userId) === String(userId)) {
      return NextResponse.json(
        { message: "You cannot send an enquiry to yourself" },
        { status: 400 }
      );
    }

    const sender = await User.findById(userId).select("name email");

    if (!sender) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const enquiry = await Enquiry.create({
      artistId: artist._id,
      senderId: userId,
      name: sender.name,
      email: sender.email,
      phone,
      eventType,
      message,
    });

    const notification = await Notification.create({
      userId: artist.userId,
      type: "enquiry",
      title: "New enquiry",
      message: `${sender.name} has sent you a new enquiry.`,
      enquiryId: enquiry._id,
    });

      try {
      await fetch("http://localhost:3002/internal/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-socket-internal-secret":
            process.env.SOCKET_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          receiverId: String(artist.userId),
          enquiry: {
            _id: String(enquiry._id),
            name: enquiry.name,
            email: enquiry.email,
            phone: enquiry.phone,
            eventType: enquiry.eventType,
            message: enquiry.message,
            status: enquiry.status,
            createdAt: enquiry.createdAt,
          },
        }),
      });
    } catch (socketError) {
      console.error(
        "Enquiry realtime event error:",
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
          receiverId: String(artist.userId),
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
        "Enquiry notification realtime event error:",
        socketError
      );
    }

    return NextResponse.json(
      {
        message: "Enquiry sent successfully",
        enquiry: {
          id: enquiry._id,
          status: enquiry.status,
          createdAt: enquiry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create enquiry error:", error);

    return NextResponse.json(
      { message: "Failed to send enquiry" },
      { status: 500 }
    );
  }
}