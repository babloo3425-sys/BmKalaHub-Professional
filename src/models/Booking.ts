import mongoose, {
  Schema,
  models,
} from "mongoose";

const BookingSchema = new Schema(
  {
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      required: true,
      index: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    artistId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    service: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },

    quoteAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    quoteNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "quoted",
        "accepted",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Booking =
  models.Booking ||
  mongoose.model("Booking", BookingSchema);

export default Booking;