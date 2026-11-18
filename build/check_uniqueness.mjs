import fs from "node:fs";
import { FIGMAP, KEY, LAYOUT } from "./layouts.mjs";

const platesDoc = JSON.parse(fs.readFileSync("data/plates.json", "utf8"));
const imagesDoc = JSON.parse(fs.readFileSync("data/images.json", "utf8"));

const origOf = (id) => {
  const im = imagesDoc.images.find(x => x.id === id);
  if (!im) return id;
  return im.parent || im.id;
};

const plateImages = {};
for (const p of platesDoc.plates) {
  const set = new Set();
  // 1. sections
  p.sections.forEach(s => { if (s.src) set.add(origOf(s.src)); });
  // 2. cover key
  if (KEY[p.id]) set.add(origOf(KEY[p.id]));
  // 3. layout items
  const lay = LAYOUT[p.layout];
  if (lay && lay.items) {
    lay.items.forEach(it => {
      if (it.a) set.add(origOf(it.a));
    });
  }
  plateImages[p.id] = set;
}

let totalCollisions = 0;
const plateIds = Object.keys(plateImages);
for (let i = 0; i < plateIds.length; i++) {
  for (let j = i + 1; j < plateIds.length; j++) {
    const p1 = plateIds[i];
    const p2 = plateIds[j];
    const intersect = [...plateImages[p1]].filter(x => plateImages[p2].has(x));
    if (intersect.length > 0) {
      console.error(`COLLISION between ${p1} and ${p2}:`, intersect);
      totalCollisions++;
    }
  }
}

console.log("Total pairwise plate collisions:", totalCollisions);
console.log("Total plates checked:", plateIds.length);
if (totalCollisions === 0) {
  console.log("SUCCESS: 100% unique imagery across all plates!");
}
