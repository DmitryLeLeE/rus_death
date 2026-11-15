#!/usr/bin/env python3
"""ARCHÆOLOGY OF RUSSIAN DEATH — per-image derivatives and material textures.

Every derivative is a separate file with its own crop, its own degradation and
(where declared) its own torn edge baked into the alpha channel. Nothing here is
a global CSS filter. Run: python3 build/make_derived.py
Outputs: assets/derived/*.webp, assets/textures/mat-*.jpg, data/derived.json
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, "assets", "images")
OUT = os.path.join(ROOT, "assets", "derived")
TEX = os.path.join(ROOT, "assets", "textures")
os.makedirs(OUT, exist_ok=True)

INK = np.array([10, 9, 8], np.float32)
PAPER = np.array([226, 221, 208], np.float32)


# ------------------------------------------------------------------ noise ----
def periodic_noise(h, w, beta, rng):
    """Seamless 1/f^beta noise in [0,1] (FFT on a torus)."""
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    f = np.sqrt(fx ** 2 + fy ** 2)
    f[0, 0] = 1
    spec = (rng.standard_normal((h, w)) + 1j * rng.standard_normal((h, w))) / (f ** (beta / 2))
    spec[0, 0] = 0
    n = np.real(np.fft.ifft2(spec))
    n -= n.min()
    return n / (n.max() + 1e-9)


def fbm1d(n, rng, octaves=6, persistence=0.55):
    out = np.zeros(n)
    amp, step = 1.0, max(n // 3, 4)
    for _ in range(octaves):
        k = max(n // step + 2, 3)
        pts = rng.standard_normal(k)
        xs = np.linspace(0, k - 1, n)
        out += amp * np.interp(xs, np.arange(k), pts)
        amp *= persistence
        step = max(step // 2, 2)
    return out


def resize_to(a, h, w):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    return np.asarray(im.resize((w, h), Image.BICUBIC), np.float32) / 255


# ------------------------------------------------------------ tone tools -----
def to_gray(im):
    return np.asarray(im.convert("L"), np.float32) / 255


def levels(g, black, white, gamma=1.0):
    return np.clip((g - black) / max(white - black, 1e-3), 0, 1) ** gamma


def grain(g, rng, amount, scale=1.0):
    h, w = g.shape
    n = rng.standard_normal((max(int(h / scale), 2), max(int(w / scale), 2))).astype(np.float32)
    n = resize_to((n - n.min()) / (n.max() - n.min()), h, w) - 0.5
    return np.clip(g + n * amount, 0, 1)


def exposure(g, rng, strength):
    h, w = g.shape
    gradient = resize_to(periodic_noise(32, 32, 2.6, rng), h, w)
    return np.clip(g * (1 - strength + strength * 2 * gradient), 0, 1)


def speckle(g, rng, dark=0.00014, light=0.00007, size=1):
    h, w = g.shape
    m = rng.random((h, w))
    out = g.copy()
    for thr, val in ((dark, 0.0), (light, 1.0)):
        pts = np.argwhere(m < thr)
        for y, x in pts:
            s = rng.integers(1, size + 2)
            out[max(y - s, 0): y + s, max(x - s, 0): x + s] = val
    return out


def scratches(g, rng, n=8, light=True):
    h, w = g.shape
    im = Image.fromarray((g * 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    for _ in range(n):
        x = int(rng.integers(0, w))
        y0 = int(rng.integers(0, h))
        ln = int(rng.integers(h // 8, h // 2))
        drift = int(rng.integers(-6, 7))
        d.line([(x, y0), (x + drift, min(y0 + ln, h))], fill=205 if light else 40, width=1)
    return np.asarray(im, np.float32) / 255


def toner_streaks(g, rng, n=6, dark=True):
    h, w = g.shape
    out = g.copy()
    for _ in range(n):
        x = int(rng.integers(0, w))
        wd = int(rng.integers(1, 5))
        a = float(rng.uniform(0.15, 0.55))
        y0 = int(rng.integers(0, h // 2))
        y1 = int(rng.integers(h // 2, h))
        if dark:
            out[y0:y1, x: x + wd] *= (1 - a)
        else:
            out[y0:y1, x: x + wd] = out[y0:y1, x: x + wd] * (1 - a) + a
    return out


def halftone(g, period, angle_deg, soft=0.6):
    h, w = g.shape
    a = math.radians(angle_deg)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (xx * math.cos(a) + yy * math.sin(a)) / period
    v = (-xx * math.sin(a) + yy * math.cos(a)) / period
    cell = (np.cos(2 * math.pi * u) + np.cos(2 * math.pi * v)) * 0.25 + 0.5
    # g high => paper; dots grow in the shadows
    return np.clip((g - (1 - cell) * 0.98 + 0.01) / (0.12 * soft + 1e-3) + 0.5, 0, 1)


def dither_noise(g, rng, spread=0.5):
    n = rng.random(g.shape).astype(np.float32)
    return (g + (n - 0.5) * spread > 0.5).astype(np.float32)


def banding(g, rng, strength=0.06, period=7):
    h, w = g.shape
    rows = np.arange(h)
    s = 0.5 + 0.5 * np.sin(rows / period * 2 * math.pi + rng.uniform(0, 6))
    s = s * rng.uniform(0.5, 1.0, size=h)
    return np.clip(g - (s[:, None] * strength), 0, 1)


def tint(g, ink=INK, paper=PAPER):
    return (ink[None, None, :] * (1 - g[..., None]) + paper[None, None, :] * g[..., None])


# ------------------------------------------------------------ treatments -----
def t_black(im, rng):
    g = to_gray(im)
    g = levels(g, 0.10, 0.78, 1.55)
    g = exposure(g, rng, 0.35)
    g = grain(g, rng, 0.16, 1.3)
    g = speckle(g, rng)
    g = scratches(g, rng, 2)
    return tint(g)


def t_xerox(im, rng):
    g = to_gray(im)
    g = levels(g, 0.18, 0.80, 1.15)
    h, w = g.shape
    n = resize_to(periodic_noise(64, 64, 2.2, rng), h, w)
    th = 0.46 + (n - 0.5) * 0.34
    soft = 1 / (1 + np.exp(-(g - th) * 14))
    soft = np.clip(soft + (rng.random((h, w)).astype(np.float32) - 0.5) * 0.3, 0, 1)
    soft = toner_streaks(soft, rng, 7, dark=True)
    soft = toner_streaks(soft, rng, 3, dark=False)
    soft = speckle(soft, rng, 0.0004, 0.00012, 1)
    # lost bands
    for _ in range(2):
        y = int(rng.integers(0, h - 8))
        soft[y: y + int(rng.integers(2, 7)), :] = 1.0
    return tint(soft)


def t_halftone(im, rng, period=6.0, angle=27):
    g = to_gray(im)
    g = levels(g, 0.06, 0.92, 1.1)
    h, w = g.shape
    big = Image.fromarray((g * 255).astype(np.uint8)).resize((w * 2, h * 2), Image.BICUBIC)
    ga = np.asarray(big, np.float32) / 255
    ht = halftone(ga, period * 2, angle)
    out = Image.fromarray((ht * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS)
    o = np.asarray(out, np.float32) / 255
    o = toner_streaks(o, rng, 3)
    o = speckle(o, rng, 0.0002, 0.0002, 1)
    return tint(o)


def t_faded(im, rng):
    g = to_gray(im)
    g = levels(g, 0.12, 0.92, 0.95)
    g = 0.14 + g * 0.76
    g = exposure(g, rng, 0.38)
    g = banding(g, rng, 0.07, 9)
    g = grain(g, rng, 0.07, 1.0)
    g = np.clip((g - 0.5) * 1.35 + 0.5 + 0.02, 0, 1)
    g = speckle(g, rng, 0.00012, 0.00018)
    g = scratches(g, rng, 1, light=False)
    ink = np.array([34, 32, 30], np.float32)
    paper = np.array([232, 228, 216], np.float32)
    return tint(g, ink, paper)


def t_news(im, rng):
    g = to_gray(im)
    g = levels(g, 0.08, 0.9, 1.2)
    g = exposure(g, rng, 0.22)
    h, w = g.shape
    small = Image.fromarray((g * 255).astype(np.uint8)).resize((max(w // 2, 2), max(h // 2, 2)), Image.BILINEAR)
    sg = np.asarray(small, np.float32) / 255
    d = dither_noise(sg, rng, 0.9)
    big = Image.fromarray((d * 255).astype(np.uint8)).resize((w, h), Image.NEAREST)
    o = np.asarray(big, np.float32) / 255
    o = toner_streaks(o, rng, 4)
    ink = np.array([22, 21, 20], np.float32)
    paper = np.array([214, 208, 190], np.float32)
    return tint(o, ink, paper)


def t_dormant(im, rng):
    """Almost black with only the brightest planes surviving."""
    g = to_gray(im)
    g = levels(g, 0.2, 0.95, 1.6)
    g = exposure(g, rng, 0.55)
    g = grain(g, rng, 0.12, 1.5)
    g = toner_streaks(g, rng, 4, dark=False)
    g = speckle(g, rng, 0.0001, 0.00025, 1)
    return tint(g, np.array([6, 6, 6], np.float32), np.array([205, 200, 190], np.float32))


TREAT = {"black": t_black, "xerox": t_xerox, "halftone": t_halftone, "faded": t_faded,
         "news": t_news, "dormant": t_dormant}


# ------------------------------------------------------------ torn edges -----
def torn_mask(w, h, rng, sides, amp, rim):
    """Return (alpha 0..1, rim 0..1). sides: string of t/r/b/l to tear."""
    edge = {}
    for s in "trbl":
        n = w if s in "tb" else h
        if s in sides:
            low = fbm1d(n, rng, 4, 0.6)
            fib = fbm1d(n, rng, 3, 0.9)
            noise = low * amp * 0.9 + np.interp(np.arange(n), np.arange(n), fib) * amp * 0.24
            noise += (rng.random(n) - 0.5) * amp * 0.55
            edge[s] = amp * 1.4 + noise
        else:
            edge[s] = np.zeros(n) - 1e3
    yy, xx = np.mgrid[0:h, 0:w]
    inside = np.ones((h, w), bool)
    if "t" in sides:
        inside &= yy >= edge["t"][None, :]
    if "b" in sides:
        inside &= yy <= (h - 1 - edge["b"])[None, :]
    if "l" in sides:
        inside &= xx >= edge["l"][:, None].T if False else xx >= edge["l"][:, None]
    if "r" in sides:
        inside &= xx <= (w - 1 - edge["r"])[:, None]
    m = Image.fromarray((inside * 255).astype(np.uint8))
    soft = np.asarray(m.filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255
    eroded = np.asarray(m.filter(ImageFilter.GaussianBlur(rim)), np.float32) / 255
    rim_zone = np.clip(soft - (eroded > 0.985), 0, 1)
    fibre = resize_to(periodic_noise(64, 64, 1.6, rng), h, w)
    rim_zone = np.clip(rim_zone * (0.55 + fibre * 0.9), 0, 1)
    return soft, rim_zone


def apply_torn(rgb, rng, sides, amp=14, rim=7):
    h, w, _ = rgb.shape
    alpha, rim_z = torn_mask(w, h, rng, sides, amp, rim)
    fibre = np.array([238, 234, 222], np.float32)
    r = rim_z[..., None] * 0.92
    out = rgb * (1 - r) + fibre[None, None, :] * r
    return out, alpha


# ------------------------------------------------------------ the specs ------
# id, source file, crop box (l,t,r,b) or None, treatment, out width, torn sides,
# short title for the credits register, what the crop shows
SPECS = [
    ("hero-radonitsa", "radonitsa-graves.jpg", (0, 120, 1600, 1060), "black", 1600, "b",
     "Commemoration at graves, Khutir Tymky, Ukraine (2014; not evidence for Russian custom)", "Whole frame, cropped to a wide band"),
    ("hero-tomb", "abandoned-tomb.jpg", (0, 230, 1200, 1010), "black", 1600, "b",
     "Abandoned tomb, Nizhne-Gnilovskoye cemetery, Rostov-on-Don", "Wide crop of the path and the tomb"),
    ("radonitsa-table", "radonitsa-graves.jpg", (700, 420, 1300, 880), "faded", 900, "lr",
     "Commemoration at graves, Khutir Tymky, Ukraine — the table (2014)", "Table with cloth and food, right of centre"),
    ("golubets-cut", "golubets.jpg", None, "xerox", 682, "tblr",
     "Roofed cross, Kazan cemetery, Pushkin (St Petersburg)", "Whole frame"),
    ("golubets-roof", "golubets.jpg", (40, 40, 682, 520), "black", 900, "tb",
     "Roofed cross, Kazan cemetery, Pushkin — roof and niche", "Roof and the niche under the gable"),
    ("ilf-stele", "ilf-grave.jpg", (260, 640, 860, 1180), "faded", 900, "tblr",
     "Grave of Ilya Ilf, Novodevichy Cemetery — the inscription", "Name and dates on the stone"),
    ("ilf-site", "ilf-grave.jpg", None, "black", 1000, "tb",
     "Grave of Ilya Ilf, Novodevichy Cemetery, Moscow", "Whole frame"),
    ("ships-xerox", "ships-grave.jpg", None, "xerox", 864, "tblr",
     "Grave of A. N. Stepanov and M. A. Stepanova, Novodevichy Cemetery", "Whole frame"),
    ("ships-flowers", "ships-grave.jpg", (0, 560, 864, 1152), "halftone", 900, "t",
     "Grave of A. N. Stepanov and M. A. Stepanova — the plot and its flowers", "Lower half"),
    ("tomb-black", "abandoned-tomb.jpg", None, "dormant", 1200, "tb",
     "Abandoned tomb, Nizhne-Gnilovskoye cemetery, Rostov-on-Don", "Whole frame"),
    ("tomb-path", "abandoned-tomb.jpg", (120, 760, 900, 1500), "faded", 900, "lbr",
     "Abandoned tomb, Nizhne-Gnilovskoye cemetery — the path and the bench", "Lower path with the bench"),
    ("dormition-bier", "dormition-novgorod.jpg", (0, 700, 1332, 1450), "halftone", 1332, "tb",
     "The Dormition (Novgorod school, 15th c.) — the bier and mourners", "Lower register of the icon"),
    ("dormition-face", "dormition-novgorod.jpg", (240, 470, 900, 1080), "black", 900, "tblr",
     "The Dormition (Novgorod school, 15th c.) — the laid-out body", "Central group"),
    ("judgment-top", "last-judgment-volga.jpg", (0, 0, 1149, 560), "xerox", 1149, "tb",
     "The Last Judgment (1770s–1780s icon) — upper registers", "Heavenly registers"),
    ("judgment-hell", "last-judgment-volga.jpg", (0, 560, 1149, 1180), "black", 1149, "b",
     "The Last Judgment (1770s–1780s icon) — the red lower field", "Hell and the way of the souls"),
    ("judgment-strip", "last-judgment-volga.jpg", (0, 0, 190, 1511), "xerox", 190, "tb",
     "The Last Judgment (1770s–1780s icon) — inscription column", "Narrow vertical strip with Slavonic text"),
    ("judgment-saints", "last-judgment-volga.jpg", (0, 1250, 1149, 1511), "faded", 1149, "tl",
     "The Last Judgment (1770s–1780s icon) — lower row of scenes", "Bottom register"),
    ("perov-sled", "perov-funeral.jpg", (330, 120, 1150, 940), "black", 1000, "tblr",
     "Seeing Off the Dead (Perov, 1865) — the sled and the coffin", "Central group"),
    ("perov-dog", "perov-funeral.jpg", (50, 500, 520, 983), "faded", 700, "lb",
     "Seeing Off the Dead (Perov, 1865) — the dog and the snow", "Lower left"),
    ("meal-engraving", "memorial-meal-1881.jpg", (230, 40, 604, 340), "halftone", 1100, "tblr",
     "Memorial meal at Smolensk cemetery, 1881 — the table", "Right half, enlarged ×3 (the only copy is 604 × 401 px)"),
    ("piskaryov-band", "piskaryovskoye-flame.jpg", (0, 360, 1600, 720), "black", 1600, "tb",
     "Piskaryovskoye Memorial Cemetery, St Petersburg — granite and flowers", "Long horizontal band"),
    ("piskaryov-flame", "piskaryovskoye-flame.jpg", (380, 250, 1120, 700), "xerox", 900, "tblr",
     "Piskaryovskoye Memorial Cemetery — the Eternal Flame", "Central slab"),
    ("soldier-flowers", "unknown-soldier-1979.jpg", (0, 0, 1600, 1053), "black", 1600, "b",
     "Laying flowers at the Tomb of the Unknown Soldier, Moscow, 9 May 1979", "Whole frame"),
    ("soldier-name", "unknown-soldier-1979.jpg", (880, 640, 1600, 1053), "xerox", 800, "tl",
     "Tomb of the Unknown Soldier, 1979 — incised lettering on the slab", "Lower right"),
    ("perov-full", "perov-funeral.jpg", None, "black", 1200, "tblr",
     "Seeing Off the Dead (Perov, 1865)", "Whole painting"),
    ("judgment-full", "last-judgment-volga.jpg", None, "xerox", 1149, "tblr",
     "The Last Judgment (1770s–1780s icon)", "Whole icon"),
    ("dormition-full", "dormition-novgorod.jpg", None, "black", 1332, "tblr",
     "The Dormition (Novgorod school, 15th c.)", "Whole icon"),
    ("arkhipov-radonitsa-cut", "arkhipov-radonitsa.jpg", None, "faded", 1500, "tb",
     "Radonitsa, painting by Abram Arkhipov", "Whole picture"),
    ("nevrev-panikhida-cut", "nevrev-panikhida.jpg", None, "news", 900, "tblr",
     "Requiem at a village cemetery, painting by Nikolai Nevrev (1865)", "Whole picture"),
    ("soldatskoe-pascha-cut", "soldatskoe-pascha.jpg", (0, 500, 1920, 2700), "dormant", 880, "tb",
     "Village cemetery at Easter, Soldatskoye (Belgorod Oblast, 2014)", "Cropped to the cross and the grave mound"),
    ("trifon-cemetery-cut", "trifon-cemetery.jpg", None, "black", 1400, "tb",
     "Village cemetery, Trifon (Kostroma Oblast, 2019)", "Whole frame"),
    ("rogozhskoe-oldbelievers-cut", "rogozhskoe-oldbelievers.jpg", None, "halftone", 1200, "lr",
     "Graves of Old Believers, Rogozhskoye Cemetery, Moscow", "Whole frame"),
    ("kizhi-ryabinin-cut", "kizhi-ryabinin.jpg", None, "xerox", 1100, "tblr",
     "Kizhi churchyard — the grave of the storyteller T. G. Ryabinin (2021)", "Whole frame"),
    ("izba-red-corner-cut", "izba-red-corner.jpg", (280, 40, 1560, 1040), "halftone", 1100, "tblr",
     "Red corner in an izba, Vitoslavlitsy (Veliky Novgorod)", "Cropped to the icon, the towel and the corner"),
    ("corpse-laid-out-cut", "corpse-laid-out.jpg", None, "faded", 1300, "tblr",
     "The corpse of a rich Russian man laid out for burial (carte de visite)", "Whole print on its mount"),
    ("coffin-vyazma-cut", "coffin-vyazma.jpg", None, "faded", 1200, "tblr",
     "Coffin, Vyazma Museum of History and Local Lore", "Whole frame"),
    ("gapon-panikhida-cut", "gapon-panikhida.jpg", None, "faded", 831, "tblr",
     "Panikhida at the grave of Georgy Gapon, Uspenskoye cemetery (1906 or 1907)", "Whole frame"),
    ("perov-drowned-cut", "perov-drowned.jpg", None, "dormant", 1400, "tb",
     "Drowned Woman, painting by Vasily Perov (1867)", "Whole picture"),
    ("fedosova-cut", "fedosova-1897.jpg", None, "xerox", 735, "tblr",
     "Portrait of the lamenter Irina Fedosova (engraving, 1897)", "Whole engraving"),
    ("plattonen-funeral-cut", "plattonen-funeral.jpg", None, "dormant", 1400, "tblr",
     "Funeral of the lamenter Matjoi Plattonen, Suistamo (1928)", "Whole frame"),
    ("donskoy-crematorium-cut", "donskoy-crematorium.jpg", None, "black", 1300, "tb",
     "First crematorium, Donskoye Cemetery, Moscow (2023)", "Whole frame"),
    ("donskoy-columbarium-cut", "donskoy-columbarium.jpg", None, "halftone", 900, "lr",
     "Columbarium 9, section 1, Donskoye Cemetery (2023)", "Whole frame"),
    ("funeral-1941-cut", "funeral-1941.jpg", (0, 0, 800, 490), "faded", 800, "tblr",
     "Burial of a Russian, c. 1941–43 (Bundesarchiv, Bild 169-0339)", "Cropped above the archive’s caption strip"),
    ("theodora-lubok-cut", "theodora-lubok.jpg", None, "faded", 869, "tblr",
     "Death of Theodora, Russian lubok (second half of the 19th century)", "Whole print"),
    ("zaret-crosses-cut", "zaret-crosses.jpg", None, "xerox", 1200, "tblr",
     "Crosses in the snow, Zaretskoe Cemetery, Petrozavodsk (2019)", "Whole frame"),
    ("besovets-cross-cut", "besovets-cross.jpg", None, "halftone", 960, "tblr",
     "Besovets Cemetery, Petrozavodsk (2022)", "Whole frame"),
    ("nepogodikha-house-cut", "nepogodikha-house.jpg", None, "dormant", 1200, "tblr",
     "Abandoned house, Nepogodikha, Nizhny Novgorod Oblast (2008)", "Whole frame"),
    ("tver-empty-house-cut", "tver-empty-house.jpg", None, "faded", 1200, "tblr",
     "Abandoned wooden house by the road, Tver Oblast (2016)", "Whole frame"),
    ("forest-edge-wide", "forest-edge-domodedovo.jpg", None, "faded", 1500, "tblr",
     "Forest edge by the railway, Domodedovo (2022)", "Whole frame"),
    ("swamp-karelia-xerox", "swamp-karelia.jpg", None, "xerox", 1400, "tblr",
     "Bog by Lake Lelikozero, Karelia (2014)", "Whole frame, xerox treatment"),
    ("reshma-cross-faded", "reshma-cross.jpg", None, "faded", 1300, "tblr",
     "Wooden cross at the turn to Reshma (2011)", "Whole frame"),
    ("mologa-market-news", "mologa-market.jpg", None, "faded", 1500, "tblr",
     "Market square of Mologa, early 20th century", "Whole frame"),
    ("izba-red-corner-wide", "izba-red-corner.jpg", None, "faded", 1300, "tblr",
     "Red corner in an izba, Vitoslavlitsy (Veliky Novgorod) — whole frame", "Whole frame"),
    ("tver-empty-house-xerox", "tver-empty-house.jpg", None, "xerox", 1200, "tblr",
     "Abandoned wooden house by the road, Tver Oblast (2016) — xerox", "Whole frame, xerox treatment"),
    ("vasnetsov-vityaz-faded", "vasnetsov-vityaz.jpg", None, "faded", 1500, "tblr",
     "Knight at the Crossroads (1878)", "Whole frame"),
    ("mologa-ascension-news", "mologa-ascension.jpg", None, "faded", 1300, "tblr",
     "Mologa: the chapel and the Church of the Ascension (1901–1910)", "Whole frame"),
    ("pechory-cave-church-faded", "pechory-cave-church.jpg", None, "faded", 1500, "tblr",
     "Pskov-Caves Monastery: the courtyard in front of the cave church (2015)", "Whole frame"),
    ("mamayev-news", "mamayev.jpg", (0, 300, 1600, 1200), "news", 1400, "tb",
     "Mamayev Kurgan, Volgograd — the slope", "Lower two-thirds"),
]


def build_derived():
    meta = []
    for (did, srcf, box, treat, width, sides, title, shows) in SPECS:
        seed = abs(hash(did)) % (2 ** 31) if False else sum(ord(c) * (i + 3) for i, c in enumerate(did))
        rng = np.random.default_rng(seed)
        im = Image.open(os.path.join(SRC, srcf)).convert("RGB")
        if box:
            im = im.crop(box)
        if im.width != width:
            im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
        rgb = TREAT[treat](im, rng).astype(np.float32)
        alpha = None
        if sides:
            amp = max(8, int(min(im.size) * 0.018))
            rgb, alpha = apply_torn(rgb, rng, sides, amp=amp, rim=max(4, amp // 2))
        arr = np.clip(rgb, 0, 255).astype(np.uint8)
        if alpha is not None:
            a = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
            img = Image.fromarray(np.dstack([arr, a]), "RGBA")
        else:
            img = Image.fromarray(arr, "RGB")
        path = os.path.join(OUT, did + ".webp")
        img.save(path, "WEBP", quality=72, method=5)
        meta.append({"id": did, "parent_file": srcf, "treatment": treat, "title": title, "shows": shows,
                     "w": img.width, "h": img.height, "bytes": os.path.getsize(path)})
        print(f"  {did:18s} {img.width}x{img.height}  {os.path.getsize(path)//1024}K  {treat}")
    json.dump(meta, open(os.path.join(ROOT, "data", "derived.json"), "w"), ensure_ascii=False, indent=1)
    register_credits(meta)


TREAT_NAME = {"black": "deep-black print", "xerox": "photocopy (toner threshold, streaks)",
              "halftone": "halftone screen", "faded": "faded print with scanner banding",
              "news": "newsprint dither", "dormant": "underexposed print"}


def register_credits(meta):
    """Declare every derivative in data/images.json (inherits the parent licence)."""
    p = os.path.join(ROOT, "data", "images.json")
    doc = json.load(open(p, encoding="utf-8"))
    by_file = {i["file"].split("/")[-1]: i for i in doc["images"] if i["kind"] != "derivative"}
    doc["images"] = [i for i in doc["images"] if i.get("made_by") != "make_derived.py"]
    for m in meta:
        par = by_file[m["parent_file"]]
        doc["images"].append({
            "id": m["id"], "file": "assets/derived/" + m["id"] + ".webp", "kind": "derivative",
            "title": m["title"] + " — " + TREAT_NAME[m["treatment"]],
            "creator": "Derivative made for this atlas from the original by " + par["creator"],
            "date": "2026", "medium": "Crop: " + m["shows"] + ". Processing: " + TREAT_NAME[m["treatment"]] + ", torn edge baked into the alpha channel",
            "license": par["license"] + (" (derived)" if "derived" not in par["license"] else ""),
            "license_url": par.get("license_url", ""), "source_page": par["source_page"],
            "parent": par["id"], "alt": par.get("alt", ""),
            "note": "Processing by build/make_derived.py. Inherits the licence of the original; the creator credit above is the original author.",
            "made_by": "make_derived.py"})
    json.dump(doc, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)


# ------------------------------------------------------------- textures ------
def save_tex(name, arr, q=84):
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(os.path.join(TEX, name), "JPEG", quality=q)


def build_textures():
    rng = np.random.default_rng(404)
    S = 640
    # concrete: pits + mottling
    n1 = periodic_noise(S, S, 2.4, rng)
    n2 = periodic_noise(S, S, 1.0, rng)
    pits = (periodic_noise(S, S, 0.3, rng) > 0.965).astype(np.float32)
    c = 120 + n1 * 70 + n2 * 28 - pits * 55
    save_tex("mat-concrete.jpg", np.dstack([c, c * 0.99, c * 0.96]))
    # granite: dense speckle
    g = 70 + periodic_noise(S, S, 1.6, rng) * 38
    sp = periodic_noise(S, S, 0.1, rng)
    g = g + (sp > 0.93) * 90 - (sp < 0.06) * 40
    save_tex("mat-granite.jpg", np.dstack([g, g, g * 1.04]))
    # newsprint: yellowed fibres
    f = periodic_noise(S, S, 1.9, rng)
    fib = periodic_noise(S, S, 0.6, rng)
    p = 206 + f * 26 + fib * 10
    save_tex("mat-newsprint.jpg", np.dstack([p, p * 0.965, p * 0.84]))
    # linen / cloth weave
    yy, xx = np.mgrid[0:S, 0:S]
    weave = (np.sin(xx / 2.2) * np.sin(yy / 2.0) + 1) * 0.5
    warp = periodic_noise(S, S, 1.2, rng)
    l = 188 + weave * 20 + warp * 28
    save_tex("mat-linen.jpg", np.dstack([l, l * 0.96, l * 0.86]))
    # soot ground
    s = 18 + periodic_noise(S, S, 2.0, rng) * 26 + periodic_noise(S, S, 0.5, rng) * 10
    save_tex("mat-soot.jpg", np.dstack([s, s * 0.98, s * 0.95]))
    # wet plaster / cold paper
    q = 196 + periodic_noise(S, S, 2.6, rng) * 34 + periodic_noise(S, S, 0.8, rng) * 12
    save_tex("mat-plaster.jpg", np.dstack([q * 0.96, q * 0.98, q]))
    # grease-stained manila
    m = 176 + periodic_noise(S, S, 2.2, rng) * 36
    stain = periodic_noise(S, S, 3.2, rng)
    m = m - np.clip(stain - 0.62, 0, 1) * 150
    save_tex("mat-manila.jpg", np.dstack([m, m * 0.9, m * 0.68]))
    print("  textures: concrete granite newsprint linen soot plaster manila")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("all", "tex"):
        build_textures()
    if which in ("all", "img"):
        build_derived()
