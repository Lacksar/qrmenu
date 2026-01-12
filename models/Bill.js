import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    items: [
      {
        menuId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: String,
      },
    ],
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: {
        type: String,
        enum: ["Percentage", "Fixed"],
        default: "Percentage",
      },
      value: {
        type: Number,
        default: 0,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    unpaid: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Other"],
      default: "Cash",
    },
    createdBy: {
      type: String,
    },
    createdByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
