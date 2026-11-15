// Real-browser audit: page metrics, horizontal overflow, console errors, dialogs.
// Usage: node build/audit.mjs [baseUrl]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:8123";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const userDir = path.join(os.tmpdir(), "atlas-audit-profile-" + Date.now());

const PAGES = [
  ["cover", "/index.html"],
  ["index", "/atlas.html"],
  ["map", "/map.html"],
  ["chronology", "/chronology.html"],
  ["bibliography", "/bibliography.html"],
  ["method", "/method.html"],
  ["colophon", "/colophon.html"],
  ["404", "/404.html"],
  ...["a-threshold", "b-body", "c-ritual", "d-table", "e-returning", "f-grave",
    "g-voice", "h-afterlife", "i-collective", "j-art", "k-soviet", "l-unfinished"]
    .map((p) => [p, `/plates/${p}.html`]),
];

const VIEWPORTS = [
  { name: "320", width: 320, height: 800 },
  { name: "360", width: 360, height: 800 },
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "900", width: 900, height: 900 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
];

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error("CDP endpoint not reachable: " + url);
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.ready = new Promise((res, rej) => {
      this.ws.addEventListener("open", () => res());
      this.ws.addEventListener("error", (e) => rej(e));
    });
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return p;
  }
  close() { try { this.ws.close(); } catch {} }
}

const results = [];
const errors = [];
let interactions = {};

async function main() {
  const version = await getJSON(`http://127.0.0.1:${PORT}/json/version`);
  const target = await getJSON(`http://127.0.0.1:${PORT}/json/new?about:blank`, 5).catch(async () => {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
    return r.json();
  });
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");

  for (const vp of VIEWPORTS) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.width < 800,
    });
    for (const [name, url] of PAGES) {
      cdp.events.length = 0;
      await cdp.send("Page.navigate", { url: BASE + url });
      for (let i = 0; i < 30; i++) {
        await sleep(100);
        const st = await cdp.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
        if (st.result && st.result.value === "complete") break;
      }
      await sleep(120);
      const metrics = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          const vw = window.innerWidth;
          const h = document.documentElement;
          const out = { scrollWidth: h.scrollWidth, innerWidth: vw, overflow: [] };
          const seen = new Set();
          for (const el of document.querySelectorAll('body *')) {
            const cs = getComputedStyle(el);
            if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            const over = Math.round(Math.max(r.right - vw, -r.left));
            if (r.right > vw + 1.5 || r.left < -1.5) {
              const key = el.tagName + '.' + (el.className && typeof el.className === 'string' ? el.className.split(' ').slice(0,2).join('.') : '') + ':' + Math.round(r.width);
              if (!seen.has(key)) { seen.add(key); out.overflow.push({ sel: key, right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width) }); }
            }
          }
          out.overflow = out.overflow.slice(0, 14);
          const dlg = document.querySelector('dialog#figureview');
          out.hasDialog = !!dlg;
          return out;
        })()`,
        returnByValue: true,
      });
      const m = metrics.result && metrics.result.value;
      if (!m) {
        errors.push({ page: name, vp: vp.name, detail: "evaluate failed: " + JSON.stringify(metrics).slice(0, 300) });
        continue;
      }
      const errs = cdp.events.filter((e) =>
        e.method === "Runtime.exceptionThrown" ||
        (e.method === "Log.entryAdded" && e.params.entry.level === "error") ||
        (e.method === "Runtime.consoleAPICalled" && e.params.type === "error"));
      if (errs.length) {
        for (const e of errs) errors.push({ page: name, vp: vp.name, detail: JSON.stringify(e.params).slice(0, 400) });
      }
      results.push({ vp: vp.name, page: name, scrollWidth: m.scrollWidth, innerWidth: m.innerWidth, overflow: m.overflow });
    }
  }

  // interaction smoke tests at 1440
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.navigate", { url: BASE + "/atlas.html" });
  await sleep(400);
  const tabs = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const click = (el) => el && el.click();
      const out = {};
      const objTab = document.querySelector('[data-tab="object"]');
      click(objTab);
      await new Promise(r => setTimeout(r, 60));
      out.objectCardsVisible = [...document.querySelectorAll('[data-panel="object"] .card')].filter(c => !c.hidden).length;
      out.platePanelHidden = document.querySelector('[data-panel="plate"]').hidden;
      const q = document.querySelector('#q');
      q.value = 'kutya';
      q.dispatchEvent(new Event('input', {bubbles:true}));
      await new Promise(r => setTimeout(r, 180));
      out.kutyaResults = [...document.querySelectorAll('[data-panel="object"] .card')].filter(c => !c.hidden).length;
      out.status = document.querySelector('#status').textContent;
      q.value = 'zzzzzz';
      q.dispatchEvent(new Event('input', {bubbles:true}));
      await new Promise(r => setTimeout(r, 180));
      out.emptyShown = !document.querySelector('#empty').hidden;
      return out;
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  interactions.index = tabs.result.value;

  await cdp.send("Page.navigate", { url: BASE + "/plates/h-afterlife.html" });
  await sleep(400);
  const examine = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const btn = document.querySelector('[data-examine]');
      if (!btn) return { error: 'no examine button' };
      btn.focus(); btn.click();
      await new Promise(r => setTimeout(r, 120));
      const dlg = document.querySelector('#figureview');
      return { open: dlg.open, title: document.querySelector('#fv-title').textContent,
               src: dlg.querySelector('img').getAttribute('src').slice(0,60),
               active: document.activeElement && document.activeElement.textContent };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  interactions.examine = examine.result.value;

  await cdp.send("Page.navigate", { url: BASE + "/plates/a-threshold.html" });
  await sleep(400);
  const marginal = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const b = document.querySelector('[data-marginal]');
      if (!b) return { error: 'no marginal' };
      b.click();
      await new Promise(r => setTimeout(r, 60));
      const note = document.getElementById(b.getAttribute('aria-controls'));
      return { expanded: b.getAttribute('aria-expanded'), hidden: note.hidden, text: note.textContent.slice(0,40) };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  interactions.marginal = marginal.result.value;

  await cdp.send("Page.navigate", { url: BASE + "/map.html" });
  await sleep(400);
  const map = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const pin = document.querySelector('.pin[data-place="moscow"]');
      pin.click();
      await new Promise(r => setTimeout(r, 120));
      const card = document.getElementById('place-card-moscow');
      return { pressed: pin.getAttribute('aria-pressed'), active: card.classList.contains('is-active'),
               focused: document.activeElement && document.activeElement.textContent.slice(0,24) };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  interactions.map = map.result.value;

  await cdp.send("Page.navigate", { url: BASE + "/chronology.html" });
  await sleep(400);
  const chrono = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      const chip = document.querySelector('[data-era-filter="soviet"]');
      chip.click();
      await new Promise(r => setTimeout(r, 60));
      const shown = [...document.querySelectorAll('.tl__item')].filter(i => !i.hidden).length;
      return { shown, status: document.querySelector('#tlstatus').textContent };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  interactions.chronology = chrono.result.value;

  await cdp.send("Page.navigate", { url: BASE + "/index.html" });
  await sleep(300);
  const menu = await cdp.send("Runtime.evaluate", {
    expression: `(async () => {
      document.querySelector('[data-menu-open]').click();
      await new Promise(r => setTimeout(r, 120));
      const d = document.querySelector('#contents-dialog');
      const open = d.open;
      document.querySelector('[data-menu-close]').click();
      await new Promise(r => setTimeout(r, 80));
      return { open, closed: !d.open };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  interactions.menu = menu.result.value;

  cdp.close();
}

main()
  .catch((e) => { console.error("AUDIT ERROR", e); })
  .finally(async () => {
    const report = { base: BASE, when: new Date().toISOString(), viewports: VIEWPORTS.map(v => v.name), results, errors, interactions };
    fs.writeFileSync(path.join(process.cwd(), "build", "audit-report.json"), JSON.stringify(report, null, 1));
    const bad = results.filter(r => r.scrollWidth > r.innerWidth + 1);
    const worst = {};
    for (const r of bad) {
      worst[r.page] = worst[r.page] || [];
      const top = r.overflow.slice(0, 4).map(o => `${o.sel} (${o.w}px, right ${o.right})`);
      worst[r.page].push({ vp: r.vp, scrollWidth: r.scrollWidth, top });
    }
    console.log("VIEWPORT RESULTS");
    for (const v of VIEWPORTS) {
      const rows = bad.filter(r => r.vp === v.name);
      console.log(` ${v.name}: ${rows.length} pages with horizontal overflow`);
    }
    console.log("\nOVERFLOW DETAIL");
    for (const [page, arr] of Object.entries(worst)) {
      console.log(" " + page);
      for (const a of arr.slice(0, 4)) console.log(`   ${a.vp}: scrollWidth ${a.scrollWidth} :: ${a.top.join(" | ")}`);
    }
    console.log("\nCONSOLE ERRORS: " + errors.length);
    for (const e of errors.slice(0, 12)) console.log(" ", e.page, e.vp, e.detail.slice(0, 220));
    console.log("\nINTERACTIONS");
    console.log(JSON.stringify(interactions, null, 1));
    try { chrome.kill(); } catch {}
    try { fs.rmSync(userDir, { recursive: true, force: true }); } catch {}
  });


