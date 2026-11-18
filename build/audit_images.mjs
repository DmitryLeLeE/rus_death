import fs from 'fs';
import { LAYOUT, KEY, FIGMAP } from './layouts.mjs';

const derivedList = JSON.parse(fs.readFileSync('data/derived.json', 'utf8'));
const derivedSet = new Set(derivedList.map(d => d.id));
const rawImages = new Set(fs.readdirSync('assets/images'));

console.log('Total derived images:', derivedSet.size);

console.log('\n--- Checking KEY ---');
for (const [k, v] of Object.entries(KEY)) {
  if (!derivedSet.has(v)) {
    console.log(`KEY[${k}] = '${v}' is NOT derived! Exists in assets/images: ${rawImages.has(v + '.jpg') || rawImages.has(v + '.png') || rawImages.has(v + '.gif') || rawImages.has(v)}`);
  }
}

console.log('\n--- Checking LAYOUT items ---');
const missingLayout = new Set();
for (const [plate, config] of Object.entries(LAYOUT)) {
  for (const it of (config.items || [])) {
    if (it.a && !derivedSet.has(it.a)) {
      console.log(`LAYOUT plate ${plate}: '${it.a}' is NOT derived!`);
      missingLayout.add(it.a);
    }
  }
}
console.log('Total missing in LAYOUT:', missingLayout.size);

console.log('\n--- Checking FIGMAP values ---');
for (const [raw, der] of Object.entries(FIGMAP)) {
  if (!derivedSet.has(der)) {
    console.log(`FIGMAP value '${der}' is NOT derived!`);
  }
}
