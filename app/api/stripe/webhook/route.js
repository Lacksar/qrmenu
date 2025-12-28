// Example: webhook handler
import Stripe from "stripe";
import Order from "@/models/Order";
import dbConnect from "@/lib/dbConnect";
import { sendEmail } from "@/lib/SendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

await dbConnect();

export const POST = async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    // Find the order
    const order = await Order.findById(orderId);

    // Check if the order exists and if it's already paid
    if (order && order.paymentStatus !== "paid") {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: "paid",
          status: "confirmed",
          paid: true,
          paymentIntentId: paymentIntent.id,
        },
        { new: true }
      );

      if (updatedOrder) {
        // Send payment success email
        await sendEmail({
          to: updatedOrder.email,
          subject: "Payment Successful - Order Confirmed!",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f5a623;">Payment Successful!</h2>
            <p>Dear ${updatedOrder.firstName} ${updatedOrder.lastName},</p>
            <p>Great news! Your payment has been processed successfully and your order is now confirmed.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
              <p><strong>Order ID:</strong> ${updatedOrder._id}</p>
              <p><strong>Delivery Code:</strong> <span style="font-size: 18px; color: #f5a623; font-weight: bold;">${
                updatedOrder.deliveryCode
              }</span></p>
              <p><strong>Total Amount:</strong> $${updatedOrder.totalAmount.toFixed(
                2
              )}</p>
              <p><strong>Payment Method:</strong> Online Payment</p>
              <p><strong>Order Type:</strong> ${
                updatedOrder.orderType === "pickup" ? "Pickup" : "Home Delivery"
              }</p>
              <p><strong>Outlet:</strong> ${updatedOrder.outlet}</p>
            </div>

            <h3 style="color: #333;">Order Items:</h3>
            <ul style="list-style: none; padding: 0;">
              ${updatedOrder.menu
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
              updatedOrder.orderType === "pickup"
                ? `
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2d5a2d; margin-top: 0;">Pickup Information:</h3>
                <p><strong>Date:</strong> ${new Date(
                  updatedOrder.pickupDate
                ).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${updatedOrder.pickupTime}</p>
                <p><strong>Location:</strong> ${updatedOrder.outlet}</p>
              </div>
            `
                : `
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2d5a2d; margin-top: 0;">Delivery Information:</h3>
                <p><strong>Address:</strong> ${updatedOrder.street}, ${updatedOrder.suburb}, ${updatedOrder.state} ${updatedOrder.postcode}</p>
              </div>
            `
            }

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Please keep this email for your records. If you have any questions, please contact us.
            </p>
            
            <p style="color: #f5a623; font-weight: bold;">Thank you for your order!</p>
          </div>
        `,
        });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;

    await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
      paymentStatus: "failed",
      status: "cancelled", // or "failed" depending on your system
      paid: false,
      paymentIntentId: paymentIntent.id,
    });
  }

  return new Response("Success", { status: 200 });
};
