const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const sizes = {
    favicon: [16, 32, 48],
    apple: [180],
    android: [192, 512]
  };

  const svgBuffer = await fs.readFile(path.join(__dirname, '../public/icon.svg'));

  // 生成 favicon.ico
  const faviconBuffers = await Promise.all(
    sizes.favicon.map(size => 
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );
  
  await sharp(faviconBuffers[0])
    .toFile(path.join(__dirname, '../public/favicon.ico'));

  // 生成 apple-icon.png
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-icon.png'));

  // 生成其他尺寸的图标
  for (const size of sizes.android) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/icon-${size}.png`));
  }
}

generateIcons().catch(console.error); 