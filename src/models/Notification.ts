import mongoose, {
  Schema,
  models,
} from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "enquiry",
        "message",
        "booking",
        "review",
        "system",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      default: null,
      index: true,
    },

    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification =
  models.Notification ||
  mongoose.model(
    "Notification",
    NotificationSchema
  );

export default Notification;