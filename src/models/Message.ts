import mongoose, {
  Schema,
  models,
} from "mongoose";

const MessageSchema = new Schema(
  {
    enquiryId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      required: true,
      index: true,
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
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

const Message =
  models.Message ||
  mongoose.model("Message", MessageSchema);

export default Message;