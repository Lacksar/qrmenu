import dbConnect from "@/lib/dbConnect";
import Detail from "@/models/Detail";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();
  try {
    const detail = await Detail.findOne({});
    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const count = await Detail.countDocuments();
    if (count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Detail already exists. Only one is allowed.",
        },
        { status: 400 }
      );
    }
    const body = await req.json();
    const detail = await Detail.create(body);
    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
