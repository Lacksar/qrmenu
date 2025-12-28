import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide the first name."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide the last name."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide the email address."],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide the phone number."],
      trim: true,
    },
    street: {
      type: String,
      required: function () {
        return this.orderType === "homedelivery";
      },
      trim: true,
    },
    suburb: {
      type: String,
      required: function () {
        return this.orderType === "homedelivery";
      },
      trim: true,
    },
    postcode: {
      type: String,
      required: function () {
        return this.orderType === "homedelivery";
      },
      trim: true,
    },
    state: {
      type: String,
      required: [true, "Please provide the state."],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Please provide the country."],
      trim: true,
    },
    outlet: {
      type: String,
      required: [true, "Please provide the outlet."],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    menu: {
      type: [
        {
          // snapshot menu details
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
        },
      ],
      validate: [
        (val) => val.length > 0,
        "Order must have at least one menu item.",
      ],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative."],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "delivered", "cancelled"],
        message: "{VALUE} is not a valid status.",
      },
      default: "pending",
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    deliveryCode: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderType: {
      type: String,
      enum: {
        values: ["homedelivery", "pickup"],
        message: "{VALUE} is not a valid order type.",
      },
      required: [true, "Please specify the order type."],
    },
    pickupDate: {
      type: Date,
      required: function () {
        return this.orderType === "pickup";
      },
    },
    pickupTime: {
      type: String,
      required: function () {
        return this.orderType === "pickup";
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
