import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const input = join(root, 'public', 'coin-source.jpg');
const output = join(root, 'public', 'coin.png');

function alphaForBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;

  // Near-white / light checkerboard pixels become transparent.
  if (max >= 235 && spread <= 18) return 0;
  if (max >= 210 && spread <= 12) return Math.round(((235 - max) / 25) * 255);

  return 255;
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  data[i + 3] = alphaForBackground(data[i], data[i + 1], data[i + 2]);
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(output);

console.log(`Saved ${output} (${info.width}x${info.height})`);
