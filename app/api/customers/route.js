import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Customer from "@/models/Customer";
import dbConnect from "@/lib/dbConnect";

// GET - Fetch all customers
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    let customers;
    if (phone) {
      // Search by phone
      customers = await Customer.findOne({ phone });
      return NextResponse.json({ success: true, customer: customers });
    } else {
      // Get all customers
      customers = await Customer.find().sort({ dueAmount: -1, createdAt: -1 });
      return NextResponse.json({ success: true, customers });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST - Create or update customer
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, phone, dueAmount } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if customer exists (by phone if provided)
    let customer = null;

    if (phone) {
      customer = await Customer.findOne({ phone });
    }

    if (customer) {
      // Update existing customer
      customer.name = name;
      if (phone) customer.phone = phone;
      if (dueAmount !== undefined) {
        customer.dueAmount = dueAmount;
      }
      await customer.save();
    } else {
      // Create new customer
      customer = await Customer.create({
        name,
        phone: phone || null,
        dueAmount: dueAmount || 0,
      });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create/update customer" },
      { status: 500 }
    );
  }
}
