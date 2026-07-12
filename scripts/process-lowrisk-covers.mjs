import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');
const assetsDir = path.resolve(
  process.env.USERPROFILE ?? process.env.HOME ?? '',
  '.cursor',
  'projects',
  'c-Users-hugou-cs2-skin-upgrade',
  'assets',
);

const SOURCE_FILES = [
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__21_49_43-8b159351-cc31-4b4d-85bb-24339d1d61d0.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__21_51_00-874e40a6-34f7-4c82-8991-46ab69ecf6a2.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__21_52_46-915f6f10-8cb4-4d92-a6a0-05aa7e1aa935.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__21_53_42-37638ab8-b30c-449a-8088-4702118ed464.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__21_54_35-e3aad066-bc33-4e61-bab1-fd59762e2106.png',
];

const OUTPUT_FILES = [
  'LowRisk1.png',
  'LowRisk2.png',
  'LowRisk3.png',
  'LowRisk4.png',
  'LowRisk5.png',
];

const BLACK_THRESHOLD = 58;
const FEATHER_RANGE = 42;

function removeSolidBackground(data, channels) {
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);

    if (max <= BLACK_THRESHOLD) {
      data[i + 3] = 0;
      continue;
    }

    if (max <= BLACK_THRESHOLD + FEATHER_RANGE) {
      const fade = (max - BLACK_THRESHOLD) / FEATHER_RANGE;
      data[i + 3] = Math.min(data[i + 3], Math.round(255 * fade));
    }
  }
}

for (let index = 0; index < OUTPUT_FILES.length; index += 1) {
  const sourcePath = path.join(assetsDir, SOURCE_FILES[index]);
  const outputPath = path.join(publicDir, OUTPUT_FILES[index]);

  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  removeSolidBackground(data, info.channels);

  const trimmed = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();

  await sharp(trimmed)
    .extend({
      top: 12,
      bottom: 12,
      left: 12,
      right: 12,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  console.log(`[lowrisk-cover] ${OUTPUT_FILES[index]} -> ${meta.width}x${meta.height} hasAlpha=${meta.hasAlpha}`);
}
