import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TableOrder from "@/models/TableOrder";

// GET all table orders
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get("tableNumber");
    const status = searchParams.get("status");

    let query = {};
    if (tableNumber) {
      query.tableNumber = tableNumber;
    }
    if (status) {
      query.status = status;
    }

    const orders = await TableOrder.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}

// POST create new table order
export async function POST(req) {
  try {
    const {
      tableNumber,
      items,
      totalAmount,
      customerNotes,
      createdBy,
      waiterName,
      customerName,
    } = await req.json();

    if (!tableNumber || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Table number and items are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate order number
    const lastOrder = await TableOrder.findOne().sort({ orderNumber: -1 });
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1000;

    const order = await TableOrder.create({
      tableNumber,
      items,
      totalAmount,
      orderNumber,
      customerNotes,
      status: "pending",
      createdBy: createdBy || "customer",
      waiterName: waiterName || null,
      customerName: customerName || null,
    });

    return NextResponse.json(
      { message: "Order placed successfully", order },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
