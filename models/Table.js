import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, "Please provide a table number."],
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Please provide table capacity."],
      min: [1, "Capacity must be at least 1."],
    },
    location: {
      type: String,
      enum: {
        values: ["indoor", "outdoor", "patio", "bar"],
        message: "{VALUE} is not a valid location.",
      },
      required: [true, "Please specify the table location."],
    },
    status: {
      type: String,
      enum: {
        values: ["available", "occupied", "reserved", "maintenance"],
        message: "{VALUE} is not a valid status.",
      },
      default: "available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Table || mongoose.model("Table", TableSchema);
