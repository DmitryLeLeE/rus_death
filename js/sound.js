/* ARCHÆOLOGY OF RUSSIAN DEATH — optional room sound.
   Synthesised in the browser with Web Audio: no audio files, no requests, nothing autoplays.
   Off by default. The choice is remembered (localStorage "rd-sound"); after a page change
   the sound starts again on the first touch or key press, because browsers require it. */
(() => {
  "use strict";

  const btn = document.querySelector("[data-sound]");
  if (!btn) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { btn.hidden = true; return; }

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
    "plate-b": { room: 0.14, wind: 0, drone: [82, 0.02] },
    "plate-c": { room: 0.09, wind: 0.02, bell: [14, 26], bellVol: 0.06 },
    "plate-d": { room: 0.16, roomLP: 420, wind: 0.01 },
    "plate-e": { room: 0.06, wind: 0.09 },
    "plate-f": { room: 0.08, wind: 0.05, bell: [35, 60] },
    "plate-g": { room: 0.08, wind: 0, drone: [98, 0.028] },
    "plate-h": { room: 0.08, wind: 0.02, drone: [73, 0.024], bell: [20, 35] },
    "plate-i": { room: 0.13, wind: 0, drone: [87, 0.012], bell: [40, 70] },
    "plate-j": { room: 0.09, wind: 0 },
    "plate-k": { room: 0.1, wind: 0, hum: 0.018 },
    "plate-l": { room: 0.05, wind: 0, rustle: 1.8 },
  };
  const P = Object.assign({}, BASE, PROFILES[document.body.dataset.page] || {});

  let ctx = null, master = null, white = null, on = false, started = false;
  let gustTimer = 0, bellTimer = 0, scrollAcc = 0, lastRustle = 0, lastY = 0;
  const LEVEL = 0.9;
  let windGain = null, windBand = null;

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

  function loop(buf, dest) {
    const s = ctx.createBufferSource();
    s.buffer = buf; s.loop = true;
    s.connect(dest); s.start(0, Math.random() * 3);
    return s;
  }

  function build() {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    white = noise("white");

    if (P.room) {
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = P.roomLP;
      const g = ctx.createGain(); g.gain.value = P.room;
      lp.connect(g); g.connect(master);
      loop(noise("brown"), lp);
    }
    if (P.wind) {
      windBand = ctx.createBiquadFilter(); windBand.type = "bandpass"; windBand.frequency.value = 380; windBand.Q.value = 0.8;
      windGain = ctx.createGain(); windGain.gain.value = P.wind * 0.4;
      windBand.connect(windGain); windGain.connect(master);
      loop(white, windBand);
    }
    if (P.drone) {
      const [f, v] = P.drone;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
      const g = ctx.createGain(); g.gain.value = v;
      lp.connect(g); g.connect(master);
      [[f, 1], [f * 1.5, 0.5], [f * 2.003, 0.25]].forEach(([hz, a]) => {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = hz;
        const og = ctx.createGain(); og.gain.value = a;
        o.connect(og); og.connect(lp); o.start();
      });
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lg = ctx.createGain(); lg.gain.value = v * 0.4;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
    }
    if (P.hum) {
      [[50, 1], [100, 0.5], [150, 0.18]].forEach(([hz, a]) => {
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = hz;
        const g = ctx.createGain(); g.gain.value = P.hum * a;
        o.connect(g); g.connect(master); o.start();
      });
    }
  }

  function gust() {
    if (!on || !windGain) return;
    const t = ctx.currentTime, d = rnd(3, 8);
    windGain.gain.linearRampToValueAtTime(P.wind * rnd(0.3, 1), t + d);
    windBand.frequency.linearRampToValueAtTime(rnd(220, 700), t + d);
    gustTimer = setTimeout(gust, d * 1000);
  }

  function bell() {
    if (!on || !P.bell) return;
    const t = ctx.currentTime, f0 = [164.8, 185, 196, 220][Math.floor(Math.random() * 4)];
    const vol = P.bellVol || 0.045;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { pan.pan.value = rnd(-0.7, 0.7); lp.connect(pan); pan.connect(master); } else lp.connect(master);
    [[1, 1, 9], [2.0, 0.5, 6], [2.76, 0.35, 4], [5.4, 0.18, 2.5], [8.93, 0.08, 1.5]].forEach(([r, a, dec]) => {
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f0 * r;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * a, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0003, t + dec);
      o.connect(g); g.connect(lp); o.start(t); o.stop(t + dec + 0.2);
    });
    bellTimer = setTimeout(bell, rnd(P.bell[0], P.bell[1]) * 1000);
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
      rustle(P.rustle || 1);
    }
  }

  function start() {
    if (on) return;
    if (!ctx) build();
    on = true;
    ctx.resume();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(LEVEL, t + 2.5);
    clearTimeout(gustTimer); clearTimeout(bellTimer);
    gust();
    if (P.bell) bellTimer = setTimeout(bell, rnd(6, 14) * 1000);
    if (!started) { started = true; addEventListener("scroll", onScroll, { passive: true }); }
  }

  function stop() {
    on = false;
    clearTimeout(gustTimer); clearTimeout(bellTimer);
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.8);
    setTimeout(() => { if (!on && ctx) ctx.suspend(); }, 1000);
  }

  const paint = (armed) => {
    btn.setAttribute("aria-pressed", String(armed));
    btn.textContent = armed ? btn.dataset.on : btn.dataset.off;
  };

  btn.addEventListener("click", () => {
    const next = !(on || btn.getAttribute("aria-pressed") === "true");
    store.set("rd-sound", next ? "1" : "0");
    paint(next);
    if (next) start(); else stop();
  });

  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });

  // Chosen on an earlier page: wait for the first touch or key press (browser rule), then start.
  if (store.get("rd-sound") === "1") {
    paint(true);
    const arm = (e) => {
      if (btn.contains(e.target)) return;
      ["pointerdown", "keydown", "touchend"].forEach((n) => removeEventListener(n, arm, true));
      if (btn.getAttribute("aria-pressed") === "true") start();
    };
    ["pointerdown", "keydown", "touchend"].forEach((n) => addEventListener(n, arm, true));
  } else paint(false);
})();
