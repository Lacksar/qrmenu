import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/SendEmail";

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();
    delete body.deliveryCode; // Prevent deliveryCode from being updated

    // Get the original order to check for status changes
    const originalOrder = await Order.findById(id);
    if (!originalOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = await Order.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    // Send cancellation email if order status changed to cancelled
    if (
      body.status &&
      body.status.toLowerCase() === "cancelled" &&
      originalOrder.status.toLowerCase() !== "cancelled"
    ) {
      await sendEmail({
        to: order.email,
        subject: "Order Cancelled",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Order Cancelled</h2>
            <p>Dear ${order.firstName} ${order.lastName},</p>
            <p>We regret to inform you that your order has been cancelled.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Cancelled Order Details:</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Delivery Code:</strong> ${order.deliveryCode}</p>
              <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(
                2
              )}</p>
              <p><strong>Payment Method:</strong> ${
                order.paymentMethod === "online"
                  ? "Online Payment"
                  : "Payment on Pickup"
              }</p>
              <p><strong>Order Type:</strong> ${
                order.orderType === "pickup" ? "Pickup" : "Home Delivery"
              }</p>
              <p><strong>Outlet:</strong> ${order.outlet}</p>
            </div>

            <h3 style="color: #333;">Order Items:</h3>
            <ul style="list-style: none; padding: 0;">
              ${order.menu
                .map(
                  (item) => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <strong>${item.name}</strong> x ${item.quantity} - $${(
                    item.price * item.quantity
                  ).toFixed(2)}
                </li>
              `
                )
                .join("")}
            </ul>

            ${
              order.paymentMethod === "online" && order.paymentStatus === "paid"
                ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">Refund Information:</h3>
                <p>Since you paid online, your refund will be processed within 5-7 business days to your original payment method.</p>
              </div>
            `
                : ""
            }

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions about this cancellation, please contact us. We apologize for any inconvenience caused.
            </p>
            
            <p style="color: #666;">Thank you for your understanding.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    const deletedOrder = await Order.deleteOne({ _id: params.id });
    if (deletedOrder.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
