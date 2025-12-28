import { NextResponse } from "next/server";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("imageFile");

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "No image file uploaded." },
        { status: 400 }
      );
    }

    // Convert file to buffer then to base64
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = imageBuffer.toString("base64");

    const body = new URLSearchParams();
    body.append("key", IMGBB_API_KEY);
    body.append("image", base64Image);

    const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const result = await imgbbRes.json();

    if (!result.success) {
      console.error("ImgBB API Error:", result);
      return NextResponse.json(
        { success: false, message: "Failed to upload image to ImgBB." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully!",
        publicPath: result.data.display_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error during image upload.",
      },
      { status: 500 }
    );
  }
}
