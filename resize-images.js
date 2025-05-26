const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputDir = "src/assets";
const maxSize = 2000;

function isJpeg(filePath) {
  return /\.(jpe?g)$/i.test(filePath);
}

async function resizeImage(filePath) {
  const image = sharp(filePath);
  const metadata = await image.metadata();

  const isLandscape = metadata.width >= metadata.height;
  const width = isLandscape ? maxSize : null;
  const height = isLandscape ? null : maxSize;

  // skip if already within size limits
  if ((isLandscape && width <= maxSize) || (!isLandscape && height <= maxSize)) {
    console.log(`⏩ Skipping (already resized): ${filePath}`);
    return;
  }


  const outputBuffer = await image
    .resize({ width, height, fit: "inside", withoutEnlargement: true })
    .toBuffer();

  await fs.promises.writeFile(filePath, outputBuffer);
  console.log(`✅ Resized: ${filePath}`);
}

async function processDirectory(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && isJpeg(fullPath)) {
      try {
        await resizeImage(fullPath);
      } catch (err) {
        console.error(`❌ Error processing ${fullPath}:`, err.message);
      }
    }
  }
}

processDirectory(inputDir)
  .then(() => console.log("🎉 All images processed"))
  .catch(err => console.error("Something went wrong:", err));
