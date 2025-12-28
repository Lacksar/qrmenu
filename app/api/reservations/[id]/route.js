import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Reservation from "@/models/Reservation";
import { sendEmail } from "@/lib/SendEmail";
import { NextResponse } from "next/server";

// ✅ Utility function for styled emails
function generateEmailTemplate({
  title,
  color,
  fullName,
  body,
  footer,
  reservationId,
}) {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px;">
      <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: ${color}; padding: 20px 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">${title}</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #333333;">
          <p style="font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
          ${body}

          ${
            reservationId
              ? `<p style="font-size: 15px; line-height: 1.6;">
                  Reservation ID:
                  <span style="display: inline-block; background-color: #f0f0f0; padding: 6px 10px; border-radius: 6px; font-family: monospace;">
                    ${reservationId}
                  </span>
                </p>`
              : ""
          }

          <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

          <!-- Contact Info -->
          <p style="font-size: 14px; color: #777;">
            📞 Need help? Contact us at 
            <a href="mailto:support@yourrestaurant.com" style="color: ${color}; text-decoration: none;">
              support@yourrestaurant.com
            </a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px 30px; text-align: center; color: #888; font-size: 13px;">
          ${
            footer ||
            `© ${new Date().getFullYear()} Your Restaurant Name. All rights reserved.`
          }
        </div>
      </div>
    </div>
  `;
}

// ✅ GET a reservation by ID
export async function GET(request, { params }) {
  await dbConnect();

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json(
      { message: "Invalid reservation ID." },
      { status: 400 }
    );
  }

  try {
    const reservation = await Reservation.findById(params.id);
    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ reservation }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch reservation.", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE (Cancel) a reservation
export async function DELETE(request, { params }) {
  await dbConnect();

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json(
      { message: "Invalid reservation ID." },
      { status: 400 }
    );
  }

  try {
    const cancelledReservation = await Reservation.findByIdAndUpdate(
      params.id,
      { status: "cancelled" },
      { new: true, runValidators: true }
    );

    if (!cancelledReservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    // ✉️ Send cancellation email
    const { email, fullName, date, time, _id } = cancelledReservation;
    const html = generateEmailTemplate({
      title: "Reservation Cancelled",
      color: "#ff4d4f",
      fullName,
      reservationId: _id,
      body: `
        <p style="font-size: 15px; line-height: 1.6;">
          Your reservation on <strong>${new Date(
            date
          ).toLocaleDateString()}</strong> at <strong>${time}</strong>
          has been <span style="color: #ff4d4f; font-weight: bold;">cancelled</span> as you requested.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">If you believe this is a mistake, please contact us immediately.</p>
      `,
    });

    await sendEmail({
      to: email,
      subject: "Your Reservation has been Cancelled",
      html,
    });

    return NextResponse.json(
      {
        message: "Reservation cancelled successfully!",
        reservation: cancelledReservation,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to cancel reservation.", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ UPDATE reservation status
export async function PUT(request, { params }) {
  await dbConnect();

  const { id } = await params;
  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid reservation ID." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;

    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReservation) {
      return NextResponse.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    const { email, fullName, date, time, noOfPeople, _id } = updatedReservation;

    // ✉️ Send appropriate email
    if (status === "confirmed") {
      const html = generateEmailTemplate({
        title: "Reservation Confirmed",
        color: "#4CAF50",
        fullName,
        reservationId: _id,
        body: `
          <p style="font-size: 15px; line-height: 1.6;">
            Your reservation for <strong>${noOfPeople}</strong> people on
            <strong>${new Date(
              date
            ).toLocaleDateString()}</strong> at <strong>${time}</strong>
            is now <span style="color: #4CAF50; font-weight: bold;">confirmed</span>.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">We look forward to seeing you!</p>
        `,
      });

      await sendEmail({
        to: email,
        subject: "Your Reservation is Confirmed!",
        html,
      });
    } else if (status === "disapproved") {
      const html = generateEmailTemplate({
        title: "Reservation Disapproved",
        color: "#f59e0b",
        fullName,
        reservationId: _id,
        body: `
          <p style="font-size: 15px; line-height: 1.6;">
            We're sorry, but your reservation on <strong>${new Date(
              date
            ).toLocaleDateString()}</strong>
            at <strong>${time}</strong> has been <span style="color: #f59e0b; font-weight: bold;">disapproved</span>.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">Please contact us for more information or to reschedule.</p>
        `,
      });

      await sendEmail({
        to: email,
        subject: "Your Reservation has been Disapproved",
        html,
      });
    }

    return NextResponse.json(
      {
        message: "Reservation status updated successfully!",
        reservation: updatedReservation,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update reservation status.", error: error.message },
      { status: 500 }
    );
  }
}
