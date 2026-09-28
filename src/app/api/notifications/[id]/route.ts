import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { verifyAuthToken } from "@/lib/auth";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid notification ID" },
        { status: 400 }
      );
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      {
        $set: {
          read: true,
        },
      },
      {
        new: true,
      }
    )
      .select(
        "_id userId type title message enquiryId messageId read createdAt updatedAt"
      )
      .lean();

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Notification marked as read",
        notification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Mark notification as read error:", error);

    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 }
    );
  }
}