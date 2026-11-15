// Generates ASSET_CREDITS.md from data/images.json + the fixed asset inventory.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "images.json"), "utf8"));
const sources = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "sources.json"), "utf8"));

const esc = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");

const kindLabel = {
  painting: "Painting (reproduction)",
  icon: "Icon (reproduction)",
  photograph: "Photograph",
  plate: "Printed illustration",
  diagram: "Original editorial diagram (not a historical document)",
  derivative: "Derivative image (made for this atlas)",
};

let md = `# ASSET CREDITS

This register covers every external image, every generated material asset, the typefaces and the map geometry used in **ARCHÆOLOGY OF RUSSIAN DEATH**.

Downloaded: **2026-11-15**. Licence names and URLs are copied from the holding record (Wikimedia Commons) and were checked with the Commons API on that date.

---

## 1. Images

| File | Title | Creator | Date | Licence | Source |
| --- | --- | --- | --- | --- | --- |
`;

for (const im of data.images) {
  md += `| \`${im.file}\` | ${esc(im.title)} | ${esc(im.creator)} | ${esc(im.date)} | ${esc(im.license)} | ${esc(im.source_page)} |\n`;
}

md += `\n### Notes per file\n\n`;
for (const im of data.images) {
  md += `**${im.id}** — ${esc(im.title)}. ${esc(kindLabel[im.kind] || im.kind)}. ${esc(im.creator)}, ${esc(im.date)}. ${esc(im.medium || "")}${im.collection && im.collection !== "—" ? `. ${esc(im.collection)}` : ""}.\n`;
  md += `Licence: ${esc(im.license)}${im.license_url ? ` (${im.license_url})` : ""}. ${im.catalogue ? `Catalogue record: ${im.catalogue}. ` : ""}${esc(im.note)}\n\n`;
}

md += `### Attribution required

The following files are under CC BY or CC BY-SA and **must** carry the credit printed under every figure:

- \`golubets.jpg\` — Messir, CC BY-SA 3.0
- \`piskaryovskoye-flame.jpg\` — Ijuedt, CC BY-SA 4.0
- \`unknown-soldier-1979.jpg\` — I. Burov / Glavarkhiv Moscow, CC BY 4.0
- \`mamayev.jpg\` — Redboston, CC BY-SA 4.0
- \`ilf-grave.jpg\` — Ghirlandajo, CC BY 3.0
- \`ships-grave.jpg\` — Alexander-Khv, CC BY-SA 4.0
- \`radonitsa-graves.jpg\` — Perohanych, CC BY-SA 3.0

Adaptations of CC BY-SA photographs (cropping, duotone, halftone) remain under the same licence. The atlas does not alter the licence of any third-party image.

---

## 2. Generated material assets

All files below were produced for this atlas by the scripts in \`build/\`. They are released under CC BY-SA 4.0 together with the atlas, except where they derive from a third-party image, in which case the original licence applies.

### Textures (\`assets/textures/\`)

| File | Method | Role in the publication |
| --- | --- | --- |
| \`paper-grain.jpg\` | value noise + fibre strokes + fine grain, generated in \`make_assets.py\` | base printing paper |
| \`paper-warm.jpg\` | multi-scale mottling + foxing specks + edge darkening | aged sheet, used on plate E |
| \`xerox-dirty.jpg\` | toner clouds, clustered specks, scanner bands, gutter shadow | dirty photocopy; overlays photographs and the memorial-meal image |
| \`scanner-lines.jpg\` | horizontal banding and dust lines | scanner surface; archive plate |
| \`misregistration.png\` | offset red/black bands and ghost rules | print registration defect; Soviet plate header |
| \`ink-stain.png\` | blurred irregular polygons | ink stains, plate D |
| \`wash-stain.png\` | concentric elliptical wash | pale stain, plate G header |

### Overlays (\`assets/overlays/\`)

| File | Method | Role |
| --- | --- | --- |
| \`dust-dark.png\` | specks and scratches, dark | dust on pale surfaces, map |
| \`dust-light.png\` | specks and scratches, light | dust on dark plates |
| \`creases.png\` | soft diagonal ridges | folded sheet |

### Torn paper and hand marks (\`assets/paper/\`, \`assets/illustrations/\`)

- \`torn-masks.svg\` — six distinct clip paths (\`torn-01\` … \`torn-06\`) plus a strip and a hole, generated as closed polygons with wandering edges; used through \`clip-path: url(#…)\`.
- \`hand-marks.svg\` — symbol sprite: arrows, rings, cross-outs, ticks, brackets, underline, scribble, eye mark, asterisk. Used as editorial marks, in red or in ink.
- \`colophon-mark.svg\` — printer's mark (original).

Three photographic derivatives were generated: \`perov-funeral-halftone.png\`, \`last-judgment-halftone.png\` (halftone), \`memorial-meal-xerox.png\` (toner degradation) and \`donskoy-1913-duotone.jpg\` (duotone). They are derived from public-domain works.

---

## 3. Typefaces

| Family | Role | Licence | Files |
| --- | --- | --- | --- |
| **Anton** | display, heavy grotesque | SIL OFL 1.1 | \`assets/fonts/anton-400-normal.woff2\`, \`anton-OFL.txt\` |
| **Fira Sans Extra Condensed** | Cyrillic display (stands in for Anton) | SIL OFL 1.1 | \`assets/fonts/anton-cyr-fira-900.woff2\`, \`firasans-OFL.txt\` |
| **Oswald** | condensed display and navigation | SIL OFL 1.1 | \`assets/fonts/oswald-400-normal.woff2\`, \`oswald-OFL.txt\` |
| **Source Serif 4** | editorial text | SIL OFL 1.1 | \`sourceserif4-400-normal.woff2\`, \`sourceserif4-400-italic.woff2\`, \`sourceserif4-OFL.txt\` |
| **IBM Plex Mono** | metadata | SIL OFL 1.1 | \`plexmono-400-normal.woff2\`, \`plexmono-600-normal.woff2\`, \`plexmono-OFL.txt\` |

All four are served locally; no font CDN is used. Licence texts are included in the repository.

---

## 4. Map

- Country polygons: **Natural Earth 1:110m Admin 0 Countries**, public domain (<https://www.naturalearthdata.com/>).
- Rivers: **Natural Earth 1:50m Rivers + Lake Centerlines**, public domain.
- Lakes: **Natural Earth 1:110m Lakes**, public domain.
- Projection: plate carrée with latitude-compensated longitude (cos 55°), working window 20°–56° E, 42°–68° N. The projection and the marker layer are original to this atlas.
- The map is a working sheet: it shows ground geometry and documented localities, not the distribution of customs.

---

## 5. Text and code

Original text, data, diagrams, generated textures and code are released under **CC BY-SA 4.0**. Third-party images remain under the licences recorded above. The atlas’s original work does not relicense any third-party asset.

### Inline attributions

Every photograph under CC BY or CC BY-SA is credited in the caption under the figure and again in the bibliography page. No image is used without a recorded source and licence.
`;

fs.writeFileSync(path.join(ROOT, "ASSET_CREDITS.md"), md, "utf8");
console.log("ASSET_CREDITS.md", (Buffer.byteLength(md) / 1024).toFixed(1) + "K");


