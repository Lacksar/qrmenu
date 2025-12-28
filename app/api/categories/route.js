import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { name, image } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const newCategory = await Category.create({ name, image });

    return NextResponse.json(
      { success: true, data: newCategory },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error creating category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    const categories = await Category.find({});
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching categories",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
