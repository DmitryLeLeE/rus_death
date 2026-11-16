// Data validator: node build/validate.mjs  (exit 1 on any error)
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const J = (f) => JSON.parse(fs.readFileSync(new URL("../data/" + f, import.meta.url), "utf8"));
// fileURLToPath decodes %20 and the drive letter, so a path such as "E:\\WORK\\rus death" works on Windows.
const root = fileURLToPath(new URL("../", import.meta.url));
const src = J("sources.json").entries, SID = new Set([...src.map((s) => s.id), "images"]); // "images" = credited in images.json
const plates = J("plates.json").plates, PID = new Set(plates.map((p) => p.id));
const images = J("images.json").images, IID = new Set(images.map((i) => i.id));
const objs = J("objects.json").objects, OID = new Set(objs.map((o) => o.id));
const places = J("places.json").places, LID = new Set(places.map((o) => o.id));
const concepts = J("concepts.json"), cl = concepts.entries || concepts.concepts || [];
const CID = new Set(cl.map((c) => c.id));
const tl = J("timeline.json").entries, lex = J("lexicon.json").entries;
const OBSOLETE = new Set(["zelenin1914", "ivanits1998"]);
const err = [], warn = [];
const E = (m) => err.push(m), W = (m) => warn.push(m);
const chkSrc = (where, ids) => { for (const id of ids || []) { if (OBSOLETE.has(id)) E(`${where}: obsolete source ${id}`); else if (!SID.has(id)) E(`${where}: unknown source ${id}`); } };
const dup = (arr, name) => { const s = new Set(); for (const x of arr) { if (s.has(x.id)) E(`${name}: duplicate id ${x.id}`); s.add(x.id); } };
[[src, "sources"], [plates, "plates"], [images, "images"], [objs, "objects"], [places, "places"], [tl, "timeline"], [lex, "lexicon"]].forEach(([a, n]) => dup(a, n));

// sources: abstract-only must not claim full reading
for (const s of src) {
  const t = `${s.supports || ""} ${s.limitation || ""}`.toLowerCase();
  if (/abstract/.test(s.limitation || "") && /(read in full|fully read|full text read)/.test((s.supports || "").toLowerCase())) E(`source ${s.id}: abstract-only but supports claims full reading`);
  if (!s.limitation) W(`source ${s.id}: no limitation note`);
}
// plates
let unsrc = 0, sections = 0;
for (const p of plates) {
  chkSrc(`plate ${p.id}`, p.sources);
  for (const r of p.related || []) if (!PID.has(r)) E(`plate ${p.id}: related ${r} missing`);
  for (const r of p.concepts || []) if (!CID.has(r)) E(`plate ${p.id}: concept ${r} missing`);
  for (const r of p.objects || []) { if (!OID.has(r)) E(`plate ${p.id}: object ${r} missing`); else if (!objs.find((o) => o.id === r).plates?.includes(p.id)) E(`plate ${p.id}: object ${r} not reciprocal`); }
  for (const r of p.places || []) { if (!LID.has(r)) E(`plate ${p.id}: place ${r} missing`); else if (!places.find((o) => o.id === r).plates?.includes(p.id)) W(`plate ${p.id}: place ${r} not reciprocal`); }
  p.sections.forEach((s, i) => {
    const w = `plate ${p.id}[${i}]`;
    chkSrc(w, s.sources);
    for (const x of s.sources || []) if (!(p.sources || []).includes(x)) W(`${w}: source ${x} not in plate source list`);
    if ((s.type === "figure" || s.type === "diagram") && !s.hidden) {
      if (!s.credit) E(`${w}: figure without credit`);
      if (s.type === "figure" && !IID.has(s.src)) E(`${w}: figure ${s.src} not in images.json`);
    }
    if (s.type === "quote" && !s.attrib) E(`${w}: quotation without provenance`);
    if (s.type === "quote" && s.level === "documented" && !/Bibliographic title/.test(s.attrib) && !(s.sources || []).length) E(`${w}: documented quotation without source`);
    if (s.hidden || ["figure", "diagram", "quote"].includes(s.type)) return;
    sections++;
    if (!(s.sources || []).length && !s.editorial) { unsrc++; E(`${w}: factual section without sources and not marked editorial (${s.heading || s.kicker || s.type})`); }
    if (s.editorial && s.level === "documented") E(`${w}: editorial note labelled documented`);
    if (s.level === "documented" && !(s.sources || []).length) E(`${w}: documented without sources`);
  });
}
for (const i of images) {
  if (!i.license || !i.source_page) E(`image ${i.id}: licence/source missing`);
  if (!fs.existsSync(root + i.file)) E(`image ${i.id}: file ${i.file} missing`);
}
for (const o of objs) { chkSrc(`object ${o.id}`, o.sources); for (const r of o.plates || []) { if (!PID.has(r)) E(`object ${o.id}: plate ${r} missing`); else if (!plates.find((p) => p.id === r).objects?.includes(o.id)) E(`object ${o.id}: plate ${r} not reciprocal`); } }
for (const l of places) { chkSrc(`place ${l.id}`, l.sources); for (const r of l.plates || []) if (!PID.has(r)) E(`place ${l.id}: plate ${r} missing`); }
for (const t of tl) { chkSrc(`timeline ${t.id}`, t.sources); if (!(t.sources || []).length && !t.editorial) E(`timeline ${t.id}: no sources`); for (const r of t.plates || []) if (!PID.has(r)) E(`timeline ${t.id}: plate ${r} missing`); }
for (const l of lex) for (const r of l.plates || []) if (!PID.has(r)) E(`lexicon ${l.id}: plate ${r} missing`);
// related symmetry
for (const p of plates) for (const r of p.related || []) { const q = plates.find((x) => x.id === r); if (q && !(q.related || []).includes(p.id)) W(`related not bidirectional: ${p.id} -> ${r}`); }
console.log(`sections checked: ${sections}; factual sections without sources: ${unsrc}`);
console.log(`errors: ${err.length}; warnings: ${warn.length}`);
err.forEach((m) => console.log("ERROR", m)); warn.forEach((m) => console.log("warn ", m));
process.exit(err.length ? 1 : 0);
