import fs from "fs";
import path from "path";

// Folder containing images
const folderPath = path.join(process.cwd(), "public/images");
const files = fs.readdirSync(folderPath);

files.forEach((file) => {
  if (file.endsWith(".webp")) {
    const filePath = path.join(folderPath, file);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting ${file}:`, err);
      } else {
        console.log(`Deleted ${file}`);
      }
    });
  }
});
