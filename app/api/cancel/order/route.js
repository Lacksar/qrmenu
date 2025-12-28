import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    await dbConnect();
    const { orderId, deliveryCode } = await req.json();

    if (!orderId || deliveryCode === undefined || deliveryCode === null) {
      return NextResponse.json(
        { error: "Missing orderId or delivery code" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify delivery code matches
    if (order.deliveryCode !== Number(deliveryCode)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow cancellation if payment is pending or has already failed
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Cannot cancel an order that has been paid" },
        { status: 403 }
      );
    }

    // Cancel the order
    order.paymentStatus = "failed";
    order.status = "cancelled";
    order.paid = false;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
