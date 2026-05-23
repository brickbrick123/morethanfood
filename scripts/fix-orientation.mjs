import sharp from 'sharp';
import { readdir, rename, unlink } from 'node:fs/promises';

const DIR = new URL('../src/assets/images/', import.meta.url);
const GALLERY = new URL('../src/assets/images/gallery/', import.meta.url);

async function fix(dirUrl) {
  const files = await readdir(dirUrl);
  for (const file of files) {
    if (!/\.(jpe?g)$/i.test(file)) continue;
    const src = new URL(file, dirUrl).pathname;
    const tmp = src + '.tmp';
    const meta = await sharp(src).metadata();
    if (!meta.orientation || meta.orientation === 1) continue;
    // .rotate() with no args applies the EXIF orientation, then we strip metadata.
    await sharp(src).rotate().toFile(tmp);
    await unlink(src);
    await rename(tmp, src);
    console.log('Reoriented:', file);
  }
}

await fix(DIR);
await fix(GALLERY);
console.log('Done.');
