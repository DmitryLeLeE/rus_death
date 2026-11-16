// Switches on the public-domain texts and songs once their data files are in place.
//
//   data/voices.json      data/ru/voices.json      data/songs.json
//
// The script does three things: it checks that the files are there, it replaces the
// statements that say no verse is printed (README, SOURCES, method page, colophon,
// the "Verse not printed here" note on plate G), and it rebuilds and validates.
// It is safe to run twice. Without the data files it stops before changing anything.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const wr = (f, t) => fs.writeFileSync(path.join(ROOT, f), t);

const need = ["data/voices.json", "data/ru/voices.json", "data/songs.json"];
const missing = need.filter((f) => !fs.existsSync(path.join(ROOT, f)));
if (missing.length) { console.error("Missing data files:\n  " + missing.join("\n  ") + "\nNothing was changed."); process.exit(1); }

const voices = JSON.parse(rd("data/voices.json")).voices;
const songs = JSON.parse(rd("data/songs.json")).songs;
console.log(`voices: ${voices.length}, songs: ${songs.length}`);
if (voices.length !== 10 || songs.length !== 4) console.warn("Expected 10 voices and 4 songs.");

let done = 0, skipped = 0;
function swap(file, from, to) {
  const t = rd(file);
  if (t.includes(to)) { skipped++; return; }
  if (!t.includes(from)) { console.error(`NOT FOUND in ${file}: ${from.slice(0, 70)}…`); process.exit(2); }
  wr(file, t.replace(from, to)); done++;
}

swap("README.md", "and no verbatim laments, proverbs or epitaphs.",
  "and only a small number of public-domain laments, poems, songs, epitaphs and liturgical texts, printed from the cited editions and not as an anthology.");
swap("SOURCES.md", "| No laments, proverbs or epitaphs are quoted verbatim in this edition. | — | editorial policy |",
  "| A small number of public-domain laments, poems, songs, epitaphs and liturgical texts are printed in full or as marked excerpts, each from the edition named beside it. Nothing else is quoted verbatim. | — | editorial policy |");
swap("data/method.json", "No laments, proverbs or epitaphs are quoted verbatim in this edition.",
  "A small number of public-domain laments, poems, songs, epitaphs and liturgical texts are printed in full or as marked excerpts, each from the edition named beside it; nothing else is quoted verbatim.");
swap("data/ru/method.json", "В этом издании дословно не цитируются ни причитания, ни пословицы, ни эпитафии.",
  "В этом издании печатается небольшое число причитаний, стихотворений, песен, эпитафий и богослужебных текстов из общественного достояния, полностью или с пометкой об отрывке, каждый по названному рядом изданию; ничего другого дословно не цитируется.");
swap("build/ui.mjs", "It does not quote laments, proverbs or epitaphs verbatim.",
  "It prints a small number of public-domain texts and songs, each from the edition it names, and quotes nothing else verbatim.");
swap("build/ui.mjs", "не цитирует причитания, пословицы и эпитафии дословно.",
  "печатает небольшое число текстов и песен из общественного достояния, каждый по названному изданию, и ничего другого дословно не цитирует.");
swap("data/sources.json", "No lament verse is printed in the atlas.", "Lament texts are printed in the atlas only where a text section names the page of volume 1.");
swap("data/ru/sources.json", "Ни одного стиха в атласе не печатается.", "Тексты причитаний печатаются в атласе только там, где в секции текста указана страница тома 1.");

// Plate G: the "Verse not printed here" note and the unverified second-person sentence.
const P = JSON.parse(rd("data/plates.json")), R = JSON.parse(rd("data/ru/plates.json"));
const g = P.plates.find((p) => p.letter === "G");
const noteIdx = g.sections.findIndex((s) => s.type === "note" && s.heading === "Verse not printed here");
if (noteIdx >= 0) {
  g.sections[noteIdx] = {
    type: "note", kicker: "Editorial", heading: "The text printed here", level: "interpretation", editorial: true,
    items: [
      "The lament at the end of this plate is a complete text from Barsov’s first volume (no. XI, pp. 162–164), not a reconstruction. It was checked line by line against page images of the 1872 scan.",
      "The pre-1918 orthography and line breaks are kept. The translation is the atlas’s own and keeps repetitions and diminutives where English allows.",
      "Barsov’s footnote to the last line prints a variant of the closing movement. It is not combined with the main text and is not reproduced here.",
    ],
  };
  R.plates[g.id].sections[String(noteIdx)] = {
    kicker: "Редакция", heading: "Напечатанный здесь текст",
    items: [
      "Причитание в конце этого листа — полный текст из первого тома Барсова (№ XI, с. 162–164), а не реконструкция. Он сверен построчно с изображениями страниц скана 1872 года.",
      "Дореформенная орфография и разбивка на строки сохранены. Перевод — собственный перевод атласа; повторы и уменьшительные сохранены там, где это позволяет английский.",
      "Сноска Барсова к последней строке даёт вариант заключительного движения. Он не соединён с основным текстом и здесь не воспроизводится.",
    ],
  };
  done++;
} else skipped++;
const s3 = g.sections.find((s) => s.kicker === "G / 03");
const oldS = "This is an interpretive reading carried over from the earlier edition. It has not yet been checked against lament texts and stands as unverified until it is.";
const newS = "One printed text bears this out in its grammar: the Tver lament for a sister printed on this plate (Barsov 1872, no. XI) addresses the dead in the second person and the present tense, by the kin term ‘sister’. One text supports the grammatical observation; it does not make a rule for the genre.";
if (s3 && s3.paras[0].includes(oldS)) {
  s3.paras[0] = s3.paras[0].replace(oldS, newS);
  const r3 = R.plates[g.id].sections[String(g.sections.indexOf(s3))];
  const oldR = r3.paras[0].match(/Это интерпретация[^]*$/);
  if (!oldR) { console.error("RU G/03 closing sentence not found; edit by hand."); process.exit(3); }
  r3.paras[0] = r3.paras[0].replace(oldR[0], "Один напечатанный текст подтверждает это по грамматике: тверское причитание по сестре, напечатанное на этом листе (Барсов 1872, № XI), обращается к умершей во втором лице и в настоящем времени, по родственному имени «сестра». Один текст подтверждает грамматическое наблюдение, но правила для жанра из него не следует.");
  done++;
} else skipped++;
wr("data/plates.json", JSON.stringify(P, null, 2) + "\n");
wr("data/ru/plates.json", JSON.stringify(R, null, 2) + "\n");

console.log(`statements changed: ${done}, already in place: ${skipped}`);
execSync("node build/build.mjs", { cwd: ROOT, stdio: "inherit" });
execSync("node build/validate.mjs", { cwd: ROOT, stdio: "inherit" });
