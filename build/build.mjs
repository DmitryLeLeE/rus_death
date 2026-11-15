// ARCHÆOLOGY OF RUSSIAN DEATH — static generator.
// Reads /data/*.json and writes the atlas as plain HTML for GitHub Pages.
// No runtime dependencies. Run: node build/build.mjs

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const DATA = path.join(ROOT, "data");
const read = (p) => fs.readFileSync(p, "utf8");
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

const S = Object.fromEntries(sourcesDoc.entries.map((s) => [s.id, s]));
const IMG = Object.fromEntries(imagesDoc.images.map((i) => [i.id, i]));
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

const srcList = (ids = []) =>
  ids.filter((id) => S[id]).map((id) => `<a class="srcref" href="#src-${id}">${S[id].author.split(",")[0].split(" (")[0]}</a>`).join(", ");

let figMasks = 0;
const nextMask = () => ["torn-02", "torn-03", "torn-04", "torn-05", "torn-06", "torn-01"][figMasks++ % 6];

const spriteClip = read(path.join(ROOT, "assets/paper/torn-masks.svg"));
const spriteMarks = read(path.join(ROOT, "assets/illustrations/hand-marks.svg"));

const mark = (id, cls = "") => `<svg class="mark ${cls}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;

const plateHref = (id, base) => `${base}plates/${id}-${PLATE[id].slug}.html`;
const srcHref = (id, base) => `${base}bibliography.html#src-${id}`;

const srcBadge = (ids = [], base = "") =>
  ids.filter((i) => S[i]).map((i) => `<a class="badge-src mono" href="${base}bibliography.html#src-${i}" title="${esc(S[i].title)}">${esc(i)}</a>`).join(" ");

// ------------------------------------------------------------- fragments ---
function metaDL(pair, cls = "metaline") {
  const rows = Object.entries(pair).filter(([, v]) => v).map(([k, v]) =>
    `<div class="${cls}"><dt>${esc(k)}</dt><dd>${md(v)}</dd></div>`).join("");
  return `<dl class="meta">${rows}</dl>`;
}

function figure(section, base) {
  const src = section.src;
  const isImage = !!IMG[src];
  if (!isImage) {
    return `<section class="slot slot--figure" data-kind="figure">
  <figure class="diagram">
    <img src="${base}assets/illustrations/${src}.svg" alt="${esc(section.alt || "")}" loading="lazy" decoding="async">
    <figcaption class="mono">${md(section.caption)} ${section.credit ? esc(section.credit) + " · " : ""}${section.level ? tag(section.level) : ""}</figcaption>
  </figure>
</section>`;
  }
  const file = `${base}${IMG[src].file}`;
  const full = file;
  const title = IMG[src].title;
  const mask = section.mask || nextMask();
  const size = section.size || "medium";
  const state = section.state || "document";
  return `<section class="slot slot--figure" data-kind="figure">
  <figure class="figure figure--${size} figure--state-${state}">
    <div class="figure__frame ${mask}">
      <img src="${file}" alt="${esc(section.alt || "")}" loading="lazy" decoding="async">
      <span class="figure__regn" aria-hidden="true"></span>
    </div>
    <figcaption class="figure__cap">
      <span class="figure__txt">${md(section.caption)}</span>
      <span class="figure__credit mono">${esc(section.credit || "")} ${section.level ? tag(section.level) : ""}</span>
      <button class="figure__zoom mono" type="button" data-examine
        data-full="${esc(full)}" data-title="${esc(title)}" data-cap="${esc(section.caption)}"
        data-credit="${esc(section.credit || "")}" data-src="${esc(src)}"
        aria-label="Examine image: ${esc(title).slice(0, 90)}">EXAMINE</button>
    </figcaption>
  </figure>
</section>`;
}

function prose(section, base) {
  return `<section class="slot slot--prose" data-kind="prose">
  <header class="slot__head">
    <p class="kicker mono">${esc(section.kicker || "")}</p>
    <h2 class="slot__title">${md(section.heading)}</h2>
  </header>
  <div class="slot__text">${section.paras.map((p) => `<p>${md(p)}</p>`).join("\n")}</div>
  <p class="slot__foot mono">${section.level ? tag(section.level) : ""} ${srcBadge(section.sources, base)}</p>
</section>`;
}

function record(section, base) {
  return `<section class="slot slot--record" data-kind="record">
  <p class="kicker mono">${esc(section.kicker || "")}</p>
  <h2 class="slot__title">${md(section.heading)}</h2>
  ${section.meta ? metaDL(section.meta, "metal") : ""}
  <div class="slot__text">${(section.paras || []).map((p) => `<p>${md(p)}</p>`).join("\n")}</div>
  <p class="slot__foot mono">${section.level ? tag(section.level) : ""} ${srcBadge(section.sources, base)}</p>
</section>`;
}

function note(section) {
  return `<aside class="slot slot--note" data-kind="note">
  <p class="kicker mono">${esc(section.kicker || "Note")}</p>
  <h2 class="note__title">${md(section.heading)}</h2>
  <ul class="note__list">${(section.items || []).map((i) => `<li>${md(i)}</li>`).join("")}</ul>
  ${section.level ? `<p class="slot__foot mono">${tag(section.level)}</p>` : ""}
</aside>`;
}

function table(section) {
  return `<section class="slot slot--table" data-kind="table">
  <div class="tablewrap" tabindex="0" role="region" aria-label="${esc(section.caption || "Data table")}">
  <table class="datatable">
    <caption>${md(section.caption || "")}</caption>
    <thead><tr>${section.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${section.rows.map((r) => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${md(c)}</th>` : `<td>${md(c)}</td>`).join("")}</tr>`).join("\n")}</tbody>
  </table>
  </div>
</section>`;
}

function register(section) {
  return `<section class="slot slot--register" data-kind="register">
  <p class="kicker mono">${esc(section.kicker || "")}</p>
  <h2 class="slot__title">${md(section.heading)}</h2>
  <div class="tablewrap" tabindex="0" role="region" aria-label="${esc(section.heading || "Register")}">
  <table class="registertable">
    <thead><tr>${section.colhead.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${section.rows.map((r) => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${md(c)}</th>` : `<td>${md(c)}</td>`).join("")}</tr>`).join("\n")}</tbody>
  </table>
  </div>
</section>`;
}

function quote(section) {
  return `<figure class="slot slot--quote" data-kind="quote">
  <blockquote>${md(section.text)}</blockquote>
  <figcaption class="mono">${esc(section.attrib || "")} ${section.level ? tag(section.level) : ""}</figcaption>
</figure>`;
}

function diagram(section) {
  if (section.hidden) return "";
  return `<section class="slot slot--diagram" data-kind="diagram">
  <figure class="diagram">
    <img src="../assets/illustrations/${section.src}.svg" alt="${esc(section.alt || "")}" loading="lazy" decoding="async">
    <figcaption class="mono">${md(section.caption)} ${section.level ? tag(section.level) : ""}</figcaption>
  </figure>
</section>`;
}

function renderSection(s, base, idx) {
  let html = "";
  switch (s.type) {
    case "prose": html = prose(s, base); break;
    case "record": html = record(s, base); break;
    case "note": html = note(s); break;
    case "table": html = table(s); break;
    case "register": html = register(s); break;
    case "quote": html = quote(s); break;
    case "figure": html = figure(s, base); break;
    case "diagram": html = diagram(s); break;
    default: html = "";
  }
  if (!html) return "";
  return html.replace('class="slot', `class="slot slot--i${idx} slot`).replace("<section", `<section data-slot="${idx}"`).replace("<aside", `<aside data-slot="${idx}"`).replace("<figure", `<figure data-slot="${idx}"`);
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
<meta name="color-scheme" content="light">
<link rel="icon" href="${base}assets/illustrations/colophon-mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="${base}css/core.css">
<link rel="stylesheet" href="${base}css/plates.css">
<link rel="stylesheet" href="${base}css/pages.css">
${extraHead}
</head>
<body class="${bodyClass}" data-page="${page}">
<a class="skip" href="#main">Skip to the atlas content</a>
${spriteClip}
${spriteMarks}
<header class="masthead">
  <a class="brand" href="${base}index.html">
    <span class="brand__name">ARCHÆOLOGY</span><span class="brand__of">of</span><span class="brand__name">RUSSIAN DEATH</span>
  </a>
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
  <div class="sitefoot__row">
    <p class="mono">ARCHÆOLOGY OF RUSSIAN DEATH — ${esc(plates.meta.edition)}</p>
    <p class="mono">COMPILED ${esc(plates.meta.compiled)} · <a href="${base}colophon.html">COLOPHON</a> · <a href="${base}bibliography.html">SOURCES</a></p>
  </div>
  <p class="sitefoot__note">A research publication in twelve plates. Documentation is separated from interpretation and reconstruction throughout.</p>
</footer>
<dialog id="contents-dialog" class="contents" aria-labelledby="contents-title">
  <div class="contents__head">
    <h2 id="contents-title">CONTENTS</h2>
    <button class="contents__close mono" type="button" data-menu-close>CLOSE</button>
  </div>
  <ol class="contents__list">
    ${plates.plates.map((p) => `<li><a href="${plateHref(p.id, base)}"><span class="contents__letter mono">${p.letter}</span><span class="contents__title">${esc(p.nav)}</span><span class="contents__pg mono">${String(plates.plates.indexOf(p) + 1).padStart(2, "0")}</span></a></li>`).join("\n")}
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
    <p id="fv-title" class="mono">IMAGE</p>
    <div class="figureview__tools">
      <button type="button" data-zoom-toggle aria-pressed="false">ZOOM</button>
      <button type="button" data-close>CLOSE</button>
    </div>
  </div>
  <div class="figureview__stage"><img alt="" src=""></div>
  <div class="figureview__cap">
    <p data-cap></p>
    <p class="mono" data-credit></p>
  </div>
</dialog>
<script src="${base}js/app.js" defer></script>
</body>
</html>`;
}

// ------------------------------------------------------------- plate page --
const LAYOUT_NOTE = {
  threshold: ["DARK FIELD", "One column, pushed right. The title is cut by the page edge."],
  body: ["CONTACT STRIP", "The sequence runs as a band of operations, then a dossier."],
  ritual: ["DOSSIER", "A long vertical rule, a calendar, and notes in the margin."],
  table: ["LEDGER", "A meal laid out as a record: table, plate, photograph."],
  returning: ["FRAGMENTS", "Notes pinned over one another; nothing resolves."],
  grave: ["ELEVATION", "Measured drawings, a plan, and photographs at their own scale."],
  voice: ["TYPE", "Almost no image. The page is a score."],
  afterlife: ["ICON", "A tall image with annotations; doctrine in the margins."],
  collective: ["SLAB", "Heavy bands, numbers, and one photograph at full width."],
  art: ["EXHIBITION", "Wide margins, wall labels, one full-bleed reproduction."],
  soviet: ["DOCUMENT", "Dense strips; a state file reconstructed from public dates."],
  archive: ["VOID", "Mostly empty. The emptiness is the content."],
};

function renderPlate(p) {
  const base = "../";
  const idx = plates.plates.indexOf(p);
  const prev = plates.plates[idx - 1] || null;
  const next = plates.plates[idx + 1] || null;
  const visible = p.sections.filter((s) => !s.hidden);
  const sections = visible.map((s, i) => renderSection(s, base, i)).join("\n");
  const marginal = p.marginal ? `<aside class="marginal">
    <button class="marginal__btn mono" type="button" data-marginal aria-controls="marg-${p.id}" aria-expanded="false">MARGINAL NOTE ${p.letter}</button>
    <p class="marginal__note" id="marg-${p.id}" tabindex="-1" hidden>${md(p.marginal)}</p>
  </aside>` : "";
  const allSrc = [...new Set([...(p.sources || []), ...p.sections.flatMap((s) => s.sources || [])])].filter((id) => S[id]);
  const layoutNote = LAYOUT_NOTE[p.layout] || ["PLATE", ""];

  const head = `<header class="plate__head">
  <div class="plate__letter" aria-hidden="true">${p.letter}</div>
  <p class="plate__kicker mono">PLATE ${p.letter} — ${esc(p.category.toUpperCase())} — ${String(idx + 1).padStart(2, "0")}/12</p>
  <div class="plate__head-main">
    <h1 class="plate__title">${esc(p.title)}</h1>
    <p class="plate__subtitle">${esc(p.subtitle)}</p>
  </div>
  <div class="plate__head-side">
    <p class="plate__dek">${md(p.dek)}</p>
    <div class="plate__meta">
      ${metaDL({ Period: p.period, Geography: p.location, Tradition: p.tradition })}
      <p class="plate__legend mono">${tag("documented")} ${tag("interpretation")} ${tag("reconstruction")}</p>
    </div>
    <p class="plate__laynote mono">COMPOSITION ${String(idx + 1).padStart(2, "0")} — ${layoutNote[0]}. ${esc(layoutNote[1])}</p>
  </div>
</header>`;

  const foot = `<footer class="plate__foot">
  <div class="plate__foot-col">
    <h2 class="mono">SOURCES FOR THIS PLATE</h2>
    <ol class="platesrc">
      ${allSrc.map((id) => `<li><a href="${srcHref(id, base)}"><span class="mono">${esc(id)}</span> ${esc(S[id].author)} — <em>${esc(S[id].title)}</em> (${esc(S[id].year)})</a></li>`).join("")}
    </ol>
    <p class="plate__srcnote mono">All URLs and access dates are listed in the bibliography.</p>
  </div>
  <div class="plate__foot-col">
    <h2 class="mono">RELATED PLATES</h2>
    <ul class="related">
      ${(p.related || []).filter((r) => PLATE[r]).map((r) => `<li><a href="${plateHref(r, base)}"><span class="mono">${PLATE[r].letter}</span> ${esc(PLATE[r].nav)}</a></li>`).join("")}
    </ul>
    <h2 class="mono">TERMS IN THIS PLATE</h2>
    <ul class="related related--terms">
      ${(p.concepts || []).filter((c) => CON[c]).map((c) => `<li><a href="${base}atlas.html#concept-${c}">${esc(CON[c].name)}</a></li>`).join("")}
      ${(p.objects || []).filter((o) => OBJ[o]).map((o) => `<li><a href="${base}atlas.html#object-${o}">${esc(OBJ[o].name)}</a></li>`).join("")}
    </ul>
  </div>
  <nav class="plate__pager" aria-label="Plates">
    ${prev ? `<a href="${plateHref(prev.id, base)}" class="pager pager--prev"><span class="mono">PREVIOUS</span><span>${prev.letter} — ${esc(prev.nav)}</span></a>` : `<a href="${base}index.html" class="pager pager--prev"><span class="mono">BACK</span><span>Cover</span></a>`}
    ${next ? `<a href="${plateHref(next.id, base)}" class="pager pager--next"><span class="mono">NEXT</span><span>${next.letter} — ${esc(next.nav)}</span></a>` : `<a href="${base}atlas.html" class="pager pager--next"><span class="mono">END</span><span>The index</span></a>`}
  </nav>
</footer>`;

  const deco = {
    threshold: `<div class="deco deco--rule" aria-hidden="true"></div>`,
    returning: `<div class="deco deco--stamp mono" aria-hidden="true">UNFILED<br>E / 1916</div>`,
    grave: `<div class="deco deco--scale mono" aria-hidden="true">0 — 1 — 2 M</div>`,
    archive: `<div class="deco deco--missing mono" aria-hidden="true">MISSING</div>`,
    voice: `<div class="deco deco--quote" aria-hidden="true">“”</div>`,
    collective: `<div class="deco deco--count mono" aria-hidden="true">470 000 / 520 000</div>`,
    soviet: `<div class="deco deco--stamp2 mono" aria-hidden="true">1927</div>`,
    art: `<div class="deco deco--label mono" aria-hidden="true">INV. 5248</div>`,
    afterlife: `<div class="deco deco--marks" aria-hidden="true">${mark("ring-a", "mark--red")}${mark("arrow-long", "mark--red")}</div>`,
    table: `<div class="deco deco--ink" aria-hidden="true"></div>`,
    body: `<div class="deco deco--tick" aria-hidden="true">${mark("underline-double")}</div>`,
    ritual: `<div class="deco deco--bracket" aria-hidden="true">${mark("bracket")}</div>`,
  }[p.layout] || "";

  return shell({
    title: `${p.title} — Plate ${p.letter} — ARCHÆOLOGY OF RUSSIAN DEATH`,
    description: p.dek,
    base,
    bodyClass: `plate-page plate-page--${p.layout}`,
    page: `plate-${p.id}`,
    content: `<main id="main">
  <div class="plate__rule" aria-hidden="true"></div>
  <article class="plate plate--${p.layout}" data-plate="${p.id}">
    ${deco}
    ${head}
    <div class="plate__body">
      ${sections}
      ${marginal}
    </div>
    ${foot}
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
    <p><strong>Anton</strong> (display, heavy), <strong>Oswald</strong> (condensed, display and navigation), <strong>Source Serif 4</strong> (editorial text), <strong>IBM Plex Mono</strong> (metadata). All four are licensed under the SIL Open Font License 1.1 and are served from this repository. Licence texts are in <code>assets/fonts/</code>.</p>
  </section>
  <section class="colo-sec">
    <h2 class="mono">MATERIALS</h2>
    <p>Seven textures and two overlays were generated for this edition — paper grain, aged paper, dirty photocopy, scanner lines, misregistration, ink stain, wash stain, dust and creases — together with six torn-paper clip paths, two tape shapes, a hand-mark sprite and six diagrams. Halftone, duotone and photocopy degradation are applied as real image derivatives, not as CSS filters: the files are raster and vector assets generated by the scripts in <code>build/</code>.</p>
    <p>Photographs and reproductions come from Wikimedia Commons under public domain, CC0, CC BY or CC BY-SA licences. Every file is credited under its figure and in the bibliography. Four photographic derivatives (two halftones, one xerox, one duotone) are declared as derivatives.</p>
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
  return shell({
    title: "ARCHÆOLOGY OF RUSSIAN DEATH — An Atlas",
    description: "An atlas of death, memory, ritual and the afterlife in Russian culture. Twelve research plates, an index, a map, a chronology and sources.",
    base,
    bodyClass: "cover-page",
    page: "cover",
    content: `<main id="main" class="cover">
  <section class="cover__top">
    <p class="mono cover__kicker">AN ATLAS · TWELVE PLATES · FIRST EDITION 2026</p>
    <h1 class="cover__title">
      <span class="cover__line cover__line--1">ARCHÆOLOGY</span>
      <span class="cover__line cover__line--2"><span class="cover__of">OF</span> <span class="cover__red">RUSSIAN</span></span>
      <span class="cover__line cover__line--3">DEATH</span>
    </h1>
    <p class="cover__sub">An Atlas of Death, Memory, Ritual and the Afterlife in Russian Culture</p>
    <p class="cover__statement mono">A CHRONICLE OF THE DEAD, WRITTEN BY THE LIVING · NOT SLAVIC FANTASY · NOT GOTHIC HORROR · A MATERIAL ARCHIVE OF RUSSIAN DEATH</p>
  </section>

  <section class="cover__body">
    <div class="cover__collage" aria-hidden="true">
      <figure class="cover__fig cover__fig--a torn-03"><img src="assets/images/last-judgment-volga.jpg" alt="" loading="eager" decoding="async"></figure>
      <figure class="cover__fig cover__fig--b torn-02"><img src="assets/images/perov-funeral.jpg" alt="" loading="lazy" decoding="async"></figure>
      <span class="cover__tape tape-1"></span>
      <span class="cover__slip mono">PLATE H — THE AFTERLIFE — 1770s–1780s</span>
      <span class="cover__stamp mono">ARCHIVE<br>COPY 12</span>
    </div>
    <div class="cover__intro">
      <p class="cover__lede">This is not a history of a single tradition. It is an assembly of documents, objects and arguments about how people in Russia buried their dead, imagined what came after, and tried to keep names from disappearing.</p>
      <p>Twelve plates move from the room where a death occurs to the archive that cannot hold it. Each plate has its own composition, its own evidence and its own gaps. Facts are separated from interpretation and from reconstruction wherever they appear.</p>
      <p class="mono cover__warn">NO INVENTED SOURCES · NO INVENTED QUOTATIONS · NO INVENTED ARCHIVE NUMBERS</p>
      <nav class="cover__nav" aria-label="Begin">
        <a class="btn btn--red" href="atlas.html">ENTER THE INDEX</a>
        <a class="btn" href="plates/a-threshold.html">BEGIN AT PLATE A</a>
        <a class="btn btn--ghost" href="method.html">READ THE METHOD</a>
      </nav>
    </div>
  </section>

  <section class="cover__strip">
    <p class="mono">DOCUMENTED</p><span class="cover__bar"></span>
    <p class="mono">INTERPRETATION</p><span class="cover__bar"></span>
    <p class="mono">RECONSTRUCTION</p><span class="cover__bar"></span>
    <p class="mono">UNVERIFIED</p>
  </section>

  <section class="cover__plates">
    <h2 class="mono">THE TWELVE PLATES</h2>
    <ol>
      ${plates.plates.map((p, i) => `<li><a href="${plateHref(p.id, base)}"><span class="mono">${p.letter}</span><span class="cover__pl-title">${esc(p.nav)}</span><span class="mono cover__pl-no">${String(i + 1).padStart(2, "0")}</span></a></li>`).join("")}
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




