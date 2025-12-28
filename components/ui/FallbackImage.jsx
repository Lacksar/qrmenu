import { useState } from "react";
import Image from "next/image";

const FallbackImage = ({ src, alt, width, height, className }) => {
  // Start with src if valid, otherwise fallback immediately
  const initialSrc = src && src.trim() !== "" ? src : "/logo.png";
  const [imgSrc, setImgSrc] = useState(initialSrc);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => {
        // Avoid infinite loop if fallback also fails
        if (imgSrc !== "/logo.png") setImgSrc("/logo.png");
      }}
    />
  );
};

export default FallbackImage;
