import path from "path";
import sharp from "sharp";

// Input and output paths
const inputPath = path.join(process.cwd(), "public/herobg.webp");
const outputPath = path.join(process.cwd(), "public/herobg.webp");

// Convert hero image to high-quality WebP
sharp(inputPath)
  .webp({ quality: 95 }) // high quality for hero
  .toFile(outputPath)
  .then(() => console.log(`Converted hero image → herobg.webp (high quality)`))
  .catch((err) => console.error(err));
