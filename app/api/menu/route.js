import dbConnect from "@/lib/dbConnect";
import Menu from "@/models/Menu";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const categories = await Category.find({});
    const menuItems = await Menu.find({}).populate("category");

    const menuByCategory = categories.map((category) => {
      const items = menuItems
        .filter(
          (item) =>
            item.category &&
            item.category._id.toString() === category._id.toString()
        )
        .map((item) => ({
          _id: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          featured: item.featured,
          available: item.available,
        }));

      return {
        _id: category._id,
        name: category.name,
        image: category.image,
        menuItems: items,
      };
    });

    return NextResponse.json({ success: true, data: menuByCategory });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu data" },
      { status: 500 }
    );
  }
}
