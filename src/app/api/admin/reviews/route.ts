import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getAdminUser } from "@/lib/admin";

import Review from "@/models/Review";

type ModerationStatus =
  | "pending"
  | "approved"
  | "rejected";

type PopulatedCustomer = {
  _id: unknown;
  name: string;
  email: string;
};

type PopulatedArtist = {
  _id: unknown;
  name: string;
  category: string;
  location: string;
  profilePhoto: string;
};

type AdminReview = {
  _id: unknown;
  bookingId: unknown;
  customerId: PopulatedCustomer | null;
  artistId: PopulatedArtist | null;
  rating: number;
  review: string;
  moderationStatus: ModerationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export async function GET(request: NextRequest) {
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
    // 3. Optional moderation filter
    // ---------------------------------
    const { searchParams } = new URL(
      request.url
    );

    const requestedStatus =
      searchParams.get("status");

    let statusFilter:
      | ModerationStatus
      | undefined;

    if (
      requestedStatus === "pending" ||
      requestedStatus === "approved" ||
      requestedStatus === "rejected"
    ) {
      statusFilter = requestedStatus;
    }

    const filter: {
      moderationStatus?: ModerationStatus;
    } = {};

    if (statusFilter) {
      filter.moderationStatus = statusFilter;
    }

    // ---------------------------------
    // 4. Load reviews
    // ---------------------------------
    const reviews = await Review.find(filter)
      .populate({
        path: "customerId",
        select: "name email",
      })
      .populate({
        path: "artistId",
        select:
          "name category location profilePhoto",
      })
      .sort({
        moderationStatus: 1,
        createdAt: -1,
      })
      .lean();

    // Mongoose populate changes these fields
    // at runtime. This assertion only tells
    // TypeScript about the populated shape.
    const populatedReviews =
      reviews as unknown as AdminReview[];

    // ---------------------------------
    // 5. Response
    // ---------------------------------
    return NextResponse.json(
      {
        success: true,

        reviews: populatedReviews.map((item) => ({
          _id: String(item._id),
          bookingId: String(item.bookingId),

          customer: item.customerId
            ? {
                _id: String(
                  item.customerId._id
                ),
                name: item.customerId.name,
                email: item.customerId.email,
              }
            : null,

          artist: item.artistId
            ? {
                _id: String(
                  item.artistId._id
                ),
                name: item.artistId.name,
                category:
                  item.artistId.category,
                location:
                  item.artistId.location,
                profilePhoto:
                  item.artistId.profilePhoto,
              }
            : null,

          rating: item.rating,
          review: item.review,

          moderationStatus:
            item.moderationStatus,

          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin reviews fetch error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load reviews",
      },
      { status: 500 }
    );
  }
}