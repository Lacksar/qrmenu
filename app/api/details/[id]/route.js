import dbConnect from "@/lib/dbConnect";
import Detail from "@/models/Detail";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const detail = await Detail.findById(params.id);
    if (!detail) {
      return NextResponse.json({ success: false, error: "Detail not found" });
    }
    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const body = await req.json();
    const detail = await Detail.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!detail) {
      return NextResponse.json({ success: false, error: "Detail not found" });
    }
    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
