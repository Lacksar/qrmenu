import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Reservation from "@/models/Reservation";
import { sendEmail } from "@/lib/SendEmail";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const { reservationId } = await request.json();

    // ✅ Check if ID is provided
    if (!reservationId) {
      return NextResponse.json(
        { success: true, error: "Reservation ID is required." },
        { status: 200 }
      );
    }

    // ✅ Validate MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      return NextResponse.json(
        { success: true, error: "Invalid reservation ID format." },
        { status: 200 }
      );
    }

    const reservation = await Reservation.findById(reservationId);

    // ✅ Check if reservation exists
    if (!reservation) {
      return NextResponse.json(
        { success: true, error: "Reservation not found." },
        { status: 200 }
      );
    }

    // ✅ Cancel the reservation
    reservation.status = "cancelled";
    await reservation.save();

    // ✅ Send cancellation email
    const { email, fullName, date, time } = reservation;
    await sendEmail({
      to: email,
      subject: "Your Reservation has been Cancelled",
      html: `
       <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px;">
  <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background-color: #ff4d4f; padding: 20px 30px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px;">Reservation Cancelled</h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px; color: #333333;">
      <p style="font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
      <p style="font-size: 15px; line-height: 1.6;">
        Your reservation on <strong>${new Date(
          date
        ).toLocaleDateString()}</strong> at <strong>${time}</strong> 
        has been <span style="color: #ff4d4f; font-weight: bold;">cancelled</span> as per your request.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        If you believe this was a mistake, please contact us immediately.
      </p>

      <!-- Divider -->
      <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

      <!-- Contact Info -->
      <p style="font-size: 14px; color: #777;">
        📞 Need help? Contact us at 
        <a href="mailto:support@yourrestaurant.com" style="color: #ff4d4f; text-decoration: none;">
          support@yourrestaurant.com
        </a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f1f1; padding: 15px 30px; text-align: center; color: #888; font-size: 13px;">
      © ${new Date().getFullYear()} Your Restaurant Name. All rights reserved.
    </div>
  </div>
</div>

      `,
    });

    return NextResponse.json(
      { success: true, data: reservation },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while cancelling the reservation.",
      },
      { status: 500 }
    );
  }
}
