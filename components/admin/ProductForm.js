"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ImageUploadSlot from "./ImageUploadSlot";
import { Switch } from "@/components/ui/switch";

async function getCategories() {
  const res = await fetch("/api/categories", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch categories");
  }
  return data.data || [];
}

export default function ProductForm({ product, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    oldPrice: "",
    featured: false,
    available: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => toast.error(err.message));
  }, []);

  useEffect(() => {
    // Only populate the form for an existing product if both the product and categories are loaded
    if (product && categories.length > 0) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category?._id || "",
        price: product.price?.toString() || "",
        oldPrice: product.oldPrice?.toString() || "",
        featured: product.featured || false,
        available: product.available ?? true,
      });
      setImagePreview(product.image || "");
    } else if (!product) {
      // Reset form for a new product
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        oldPrice: "",
        featured: false,
        available: true,
      });
      setImageFile(null);
      setImagePreview("");
    }
  }, [product, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

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

    // Add validation for the category field
    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    let imageUrl = product?.image || null;

    try {
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("imageFile", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.message || "Image upload failed");
        }
        imageUrl = uploadData.publicPath;
      }

      const submissionData = { ...formData, image: imageUrl };
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      const savedProduct = await res.json();
      onSave(savedProduct.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            required
            value={formData.category}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oldPrice">Old Price (Optional)</Label>
          <Input
            id="oldPrice"
            name="oldPrice"
            type="number"
            value={formData.oldPrice}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Product Image</Label>
        <ImageUploadSlot
          imageUrl={imagePreview}
          isUploading={isSubmitting}
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            name="featured"
            checked={formData.featured}
            onCheckedChange={(c) => handleSwitchChange("featured", c)}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="available"
            name="available"
            checked={formData.available}
            onCheckedChange={(c) => handleSwitchChange("available", c)}
          />
          <Label htmlFor="available">Available</Label>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : product
            ? "Update Product"
            : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
