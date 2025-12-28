import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent recompilation issues in Next.js
export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
