import mongoose from "mongoose";

const DetailSchema = new mongoose.Schema(
  {
    logo: {
      type: String, // URL or path to logo image
      required: false,
    },

    outlets: [
      {
        name: {
          type: String,
          required: true,
        },
        online: {
          type: Boolean,
          default: true,
        },
      },
    ],
    companyName: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    currency: {
      type: String,
      required: true,
      default: "NPR", // Example: Nepalese Rupee
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    singleton: { type: String, unique: true, default: "DETAILS" },
  },
  { timestamps: true }
);

export default mongoose.models.Detail || mongoose.model("Detail", DetailSchema);
