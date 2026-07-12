import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.resolve(
  projectRoot,
  '..',
  '.cursor',
  'projects',
  'c-Users-hugou-cs2-skin-upgrade',
  'assets',
);
const outputDir = path.join(projectRoot, 'public', 'images', 'cases');

const CASE_COVERS = [
  {
    slug: 'edge-protocol',
    source:
      'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__05_54_41-563f4b95-f2fc-45e1-8f36-6becaab6ae1c.png',
  },
  {
    slug: 'striker-knife',
    source:
      'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__05_57_43-32da0f57-6a3d-42d1-80a2-0b0d341d2ff1.png',
  },
  {
    slug: 'sport-palm',
    source:
      'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__05_59_09-3de8830b-4ac5-4eac-b47d-19183ad00d7d.png',
  },
  {
    slug: 'blade-roulette',
    source:
      'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_11_jul_2026__06_00_22-e8624d7b-034c-4204-ae4a-fd076e906de5.png',
  },
  {
    slug: 'operator-wrap',
    source:
      'c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_11_jul_2026__06_01_38-e229d10e-dfb0-4bb9-a1a0-7041ccaa1f62.png',
  },
];

const BLACK_THRESHOLD = 28;
const FEATHER_RANGE = 24;

function removeBlackBackground(data, channels) {
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
      data[i + 3] = Math.round(255 * fade);
    }
  }
}

async function processCover({ slug, source }) {
  const inputPath = path.join(assetsDir, source);
  const outputPath = path.join(outputDir, `${slug}.png`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  removeBlackBackground(data, info.channels);

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return outputPath;
}

await fs.mkdir(outputDir, { recursive: true });

for (const cover of CASE_COVERS) {
  const outputPath = await processCover(cover);
  console.log(`[fifty-fifty-covers] ${cover.slug} -> ${outputPath}`);
}
