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
