import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import Enquiry from "@/models/Enquiry";
import Notification from "@/models/Notification";
import Profile from "@/models/Profile";
import { verifyAuthToken } from "@/lib/auth";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  return await verifyAuthToken(token);
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const enquiryId =
      new URL(request.url).searchParams.get("enquiryId")?.trim() || "";

    if (!enquiryId || !mongoose.Types.ObjectId.isValid(enquiryId)) {
      return NextResponse.json(
        { message: "Invalid enquiry ID" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(enquiryId)
      .select("artistId senderId")
      .lean();

    if (!enquiry) {
      return NextResponse.json(
        { message: "Enquiry not found" },
        { status: 404 }
      );
    }

    const isSender =
      enquiry.senderId.toString() === userId;

    const isArtist = await Profile.exists({
      _id: enquiry.artistId,
      userId,
      blocked: { $ne: true },
      deactivated: { $ne: true },
    });

    if (!isSender && !isArtist) {
      return NextResponse.json(
        { message: "You are not authorized for this enquiry" },
        { status: 403 }
      );
    }

    const messages = await Message.find({
      enquiryId: enquiry._id,
      $or: [
        {
          senderId: userId,
        },
        {
          receiverId: userId,
        },
      ],
    })
      .select(
        "_id enquiryId senderId receiverId message read createdAt updatedAt"
      )
      .sort({ createdAt: 1 })
      .lean();

      return NextResponse.json(
    {
      messages,
      count: messages.length,
      currentUserId: userId,
    },
    { status: 200 }
   );
  } catch (error) {
    console.error("Get messages error:", error);

    return NextResponse.json(
      { message: "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const enquiryId =
      typeof body.enquiryId === "string"
        ? body.enquiryId.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!enquiryId || !mongoose.Types.ObjectId.isValid(enquiryId)) {
      return NextResponse.json(
        { message: "Invalid enquiry ID" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { message: "Message cannot exceed 3000 characters" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(enquiryId)
      .select("artistId senderId")
      .lean();

    if (!enquiry) {
      return NextResponse.json(
        { message: "Enquiry not found" },
        { status: 404 }
      );
    }

    const isSender =
      enquiry.senderId.toString() === userId;

    const isArtist = await Profile.exists({
      _id: enquiry.artistId,
      userId,
      blocked: { $ne: true },
      deactivated: { $ne: true },
    });

    if (!isSender && !isArtist) {
      return NextResponse.json(
        { message: "You are not authorized for this enquiry" },
        { status: 403 }
      );
    }

    const artistProfile = await Profile.findById(enquiry.artistId)
      .select("userId")
      .lean();

    if (!artistProfile?.userId) {
      return NextResponse.json(
        { message: "Message recipient not found" },
        { status: 404 }
      );
    }

    const receiverId = isSender
      ? artistProfile.userId
      : enquiry.senderId;

    const createdMessage = await Message.create({
      enquiryId: enquiry._id,
      senderId: userId,
      receiverId,
      message,
    });

    const createdNotification = await Notification.create({
    userId: receiverId,
    type: "message",
    title: "New message",
    message: "You have received a new message.",
    enquiryId: enquiry._id,
    messageId: createdMessage._id,
  });

    try {
  await fetch("http://localhost:3002/internal/notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-socket-internal-secret":
        process.env.SOCKET_INTERNAL_SECRET || "",
    },
    body: JSON.stringify({
      receiverId: receiverId.toString(),
      notification: {
        _id: createdNotification._id.toString(),
        type: createdNotification.type,
        title: createdNotification.title,
        message: createdNotification.message,
        enquiryId: createdNotification.enquiryId
          ? createdNotification.enquiryId.toString()
          : null,
        messageId: createdNotification.messageId
          ? createdNotification.messageId.toString()
          : null,
        read: createdNotification.read,
        createdAt: createdNotification.createdAt,
      },
    }),
  });
} catch (socketError) {
  console.error(
    "Socket notification delivery error:",
    socketError
  );
}

      try {
      await fetch("http://localhost:3002/internal/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-socket-internal-secret":
            process.env.SOCKET_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          receiverId: receiverId.toString(),
          message: {
            _id: createdMessage._id.toString(),
            enquiryId: createdMessage.enquiryId.toString(),
            senderId: createdMessage.senderId.toString(),
            receiverId: createdMessage.receiverId.toString(),
            message: createdMessage.message,
            read: createdMessage.read,
            createdAt: createdMessage.createdAt,
          },
        }),
      });
    } catch (socketError) {
      console.error(
        "Socket message delivery error:",
        socketError
      );
    }

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: {
          _id: createdMessage._id,
          enquiryId: createdMessage.enquiryId,
          senderId: createdMessage.senderId,
          receiverId: createdMessage.receiverId,
          message: createdMessage.message,
          read: createdMessage.read,
          createdAt: createdMessage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);

    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}