import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";
import { NextResponse } from "next/server";

export async function PUT(request) {
  await dbConnect();

  try {
    const { id, field } = await request.json();

    if (!id || !field) {
      return NextResponse.json(
        { success: false, error: "Menu item ID and field are required." },
        { status: 400 }
      );
    }

    if (field !== "featured" && field !== "available") {
      return NextResponse.json(
        { success: false, error: "Invalid field specified for update." },
        { status: 400 }
      );
    }

    const menuItem = await Menu.findById(id);

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: "Menu item not found." },
        { status: 404 }
      );
    }

    // Toggle the boolean field
    menuItem[field] = !menuItem[field];
    await menuItem.save();

    return NextResponse.json(
      { success: true, data: menuItem },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
