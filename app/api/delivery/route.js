import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function POST(request) {
  await dbConnect();

  try {
    const { orderId, deliveryCode } = await request.json();

    if (!orderId || !deliveryCode) {
      return NextResponse.json(
        { success: false, error: "Order ID and delivery code are required." },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.deliveryCode !== deliveryCode) {
      return NextResponse.json(
        { success: false, error: "Invalid delivery code." },
        { status: 400 }
      );
    }

    order.status = "delivered";
    await order.save();

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
