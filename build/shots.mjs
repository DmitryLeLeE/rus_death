// Full-page screenshots through the DevTools protocol (real viewport emulation).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:8123";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9336;
const userDir = path.join(os.tmpdir(), "atlas-shots-" + Date.now());
const OUT = path.join(process.cwd(), "shots");

const VPS = [
  { name: "desktop", width: 1440, height: 1000, mobile: false },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "mobile", width: 390, height: 844, mobile: true },
  { name: "small", width: 320, height: 760, mobile: true },
];
const PAGES = [
  ["cover", "index.html"],
  ["index", "atlas.html"],
  ["map", "map.html"],
  ["chronology", "chronology.html"],
  ["bibliography", "bibliography.html"],
  ["method", "method.html"],
  ["colophon", "colophon.html"],
  ...["a-threshold", "b-body", "c-ritual", "d-table", "e-returning", "f-grave",
    "g-voice", "h-afterlife", "i-collective", "j-art", "k-soviet", "l-unfinished"]
    .map((p) => [p, `plates/${p}.html`]),
];

const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function getJSON(url) {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(url); if (r.ok) return r.json(); } catch {}
    await sleep(250);
  }
  throw new Error("no cdp");
}
const version = await getJSON(`http://127.0.0.1:${PORT}/json/version`);
const target = await getJSON(`http://127.0.0.1:${PORT}/json/new?about:blank`).catch(async () => {
  const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" }); return r.json();
});
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); p(m.result); }
});
await new Promise(r => ws.addEventListener("open", r));
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Page.enable"); await send("Runtime.enable");

async function cdpLoadImages() {
  await send("Runtime.evaluate", {
    expression: `(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
      const pending = [...document.images].filter(img => img.getAttribute('src') && !(img.complete && img.naturalWidth > 0));
      await Promise.race([
        Promise.all(pending.map(img => new Promise(res => {
          img.addEventListener('load', res, {once:true});
          img.addEventListener('error', res, {once:true});
        }))),
        new Promise(r => setTimeout(r, 4000)),
      ]);
      await new Promise(r => setTimeout(r, 250));
      return [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
    })()`, awaitPromise: true, returnByValue: true,
  });
}

for (const vp of VPS) {
  fs.mkdirSync(path.join(OUT, vp.name), { recursive: true });
  await send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
  for (const [name, url] of PAGES) {
    await send("Page.navigate", { url: BASE + "/" + url });
    for (let i = 0; i < 30; i++) {
      await sleep(100);
      const st = await send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
      if (st.result && st.result.value === "complete") break;
    }
    const met0 = await send("Runtime.evaluate", {
      expression: `({h: Math.min(document.documentElement.scrollHeight, 7600), w: document.documentElement.scrollWidth})`,
      returnByValue: true,
    });
    const { h, w } = met0.result.value;
    // a tall viewport forces lazy images into view so they decode at full quality
    await send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: Math.min(h, 7600), deviceScaleFactor: 1, mobile: vp.mobile });
    await sleep(350);
    await cdpLoadImages();
    await sleep(400);
    const shot = await send("Page.captureScreenshot", {
      format: "jpeg", quality: 82, captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: w, height: h, scale: 1 },
    });
    const file = path.join(OUT, vp.name, name + ".jpg");
    fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
    console.log(vp.name, name, w + "x" + h, Math.round(fs.statSync(file).size / 1024) + "K");
    await send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
  }
}
ws.close(); chrome.kill();
try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}



