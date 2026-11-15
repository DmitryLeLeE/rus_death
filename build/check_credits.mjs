// Checks the visual asset register: required attribution fields, files on disk, unregistered files.
// Usage: node build/check_credits.mjs   (exit code 1 if any hard error)
import fs from "node:fs";
import path from "node:path";
const ROOT = process.cwd();
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "images.json"), "utf8"));
const ROLES = new Set(["archival", "contextual", "artwork-reproduction", "reconstruction", "original-diagram", "derivative"]);
const errors = [], warns = [];
const registered = new Set();
for (const im of doc.images) {
  registered.add(im.file);
  const where = im.id || im.file;
  if (!fs.existsSync(path.join(ROOT, im.file))) errors.push(`${where}: file missing on disk`);
  const need = im.kind === "derivative" ? ["file", "title", "source_page"] : ["file", "kind", "title", "creator", "date", "license", "source_page", "alt", "role"];
  for (const k of need) if (!im[k] || String(im[k]).trim() === "") errors.push(`${where}: missing ${k}`);
  if (im.role && !ROLES.has(im.role)) errors.push(`${where}: unknown role ${im.role}`);
  if (im.kind !== "derivative" && im.role !== "original-diagram" && !/^https?:\/\//.test(im.source_page || "")) errors.push(`${where}: source_page is not a URL`);
  if (im.kind !== "derivative" && !im.evidence) warns.push(`${where}: no evidence status`);
  if (im.alt && im.alt.length < 20) warns.push(`${where}: alt text very short`);
}
for (const dir of ["assets/images", "assets/derived", "assets/illustrations"]) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    const rel = `${dir}/${f}`;
    if (/\.(jpg|jpeg|png|webp|svg)$/i.test(f) && !registered.has(rel)) warns.push(`${rel}: on disk but not in data/images.json`);
  }
}
console.log(`images registered: ${doc.images.length}`);
console.log(`errors: ${errors.length}; warnings: ${warns.length}`);
for (const e of errors) console.log("ERROR  " + e);
const shown = warns.slice(0, 40);
for (const w of shown) console.log("warn   " + w);
if (warns.length > shown.length) console.log(`warn   ... ${warns.length - shown.length} more`);
process.exit(errors.length ? 1 : 0);
