import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Profile from "@/models/Profile";
import User from "@/models/User";
import Notification from "@/models/Notification";
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
            "Admin accounts cannot complete bookings",
        },
        { status: 403 }
      );
    }

    if (user.accountType !== "artist") {
      return NextResponse.json(
        {
          message:
            "Only artist accounts can complete bookings",
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

    const booking = await Booking.findOne({
      _id: id,
      artistId: profile._id,
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "accepted") {
      return NextResponse.json(
        {
          message:
            "Only an accepted booking can be marked as completed",
        },
        { status: 400 }
      );
    }

        booking.status = "completed";

    await booking.save();

    const notification = await Notification.create({
      userId: booking.customerId,
      type: "booking",
      title: "Booking completed",
      message: `Your booking for ${booking.service} has been marked as completed.`,
      enquiryId: booking.enquiryId,
    });

    try {
      await fetch("http://localhost:3002/internal/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-socket-internal-secret":
            process.env.SOCKET_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          receiverId: String(booking.customerId),
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
    } catch (socketError) {
      console.error(
        "Booking completion realtime event error:",
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
          receiverId: String(booking.customerId),
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
      });
    } catch (socketError) {
      console.error(
        "Booking completion notification realtime event error:",
        socketError
      );
    }

    return NextResponse.json(
      {
        message: "Booking marked as completed successfully",
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
      "Complete booking error:",
      error
    );

    return NextResponse.json(
      { message: "Failed to complete booking" },
      { status: 500 }
    );
  }
}