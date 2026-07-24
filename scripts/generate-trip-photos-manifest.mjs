// Scans public/trips/ and writes a manifest of available image paths.
// Runs automatically before every build (see package.json "prebuild"),
// so any photo dropped into public/trips/ shows up in the admin photo
// picker after the next deploy — no manual step needed.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TRIPS_DIR = path.join(__dirname, "..", "public", "trips");
const OUT_FILE = path.join(__dirname, "..", "lib", "data", "tripPhotos.json");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const files = fs
  .readdirSync(TRIPS_DIR)
  .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
  .sort((a, b) => a.localeCompare(b))
  .map((f) => `/trips/${f}`);

fs.writeFileSync(OUT_FILE, JSON.stringify(files, null, 2) + "\n");
console.log(`generated ${OUT_FILE} with ${files.length} photos`);
