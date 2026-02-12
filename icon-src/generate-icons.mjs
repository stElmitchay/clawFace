import sharp from 'sharp';
import { readFileSync, mkdirSync, cpSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const svgBuffer = readFileSync('icon-src/icon.svg');
const outDir = 'src-tauri/icons';

const sizes = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 1024 },
  // Windows Store logos
  { name: 'Square30x30Logo.png', size: 30 },
  { name: 'Square44x44Logo.png', size: 44 },
  { name: 'Square71x71Logo.png', size: 71 },
  { name: 'Square89x89Logo.png', size: 89 },
  { name: 'Square107x107Logo.png', size: 107 },
  { name: 'Square142x142Logo.png', size: 142 },
  { name: 'Square150x150Logo.png', size: 150 },
  { name: 'Square284x284Logo.png', size: 284 },
  { name: 'Square310x310Logo.png', size: 310 },
  { name: 'StoreLogo.png', size: 50 },
];

// Generate PNGs
for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(outDir, name));
  console.log(`Generated ${name} (${size}x${size})`);
}

// Generate .icns using iconutil (macOS)
const iconsetDir = '/tmp/OpenClaw.iconset';
mkdirSync(iconsetDir, { recursive: true });

const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
for (const size of icnsSizes) {
  await sharp(svgBuffer).resize(size, size).png().toFile(join(iconsetDir, `icon_${size}x${size}.png`));
  if (size <= 512) {
    await sharp(svgBuffer).resize(size * 2, size * 2).png().toFile(join(iconsetDir, `icon_${size}x${size}@2x.png`));
  }
}

execSync(`iconutil -c icns -o ${join(outDir, 'icon.icns')} ${iconsetDir}`);
console.log('Generated icon.icns');

// Generate .ico (use the 256px PNG — browsers/Windows handle it)
// sharp can output ico-compatible png, but for a proper .ico we'll use the 256px
await sharp(svgBuffer)
  .resize(256, 256)
  .png()
  .toFile(join(outDir, 'icon.ico'));
console.log('Generated icon.ico (256px PNG)');

console.log('Done!');
