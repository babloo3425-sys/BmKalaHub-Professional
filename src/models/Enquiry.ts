import mongoose, {
  Schema,
  models,
} from "mongoose";

const EnquirySchema = new Schema(
  {
    artistId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    eventType: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: [
        "new",
        "read",
        "replied",
        "closed",
      ],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Enquiry =
  models.Enquiry ||
  mongoose.model("Enquiry", EnquirySchema);

export default Enquiry;