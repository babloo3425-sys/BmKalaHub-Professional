import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import Enquiry from "@/models/Enquiry";
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
        { message: "Invalid message ID" },
        { status: 400 }
      );
    }

    const message = await Message.findById(id)
      .select("_id enquiryId senderId receiverId read")
      .lean();

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    if (message.receiverId.toString() !== userId.toString()) {
      return NextResponse.json(
        {
          message:
            "You are not authorized to update this message",
        },
        { status: 403 }
      );
    }

    const enquiry = await Enquiry.findById(message.enquiryId)
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
        {
          message:
            "You are not authorized for this enquiry",
        },
        { status: 403 }
      );
    }

    const updatedMessage = await Message.findOneAndUpdate(
      {
        _id: id,
        receiverId: userId,
      },
      {
        $set: { read: true },
      },
      {
        returnDocument: "after",
      }
    )
      .select(
        "_id enquiryId senderId receiverId message read createdAt updatedAt"
      )
      .lean();

    if (!updatedMessage) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Message marked as read",
        data: updatedMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark message as read error:", error);

    return NextResponse.json(
      { message: "Failed to update message" },
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
        { message: "Invalid message ID" },
        { status: 400 }
      );
    }

    const message = await Message.findById(id)
      .select("_id enquiryId senderId receiverId")
      .lean();

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    /*
     * A user can delete only their own message.
     * Messages belonging to the other participant
     * must remain untouched.
     */
    if (message.senderId.toString() !== userId.toString()) {
      return NextResponse.json(
        {
          message:
            "You can only delete messages sent by you",
        },
        { status: 403 }
      );
    }

    const deletedMessage = await Message.findOneAndDelete({
      _id: id,
      senderId: userId,
    })
      .select("_id")
      .lean();

    if (!deletedMessage) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Message deleted successfully",
        messageId: deletedMessage._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete message error:", error);

    return NextResponse.json(
      { message: "Failed to delete message" },
      { status: 500 }
    );
  }
}