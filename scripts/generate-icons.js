const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico').default;

const SOURCE = path.join(__dirname, '../public/icons/icon.svg');
const DEST = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating icons...');

  if (!fs.existsSync(DEST)) {
    fs.mkdirSync(DEST, { recursive: true });
  }

  // 1. Generate WebP (48x48)
  await sharp(SOURCE)
    .resize(48, 48)
    .webp()
    .toFile(path.join(DEST, 'icon-small.webp'));
  console.log('Generated icon-small.webp');

  // 2. Generate PNGs for ICO (72, 96, 128, 256)
  const sizes = [72, 96, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const buffer = await sharp(SOURCE)
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers.push(buffer);
  }

  // Combine into ICO
  const icoBuffer = await pngToIco(pngBuffers);
  fs.writeFileSync(path.join(DEST, 'icon-medium.ico'), icoBuffer);
  console.log('Generated icon-medium.ico');

  // 3. Generate High Res PNG/SVG (257x257) - converting to output as png for broad compatibility if needed, 
  // but user asked for svg. We'll copy source to new name for now or resize if they meant raster. 
  // The request said: { "src": "icon-high.svg", "sizes": "257x257" }
  // Since it's SVG, it's scalable, but we'll create a specific copy if strictly needed or just point to it.
  // However, usually we don't "resize" SVGs in this way for manifest unless it's just a file copy. 
  // Let's copy it to 'icon-high.svg' to match the request exactly.
  
  fs.copyFileSync(SOURCE, path.join(DEST, 'icon-high.svg'));
  console.log('Generated icon-high.svg');

  // Also generate standard PNGs for PWA manifest (192, 512) just in case
  await sharp(SOURCE).resize(192, 192).png().toFile(path.join(DEST, 'icon-192.png'));
  await sharp(SOURCE).resize(512, 512).png().toFile(path.join(DEST, 'icon-512.png'));
  console.log('Generated standard PWA PNGs');
}

generateIcons().catch(console.error);
