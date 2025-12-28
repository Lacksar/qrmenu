"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function CategoryImage({ section }) {
  const [imageSrc, setImageSrc] = useState("/logo.png"); // Start with a default
  const [errorIndex, setErrorIndex] = useState(0);

  const potentialImages = [
    section.image,
    ...section.menuItems.map((item) => item.image).filter(Boolean),
  ].filter(Boolean);

  useEffect(() => {
    if (potentialImages.length > 0) {
      setImageSrc(potentialImages[0]);
    } else {
      setImageSrc("/logo.png"); // Default if no images are found at all
    }
    setErrorIndex(0); // Reset error index when section changes
  }, [section]);

  const handleError = () => {
    const nextErrorIndex = errorIndex + 1;
    if (nextErrorIndex < potentialImages.length) {
      // Try the next available image
      setImageSrc(potentialImages[nextErrorIndex]);
      setErrorIndex(nextErrorIndex);
    } else {
      // Exhausted all options, use the final fallback
      setImageSrc("/logo.png");
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={`${section.name} category`}
      width={400}
      height={400}
      className="rounded-lg object-cover w-full aspect-square shadow-lg"
      onError={handleError}
      key={imageSrc} // Force re-render on src change to re-trigger onError
    />
  );
}
