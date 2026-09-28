import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

import User from "@/models/User";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Notification from "@/models/Notification";

// ---------------------------------
// GET
// Returns reviews submitted by the
// currently authenticated customer
// ---------------------------------
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // ---------------------------------
    // 1. Authentication
    // ---------------------------------
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = await verifyAuthToken(token);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 }
      );
    }

    // ---------------------------------
    // 2. User verification
    // ---------------------------------
    const user = await User.findById(userId)
      .select("_id role accountType")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admins cannot access customer reviews here",
        },
        { status: 403 }
      );
    }

    if (user.accountType !== "customer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can access these reviews",
        },
        { status: 403 }
      );
    }

    // ---------------------------------
    // 3. Get customer's reviews
    // ---------------------------------
    const reviews = await Review.find({
      customerId: user._id,
    })
      .select(
        "_id bookingId artistId rating review moderationStatus createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        reviews: reviews.map((item) => ({
          _id: String(item._id),
          bookingId: String(item.bookingId),
          artistId: String(item.artistId),
          rating: item.rating,
          review: item.review,
          moderationStatus: item.moderationStatus,
          createdAt: item.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get customer reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load reviews",
      },
      { status: 500 }
    );
  }
}

// ---------------------------------
// POST
// Create a review for a completed
// booking
// ---------------------------------
export async function POST(request: NextRequest) {
  try {
    // ---------------------------------
    // 1. Database
    // ---------------------------------
    await connectDB();

    // ---------------------------------
    // 2. Authentication
    // ---------------------------------
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = await verifyAuthToken(token);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session",
        },
        { status: 401 }
      );
    }

    // ---------------------------------
    // 3. User verification
    // ---------------------------------
    const user = await User.findById(userId)
      .select("_id role accountType")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admins cannot submit reviews",
        },
        { status: 403 }
      );
    }

    if (user.accountType !== "customer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only customers can submit reviews",
        },
        { status: 403 }
      );
    }

    // ---------------------------------
    // 4. Request body
    // ---------------------------------
    const body = await request.json();

    const bookingId =
      typeof body.bookingId === "string"
        ? body.bookingId.trim()
        : "";

    const rating = Number(body.rating);

    const review =
      typeof body.review === "string"
        ? body.review.trim()
        : "";

    // ---------------------------------
    // 5. Validate bookingId
    // ---------------------------------
    if (
      !bookingId ||
      !mongoose.isValidObjectId(bookingId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid bookingId is required",
        },
        { status: 400 }
      );
    }

    // ---------------------------------
    // 6. Validate rating
    // ---------------------------------
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    // ---------------------------------
    // 7. Validate review text
    // ---------------------------------
    if (review.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Review cannot exceed 1000 characters",
        },
        { status: 400 }
      );
    }

    // ---------------------------------
    // 8. Find customer's booking
    // ---------------------------------
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: userId,
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Booking not found or does not belong to you",
        },
        { status: 404 }
      );
    }

    // ---------------------------------
    // 9. Only completed bookings
    // ---------------------------------
    if (booking.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can review only a completed booking",
        },
        { status: 400 }
      );
    }

    // ---------------------------------
    // 10. Prevent duplicate review
    // ---------------------------------
    const existingReview = await Review.findOne({
      bookingId: booking._id,
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already reviewed this booking",
        },
        { status: 409 }
      );
    }

    // ---------------------------------
    // 11. Create review
    // ---------------------------------
    const newReview = await Review.create({
      bookingId: booking._id,
      customerId: userId,
      artistId: booking.artistId,
      rating,
      review,
      moderationStatus: "pending",
    });

    // ---------------------------------
    // 12. Get artist user ID
    // ---------------------------------
    const artistProfile = await import("@/models/Profile").then(
      ({ default: Profile }) =>
        Profile.findById(booking.artistId)
          .select("userId")
          .lean()
    );

    // ---------------------------------
    // 13. Create artist notification
    // ---------------------------------
    if (artistProfile?.userId) {
      const notification = await Notification.create({
        userId: artistProfile.userId,
        type: "review",
        title: "New review received",
        message:
          "A customer has submitted a new review for your completed booking.",
      });

      // ---------------------------------
      // 14. Realtime artist notification
      // ---------------------------------
      try {
        await fetch(
          "http://localhost:3002/internal/notification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-socket-internal-secret":
                process.env.SOCKET_INTERNAL_SECRET || "",
            },
            body: JSON.stringify({
              receiverId: String(
                artistProfile.userId
              ),
              notification: {
                _id: String(notification._id),
                type: notification.type,
                title: notification.title,
                message: notification.message,
                read: notification.read,
                createdAt:
                  notification.createdAt,
              },
            }),
          }
        );
      } catch (socketError) {
        console.error(
          "New review realtime notification error:",
          socketError
        );
      }
    }

    // ---------------------------------
    // 15. Response
    // ---------------------------------
    return NextResponse.json(
      {
        success: true,
        message:
          "Review submitted successfully and is pending moderation",
        review: {
          _id: String(newReview._id),
          bookingId: String(newReview.bookingId),
          artistId: String(newReview.artistId),
          rating: newReview.rating,
          review: newReview.review,
          moderationStatus:
            newReview.moderationStatus,
          createdAt: newReview.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Create review error:", error);

    // MongoDB duplicate-key protection
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already reviewed this booking",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit review",
      },
      { status: 500 }
    );
  }
}