import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { verifyAuthToken } from "@/lib/auth";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  return await verifyAuthToken(token);
}

export async function GET() {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const notifications = await Notification.find({
      userId,
    })
      .select(
        "_id userId type title message enquiryId messageId read createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    return NextResponse.json(
      {
        notifications,
        count: notifications.length,
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get notifications error:", error);

    return NextResponse.json(
      { message: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const notificationId =
      request.nextUrl.searchParams.get("id")?.trim() || "";

    if (!notificationId) {
      return NextResponse.json(
        { message: "Notification ID is required" },
        { status: 400 }
      );
    }

    const deletedNotification =
      await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      }).lean();

    if (!deletedNotification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Notification deleted successfully",
        notificationId: deletedNotification._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete notification error:", error);

    return NextResponse.json(
      { message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}