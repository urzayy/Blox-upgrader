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
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_12_jul_2026__00_21_40-f51cb579-7887-4228-853f-a95ced7d3210.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_12_jul_2026__00_25_20-9a3ef286-7237-4ea9-8fe0-2fbb86d7850f.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_12_jul_2026__00_27_22-6dcf7eeb-573a-40fe-8ac3-411dd8da7107.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_12_jul_2026__00_29_28-6f447c2d-c56f-4616-a452-80fa93b9820f.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_12_jul_2026__00_31_55-972a91e5-f684-4a5f-915d-bb3cf1ee89b0.png',
  'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_12_jul_2026__00_34_05-a5fe6c43-50d2-4a39-a16e-47018ae5c50e.png',
];

const OUTPUT_FILES = [
  'Mixed1.png',
  'Mixed2.png',
  'Mixed3.png',
  'Mixed4.png',
  'Mixed5.png',
  'Mixed6.png',
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
  console.log(`[mixed-cover] ${OUTPUT_FILES[index]} -> ${meta.width}x${meta.height} hasAlpha=${meta.hasAlpha}`);
}
