import { NextResponse } from "next/server";
import Menu from "@/models/Menu";
import Category from "@/models/Category";
import dbConnect from "@/lib/dbConnect";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

async function uploadToImgbb(imageBuffer) {
  if (!IMGBB_API_KEY) {
    throw new Error("IMGBB_API_KEY is not defined in environment variables.");
  }
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
    throw new Error("Failed to upload image to ImgBB.");
  }

  return result.data.display_url;
}

async function syncProducts() {
  try {
    const res = await fetch(`https://pancetta.paisasell.com/api/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        host: "pancetta.paisasell.com",
      },
      body: JSON.stringify({ businessName: "pancetta" }),
    });
    const result = await res.json();

    if (result.error) {
      console.error(result.error);
      return;
    }

    for (const one of result.data) {
      const existingProduct = await Menu.findById(one._id);
      let imageUrl = existingProduct?.image;

      const imageName = Array.isArray(one.image) ? one.image[0] : one.image;

      if (imageName && !imageUrl) {
        try {
          console.log(`Downloading product image: ${imageName}`);
          const response = await fetch(
            `https://pancetta.paisasell.com/product-images/${imageName}`
          );
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          imageUrl = await uploadToImgbb(buffer);
          console.log(`Uploaded product image to: ${imageUrl}`);
        } catch (uploadError) {
          console.error(`Failed to upload image ${imageName}:`, uploadError);
        }
      }

      let categoryId = null;
      if (one.category) {
        const categoryDoc = await Category.findOne({ name: one.category });
        if (categoryDoc) {
          categoryId = categoryDoc._id;
        } else {
          console.warn(
            `Category "${one.category}" not found for product "${one.productName}".`
          );
        }
      }

      const productData = {
        name: one.productName,
        description: one.description,
        price: one.price,
        image: imageUrl,
      };

      if (categoryId) {
        productData.category = categoryId;
      }

      await Menu.findOneAndUpdate(
        { _id: one._id },
        { $set: productData },
        { upsert: true, new: true }
      ).exec();
    }

    await Menu.updateMany(
      { _id: { $in: result.data.map((e) => e._id) } },
      { $set: { status: "active" } }
    );
    await Menu.updateMany(
      { _id: { $nin: result.data.map((e) => e._id) } },
      { $set: { status: "inactive" } }
    );
  } catch (e) {
    console.error("Error in syncProducts:", e);
  }
}

async function getExpWebData() {
  try {
    const res = await fetch(
      `https://pancetta.paisasell.com/api/v1/business/expWeb`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          host: "pancetta.paisasell.com",
        },
        body: JSON.stringify({ businessName: "pancetta" }),
      }
    );
    const result = await res.json();
    if (result.error) {
      console.error(result.error);
      return { error: true };
    }
    return result;
  } catch (e) {
    console.error(e);
  }
}

async function syncCategories() {
  try {
    const result = await getExpWebData();
    if (result.error) return;

    const currentCategoryExtended = result.data.details.categoriesExtended;

    for (const category of currentCategoryExtended) {
      const existingCategory = await Category.findOne({
        name: category.categoryName,
      });
      let imageUrl = existingCategory?.image;

      // If there's an image name from the API and we don't have an image URL yet
      if (category.categoryImage && !imageUrl) {
        try {
          console.log(`Downloading category image: ${category.categoryImage}`);
          const response = await fetch(
            `https://pancetta.paisasell.com/category-images/${category.categoryImage}`
          );
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          imageUrl = await uploadToImgbb(buffer);
          console.log(`Uploaded category image to: ${imageUrl}`);
        } catch (uploadError) {
          console.error(
            `Failed to upload image ${category.categoryImage}:`,
            uploadError
          );
        }
      }

      // Prepare the update data
      const updateData = {
        name: category.categoryName,
      };

      // Only set the image if we have a valid URL (either new or existing)
      if (imageUrl) {
        updateData.image = imageUrl;
      } else if (category.categoryImage && !imageUrl) {
        // This case is for when upload fails, we don't want to wipe a potentially existing image
      } else {
        updateData.image = null; // Handle cases where image is removed from source
      }

      await Category.findOneAndUpdate(
        { name: category.categoryName },
        { $set: updateData },
        { upsert: true }
      );
    }
  } catch (e) {
    console.error("Error in syncCategories:", e);
  }
}

export async function GET(request) {
  await dbConnect();
  // Sync categories first to ensure they exist for products
  await syncCategories();
  await syncProducts();

  return NextResponse.json({
    message: "Synchronization completed successfully.",
  });
}
