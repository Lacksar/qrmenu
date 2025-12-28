import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Table from "@/models/Table";

// GET all tables
export async function GET(req) {
  try {
    await dbConnect();
    const tables = await Table.find({}).sort({ tableNumber: 1 });

    return NextResponse.json({ tables }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tables", details: error.message },
      { status: 500 }
    );
  }
}

// POST create new table (Admin only)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tableNumber, capacity, location, status, notes } = await req.json();

    if (!tableNumber || !capacity || !location) {
      return NextResponse.json(
        { error: "Table number, capacity, and location are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 400 }
      );
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      location,
      status: status || "available",
      notes,
    });

    return NextResponse.json(
      { message: "Table created successfully", table },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create table", details: error.message },
      { status: 500 }
    );
  }
}
