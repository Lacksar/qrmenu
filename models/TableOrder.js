import mongoose from "mongoose";

const TableOrderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, "Please provide a table number."],
      trim: true,
    },
    items: {
      type: [
        {
          menuId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative."],
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity cannot be less than 1."],
          },
          image: {
            type: String,
            default: null,
          },
          notes: {
            type: String,
            trim: true,
          },
        },
      ],
      validate: [(val) => val.length > 0, "Order must have at least one item."],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative."],
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "preparing",
          "ready",
          "served",
          "completed",
          "cancelled",
        ],
        message: "{VALUE} is not a valid status.",
      },
      default: "pending",
    },
    orderNumber: {
      type: Number,
      required: true,
    },
    customerNotes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      enum: ["customer", "waiter"],
      default: "customer",
    },
    waiterName: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TableOrder ||
  mongoose.model("TableOrder", TableOrderSchema);
