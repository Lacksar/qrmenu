import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const newMenu = await Menu.create(body);

    return NextResponse.json({ success: true, data: newMenu }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error creating menu item",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search");
    const category = searchParams.get("category");

    const filter = {};
    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }

    const menus = await Menu.find(filter).populate("category");
    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching menu items",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
