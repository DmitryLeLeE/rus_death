// Renders build/social.html to social.jpg (EN) and social-ru.jpg (RU), 1200×630.
// Needs playwright-core and a Chrome/Chromium: CHROME=/path/to/chrome node build/make_social.mjs
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
const require = createRequire(process.env.PW_PATH || "/opt/npm-tools/node_modules/");
const pw = require("playwright");
const root = path.resolve(import.meta.dirname, "..");
const b = await pw.chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox", "--allow-file-access-from-files"] });
for (const [lang, out] of [["en", "social.jpg"], ["ru", "social-ru.jpg"]]) {
  const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await pg.goto(pathToFileURL(path.join(root, "build/social.html")).href + `?lang=${lang}`, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: path.join(root, out), type: "jpeg", quality: 88 });
  console.log(out);
  await pg.close();
}
await b.close();

// ---- one card per plate, EN and RU: social/plate-a.jpg, social/ru-plate-a.jpg ----
import fs from "node:fs";
const ground = { a: "izba-red-corner-cut", b: "coffin-vyazma-cut", c: "gapon-panikhida-cut", d: "radonitsa-table", e: "perov-drowned-cut", f: "golubets-cut", g: "plattonen-funeral-cut", h: "judgment-full", i: "piskaryov-flame", j: "perov-full", k: "donskoy-crematorium-cut", l: "tomb-black" };
const en = JSON.parse(fs.readFileSync(path.join(root, "data/plates.json"), "utf8")).plates;
const ruP = JSON.parse(fs.readFileSync(path.join(root, "data/ru/plates.json"), "utf8")).plates;
fs.mkdirSync(path.join(root, "social"), { recursive: true });
const b2 = await pw.chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox", "--allow-file-access-from-files"] });
for (const lang of ["en", "ru"]) {
  for (const p of en) {
    const t = lang === "ru" ? { ...p, ...ruP[p.id] } : p;
    const d = {
      lang, image: ground[p.id], letter: p.letter, title: t.title, subtitle: t.subtitle,
      kicker: lang === "ru" ? `АТЛАС · ЛИСТ ${p.letter}` : `AN ATLAS · PLATE ${p.letter}`,
      meta: t.period,
      site: lang === "ru" ? `РУССКИЙ ХТОНИЧЕСКИЙ АТЛАС · ТОМ ${p.volume}` : `RUSSIAN CHTHONIC ATLAS · VOL. ${p.volume}`,
    };
    const pg = await b2.newPage({ viewport: { width: 1200, height: 630 } });
    await pg.goto(pathToFileURL(path.join(root, "build/social_plate.html")).href, { waitUntil: "networkidle" });
    await pg.evaluate((x) => window.fill(x), d);
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(250);
    const out = `social/${lang === "ru" ? "ru-" : ""}plate-${p.id}.jpg`;
    await pg.screenshot({ path: path.join(root, out), type: "jpeg", quality: 84 });
    await pg.close();
  }
}
await b2.close();
console.log("plate cards:", en.length * 2);
