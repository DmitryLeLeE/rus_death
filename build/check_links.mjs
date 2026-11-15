// Static link and asset checker for the built atlas.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const htmlFiles = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || ["node_modules", "shots", "build"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) htmlFiles.push(p);
  }
}
walk(ROOT);

let bad = [];
let checked = 0;
const anchorsByFile = new Map();

const stripHash = (h) => h.split("#")[0];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  anchorsByFile.set(path.relative(ROOT, file).replace(/\\/g, "/"), ids);
}
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const dir = path.dirname(file);
  const attrs = [...html.matchAll(/(?<![\w-])(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const a of attrs) {
    if (!a || a.startsWith("data:") || a.startsWith("mailto:")) continue;
    if (/^https?:/i.test(a)) { checked++; continue; }
    checked++;
    const target = stripHash(a);
    const hash = a.includes("#") ? a.split("#")[1] : "";
    if (target) {
      const abs = path.resolve(dir, target);
      if (!fs.existsSync(abs)) {
        bad.push({ rel, href: a, why: "missing file" });
        continue;
      }
      if (hash && abs.endsWith(".html")) {
        const key = path.relative(ROOT, abs).replace(/\\/g, "/");
        const ids = anchorsByFile.get(key);
        if (ids && !ids.has(hash)) bad.push({ rel, href: a, why: "missing anchor" });
      }
    } else if (hash) {
      const ids = anchorsByFile.get(rel);
      if (ids && !ids.has(hash)) bad.push({ rel, href: a, why: "missing local anchor" });
    }
  }
}

// CSS url() references
const cssBad = [];
for (const f of fs.readdirSync(path.join(ROOT, "css"))) {
  if (!f.endsWith(".css")) continue;
  const file = path.join(ROOT, "css", f);
  const txt = fs.readFileSync(file, "utf8");
  for (const m of txt.matchAll(/url\(([^)]+)\)/g)) {
    let u = m[1].trim().replace(/^['"]|['"]$/g, "");
    if (u.startsWith("data:") || u.startsWith("#")) continue;
    const abs = path.resolve(path.dirname(file), u);
    if (!fs.existsSync(abs)) cssBad.push({ file: "css/" + f, url: u });
  }
}

// data image ids referenced by plates vs files present
const images = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "images.json"), "utf8")).images;
const missingImages = images.filter((im) => !fs.existsSync(path.join(ROOT, im.file)));
const allHtml = htmlFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");
const unusedImages = images.filter((im) => !allHtml.includes(im.file));

console.log("HTML files:", htmlFiles.length);
console.log("local references checked:", checked);
console.log("broken references:", bad.length);
for (const b of bad.slice(0, 30)) console.log("  ", b.rel, "→", b.href, "::", b.why);
console.log("broken CSS urls:", cssBad.length);
for (const b of cssBad.slice(0, 20)) console.log("  ", b.file, "→", b.url);
console.log("missing image files:", missingImages.map((i) => i.file));
console.log("unused images:", unusedImages.map((i) => i.file));
process.exitCode = bad.length || cssBad.length || missingImages.length ? 1 : 0;

