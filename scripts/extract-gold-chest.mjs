import sharp from 'sharp';
import { copyFileSync } from 'fs';

const input = process.argv[2] || 'scripts/.cache/gold-source.png';
const publicOut = 'public/images/free-cases/gold-treasure.png';

if (process.argv[2]) copyFileSync(input, 'scripts/.cache/gold-source.png');

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const n = w * h;

const darkEnough = (idx) => {
  const r = data[idx * 4];
  const g = data[idx * 4 + 1];
  const b = data[idx * 4 + 2];
  const bright = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  return bright < 24 && max < 38;
};

const isBg = new Uint8Array(n);
const q = [];

for (const y of [0, h - 1]) {
  for (let x = 0; x < w; x++) {
    const idx = y * w + x;
    if (darkEnough(idx)) {
      isBg[idx] = 1;
      q.push(idx);
    }
  }
}

for (const x of [0, w - 1]) {
  for (let y = 0; y < h; y++) {
    const idx = y * w + x;
    if (!isBg[idx] && darkEnough(idx)) {
      isBg[idx] = 1;
      q.push(idx);
    }
  }
}

while (q.length) {
  const idx = q.pop();
  const x = idx % w;
  const y = Math.floor(idx / w);
  for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
    if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
    const ni = ny * w + nx;
    if (!isBg[ni] && darkEnough(ni)) {
      isBg[ni] = 1;
      q.push(ni);
    }
  }
}

for (let i = 0; i < n; i++) {
  if (isBg[i]) data[i * 4 + 3] = 0;
}

const trimmed = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .trim({ threshold: 10 })
  .png({ compressionLevel: 6 })
  .toBuffer();

await sharp(trimmed).toFile(publicOut);

const meta = await sharp(publicOut).metadata();
console.log('saved', meta.width, 'x', meta.height, meta.hasAlpha);
