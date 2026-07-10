import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(root, '.cache', 'iron-case');
const publicOut = path.join(root, '..', 'public', 'images', 'free-cases', 'iron-chest.png');
const caseBase = path.join(cacheDir, 'iron-case-base.png');
const orchidsSrc = path.join(cacheDir, 'm4a1s-orchids.png');

function floodRemoveBlack(data, width, height) {
  const n = width * height;
  const isBg = new Uint8Array(n);
  const q = [];
  const dark = (idx) => {
    const r = data[idx * 4];
    const g = data[idx * 4 + 1];
    const b = data[idx * 4 + 2];
    return (r + g + b) / 3 < 85 || Math.max(r, g, b) < 98;
  };

  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const idx = y * width + x;
      if (dark(idx)) {
        isBg[idx] = 1;
        q.push(idx);
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      const idx = y * width + x;
      if (!isBg[idx] && dark(idx)) {
        isBg[idx] = 1;
        q.push(idx);
      }
    }
  }
  while (q.length) {
    const idx = q.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    if (x > 0) {
      const ni = idx - 1;
      if (!isBg[ni] && dark(ni)) {
        isBg[ni] = 1;
        q.push(ni);
      }
    }
    if (x < width - 1) {
      const ni = idx + 1;
      if (!isBg[ni] && dark(ni)) {
        isBg[ni] = 1;
        q.push(ni);
      }
    }
    if (y > 0) {
      const ni = idx - width;
      if (!isBg[ni] && dark(ni)) {
        isBg[ni] = 1;
        q.push(ni);
      }
    }
    if (y < height - 1) {
      const ni = idx + width;
      if (!isBg[ni] && dark(ni)) {
        isBg[ni] = 1;
        q.push(ni);
      }
    }
  }
  for (let i = 0; i < n; i++) {
    if (isBg[i]) data[i * 4 + 3] = 0;
  }
}

const orchRaw = await sharp(orchidsSrc)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

floodRemoveBlack(orchRaw.data, orchRaw.info.width, orchRaw.info.height);

const orchids = await sharp(orchRaw.data, {
  raw: { width: orchRaw.info.width, height: orchRaw.info.height, channels: 4 },
})
  .trim({ threshold: 1 })
  .resize({ width: 560 })
  .rotate(-27, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const patchSvg = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="620" height="190"><ellipse cx="310" cy="95" rx="300" ry="88" fill="#000000"/></svg>',
);

const patch = await sharp(patchSvg).png().toBuffer();

await sharp(caseBase)
  .resize(700, 700)
  .composite([
    { input: patch, top: 210, left: 45 },
    { input: orchids, top: 128, left: 8 },
    {
      input: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><ellipse cx="60" cy="40" rx="56" ry="36" fill="#000000"/></svg>',
      ),
      top: 118,
      left: 18,
    },
  ])
  .png()
  .toFile(publicOut);

const meta = await sharp(publicOut).metadata();
console.log('iron-chest.png', meta.width, meta.height);
