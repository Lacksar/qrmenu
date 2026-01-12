import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true, // Allows multiple null values
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index that allows unique phone numbers but multiple null phones
CustomerSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default mongoose.models.Customer ||
  mongoose.model("Customer", CustomerSchema);
