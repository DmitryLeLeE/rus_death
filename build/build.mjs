// ARCHÆOLOGY OF RUSSIAN DEATH — static generator.
// Reads /data/*.json and writes the atlas as plain HTML for GitHub Pages.
// No runtime dependencies. Run: node build/build.mjs
// (Derived images and textures: python3 build/make_derived.py)

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { FIGMAP, KEY, LAYOUT } from "./layouts.mjs";
import { UI } from "./ui.mjs";

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

// ------------------------------------------------------- language state ---
// One generator, two editions. The English data files are the source of truth;
// data/ru/*.json are overlays merged on top by id (or by section index).
const SITE = "https://DmitryLeLeE.github.io/rus_death/";
let LANG = "en", T = UI.en, UP = "";
let plates, sourcesDoc, objectsDoc, conceptsDoc, placesDoc, timelineDoc, imagesDoc, methodDoc, derivedDoc;
let VOICES = [], VOICE = {};
let prologueDoc, lexiconDoc, volumesDoc, routesDoc, S, IMG, DER, PLACE, OBJ, CON, PLATE, VOL, HAND = {};

const merge = (target, src) => {
  for (const [k, v] of Object.entries(src)) {
    const t = target[k];
    target[k] = k !== "meta" && v && typeof v === "object" && !Array.isArray(v) && t && typeof t === "object" && !Array.isArray(t) ? merge(t, v) : v;
  }
  return target;
};
const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
const fileExists = (p) => fs.existsSync(p);

// Public-domain texts and songs. The data files are optional: with neither present
// the text sections render nothing and the build is unchanged.
function loadVoices(lang) {
  const list = [];
  const vp = path.join(DATA, "voices.json");
  if (fileExists(vp)) list.push(...readJSON(vp).voices);
  const sp = path.join(DATA, "songs.json");
  if (fileExists(sp)) {
    for (const x of readJSON(sp).songs) {
      list.push({
        id: x.id, title: x.title_en, title_ru: x.title_ru, first_line: x.first_line, genre: x.genre, genre_ru: x.genre_ru,
        place: "", author: x.author, date_published: x.published, source_detail: x.source_detail, source_url: x.source_url,
        rights: x.rights, rights_evidence: x.rights_evidence, status: x.status, excerpt_note: x.excerpt_note,
        plate: Array.isArray(x.plate) ? String(x.plate[0]).toLowerCase() : x.plate,
        original: x.original, translation: x.translation, context: x.context, notes: x.notes, language: "Russian",
      });
    }
  }
  if (lang === "ru") {
    for (const f of ["voices.json", "songs.json"]) {
      const p = path.join(DATA, "ru", f);
      if (!fileExists(p)) continue;
      const ovl = readJSON(p);
      for (const v of list) if (ovl[v.id]) merge(v, ovl[v.id]);
    }
  }
  return list;
}

function loadLang(lang) {
  LANG = lang; T = UI[lang]; UP = lang === "ru" ? "../" : "";
  plates = readJSON(path.join(DATA, "plates.json"));
  sourcesDoc = readJSON(path.join(DATA, "sources.json"));
  objectsDoc = readJSON(path.join(DATA, "objects.json"));
  conceptsDoc = readJSON(path.join(DATA, "concepts.json"));
  placesDoc = readJSON(path.join(DATA, "places.json"));
  timelineDoc = readJSON(path.join(DATA, "timeline.json"));
  imagesDoc = readJSON(path.join(DATA, "images.json"));
  methodDoc = readJSON(path.join(DATA, "method.json"));
  derivedDoc = readJSON(path.join(DATA, "derived.json"));
  VOICES = loadVoices(lang); VOICE = byId(VOICES);
  prologueDoc = fileExists(path.join(DATA, "prologue.json")) ? readJSON(path.join(DATA, "prologue.json")) : null;
  lexiconDoc = fileExists(path.join(DATA, "lexicon.json")) ? readJSON(path.join(DATA, "lexicon.json")) : null;
  volumesDoc = readJSON(path.join(DATA, "volumes.json"));
  routesDoc = readJSON(path.join(DATA, "routes.json"));
  HAND = {};
  if (lang === "ru") {
    const ov = (f) => { const p = path.join(DATA, "ru", f); return fileExists(p) ? readJSON(p) : null; };
    const o = ov("plates.json");
    if (o) {
      if (o.meta) merge(plates.meta, o.meta);
      for (const P of plates.plates) {
        const q = o.plates[P.id]; if (!q) continue;
        const { sections, ...rest } = q;
        Object.assign(P, rest);
        for (const [k, v] of Object.entries(sections || {})) if (P.sections[k]) merge(P.sections[k], v);
      }
    }
    const lists = [["sources.json", sourcesDoc.entries], ["objects.json", objectsDoc.objects], ["concepts.json", conceptsDoc.concepts],
      ["places.json", placesDoc.places], ["timeline.json", timelineDoc.entries], ["images.json", imagesDoc.images], ["derived.json", derivedDoc]];
    for (const [f, arr] of lists) {
      const d = ov(f); if (!d) continue;
      const idx = byId(arr);
      for (const [id, v] of Object.entries(d)) if (idx[id]) merge(idx[id], v);
    }
    const m = ov("method.json");
    if (m) {
      if (m.dek) methodDoc.dek = m.dek;
      (m.levels || []).forEach((v, i) => v && merge(methodDoc.levels[i], v));
      (m.sections || []).forEach((v, i) => v && merge(methodDoc.sections[i], v));
    }
    const pr = ov("prologue.json"); if (pr && prologueDoc) merge(prologueDoc, pr);
    const lx = ov("lexicon.json");
    if (lx && lexiconDoc) {
      const { entries: lxe, ...lxr } = lx;
      Object.assign(lexiconDoc, lxr);
      for (const e of lexiconDoc.entries) if (lxe && lxe[e.id]) merge(e, lxe[e.id]);
    }
    HAND = ov("hand.json") || {};
    const rr = ov("routes.json");
    if (rr) for (const r of routesDoc.routes) if (rr[r.id]) { const q = rr[r.id]; if (q.title) r.title = q.title; if (q.dek) r.dek = q.dek; (q.steps || []).forEach((w, i) => { if (r.steps[i] && w) r.steps[i].why = w; }); }
    const vv = ov("volumes.json");
    if (vv) for (const v of volumesDoc.volumes) if (vv[v.id]) merge(v, vv[v.id]);
  }
  S = byId(sourcesDoc.entries);
  IMG = byId(imagesDoc.images);
  DER = byId(derivedDoc);
  PLACE = byId(placesDoc.places);
  OBJ = byId(objectsDoc.objects);
  CON = byId(conceptsDoc.concepts);
  PLATE = byId(plates.plates);
  VOL = byId(volumesDoc.volumes);
  // derived counts: tokens {n}, {plates}, {Plates} are filled from the data
  const n = plates.plates.length;
  const pl = lang === "ru"
    ? `${n} ${n % 10 === 1 && n % 100 !== 11 ? "лист" : [2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100) ? "листа" : "листов"}`
    : `${n} plates`;
  const nv = volumesDoc.volumes.filter((v) => plates.plates.some((p) => p.volume === v.id)).length;
  const vl = lang === "ru"
    ? `${nv} ${nv % 10 === 1 && nv % 100 !== 11 ? "том" : [2,3,4].includes(nv % 10) && ![12,13,14].includes(nv % 100) ? "тома" : "томов"}`
    : `${nv} volume${nv === 1 ? "" : "s"}`;
  const fill = (o) => {
    for (const k of Object.keys(o)) {
      if (typeof o[k] === "string") o[k] = o[k].replaceAll("{plates}", pl).replaceAll("{Plates}", pl).replaceAll("{volumes}", vl).replaceAll("{n}", String(n));
      else if (o[k] && typeof o[k] === "object") fill(o[k]);
    }
  };
  fill(T); fill(methodDoc);
  // A text section whose data file is not present is dropped, so no empty sheet is drawn.
  for (const pl of plates.plates) pl.sections = pl.sections.filter((x) => !(x.type === "text" && !VOICE[x.voice]));
}
const volPlates = (vid) => plates.plates.filter((p) => p.volume === vid);
const letterRange = (vp) => {
  const cs = vp.map((p) => p.letter.charCodeAt(0)).sort((a, b) => a - b), out = [];
  for (let i = 0; i < cs.length; ) { let j = i; while (j + 1 < cs.length && cs[j + 1] === cs[j] + 1) j++; out.push(j > i ? `${String.fromCharCode(cs[i])}–${String.fromCharCode(cs[j])}` : String.fromCharCode(cs[i])); i = j + 1; }
  return out.join(", ");
};
const volPos = (p) => volPlates(p.volume).indexOf(p) + 1;
const hand = (s) => (s && HAND[s]) || s || "";

// ---------------------------------------------------------------- helpers ---
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const md = (s = "") =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

const tag = (level, contested) => {
  const cls = { documented: "doc", interpretation: "int", reconstruction: "rec", unverified: "unv" }[level] || "int";
  return `<span class="tag tag--${cls}">${T.tags[level] || T.tags.interpretation}</span>${contested ? ` <span class="tag tag--con">${T.contested}</span>` : ""}`;
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
  let creator = o.creator || "";
  if (LANG === "ru") {
    creator = creator
      .replace(/^Derivative made for this atlas( from the .*?)?$/, "Обработка для настоящего атласа")
      .replace(/^Unknown photographer\b/i, "Неизвестный фотограф")
      .replace(/^Unknown icon painter\b/i, "Неизвестный иконописец")
      .replace(/^Unknown artist\b/i, "Неизвестный художник")
      .replace(/Wikimedia Commons contributor \(released CC0\)/i, "Участник Викисклада (CC0)");
  } else {
    creator = creator.replace(/^Derivative made for this atlas( from the .*?)?$/, "Derivative processing by the atlas");
  }
  const lic = (o.license || "").replace(/ \(derived.*\)/, "");
  return `${creator} · ${lic}`;
};
const dims = (id) => (DER[id] ? ` width="${DER[id].w}" height="${DER[id].h}"` : "");
const fileOf = (id, base) => `${UP}${base}${IMG[id] ? IMG[id].file : `assets/derived/${id}.webp`}`;
const isBaked = (id) => !!DER[id];

function examineBtn(id, base, caption) {
  const o = origOf(id) || IMG[id];
  const full = `${UP}${base}${o.file}`;
  return `<button class="examine" type="button" data-examine data-full="${esc(full)}" data-title="${esc((LANG === "ru" && o.title_ru) || o.title)}" data-cap="${esc(caption)}" data-credit="${esc(creditOf(id))}" data-src="${esc(id)}" aria-label="${esc(T.examineAria)}${esc((LANG === "ru" && o.title_ru) || o.title).slice(0, 80)}">${T.examine}</button>`;
}

// ------------------------------------------------------------- fragments ---
const kick = (t) => (t ? `<p class="k">${esc(t)}</p>` : "");
const foot = (s, base) => {
  const badges = srcBadge(s.sources, base);
  if (!s.level && !badges) return "";
  return `<footer class="ft">${s.level ? tag(s.level, s.contested) : ""}${badges ? `<details class="src"><summary>${T.sourcesWord}</summary><p>${badges}</p></details>` : ""}</footer>`;
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
  ${kick(s.kicker || T.noteDefault)}
  <h2>${md(s.heading)}</h2>
  <ul>${(s.items || []).map((i) => `<li>${md(i)}</li>`).join("")}</ul>
  ${s.level ? `<footer class="ft">${tag(s.level, s.contested)}</footer>` : ""}
</aside>`;
}

function table(s) {
  return `<div class="tbl">
  <div class="tablewrap" tabindex="0" role="region" aria-label="${esc(s.caption || T.dataTable)}">
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
  <div class="tablewrap" tabindex="0" role="region" aria-label="${esc(s.heading || T.register)}">
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
  const src = (LANG === "ru" && (IMG[`${s.src}-ru`] || fileExists(path.join("assets/illustrations", `${s.src}-ru.svg`)))) ? `${s.src}-ru` : s.src;
  return `<figure class="drawing${/\.svg$/.test((IMG[src] || {}).file || "") ? " drawing--sheet" : ""}${s.size === "wide" ? " drawing--wide" : ""}">
  <img src="${UP}${base}assets/illustrations/${src}.svg" alt="${esc(s.alt || "")}" loading="lazy" decoding="async">
  <figcaption class="cap">${md(s.caption)} ${s.credit ? `<span class="cap__credit">${esc(s.credit)}</span>` : ""} ${s.level ? tag(s.level) : ""}</figcaption>
</figure>`;
}

// A photographic figure: the image carries its own torn edge (baked) or gets a CSS tear.
function photoFig(id, base, { caption = "", credit = "", level = "", alt = "", note: hnote = "", tr = "", tape = "", ghost = false, clip = null }) {
  const baked = isBaked(id);
  const file = fileOf(id, base);
  const c = clip || torn(id, "tblr", 7);
  const cap = caption || (DER[id] ? DER[id].title : IMG[id].title);
  const parentOfDer = DER[id] ? Object.values(IMG).find((x) => x.file && x.file.endsWith("/" + DER[id].parent_file)) : null;
  const mature = !!((origOf(id) || IMG[id] || parentOfDer || {}).mature || (parentOfDer || {}).mature);
  return `<div class="photo${ghost ? " photo--ghost" : ""}${mature ? " photo--mature" : ""}"${mature ? " data-mature" : ""}>
    <div class="photo__img${baked ? " is-baked" : " is-clip"}"${baked ? "" : ` style="--ca:${c.a};--cb:${c.b}"`}>
      <img src="${file}" alt="${esc(alt || (origOf(id) || IMG[id] || {}).alt || "")}"${dims(id)} loading="lazy" decoding="async">
      ${mature ? `<button class="gate" type="button" data-gate aria-label="${esc(T.gateAria)}"><span class="gate__a">18+</span><span class="gate__t">${T.gateText}</span><span class="gate__b">${T.gateBtn}</span></button>` : ""}
    </div>
    ${tape ? `<span class="tape tape--${tape}" aria-hidden="true"></span>` : ""}
    <figcaption class="slip">
      <span class="slip__t">${md(cap)}</span>
      ${tr ? `<span class="slip__tr">${esc(hand(tr))}</span>` : ""}
      <span class="slip__c">${esc(credit || creditOf(id))} ${level ? tag(level) : ""}</span>
      ${examineBtn(id, base, cap)}
    </figcaption>
    ${hnote ? `<span class="hnote" aria-hidden="true">${esc(hand(hnote))}</span>` : ""}
  </div>`;
}

function figureSection(s, base, item) {
  const src = s.src;
  if (!IMG[src] || /\.svg$/.test(IMG[src].file || "")) return diagramFig(s, base);
  const show = s.show || FIGMAP[src] || src;
  const keepsOrig = !s.show && !FIGMAP[src];
  const o = IMG[src];
  const clipSides = keepsOrig ? "tblr" : "tb";
  return photoFig(show, base, {
    caption: s.caption, credit: s.credit, level: s.level, alt: s.alt,
    tape: item.tape, ghost: item.ghost,
    clip: keepsOrig ? torn(src, clipSides, 7) : null,
  });
}

const RIGHTS = { PUBLIC_DOMAIN_VERIFIED: { en: "Public domain", ru: "Общественное достояние" } };

function textSection(s, base) {
  const v = VOICE[s.voice];
  if (!v) return "";
  const stanzas = (arr) => (typeof arr[0] === "string" ? [arr] : arr).map((st) =>
    `<div class="voice__st">${st.map((line) => `<span class="voice__l">${esc(line)}</span>`).join("")}</div>`).join("");
  const trans = LANG === "en" ? v.translation : (v.translation_ru || null);
  const transLabel = LANG === "en" ? T.voice.translationEn : T.voice.translationRu;
  const genre = LANG === "ru" ? (v.genre_ru || v.genre) : v.genre;
  const meta = {
    [T.voice.genre]: genre, [T.voice.recorded]: v.date_recorded, [T.voice.published]: v.date_published,
    [T.voice.locality]: v.place, [T.voice.collector]: v.collector, [T.voice.performer]: v.performer,
    [T.voice.author]: v.author, [T.voice.status]: v.status === "complete" ? T.voice.complete : T.voice.excerpt,
  };
  const metaHtml = `<dl class="rec__meta">${Object.entries(meta).filter(([, x]) => x)
    .map(([k, x]) => `<div><dt>${esc(k)}</dt><dd>${md(x)}</dd></div>`).join("")}</dl>`;
  const notes = (v.notes || []).length
    ? `<dl class="voice__notes">${v.notes.map((n) => `<div><dt>${esc(n.term)}</dt><dd>${md(n.gloss)}</dd></div>`).join("")}</dl>` : "";
  const excerpt = v.status !== "complete" && v.excerpt_note
    ? `<p class="voice__ex"><span class="voice__lab">${T.voice.excerpt}</span> ${esc(v.excerpt_note)}</p>` : "";
  const rights = (RIGHTS[v.rights] || {})[LANG] || v.rights;
  return `<article class="prose voice" id="voice-${v.id}">
  ${kick(s.kicker || "")}
  <h2>${md(v.title)}</h2>
  ${LANG === "en" ? `<p class="voice__orig">${esc(v.title_ru)}</p>` : ""}
  <div class="voice__grid${trans ? "" : " voice__grid--single"}">
    <div class="voice__col" lang="ru">
      <p class="voice__lab">${T.voice.original}</p>
      ${stanzas(v.original)}
    </div>
    ${trans ? `<div class="voice__col" lang="${LANG === "en" ? "en" : "ru"}">
      <p class="voice__lab">${transLabel}</p>
      ${stanzas(trans)}
    </div>` : ""}
  </div>
  ${excerpt}
  ${metaHtml}
  <div class="tx">${(s.framing || v.context || []).map((p) => `<p>${md(p)}</p>`).join("")}</div>
  ${notes}
  <p class="voice__src"><span class="voice__lab">${T.voice.source}</span> ${esc(v.source_detail)}${v.source_url ? ` · <a href="${esc(v.source_url)}" rel="noopener">${T.voice.open}</a>` : ""}</p>
  <p class="voice__rights"><span class="voice__lab">${T.voice.rights}</span> ${esc(rights)}. ${esc(v.rights_evidence || "")}</p>
  ${foot(s, base)}
</article>`;
}

function renderSection(s, base, item) {
  const type = s.type || (s.paras ? "prose" : s.text ? "quote" : s.cols ? "table" : s.items ? "note" : "");
  switch (type) {
    case "prose": return prose(s, base);
    case "record": return record(s, base);
    case "note": return note(s);
    case "table": return table(s);
    case "register": return register(s);
    case "quote": return quote(s);
    case "text": return textSection(s, base);
    case "figure": return figureSection(s, base, item);
    default: return "";
  }
}

// --------------------------------------------------------------- shell -----
const OTHER = { en: "ru", ru: "en" };
function shell({ title, description, base, bodyClass = "", page = "", rel = "index.html", content, extraHead = "", social = "", socialAlt = "" }) {
  const A = UP + base;                       // path prefix for assets
  const toRu = LANG === "en" ? `${base}ru/${rel}` : `${base}${rel}`;
  const toEn = LANG === "ru" ? `${UP}${base}${rel}` : `${base}${rel}`;
  const other = LANG === "en" ? toRu : toEn;
  const urlEn = SITE + rel.replace(/index\.html$/, ""), urlRu = SITE + "ru/" + rel.replace(/index\.html$/, "");
  const self = LANG === "en" ? urlEn : urlRu;
  const brand = T.brand;
  const socialFile = social || (LANG === "ru" ? "social-ru.jpg" : "social.jpg");
  const sAlt = socialAlt || T.socialAlt;
  const nav = T.nav;
  const ruBanner = LANG === "en" ? `<div class="rubanner" data-rubanner hidden lang="en"><p>${UI.en.ruBanner}</p><a href="${toRu}" hreflang="ru" data-lang-pick="ru">${UI.en.ruBannerGo}</a><button type="button" data-rubanner-close>${UI.en.ruBannerNo}</button></div>` : "";
  return `<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${self}">
<link rel="alternate" hreflang="en" href="${urlEn}">
<link rel="alternate" hreflang="ru" href="${urlRu}">
<link rel="alternate" hreflang="x-default" href="${urlEn}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(T.siteTitle)}">
<meta property="og:locale" content="${LANG === "ru" ? "ru_RU" : "en_US"}">
<meta property="og:locale:alternate" content="${LANG === "ru" ? "en_US" : "ru_RU"}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${self}">
<meta property="og:image" content="${SITE}${socialFile}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(sAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${socialFile}">
<meta name="twitter:image:alt" content="${esc(sAlt)}">
<meta name="theme-color" content="#0d0c0b">
<meta name="author" content="Dmitry Papilin">
<meta name="color-scheme" content="dark">
<link rel="icon" href="${A}assets/illustrations/colophon-mark.svg" type="image/svg+xml">
<link rel="icon" href="${A}assets/icons/icon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="${A}assets/icons/icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="${A}assets/icons/apple-touch-icon.png">
<link rel="preload" href="${A}assets/fonts/anton-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${A}css/core.css">
<link rel="stylesheet" href="${A}css/plates.css">
<link rel="stylesheet" href="${A}css/pages.css">
<link rel="stylesheet" href="${A}css/motion.css">
<link rel="stylesheet" href="${A}css/print.css" media="print">
${extraHead}
<script>try{var d=document.documentElement;if(localStorage.getItem("rd-plain")==="1")d.classList.add("is-plain");d.classList.add("js")}catch(e){}</script>
</head>
<body class="${bodyClass}" data-page="${page}">
<a class="skip" href="#main">${T.skip}</a>
${ruBanner}
${spriteMarks}
<div class="thread" aria-hidden="true"><i></i></div>
<header class="masthead">
  <a class="brand" href="${base}index.html"><span class="brand__a">${brand[0]}</span>${brand[1] ? ` <span class="brand__of">${brand[1]}</span>` : ""} <span class="brand__r">${brand[2]}</span></a>
  <nav class="topnav" aria-label="${T.navLabel}">
    <a href="${base}prologue.html">${nav.prologue}</a>
    <a href="${base}volumes.html">${nav.volumes}</a>
    <a href="${base}atlas.html">${nav.index}</a>
    <a href="${base}map.html">${nav.map}</a>
    <a href="${base}chronology.html">${nav.chrono}</a>
    <a href="${base}words.html">${nav.words}</a>
    <a href="${base}voices.html">${nav.voices}</a>
    <a href="${base}routes.html">${nav.routes}</a>
    <a href="${base}archive.html">${nav.archive}</a>
    <a href="${base}ledger.html">${nav.ledger}</a>
    <a href="${base}bibliography.html">${nav.sources}</a>
    <a href="${base}method.html">${nav.method}</a>
    <a href="${base}search.html">${nav.search}</a>
  </nav>
  <div class="masthead__tools">
    <button class="readable-btn" type="button" data-readable aria-pressed="false" title="${esc(T.readableTitle)}" data-on="${esc(T.readableOn)}" data-off="${esc(T.readable)}">${T.readable}</button>
    <a class="lang-btn" href="${other}" hreflang="${OTHER[LANG]}" lang="${OTHER[LANG]}" data-lang-pick="${OTHER[LANG]}" title="${esc(T.langToggleTitle)}" aria-label="${esc(T.langToggleAria)}">${T.langToggle}</a>
  </div>
  <button class="contents-btn" type="button" data-menu-open aria-haspopup="dialog" aria-controls="contents-dialog">
    <span class="contents-btn__label">${T.contents}</span><span class="contents-btn__bars" aria-hidden="true"></span>
  </button>
</header>
${content}
<footer class="sitefoot">
  <p class="sitefoot__a">${T.siteTitle}</p>
  <p class="sitefoot__b">${esc(T.footer(plates.meta.edition, plates.meta.compiled))} · <a href="${base}colophon.html">${T.footColophon}</a> · <a href="${base}bibliography.html">${T.footSources}</a> · <a href="${other}" hreflang="${OTHER[LANG]}" lang="${OTHER[LANG]}" data-lang-pick="${OTHER[LANG]}">${T.footLang}</a></p>
</footer>
<dialog id="contents-dialog" class="contents" aria-labelledby="contents-title">
  <div class="contents__head">
    <h2 id="contents-title">${T.contents}</h2>
    <button class="contents__close" type="button" data-menu-close>${T.close}</button>
  </div>
  <ol class="contents__list">
    ${volumesDoc.volumes.filter((v) => volPlates(v.id).length).map((v) => `<li class="contents__vol mono">${T.volumeWord} ${v.numeral} — ${esc(v.title)}</li>
    ${volPlates(v.id).map((p) => `<li><a href="${plateHref(p.id, base)}"><span class="contents__letter">${p.letter}</span><span class="contents__title">${esc(p.nav)}</span><span class="contents__pg">${String(plates.plates.indexOf(p) + 1).padStart(2, "0")}</span></a></li>`).join("\n")}`).join("\n")}
  </ol>
  <div class="contents__meta">
    <a href="${base}prologue.html">${nav.prologue}</a>
    <a href="${base}volumes.html">${nav.volumes}</a>
    <a href="${base}atlas.html">${nav.index}</a>
    <a href="${base}map.html">${nav.map}</a>
    <a href="${base}chronology.html">${nav.chrono}</a>
    <a href="${base}words.html">${nav.words}</a>
    <a href="${base}voices.html">${nav.voices}</a>
    <a href="${base}routes.html">${nav.routes}</a>
    <a href="${base}archive.html">${nav.archive}</a>
    <a href="${base}ledger.html">${nav.ledger}</a>
    <a href="${base}bibliography.html">${nav.sources}</a>
    <a href="${base}method.html">${nav.method}</a>
    <a href="${base}search.html">${nav.search}</a>
    <a href="${base}colophon.html">${T.colophon}</a>
  </div>
</dialog>
<dialog id="figureview" class="figureview" aria-labelledby="fv-title">
  <div class="figureview__bar">
    <p id="fv-title">${T.imageWord}</p>
    <div class="figureview__tools">
      <button type="button" data-zoom-toggle aria-pressed="false">${T.zoom}</button>
      <button type="button" data-close>${T.close}</button>
    </div>
  </div>
  <div class="figureview__stage"><img alt="" src=""></div>
  <div class="figureview__cap">
    <p data-cap></p>
    <p data-credit></p>
  </div>
</dialog>
<button class="sound-btn" type="button" data-sound aria-pressed="false" title="${esc(T.soundTitle)}" data-on="${esc(T.soundOn)}" data-off="${esc(T.sound)}" data-note-ask="${esc(T.soundNoteAsk)}" data-note-yes="${esc(T.soundNoteYes)}" data-note-no="${esc(T.soundNoteNo)}" data-note-resume="${esc(T.soundNoteResume)}" data-note-resume-btn="${esc(T.soundNoteResumeBtn)}">${T.sound}</button>
<script src="${A}js/app.js" defer></script>
<script src="${A}js/nav.js" defer></script>
<script src="${A}js/sound.js" defer></script>
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
    const html = photoFig(id, base, { note: it.note, tr: it.tr, tape: it.tape, caption: hand(it.cap) || "" });
    return `<figure class="ph ph--art ${side}${it.c === "1/-1" ? " bleed" : ""}" style="${styleOf(it)}" data-art="${id}">${html}</figure>`;
  }
  const s = plate.sections[it.s];
  if (!s || s.hidden) return "";
  const inner = renderSection(s, base, it);
  const kind = s.type || (s.paras ? "prose" : s.text ? "quote" : s.cols ? "table" : s.items ? "note" : "sheet");
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

// "flow" layout: sections keep their data order; figures pair with the preceding unpaired prose on the opposite side.
function flowLayout(p) {
  const prose = [{ c: "1/8", m: "l", mat: "newsprint", w: 94, rot: -0.5 }, { c: "6/13", m: "r", mat: "plaster", w: 92, rot: 0.8 }, { c: "2/9", m: "c", mat: "linen", w: 94, rot: 0.5 }, { c: "2/12", m: "c", mat: "manila", w: 100, rot: -0.3 }, { c: "7/13", m: "r", mat: "soot", w: 90, rot: 0.9 }, { c: "1/7", m: "l", mat: "newsprint", w: 90, rot: -0.7 }];
  const items = [];
  let row = 0, pi = 0, open = null; // open = prose item with no figure yet
  p.sections.forEach((s, i) => {
    if (s.hidden) return;
    if (s.type === "figure") {
      const wide = s.size === "wide";
      if (open && !wide) {
        const left = open.m === "l" || open.m === "c" && open.c.startsWith("2/");
        items.push({ s: i, r: open.r, c: left ? "8/13" : "1/6", y: 70, rot: left ? 0.9 : -0.8, w: 96, m: left ? "r" : "l", tape: left ? "tr" : "tl" });
        open = null;
      } else {
        row += 1; open = null;
        items.push({ s: i, r: row, c: wide ? "2/12" : pi % 2 ? "1/7" : "7/13", y: 20, rot: pi % 2 ? -0.5 : 0.6, w: 96, m: wide ? "c" : pi % 2 ? "l" : "r", tape: "tl" });
      }
    } else {
      const t = prose[pi++ % prose.length];
      row += 1;
      const it = { s: i, r: row, y: 20, ...t };
      items.push(it);
      open = s.type === "prose" ? it : null;
    }
  });
  return { ground: "soot", items };
}

function renderPlate(p) {
  const base = "../";
  const idx = plates.plates.indexOf(p);
  const prev = plates.plates[idx - 1] || null;
  const next = plates.plates[idx + 1] || null;
  const lay = p.layout === "flow" ? flowLayout(p) : LAYOUT[p.layout];
  const placed = new Set(lay.items.filter((i) => i.s !== undefined).map((i) => i.s));
  const items = lay.items.slice();
  const maxRow = Math.max(...lay.items.map((i) => i.r || 1));
  p.sections.forEach((s, i) => { if (!placed.has(i) && !s.hidden) items.push({ s: i, r: s.at?.r ?? maxRow + 1 + i, c: s.at?.c || "2/12", mat: s.at?.mat || "newsprint", m: "c", ...(s.at?.w ? { w: s.at.w } : {}) }); });
  const body = items.map((it, i) => placeItem(p, it, i, base)).join("\n");

  const marginal = p.marginal ? `<aside class="ph marginal m-r" style="--c:8/13;--r:${maxRow + p.sections.length + 2};--y:0px;--rot:-1deg;--mw:90%">
    <button class="marginal__btn" type="button" data-marginal aria-controls="marg-${p.id}" aria-expanded="false">${T.marginalBtn(p.letter)}</button>
    <p class="marginal__note" id="marg-${p.id}" tabindex="-1" hidden>${md(p.marginal)}</p>
  </aside>` : "";

  const allSrc = [...new Set([...(p.sources || []), ...p.sections.flatMap((s) => s.sources || [])])].filter((id) => S[id]);
  const words = p.title.split(" ");
  const lead = LANG === "en" && words[0] === "THE" && words.length > 1;
  const hl = p.hl ?? (LANG === "en" && p.id === "k" ? 1 : -1);
  const titleHtml = words.map((w, i) => `<span class="w${i + 1}${i === hl ? " hl" : ""}">${esc(w)}</span>`).join(" ");

  const head = `<header class="head">
  <p class="head__tag">${T.volumeWord} ${p.volume} · ${T.plate} ${p.letter} · ${String(volPos(p)).padStart(2, "0")} / ${String(volPlates(p.volume).length).padStart(2, "0")}</p>
  <h1 class="head__title${lead ? " has-lead" : ""}${words.length === 1 ? " is-one" : ""}">${titleHtml}</h1>
  <p class="head__sub">${esc(p.subtitle)}</p>
  <p class="head__dek">${md(p.dek)}</p>
  <p class="head__lab">${esc(p.period)} · ${esc(p.location)} · ${esc(p.tradition)}</p>
  <span class="head__letter" aria-hidden="true">${p.letter}</span>
</header>`;

  const plateUrl = `${SITE}${LANG === "ru" ? "ru/" : ""}plates/${p.id}-${p.slug}.html`;
  const plateGost = LANG === "ru"
    ? `Археология русской смерти. Лист ${p.letter}: ${p.title}. ${p.subtitle} // Атлас материальной культуры и этнографии погребального обряда / Под ред. проекта «Русская смерть». 2026. URL: ${plateUrl}.`
    : `Archaeology of Russian Death. Plate ${p.letter}: ${p.title}. ${p.subtitle} // An Atlas of Material Culture and Ethnography. 2026. URL: ${plateUrl}.`;
  const plateBibtex = `@misc{rusdeath_${p.id},
  title = {${p.title}: ${p.subtitle}},
  author = {{Archaeology of Russian Death Project}},
  year = {2026},
  howpublished = {\\url{${plateUrl}}},
  note = {Plate ${p.letter}, Volume ${p.volume}}
}`;

  const apparatus = `<details class="apparatus">
  <summary><span>${T.apparatus}</span> ${T.apparatusRest}</summary>
  <div class="apparatus__cols">
    <div>
      <h2>${T.sourcesForPlate}</h2>
      <ol class="platesrc">
        ${allSrc.map((id) => `<li><a href="${srcHref(id, base)}"><span class="mono">${esc(id)}</span> ${esc(S[id].author)} — <em>${esc(S[id].title)}</em> (${esc(S[id].year)})</a></li>`).join("")}
      </ol>
      <p class="apparatus__note">${T.apparatusNote}</p>
    </div>
    <div>
      <h2>${T.relatedPlates}</h2>
      <ul class="related">
        ${(p.related || []).filter((r) => PLATE[r]).map((r) => `<li><a href="${plateHref(r, base)}"><span class="mono">${PLATE[r].letter}</span> ${esc(PLATE[r].nav)}</a></li>`).join("")}
      </ul>
      <h2>${T.termsInPlate}</h2>
      <ul class="related related--terms">
        ${(p.concepts || []).filter((c) => CON[c]).map((c) => `<li><a href="${base}atlas.html#concept-${c}">${esc(CON[c].name)}</a></li>`).join("")}
        ${(p.objects || []).filter((o) => OBJ[o]).map((o) => `<li><a href="${base}atlas.html#object-${o}">${esc(OBJ[o].name)}</a></li>`).join("")}
      </ul>
      <div class="apparatus__citation">
        <h2>${LANG === "ru" ? "Библиографическая ссылка" : "Citation"}</h2>
        <p class="apparatus__gost mono">${esc(plateGost)}</p>
        <div class="bib__actions">
          <button class="bib__btn mono" type="button" data-copy="${esc(plateGost)}">${LANG === "ru" ? "Скопировать ГОСТ" : "Copy GOST"}</button>
          <button class="bib__btn mono" type="button" data-copy="${esc(plateBibtex)}">BibTeX</button>
        </div>
      </div>
    </div>
  </div>
</details>`;

  const pager = `<nav class="pager" aria-label="${T.contents}">
  ${prev ? `<a href="${plateHref(prev.id, base)}" class="pager__a pager__a--prev"><span class="pager__d">${T.pagerPrev}</span><span class="pager__l">${prev.letter}</span><span class="pager__t">${esc(prev.nav)}</span></a>` : `<a href="${base}index.html" class="pager__a pager__a--prev"><span class="pager__d">${T.pagerBack}</span><span class="pager__l">∅</span><span class="pager__t">${T.coverWord}</span></a>`}
  ${next ? `<a href="${plateHref(next.id, base)}" class="pager__a pager__a--next"><span class="pager__d">${T.pagerNext}</span><span class="pager__l">${next.letter}</span><span class="pager__t">${esc(next.nav)}</span></a>` : `<a href="${base}atlas.html" class="pager__a pager__a--next"><span class="pager__d">${T.pagerEnd}</span><span class="pager__l">∞</span><span class="pager__t">${T.pagerTheIndex}</span></a>`}
</nav>`;

  const marks = (lay.marks || []).map((m) => `<span class="hm" style="left:${m.x};top:${m.y};width:${m.w};--rot:${m.rot || 0}deg" aria-hidden="true">${mark(m.id, "mark--red")}</span>`).join("");

  return shell({
    title: `${p.title} — ${LANG === "ru" ? "Лист" : "Plate"} ${p.letter} — ${T.siteTitle}`,
    description: p.dek.replace(/[*`]/g, ""),
    base,
    rel: `plates/${p.id}-${p.slug}.html`,
    social: `social/${LANG === "ru" ? "ru-" : ""}plate-${p.id}.jpg`,
    socialAlt: `${LANG === "ru" ? "Лист" : "Plate"} ${p.letter}: ${p.title}. ${p.subtitle}`.replace(/[*`]/g, ""),
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

// --------------------------------------------------------------- shared ----
const pagehead = (cls, kicker, h1, dek) => `<header class="pagehead ${cls}">
  <p class="mono pagehead__kicker">${kicker}</p>
  <h1 class="pagehead__title">${h1}</h1>
  <p class="pagehead__dek">${dek}</p>
</header>`;
const noteSec = (h, a, b) => `<section class="map-note">
  <h2 class="mono">${h}</h2>
  <div class="index-note__cols"><p>${a}</p><p>${b}</p></div>
</section>`;
const plateLinks = (ids, base, word) => ids.filter((x) => PLATE[x]).map((x) => `<a href="${plateHref(x, base)}">${word ? `${word} ` : ""}${PLATE[x].letter}</a>`);
const thumbFile = (id) => `${UP}${IMG[id] ? IMG[id].file : `assets/derived/${id}.webp`}`;

// --------------------------------------------------------------- index -----
function indexPage() {
  const base = "", X = T.index;
  const cards = plates.plates.map((p, i) => `<li class="card" data-kind="plate" data-theme="${p.category}" data-concepts="${(p.concepts || []).join(" ")}" data-objects="${(p.objects || []).join(" ")}" data-places="${(p.places || []).join(" ")}"
      data-search="${esc(`${p.title} ${p.nav} ${p.dek} ${p.subtitle} ${p.period} ${p.location} ${p.tradition}`.toLowerCase())}">
      <a class="card__link" href="${plateHref(p.id, base)}">
        <span class="card__thumb" aria-hidden="true"><img src="${thumbFile(KEY[p.id])}" alt="" loading="lazy" decoding="async"></span>
        <span class="card__stamp mono" aria-hidden="true">${p.letter}</span>
        <span class="card__no mono">${String(i + 1).padStart(2, "0")}</span>
        <span class="card__title">${esc(p.nav)}</span>
        <span class="card__dek">${esc(p.dek.replace(/[*`]/g, ""))}</span>
        <span class="card__meta mono">${esc(p.period)}<br>${esc(p.location)}</span>
        <span class="card__open mono">${X.open}</span>
      </a>
    </li>`).join("\n");

  const evLabel = (o) => T.evidence[o.evidence] || o.evidence;
  const objectCards = objectsDoc.objects.map((o) => `<li class="card card--sm" data-kind="object" data-search="${esc(`${o.name} ${o.term} ${o.gloss} ${o.description}`.toLowerCase())}" id="object-${o.id}">
    <div class="card__inner">
      <span class="card__no mono">${X.obj}</span>
      <h3 class="card__title">${esc(o.name)} <span class="card__term">${esc(o.term)}</span></h3>
      <p class="card__dek">${md(o.gloss)}</p>
      <p class="card__meta mono">${tag(o.evidence.startsWith("unverified") ? "unverified" : "documented")} ${esc(evLabel(o))}</p>
      <p class="card__links mono">${plateLinks(o.plates, base).join(" ")}</p>
    </div>
  </li>`).join("\n");

  const conceptCards = conceptsDoc.concepts.map((c) => `<li class="card card--sm" data-kind="concept" data-search="${esc(`${c.name} ${c.gloss} ${c.description}`.toLowerCase())}" id="concept-${c.id}">
    <div class="card__inner">
      <span class="card__no mono">${X.con}</span>
      <h3 class="card__title">${esc(c.name)}</h3>
      <p class="card__dek">${md(c.gloss)}</p>
      <p class="card__desc">${md(c.description)}</p>
      <p class="card__links mono">${plateLinks(c.plates, base).join(" ")}</p>
    </div>
  </li>`).join("\n");

  const placeCards = placesDoc.places.map((p) => `<li class="card card--sm" data-kind="place" data-search="${esc(`${p.name} ${p.region} ${p.summary}`.toLowerCase())}" id="place-${p.id}">
    <div class="card__inner">
      <span class="card__no mono">${p.status === "outside-RF" ? X.outside : X.loc}</span>
      <h3 class="card__title">${esc(p.name)}</h3>
      <p class="card__dek">${md(p.summary)}</p>
      <p class="card__meta mono">${LANG === "ru" ? `${p.lat.toFixed(2)} с. ш. / ${p.lon.toFixed(2)} в. д.` : `${p.lat.toFixed(2)} N / ${p.lon.toFixed(2)} E`}</p>
      <p class="card__links mono">${plateLinks(p.plates, base).join(" ")}</p>
    </div>
  </li>`).join("\n");

  const themes = [...new Set(plates.plates.map((p) => p.category))];
  const chip = (label, val) => `<button class="chip mono" type="button" data-filter="${val}" aria-pressed="false">${label}</button>`;

  return shell({
    title: X.title, description: X.desc, base, bodyClass: "index-page", page: "index", rel: "atlas.html",
    content: `<main id="main">
${pagehead("", X.kicker, X.h1, X.dek)}

<section class="catalog" aria-labelledby="catalog-title">
  <h2 id="catalog-title" class="visually-hidden">${X.catalogue}</h2>
  <div class="catalog__controls">
    <div class="tabs" role="tablist" aria-label="${X.tabsLabel}">
      <button role="tab" id="tab-plate" aria-controls="panel-plate" aria-selected="true" class="tab mono" data-tab="plate">${X.tabPlates} <span>${plates.plates.length}</span></button>
      <button role="tab" id="tab-object" aria-controls="panel-object" aria-selected="false" class="tab mono" data-tab="object">${X.tabObjects} <span>${objectsDoc.objects.length}</span></button>
      <button role="tab" id="tab-concept" aria-controls="panel-concept" aria-selected="false" class="tab mono" data-tab="concept">${X.tabConcepts} <span>${conceptsDoc.concepts.length}</span></button>
      <button role="tab" id="tab-place" aria-controls="panel-place" aria-selected="false" class="tab mono" data-tab="place">${X.tabPlaces} <span>${placesDoc.places.length}</span></button>
    </div>
    <div class="search">
      <label class="mono" for="q">${X.searchLabel}</label>
      <input id="q" type="search" name="q" autocomplete="off" placeholder="${X.searchPh}">
    </div>
  </div>

  <div class="filters" id="filters">
    <span class="filters__label mono">${X.theme}</span>
    ${themes.map((t) => chip(T.themes[t] || t.toUpperCase(), `theme:${t}`)).join("")}
    <button class="chip chip--reset mono" type="button" data-reset>${X.all}</button>
  </div>

  <p class="catalog__status mono" role="status" aria-live="polite" id="status">${plates.plates.length} ${X.js.plates}</p>

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
  <p class="catalog__empty mono" id="empty" hidden>${X.empty}</p>
</section>

<section class="index-note">
  <h2 class="mono">${X.howH}</h2>
  <div class="index-note__cols"><p>${X.how1}</p><p>${X.how2}</p></div>
</section>
</main>`,
  });
}

// ----------------------------------------------------------------- map -----
function getRegion(p) {
  if (p.status === "outside-RF") return "diaspora";
  if (p.lat >= 60.0) return "north";
  if (p.lon >= 50.0) return "east";
  return "center";
}

function mapPage() {
  const base = "", X = T.map;
  const geo = readJSON(path.join(DATA, "places.geo.json"));
  const groups = [];
  for (const p of placesDoc.places) {
    let g = groups.find((x) => x.marker === p.marker);
    if (!g) { g = { marker: p.marker, items: [], pos: geo[p.marker] }; groups.push(g); }
    g.items.push(p);
  }
  const pins = groups.map((g, i) => {
    const reg = getRegion(g.items[0]);
    return `<button class="pin" type="button" data-place="${g.marker}" data-region="${reg}" style="--x:${g.pos.x}%;--y:${g.pos.y}%"
      aria-label="${esc(X.pinAria(String(i + 1).padStart(2, "0"), g.items.map((x) => x.name).join(" / ")))}">
      <span class="pin__dot" aria-hidden="true"></span><span class="pin__no mono" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <span class="pin__tip mono pin__tip--${g.pos.x > 70 ? "l" : g.pos.x < 25 ? "r" : "c"}" aria-hidden="true">${esc(g.items.map((x) => x.name).join(" · "))} — ${[...new Set(g.items.flatMap((x) => x.plates))].filter((x) => PLATE[x]).map((x) => PLATE[x].letter).join(" ")}</span>
    </button>`;
  }).join("\n");

  const cards = groups.map((g, i) => {
    const reg = getRegion(g.items[0]);
    return `<li class="place" data-marker="${g.marker}" data-region="${reg}" id="place-card-${g.marker}">
    <p class="place__no mono">${String(i + 1).padStart(2, "0")} — ${g.items[0].status === "outside-RF" ? X.outside : X.inside}</p>
    <h3 class="place__name">${g.items.map((x) => esc(x.name)).join(" · ")}</h3>
    ${g.items.map((x) => `<div class="place__body">
      <p>${md(x.summary)}</p>
      <ul class="place__entries">${x.entries.map((e) => `<li>${md(e)}</li>`).join("")}</ul>
      <p class="place__links mono">${plateLinks(x.plates, base, X.plateLink).join(" · ")}</p>
    </div>`).join("")}
    <p class="place__coords mono">${g.pos ? X.deg(g.items[0].lat.toFixed(2), g.items[0].lon.toFixed(2)) : X.noCoord}</p>
  </li>`;
  }).join("\n");

  return shell({
    title: X.title, description: X.desc, base, bodyClass: "map-page", page: "map", rel: "map.html",
    content: `<main id="main">
${pagehead("pagehead--map", X.kicker, X.h1, X.dek)}

<section class="mapwrap" aria-labelledby="map-title">
  <h2 id="map-title" class="visually-hidden">${X.h2}</h2>
  <div class="map-filters" role="group" aria-label="${LANG === 'ru' ? 'Фильтр по регионам' : 'Region filter'}">
    <button class="chip mono" type="button" data-region-filter="all" aria-pressed="true">${LANG === 'ru' ? 'ВСЕ РЕГИОНЫ' : 'ALL REGIONS'}</button>
    <button class="chip mono" type="button" data-region-filter="north" aria-pressed="false">${LANG === 'ru' ? 'СЕВЕР И КАРЕЛИЯ' : 'NORTH & KARELIA'}</button>
    <button class="chip mono" type="button" data-region-filter="center" aria-pressed="false">${LANG === 'ru' ? 'ЦЕНТР И ПОВОЛЖЬЕ' : 'CENTER & VOLGA'}</button>
    <button class="chip mono" type="button" data-region-filter="east" aria-pressed="false">${LANG === 'ru' ? 'СИБИРЬ И ВОСТОК' : 'SIBERIA & EAST'}</button>
    <button class="chip mono" type="button" data-region-filter="diaspora" aria-pressed="false">${LANG === 'ru' ? 'ЗАРУБЕЖЬЕ И ДИАСПОРА' : 'DIASPORA'}</button>
  </div>
  <div class="mapwrap__grid">
    <div class="map-plane">
      <img class="map-plane__geo" src="${UP}assets/illustrations/map-eurasia.svg" alt="" aria-hidden="true">
      ${pins}
      <p class="map-plane__scale mono" aria-hidden="true">${X.scale}</p>
      <p class="map-plane__credit mono">${X.credit}</p>
    </div>
    <div class="gazetteer">
      <p class="mono gazetteer__lead">${X.gaz}</p>
      <ol class="places">${cards}</ol>
    </div>
  </div>
</section>

${noteSec(X.notH, X.not1, X.not2)}
</main>`,
  });
}

// ----------------------------------------------------------- chronology ----
function chronologyPage() {
  const base = "", X = T.chrono;
  const eras = ["pre-imperial", "imperial", "soviet", "post-soviet"];
  const entries = timelineDoc.entries.slice().sort((a, b) => a.sort - b.sort).map((e) => `<li class="tl__item tl__item--${e.kind}" data-era="${e.era}">
    <p class="tl__date mono">${esc(e.display)}</p>
    <p class="tl__era mono">${esc(T.eras[e.era] || e.era.toUpperCase())}</p>
    <h3 class="tl__title">${md(e.title)}</h3>
    <p class="tl__text">${md(e.text)}</p>
    <p class="tl__links mono">${plateLinks(e.plates || [], base, X.plateLink).join(" · ")} ${e.confidence ? `— <span class="tl__conf">${esc(e.confidence)}</span>` : ""}</p>
  </li>`).join("\n");

  return shell({
    title: X.title, description: X.desc, base, bodyClass: "chrono-page", page: "chronology", rel: "chronology.html",
    content: `<main id="main">
${pagehead("pagehead--chrono", X.kicker, X.h1, X.dek)}

<section class="tl" aria-labelledby="tl-title">
  <h2 id="tl-title" class="visually-hidden">${X.h2}</h2>
  <div class="tl__filters" role="group" aria-label="${X.filterLabel}">
    <button class="chip mono" type="button" data-era-filter="all" aria-pressed="true">${X.all}</button>
    ${eras.map((v) => `<button class="chip mono" type="button" data-era-filter="${v}" aria-pressed="false">${T.eras[v]}</button>`).join("")}
  </div>
  <p class="catalog__status mono" role="status" aria-live="polite" id="tlstatus">${timelineDoc.entries.length} ${X.entries}</p>
  <ol class="tl__list" id="tl-list">${entries}</ol>
</section>

${noteSec(X.notH, X.not1, X.not2)}
</main>`,
  });
}

// ----------------------------------------------------------- bibliography --
function formatGOST(s) {
  const ext = s.extent ? ` — ${s.extent}.` : "";
  const titEn = s.title_en ? ` [${s.title_en}]` : "";
  return `${s.author} ${s.title}${titEn}. — ${s.publisher}, ${s.year}.${ext} — URL: ${s.url} (дата обращения: ${s.accessed}).`;
}

function formatBibTeX(s) {
  const type = s.kind === "monograph" ? "book" : s.kind === "article" ? "article" : "misc";
  return `@${type}{${s.id},\n  author = {${s.author}},\n  title = {${s.title}},\n  year = {${s.year}},\n  publisher = {${s.publisher}},\n  url = {${s.url}},\n  note = {Accessed: ${s.accessed}}\n}`;
}

function bibliographyPage() {
  const base = "", X = T.bib;
  const sorted = sourcesDoc.entries.slice().sort((a, b) => a.author.localeCompare(b.author, LANG));
  const used = (id) => plates.plates.filter((p) => (p.sources || []).includes(id) || p.sections.some((s) => (s.sources || []).includes(id)));
  const items = sorted.map((s, i) => `<li class="bib" id="src-${s.id}">
    <p class="bib__no mono">S${String(i + 1).padStart(2, "0")} <span class="bib__kind">${esc(T.kinds[s.kind] || s.kind.toUpperCase())}</span></p>
    <p class="bib__cite"><span class="bib__author">${esc(s.author)}</span> <em>${esc(s.title)}</em>${s.title_en ? ` [${esc(s.title_en)}]` : ""}. ${esc(s.publisher)}, ${esc(s.year)}.${s.extent ? ` ${esc(s.extent)}.` : ""}</p>
    <p class="bib__url mono"><a href="${esc(s.url)}" rel="noopener">${esc(s.url)}</a> — ${X.accessed} ${esc(s.accessed)}.</p>
    <p class="bib__use"><span class="mono">${X.usedFor}</span> ${md(s.supports)}</p>
    <p class="bib__lim"><span class="mono">${X.limitation}</span> ${md(s.limitation)}</p>
    <p class="bib__plates mono">${plateLinks(used(s.id).map((p) => p.id), base, X.plateLink).join(" · ") || X.general}</p>
    <div class="bib__actions">
      <button class="bib__btn mono" type="button" data-copy="${esc(formatGOST(s))}">${LANG === "ru" ? "Скопировать ГОСТ" : "Copy GOST"}</button>
      <button class="bib__btn mono" type="button" data-copy="${esc(formatBibTeX(s))}">BibTeX</button>
    </div>
  </li>`).join("\n");

  const imgItems = imagesDoc.images.map((im) => `<li class="bib bib--img">
    <p class="bib__no mono">${esc(im.id.toUpperCase())}</p>
    <p class="bib__cite">${esc(im.creator)}. <em>${esc(im.title)}</em>${im.date ? `, ${esc(im.date)}` : ""}. ${esc(im.medium || "")}${im.collection && im.collection !== "—" ? `. ${esc(im.collection)}` : ""}.</p>
    <p class="bib__lic mono">${esc(im.license)}${im.license_url ? ` — <a href="${esc(im.license_url)}" rel="noopener">${esc(im.license_url)}</a>` : ""}</p>
    <p class="bib__url mono">${im.source_page && /^https?:/.test(im.source_page) ? `<a href="${esc(im.source_page)}" rel="noopener">${esc(im.source_page)}</a>` : esc(im.source_page || "—")}</p>
    <p class="bib__lim">${esc(im.note)}</p>
  </li>`).join("\n");

  return shell({
    title: X.title, description: X.desc, base, bodyClass: "bib-page", page: "bibliography", rel: "bibliography.html",
    content: `<main id="main">
${pagehead("pagehead--bib", X.kicker, X.h1, X.dek)}

<section class="bib-wrap">
  <h2 class="mono bib-wrap__h">${X.h2a(sorted.length)}</h2>
  <ol class="biblio">${items}</ol>
</section>

<section class="bib-wrap">
  <h2 class="mono bib-wrap__h">${X.h2b(imagesDoc.images.length)}</h2>
  <p class="bib__intro">${X.imgIntro}</p>
  <ol class="biblio biblio--img">${imgItems}</ol>
</section>

${noteSec(X.notH, X.not1, X.not2)}
</main>`,
  });
}

// ------------------------------------------------------------------ 404 ----
function notFound() {
  const base = "", X = T.nf;
  const plateMap = Object.fromEntries(plates.plates.map((p) => [p.id, `${p.id}-${p.slug}.html`]));
  const knownPages = ["index", "prologue", "volumes", "search", "ledger", "routes", "archive", "atlas", "map", "chronology", "words", "voices", "bibliography", "method", "colophon"];
  const redirectScript = `<script>
(function() {
  try {
    var p = window.location.pathname || "";
    var isRu = /(?:^|\\/)ru(?:\\/|$)/i.test(p);
    var segs = p.replace(/\\/+$/, "").split("/").filter(Boolean);
    if (!segs.length) return;
    var last = segs[segs.length - 1].toLowerCase().replace(/\\.html$/, "");
    var plates = ${JSON.stringify(plateMap)};
    var pages = ${JSON.stringify(knownPages)};
    var m = p.match(/^(.*?)(?:ru\\/)?(?:plates\\/)?[^\\/]*$/);
    var root = (m && m[1]) || "/";
    if (!root.endsWith("/")) root += "/";
    var langPre = isRu ? "ru/" : "";
    if (plates[last]) {
      window.location.replace(root + langPre + "plates/" + plates[last] + window.location.search + window.location.hash);
      return;
    }
    if (pages.indexOf(last) !== -1) {
      window.location.replace(root + langPre + last + ".html" + window.location.search + window.location.hash);
      return;
    }
  } catch (e) {}
})();
</script>`;

  const ru = LANG === "en" ? `<p class="nf__text nf__text--ru" lang="ru">Такой страницы в архиве нет. <a href="ru/atlas.html">Указатель</a> · <a href="ru/index.html">обложка</a></p>` : "";

  const metaLinks = [
    { href: "index.html", t: X.cover || T.coverWord || "COVER" },
    { href: "volumes.html", t: T.nav.volumes || "VOLUMES" },
    { href: "atlas.html", t: T.nav.index || "INDEX" },
    { href: "voices.html", t: T.nav.voices || "VOICES" },
    { href: "ledger.html", t: T.nav.ledger || "LEDGER" },
    { href: "routes.html", t: T.nav.routes || "ROUTES" },
    { href: "archive.html", t: T.nav.archive || "ARCHIVE" },
    { href: "map.html", t: T.nav.map || "MAP" },
    { href: "chronology.html", t: T.nav.chrono || "CHRONOLOGY" },
    { href: "words.html", t: T.nav.words || "LEXICON" },
    { href: "search.html", t: T.nav.search || "SEARCH" },
    { href: "bibliography.html", t: T.nav.sources || "SOURCES" },
    { href: "method.html", t: T.nav.method || "METHOD" },
    { href: "colophon.html", t: T.colophon || "COLOPHON" },
  ];

  const dirHeading = LANG === "ru" ? "ВСЕ 26 ЛИСТОВ АТЛАСА (A–Z)" : "ALL 26 ATLAS PLATES (A–Z)";
  const navHeading = LANG === "ru" ? "РАЗДЕЛЫ АТЛАСА" : "ATLAS SECTIONS";

  const content = `<main id="main" class="nf">
  <p class="mono nf__kicker">${X.kicker}</p>
  <h1 class="nf__title">${X.h1}</h1>
  <p class="nf__text">${X.text}</p>
  ${ru}
  <nav class="nf__meta-nav mono" aria-label="${navHeading}">
    ${metaLinks.map((l) => `<a href="${l.href}">${esc(l.t)}</a>`).join("\n    ")}
  </nav>
  <section class="nf__dir">
    <h2 class="mono nf__dir-h">${dirHeading}</h2>
    <ol class="nf__grid">
      ${plates.plates.map((p) => `<li><a href="${plateHref(p.id, base)}"><span class="nf__grid-letter">${p.letter}.</span> <span>${esc(p.nav)}</span></a></li>`).join("\n      ")}
    </ol>
  </section>
</main>`;

  return shell({
    title: X.title, description: X.desc, base, bodyClass: "nf-page", page: "404", rel: "404.html",
    extraHead: redirectScript,
    content,
  });
}

// ---------------------------------------------------------------- method ---
function methodPage() {
  const base = "", X = T.method, m = methodDoc;
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "method-page", page: "method", rel: "method.html",
    content: `<main id="main">
${pagehead("pagehead--method", X.kicker, X.h1, esc(m.dek))}

<div class="method">
  ${m.sections.map((s) => `<section class="method__sec">
    <p class="mono method__kicker">${esc(s.kicker)}</p>
    <h2 class="method__h">${md(s.heading)}</h2>
    <div class="method__body">${s.paras.map((p) => `<p>${md(p)}</p>`).join("")}</div>
    ${s.list ? `<ul class="method__list">${s.list.map((i) => `<li>${md(i)}</li>`).join("")}</ul>` : ""}
  </section>`).join("\n")}
  <aside class="method__levels" aria-label="${X.levelsAria}">
    <h2 class="mono">${X.levels}</h2>
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
  const base = "", X = T.colo;
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "colophon-page", page: "colophon", rel: "colophon.html",
    content: `<main id="main">
${pagehead("pagehead--colo", X.kicker, X.h1, X.dek)}

<div class="colophon">
  ${X.secs.map(([h, body]) => `<section class="colo-sec"><h2 class="mono">${h}</h2>${body}</section>`).join("\n  ")}
  <img class="colo-mark" src="${UP}assets/illustrations/colophon-mark.svg" alt="" aria-hidden="true">
</div>
</main>`,
  });
}

// -------------------------------------------------------------- prologue ---
function prologuePage() {
  const base = "", X = T.prologue, d = prologueDoc;
  const sheet = (b, i) => {
    const t = torn(`prologue-${i}`, "tb", 10);
    return `<div class="sw" style="--ca:${t.a};--cb:${t.b}"><div class="sheet mat-${b.mat || "newsprint"}">
        <p class="k">${esc(b.k)}</p>
        ${b.paras.map((p) => `<p>${md(p)}</p>`).join("\n")}
      </div></div>`;
  };
  const blocks = d.blocks.map((b, i) => `<section class="pro pro--${i + 1} pro--${b.side || "l"}" aria-labelledby="pro-h${i}">
    <figure class="pro__art">${photoFig(b.art, base, { tape: b.tape || "", note: b.note || "", tr: b.tr || "" })}</figure>
    <h2 class="pro__stmt" id="pro-h${i}">${md(b.head)}</h2>
    <div class="pro__sheet">${sheet(b, i)}</div>
  </section>`).join("\n");
  const routes = d.routes.items.map((r, i) => {
    const t = torn(`route-${i}`, "tblr", 7);
    return `<li class="route route--${i + 1}"><a href="${r.href}"><span class="sw" style="--ca:${t.a};--cb:${t.b}"><span class="sheet mat-${["newsprint", "manila", "plaster"][i % 3]}">
      <span class="route__n">${esc(r.n)}</span><span class="route__h">${esc(r.head)}</span><span class="route__t">${esc(r.text)}</span></span></span></a></li>`;
  }).join("");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "prologue-page g-soot", page: "prologue", rel: "prologue.html",
    content: `<main id="main" class="prologue">
  <header class="pro-head">
    <p class="mono pro-head__kicker">${esc(d.kicker)}</p>
    <h1 class="pro-head__title">${d.title.split("\n").map((l) => `<span>${esc(l)}</span>`).join("")}</h1>
    <p class="pro-head__dek">${md(d.dek)}</p>
  </header>
  ${blocks}
  <section class="pro-routes" aria-labelledby="pro-routes-h">
    <h2 id="pro-routes-h" class="pro-routes__h">${esc(d.routes.head)}</h2>
    <ul class="route-list">${routes}</ul>
  </section>
  <p class="pro-close"><span>${md(d.closing)}</span></p>
</main>`,
  });
}

// ----------------------------------------------------------------- words ---
function wordsPage() {
  const base = "", X = T.words, d = lexiconDoc;
  const entries = d.entries.slice().sort((a, b) => a.ru.localeCompare(b.ru, "ru"));
  const slips = entries.map((e, i) => {
    const t = torn(`word-${e.id}`, "tblr", 6);
    return `<li class="word word--${(i % 5) + 1}" id="word-${e.id}" style="--rot:${((hash(e.id) % 70) - 35) / 20}deg">
    <div class="sw" style="--ca:${t.a};--cb:${t.b}"><div class="sheet mat-${["newsprint", "manila", "plaster", "linen", "newsprint"][i % 5]}">
      <p class="word__ru" lang="ru">${esc(e.ru)}</p>
      <p class="word__tr mono">${esc(e.tr)}</p>
      <p class="word__gloss">${md(e.gloss)}</p>
      ${e.register ? `<p class="word__reg mono">${esc(e.register)}</p>` : ""}
      <p class="word__plates mono">${plateLinks(e.plates || [], base, LANG === "ru" ? "ЛИСТ" : "PLATE").join(" · ")}</p>
    </div></div>
  </li>`;
  }).join("\n");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "words-page", page: "words", rel: "words.html",
    content: `<main id="main">
${pagehead("pagehead--words", esc(d.kicker), esc(d.title).replace(/\n/g, "<br>"), md(d.dek))}
<ol class="wordwall">${slips}</ol>
<section class="map-note"><h2 class="mono">${esc(d.noteH)}</h2><div class="index-note__cols"><p>${md(d.note1)}</p><p>${md(d.note2)}</p></div></section>
</main>`,
  });
}


// ---------------------------------------------------------------- voices ---
function voicesPage() {
  const base = "", X = T.voices;
  const list = VOICES.filter((v) => PLATE[v.plate]);
  const slips = list.map((v, i) => {
    const p = PLATE[v.plate];
    const t = torn(`voice-${v.id}`, "tblr", 6);
    const genre = LANG === "ru" ? (v.genre_ru || v.genre) : v.genre;
    const title = LANG === "ru" ? (v.title_ru || v.title) : v.title;
    const alt = LANG === "ru" ? (v.title && v.title !== v.title_ru ? v.title : "") : (v.title_ru || "");
    const bits = [genre, v.place, v.date_recorded || v.date_published, v.author, v.collector].filter(Boolean).map((x) => esc(x));
    const status = v.status === "complete" ? T.voice.complete : T.voice.excerpt;
    return `<li class="word word--${(i % 5) + 1}" id="v-${v.id}" style="--rot:${((hash(v.id) % 70) - 35) / 20}deg">
    <div class="sw" style="--ca:${t.a};--cb:${t.b}"><div class="sheet mat-${["newsprint", "manila", "plaster", "linen", "newsprint"][i % 5]}">
      <p class="word__ru" lang="${LANG === "ru" ? "ru" : "en"}">${esc(title)}</p>
      ${alt ? `<p class="word__tr mono">${esc(alt)}</p>` : ""}
      <p class="word__gloss">${bits.join(" · ")}</p>
      <p class="word__reg mono">${esc(status)}</p>
      <p class="word__plates mono"><a href="plates/${p.id}-${p.slug}.html#voice-${v.id}">${LANG === "ru" ? "ЛИСТ" : "PLATE"} ${p.letter}</a></p>
    </div></div>
  </li>`;
  }).join("\n");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "words-page", page: "voices", rel: "voices.html",
    content: `<main id="main">
${pagehead("pagehead--words", esc(X.kicker), X.h1, esc(X.dek))}
<ol class="wordwall">${slips}</ol>
<section class="map-note"><p>${esc(X.note)}</p></section>
</main>`,
  });
}

// ---------------------------------------------- search, ledger, routes ------
const plain = (t) => String(t).replace(/[*`_]/g, "").replace(/\s+/g, " ").trim();
const collect = (v, out = []) => {
  if (typeof v === "string") out.push(plain(v));
  else if (Array.isArray(v)) v.forEach((x) => collect(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["type", "level", "sources", "src", "credit", "hidden", "size", "show"].includes(k)) collect(x, out);
  return out;
};
function searchIndex() {
  const rows = [];
  for (const p of plates.plates) {
    for (const s of p.sections) {
      if (s.hidden || s.type === "figure" || s.type === "text") continue;
      const text = collect(s).join(" ");
      if (!text) continue;
      rows.push(["section", `${p.letter} · ${plain(s.heading || s.kicker || p.nav)}`, `plates/${p.id}-${p.slug}.html`, text]);
    }
  }
  for (const v of VOICES) {
    const p = plates.plates.find((x) => x.id === v.plate);
    if (!p) continue;
    rows.push(["voice", `${v.title} · ${v.title_ru}`, `plates/${p.id}-${p.slug}.html#voice-${v.id}`,
      plain(`${v.first_line || ""} ${v.genre || ""} ${v.place || ""} ${(v.context || []).join(" ")} ${(LANG === "en" ? v.translation : v.translation_ru || []).flat().join(" ")} ${v.original.flat().join(" ")}`)]);
  }
  if (lexiconDoc) for (const e of lexiconDoc.entries) rows.push(["word", `${e.ru} · ${e.tr}`, `words.html#word-${e.id}`, plain(e.gloss)]);
  for (const e of timelineDoc.entries) rows.push(["time", `${e.display} · ${plain(e.title)}`, "chronology.html", plain(e.text)]);
  for (const o of objectsDoc.objects) rows.push(["object", `${o.name} · ${o.term}`, `atlas.html#object-${o.id}`, plain(`${o.gloss} ${o.description}`)]);
  for (const c of conceptsDoc.concepts) rows.push(["object", c.name, `atlas.html#concept-${c.id}`, plain(`${c.gloss} ${c.description}`)]);
  for (const pl of placesDoc.places) rows.push(["place", `${pl.name} · ${pl.region}`, `atlas.html#place-${pl.id}`, plain(pl.summary)]);
  for (const s of sourcesDoc.entries) rows.push(["source", `${s.author} · ${plain(s.title)}`, `bibliography.html#src-${s.id}`, plain(`${s.title_en || ""} ${s.publisher} ${s.year} ${s.supports} ${s.limitation}`)]);
  return rows;
}

function searchPage() {
  const base = "", X = T.search;
  const chips = Object.entries(X.kinds).map(([k, v]) => `<button class="chip" type="button" data-kind-chip="${k}" aria-pressed="true">${v}</button>`).join("\n");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "tool-page", page: "search", rel: "search.html",
    content: `<main id="main">
${pagehead("pagehead--bib", X.kicker, X.h1, X.dek)}
<section class="tool" data-search-app data-index="search-index.json" data-idle="${esc(X.idle)}" data-empty="${esc(X.empty)}" data-found="${esc(X.found)}" data-kinds="${esc(JSON.stringify(X.kinds))}">
  <label class="tool__label mono" for="sq">${X.label}</label>
  <input class="tool__input" id="sq" type="search" placeholder="${esc(X.placeholder)}" autocomplete="off" spellcheck="false">
  <div class="tool__chips" role="group" aria-label="${esc(X.kindsLabel)}">${chips}</div>
  <p class="catalog__status mono" id="sstatus" role="status" aria-live="polite">${X.idle}</p>
  <ol class="sres-list" id="sresults"></ol>
  <noscript><p>${X.noscript}</p></noscript>
</section>
<section class="map-note"><h2 class="mono">${X.toolsH}</h2><div class="index-note__cols"><p><a href="ledger.html">${X.ledger}</a></p><p><a href="routes.html">${X.routes}</a></p></div></section>
</main>
<script src="js/search.js" defer></script>`.replace('src="js/search.js"', `src="${UP}js/search.js"`),
  });
}

function ledgerPage() {
  const base = "", X = T.ledger;
  const rows = [];
  for (const p of plates.plates) for (const s of p.sections) {
    if (s.hidden || s.type === "figure" || s.type === "quote") continue;
    rows.push({ p, s, level: s.level || "interpretation" });
  }
  const count = (l) => rows.filter((r) => r.level === l).length;
  const isTab = (r) => r.s.type === "table" || r.s.type === "register";
  const noSrc = rows.filter((r) => !r.s.editorial && !isTab(r) && !(r.s.sources || []).length).length;
  const chips = [`<button class="chip" type="button" data-level-chip="all" aria-pressed="true">${X.all}</button>`,
    ...Object.keys(T.tags).map((l) => `<button class="chip" type="button" data-level-chip="${l}" aria-pressed="false">${T.tags[l]} · ${count(l)}</button>`)].join("\n");
  const body = rows.map((r) => `<tr data-level="${r.level}"><td class="mono"><a href="${plateHref(r.p.id, base)}">${r.p.letter}</a></td><td>${esc(plain(r.s.heading || r.s.caption || r.s.kicker || r.s.type))}</td><td>${tag(r.level, r.s.contested)}</td><td class="mono">${srcBadge(r.s.sources, base) || (r.s.editorial ? `<span>${X.editorial}</span>` : isTab(r) ? `<span>${X.tableCell}</span>` : `<span class="ledger__none">${X.none}</span>`)}</td></tr>`).join("\n");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "tool-page", page: "ledger", rel: "ledger.html",
    content: `<main id="main">
${pagehead("pagehead--bib", X.kicker, X.h1, X.dek)}
<section class="tool">
  <div class="tool__chips" role="group" aria-label="${esc(X.filterLabel)}">${chips}</div>
  <p class="catalog__status mono" id="lstatus" role="status" aria-live="polite" data-of="${X.of}">${rows.length} ${X.counts} · ${noSrc} ${X.none}</p>
  <div class="ledger__wrap"><table class="ledger" data-ledger><thead><tr><th>${X.plate}</th><th>${X.section}</th><th>${X.level}</th><th>${X.sources}</th></tr></thead><tbody>
${body}
</tbody></table></div>
</section>
${noteSec(X.noteH, X.note1, X.note2)}
</main>
<script src="${UP}js/search.js" defer></script>`,
  });
}

function archivePage() {
  const base = "", X = T.archive;
  const originals = imagesDoc.images.filter((i) => i.kind !== "derivative");
  const usedBy = {};
  for (const p of plates.plates) {
    const ids = new Set();
    const hay = JSON.stringify(p.sections.map((q) => q.src || null)) + JSON.stringify(LAYOUT[p.layout] || "") + " " + (KEY[p.id] || "");
    for (const im of imagesDoc.images) if (hay.includes(`"${im.id}"`) || hay.includes(`a:"${im.id}"`) || (KEY[p.id] === im.id)) ids.add(origOf(im.id).id);
    for (const [k, v] of Object.entries(FIGMAP)) if (hay.includes(`"${k}"`) && IMG[v]) ids.add(origOf(v).id);
    for (const id of ids) (usedBy[id] = usedBy[id] || []).push(p.id);
  }
  const kinds = ["photograph", "painting", "icon", "print", "plate", "plan", "diagram"];
  const derivs = (id) => imagesDoc.images.filter((i) => i.parent === id).length;
  const localizeArchive = (s) => {
    if (LANG !== "ru" || !s) return s;
    let r = s;
    r = r.replace(/^Photograph\b/i, "Фотография")
         .replace(/^Photographic print on a carte-de-visite mount/i, "Фотоотпечаток на визитной карточке")
         .replace(/^Photograph of a museum object/i, "Фотография музейного предмета")
         .replace(/^Photograph \(negative scan\)/i, "Фотография (скан негатива)")
         .replace(/^Photograph \(Wiki Loves Monuments \d+\)/i, "Фотография (конкурс «Вики любит памятники»)")
         .replace(/^Painting; reproduction/i, "Картина (репродукция)")
         .replace(/^Oil painting/i, "Масляная живопись")
         .replace(/^Oil on canvas/i, "Холст, масло")
         .replace(/^Tempera on wood/i, "Дерево, темпера")
         .replace(/^Hand-made lubok/i, "Народный лубок")
         .replace(/^Hand-coloured popular print/i, "Раскрашенная гравюра (лубок)")
         .replace(/^Woodcut lubok/i, "Ксилографический лубок")
         .replace(/^Engraving in an illustrated magazine; reproduction/i, "Гравюра в журнале (репродукция)")
         .replace(/^Wood engraving/i, "Гравюра на дереве")
         .replace(/^Vector drawing \(SVG\)/i, "Векторный чертёж (SVG)")
         .replace(/^Digital photograph/i, "Цифровая фотография")
         .replace(/^Stereograph, one print/i, "Стереопара, фотоотпечаток")
         .replace(/^Satellite image/i, "Спутниковый снимок")
         .replace(/^Unknown photographer\b/i, "Неизвестный фотограф")
         .replace(/^Unknown icon painter\b/i, "Неизвестный иконописец")
         .replace(/^Unknown artist\b/i, "Неизвестный художник")
         .replace(/Wikimedia Commons contributor \(released CC0\)/i, "Участник Викисклада (CC0)")
         .replace(/Attribution required; adaptation permitted under the same licence\./gi, "Требуется указание авторства; производные произведения под той же лицензией.")
         .replace(/Attribution required; adaptation permitted under the same license \(CC BY-SA 3\.0\)\./gi, "Требуется указание авторства; производные произведения под той же лицензией (CC BY-SA 3.0).")
         .replace(/Attribution required; adaptation permitted under the same license \(CC BY-SA 4\.0\)\./gi, "Требуется указание авторства; производные произведения под той же лицензией (CC BY-SA 4.0).")
         .replace(/Attribution required; adaptation \(cropping\) permitted under the same licence\./gi, "Требуется указание авторства; кадрирование разрешено лицензией.")
         .replace(/Attribution required; share-alike applies to adaptations\./gi, "Требуется указание авторства; сохранение условий лицензии для производных работ.")
         .replace(/Attribution required\./gi, "Требуется указание авторства.")
         .replace(/Released to the public domain \(CC0\); credit given as courtesy\./gi, "Передано в общественное достояние (CC0); авторство указано из вежливости.")
         .replace(/No attribution required; credited anyway\./gi, "Указание авторства не требуется; указано добровольно.")
         .replace(/Public domain in the United States and Russia\./gi, "Общественное достояние в России и США.")
         .replace(/The reproduction is a photographic copy of a two-dimensional public-domain work\./gi, "Репродукция двухмерного произведения искусства в общественном достоянии.")
         .replace(/The reproduction is a photographic copy of a two-dimensional work of art in the public domain\./gi, "Репродукция двухмерного произведения искусства в общественном достоянии.");
    return r;
  };
  const card = (im) => `<li class="arch" id="arch-${im.id}"><h3 class="arch__t">${esc((LANG === "ru" && im.title_ru) || im.title)}</h3>
  <p class="arch__m mono">${esc(localizeArchive(im.creator || ""))} · ${esc(im.date || "")}${im.collection ? ` · ${esc(im.collection)}` : ""}</p>
  <p class="arch__m mono">${esc(localizeArchive(im.medium || ""))}${im.class ? ` · ${esc(X.classes[im.class] || im.class)}` : ""}</p>
  <p class="arch__n">${esc(localizeArchive(im.note || ""))}</p>
  <p class="arch__l mono">${im.license_url ? `<a href="${im.license_url}" rel="noopener">${esc(im.license)}</a>` : esc(im.license || "")}${im.source_page && /^https?:/.test(im.source_page) ? ` · <a href="${im.source_page}" rel="noopener">${X.source}</a>` : ""}${derivs(im.id) ? ` · ${derivs(im.id)} ${X.derived}` : ""}</p>
  <p class="arch__p mono">${(usedBy[im.id] || []).map((id) => `<a href="${plateHref(id, base)}">${PLATE[id].letter}</a>`).join(" · ") || X.unused}</p></li>`;
  const groups = kinds.map((k) => ({ k, items: originals.filter((i) => i.kind === k) })).filter((g) => g.items.length)
    .map((g) => `<section class="arch-group"><h2 class="mono arch-group__h">${X.kinds[g.k]} · ${g.items.length}</h2><ol class="arch-list">${g.items.map(card).join("\n")}</ol></section>`).join("\n");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "tool-page", page: "archive", rel: "archive.html",
    content: `<main id="main">
${pagehead("pagehead--bib", X.kicker, X.h1, X.dek)}
<section class="tool"><p class="mono">${originals.length} ${X.count} · ${imagesDoc.images.length - originals.length} ${X.derivedAll}</p>
${groups}</section>
${noteSec(X.noteH, X.note1, X.note2)}
</main>`,
  });
}

function routesPage() {
  const base = "", X = T.routes;
  const list = routesDoc.routes.map((r, i) => `<li class="route"><h2 class="route__title">${esc(r.title)}</h2><p class="route__dek">${esc(r.dek)}</p>
<ol class="route__steps">${r.steps.filter((st) => PLATE[st.plate]).map((st, j) => `<li><a class="route__plate" href="${plateHref(st.plate, base)}"><span class="route__letter">${PLATE[st.plate].letter}</span><span class="route__name">${esc(PLATE[st.plate].nav)}</span></a><span class="route__why">${esc(st.why)}</span></li>`).join("")}</ol></li>`).join("\n");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "tool-page", page: "routes", rel: "routes.html",
    content: `<main id="main">
${pagehead("pagehead--bib", X.kicker, X.h1, X.dek)}
<section class="tool"><ol class="route-list">${list}</ol></section>
${noteSec(X.noteH, X.note1, X.note2)}
</main>`,
  });
}

// ----------------------------------------------------------------- cover ---
// ------------------------------------------------------------- volumes -----
function volumesPage() {
  const base = "", X = T.volumes;
  const statusLabel = { published: X.published, "in-preparation": X.inPrep, planned: X.planned };
  const blocks = volumesDoc.volumes.map((v) => {
    const pub = volPlates(v.id);
    const cards = pub.map((p) => `<li class="vol__plate"><a href="${plateHref(p.id, base)}">
        <span class="vol__thumb" aria-hidden="true"><img src="${thumbFile(KEY[p.id])}" alt="" loading="lazy" decoding="async"></span>
        <span class="vol__letter">${p.letter}</span>
        <span class="vol__ptitle">${esc(p.nav)}</span>
        <span class="vol__pdek">${esc(p.dek.replace(/[*`]/g, ""))}</span>
      </a></li>`).join("\n");
    const lead = (v.planned || []).map((q) => `<li class="vol__lead"><span class="vol__letter vol__letter--dim">${q.letter}</span><span class="vol__ptitle">${esc(q.title)}</span><span class="vol__pdek">${esc(q.scope)}</span><span class="vol__flag mono">${X.lead}</span></li>`).join("\n");
    return `<section class="vol vol--${v.status}" aria-labelledby="vol-${v.id}">
    <header class="vol__head">
      <p class="vol__no mono">${T.volumeWord} ${v.numeral} · <span class="vol__status">${statusLabel[v.status]}</span></p>
      <h2 id="vol-${v.id}" class="vol__title">${esc(v.title)}</h2>
      <p class="vol__sub">${esc(v.subtitle)}</p>
      <p class="vol__dek">${esc(v.dek)}</p>
    </header>
    ${pub.length ? `<ol class="vol__plates">${cards}</ol>` : ""}
    ${lead ? `<ol class="vol__leads" aria-label="${X.leadsLabel}">${lead}</ol>` : ""}
  </section>`;
  }).join("\n");
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "volumes-page", page: "volumes", rel: "volumes.html",
    content: `<main id="main">
${pagehead("", X.kicker, X.h1, X.dek)}
<div class="vols">${blocks}
  <p class="vols__rule mono">${X.rule}</p>
</div>
</main>`,
  });
}

function coverPage() {
  const base = "", X = T.cover;
  const keyThumb = (p) => {
    const id = KEY[p.id], d = DER[id];
    return `<img src="${thumbFile(id)}" alt="" width="${d ? d.w : 800}" height="${d ? d.h : 600}" loading="lazy" decoding="async">`;
  };
  const intro = torn("cover-intro", "tb", 11);
  return shell({
    title: X.title, description: X.desc, base, bodyClass: "cover-page g-soot", page: "cover", rel: "index.html",
    content: `<main id="main" class="cover">
  <section class="cv" aria-label="${T.coverWord}">
    <figure class="cv__ground">${photoFig("hero-tomb", base, { tape: "", note: "" })}</figure>
    <h1 class="cv__title">
      <span class="cv__t1">${X.title1}</span>
      <span class="cv__t2">${X.title2a ? `<i>${X.title2a}</i> ` : ""}<b>${X.title2b}</b></span>
      <span class="cv__t3">${X.title3}</span>
    </h1>
    <figure class="cv__cross">${photoFig("golubets-roof", base, { tape: "tr" })}<span class="hm cv__ring" aria-hidden="true">${mark("ring-a", "mark--red")}</span></figure>
    <figure class="cv__sled">${photoFig("perov-sled", base, { tape: "tl" })}</figure>
    <p class="cv__sub">${X.sub}</p>
    <p class="cv__hand" aria-hidden="true">${X.hand}</p>
    <span class="hm cv__arrow" aria-hidden="true">${mark("arrow-long", "mark--red")}</span>
    <p class="cv__slip">${X.slip}</p>
  </section>

  <section class="cv-intro">
    <div class="cv-intro__sheet sw" style="--ca:${intro.a};--cb:${intro.b}">
      <div class="sheet mat-newsprint">
        <p class="cv-intro__lede">${X.lede}</p>
        <p>${X.p2}</p>
        <p class="cv-intro__rule">${X.rule}</p>
        <nav class="cv-intro__nav" aria-label="${X.waysH}">
          <a href="prologue.html">${X.navPrologue}</a>
          <a href="plates/a-threshold.html">${X.navBegin}</a>
          <a href="volumes.html">${X.navVolumes}</a>
          <a href="atlas.html">${X.navIndex}</a>
          <a href="map.html">${X.navMap}</a>
          <a href="chronology.html">${X.navChrono}</a>
          <a href="words.html">${X.navWords}</a>
          <a href="voices.html">${X.navVoices}</a>
          <a href="routes.html">${X.navRoutes}</a>
          <a href="archive.html">${X.navArchive}</a>
          <a href="ledger.html">${X.navLedger}</a>
          <a href="bibliography.html">${X.navSources}</a>
          <a href="method.html">${X.navMethod}</a>
          <a href="search.html">${X.navSearch}</a>
        </nav>
      </div>
    </div>
  </section>

  <section class="cv-vols" aria-labelledby="cvv">
    <h2 id="cvv" class="cv-vols__h mono">${X.volsH}</h2>
    <ol class="cv-vols__list">
      ${volumesDoc.volumes.filter((v) => volPlates(v.id).length).map((v) => {
        const vp = volPlates(v.id), t = torn(`cover-vol-${v.id}`, "tblr", 8);
        return `<li class="cv-vol"><a href="volumes.html#vol-${v.id}"><span class="sw" style="--ca:${t.a};--cb:${t.b}"><span class="sheet mat-${["newsprint", "manila", "plaster", "linen"][volumesDoc.volumes.indexOf(v) % 4]}">
          <span class="cv-vol__no mono">${T.volumeWord} ${v.numeral}</span>
          <span class="cv-vol__title">${esc(v.title)}</span>
          <span class="cv-vol__sub">${esc(v.subtitle)}</span>
          <span class="cv-vol__n mono">${X.volPlates(vp.length, letterRange(vp))}</span>
          <span class="cv-vol__go mono">${X.volOpen}</span></span></span></a></li>`;
      }).join("\n      ")}
    </ol>
  </section>

  <section class="cv-plates" aria-labelledby="cvp">
    <h2 id="cvp" class="visually-hidden">${X.platesH}</h2>
    ${volumesDoc.volumes.filter((v) => volPlates(v.id).length).map((v) => `<h3 class="cv-plates__vol mono">${T.volumeWord} ${v.numeral} — ${esc(v.title)}</h3>
    <ol>
      ${volPlates(v.id).map((p) => `<li class="cvp cvp--${p.letter.toLowerCase()}"><a href="${plateHref(p.id, base)}">
        <span class="cvp__img">${keyThumb(p)}</span>
        <span class="cvp__l">${p.letter}</span>
        <span class="cvp__t">${esc(p.nav)}</span>
        <span class="cvp__n">${String(plates.plates.indexOf(p) + 1).padStart(2, "0")}</span>
      </a></li>`).join("")}
    </ol>`).join("\n")}
  </section>
</main>`,
  });
}

// ------------------------------------------------------------------ run ----
const PAGES = ["index.html", "prologue.html", "volumes.html", "search.html", "ledger.html", "routes.html", "archive.html", "atlas.html", "map.html", "chronology.html", "words.html", "voices.html", "bibliography.html", "method.html", "colophon.html"];
const sitemapRel = [];
console.log("building");
for (const lang of ["en", "ru"]) {
  loadLang(lang);
  const pre = lang === "ru" ? "ru/" : "";
  console.log(` [${lang}]`);
  write(`${pre}index.html`, coverPage());
  write(`${pre}method.html`, methodPage());
  write(`${pre}volumes.html`, volumesPage());
  write(`${pre}search.html`, searchPage());
  write(`${pre}ledger.html`, ledgerPage());
  write(`${pre}routes.html`, routesPage());
  write(`${pre}archive.html`, archivePage());
  write(`${pre}search-index.json`, JSON.stringify(searchIndex()));
  write(`${pre}atlas.html`, indexPage());
  write(`${pre}map.html`, mapPage());
  write(`${pre}chronology.html`, chronologyPage());
  write(`${pre}bibliography.html`, bibliographyPage());
  write(`${pre}colophon.html`, colophonPage());
  write(`${pre}404.html`, notFound());
  if (prologueDoc) write(`${pre}prologue.html`, prologuePage());
  if (lexiconDoc) write(`${pre}words.html`, wordsPage());
  if (VOICES.length) write(`${pre}voices.html`, voicesPage());
  write(`${pre}plates/index.html`, `<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=../atlas.html">
<link rel="canonical" href="${SITE}${pre}atlas.html">
<script>location.replace("../atlas.html" + location.search + location.hash);</script>
</head>
<body><p>${LANG === "ru" ? "Переход к указателю…" : "Redirecting to Atlas…"}</p></body>
</html>`);
  for (const p of plates.plates) {
    write(`${pre}plates/${p.id}-${p.slug}.html`, renderPlate(p));
    write(`${pre}plates/${p.id}.html`, `<!doctype html>
<html lang="${LANG}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.nav)} — ${esc(T.brand)}</title>
<meta http-equiv="refresh" content="0; url=${p.id}-${p.slug}.html">
<link rel="canonical" href="${SITE}${pre}plates/${p.id}-${p.slug}.html">
<script>location.replace("${p.id}-${p.slug}.html" + location.search + location.hash);</script>
</head>
<body class="nf-page">
<main id="main" class="nf">
  <p class="mono nf__kicker">${esc(p.letter)}</p>
  <h1 class="nf__title">${esc(p.nav)}</h1>
  <p class="nf__text"><a href="${p.id}-${p.slug}.html">${LANG === "ru" ? "Переход к листу…" : "Proceeding to plate…"}</a></p>
</main>
</body>
</html>`);
  }
  if (lang === "en") {
    sitemapRel.push(...PAGES, ...plates.plates.map((p) => `plates/${p.id}-${p.slug}.html`));
  }
}
const today = plates.meta.compiled;
const loc = (r) => SITE + r.replace(/index\.html$/, "");
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapRel.map((r) => `  <url><loc>${loc(r)}</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${loc(r)}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${loc("ru/" + r)}"/></url>
  <url><loc>${loc("ru/" + r)}</loc><lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${loc(r)}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${loc("ru/" + r)}"/></url>`).join("\n")}
</urlset>
`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log("done");
