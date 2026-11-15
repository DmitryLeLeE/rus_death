# -*- coding: utf-8 -*-
"""
ARCHAEOLOGY OF RUSSIAN DEATH — material asset generator.
Produces the print-material layer: paper, toner, xerox, halftone, damage.
All assets are generated locally; no external images are used here.
Run:  python build/make_assets.py
"""
import os, math, random, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = os.path.join(ROOT, "assets", "textures")
PAP = os.path.join(ROOT, "assets", "paper")
OVL = os.path.join(ROOT, "assets", "overlays")
IMG = os.path.join(ROOT, "assets", "images")
for d in (TEX, PAP, OVL, IMG):
    os.makedirs(d, exist_ok=True)

rng = np.random.default_rng(20261115)
random.seed(20261115)

PAPER = (232, 226, 212)
INK = (17, 17, 17)
RED = (176, 0, 0)


def save(im, path, **kw):
    im.save(path, optimize=True, **kw)
    print("  ", os.path.relpath(path, ROOT), im.size, f"{os.path.getsize(path)//1024}K")


def smooth_noise(w, h, cells=(6, 8), seed=1, blur=18):
    """Low frequency value noise, upsampled and blurred."""
    r = np.random.default_rng(seed)
    small = r.random((cells[1], cells[0]))
    im = Image.fromarray((small * 255).astype(np.uint8), "L")
    im = im.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im).astype(np.float32) / 255.0


def fiber(w, h, seed=2, density=0.00035, length=(4, 40)):
    r = np.random.default_rng(seed)
    im = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(im)
    n = int(w * h * density)
    for _ in range(n):
        x, y = r.integers(0, w), r.integers(0, h)
        a = r.random() * math.pi
        L = r.integers(length[0], length[1])
        v = int(r.integers(40, 190))
        d.line([(x, y), (x + L * math.cos(a), y + L * math.sin(a))], fill=v, width=1)
    return im.filter(ImageFilter.GaussianBlur(0.4))


# ---------------------------------------------------------------- paper ----
def paper_grain():
    w, h = 1000, 1400
    base = np.full((h, w, 3), PAPER, dtype=np.float32)
    mott = smooth_noise(w, h, (5, 7), 11, 24)
    fine = rng.normal(0, 7, (h, w)).astype(np.float32)
    f = Image.fromarray(np.clip(128 + fine, 0, 255).astype(np.uint8), "L")
    fib = np.asarray(fiber(w, h)).astype(np.float32) / 255.0
    mod = (0.965 + 0.06 * (mott - 0.5) + 0.10 * (fib - 0.20))[..., None]
    grain = np.asarray(f).astype(np.float32)[..., None] / 255.0
    out = base * mod + (grain - 0.5) * 16
    save(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB"), os.path.join(TEX, "paper-grain.png"))

    # warm aged sheet: mottling + foxing specks + soft deckled shadow at left edge
    warm = base.copy()
    m2 = smooth_noise(w, h, (4, 6), 12, 30)
    warm *= (0.93 + 0.11 * m2)[..., None]
    fox = smooth_noise(w, h, (40, 56), 13, 6)
    spots = (fox > 0.93)
    warm[spots] *= 0.80
    yy = np.linspace(0, 1, h)[:, None, None]
    warm *= (1.0 - 0.10 * yy)
    out2 = Image.fromarray(np.clip(warm, 0, 255).astype(np.uint8), "RGB")
    out2 = Image.blend(out2, out2.filter(ImageFilter.GaussianBlur(0.6)), 0.5)
    save(out2, os.path.join(TEX, "paper-warm.png"))


# ---------------------------------------------------------------- xerox ----
def xerox():
    w, h = 1000, 1400
    base = np.full((h, w), 244.0, dtype=np.float32)
    cloud = smooth_noise(w, h, (3, 4), 21, 40)
    base -= 18 * cloud
    base += rng.normal(0, 9, (h, w))
    # toner speckle: clustered dots
    for _ in range(260):
        cx, cy = rng.integers(0, w), rng.integers(0, h)
        rr = int(rng.integers(2, 40))
        a = float(rng.uniform(0.25, 1.0))
        stamp = Image.new("L", (rr * 2, rr * 2), 0)
        ImageDraw.Draw(stamp).ellipse((0, 0, rr * 2, rr * 2), fill=int(120 * a))
        stamp = stamp.filter(ImageFilter.GaussianBlur(float(rr) * 0.35))
        x0, y0 = max(0, cx - rr), max(0, cy - rr)
        region = base[y0:y0 + stamp.size[1], x0:x0 + stamp.size[0]]
        s = np.asarray(stamp)[:region.shape[0], :region.shape[1]].astype(np.float32)
        base[y0:y0 + region.shape[0], x0:x0 + region.shape[1]] = np.clip(region - s * 0.55, 0, 255)
    # horizontal scanner smear bands
    for _ in range(14):
        y = rng.integers(0, h)
        band = rng.integers(2, 16)
        base[y:y + band] *= float(rng.uniform(0.86, 0.97))
    # hard edge shadow: book gutter
    x = np.linspace(0, 1, w)[None, :]
    base *= (1 - 0.30 * np.exp(-(x ** 2) / 0.0022))
    im = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "L")
    # photocopy gradient crush
    im = im.point(lambda v: int(min(255, max(0, (v - 10) * 1.10))))
    save(im.convert("RGB"), os.path.join(TEX, "xerox-dirty.png"))

    # heavy toner field with alpha — for multiply layering
    tw, th = 900, 1200
    a = np.zeros((th, tw), dtype=np.float32)
    n = smooth_noise(tw, th, (5, 6), 22, 26)
    a += np.clip((n - 0.55) * 5.0, 0, 1) * 0.85
    for _ in range(700):
        cx, cy = rng.integers(0, tw), rng.integers(0, th)
        rr = int(abs(rng.normal(1.6, 2.2)) + 1)
        yy, xx = np.ogrid[-rr:rr + 1, -rr:rr + 1]
        m = (xx * xx + yy * yy) <= rr * rr
        y0, y1 = max(0, cy - rr), min(th, cy + rr + 1)
        x0, x1 = max(0, cx - rr), min(tw, cx + rr + 1)
        if y0 >= y1 or x0 >= x1:
            continue
        a[y0:y1, x0:x1] = np.maximum(a[y0:y1, x0:x1], m[:y1 - y0, :x1 - x0] * rng.uniform(0.35, 1.0))
    rgba = np.zeros((th, tw, 4), dtype=np.uint8)
    rgba[..., 0:3] = INK
    rgba[..., 3] = np.clip(a * 255, 0, 255).astype(np.uint8)
    save(Image.fromarray(rgba, "RGBA"), os.path.join(TEX, "toner-field.png"))


def scanner_lines():
    w, h = 1000, 1400
    base = np.full((h, w), 247.0, dtype=np.float32)
    for y in range(h):
        if rng.random() < 0.16:
            base[y] -= rng.uniform(4, 34)
    for _ in range(30):
        y = rng.integers(0, h)
        base[y:y + 1] -= rng.uniform(40, 120)
    base += rng.normal(0, 6, (h, w))
    # occasional pale ghost band from a previous scan pass
    for _ in range(3):
        y = rng.integers(0, h - 200)
        hh = rng.integers(40, 200)
        base[y:y + hh] = base[y:y + hh] * 0.985 + 3
    im = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "L")
    save(im.convert("RGB"), os.path.join(TEX, "scanner-lines.png"))


def halftone_tile(period=9, angle=27.0, size=360, coverage=0.5):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
    th = math.radians(angle)
    u = xx * math.cos(th) + yy * math.sin(th)
    v = -xx * math.sin(th) + yy * math.cos(th)
    s = 0.5 + 0.5 * np.cos(2 * math.pi * u / period) * np.cos(2 * math.pi * v / period)
    return s


def halftone_asset():
    size = 360
    s = halftone_tile(period=9, angle=27, size=size)
    img = (np.clip((s - 0.02) * 255, 0, 255)).astype(np.uint8)
    im = Image.fromarray(img, "L")
    # make seamless-ish by mirroring quadrants
    im2 = Image.new("L", (size * 2, size * 2))
    im2.paste(im, (0, 0)); im2.paste(im.transpose(Image.FLIP_LEFT_RIGHT), (size, 0))
    im2.paste(im.transpose(Image.FLIP_TOP_BOTTOM), (0, size))
    im2.paste(im.transpose(Image.ROTATE_180), (size, size))
    save(im2.convert("RGB"), os.path.join(TEX, "halftone-screen.png"))


def misregistration():
    w, h = 800, 900
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    # horizontal bands where red and black impressions slipped apart
    for _ in range(26):
        y = rng.integers(0, h - 30)
        hh = rng.integers(3, 22)
        x0 = rng.integers(0, w // 2)
        x1 = rng.integers(w // 2, w)
        col = RED if rng.random() < 0.45 else INK
        al = rng.integers(30, 120)
        rgba[y:y + hh, x0:x1] = (*col, al)
    # offset ghost edges of a printed rule
    for _ in range(5):
        y = rng.integers(0, h)
        dx = rng.integers(3, 9)
        rgba[y:y + 2, 60:740] = (*INK, 150)
        rgba[y + 2:y + 4, 60 + dx:740 + dx] = (*RED, 90)
    save(Image.fromarray(rgba, "RGBA"), os.path.join(TEX, "misregistration.png"))


# ---------------------------------------------------------------- damage ----
def ink_stains():
    w = h = 900
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    layers = []
    for _ in range(5):
        layer = Image.new("L", (w, h), 0)
        d = ImageDraw.Draw(layer)
        cx, cy = rng.integers(150, w - 150), rng.integers(150, h - 150)
        pts = []
        n = 16
        for i in range(n):
            a = 2 * math.pi * i / n
            r = rng.uniform(40, 150)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a) * rng.uniform(0.7, 1.3)))
        d.polygon(pts, fill=190)
        layer = layer.filter(ImageFilter.GaussianBlur(float(rng.uniform(6, 18))))
        layers.append(np.asarray(layer).astype(np.float32) / 255.0)
    a = np.clip(sum(layers), 0, 1) ** 1.4
    rgba[..., 0:3] = (12, 10, 9)
    rgba[..., 3] = (a * 235).astype(np.uint8)
    save(Image.fromarray(rgba, "RGBA"), os.path.join(TEX, "ink-stain.png"))

    # pale wash stain for paper
    layer = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(layer)
    cx, cy = 520, 380
    for r in range(240, 20, -12):
        v = int(30 + (240 - r) * 0.35)
        d.ellipse((cx - r, cy - r * 0.8, cx + r, cy + r * 0.8), outline=v, width=6)
    layer = layer.filter(ImageFilter.GaussianBlur(10))
    a2 = np.asarray(layer).astype(np.float32) / 255.0
    rgba2 = np.zeros((h, w, 4), dtype=np.uint8)
    rgba2[..., 0:3] = (120, 104, 78)
    rgba2[..., 3] = np.clip(a2 * 200, 0, 255).astype(np.uint8)
    save(Image.fromarray(rgba2, "RGBA"), os.path.join(TEX, "wash-stain.png"))


def dust_and_scratches():
    w, h = 1000, 1400
    # black dust on transparency (for pale surfaces)
    for name, color, count in (("dust-dark.png", (10, 10, 10), 2600), ("dust-light.png", (250, 250, 250), 2200)):
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        im = Image.new("L", (w, h), 0)
        d = ImageDraw.Draw(im)
        for _ in range(count):
            x, y = rng.integers(0, w), rng.integers(0, h)
            r = abs(rng.normal(0.8, 1.1))
            d.ellipse((x - r, y - r, x + r, y + r), fill=int(rng.uniform(60, 255)))
        for _ in range(45):
            x0, y0 = rng.integers(0, w), rng.integers(0, h)
            L = rng.integers(30, 260)
            a = rng.normal(0, 0.55)
            d.line((x0, y0, x0 + L * math.cos(a), y0 + L * math.sin(a)), fill=int(rng.uniform(50, 160)), width=1)
        a = np.asarray(im.filter(ImageFilter.GaussianBlur(0.5))).astype(np.uint8)
        rgba[..., 0:3] = color
        rgba[..., 3] = a
        save(Image.fromarray(rgba, "RGBA"), os.path.join(OVL, name))

    # creases: folded sheet, light and dark ridges
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    im = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(im)
    for _ in range(9):
        x0, y0 = rng.integers(-100, w), rng.integers(0, h // 2)
        x1, y1 = x0 + rng.integers(200, 900), y0 + rng.integers(120, 700)
        d.line((x0, y0, x1, y1), fill=int(rng.uniform(70, 170)), width=rng.integers(1, 4))
    im = im.filter(ImageFilter.GaussianBlur(1.1))
    a = np.asarray(im)
    rgba[..., 0:3] = 255
    rgba[..., 3] = (a * 0.55).astype(np.uint8)
    save(Image.fromarray(rgba, "RGBA"), os.path.join(OVL, "creases.png"))


# ------------------------------------------------------------- halftoning ---
def halftone_image(src, dst, max_w=1200, period=6.5, angle=27.0, sharp=True):
    im = Image.open(src).convert("L")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    w, h = im.size
    g = np.asarray(im).astype(np.float32) / 255.0
    # gentle tonal crush like a screen print
    g = np.clip((g - 0.06) * 1.12, 0, 1)
    s = halftone_tile(period=period, angle=angle, size=1)[0, 0]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    th = math.radians(angle)
    u = xx * math.cos(th) + yy * math.sin(th)
    v = -xx * math.sin(th) + yy * math.cos(th)
    screen = 0.5 + 0.5 * np.cos(2 * math.pi * u / period) * np.cos(2 * math.pi * v / period)
    out = (g > screen).astype(np.uint8) * 255
    img = Image.fromarray(out, "L")
    if sharp:
        img = img.filter(ImageFilter.MedianFilter(3))
    img = img.convert("RGB")
    save(img, dst)


def xerox_image(src, dst, max_w=1300, seed=5):
    r = np.random.default_rng(seed)
    im = Image.open(src).convert("L")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    w, h = im.size
    a = np.asarray(im).astype(np.float32)
    a = (a - 128) * 1.28 + 132           # crush contrast
    a += smooth_noise(w, h, (5, 6), 31, 22) * 40 - 20
    # toner dropout: random white specks
    mask = r.random((h, w)) < 0.012
    a[mask] = np.clip(a[mask] + r.uniform(40, 140, mask.sum()), 0, 255)
    # ink smears
    sm = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(sm)
    for _ in range(7):
        x, y = r.integers(0, w), r.integers(0, h)
        d.line((x, y, x + r.integers(-200, 200), y + r.integers(-12, 12)), fill=90, width=r.integers(2, 9))
    a -= np.asarray(sm.filter(ImageFilter.GaussianBlur(2))).astype(np.float32) * 0.55
    # edge burn
    xx = np.linspace(0, 1, w)[None, :]
    a *= (1 - 0.22 * np.exp(-((xx - 0.5) ** 2) / 0.18))
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "L")
    out = out.point(lambda v: 255 if v > 232 else int(v * 0.96))
    save(out.convert("RGB"), dst)


def duotone(src, dst, max_w=1400, dark=(18, 16, 15), light=(232, 226, 212)):
    im = Image.open(src).convert("L")
    if im.width > max_w:
        im = im.resize((max_w, int(im.height * max_w / im.width)), Image.LANCZOS)
    g = np.asarray(im).astype(np.float32)[..., None] / 255.0
    arr = np.array(dark) * (1 - g) + np.array(light) * g
    save(Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB"), dst)


if __name__ == "__main__":
    print("paper")
    paper_grain()
    print("xerox")
    xerox()
    print("scanner")
    scanner_lines()
    print("halftone screen")
    halftone_asset()
    print("misregistration")
    misregistration()
    print("stains")
    ink_stains()
    print("dust / creases")
    dust_and_scratches()
    print("photo derivatives")
    halftone_image(os.path.join(IMG, "perov-funeral.jpg"), os.path.join(IMG, "perov-funeral-halftone.png"))
    halftone_image(os.path.join(IMG, "last-judgment-volga.jpg"), os.path.join(IMG, "last-judgment-halftone.png"), max_w=900)
    xerox_image(os.path.join(IMG, "memorial-meal-1881.jpg"), os.path.join(IMG, "memorial-meal-xerox.png"))
    duotone(os.path.join(IMG, "donskoy-1913.jpg"), os.path.join(IMG, "donskoy-1913-duotone.png"))
    print("done")

