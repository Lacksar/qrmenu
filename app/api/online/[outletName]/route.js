import dbConnect from "@/lib/dbConnect";
import Detail from "@/models/Detail";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { outletName } = await params;
  await dbConnect();
  try {
    const detail = await Detail.findOne({});
    const outlet = detail.outlets.find(
      (o) => o.name.toLowerCase() === outletName.toLowerCase()
    );
    if (!outlet) {
      return NextResponse.json({ success: false, error: "Outlet not found" });
    }
    return NextResponse.json({
      success: true,
      data: { online: outlet.online },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
