import mongoose from "mongoose";

const DuePaymentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    billNumber: {
      type: Number,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Other"],
      default: "Cash",
    },
    notes: {
      type: String,
      trim: true,
    },
    receivedBy: {
      type: String,
    },
    receivedByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DuePayment ||
  mongoose.model("DuePayment", DuePaymentSchema);
