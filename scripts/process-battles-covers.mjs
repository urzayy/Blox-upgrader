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
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__22_58_48-94d50d33-dfaf-4550-9ac4-b7b6b77db592.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__23_03_34-19abd1e6-e911-4500-b76e-7f112646ce90.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__23_03_43-14cf12c2-b4e2-4881-835b-e4ce707f2503.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__23_12_33-f57cae36-fd3e-4368-8ed7-2ab8c918aeb4.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__23_13_46-03da2bab-3f4c-4e7a-b455-e40ece4e4e90.png',
];

const OUTPUT_FILES = [
  'Battles1.png',
  'Battles2.png',
  'Battles3.png',
  'Battles4.png',
  'Battles5.png',
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
  console.log(`[battles-cover] ${OUTPUT_FILES[index]} -> ${meta.width}x${meta.height} hasAlpha=${meta.hasAlpha}`);
}
