import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";
import Review from "@/models/Review";
import Notification from "@/models/Notification";

const ALLOWED_ACTIONS = [
  "approve",
  "reject",
] as const;

type ReviewAction =
  (typeof ALLOWED_ACTIONS)[number];

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: Props
) {
  try {
    // ---------------------------------
    // 1. Admin authentication
    // ---------------------------------
    const admin = await getAdminUser();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin authentication required",
        },
        { status: 401 }
      );
    }

    // ---------------------------------
    // 2. Database
    // ---------------------------------
    await connectDB();

    // ---------------------------------
    // 3. Review ID
    // ---------------------------------
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid review ID",
        },
        { status: 400 }
      );
    }

    // ---------------------------------
    // 4. Request body
    // ---------------------------------
    const body = await request.json();

    const action = body.action as ReviewAction;

    if (!ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid action. Use approve or reject.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------
    // 5. Find review
    // ---------------------------------
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: "Review not found",
        },
        { status: 404 }
      );
    }

    // ---------------------------------
    // 6. Update moderation status
    // ---------------------------------
    review.moderationStatus =
      action === "approve"
        ? "approved"
        : "rejected";

    await review.save();

    const notification = await Notification.create({
  userId: review.customerId,
  type: "review",
  title:
    action === "approve"
      ? "Review approved"
      : "Review rejected",
  message:
    action === "approve"
      ? "Your review has been approved and is now visible."
      : "Your review has been rejected by admin.",
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
      receiverId: String(review.customerId),
      notification: {
        _id: String(notification._id),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      },
    }),
  });
} catch (socketError) {
  console.error(
    "Review moderation notification realtime event error:",
    socketError
  );
}

    // ---------------------------------
    // 7. Response
    // ---------------------------------
    return NextResponse.json(
      {
        success: true,
        message:
          action === "approve"
            ? "Review approved successfully"
            : "Review rejected successfully",
        review: {
          _id: String(review._id),
          bookingId: String(review.bookingId),
          customerId: String(review.customerId),
          artistId: String(review.artistId),
          rating: review.rating,
          review: review.review,
          moderationStatus:
            review.moderationStatus,
          updatedAt: review.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin review moderation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update review",
      },
      { status: 500 }
    );
  }
}