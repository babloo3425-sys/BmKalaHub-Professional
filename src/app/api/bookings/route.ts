import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Enquiry from "@/models/Enquiry";
import Profile from "@/models/Profile";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { verifyAuthToken } from "@/lib/auth";

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
        { message: "Admin accounts cannot create bookings" },
        { status: 403 }
      );
    }

    if (user.accountType !== "customer") {
      return NextResponse.json(
        { message: "Only customer accounts can create bookings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const enquiryId = String(body.enquiryId || "").trim();
    const service = String(body.service || "").trim();
    const bookingDateValue = String(body.bookingDate || "").trim();

    if (!enquiryId || !service || !bookingDateValue) {
      return NextResponse.json(
        {
          message:
            "Enquiry, service and booking date are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
      return NextResponse.json(
        { message: "Invalid enquiry ID" },
        { status: 400 }
      );
    }

    if (service.length > 200) {
      return NextResponse.json(
        { message: "Service name is too long" },
        { status: 400 }
      );
    }

    const bookingDate = new Date(bookingDateValue);

    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid booking date" },
        { status: 400 }
      );
    }

    if (bookingDate.getTime() < Date.now()) {
      return NextResponse.json(
        { message: "Booking date cannot be in the past" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findOne({
      _id: enquiryId,
      senderId: userId,
    }).select("_id artistId senderId status");

    if (!enquiry) {
      return NextResponse.json(
        { message: "Enquiry not found" },
        { status: 404 }
      );
    }

    if (enquiry.status === "closed") {
      return NextResponse.json(
        { message: "This enquiry is closed" },
        { status: 400 }
      );
    }

    const artist = await Profile.findOne({
      _id: enquiry.artistId,
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
        { message: "You cannot create a booking with yourself" },
        { status: 400 }
      );
    }

    const existingBooking = await Booking.findOne({
      enquiryId: enquiry._id,
      status: {
        $nin: ["rejected", "cancelled"],
      },
    }).select("_id status");

    if (existingBooking) {
      return NextResponse.json(
        {
          message:
            "A booking already exists for this enquiry",
          booking: {
            id: existingBooking._id,
            status: existingBooking.status,
          },
        },
        { status: 409 }
      );
    }

    const booking = await Booking.create({
      enquiryId: enquiry._id,
      customerId: userId,
      artistId: artist._id,
      service,
      bookingDate,
      quoteAmount: 0,
      quoteNote: "",
      status: "pending",
    });

      const notification = await Notification.create({
      userId: artist.userId,
      type: "booking",
      title: "New booking request",
      message: `You have received a new booking request for ${service}.`,
      enquiryId: enquiry._id,
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
          receiverId: String(artist.userId),
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
            createdAt: booking.createdAt,
          },
        }),
      });
    } catch (socketError) {
      console.error(
        "Booking realtime event error:",
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
        "Booking notification realtime event error:",
        socketError
      );
    }

          try {
      await fetch("http://localhost:3002/internal/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-socket-internal-secret":
            process.env.SOCKET_INTERNAL_SECRET || "",
        },
        body: JSON.stringify({
          receiverId: String(userId),
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
            createdAt: booking.createdAt,
          },
        }),
      });
    } catch (socketError) {
      console.error(
        "Customer booking realtime event error:",
        socketError
      );
    }

    return NextResponse.json(
      {
        message: "Booking request sent successfully",
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
          createdAt: booking.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);

    return NextResponse.json(
      { message: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
            "Admin accounts cannot access customer bookings",
        },
        { status: 403 }
      );
    }

    if (user.accountType !== "customer") {
      return NextResponse.json(
        {
          message:
            "Only customer accounts can access these bookings",
        },
        { status: 403 }
      );
    }

    const bookings = await Booking.find({
      customerId: userId,
    })
      .populate({
        path: "artistId",
        select: "name category location profilePhoto",
      })
      .populate({
        path: "enquiryId",
        select: "eventType message status createdAt",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get bookings error:", error);

    return NextResponse.json(
      { message: "Failed to load bookings" },
      { status: 500 }
    );
  }
}

  export async function DELETE(request: NextRequest) {
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
            "Admin accounts cannot delete bookings",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const bookingId = String(
      body.bookingId || ""
    ).trim();

    if (
      !bookingId ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      return NextResponse.json(
        { message: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId)
      .select(
        "_id customerId artistId status"
      )
      .lean();

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    /*
     * Only finished / inactive bookings can be
     * permanently removed from history.
     */
    const deletableStatuses = [
      "rejected",
      "cancelled",
      "completed",
    ];

    if (
      !deletableStatuses.includes(
        booking.status
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Active bookings cannot be deleted",
        },
        { status: 400 }
      );
    }

    /*
     * CUSTOMER OWNERSHIP
     */
    const isCustomer =
      String(booking.customerId) ===
      String(userId);

    /*
     * ARTIST OWNERSHIP
     *
     * Booking stores Profile._id in artistId,
     * while the logged-in user owns that Profile
     * through Profile.userId.
     */
    const artistProfile = await Profile.findOne({
      _id: booking.artistId,
      userId,
      blocked: { $ne: true },
      deactivated: { $ne: true },
    })
      .select("_id userId")
      .lean();

    const isArtist = Boolean(artistProfile);

    if (!isCustomer && !isArtist) {
      return NextResponse.json(
        {
          message:
            "You are not authorized to delete this booking",
        },
        { status: 403 }
      );
    }

    const deletedBooking =
      await Booking.findOneAndDelete({
        _id: bookingId,
        $or: [
          {
            customerId: userId,
          },
          ...(isArtist
            ? [
                {
                  artistId:
                    artistProfile!._id,
                },
              ]
            : []),
        ],
      })
        .select("_id")
        .lean();

    if (!deletedBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Booking deleted successfully",
        bookingId: deletedBooking._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Delete booking error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete booking",
      },
      { status: 500 }
    );
  }
}