"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FallbackImage from "../ui/FallbackImage";

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ImageUploadSlot({
  imageUrl,
  onUpload,
  onRemove,
  isUploading,
}) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file); // Pass the raw file object up to the parent
    }
  };

  const isLoading = isUploading;

  return (
    <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex justify-center items-center">
      {imageUrl ? (
        <>
          <FallbackImage
            src={imageUrl}
            alt="Product"
            width={128}
            height={128}
            className="w-full h-full object-cover rounded-md"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </>
      ) : (
        <div className="text-center">
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <UploadIcon />
              <span className="mt-2 text-sm text-gray-600">
                {isLoading ? "Uploading..." : "Upload"}
              </span>
            </div>
            <Input
              id="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isLoading}
              accept="image/*"
            />
          </Label>
        </div>
      )}
    </div>
  );
}
