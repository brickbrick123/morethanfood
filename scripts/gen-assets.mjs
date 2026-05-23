import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const PUB = new URL('../public/', import.meta.url);
const SRC = new URL('../src/assets/images/', import.meta.url);

const faviconSvg = await readFile(new URL('favicon.svg', PUB));

// 1. favicon-32.png
await sharp(faviconSvg, { density: 384 })
  .resize(32, 32)
  .png()
  .toFile(new URL('favicon-32.png', PUB).pathname);

// 2. apple-touch-icon.png (180x180, no transparency for iOS)
await sharp(faviconSvg, { density: 768 })
  .resize(180, 180)
  .flatten({ background: '#14492F' })
  .png()
  .toFile(new URL('apple-touch-icon.png', PUB).pathname);

// 3. og-image.jpg — hero photo with a forest wash and brand text.
const W = 1200;
const H = 630;

const photo = await sharp(new URL('home-team.jpeg', SRC).pathname)
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .toBuffer();

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="#082417" stop-opacity="0.95"/>
      <stop offset="0.55" stop-color="#082417" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#0E3722" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g transform="translate(80,150)">
    <rect width="62" height="62" rx="15" fill="#14492F"/>
    <path d="M31 48s-14-8.8-14-20A9 9 0 0 1 31 19a9 9 0 0 1 14 9c0 11.2-14 20-14 20z"
          fill="none" stroke="#F0852B" stroke-width="4.2" stroke-linejoin="round"/>
    <circle cx="31" cy="29" r="3.2" fill="#FBF6EC"/>
    <text x="82" y="42" font-family="Georgia, 'Times New Roman', serif"
          font-size="34" font-weight="700" fill="#FBF6EC">More Than Food</text>
  </g>
  <text x="80" y="360" font-family="Georgia, 'Times New Roman', serif"
        font-size="74" font-weight="700" fill="#FBF6EC">More than a meal.</text>
  <text x="80" y="446" font-family="Georgia, 'Times New Roman', serif"
        font-size="74" font-weight="700" fill="#FBF6EC">A reason to come together.</text>
  <text x="80" y="520" font-family="Arial, Helvetica, sans-serif"
        font-size="28" fill="#F0852B" letter-spacing="1.5">Nonprofit &#183; Bringing two communities together</text>
</svg>`);

await sharp(photo)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 86 })
  .toFile(new URL('og-image.jpg', PUB).pathname);

console.log('Generated: favicon-32.png, apple-touch-icon.png, og-image.jpg');
