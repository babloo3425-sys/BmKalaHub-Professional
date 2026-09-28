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
        { message: "Admin accounts cannot send artist quotes" },
        { status: 403 }
      );
    }

    if (user.accountType !== "artist") {
      return NextResponse.json(
        { message: "Only artist accounts can send quotes" },
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

    if (booking.status !== "pending") {
      return NextResponse.json(
        {
          message:
            "A quote can only be sent for a pending booking",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const quoteAmount = Number(body.quoteAmount);
    const quoteNote = String(body.quoteNote || "").trim();

    if (!Number.isFinite(quoteAmount) || quoteAmount <= 0) {
      return NextResponse.json(
        {
          message:
            "Quote amount must be greater than zero",
        },
        { status: 400 }
      );
    }

    if (quoteNote.length > 2000) {
      return NextResponse.json(
        { message: "Quote note is too long" },
        { status: 400 }
      );
    }

    booking.quoteAmount = quoteAmount;
    booking.quoteNote = quoteNote;
    booking.status = "quoted";

    await booking.save();

    const notification = await Notification.create({
      userId: booking.customerId,
      type: "booking",
      title: "New quote received",
      message: `You have received a quote of ₹${booking.quoteAmount} for ${booking.service}.`,
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
        "Booking quote realtime event error:",
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
        "Booking quote notification realtime event error:",
        socketError
      );
    }

    return NextResponse.json(
      {
        message: "Quote sent successfully",
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
    console.error("Send booking quote error:", error);

    return NextResponse.json(
      { message: "Failed to send booking quote" },
      { status: 500 }
    );
  }
}