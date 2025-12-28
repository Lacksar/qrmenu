import dbConnect from "@/lib/dbConnect";
import Detail from "@/models/Detail";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
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
    outlet.online = true;
    await detail.save();
    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
