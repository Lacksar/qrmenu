import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";

export async function GET(req, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const menu = await Menu.findById(id).populate("category");

    if (!menu) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching menu item",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await req.json();

    const updatedMenu = await Menu.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedMenu) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedMenu });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error updating menu item",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const deletedMenu = await Menu.findByIdAndDelete(id);

    if (!deletedMenu) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting menu item",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
