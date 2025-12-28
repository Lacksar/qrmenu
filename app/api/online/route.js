import dbConnect from "@/lib/dbConnect";
import Detail from "@/models/Detail";
import { NextResponse } from "next/server";

export async function GET(req) {
  await dbConnect();
  try {
    const detail = await Detail.findOne({});
    const outlets = detail.outlets;
    return NextResponse.json({ success: true, data: { outlets: outlets } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
