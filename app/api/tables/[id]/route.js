import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import Table from "@/models/Table";

// GET single table
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const table = await Table.findById(params.id);

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ table }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch table", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update table
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Allow admin and waiter to update tables
    if (!session || (!session.user.isAdmin && session.user.role !== "waiter")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData = await req.json();

    await dbConnect();

    // If updating table number, check for duplicates
    if (updateData.tableNumber) {
      const existingTable = await Table.findOne({
        tableNumber: updateData.tableNumber,
        _id: { $ne: params.id },
      });
      if (existingTable) {
        return NextResponse.json(
          { error: "Table number already exists" },
          { status: 400 }
        );
      }
    }

    const table = await Table.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Table updated successfully", table },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update table", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE table (Admin only)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const table = await Table.findByIdAndDelete(params.id);

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Table deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete table", details: error.message },
      { status: 500 }
    );
  }
}
