import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import DuePayment from "@/models/DuePayment";
import Customer from "@/models/Customer";
import dbConnect from "@/lib/dbConnect";

// GET - Fetch all due payments
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    let payments;
    if (customerId) {
      // Get payments for specific customer
      payments = await DuePayment.find({ customerId })
        .populate("customerId")
        .sort({ createdAt: -1 });
    } else {
      // Get all payments
      payments = await DuePayment.find()
        .populate("customerId")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch due payments" },
      { status: 500 }
    );
  }
}

// POST - Record a due payment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const {
      customerId,
      customerName,
      customerPhone,
      billId,
      billNumber,
      amount,
      paymentMethod,
      notes,
    } = body;

    if (!customerId || !customerName || !customerPhone || !amount) {
      return NextResponse.json(
        { error: "Customer details and amount are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await DuePayment.create({
      customerId,
      customerName,
      customerPhone,
      billId,
      billNumber,
      amount,
      paymentMethod: paymentMethod || "Cash",
      notes,
      receivedBy: session.user.email,
      receivedByName: session.user.name || session.user.email,
    });

    // Update customer's due amount
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.dueAmount = Math.max(0, customer.dueAmount - amount);
      await customer.save();
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
