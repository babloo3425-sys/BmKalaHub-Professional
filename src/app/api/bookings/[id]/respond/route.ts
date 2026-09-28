import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Profile from "@/models/Profile";
import { verifyAuthToken } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
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
        {
          message:
            "Admin accounts cannot respond to booking quotes",
        },
        { status: 403 }
      );
    }

    if (user.accountType !== "customer") {
      return NextResponse.json(
        {
          message:
            "Only customer accounts can respond to booking quotes",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Booking ID is required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({
      _id: id,
      customerId: userId,
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "quoted") {
      return NextResponse.json(
        {
          message:
            "You can only respond to an active booking quote",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const action = String(body.action || "")
      .trim()
      .toLowerCase();

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        {
          message:
            "Action must be either accept or reject",
        },
        { status: 400 }
      );
    }

    booking.status =
      action === "accept" ? "accepted" : "rejected";

    await booking.save();

    // ---------------------------------
    // Find artist user
    // ---------------------------------
    const artistProfile = await Profile.findById(
      booking.artistId
    )
      .select("userId")
      .lean();

    if (!artistProfile?.userId) {
      return NextResponse.json(
        {
          message: "Artist account not found",
        },
        { status: 404 }
      );
    }

    // ---------------------------------
    // Create one notification
    // ---------------------------------
    const notification = await Notification.create({
      userId: artistProfile.userId,
      type: "booking",
      title:
        action === "accept"
          ? "Quote accepted"
          : "Quote rejected",
      message:
        action === "accept"
          ? `Your quote for ${booking.service} has been accepted.`
          : `Your quote for ${booking.service} has been rejected.`,
      enquiryId: booking.enquiryId,
    });

    // ---------------------------------
    // Realtime booking + notification
    // ---------------------------------
    try {
      await fetch("http://localhost:3002/internal/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-socket-internal-secret":
            process.env.SOCKET_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          receiverId: String(artistProfile.userId),
          booking: {
            _id: String(booking._id),
            enquiryId: String(booking.enquiryId),
            customerId: String(booking.customerId),
            artistId: String(booking.artistId),
            service: booking.service,
            bookingDate: booking.bookingDate,
            quoteAmount: booking.quoteAmount,
            quoteNote: booking.quoteNote,
            status: booking.status,
            updatedAt: booking.updatedAt,
          },
        }),
      });

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
            receiverId: String(artistProfile.userId),
            notification: {
              _id: String(notification._id),
              type: notification.type,
              title: notification.title,
              message: notification.message,
              enquiryId: String(booking.enquiryId),
              read: notification.read,
              createdAt: notification.createdAt,
            },
          }),
        }
      );
    } catch (socketError) {
      console.error(
        "Booking response realtime event error:",
        socketError
      );
    }

    // ---------------------------------
    // Response
    // ---------------------------------
    return NextResponse.json(
      {
        message:
          action === "accept"
            ? "Quote accepted successfully"
            : "Quote rejected successfully",
        booking: {
          id: booking._id,
          enquiryId: booking.enquiryId,
          customerId: booking.customerId,
          artistId: booking.artistId,
          service: booking.service,
          bookingDate: booking.bookingDate,
          quoteAmount: booking.quoteAmount,
          quoteNote: booking.quoteNote,
          status: booking.status,
          updatedAt: booking.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Booking quote response error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to respond to booking quote",
      },
      { status: 500 }
    );
  }
}