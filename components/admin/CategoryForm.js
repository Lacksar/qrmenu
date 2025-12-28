"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import ImageUploadSlot from "./ImageUploadSlot";

export default function CategoryForm({ category, onSave }) {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null); // To hold the actual file for upload
  const [imagePreview, setImagePreview] = useState(""); // For displaying the selected image
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setName(category.name);
      setImagePreview(category.image || "");
    } else {
      // Reset form when modal opens for a new category
      setName("");
      setImageFile(null);
      setImagePreview("");
    }
  }, [category]);

  const handleImageUpload = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let imageUrl = category?.image || null; // Keep existing image if not changed

    try {
      // If a new image file is selected, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.message || "Image upload failed");
        }
        imageUrl = uploadData.publicPath;
      }

      const url = category
        ? `/api/categories/${category._id}`
        : "/api/categories";
      const method = category ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: imageUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save category");
      }

      toast.success(
        `Category ${category ? "updated" : "created"} successfully!`
      );
      onSave();
    } catch (err) {
      toast.error(err.message);
      setErrors({ form: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Toaster richColors />
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="grid w-full items-center gap-1.5">
          <Label>Category Image</Label>
          <div className="flex flex-wrap gap-4">
            <ImageUploadSlot
              imageUrl={imagePreview}
              isUploading={isUploading}
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
            />
          </div>
          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isUploading}>
            {isUploading
              ? "Saving..."
              : category
              ? "Update Category"
              : "Add Category"}
          </Button>
        </div>
      </form>
    </>
  );
}
