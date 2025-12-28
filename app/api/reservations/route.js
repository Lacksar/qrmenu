import dbConnect from "@/lib/dbConnect";
import { sendEmail } from "@/lib/SendEmail";
import Reservation from "@/models/Reservation";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const reservation = await Reservation.create(body);
    const { email, fullName, date, time, _id, outlet } = reservation;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px;">
        <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header -->
          <div style="background-color: #4CAF50; padding: 20px 30px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">Reservation Made</h1>
          </div>

          <!-- Body -->
          <div style="padding: 30px; color: #333333;">
            <p style="font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              Your reservation at our <strong>${outlet}</strong> outlet has been successfully created for
              <strong>${new Date(
                date
              ).toLocaleDateString()}</strong> at <strong>${time}</strong>.
            </p>
            <p style="font-size: 15px; line-height: 1.6;">
              Your reservation ID is:
              <span style="display: inline-block; background-color: #f0f0f0; padding: 6px 10px; border-radius: 6px; font-family: monospace;">
                ${_id}
              </span>
            </p>
            <p style="font-size: 15px; line-height: 1.6;">
              Please keep this ID safe — you'll need it for or cancellations.
            </p>

            <!-- Divider -->
            <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

            <!-- Contact Info -->
            <p style="font-size: 14px; color: #777;">
              📞 Need help? Contact us at
              <a href="mailto:support@yourrestaurant.com" style="color: #4CAF50; text-decoration: none;">
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
    `;

    await sendEmail({
      to: email,
      subject: "Your Reservation is Made",
      html,
    });
    return NextResponse.json(
      {
        message: "Reservation created successfully!",
        reservation,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create reservation.",
        error,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  await dbConnect();
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    return NextResponse.json(
      {
        reservations,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch reservations.",
        error,
      },
      {
        status: 500,
      }
    );
  }
}
