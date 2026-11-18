/* ARCHÆOLOGY OF RUSSIAN DEATH — optional room sound.
   Synthesised in the browser with Web Audio: no audio files, no requests, nothing autoplays.
   The first visit shows a notice that asks. The choice is remembered (localStorage "rd-sound").
   Pages change in place (js/nav.js), so the sound keeps running between pages; after a full
   reload the browser may block audio until one tap, and a notice says so at once.
   Every control makes a small sound of its own, and every atlas object a sound of its material. */
(() => {
  "use strict";

  const btn = document.querySelector("[data-sound]");
  if (!btn) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { btn.hidden = true; return; }
  const D = btn.dataset;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  /* One quiet room per page. room: brown-noise floor (Hz = its low-pass); wind: gusts;
     drone: [Hz, level]; hum: mains hum level; bell: [min, max] seconds between far bells. */
  const BASE = { room: 0.08, roomLP: 240, wind: 0.015 };
  const PROFILES = {
    cover: { room: 0.12, wind: 0.035, bell: [30, 55] },
    prologue: { room: 0.1, wind: 0.02, drone: [110, 0.012] },
    "plate-a": { room: 0.08, wind: 0.06, bell: [25, 45] },
    "plate-b": { room: 0.14, wind: 0, drone: [82, 0.02], water: [3, 8] },
    "plate-c": { room: 0.09, wind: 0.02, bell: [14, 26], bellVol: 0.06, crackle: true },
    "plate-d": { room: 0.16, roomLP: 420, wind: 0.01, creak: [14, 28] },
    "plate-e": { room: 0.06, wind: 0.09 },
    "plate-f": { room: 0.08, wind: 0.05, bell: [35, 60], creak: [16, 32] },
    "plate-g": { room: 0.08, wind: 0, drone: [98, 0.028], bell: [10, 20], bellVol: 0.07 },
    "plate-h": { room: 0.08, wind: 0.02, drone: [73, 0.024], bell: [20, 35], crackle: true },
    "plate-i": { room: 0.13, wind: 0, drone: [87, 0.012], bell: [40, 70] },
    "plate-j": { room: 0.09, wind: 0 },
    "plate-k": { room: 0.1, wind: 0, hum: 0.022 },
    "plate-l": { room: 0.05, wind: 0, rustle: 1.8 },
    "plate-m": { room: 0.05, roomLP: 180, wind: 0.02, drone: [61, 0.014], creak: [10, 22] },
    "plate-n": { room: 0.05, wind: 0.08 },
    "plate-o": { room: 0.14, roomLP: 520, wind: 0.02, water: [3, 6] },
    "plate-p": { room: 0.06, wind: 0.07, bell: [45, 80] },
    "plate-q": { room: 0.1, roomLP: 300, wind: 0.01, bell: [20, 35], bellVol: 0.05, creak: [14, 28] },
    "plate-r": { room: 0.16, roomLP: 150, wind: 0, drone: [55, 0.02] },
    "plate-s": { room: 0.07, wind: 0.01, drone: [90, 0.01], creak: [12, 24] },
    "plate-t": { room: 0.05, wind: 0.06, drone: [70, 0.018] },
    "plate-u": { room: 0.08, wind: 0.02, bell: [18, 30] },
    "plate-v": { room: 0.07, wind: 0, drone: [77, 0.022] },
    "plate-w": { room: 0.09, wind: 0, hum: 0.015 },
    "plate-x": { room: 0.05, wind: 0, hum: 0.024 },
    "plate-y": { room: 0.07, wind: 0.04, bell: [22, 45], drone: [65, 0.016] },
    "plate-z": { room: 0.09, roomLP: 260, wind: 0.03, drone: [58, 0.015], water: [6, 12] },
  };
  const profile = () => Object.assign({}, BASE, PROFILES[document.body.dataset.page] || {});

  /* Which sound each atlas object makes when it is touched. */
  const OBJ = {
    coffin: "wood", cross: "wood", candle: "flame", "grave-marker": "wood", "funeral-cloth": "cloth",
    "memorial-bread": "cloth", kutia: "ceramic", "ritual-vessel": "ceramic", "cemetery-gate": "iron",
    photograph: "shutter", icon: "chime", mirror: "glass", fence: "iron", memorial: "stone",
    "eternal-flame": "flame", smertnoe: "cloth", wreath: "leaf", window: "glass", "roadside-sign": "iron",
    "domovoi-offering": "ceramic", "aspen-stake": "wood", "overturned-furniture": "wood",
    "reused-gravestone": "stone", "memorial-account": "digital", "ai-avatar": "digital",
  };

  /* Which sound each kind of control makes. First match wins. */
  const CONTROLS = [
    ["[data-sfx]", null],
    [".pin", "chime"],
    ["[data-menu-open], [data-menu-close]", "latch"],
    ["[data-examine], [data-zoom-toggle], [data-close]", "shutter"],
    ["summary", "paper"],
    ["[data-marginal]", "paper"],
    ["[data-readable], [data-lang-pick]", "tick"],
    ["[data-tab], [data-filter], [data-era-filter], [data-reset]", "tick"],
    ["a[href]", "page"],
    ["button, [role=button], input[type=checkbox], input[type=radio], select", "tick"],
  ];

  let ctx = null, master = null, sfxBus = null, white = null, brown = null;
  let layer = null, on = false, armed = false, started = false;
  let gustTimer = 0, bellTimer = 0, waterTimer = 0, crackleTimer = 0, creakTimer = 0;
  let scrollAcc = 0, lastRustle = 0, lastY = 0, lastSfx = 0;
  const LEVEL = 0.9;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function noise(kind) {
    const len = ctx.sampleRate * 6;
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = Math.max(-1, Math.min(1, last * 3.5)); }
        else d[i] = w;
      }
    }
    return b;
  }

  function ensure() {
    if (ctx) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.9;
    sfxBus.connect(ctx.destination);
    white = noise("white");
    brown = noise("brown");
  }

  /* ----------------------------------------------------------- room layer -- */
  function loop(L, buf, dest) {
    const s = ctx.createBufferSource();
    s.buffer = buf; s.loop = true;
    s.connect(dest); s.start(0, Math.random() * 3);
    L.nodes.push(s);
    return s;
  }
  function osc(L, type, hz, dest, level) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = hz;
    const g = ctx.createGain(); g.gain.value = level;
    o.connect(g); g.connect(dest); o.start();
    L.nodes.push(o);
    return o;
  }

  function buildLayer(P) {
    const L = { P, nodes: [], out: ctx.createGain(), windGain: null, windBand: null };
    L.out.gain.value = 0;
    L.out.connect(master);
    if (P.room) {
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = P.roomLP;
      const g = ctx.createGain(); g.gain.value = P.room;
      lp.connect(g); g.connect(L.out);
      loop(L, brown, lp);
    }
    if (P.wind) {
      L.windBand = ctx.createBiquadFilter(); L.windBand.type = "bandpass"; L.windBand.frequency.value = 380; L.windBand.Q.value = 0.8;
      L.windGain = ctx.createGain(); L.windGain.gain.value = P.wind * 0.4;
      L.windBand.connect(L.windGain); L.windGain.connect(L.out);
      loop(L, white, L.windBand);
    }
    if (P.drone) {
      const [f, v] = P.drone;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
      const g = ctx.createGain(); g.gain.value = v;
      lp.connect(g); g.connect(L.out);
      [[f, 1], [f * 1.5, 0.5], [f * 2.003, 0.25]].forEach(([hz, a]) => osc(L, "sine", hz, lp, a));
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lg = ctx.createGain(); lg.gain.value = v * 0.4;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      L.nodes.push(lfo);
    }
    if (P.hum) [[50, 1], [100, 0.5], [150, 0.18]].forEach(([hz, a]) => osc(L, "sine", hz, L.out, P.hum * a));
    return L;
  }

  function fadeLayer(L, to, secs) {
    const t = ctx.currentTime;
    L.out.gain.cancelScheduledValues(t);
    L.out.gain.setValueAtTime(L.out.gain.value, t);
    L.out.gain.linearRampToValueAtTime(to, t + secs);
  }

  function dispose(L) {
    L.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } try { n.disconnect(); } catch (e) { /* gone */ } });
    try { L.out.disconnect(); } catch (e) { /* gone */ }
  }

  function gust() {
    clearTimeout(gustTimer);
    if (!on || !layer || !layer.windGain) return;
    const L = layer, t = ctx.currentTime, d = rnd(3, 8);
    L.windGain.gain.linearRampToValueAtTime(L.P.wind * rnd(0.3, 1), t + d);
    L.windBand.frequency.linearRampToValueAtTime(rnd(220, 700), t + d);
    gustTimer = setTimeout(gust, d * 1000);
  }

  function bellSound(f0, vol, dest, panValue) {
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = panValue; lp.connect(pan); pan.connect(dest); } else lp.connect(dest);
    [[1, 1, 9], [2.0, 0.5, 6], [2.76, 0.35, 4], [5.4, 0.18, 2.5], [8.93, 0.08, 1.5]].forEach(([r, a, dec]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f0 * r;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * a, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0003, t + dec);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t + dec + 0.2);
    });
  }

  function farBell() {
    clearTimeout(bellTimer);
    if (!on || !layer || !layer.P.bell) return;
    const P = layer.P;
    bellSound([164.8, 185, 196, 220][Math.floor(Math.random() * 4)], P.bellVol || 0.045, master, rnd(-0.7, 0.7));
    bellTimer = setTimeout(farBell, rnd(P.bell[0], P.bell[1]) * 1000);
  }

  function waterDrop() {
    clearTimeout(waterTimer);
    if (!on || !layer || !layer.P.water) return;
    const P = layer.P, t = ctx.currentTime + 0.005;
    const f0 = rnd(650, 1150);
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + 0.015);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.75, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.024, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0002, t + 0.09);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.1);
    waterTimer = setTimeout(waterDrop, rnd(P.water[0], P.water[1]) * 1000);
  }

  function candleCrackle() {
    clearTimeout(crackleTimer);
    if (!on || !layer || !layer.P.crackle) return;
    const t = ctx.currentTime + 0.005;
    const bursts = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < bursts; i++) {
      const dt = t + i * rnd(0.04, 0.14);
      burst(dt, { hp: 3200, bp: rnd(4500, 7500), peak: rnd(0.008, 0.02), decay: 0.012 });
    }
    crackleTimer = setTimeout(candleCrackle, rnd(1.2, 4.0) * 1000);
  }

  function woodCreak() {
    clearTimeout(creakTimer);
    if (!on || !layer || !layer.P.creak) return;
    const P = layer.P, t = ctx.currentTime + 0.005;
    const f0 = rnd(70, 125);
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.linearRampToValueAtTime(f0 * rnd(0.85, 1.18), t + 0.28);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = rnd(450, 950);
    bp.Q.value = 2.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.022, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0003, t + 0.32);
    o.connect(bp); bp.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.35);
    creakTimer = setTimeout(woodCreak, rnd(P.creak[0], P.creak[1]) * 1000);
  }

  function rustle(scale) {
    if (!on) return;
    const bursts = 2 + Math.floor(Math.random() * 3);
    let t = ctx.currentTime;
    for (let i = 0; i < bursts; i++) {
      const s = ctx.createBufferSource(); s.buffer = white;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = rnd(1800, 3200);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = rnd(3500, 6500); bp.Q.value = 0.7;
      const g = ctx.createGain(), d = rnd(0.05, 0.16), v = 0.035 * (scale || 1) * rnd(0.5, 1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, t + d);
      s.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master);
      s.start(t, Math.random() * 4, d + 0.05);
      t += d * rnd(0.5, 1.1);
    }
  }

  function onScroll() {
    const y = window.scrollY, dy = Math.abs(y - lastY);
    lastY = y;
    if (!on) return;
    scrollAcc += dy;
    const now = performance.now();
    if (scrollAcc > 800 && now - lastRustle > 400) {
      scrollAcc = 0; lastRustle = now;
      rustle((layer && layer.P.rustle) || 1);
    }
  }

  /* ------------------------------------------------- sounds of the controls -- */
  const env = (g, t, peak, attack, decay) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0003, t + attack + decay);
  };
  function burst(t, { hp = 0, bp = 0, lp = 0, q = 0.8, peak = 0.05, attack = 0.004, decay = 0.08 }) {
    const s = ctx.createBufferSource(); s.buffer = white;
    let node = s;
    const chain = (f) => { node.connect(f); node = f; };
    if (hp) { const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp; chain(f); }
    if (bp) { const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = bp; f.Q.value = q; chain(f); }
    if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; chain(f); }
    const g = ctx.createGain(); env(g, t, peak, attack, decay);
    node.connect(g); g.connect(sfxBus);
    s.start(t, Math.random() * 4, attack + decay + 0.05);
  }
  function tone(t, hz, { peak = 0.05, attack = 0.003, decay = 0.2, type = "sine", glide = 0 }) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(hz, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, hz * glide), t + attack + decay);
    const g = ctx.createGain(); env(g, t, peak, attack, decay);
    o.connect(g); g.connect(sfxBus);
    o.start(t); o.stop(t + attack + decay + 0.05);
  }
  const partials = (t, hz, list, peak, decay) => list.forEach(([r, a, d]) => tone(t, hz * r, { peak: peak * a, decay: decay * d }));

  const SFX = {
    tick: (t) => { burst(t, { bp: 2400, q: 2, peak: 0.05, decay: 0.03 }); tone(t, 1500, { peak: 0.012, decay: 0.03 }); },
    page: (t) => { burst(t, { hp: 1500, bp: 4200, q: 0.6, peak: 0.05, attack: 0.02, decay: 0.16 }); burst(t + 0.07, { hp: 2200, bp: 5200, peak: 0.03, decay: 0.08 }); },
    paper: (t) => { burst(t, { hp: 1800, bp: 3800, q: 0.7, peak: 0.045, attack: 0.012, decay: 0.12 }); burst(t + 0.05, { hp: 2600, bp: 5600, peak: 0.025, decay: 0.07 }); },
    latch: (t) => { tone(t, 150, { peak: 0.09, decay: 0.12, glide: 0.5 }); burst(t, { lp: 700, peak: 0.05, decay: 0.05 }); burst(t + 0.09, { bp: 1800, q: 3, peak: 0.04, decay: 0.03 }); },
    shutter: (t) => { burst(t, { bp: 3000, q: 3, peak: 0.07, decay: 0.025 }); burst(t + 0.07, { bp: 1900, q: 3, peak: 0.06, decay: 0.04 }); },
    chime: (t) => bellSound(rnd(330, 494), 0.05, sfxBus, rnd(-0.3, 0.3)),
    wood: (t) => { tone(t, 190, { peak: 0.11, decay: 0.09, glide: 0.6 }); burst(t, { lp: 1400, peak: 0.07, decay: 0.045 }); tone(t + 0.12, 170, { peak: 0.06, decay: 0.08, glide: 0.6 }); },
    stone: (t) => { tone(t, 90, { peak: 0.13, decay: 0.18, glide: 0.55 }); burst(t, { bp: 1200, q: 1.2, peak: 0.06, decay: 0.05 }); },
    ceramic: (t) => { partials(t, rnd(900, 1100), [[1, 1, 1], [2.32, 0.5, 0.6], [4.1, 0.25, 0.4]], 0.06, 0.35); burst(t, { bp: 3000, q: 2, peak: 0.03, decay: 0.02 }); },
    glass: (t) => partials(t, rnd(1700, 2100), [[1, 1, 1], [2.7, 0.45, 0.7], [5.1, 0.2, 0.5]], 0.045, 0.7),
    iron: (t) => { partials(t, rnd(380, 460), [[1, 1, 1], [2.4, 0.7, 0.8], [5.9, 0.4, 0.5]], 0.07, 0.5); burst(t, { hp: 3000, peak: 0.04, decay: 0.02 }); },
    flame: (t) => { burst(t, { bp: 600, q: 0.5, peak: 0.05, attack: 0.08, decay: 0.45 }); for (let i = 0; i < 5; i += 1) burst(t + rnd(0.05, 0.5), { hp: 3500, peak: rnd(0.015, 0.04), decay: 0.015 }); },
    cloth: (t) => burst(t, { lp: 900, bp: 500, q: 0.4, peak: 0.07, attack: 0.07, decay: 0.3 }),
    leaf: (t) => { for (let i = 0; i < 5; i += 1) burst(t + i * rnd(0.03, 0.07), { hp: 2800, bp: rnd(4000, 7000), peak: rnd(0.02, 0.045), decay: 0.04 }); },
    digital: (t) => { tone(t, 880, { type: "square", peak: 0.018, decay: 0.05 }); tone(t + 0.07, 1320, { type: "square", peak: 0.018, decay: 0.07 }); },
  };

  function play(kind) {
    if (!on || !ctx || ctx.state !== "running" || !SFX[kind]) return;
    const now = performance.now();
    if (now - lastSfx < 45) return;
    lastSfx = now;
    SFX[kind](ctx.currentTime + 0.005);
  }

  function kindFor(el) {
    const hit = el.closest("[data-sfx]");
    if (hit) return hit.dataset.sfx;
    const link = el.closest("a[href]");
    if (link) {
      const m = /#object-([a-z0-9-]+)$/.exec(link.getAttribute("href") || "");
      if (m && OBJ[m[1]]) return OBJ[m[1]];
    }
    const card = el.closest('[id^="object-"]');
    if (card && OBJ[card.id.slice(7)] && !link) return OBJ[card.id.slice(7)];
    for (const [sel, kind] of CONTROLS.slice(1)) if (el.closest(sel)) return kind;
    return card ? OBJ[card.id.slice(7)] || null : null;
  }

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    if (btn.contains(e.target)) return;
    const k = kindFor(e.target);
    if (k) play(k);
  }, true);

  // hovering a map pin or an object card: a quiet touch of the same sound (mouse only)
  document.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || !(e.target instanceof Element)) return;
    const el = e.target.closest(".pin, [id^='object-']");
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return;
    if (!on || !ctx || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.005;
    burst(t, { bp: 2600, q: 2, peak: 0.018, decay: 0.02 });
  }, true);

  /* ------------------------------------------------------------ the notice -- */
  let note = null;
  const closeNote = () => { if (note) { note.remove(); note = null; } };
  function showNote(text, actions) {
    closeNote();
    note = document.createElement("div");
    note.className = "sound-note";
    note.setAttribute("role", "status");
    const p = document.createElement("p");
    p.textContent = text;
    const row = document.createElement("div");
    row.className = "sound-note__row";
    actions.forEach(([label, fn, primary]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      if (primary) b.className = "is-primary";
      b.addEventListener("click", (ev) => { ev.stopPropagation(); fn(); });
      row.appendChild(b);
    });
    note.append(p, row);
    document.body.appendChild(note);
  }

  /* ---------------------------------------------------------------- control -- */
  const paint = (isOn) => {
    btn.setAttribute("aria-pressed", String(isOn));
    btn.textContent = isOn ? D.on : D.off;
  };

  function clearAtmosphere() {
    clearTimeout(gustTimer);
    clearTimeout(bellTimer); bellTimer = 0;
    clearTimeout(waterTimer); waterTimer = 0;
    clearTimeout(crackleTimer); crackleTimer = 0;
    clearTimeout(creakTimer); creakTimer = 0;
  }

  function scheduleAtmosphere(layer) {
    if (!layer || !layer.P) return;
    if (layer.P.bell && !bellTimer) bellTimer = setTimeout(farBell, rnd(6, 14) * 1000);
    if (layer.P.water && !waterTimer) waterTimer = setTimeout(waterDrop, rnd(layer.P.water[0], layer.P.water[1]) * 1000);
    if (layer.P.crackle && !crackleTimer) crackleTimer = setTimeout(candleCrackle, rnd(1.5, 4) * 1000);
    if (layer.P.creak && !creakTimer) creakTimer = setTimeout(woodCreak, rnd(layer.P.creak[0], layer.P.creak[1]) * 1000);
  }

  function applyProfile(first) {
    if (!ctx) return;
    const old = layer;
    layer = buildLayer(profile());
    clearAtmosphere();
    if (on) {
      fadeLayer(layer, 1, first ? 0.05 : 2.2);
      gust();
      scheduleAtmosphere(layer);
    }
    if (old) { fadeLayer(old, 0, 1.6); setTimeout(() => dispose(old), 1800); }
  }

  function start() {
    ensure();
    on = true; armed = true;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(LEVEL, t + 2.5);
    if (!layer) applyProfile(true);
    else { fadeLayer(layer, 1, 0.5); gust(); scheduleAtmosphere(layer); }
    if (!started) { started = true; addEventListener("scroll", onScroll, { passive: true }); }
    return ctx.resume();
  }

  function stop() {
    on = false; armed = false;
    clearAtmosphere();
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.8);
    setTimeout(() => { if (!on && ctx) ctx.suspend(); }, 1000);
  }

  // Wait for the first touch or key press (a browser rule), then let the sound through.
  function waitForGesture() {
    const names = ["pointerdown", "keydown", "touchend"];
    const arm = () => {
      names.forEach((n) => removeEventListener(n, arm, true));
      if (!armed) return;
      start().then(() => { closeNote(); }).catch(() => {});
    };
    names.forEach((n) => addEventListener(n, arm, true));
  }

  async function begin() {
    start();
    // started inside a gesture, or the browser lets this page play at once
    const ok = await Promise.race([ctx.resume().then(() => ctx.state === "running"), new Promise((r) => setTimeout(() => r(ctx.state === "running"), 350))]);
    if (ok) { closeNote(); return; }
    showNote(D.noteResume, [[D.noteResumeBtn, () => { start().then(closeNote).catch(() => {}); }, true]]);
    waitForGesture();
  }

  btn.addEventListener("click", () => {
    const next = !(on || btn.getAttribute("aria-pressed") === "true");
    store.set("rd-sound", next ? "1" : "0");
    paint(next);
    closeNote();
    if (next) { start(); setTimeout(() => play("tick"), 60); } else stop();
  });

  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });

  // suspend ambient when archival shellac audio is playing, resume when stopped
  window.addEventListener("rd:audio-play", () => {
    if (ctx && ctx.state === "running") {
      ctx.suspend();
    }
  });
  window.addEventListener("rd:audio-pause", () => {
    if (ctx && on && ctx.state === "suspended" && !document.hidden) {
      ctx.resume();
    }
  });

  // pages change in place (js/nav.js): keep the context, change the room
  document.addEventListener("rd:navigate", () => {
    lastY = window.scrollY;
    if (ctx && layer) applyProfile(false);
  });

  const saved = store.get("rd-sound");
  if (saved === "1") {
    paint(true); armed = true;
    ensure();
    begin();
  } else if (saved === "0") {
    paint(false);
  } else {
    paint(false);
    showNote(D.noteAsk, [
      [D.noteYes, () => { store.set("rd-sound", "1"); paint(true); closeNote(); start(); setTimeout(() => play("tick"), 60); }, true],
      [D.noteNo, () => { store.set("rd-sound", "0"); closeNote(); }],
    ]);
  }
})();
