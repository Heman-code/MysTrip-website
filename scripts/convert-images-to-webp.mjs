// Converts every PNG/JPEG under public/ to WebP and deletes the source file.
// Runs automatically before every dev session and build (see package.json
// "predev"/"prebuild"), so any photo dropped into public/ — regardless of
// the extension it was dropped in as — is served as WebP after the next
// `next dev` or deploy. No manual step needed.
//
// Encoding is source-aware:
//  - PNG sources use true lossless WebP. PNGs are themselves lossless, so
//    this is a strict quality win — same pixels, ~25-30% smaller.
//  - JPEG sources use lossy WebP at quality 100. JPEG is already a lossy
//    format; re-encoding it losslessly just preserves (and inflates) its
//    compression artifacts at a much larger file size. Quality-100 WebP is
//    visually indistinguishable from the source JPEG while actually being
//    smaller, which is the point of this conversion.
//
// app/icon.png and app/apple-icon.png are intentionally untouched: Next.js's
// file-convention icons only support .ico/.jpg/.jpeg/.png/.svg, not .webp.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

const sources = fs.existsSync(PUBLIC_DIR) ? walk(PUBLIC_DIR) : [];

if (sources.length === 0) {
  console.log("convert-images-to-webp: nothing to convert");
  process.exit(0);
}

const results = await Promise.all(
  sources.map(async (src) => {
    const isPng = path.extname(src).toLowerCase() === ".png";
    const dest = src.replace(/\.(png|jpe?g)$/i, ".webp");
    await sharp(src)
      .webp(isPng ? { lossless: true } : { quality: 100 })
      .toFile(dest);
    fs.unlinkSync(src);
    return path.relative(PUBLIC_DIR, src);
  })
);

console.log(`convert-images-to-webp: converted ${results.length} image(s) to WebP\n  ${results.join("\n  ")}`);
