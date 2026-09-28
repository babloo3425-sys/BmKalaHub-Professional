import mongoose, { Schema, models } from "mongoose";

const ProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    contactDetails: {
      type: String,
      default: "",
      trim: true,
    },

    portfolio: {
      type: [String],
      default: [],
    },

    resume: {
      type: String,
      default: "",
      trim: true,
    },

    video: {
      type: String,
      default: "",
      trim: true,
    },

    audio: {
      type: String,
      default: "",
      trim: true,
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    blocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    deactivated: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Profile =
  models.Profile || mongoose.model("Profile", ProfileSchema);

export default Profile;