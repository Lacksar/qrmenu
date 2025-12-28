import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
  {
    outlet: {
      type: String,
      required: [true, "Please select an outlet."],
      enum: ["ENGADINE", "HURSTVILLE"],
    },
    fullName: {
      type: String,
      required: [true, "Please provide your full name."],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email address."],
      lowercase: true,
      trim: true,
    },
    noOfPeople: {
      type: Number,
      required: [true, "Please specify the number of people."],
      min: [1, "Number of people cannot be less than 1."],
    },
    date: {
      type: Date,
      required: [true, "Please select a date."],
    },
    time: {
      type: String,
      required: [true, "Please select a time."],
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "disapproved"],
        message: "{VALUE} is not a valid status.",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Reservation ||
  mongoose.model("Reservation", ReservationSchema);
