// ARCHÆOLOGY OF RUSSIAN DEATH — static generator.
// Reads /data/*.json and writes the atlas as plain HTML for GitHub Pages.
// No runtime dependencies. Run: node build/build.mjs
// (Derived images and textures: python3 build/make_derived.py)

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { FIGMAP, KEY, LAYOUT } from "./layouts.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const DATA = path.join(ROOT, "data");
const read = (p) => fs.readFileSync(p, "utf8").replace(/^﻿/, "");
const readJSON = (p) => JSON.parse(read(p));
const write = (rel, content) => {
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.replace(/\n{3,}/g, "\n\n"), "utf8");
  const kb = (Buffer.byteLength(content) / 1024).toFixed(1);
  console.log("  ", rel, kb + "K");
};

const plates = readJSON(path.join(DATA, "plates.json"));
const sourcesDoc = readJSON(path.join(DATA, "sources.json"));
const objectsDoc = readJSON(path.join(DATA, "objects.json"));
const conceptsDoc = readJSON(path.join(DATA, "concepts.json"));
const placesDoc = readJSON(path.join(DATA, "places.json"));
const timelineDoc = readJSON(path.join(DATA, "timeline.json"));
const imagesDoc = readJSON(path.join(DATA, "images.json"));
const methodDoc = readJSON(path.join(DATA, "method.json"));
const derivedDoc = readJSON(path.join(DATA, "derived.json"));

const S = Object.fromEntries(sourcesDoc.entries.map((s) => [s.id, s]));
const IMG = Object.fromEntries(imagesDoc.images.map((i) => [i.id, i]));
const DER = Object.fromEntries(derivedDoc.map((d) => [d.id, d]));
const PLACE = Object.fromEntries(placesDoc.places.map((p) => [p.id, p]));
const OBJ = Object.fromEntries(objectsDoc.objects.map((o) => [o.id, o]));
const CON = Object.fromEntries(conceptsDoc.concepts.map((c) => [c.id, c]));
const PLATE = Object.fromEntries(plates.plates.map((p) => [p.id, p]));

// ---------------------------------------------------------------- helpers ---
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const md = (s = "") =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

const tag = (level) => {
  const map = {
    documented: ["DOCUMENTED", "doc"],
    interpretation: ["INTERPRETATION", "int"],
    reconstruction: ["RECONSTRUCTION", "rec"],
  };
  const [label, cls] = map[level] || map.interpretation;
  return `<span class="tag tag--${cls}">${label}</span>`;
};

const plateHref = (id, base) => `${base}plates/${id}-${PLATE[id].slug}.html`;
const srcHref = (id, base) => `${base}bibliography.html#src-${id}`;
const srcBadge = (ids = [], base = "") =>
  ids.filter((i) => S[i]).map((i) => `<a class="badge-src mono" href="${base}bibliography.html#src-${i}" title="${esc(S[i].title)}">${esc(i)}</a>`).join(" ");

const spriteMarks = read(path.join(ROOT, "assets/illustrations/hand-marks.svg"));
const mark = (id, cls = "") => `<svg class="mark ${cls}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

// -------------------------------------------------- procedural torn paper ---
// Seeded fractal edges: one unique outline per sheet, an outer (fibre rim)
// and an inner (paper face) polygon, so every sheet is torn differently.
function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (str) => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function wob(n, r) {
  const out = new Array(n).fill(0);
  let amp = 1, step = Math.max(2, Math.floor(n / 3));
  for (let o = 0; o < 4; o++) {
    const k = Math.ceil(n / step) + 2;
    const pts = Array.from({ length: k }, () => r() * 2 - 1);
    for (let i = 0; i < n; i++) {
      const x = i / step, i0 = Math.floor(x), f = x - i0, t = f * f * (3 - 2 * f);
      out[i] += amp * (pts[i0] * (1 - t) + pts[i0 + 1] * t);
    }
    amp *= 0.55; step = Math.max(1, Math.floor(step / 2));
  }
  return out;
}
function torn(seed, sides = "tb", amp = 8) {
  const r = mulberry(hash(seed));
  const N = 30, M = 12;
  const mk = (len, on) => (on ? wob(len + 1, r).map((v) => Math.max(1.5, amp * 0.9 + v * amp * 0.7 + r() * amp * 0.5)) : new Array(len + 1).fill(0));
  const T = mk(N, sides.includes("t")), B = mk(N, sides.includes("b")), L = mk(M, sides.includes("l")), R = mk(M, sides.includes("r"));
  const rim = Math.max(3, amp * 0.55);
  const f = (n) => +n.toFixed(1);
  const poly = (inset) => {
    const o = [];
    for (let i = 0; i <= N; i++) o.push(`${f((i / N) * 100)}% ${f(T[i] + (T[i] > 0 ? inset : 0))}px`);
    for (let j = 1; j <= M; j++) o.push(`calc(100% - ${f(R[j] + (R[j] > 0 ? inset : 0))}px) ${f((j / M) * 100)}%`);
    for (let i = N; i >= 0; i--) o.push(`${f((i / N) * 100)}% calc(100% - ${f(B[i] + (B[i] > 0 ? inset : 0))}px)`);
    for (let j = M - 1; j >= 1; j--) o.push(`${f(L[j] + (L[j] > 0 ? inset : 0))}px ${f((j / M) * 100)}%`);
    return `polygon(${o.join(",")})`;
  };
  return { a: poly(0), b: poly(rim) };
}

// ----------------------------------------------------------------- images ---
const origOf = (id) => {
  const im = IMG[id];
  if (!im) return null;
  return im.parent && IMG[im.parent] ? IMG[im.parent] : im;
};
const creditOf = (id) => {
  const o = origOf(id);
  if (!o) return "";
  const lic = (o.license || "").replace(/ \(derived.*\)/, "");
  return `${o.creator.replace(/^Derivative made for this atlas( from the .*?)?$/, "Derivative processing by the atlas")} · ${lic}`;
};
const dims = (id) => (DER[id] ? ` width="${DER[id].w}" height="${DER[id].h}"` : "");
const fileOf = (id, base) => `${base}${IMG[id] ? IMG[id].file : `assets/derived/${id}.webp`}`;
const isBaked = (id) => !!DER[id];

function examineBtn(id, base, caption) {
  const o = origOf(id) || IMG[id];
  const full = `${base}${o.file}`;
  return `<button class="examine" type="button" data-examine data-full="${esc(full)}" data-title="${esc(o.title)}" data-cap="${esc(caption)}" data-credit="${esc(creditOf(id))}" data-src="${esc(id)}" aria-label="Examine the unprocessed original: ${esc(o.title).slice(0, 80)}">EXAMINE ORIGINAL</button>`;
}

// ------------------------------------------------------------- fragments ---
const kick = (t) => (t ? `<p class="k">${esc(t)}</p>` : "");
const foot = (s, base) => {
  const badges = srcBadge(s.sources, base);
  if (!s.level && !badges) return "";
  return `<footer class="ft">${s.level ? tag(s.level) : ""}${badges ? `<details class="src"><summary>sources</summary><p>${badges}</p></details>` : ""}</footer>`;
};

function prose(s, base) {
  return `<article class="prose">
  ${kick(s.kicker)}
  <h2>${md(s.heading)}</h2>
  <div class="tx">${s.paras.map((p) => `<p>${md(p)}</p>`).join("\n")}</div>
  ${foot(s, base)}
</article>`;
}

function record(s, base) {
  const meta = s.meta ? `<dl class="rec__meta">${Object.entries(s.meta).filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${md(v)}</dd></div>`).join("")}</dl>` : "";
  return `<article class="prose rec">
  ${kick(s.kicker)}
  <h2>${md(s.heading)}</h2>
  ${meta}
  <div class="tx">${(s.paras || []).map((p) => `<p>${md(p)}</p>`).join("\n")}</div>
  ${foot(s, base)}
</article>`;
}

function note(s) {
  return `<aside class="note">
  ${kick(s.kicker || "Note")}
  <h2>${md(s.heading)}</h2>
  <ul>${(s.items || []).map((i) => `<li>${md(i)}</li>`).join("")}</ul>
  ${s.level ? `<footer class="ft">${tag(s.level)}</footer>` : ""}
</aside>`;
}

function table(s) {
  return `<div class="tbl">
  <div class="tablewrap" tabindex="0" role="region" aria-label="${esc(s.caption || "Data table")}">
  <table class="datatable">
    <caption>${md(s.caption || "")}</caption>
    <thead><tr>${s.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${md(c)}</th>` : `<td>${md(c)}</td>`)).join("")}</tr>`).join("\n")}</tbody>
  </table>
  </div>
</div>`;
}

function register(s) {
  return `<div class="tbl reg">
  ${kick(s.kicker)}
  <h2>${md(s.heading)}</h2>
  <div class="tablewrap" tabindex="0" role="region" aria-label="${esc(s.heading || "Register")}">
  <table class="registertable">
    <thead><tr>${s.colhead.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${s.rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${md(c)}</th>` : `<td>${md(c)}</td>`)).join("")}</tr>`).join("\n")}</tbody>
  </table>
  </div>
</div>`;
}

function quote(s) {
  return `<figure class="q">
  <blockquote>${md(s.text)}</blockquote>
  <figcaption>${esc(s.attrib || "")} ${s.level ? tag(s.level) : ""}</figcaption>
</figure>`;
}

function diagramFig(s, base) {
  return `<figure class="drawing">
  <img src="${base}assets/illustrations/${s.src}.svg" alt="${esc(s.alt || "")}" loading="lazy" decoding="async">
  <figcaption class="cap">${md(s.caption)} ${s.credit ? `<span class="cap__credit">${esc(s.credit)}</span>` : ""} ${s.level ? tag(s.level) : ""}</figcaption>
</figure>`;
}

// A photographic figure: the image carries its own torn edge (baked) or gets a CSS tear.
function photoFig(id, base, { caption = "", credit = "", level = "", alt = "", note: hnote = "", tr = "", tape = "", ghost = false, clip = null }) {
  const baked = isBaked(id);
  const file = fileOf(id, base);
  const c = clip || torn(id, "tblr", 7);
  const cap = caption || (DER[id] ? DER[id].title : IMG[id].title);
  return `<div class="photo${ghost ? " photo--ghost" : ""}">
    <div class="photo__img${baked ? " is-baked" : " is-clip"}"${baked ? "" : ` style="--ca:${c.a};--cb:${c.b}"`}>
      <img src="${file}" alt="${esc(alt || (origOf(id) || IMG[id] || {}).alt || "")}"${dims(id)} loading="lazy" decoding="async">
    </div>
    ${tape ? `<span class="tape tape--${tape}" aria-hidden="true"></span>` : ""}
    <figcaption class="slip">
      <span class="slip__t">${md(cap)}</span>
      ${tr ? `<span class="slip__tr">${esc(tr)}</span>` : ""}
      <span class="slip__c">${esc(credit || creditOf(id))} ${level ? tag(level) : ""}</span>
      ${examineBtn(id, base, cap)}
    </figcaption>
    ${hnote ? `<span class="hnote" aria-hidden="true">${esc(hnote)}</span>` : ""}
  </div>`;
}

function figureSection(s, base, item) {
  const src = s.src;
  if (!IMG[src]) return diagramFig(s, base);
  const show = FIGMAP[src] || src;
  const keepsOrig = !FIGMAP[src];
  const o = IMG[src];
  const clipSides = keepsOrig ? "tblr" : "tb";
  return photoFig(show, base, {
    caption: s.caption, credit: s.credit, level: s.level, alt: s.alt,
    tape: item.tape, ghost: item.ghost,
    clip: keepsOrig ? torn(src, clipSides, 7) : null,
  });
}

function renderSection(s, base, item) {
  switch (s.type) {
    case "prose": return prose(s, base);
    case "record": return record(s, base);
    case "note": return note(s);
    case "table": return table(s);
    case "register": return register(s);
    case "quote": return quote(s);
    case "figure": return figureSection(s, base, item);
    default: return "";
  }
}

// --------------------------------------------------------------- shell -----
function shell({ title, description, base, bodyClass = "", page = "", content, extraHead = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="ARCHÆOLOGY OF RUSSIAN DEATH">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="https://DmitryLeLeE.github.io/rus_death/social.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="color-scheme" content="dark">
<link rel="icon" href="${base}assets/illustrations/colophon-mark.svg" type="image/svg+xml">
<link rel="preload" href="${base}assets/fonts/anton-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}css/core.css">
<link rel="stylesheet" href="${base}css/plates.css">
<link rel="stylesheet" href="${base}css/pages.css">
${extraHead}
</head>
<body class="${bodyClass}" data-page="${page}">
<a class="skip" href="#main">Skip to the atlas content</a>
${spriteMarks}
<header class="masthead">
  <a class="brand" href="${base}index.html"><span class="brand__a">ARCHÆOLOGY</span> <span class="brand__of">of</span> <span class="brand__r">RUSSIAN DEATH</span></a>
  <nav class="topnav" aria-label="Atlas sections">
    <a href="${base}atlas.html">INDEX</a>
    <a href="${base}map.html">MAP</a>
    <a href="${base}chronology.html">CHRONOLOGY</a>
    <a href="${base}bibliography.html">SOURCES</a>
    <a href="${base}method.html">METHOD</a>
  </nav>
  <button class="contents-btn" type="button" data-menu-open aria-haspopup="dialog" aria-controls="contents-dialog">
    <span class="contents-btn__label">CONTENTS</span><span class="contents-btn__bars" aria-hidden="true"></span>
  </button>
</header>
${content}
<footer class="sitefoot">
  <p class="sitefoot__a">ARCHÆOLOGY OF RUSSIAN DEATH</p>
  <p class="sitefoot__b">${esc(plates.meta.edition)} · compiled ${esc(plates.meta.compiled)} · <a href="${base}colophon.html">colophon</a> · <a href="${base}bibliography.html">sources</a></p>
</footer>
<dialog id="contents-dialog" class="contents" aria-labelledby="contents-title">
  <div class="contents__head">
    <h2 id="contents-title">CONTENTS</h2>
    <button class="contents__close" type="button" data-menu-close>CLOSE</button>
  </div>
  <ol class="contents__list">
    ${plates.plates.map((p) => `<li><a href="${plateHref(p.id, base)}"><span class="contents__letter">${p.letter}</span><span class="contents__title">${esc(p.nav)}</span><span class="contents__pg">${String(plates.plates.indexOf(p) + 1).padStart(2, "0")}</span></a></li>`).join("\n")}
  </ol>
  <div class="contents__meta">
    <a href="${base}atlas.html">THE INDEX</a>
    <a href="${base}map.html">GEOGRAPHY</a>
    <a href="${base}chronology.html">CHRONOLOGY</a>
    <a href="${base}bibliography.html">SOURCES</a>
    <a href="${base}method.html">METHOD</a>
    <a href="${base}colophon.html">COLOPHON</a>
  </div>
</dialog>
<dialog id="figureview" class="figureview" aria-labelledby="fv-title">
  <div class="figureview__bar">
    <p id="fv-title">IMAGE</p>
    <div class="figureview__tools">
      <button type="button" data-zoom-toggle aria-pressed="false">ZOOM</button>
      <button type="button" data-close>CLOSE</button>
    </div>
  </div>
  <div class="figureview__stage"><img alt="" src=""></div>
  <div class="figureview__cap">
    <p data-cap></p>
    <p data-credit></p>
  </div>
</dialog>
<script src="${base}js/app.js" defer></script>
</body>
</html>`;
}

// ------------------------------------------------------------- plate page --
const styleOf = (it) => {
  const v = [`--c:${it.c || "1/-1"}`, `--r:${it.r || "auto"}`, `--y:${it.y || 0}px`, `--rot:${it.rot || 0}deg`, `--mw:${it.w || 100}%`];
  if (it.z) v.push(`--z:${it.z}`);
  return v.join(";");
};

function placeItem(plate, it, i, base) {
  const side = `m-${it.m || "c"}`;
  if (it.a) {
    const id = it.a;
    const html = photoFig(id, base, { note: it.note, tr: it.tr, tape: it.tape, caption: it.cap || "" });
    return `<figure class="ph ph--art ${side}${it.c === "1/-1" ? " bleed" : ""}" style="${styleOf(it)}" data-art="${id}">${html}</figure>`;
  }
  const s = plate.sections[it.s];
  if (!s || s.hidden) return "";
  const inner = renderSection(s, base, it);
  const kind = s.type;
  if (kind === "figure" && IMG[s.src]) {
    return `<figure class="ph ph--art ${side}${it.c === "1/-1" ? " bleed" : ""}" style="${styleOf(it)}" data-slot="${it.s}">${inner}</figure>`;
  }
  const mat = it.mat || "newsprint";
  if (mat === "none") {
    return `<section class="ph ph--bare ph--${kind} ${side}" style="${styleOf(it)}" data-slot="${it.s}">${inner}${it.tape ? `<span class="tape tape--${it.tape}" aria-hidden="true"></span>` : ""}</section>`;
  }
  const t = torn(`${plate.id}-${it.s}`, it.tear || "tb", it.amp || 9);
  return `<section class="ph ph--sheet ph--${kind} ${side}" style="${styleOf(it)}" data-slot="${it.s}">
  <div class="sw" style="--ca:${t.a};--cb:${t.b}"><div class="sheet mat-${mat}">${inner}</div></div>
  ${it.tape ? `<span class="tape tape--${it.tape}" aria-hidden="true"></span>` : ""}
</section>`;
}

function renderPlate(p) {
  const base = "../";
  const idx = plates.plates.indexOf(p);
  const prev = plates.plates[idx - 1] || null;
  const next = plates.plates[idx + 1] || null;
  const lay = LAYOUT[p.layout];
  const placed = new Set(lay.items.filter((i) => i.s !== undefined).map((i) => i.s));
  const items = lay.items.slice();
  const maxRow = Math.max(...lay.items.map((i) => i.r || 1));
  p.sections.forEach((s, i) => { if (!placed.has(i) && !s.hidden) items.push({ s: i, r: maxRow + 1 + i, c: "2/12", mat: "newsprint", m: "c" }); });
  const body = items.map((it, i) => placeItem(p, it, i, base)).join("\n");

  const marginal = p.marginal ? `<aside class="ph marginal m-r" style="--c:8/13;--r:${maxRow + p.sections.length + 2};--y:0px;--rot:-1deg;--mw:90%">
    <button class="marginal__btn" type="button" data-marginal aria-controls="marg-${p.id}" aria-expanded="false">marginal note ${p.letter} ↓</button>
    <p class="marginal__note" id="marg-${p.id}" tabindex="-1" hidden>${md(p.marginal)}</p>
  </aside>` : "";

  const allSrc = [...new Set([...(p.sources || []), ...p.sections.flatMap((s) => s.sources || [])])].filter((id) => S[id]);
  const words = p.title.split(" ");
  const titleHtml = words.map((w) => `<span>${esc(w)}</span>`).join(" ");

  const head = `<header class="head">
  <p class="head__tag">PLATE ${p.letter} · ${String(idx + 1).padStart(2, "0")} / 12</p>
  <h1 class="head__title">${titleHtml}</h1>
  <p class="head__sub">${esc(p.subtitle)}</p>
  <p class="head__dek">${md(p.dek)}</p>
  <p class="head__lab">${esc(p.period)} · ${esc(p.location)} · ${esc(p.tradition)}</p>
  <span class="head__letter" aria-hidden="true">${p.letter}</span>
</header>`;

  const apparatus = `<details class="apparatus">
  <summary><span>Apparatus</span> sources · related plates · terms</summary>
  <div class="apparatus__cols">
    <div>
      <h2>Sources for this plate</h2>
      <ol class="platesrc">
        ${allSrc.map((id) => `<li><a href="${srcHref(id, base)}"><span class="mono">${esc(id)}</span> ${esc(S[id].author)} — <em>${esc(S[id].title)}</em> (${esc(S[id].year)})</a></li>`).join("")}
      </ol>
      <p class="apparatus__note">URLs, access dates and limitations are in the bibliography.</p>
    </div>
    <div>
      <h2>Related plates</h2>
      <ul class="related">
        ${(p.related || []).filter((r) => PLATE[r]).map((r) => `<li><a href="${plateHref(r, base)}"><span class="mono">${PLATE[r].letter}</span> ${esc(PLATE[r].nav)}</a></li>`).join("")}
      </ul>
      <h2>Terms in this plate</h2>
      <ul class="related related--terms">
        ${(p.concepts || []).filter((c) => CON[c]).map((c) => `<li><a href="${base}atlas.html#concept-${c}">${esc(CON[c].name)}</a></li>`).join("")}
        ${(p.objects || []).filter((o) => OBJ[o]).map((o) => `<li><a href="${base}atlas.html#object-${o}">${esc(OBJ[o].name)}</a></li>`).join("")}
      </ul>
    </div>
  </div>
</details>`;

  const pager = `<nav class="pager" aria-label="Plates">
  ${prev ? `<a href="${plateHref(prev.id, base)}" class="pager__a pager__a--prev"><span class="pager__d">← previous</span><span class="pager__l">${prev.letter}</span><span class="pager__t">${esc(prev.nav)}</span></a>` : `<a href="${base}index.html" class="pager__a pager__a--prev"><span class="pager__d">← back</span><span class="pager__l">∅</span><span class="pager__t">Cover</span></a>`}
  ${next ? `<a href="${plateHref(next.id, base)}" class="pager__a pager__a--next"><span class="pager__d">next →</span><span class="pager__l">${next.letter}</span><span class="pager__t">${esc(next.nav)}</span></a>` : `<a href="${base}atlas.html" class="pager__a pager__a--next"><span class="pager__d">end →</span><span class="pager__l">∞</span><span class="pager__t">The index</span></a>`}
</nav>`;

  const marks = (lay.marks || []).map((m) => `<span class="hm" style="left:${m.x};top:${m.y};width:${m.w};--rot:${m.rot || 0}deg" aria-hidden="true">${mark(m.id, "mark--red")}</span>`).join("");

  return shell({
    title: `${p.title} — Plate ${p.letter} — ARCHÆOLOGY OF RUSSIAN DEATH`,
    description: p.dek,
    base,
    bodyClass: `plate-page g-${lay.ground}`,
    page: `plate-${p.id}`,
    content: `<main id="main">
  <article class="plate p-${p.layout}" data-plate="${p.id}">
    ${head}
    <div class="plate__body">
      ${body}
      ${marginal}
      ${marks}
    </div>
    ${apparatus}
    ${pager}
  </article>
</main>`,
  });
}

// --------------------------------------------------------------- index -----
function indexPage() {
  const base = "";
  const cards = plates.plates.map((p, i) => {
    const theme = p.category;
    return `<li class="card" data-kind="plate" data-theme="${theme}" data-concepts="${(p.concepts || []).join(" ")}" data-objects="${(p.objects || []).join(" ")}" data-places="${(p.places || []).join(" ")}"
      data-search="${esc(`${p.title} ${p.nav} ${p.dek} ${p.subtitle} ${p.period} ${p.location} ${p.tradition}`.toLowerCase())}">
      <a class="card__link" href="${plateHref(p.id, base)}">
        <span class="card__thumb" aria-hidden="true"><img src="${IMG[KEY[p.id]] ? IMG[KEY[p.id]].file : "assets/derived/" + KEY[p.id] + ".webp"}" alt="" loading="lazy" decoding="async"></span>
        <span class="card__stamp mono" aria-hidden="true">${p.letter}</span>
        <span class="card__no mono">${String(i + 1).padStart(2, "0")}</span>
        <span class="card__title">${esc(p.nav)}</span>
        <span class="card__dek">${esc(p.dek)}</span>
        <span class="card__meta mono">${esc(p.period)}<br>${esc(p.location)}</span>
        <span class="card__open mono">OPEN PLATE →</span>
      </a>
    </li>`;
  }).join("\n");

  const objectCards = objectsDoc.objects.map((o) => `<li class="card card--sm" data-kind="object" data-search="${esc(`${o.name} ${o.term} ${o.gloss} ${o.description}`.toLowerCase())}" id="object-${o.id}">
    <div class="card__inner">
      <span class="card__no mono">OBJ</span>
      <h3 class="card__title">${esc(o.name)} <span class="card__term">${esc(o.term)}</span></h3>
      <p class="card__dek">${md(o.gloss)}</p>
      <p class="card__meta mono">${tag(o.evidence.startsWith("documented") ? "documented" : o.evidence.startsWith("unverified") ? "interpretation" : "documented")} ${o.evidence}</p>
      <p class="card__links mono">${o.plates.filter((x) => PLATE[x]).map((x) => `<a href="${plateHref(x, base)}">${PLATE[x].letter}</a>`).join(" ")}</p>
    </div>
  </li>`).join("\n");

  const conceptCards = conceptsDoc.concepts.map((c) => `<li class="card card--sm" data-kind="concept" data-search="${esc(`${c.name} ${c.gloss} ${c.description}`.toLowerCase())}" id="concept-${c.id}">
    <div class="card__inner">
      <span class="card__no mono">CON</span>
      <h3 class="card__title">${esc(c.name)}</h3>
      <p class="card__dek">${md(c.gloss)}</p>
      <p class="card__desc">${md(c.description)}</p>
      <p class="card__links mono">${c.plates.filter((x) => PLATE[x]).map((x) => `<a href="${plateHref(x, base)}">${PLATE[x].letter}</a>`).join(" ")}</p>
    </div>
  </li>`).join("\n");

  const placeCards = placesDoc.places.map((p) => `<li class="card card--sm" data-kind="place" data-search="${esc(`${p.name} ${p.region} ${p.summary}`.toLowerCase())}" id="place-${p.id}">
    <div class="card__inner">
      <span class="card__no mono">${p.status === "outside-RF" ? "OUTSIDE RF" : "LOC"}</span>
      <h3 class="card__title">${esc(p.name)}</h3>
      <p class="card__dek">${md(p.summary)}</p>
      <p class="card__meta mono">${p.lat.toFixed(2)} N / ${p.lon.toFixed(2)} E</p>
      <p class="card__links mono">${p.plates.filter((x) => PLATE[x]).map((x) => `<a href="${plateHref(x, base)}">${PLATE[x].letter}</a>`).join(" ")}</p>
    </div>
  </li>`).join("\n");

  const themes = [...new Set(plates.plates.map((p) => p.category))];
  const chip = (label, val) => `<button class="chip mono" type="button" data-filter="${val}" aria-pressed="false">${label}</button>`;

  return shell({
    title: "The Index — ARCHÆOLOGY OF RUSSIAN DEATH",
    description: "A non-linear index of plates, objects, concepts and documented places.",
    base,
    bodyClass: "index-page",
    page: "index",
    content: `<main id="main">
<header class="pagehead">
  <p class="mono pagehead__kicker">THE INDEX — A WORKING CATALOGUE</p>
  <h1 class="pagehead__title">THE<br>INDEX</h1>
  <p class="pagehead__dek">Twelve plates, and the objects, concepts and places that cross them. The catalogue is not a table of contents. It is a second route through the same material.</p>
</header>

<section class="catalog" aria-labelledby="catalog-title">
  <h2 id="catalog-title" class="visually-hidden">Catalogue</h2>
  <div class="catalog__controls">
    <div class="tabs" role="tablist" aria-label="Catalogue type">
      <button role="tab" id="tab-plate" aria-controls="panel-plate" aria-selected="true" class="tab mono" data-tab="plate">PLATES <span>12</span></button>
      <button role="tab" id="tab-object" aria-controls="panel-object" aria-selected="false" class="tab mono" data-tab="object">OBJECTS <span>${objectsDoc.objects.length}</span></button>
      <button role="tab" id="tab-concept" aria-controls="panel-concept" aria-selected="false" class="tab mono" data-tab="concept">CONCEPTS <span>${conceptsDoc.concepts.length}</span></button>
      <button role="tab" id="tab-place" aria-controls="panel-place" aria-selected="false" class="tab mono" data-tab="place">PLACES <span>${placesDoc.places.length}</span></button>
    </div>
    <div class="search">
      <label class="mono" for="q">SEARCH THE CATALOGUE</label>
      <input id="q" type="search" name="q" autocomplete="off" placeholder="soul, 1927, coffin, Karelia…">
    </div>
  </div>

  <div class="filters" id="filters">
    <span class="filters__label mono">THEME</span>
    ${themes.map((t) => chip(t.toUpperCase(), `theme:${t}`)).join("")}
    <button class="chip chip--reset mono" type="button" data-reset>ALL</button>
  </div>

  <p class="catalog__status mono" role="status" aria-live="polite" id="status">12 PLATES</p>

  <div role="tabpanel" id="panel-plate" aria-labelledby="tab-plate" class="panel" data-panel="plate">
    <ol class="cards" id="cards-plate">${cards}</ol>
  </div>
  <div role="tabpanel" id="panel-object" aria-labelledby="tab-object" class="panel" data-panel="object" hidden>
    <ol class="cards cards--figs">${objectCards}</ol>
  </div>
  <div role="tabpanel" id="panel-concept" aria-labelledby="tab-concept" class="panel" data-panel="concept" hidden>
    <ol class="cards cards--figs">${conceptCards}</ol>
  </div>
  <div role="tabpanel" id="panel-place" aria-labelledby="tab-place" class="panel" data-panel="place" hidden>
    <ol class="cards cards--figs">${placeCards}</ol>
  </div>
  <p class="catalog__empty mono" id="empty" hidden>NO ENTRIES MATCH. THE CATALOGUE IS FINITE; THE QUESTION IS NOT.</p>
</section>

<section class="index-note">
  <h2 class="mono">HOW THE INDEX WORKS</h2>
  <div class="index-note__cols">
    <p>Each card is a route. Plates are the long-form compositions; objects, concepts and places are the short entries that recur across them. Selecting a letter on an object card takes you to the plate where that thing is examined.</p>
    <p>The theme filter applies to plates only. Objects, concepts and places are filtered by search. Nothing here is ranked; the order is editorial and follows the sequence of plates.</p>
  </div>
</section>
</main>`,
  });
}

// ----------------------------------------------------------------- map -----
function mapPage() {
  const base = "";
  const geo = readJSON(path.join(DATA, "places.geo.json"));
  const groups = [];
  for (const p of placesDoc.places) {
    let g = groups.find((x) => x.marker === p.marker);
    if (!g) { g = { marker: p.marker, items: [], pos: geo[p.marker] }; groups.push(g); }
    g.items.push(p);
  }
  const pins = groups.map((g, i) => {
    const names = g.items.map((x) => x.name).join(" / ");
    return `<button class="pin" type="button" data-place="${g.marker}" style="--x:${g.pos.x}%;--y:${g.pos.y}%"
      aria-label="Locality ${String(i + 1).padStart(2, "0")}: ${esc(names)} — show entries">
      <span class="pin__dot" aria-hidden="true"></span><span class="pin__no mono" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
    </button>`;
  }).join("\n");

  const cards = groups.map((g, i) => `<li class="place" data-marker="${g.marker}" id="place-card-${g.marker}">
    <p class="place__no mono">${String(i + 1).padStart(2, "0")} — ${g.items[0].status === "outside-RF" ? "OUTSIDE THE RUSSIAN FEDERATION" : "RUSSIAN FEDERATION"}</p>
    <h3 class="place__name">${g.items.map((x) => esc(x.name)).join(" · ")}</h3>
    ${g.items.map((x) => `<div class="place__body">
      <p>${md(x.summary)}</p>
      <ul class="place__entries">${x.entries.map((e) => `<li>${md(e)}</li>`).join("")}</ul>
      <p class="place__links mono">${x.plates.filter((y) => PLATE[y]).map((y) => `<a href="${plateHref(y, base)}">PLATE ${PLATE[y].letter}</a>`).join(" · ")}</p>
    </div>`).join("")}
    <p class="place__coords mono">${g.pos ? `${g.items[0].lat.toFixed(2)}° N / ${g.items[0].lon.toFixed(2)}° E` : "NO COORDINATES"}</p>
  </li>`).join("\n");

  return shell({
    title: "Geography — ARCHÆOLOGY OF RUSSIAN DEATH",
    description: "Documented localities in the atlas, plotted on a working map of European Russia.",
    base,
    bodyClass: "map-page",
    page: "map",
    content: `<main id="main">
<header class="pagehead pagehead--map">
  <p class="mono pagehead__kicker">GEOGRAPHY — DOCUMENTED LOCALITIES ONLY</p>
  <h1 class="pagehead__title">THE<br>MAP</h1>
  <p class="pagehead__dek">Eight localities where the atlas has a documented basis for a claim. The map is a working sheet, not a distribution map: a photograph or a record is not a region.</p>
</header>

<section class="mapwrap" aria-labelledby="map-title">
  <h2 id="map-title" class="visually-hidden">Map of documented localities</h2>
  <div class="mapwrap__grid">
    <div class="map-plane">
      <img class="map-plane__geo" src="assets/illustrations/map-eurasia.svg" alt="" aria-hidden="true">
      ${pins}
      <p class="map-plane__scale mono" aria-hidden="true">PLATE CARRÉE, LATITUDE-COMPENSATED · 20°–56° E · 42°–68° N · APPROXIMATE POSITIONS</p>
      <p class="map-plane__credit mono">BASE GEOMETRY: NATURAL EARTH 1:110M (PUBLIC DOMAIN). PROJECTION AND MARKS: THIS ATLAS.</p>
    </div>
    <div class="gazetteer">
      <p class="mono gazetteer__lead">GAZETTEER — SELECT A NUMBER</p>
      <ol class="places">${cards}</ol>
    </div>
  </div>
</section>

<section class="map-note">
  <h2 class="mono">WHAT IS NOT ON THE MAP</h2>
  <div class="index-note__cols">
    <p>No area is shaded, no custom is assigned to a region. Zelenin’s reports of the unclean dead come from many provinces but do not constitute a distribution; the roofed cross is photographed once here and is not mapped as a zone.</p>
    <p>Where a source gives a place, the atlas plots the place. Where a source gives only a province or a region, the atlas says so in the entry. A single documented example is not a pattern, and the map is built to prevent that inference rather than to encourage it.</p>
  </div>
</section>
</main>`,
  });
}

// ----------------------------------------------------------- chronology ----
function chronologyPage() {
  const base = "";
  const eras = [
    ["pre-imperial", "PRE-IMPERIAL"],
    ["imperial", "IMPERIAL"],
    ["soviet", "SOVIET"],
    ["post-soviet", "POST-SOVIET"],
  ];
  const entries = timelineDoc.entries.slice().sort((a, b) => a.sort - b.sort).map((e) => `<li class="tl__item tl__item--${e.kind}" data-era="${e.era}">
    <p class="tl__date mono">${esc(e.display)}</p>
    <p class="tl__era mono">${esc(e.era.replace("-", " ").toUpperCase())}</p>
    <h3 class="tl__title">${md(e.title)}</h3>
    <p class="tl__text">${md(e.text)}</p>
    <p class="tl__links mono">${(e.plates || []).filter((x) => PLATE[x]).map((x) => `<a href="${plateHref(x, base)}">PLATE ${PLATE[x].letter}</a>`).join(" · ")} ${e.confidence ? `— <span class="tl__conf">${esc(e.confidence)}</span>` : ""}</p>
  </li>`).join("\n");

  return shell({
    title: "Chronology — ARCHÆOLOGY OF RUSSIAN DEATH",
    description: "A discontinuous chronology of documentation, policy, scholarship and memorial architecture.",
    base,
    bodyClass: "chrono-page",
    page: "chronology",
    content: `<main id="main">
<header class="pagehead pagehead--chrono">
  <p class="mono pagehead__kicker">CHRONOLOGY — POINTS, NOT A TRADITION</p>
  <h1 class="pagehead__title">THE<br>TIMELINE</h1>
  <p class="pagehead__dek">This is not a continuous history of Russian death. It is a line of documents, decrees, publications and buildings, with the breaks left visible.</p>
</header>

<section class="tl" aria-labelledby="tl-title">
  <h2 id="tl-title" class="visually-hidden">Chronology</h2>
  <div class="tl__filters" role="group" aria-label="Filter chronology by period">
    <button class="chip mono" type="button" data-era-filter="all" aria-pressed="true">ALL</button>
    ${eras.map(([v, l]) => `<button class="chip mono" type="button" data-era-filter="${v}" aria-pressed="false">${l}</button>`).join("")}
  </div>
  <p class="catalog__status mono" role="status" aria-live="polite" id="tlstatus">${timelineDoc.entries.length} ENTRIES</p>
  <ol class="tl__list" id="tl-list">${entries}</ol>
</section>

<section class="map-note">
  <h2 class="mono">HOW TO READ A BREAK</h2>
  <div class="index-note__cols">
    <p>Red entries are caesuras: moments when the institutions that produced the atlas’s sources changed, and with them the kind of evidence available. They are not events in a story of decline or progress.</p>
    <p>Confidence notes appear with every entry. Where a date is a press report rather than an archival record, the entry says so.</p>
  </div>
</section>
</main>`,
  });
}

// ----------------------------------------------------------- bibliography --
function bibliographyPage() {
  const base = "";
  const sorted = sourcesDoc.entries.slice().sort((a, b) => a.author.localeCompare(b.author));
  const used = (id) => plates.plates.filter((p) => (p.sources || []).includes(id) || p.sections.some((s) => (s.sources || []).includes(id)));
  const items = sorted.map((s, i) => `<li class="bib" id="src-${s.id}">
    <p class="bib__no mono">S${String(sorted.indexOf(s) + 1).padStart(2, "0")} <span class="bib__kind">${esc(s.kind.toUpperCase())}</span></p>
    <p class="bib__cite"><span class="bib__author">${esc(s.author)}</span> <em>${esc(s.title)}</em>${s.title_en ? ` [${esc(s.title_en)}]` : ""}. ${esc(s.publisher)}, ${esc(s.year)}.${s.extent ? ` ${esc(s.extent)}.` : ""}</p>
    <p class="bib__url mono"><a href="${esc(s.url)}" rel="noopener">${esc(s.url)}</a> — accessed ${esc(s.accessed)}.</p>
    <p class="bib__use"><span class="mono">USED FOR</span> ${md(s.supports)}</p>
    <p class="bib__lim"><span class="mono">LIMITATION</span> ${md(s.limitation)}</p>
    <p class="bib__plates mono">${used(s.id).map((p) => `<a href="${plateHref(p.id, base)}">PLATE ${p.letter}</a>`).join(" · ") || "GENERAL REFERENCE"}</p>
  </li>`).join("\n");

  const imgItems = imagesDoc.images.map((im) => `<li class="bib bib--img">
    <p class="bib__no mono">${esc(im.id.toUpperCase())}</p>
    <p class="bib__cite">${esc(im.creator)}. <em>${esc(im.title)}</em>${im.date ? `, ${esc(im.date)}` : ""}. ${esc(im.medium || "")}${im.collection && im.collection !== "—" ? `. ${esc(im.collection)}` : ""}.</p>
    <p class="bib__lic mono">${esc(im.license)}${im.license_url ? ` — <a href="${esc(im.license_url)}" rel="noopener">${esc(im.license_url)}</a>` : ""}</p>
    <p class="bib__url mono"><a href="${esc(im.source_page)}" rel="noopener">${esc(im.source_page)}</a></p>
    <p class="bib__lim">${esc(im.note)}</p>
  </li>`).join("\n");

  return shell({
    title: "Sources — ARCHÆOLOGY OF RUSSIAN DEATH",
    description: "Bibliography, access dates, limitations, and image licences.",
    base,
    bodyClass: "bib-page",
    page: "bibliography",
    content: `<main id="main">
<header class="pagehead pagehead--bib">
  <p class="mono pagehead__kicker">SOURCES — WITH LIMITATIONS, NOT ONLY TITLES</p>
  <h1 class="pagehead__title">THE<br>RECORD</h1>
  <p class="pagehead__dek">Every factual statement in the atlas points to one of these entries. Each entry records what it supports and what it cannot support. Access dates are the date of compilation.</p>
</header>

<section class="bib-wrap">
  <h2 class="mono bib-wrap__h">BIBLIOGRAPHY — ${sorted.length} ENTRIES</h2>
  <ol class="biblio">${items}</ol>
</section>

<section class="bib-wrap">
  <h2 class="mono bib-wrap__h">IMAGE CREDITS AND LICENCES — ${imagesDoc.images.length} FILES</h2>
  <p class="bib__intro">Derivative files (halftone, xerox, duotone) are made by this atlas from the originals listed beside them and inherit the original licence. Photographs under CC BY and CC BY-SA require attribution: the creator and licence are printed under every figure. A plain-text register is also included in the repository as <code>ASSET_CREDITS.md</code>.</p>
  <ol class="biblio biblio--img">${imgItems}</ol>
</section>

<section class="map-note">
  <h2 class="mono">WHAT IS NOT CITED</h2>
  <div class="index-note__cols">
    <p>Popular websites were used to locate some primary descriptions — for example the location of a photograph on Wikimedia Commons — but never as the sole basis for a historical claim. Where the only available basis was a press report, the entry is marked <span class="mono">PRESS</span>.</p>
    <p>Unverified claims are named in the plates as unverified. The atlas does not have a category of ‘common knowledge’ that exempts a claim from citation.</p>
  </div>
</section>
</main>`,
  });
}

// ------------------------------------------------------------------ 404 ----
function notFound() {
  const base = "";
  return shell({
    title: "Not found — ARCHÆOLOGY OF RUSSIAN DEATH",
    description: "The page is missing from the archive.",
    base,
    bodyClass: "nf-page",
    page: "404",
    content: `<main id="main" class="nf">
  <p class="mono nf__kicker">ERROR 404 — MISSING FROM THE ARCHIVE</p>
  <h1 class="nf__title">NOT<br>FOUND</h1>
  <p class="nf__text">The plate you asked for is not in this edition. The index is the way back.</p>
  <p class="nf__links mono"><a href="atlas.html">THE INDEX</a> · <a href="index.html">THE COVER</a></p>
</main>`,
  });
}

// ---------------------------------------------------------------- method ---
function methodPage() {
  const base = "";
  const m = methodDoc;
  return shell({
    title: "Method — ARCHÆOLOGY OF RUSSIAN DEATH",
    description: "Scope, evidence levels, transliteration, and the limits of this atlas.",
    base,
    bodyClass: "method-page",
    page: "method",
    content: `<main id="main">
<header class="pagehead pagehead--method">
  <p class="mono pagehead__kicker">METHOD — BEFORE THE IMAGES</p>
  <h1 class="pagehead__title">HOW TO<br>READ THIS<br>ATLAS</h1>
  <p class="pagehead__dek">${esc(m.dek)}</p>
</header>

<div class="method">
  ${m.sections.map((s) => `<section class="method__sec">
    <p class="mono method__kicker">${esc(s.kicker)}</p>
    <h2 class="method__h">${md(s.heading)}</h2>
    <div class="method__body">${s.paras.map((p) => `<p>${md(p)}</p>`).join("")}</div>
    ${s.list ? `<ul class="method__list">${s.list.map((i) => `<li>${md(i)}</li>`).join("")}</ul>` : ""}
  </section>`).join("\n")}
  <aside class="method__levels" aria-label="Evidence levels">
    <h2 class="mono">THE THREE LEVELS</h2>
    ${m.levels.map((l) => `<div class="level">
      <p class="mono level__h">${tag(l.level)} ${esc(l.name)}</p>
      <p>${md(l.text)}</p>
    </div>`).join("")}
  </aside>
</div>
</main>`,
  });
}

// -------------------------------------------------------------- colophon ---
function colophonPage() {
  const base = "";
  return shell({
    title: "Colophon — ARCHÆOLOGY OF RUSSIAN DEATH",
    description: "Production notes, typefaces, materials and technical facts.",
    base,
    bodyClass: "colophon-page",
    page: "colophon",
    content: `<main id="main">
<header class="pagehead pagehead--colo">
  <p class="mono pagehead__kicker">COLOPHON</p>
  <h1 class="pagehead__title">THE<br>OBJECT</h1>
  <p class="pagehead__dek">What this publication is made of, and what it deliberately is not.</p>
</header>

<div class="colophon">
  <section class="colo-sec">
    <h2 class="mono">TYPEFACES</h2>
    <p><strong>Anton</strong> (heavy condensed display), <strong>Oswald</strong> (condensed headings), <strong>Old Standard TT</strong> (nineteenth-century Russian-style serif, for pull quotes and captions), <strong>Source Serif 4</strong> (reading text), <strong>Special Elite</strong> (typewriter), <strong>Caveat</strong> (hand annotations, Latin and Cyrillic) and <strong>IBM Plex Mono</strong> (data). Anton, Oswald, Old Standard TT, Source Serif 4, Caveat and IBM Plex Mono are licensed under the SIL Open Font License 1.1; Special Elite is licensed under the Apache License 2.0. All are served from this repository, with licence texts in <code>assets/fonts/</code>.</p>
  </section>
  <section class="colo-sec">
    <h2 class="mono">MATERIALS</h2>
    <p>Every photograph in this edition is a separate derivative file, not a CSS filter: each has its own crop, its own degradation (photocopy threshold and toner streaks, halftone screen, newsprint dither, faded print with scanner banding, deep black, underexposed) and, where it is a loose sheet, a torn edge baked into the alpha channel. Seven material textures — concrete, granite, newsprint, linen, soot, wet plaster and grease-stained manila — were generated procedurally for this edition, together with the paper and dust overlays of the first edition. Text sheets are torn by seeded fractal outlines computed at build time, so no two sheets share an edge. Scripts: <code>build/make_derived.py</code>, <code>build/build.mjs</code>.</p>
    <p>Photographs and reproductions come from Wikimedia Commons under public domain, CC0, CC BY or CC BY-SA licences. Every file is credited under its figure and in the bibliography. Every derivative is declared in the bibliography and in <code>ASSET_CREDITS.md</code> and inherits the licence of its original; the original author is credited under each figure, and each figure has an EXAMINE ORIGINAL control that opens the unprocessed file.</p>
  </section>
  <section class="colo-sec">
    <h2 class="mono">TECHNICAL</h2>
    <p>Static HTML, CSS and vanilla JavaScript. No frameworks, no build step at runtime, no external requests, no cookies, no analytics, no backend. The site is generated from files in <code>data/</code> by <code>build/build.mjs</code> and can be served from any static host, including GitHub Pages.</p>
    <p>Interactions: the catalogue, the map, the chronology filter, the image examination dialog, cross-references and hidden marginalia. All are operable by keyboard; motion is disabled under <code>prefers-reduced-motion</code>.</p>
  </section>
  <section class="colo-sec">
    <h2 class="mono">EDITORIAL LIMITS</h2>
    <p>This is a first edition. It does not survey the Russian funeral industry, regional variation at the scale of a province, or the post-Soviet digital memorial. It does not quote laments, proverbs or epitaphs verbatim. It does not treat ‘Russian’ as a synonym for East Slavic. The gaps are listed in the plates where they occur.</p>
  </section>
  <section class="colo-sec">
    <h2 class="mono">LICENSING</h2>
    <p>The atlas’s original text, data, diagrams and generated textures are released under <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener">CC BY-SA 4.0</a>. Third-party images retain the licences recorded in the bibliography and in <code>ASSET_CREDITS.md</code>. Derived images of CC BY-SA photographs remain CC BY-SA.</p>
  </section>
  <img class="colo-mark" src="assets/illustrations/colophon-mark.svg" alt="" aria-hidden="true">
</div>
</main>`,
  });
}

// ----------------------------------------------------------------- cover ---
function coverPage() {
  const base = "";
  const keyThumb = (p) => {
    const id = KEY[p.id];
    const d = DER[id];
    const file = IMG[id] ? IMG[id].file : `assets/derived/${id}.webp`;
    return `<img src="${file}" alt="" width="${d ? d.w : 800}" height="${d ? d.h : 600}" loading="lazy" decoding="async">`;
  };
  return shell({
    title: "ARCHÆOLOGY OF RUSSIAN DEATH — An Atlas",
    description: "An atlas of death, memory, ritual and the afterlife in Russian culture. Twelve research plates, an index, a map, a chronology and sources.",
    base,
    bodyClass: "cover-page g-soot",
    page: "cover",
    content: `<main id="main" class="cover">
  <section class="cv" aria-label="Cover">
    <figure class="cv__ground">${photoFig("hero-tomb", base, { tape: "", note: "" })}</figure>
    <h1 class="cv__title">
      <span class="cv__t1">ARCHÆOLOGY</span>
      <span class="cv__t2"><i>of</i> <b>RUSSIAN</b></span>
      <span class="cv__t3">DEATH</span>
    </h1>
    <figure class="cv__cross">${photoFig("golubets-roof", base, { tape: "tr" })}<span class="hm cv__ring" aria-hidden="true">${mark("ring-a", "mark--red")}</span></figure>
    <figure class="cv__sled">${photoFig("perov-sled", base, { tape: "tl" })}</figure>
    <p class="cv__sub">An atlas of death, memory, ritual and the afterlife in Russian culture</p>
    <p class="cv__hand" aria-hidden="true">roofed cross → plate F</p>
    <span class="hm cv__arrow" aria-hidden="true">${mark("arrow-long", "mark--red")}</span>
    <p class="cv__slip">first edition 2026 · twelve plates</p>
  </section>

  <section class="cv-intro">
    <div class="cv-intro__sheet sw" style="--ca:${torn("cover-intro", "tb", 11).a};--cb:${torn("cover-intro", "tb", 11).b}">
      <div class="sheet mat-newsprint">
        <p class="cv-intro__lede">This is not a history of a single tradition. It is an assembly of documents, objects and arguments about how people in Russia buried their dead, imagined what came after, and tried to keep names from disappearing.</p>
        <p>Twelve plates move from the room where a death occurs to the archive that cannot hold it. Each plate has its own evidence and its own gaps. Facts are separated from interpretation and from reconstruction wherever they appear.</p>
        <p class="cv-intro__rule">No invented sources. No invented quotations. No invented archive numbers.</p>
        <nav class="cv-intro__nav" aria-label="Begin">
          <a href="atlas.html">the index</a>
          <a href="plates/a-threshold.html">begin at plate A</a>
          <a href="method.html">method</a>
        </nav>
      </div>
    </div>
  </section>

  <section class="cv-plates" aria-labelledby="cvp">
    <h2 id="cvp" class="visually-hidden">The twelve plates</h2>
    <ol>
      ${plates.plates.map((p, i) => `<li class="cvp cvp--${p.letter.toLowerCase()}"><a href="${plateHref(p.id, base)}">
        <span class="cvp__img">${keyThumb(p)}</span>
        <span class="cvp__l">${p.letter}</span>
        <span class="cvp__t">${esc(p.nav)}</span>
        <span class="cvp__n">${String(i + 1).padStart(2, "0")}</span>
      </a></li>`).join("")}
    </ol>
  </section>
</main>`,
  });
}

// ------------------------------------------------------------------ run ----
console.log("building");
write("index.html", coverPage());
write("method.html", methodPage());
write("atlas.html", indexPage());
write("map.html", mapPage());
write("chronology.html", chronologyPage());
write("bibliography.html", bibliographyPage());
write("colophon.html", colophonPage());
write("404.html", notFound());
for (const p of plates.plates) write(`plates/${p.id}-${p.slug}.html`, renderPlate(p));
console.log("done");
