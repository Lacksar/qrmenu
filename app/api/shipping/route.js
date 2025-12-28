import dbConnect from "@/lib/dbConnect";
import Detail from "@/models/Detail";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const details = await Detail.findOne();
    if (!details) {
      return NextResponse.json(
        { success: false, error: "Details not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { deliveryCharge: details.deliveryCharge },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch shipping cost" },
      { status: 500 }
    );
  }
}
