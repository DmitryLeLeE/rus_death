// Per-plate composition. Every plate has its own ground, its own sheet materials
// and its own placement of text sheets and photographic layers.
//
// item keys
//   s     index of a section in data/plates.json          a   derived image id
//   r     grid row (items with the same r share a band)    c   grid columns, e.g. "2/8"
//   y     vertical shift in px (negative = overlap)        rot rotation in degrees
//   mat   sheet material: newsprint plaster linen manila concrete granite soot none
//   tape  tl|tr|tc|bl|br                                   z   stacking
//   note  red hand annotation (factual pointers only)      tr  translation of a visible inscription
//   w     mobile width in %, m mobile side: l|r|c          tear sides for CSS-torn sheets (default tb)

export const FIGMAP = {
  "perov-funeral": "perov-full",
  "last-judgment-volga": "judgment-full",
  "dormition-novgorod": "dormition-full",
  "golubets": "golubets-cut",
  "ilf-grave": "ilf-site",
  "ships-grave": "ships-xerox",
  "abandoned-tomb": "tomb-black",
  "radonitsa-graves": "radonitsa-table",
  "piskaryovskoye-flame": "piskaryov-flame",
  "unknown-soldier-1979": "soldier-flowers",
  "mamayev": "mamayev-news",
  "arkhipov-radonitsa": "arkhipov-radonitsa-cut",
  "nevrev-panikhida": "nevrev-panikhida-cut",
  "soldatskoe-pascha": "soldatskoe-pascha-cut",
  "trifon-cemetery": "trifon-cemetery-cut",
  "rogozhskoe-oldbelievers": "rogozhskoe-oldbelievers-cut",
  "kizhi-ryabinin": "kizhi-ryabinin-cut",
};

// Image that stands for each plate on the cover and in the index.
export const KEY = {
  a: "dormition-face", b: "dormition-bier", c: "perov-sled", d: "meal-engraving",
  e: "tomb-black", f: "golubets-roof", g: "judgment-strip", h: "judgment-top",
  i: "soldier-flowers", j: "perov-full", k: "ilf-stele", l: "tomb-path",
};

export const LAYOUT = {
  threshold: {
    ground: "plaster",
    items: [
      { a: "dormition-face", r: 1, c: "1/6", y: -30, rot: -1.8, tape: "tl", w: 90, m: "l",
        note: "head toward the icons — see A / 01", tr: "Icon, not a village photograph" },
      { s: 0, r: 1, c: "6/12", y: 70, rot: 0.5, mat: "newsprint", w: 94, m: "r" },
      { s: 1, r: 2, c: "2/13", y: -10, rot: -0.4, mat: "plaster", w: 100, m: "c" },
      { s: 2, r: 3, c: "1/7", y: 10, rot: -0.7, mat: "linen", w: 92, m: "l" },
      { s: 3, r: 3, c: "8/13", y: 90, rot: 0.9, mat: "manila", w: 92, m: "r" },
      { s: 4, r: 4, c: "3/9", y: 40, rot: -1.1, mat: "soot", w: 90, m: "l" },
      { s: 5, r: 4, c: "9/13", y: -10, rot: 1.4, mat: "none", w: 86, m: "r" },
    ],
  },
  body: {
    ground: "soot",
    items: [
      { a: "dormition-bier", r: 1, c: "1/-1", y: -20, rot: 0, w: 100, m: "c", tape: "tr",
        note: "linen under the body — see B / 02" },
      { s: 0, r: 2, c: "2/7", y: -90, rot: -0.7, mat: "linen", w: 92, m: "l" },
      { s: 1, r: 2, c: "7/13", y: 40, rot: 0.5, mat: "plaster", w: 100, m: "c" },
      { s: 2, r: 3, c: "6/12", y: -30, rot: 0.4, mat: "newsprint", w: 94, m: "r" },
      { s: 3, r: 3, c: "1/5", y: 60, rot: 1.2, mat: "manila", w: 90, m: "l" },
      { s: 4, r: 4, c: "2/12", y: 10, rot: -0.3, mat: "newsprint", w: 100, m: "c" },
      { s: 5, r: 5, c: "7/13", y: -10, rot: 1.0, mat: "concrete", w: 88, m: "r" },
    ],
  },
  ritual: {
    ground: "newsprint",
    items: [
      { a: "perov-sled", r: 1, c: "1/7", y: -50, rot: -1.2, tape: "tl", w: 92, m: "l" },
      { s: 0, r: 1, c: "8/13", y: 50, rot: 0.6, mat: "linen", w: 94, m: "r" },
      { s: 1, r: 2, c: "1/13", y: -10, rot: 0, mat: "plaster", w: 100, m: "c" },
      { s: 2, r: 3, c: "3/13", y: 0, rot: 0.3, mat: "newsprint", w: 100, m: "c" },
      { a: "perov-dog", r: 4, c: "1/5", y: 20, rot: 2.0, w: 66, m: "l", tape: "tr" },
      { s: 3, r: 4, c: "6/12", y: 80, rot: -0.5, mat: "manila", w: 94, m: "r" },
      { s: 4, r: 5, c: "2/8", y: 0, rot: 0.8, mat: "linen", w: 92, m: "l" },
      { s: 5, r: 5, c: "9/13", y: 60, rot: -1.3, mat: "soot", w: 90, m: "r" },
    ],
  },
  table: {
    ground: "manila",
    items: [
      { a: "hero-radonitsa", r: 1, c: "1/-1", y: -30, rot: 0, w: 100, m: "c", tape: "tc",
        note: "a different country, a different custom — see D / 03" },
      { s: 0, r: 2, c: "2/7", y: -70, rot: -0.9, mat: "newsprint", w: 92, m: "l" },
      { s: 1, r: 2, c: "8/13", y: -20, rot: 1.6, mat: "none", w: 84, m: "r", tape: "tr" },
      { s: 2, r: 3, c: "1/9", y: 10, rot: 0.4, mat: "linen", w: 100, m: "c" },
      { s: 3, r: 3, c: "9/13", y: 90, rot: -0.8, mat: "plaster", w: 92, m: "r" },
      { s: 4, r: 4, c: "2/8", y: 0, rot: -1.2, mat: "none", w: 86, m: "l", tape: "tl" },
      { s: 5, r: 4, c: "8/13", y: 60, rot: 0.7, mat: "soot", w: 92, m: "r" },
      { s: 6, r: 5, c: "5/10", y: -20, rot: 1.0, mat: "none", w: 60, m: "c" },
      { a: "arkhipov-radonitsa-cut", r: 6, c: "2/9", y: 10, rot: -0.8, w: 100, m: "c", tape: "tl" },
      { a: "soldatskoe-pascha-cut", r: 6, c: "9/12", y: 50, rot: 1.6, w: 70, m: "r", tape: "tr" },
    ],
  },
  returning: {
    ground: "soot",
    items: [
      { a: "tomb-black", r: 1, c: "1/9", y: -40, rot: 0, w: 100, m: "c", tear: "b" },
      { s: 0, r: 1, c: "8/13", y: 220, rot: 0.6, mat: "soot", w: 88, m: "r" },
      { s: 1, r: 2, c: "2/8", y: 40, rot: -0.4, mat: "soot", w: 92, m: "l" },
      { a: "tomb-path", r: 2, c: "8/13", y: 130, rot: 2.2, w: 78, m: "r", tape: "tl" },
      { s: 2, r: 3, c: "1/7", y: 70, rot: 0.8, mat: "concrete", w: 92, m: "l" },
      { a: "golubets-roof", r: 3, c: "7/13", y: 10, rot: -1.6, w: 90, m: "c", tape: "tr" },
      { s: 3, r: 4, c: "4/10", y: 40, rot: -0.3, mat: "soot", w: 94, m: "c" },
      { s: 4, r: 5, c: "2/7", y: 0, rot: 1.0, mat: "granite", w: 88, m: "l" },
      { s: 5, r: 5, c: "8/13", y: 80, rot: -1.0, mat: "none", w: 90, m: "r" },
    ],
  },
  grave: {
    ground: "concrete",
    items: [
      { s: 0, r: 1, c: "1/6", y: 30, rot: -0.5, mat: "plaster", w: 94, m: "l" },
      { s: 2, r: 1, c: "6/13", y: -20, rot: 0.6, mat: "none", w: 100, m: "c", tape: "tc" },
      { s: 1, r: 2, c: "2/8", y: -20, rot: 0.3, mat: "newsprint", w: 94, m: "r" },
      { s: 3, r: 2, c: "9/13", y: 40, rot: -2.0, mat: "none", w: 66, m: "l", tape: "tr" },
      { s: 5, r: 3, c: "1/7", y: 20, rot: -0.8, mat: "plaster", w: 100, m: "c" },
      { s: 6, r: 3, c: "7/13", y: 90, rot: 0.6, mat: "plaster", w: 100, m: "c" },
      { a: "ilf-stele", r: 4, c: "1/6", y: 0, rot: 1.0, w: 82, m: "l", tape: "tl",
        tr: "ИЛЬЯ ИЛЬФ 1897–1937 — “Ilya Ilf”, with years of birth and death" },
      { s: 4, r: 4, c: "6/12", y: 60, rot: -0.4, mat: "linen", w: 94, m: "r" },
      { s: 7, r: 5, c: "2/8", y: 10, rot: 0.5, mat: "manila", w: 92, m: "l" },
      { s: 9, r: 5, c: "9/13", y: -40, rot: -1.5, mat: "none", w: 72, m: "r" },
      { s: 8, r: 6, c: "1/6", y: 20, rot: 1.1, mat: "soot", w: 90, m: "l" },
      { s: 10, r: 6, c: "6/10", y: 70, rot: -1.0, mat: "none", w: 66, m: "c" },
      { a: "ships-flowers", r: 6, c: "10/13", y: 0, rot: 2.0, w: 66, m: "r", tear: "t" },
      { a: "trifon-cemetery-cut", r: 7, c: "1/8", y: 20, rot: -0.7, w: 100, m: "c", tape: "tl" },
      { a: "kizhi-ryabinin-cut", r: 7, c: "8/13", y: 70, rot: 1.1, w: 88, m: "r", tape: "tr" },
      { a: "rogozhskoe-oldbelievers-cut", r: 8, c: "3/10", y: 0, rot: -0.5, w: 94, m: "c" },
    ],
  },
  voice: {
    ground: "newsprint",
    items: [
      { s: 0, r: 1, c: "3/9", y: 20, rot: 0.2, mat: "none", w: 94, m: "l" },
      { a: "judgment-strip", r: 1, c: "11/13", y: -40, rot: 1.2, w: 40, m: "r", tape: "tc",
        tr: "Printed Slavonic text on a Last Judgment icon — writing in an image, not a lament" },
      { s: 2, r: 2, c: "1/6", y: 30, rot: -0.9, mat: "manila", w: 92, m: "l" },
      { s: 3, r: 2, c: "7/12", y: 120, rot: 0.5, mat: "none", w: 94, m: "r" },
      { s: 4, r: 3, c: "2/12", y: 10, rot: -0.2, mat: "plaster", w: 100, m: "c" },
      { s: 5, r: 4, c: "6/12", y: 0, rot: 1.0, mat: "soot", w: 90, m: "r" },
      { s: 6, r: 4, c: "1/6", y: 80, rot: -1.5, mat: "none", w: 84, m: "l" },
    ],
  },
  afterlife: {
    ground: "oxblood",
    items: [
      { a: "judgment-hell", r: 1, c: "1/-1", y: -20, rot: 0, w: 100, m: "c", tear: "b" },
      { s: 1, r: 2, c: "1/6", y: -120, rot: -1.0, mat: "none", w: 86, m: "l", tape: "tl" },
      { s: 0, r: 2, c: "7/13", y: 20, rot: 0.6, mat: "newsprint", w: 94, m: "r" },
      { a: "judgment-top", r: 3, c: "3/13", y: 0, rot: -0.5, w: 100, m: "c" },
      { s: 2, r: 4, c: "1/7", y: 10, rot: 0.8, mat: "linen", w: 92, m: "l" },
      { s: 3, r: 4, c: "8/13", y: 80, rot: -1.6, mat: "none", w: 82, m: "r", tape: "tr" },
      { s: 4, r: 5, c: "2/12", y: 0, rot: 0.3, mat: "newsprint", w: 100, m: "c" },
      { s: 5, r: 6, c: "1/6", y: 20, rot: -1.0, mat: "soot", w: 90, m: "l" },
      { s: 6, r: 6, c: "6/11", y: 60, rot: 1.4, mat: "none", w: 78, m: "c" },
      { a: "judgment-strip", r: 6, c: "12/13", y: -60, rot: 0.8, w: 28, m: "r" },
      { s: 7, r: 7, c: "3/13", y: 0, rot: -0.4, mat: "plaster", w: 100, m: "c" },
    ],
  },
  collective: {
    ground: "concrete",
    items: [
      { a: "soldier-flowers", r: 1, c: "1/-1", y: -30, rot: 0, w: 100, m: "c", tear: "b" },
      { s: 0, r: 2, c: "1/7", y: -80, rot: -0.6, mat: "granite", w: 94, m: "l" },
      { s: 1, r: 2, c: "7/13", y: 30, rot: 0.4, mat: "none", w: 100, m: "c" },
      { s: 2, r: 3, c: "2/12", y: 0, rot: 0, mat: "newsprint", w: 100, m: "c" },
      { s: 3, r: 4, c: "1/6", y: 40, rot: 0.8, mat: "plaster", w: 92, m: "l" },
      { a: "piskaryov-band", r: 4, c: "5/13", y: 0, rot: -0.8, w: 100, m: "c" },
      { s: 4, r: 5, c: "3/13", y: -10, rot: 0.5, mat: "none", w: 100, m: "c" },
      { s: 5, r: 6, c: "1/7", y: 10, rot: -0.7, mat: "newsprint", w: 94, m: "l" },
      { a: "soldier-name", r: 6, c: "8/13", y: 50, rot: 1.6, w: 84, m: "r", tape: "tl",
        note: "the slab carries incised lettering" },
      { s: 6, r: 7, c: "2/8", y: 0, rot: -0.9, mat: "soot", w: 90, m: "l" },
      { s: 7, r: 7, c: "8/13", y: 70, rot: 1.1, mat: "none", w: 86, m: "r" },
    ],
  },
  art: {
    ground: "plaster",
    items: [
      { s: 1, r: 1, c: "1/-1", y: 0, rot: 0, mat: "none", w: 100, m: "c" },
      { s: 0, r: 2, c: "2/7", y: -110, rot: -0.5, mat: "newsprint", w: 92, m: "l" },
      { a: "perov-dog", r: 2, c: "9/13", y: 40, rot: 1.4, w: 74, m: "r", tape: "tr" },
      { s: 2, r: 3, c: "1/6", y: 10, rot: 0.6, mat: "linen", w: 92, m: "l" },
      { s: 3, r: 3, c: "7/13", y: 70, rot: -0.7, mat: "plaster", w: 94, m: "r" },
      { s: 4, r: 4, c: "3/10", y: 0, rot: -0.4, mat: "none", w: 100, m: "c" },
      { s: 5, r: 4, c: "10/13", y: 60, rot: 1.5, mat: "soot", w: 90, m: "r" },
      { a: "nevrev-panikhida-cut", r: 5, c: "4/9", y: 20, rot: -1.0, w: 78, m: "c", tape: "tc" },
    ],
  },
  soviet: {
    ground: "newsprint",
    items: [
      { a: "soldier-name", r: 1, c: "1/8", y: -20, rot: -0.8, w: 94, m: "l", tape: "tl" },
      { s: 0, r: 1, c: "8/13", y: 40, rot: 0.6, mat: "plaster", w: 94, m: "r" },
      { s: 1, r: 2, c: "2/8", y: -30, rot: -0.3, mat: "newsprint", w: 94, m: "c" },
      { a: "ilf-stele", r: 2, c: "9/13", y: 60, rot: 1.8, w: 76, m: "r", tape: "tr",
        tr: "ИЛЬЯ ИЛЬФ 1897–1937 — “Ilya Ilf”, with years of birth and death" },
      { s: 2, r: 3, c: "1/13", y: 0, rot: 0.2, mat: "manila", w: 100, m: "c" },
      { s: 3, r: 4, c: "1/7", y: 20, rot: -0.7, mat: "linen", w: 92, m: "l" },
      { a: "ships-xerox", r: 4, c: "8/12", y: 70, rot: 1.2, w: 78, m: "r", tape: "tl" },
      { s: 4, r: 5, c: "2/8", y: 0, rot: 0.9, mat: "soot", w: 90, m: "l" },
      { s: 5, r: 5, c: "8/13", y: 60, rot: -1.2, mat: "none", w: 88, m: "r" },
      { s: 6, r: 6, c: "2/12", y: 0, rot: 0.3, mat: "plaster", w: 100, m: "c" },
    ],
  },
  archive: {
    ground: "paper",
    items: [
      { s: 0, r: 1, c: "7/12", y: 160, rot: 0.3, mat: "none", w: 88, m: "r" },
      { s: 1, r: 2, c: "2/7", y: 120, rot: -0.6, mat: "none", w: 60, m: "l", ghost: true },
      { s: 2, r: 3, c: "3/13", y: 100, rot: 0.2, mat: "newsprint", w: 100, m: "c" },
      { s: 3, r: 4, c: "1/6", y: 160, rot: -0.4, mat: "none", w: 86, m: "l" },
      { s: 4, r: 5, c: "7/12", y: 40, rot: 0.8, mat: "linen", w: 88, m: "r" },
      { s: 5, r: 6, c: "2/8", y: 100, rot: -1.0, mat: "none", w: 84, m: "l" },
      { s: 6, r: 7, c: "8/13", y: 20, rot: 0.6, mat: "none", w: 60, m: "r" },
    ],
  },
};
