import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');

const FILES = [
  'Caja1.png',
  'Caja2.png',
  'Caja3.png',
  'Caja4.png',
  'Caja5.png',
  'HighRisk1.png',
  'HighRisk2.png',
  'HighRisk3.png',
  'HighRisk4.png',
  'HighRisk5.png',
  'LowRisk1.png',
  'LowRisk2.png',
  'LowRisk3.png',
  'LowRisk4.png',
  'LowRisk5.png',
  'Battles1.png',
  'Battles2.png',
  'Battles3.png',
  'Battles4.png',
  'Battles5.png',
];

const BLACK_THRESHOLD = 28;
const WHITE_THRESHOLD = 28;
const FEATHER_RANGE = 24;

const FILE_MODES = {
  'HighRisk2.png': 'both',
};

function removeSolidBackground(data, channels, mode = 'black') {
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (mode === 'black' || mode === 'both') {
      if (max <= BLACK_THRESHOLD) {
        data[i + 3] = 0;
        continue;
      }

      if (max <= BLACK_THRESHOLD + FEATHER_RANGE) {
        const fade = (max - BLACK_THRESHOLD) / FEATHER_RANGE;
        data[i + 3] = Math.min(data[i + 3], Math.round(255 * fade));
      }
    }

    if (mode === 'white' || mode === 'both') {
      if (min >= 255 - WHITE_THRESHOLD) {
        data[i + 3] = 0;
        continue;
      }

      if (min >= 255 - WHITE_THRESHOLD - FEATHER_RANGE) {
        const fade = (255 - WHITE_THRESHOLD - min) / FEATHER_RANGE;
        data[i + 3] = Math.min(data[i + 3], Math.round(255 * fade));
      }
    }
  }
}

for (const file of FILES) {
  const filePath = path.join(publicDir, file);
  const mode = FILE_MODES[file] ?? 'black';
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  removeSolidBackground(data, info.channels, mode);

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(`${filePath}.tmp`);

  const fs = await import('node:fs/promises');
  await fs.rename(`${filePath}.tmp`, filePath);

  const meta = await sharp(filePath).metadata();
  console.log(`[remove-bg] ${file} -> hasAlpha=${meta.hasAlpha}`);
}
