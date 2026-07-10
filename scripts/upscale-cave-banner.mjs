import sharp from 'sharp';

const src =
  'C:/Users/hugou/.cursor/projects/c-Users-hugou-cs2-skin-upgrade/assets/c__Users_hugou_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_10_jul_2026__05_14_26-7838c3cc-456d-482f-aec7-3edb994d8b80.png';
const out1x = 'public/images/upgrader-cave-banner.png';
const out2x = 'public/images/upgrader-cave-banner@2x.png';

const TARGET_1X = { width: 1920, height: 640 };
const TARGET_2X = { width: 3840, height: 1280 };

const pipeline = ({ width, height }) =>
  sharp(src)
    .resize(width, height, {
      fit: 'fill',
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 0.35, m1: 0.45, m2: 0.18, x1: 2, y2: 8 })
    .png({ compressionLevel: 2, adaptiveFiltering: true, force: true });

await pipeline(TARGET_1X).toFile(out1x);
await pipeline(TARGET_2X).toFile(out2x);

const meta = await sharp(src).metadata();
const m1 = await sharp(out1x).metadata();
const m2 = await sharp(out2x).metadata();
console.log(`source: ${meta.width}x${meta.height}`);
console.log(`1x: ${m1.width}x${m1.height}`);
console.log(`2x: ${m2.width}x${m2.height}`);
