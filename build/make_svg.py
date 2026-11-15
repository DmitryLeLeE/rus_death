# -*- coding: utf-8 -*-
"""
Generates the drawn layer of the atlas: torn-paper clip paths, paper strips,
tape, editorial hand marks, and the technical diagrams (all original vector work).

Outputs:
  assets/paper/torn-masks.svg      sprite of <clipPath> defs (inlined once per page)
  assets/paper/tape-masks.svg      tape-end clip defs
  assets/illustrations/hand-marks.svg   symbol sprite (arrows, rings, ticks, brackets)
  assets/illustrations/*.svg       diagrams, referenced with <img>
"""
import os, math, random, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAPER = os.path.join(ROOT, "assets", "paper")
ILL = os.path.join(ROOT, "assets", "illustrations")
os.makedirs(PAPER, exist_ok=True)
os.makedirs(ILL, exist_ok=True)

INK = "#111111"
RED = "#B00000"
PAPER_C = "#E8E2D4"


def rnd(seed):
    r = random.Random(seed)
    return r


def edge_points(r, n, amp, axis, const, length, start, end):
    """Points along an edge with outward jitter. axis 'x' or 'y' varies."""
    pts = []
    for i in range(n + 1):
        t = start + (end - start) * i / n
        j = r.gauss(0, amp) + (amp * 0.9 if r.random() < 0.12 else 0)
        if axis == "x":
            pts.append((min(1.02, max(-0.02, t)), const + j))
        else:
            pts.append((const + j, min(1.02, max(-0.02, t))))
    return pts


def torn_polygon(seed, top=True, right=True, bottom=True, left=True, amp=0.014, rough=1.0):
    """Closed outline of a sheet whose torn sides wander and whose cut sides are straight.
    Corners are emitted in order so that skipping an edge yields a straight edge, never a diagonal."""
    r = rnd(seed)
    pts = [(0.0, 0.0)]
    if top:
        pts += edge_points(r, 26, amp * rough, "x", 0.0, 1, 0.02, 0.98)
    else:
        pts.append((1.0, 0.0))
    if right:
        pts += edge_points(r, 34, amp * rough, "y", 1.0, 1, 0.02, 0.98)
    else:
        pts.append((1.0, 1.0))
    if bottom:
        pts += edge_points(r, 26, amp * rough, "x", 1.0, 1, 0.98, 0.02)
    else:
        pts.append((0.0, 1.0))
    if left:
        pts += edge_points(r, 34, amp * rough, "y", 0.0, 1, 0.98, 0.02)
    return pts


def path_from(pts, close=True):
    d = "M " + " L ".join(f"{x:.4f} {y:.4f}" for x, y in pts)
    return d + (" Z" if close else "")


def torn_clip_defs():
    specs = [
        ("torn-01", dict(seed=11, top=True, right=False, bottom=False, left=False, amp=0.034, rough=1.0)),
        ("torn-02", dict(seed=23, top=True, right=True, bottom=True, left=True, amp=0.023, rough=1.3)),
        ("torn-03", dict(seed=37, top=False, right=False, bottom=True, left=True, amp=0.029, rough=1.15)),
        ("torn-04", dict(seed=41, top=False, right=True, bottom=False, left=False, amp=0.040, rough=1.0)),
        ("torn-05", dict(seed=59, top=True, right=True, bottom=False, left=False, amp=0.019, rough=0.9)),
        ("torn-06", dict(seed=67, top=True, right=False, bottom=True, left=False, amp=0.046, rough=1.4)),
    ]
    out = ['<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" class="clip-sprite">']
    for name, kw in specs:
        pts = torn_polygon(**kw)
        out.append(f'  <clipPath id="{name}" clipPathUnits="objectBoundingBox"><path d="{path_from(pts)}"/></clipPath>')
    # strip and hole shapes, useful for narrow paper bands
    strip = torn_polygon(seed=71, top=True, right=False, bottom=True, left=False, amp=0.05, rough=1.0)
    out.append(f'  <clipPath id="torn-strip" clipPathUnits="objectBoundingBox"><path d="{path_from(strip)}"/></clipPath>')
    hole = torn_polygon(seed=83, top=True, right=True, bottom=True, left=True, amp=0.02, rough=1.2)
    out.append(f'  <clipPath id="torn-hole" clipPathUnits="objectBoundingBox"><path d="M0 0 H1 V1 H0 Z {path_from(hole)}" clip-rule="evenodd"/></clipPath>')
    # tape ends: tapered, ragged short edges
    for i, seed in enumerate((101, 113)):
        r = rnd(seed)
        y0 = 0.06 + r.random() * 0.03
        pts = [(0.0, y0)]
        x = 0.0
        while x < 1.0:
            x += 0.02
            y0 = min(0.16, max(0.0, y0 + r.gauss(0, 0.004)))
            pts.append((min(1.0, x), y0))
        yb = 0.92 - r.random() * 0.04
        pts.append((1.0, yb))
        x = 1.0
        while x > 0.0:
            x -= 0.02
            yb = min(1.0, max(0.84, yb + r.gauss(0, 0.004)))
            pts.append((max(0.0, x), yb))
        out.append(f'  <clipPath id="tape-0{i+1}" clipPathUnits="objectBoundingBox"><path d="{path_from(pts)}"/></clipPath>')
    out.append("</svg>")
    open(os.path.join(PAPER, "torn-masks.svg"), "w", encoding="utf-8").write("\n".join(out))
    print("torn-masks.svg", len("\n".join(out)))


def hand_marks():
    defs = []
    # arrows: five different gestures
    defs.append('''<symbol id="arrow-long" viewBox="0 0 220 60">
  <path d="M4 44 C 60 40, 120 30, 208 12" fill="none"/>
  <path d="M186 4 L 210 11 L 192 30" fill="none"/></symbol>''')
    defs.append('''<symbol id="arrow-hook" viewBox="0 0 160 120">
  <path d="M8 8 C 40 10, 40 90, 96 96 C 118 99, 132 88, 142 72" fill="none"/>
  <path d="M124 70 L 144 70 L 138 92" fill="none"/></symbol>''')
    defs.append('''<symbol id="arrow-down" viewBox="0 0 60 200">
  <path d="M26 6 C 30 40, 34 90, 32 168" fill="none"/>
  <path d="M18 150 L 33 178 L 46 152" fill="none"/></symbol>''')
    # rings, cross-outs, ticks
    defs.append('<symbol id="ring-a" viewBox="0 0 120 90"><path d="M24 44 C 20 16, 92 8, 104 36 C 116 68, 46 84, 20 60 C 8 49, 12 30, 30 22" fill="none"/></symbol>')
    defs.append('<symbol id="cross-out" viewBox="0 0 200 80"><path d="M6 12 C 60 34, 140 46, 196 66" fill="none"/><path d="M12 68 C 70 50, 130 30, 192 14" fill="none"/></symbol>')
    defs.append('<symbol id="tick" viewBox="0 0 80 80"><path d="M10 44 C 22 50, 28 60, 34 70 C 44 44, 58 24, 74 8" fill="none"/></symbol>')
    defs.append('<symbol id="bracket" viewBox="0 0 40 200"><path d="M34 4 C 12 30, 12 170, 34 196" fill="none"/><path d="M34 4 L 12 4" fill="none"/><path d="M34 196 L 12 196" fill="none"/></symbol>')
    defs.append('<symbol id="underline-double" viewBox="0 0 300 40"><path d="M4 12 C 80 8, 210 16, 296 10" fill="none"/><path d="M4 30 C 90 26, 200 34, 296 28" fill="none"/></symbol>')
    defs.append('<symbol id="scribble" viewBox="0 0 200 60"><path d="M4 30 C 30 8, 40 52, 66 28 C 92 6, 100 54, 126 30 C 152 8, 160 50, 196 26" fill="none"/></symbol>')
    defs.append('<symbol id="eye-mark" viewBox="0 0 140 80"><path d="M4 40 C 30 10, 110 10, 136 40 C 110 70, 30 70, 4 40 Z" fill="none"/><circle cx="70" cy="40" r="14" fill="none"/><circle cx="70" cy="40" r="3" fill="currentColor" stroke="none"/></symbol>')
    defs.append('<symbol id="asterisk" viewBox="0 0 80 80"><path d="M40 4 V76 M8 22 L72 58 M72 22 L8 58" fill="none"/></symbol>')
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" class="mark-sprite">
<style>
  .mark-sprite symbol path, .mark-sprite symbol circle {{ stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; fill: none; }}
</style>
{chr(10).join(defs)}
</svg>'''
    open(os.path.join(ILL, "hand-marks.svg"), "w", encoding="utf-8").write(svg)
    print("hand-marks.svg", len(svg))


def svg_doc(w, h, body, extra=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'role="img" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">'
            f'{extra}{body}</svg>')


def cross_typology():
    """Four grave-cross types, drawn as measured elevations. Geometry only; labels are HTML."""
    W, H = 900, 460
    s = f'<g stroke="{INK}" stroke-width="2">'
    # 1. eight-pointed Orthodox cross
    cx = 130
    s += f'<line x1="{cx}" y1="40" x2="{cx}" y2="400"/>'
    s += f'<line x1="{cx-92}" y1="118" x2="{cx+92}" y2="118"/>'          # big crossbar
    s += f'<line x1="{cx-52}" y1="182" x2="{cx+52}" y2="182"/>'          # small crossbar
    s += f'<line x1="{cx-34}" y1="278" x2="{cx+70}" y2="318"/>'          # oblique foot
    s += f'<rect x="{cx-46}" y="352" width="92" height="16"/>'           # base
    # 2. six-pointed
    cx = 340
    s += f'<line x1="{cx}" y1="70" x2="{cx}" y2="400"/>'
    s += f'<line x1="{cx-76}" y1="150" x2="{cx+76}" y2="150"/>'
    s += f'<line x1="{cx-40}" y1="212" x2="{cx+40}" y2="212"/>'
    s += f'<line x1="{cx}" y1="360" x2="{cx}" y2="400" stroke-width="6"/>'
    # 3. four-pointed with roof and fence
    cx = 560
    s += f'<path d="M{cx-92} 128 L {cx} 74 L {cx+92} 128"/>'
    s += f'<line x1="{cx}" y1="74" x2="{cx}" y2="398"/>'
    s += f'<line x1="{cx-44}" y1="188" x2="{cx+44}" y2="188"/>'
    s += f'<line x1="{cx-70}" y1="330" x2="{cx-70}" y2="398" stroke-width="1.5"/>'
    s += f'<line x1="{cx+70}" y1="330" x2="{cx+70}" y2="398" stroke-width="1.5"/>'
    # 4. roofed cross / golubets: plank roof over cross
    cx = 780
    s += f'<path d="M{cx-98} 132 L {cx} 58 L {cx+98} 132"/>'
    s += f'<path d="M{cx-98} 132 L {cx+98} 132" stroke-width="7"/>'
    s += f'<line x1="{cx}" y1="132" x2="{cx}" y2="398"/>'
    s += f'<line x1="{cx-50}" y1="192" x2="{cx+50}" y2="192"/>'
    s += f'<path d="M{cx-106} 398 L {cx+106} 398" stroke-width="5"/>'
    s += '</g>'
    # dimension marks
    s += f'<g stroke="{INK}" stroke-width="1">'
    for x0, x1 in ((60, 412), (280, 640), (500, 900)):
        s += f'<line x1="{x0}" y1="440" x2="{x1}" y2="440"/>'
        s += f'<line x1="{x0}" y1="434" x2="{x0}" y2="446"/><line x1="{x1}" y1="434" x2="{x1}" y2="446"/>'
    s += '</g>'
    open(os.path.join(ILL, "cross-typology.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("cross-typology.svg")


def ritual_sequence():
    """Six line vignettes of the funeral sequence, arranged as a strip."""
    W, H = 1080, 210
    s = f'<g stroke="{INK}" stroke-width="2" fill="none">'
    # 1 washing: bowl + cloth + hand
    s += '<ellipse cx="70" cy="120" rx="46" ry="16"/><path d="M24 120 C 26 150, 114 150, 116 120"/>'
    s += '<path d="M52 168 C 60 186, 96 186, 100 168" stroke-width="1.5"/>'
    s += '<path d="M56 96 C 62 78, 84 78, 90 96" />'
    # 2 comb / hair
    s += '<g transform="translate(210,0)"><rect x="18" y="86" width="84" height="16" rx="3"/>'
    for i in range(7):
        s += f'<line x1="{24+i*12}" y1="102" x2="{24+i*12}" y2="{132}"/>'
    s += '<path d="M20 150 C 60 138, 100 162, 120 146" stroke-width="1.5"/></g>'
    # 3 coffin
    s += '<g transform="translate(380,0)"><path d="M26 168 L 20 118 L 46 76 L 104 76 L 130 118 L 124 168 Z"/>'
    s += '<path d="M46 76 L 46 168 M104 76 L 104 168" stroke-width="1"/></g>'
    # 4 procession: two figures + cross
    s += '<g transform="translate(560,0)"><line x1="40" y1="70" x2="40" y2="170" stroke-width="4"/>'
    s += '<line x1="18" y1="100" x2="62" y2="100" stroke-width="3"/>'
    s += '<circle cx="110" cy="92" r="14"/><path d="M96 110 L 96 168 M124 110 L 124 168 M96 130 L 124 130"/>'
    s += '<circle cx="160" cy="98" r="12"/><path d="M148 114 L 148 168 M172 114 L 172 168 M148 132 L 172 132"/></g>'
    # 5 grave: mound + cross + spade
    s += '<g transform="translate(760,0)"><path d="M16 168 C 40 140, 130 140, 168 168"/>'
    s += '<line x1="92" y1="86" x2="92" y2="152" stroke-width="4"/><line x1="74" y1="110" x2="110" y2="110" stroke-width="3"/>'
    s += '<line x1="150" y1="60" x2="176" y2="168" stroke-width="3"/><path d="M146 56 L 160 56 L 164 74 L 142 74 Z"/></g>'
    # 6 meal: table + cup + bread
    s += '<g transform="translate(940,0)"><line x1="10" y1="120" x2="120" y2="120" stroke-width="4"/>'
    s += '<line x1="20" y1="120" x2="14" y2="168"/><line x1="110" y1="120" x2="116" y2="168"/>'
    s += '<path d="M40 96 L 40 116 M34 96 L 46 96 M36 108 C 36 116, 44 116, 44 108"/>'
    s += '<ellipse cx="86" cy="112" rx="18" ry="7"/><path d="M70 108 C 74 100, 98 100, 102 108"/></g>'
    s += '</g>'
    # sequence rules
    s += f'<g stroke="{INK}" stroke-width="1" opacity="0.5">'
    for x in (176, 356, 528, 726, 916):
        s += f'<line x1="{x}" y1="40" x2="{x}" y2="190" stroke-dasharray="3 4"/>'
    s += '</g>'
    open(os.path.join(ILL, "ritual-sequence.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("ritual-sequence.svg")


def soul_path():
    """A schematic of commemorative days, drawn as an arc with three stations."""
    W, H = 900, 420
    s = f'<g stroke="{INK}" stroke-width="1.6" fill="none">'
    s += '<path d="M60 330 C 260 330, 300 120, 450 120 C 600 120, 640 330, 840 330"/>'
    s += '<path d="M60 330 C 260 330, 300 150, 450 150 C 600 150, 640 330, 840 330" stroke-dasharray="6 6" opacity="0.6"/>'
    for x, y, r in ((60, 330, 7), (450, 120, 9), (840, 330, 7)):
        s += f'<circle cx="{x}" cy="{y}" r="{r}"/>'
    # day markers: 3, 9, 40 along the arc
    pts3 = (255, 224); pts9 = (345, 168); pts40 = (555, 168)
    for (x, y) in (pts3, pts9, pts40):
        s += f'<line x1="{x}" y1="{y-16}" x2="{x}" y2="{y+16}" stroke="{RED}"/>'
        s += f'<circle cx="{x}" cy="{y}" r="3" fill="{RED}" stroke="none"/>'
    s += '</g>'
    # lower register: vertical ticks for the first year
    s += f'<g stroke="{INK}" stroke-width="1">'
    for i in range(13):
        x = 90 + i * 60
        s += f'<line x1="{x}" y1="360" x2="{x}" y2="{376 if i%3 else 390}"/>'
    s += '</g>'
    open(os.path.join(ILL, "soul-path.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("soul-path.svg")


def cemetery_plan():
    """Schematic cemetery plan. Geometry only: paths, grave rows, chapel, gate, wall."""
    W, H = 760, 560
    s = f'<g stroke="{INK}" stroke-width="1.6" fill="none">'
    s += f'<rect x="30" y="30" width="700" height="500"/>'
    s += '<path d="M30 300 C 200 286, 300 320, 470 300 C 600 286, 690 300, 730 292" stroke-dasharray="10 6"/>'
    s += '<path d="M380 30 L 380 300" stroke-dasharray="4 6" opacity="0.7"/>'
    s += '<rect x="300" y="96" width="76" height="56"/>'
    s += '<path d="M300 96 L 338 66 L 376 96"/>'
    s += '<line x1="338" y1="66" x2="338" y2="46"/>'
    s += '<line x1="326" y1="54" x2="350" y2="54"/>'
    for row in range(6):
        y = 120 + row * 26
        for col in range(9):
            x = 70 + col * 26
            if 300 < x < 380 and 96 < y < 152:
                continue
            s += f'<rect x="{x}" y="{y}" width="14" height="20" stroke-width="1"/>'
    for row in range(5):
        y = 340 + row * 24
        for col in range(8):
            x = 90 + col * 30
            s += f'<path d="M{x} {y+18} L{x} {y+4} M{x-6} {y+9} L{x+6} {y+9}" stroke-width="1"/>'
    s += '</g>'
    # gate + red route
    s += f'<g stroke="{RED}" stroke-width="2" fill="none">'
    s += '<path d="M56 520 L 56 430 L 300 430 L 338 300 L 338 152"/>'
    s += '<path d="M50 520 L 62 520 M50 512 L 62 512"/>'
    s += '</g>'
    s += f'<g stroke="{INK}" stroke-width="1" opacity="0.55">'
    s += '<line x1="30" y1="540" x2="180" y2="540"/><line x1="30" y1="536" x2="30" y2="544"/><line x1="180" y1="536" x2="180" y2="544"/>'
    s += '</g>'
    open(os.path.join(ILL, "cemetery-plan.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("cemetery-plan.svg")


def threshold_diagram():
    """Two fields divided by a red threshold band; small marks for the ritual prohibitions."""
    W, H = 900, 300
    s = f'<g stroke="{INK}" stroke-width="1.4" fill="none">'
    s += '<rect x="20" y="20" width="860" height="260"/>'
    s += '</g>'
    s += f'<rect x="410" y="20" width="80" height="260" fill="{RED}" opacity="0.9"/>'
    s += f'<g stroke="{PAPER_C}" stroke-width="1.2" fill="none">'
    for i in range(14):
        y = 30 + i * 18
        s += f'<line x1="418" y1="{y}" x2="482" y2="{y+8}" opacity="0.55"/>'
    s += '</g>'
    # left: house / living
    s += f'<g stroke="{INK}" stroke-width="1.6" fill="none">'
    s += '<path d="M60 180 L 60 260 L 240 260 L 240 180"/><path d="M50 182 L 150 110 L 250 182"/>'
    s += '<rect x="88" y="210" width="34" height="50"/><rect x="176" y="200" width="40" height="34"/>'
    s += '</g>'
    # right: grave / dead
    s += f'<g stroke="{INK}" stroke-width="1.6" fill="none">'
    s += '<path d="M600 260 C 630 226, 740 226, 770 260"/>'
    s += '<line x1="686" y1="150" x2="686" y2="246" stroke-width="3"/>'
    s += '<line x1="664" y1="178" x2="708" y2="178" stroke-width="2"/>'
    s += '<line x1="660" y1="140" x2="712" y2="140" stroke-width="1" opacity="0.6"/>'
    s += '</g>'
    # arrows crossing threshold
    s += f'<g stroke="{INK}" stroke-width="1.2" fill="none">'
    s += '<path d="M300 120 L 390 120"/><path d="M378 114 L 392 120 L 378 126"/>'
    s += '<path d="M510 200 L 600 200"/><path d="M588 194 L 602 200 L 588 206"/>'
    s += '</g>'
    open(os.path.join(ILL, "threshold-diagram.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("threshold-diagram.svg")


def colophon_mark():
    W = H = 200
    s = f'<g stroke="{INK}" stroke-width="2" fill="none">'
    s += '<circle cx="100" cy="100" r="72"/><circle cx="100" cy="100" r="52" stroke-width="1"/>'
    s += '<path d="M100 28 L 100 172 M28 100 L 172 100"/>'
    s += '<path d="M40 40 L 160 160 M160 40 L 40 160" stroke-width="0.8" opacity="0.5"/>'
    s += '</g>'
    open(os.path.join(ILL, "colophon-mark.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("colophon-mark.svg")


def empty_house():
    """A village log house drawn as a sagging elevation: the domestic form of abandonment."""
    W, H = 900, 520
    s = f'<g stroke="{INK}" stroke-width="1.7" fill="none">'
    # ground
    s += '<line x1="40" y1="430" x2="860" y2="430" stroke-width="2.2"/>'
    # sagging roof: ridge dips in the middle
    s += '<path d="M120 250 C 300 214, 560 214, 760 250"/>'
    s += '<path d="M100 262 L 450 172 L 800 262" stroke-width="2"/>'
    # log walls
    s += '<rect x="150" y="258" width="600" height="172"/>'
    for y in range(288, 430, 12):
        s += f'<line x1="150" y1="{y}" x2="750" y2="{y}" stroke-width="1" opacity="0.55"/>'
    # door
    s += '<rect x="410" y="320" width="70" height="110"/>'
    s += '<circle cx="466" cy="376" r="3" fill="none"/>'
    # windows: two dark squares — the house is empty
    s += f'<rect x="200" y="300" width="64" height="56" fill="{INK}"/>'
    s += f'<rect x="620" y="300" width="64" height="56" fill="{INK}"/>'
    # broken shutter hanging from one window
    s += '<path d="M620 300 L 596 356" stroke-width="1.4"/>'
    s += '<rect x="580" y="352" width="46" height="6" transform="rotate(-14 603 355)"/>'
    # a tilted fence post beside the house
    s += '<line x1="800" y1="380" x2="826" y2="430" stroke-width="2.4"/>'
    s += '<line x1="796" y1="392" x2="828" y2="392" stroke-width="1.4"/>'
    s += '</g>'
    # red survey mark: someone has been here
    s += f'<g stroke="{RED}" stroke-width="1.4" fill="none">'
    s += '<line x1="40" y1="120" x2="40" y2="430"/>'
    s += '<line x1="30" y1="120" x2="50" y2="120"/>'
    s += '<line x1="30" y1="430" x2="50" y2="430"/>'
    s += '</g>'
    open(os.path.join(ILL, "empty-house.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("empty-house.svg")


def wooden_church():
    """A tent-roofed wooden church drawn as a schematic elevation."""
    W, H = 900, 620
    s = f'<g stroke="{INK}" stroke-width="1.7" fill="none">'
    s += '<line x1="40" y1="540" x2="860" y2="540" stroke-width="2.2"/>'
    # log base with a porch
    s += '<rect x="250" y="360" width="400" height="180"/>'
    for y in range(390, 540, 12):
        s += f'<line x1="250" y1="{y}" x2="650" y2="{y}" stroke-width="1" opacity="0.5"/>'
    s += '<rect x="330" y="430" width="60" height="110"/>'
    # second tier (octagon)
    s += '<path d="M300 360 L 310 260 L 590 260 L 600 360"/>'
    for y in range(300, 360, 12):
        s += f'<line x1="{310 - (y - 300) * 0.0}" y1="{y}" x2="{590}" y2="{y}" stroke-width="1" opacity="0.4"/>'
    # tent roof
    s += '<path d="M300 262 L 450 120 L 600 262"/>'
    s += '<path d="M450 120 L 450 60" stroke-width="2"/>'
    # cupola + cross
    s += '<path d="M450 60 C 452 44, 448 44, 450 30" stroke-width="1.6"/>'
    s += '<line x1="450" y1="6" x2="450" y2="52" stroke-width="2.4"/>'
    s += '<line x1="436" y1="24" x2="464" y2="24" stroke-width="2"/>'
    # narrow window slits
    s += f'<rect x="360" y="300" width="16" height="40" fill="{INK}"/>'
    s += f'<rect x="524" y="300" width="16" height="40" fill="{INK}"/>'
    s += '</g>'
    s += f'<g stroke="{RED}" stroke-width="1.4" fill="none">'
    s += '<line x1="860" y1="90" x2="860" y2="540"/>'
    s += '<line x1="850" y1="90" x2="870" y2="90"/>'
    s += '<line x1="850" y1="540" x2="870" y2="540"/>'
    s += '</g>'
    open(os.path.join(ILL, "wooden-church.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("wooden-church.svg")


def post_soviet_plot():
    """A contemporary grave plot: fence, granite, an unreadable portrait, a wreath, a bench.
    Drawn as a measured schematic, not as a photograph of any specific grave."""
    W, H = 900, 520
    s = f'<g stroke="{INK}" stroke-width="1.7" fill="none">'
    s += '<line x1="40" y1="452" x2="860" y2="452" stroke-width="2.2"/>'
    # metal fence (ograda): posts + two rails around the plot
    for x in (150, 260, 370, 480, 590, 700):
        s += f'<line x1="{x}" y1="330" x2="{x}" y2="452" stroke-width="1.6"/>'
    s += '<line x1="140" y1="352" x2="710" y2="352" stroke-width="1.2"/>'
    s += '<line x1="140" y1="420" x2="710" y2="420" stroke-width="1.2"/>'
    s += '<line x1="140" y1="330" x2="140" y2="452" stroke-width="2"/>'
    s += '<line x1="710" y1="330" x2="710" y2="452" stroke-width="2"/>'
    # granite slab with an oval portrait (left unreadable)
    s += '<rect x="290" y="272" width="180" height="150" stroke-width="2.2"/>'
    s += '<ellipse cx="380" cy="316" rx="42" ry="50" stroke-width="1.6"/>'
    s += '<line x1="352" y1="316" x2="408" y2="316" stroke-width="1" opacity="0.6"/>'
    s += '<line x1="352" y1="334" x2="408" y2="334" stroke-width="1" opacity="0.45"/>'
    # a plastic wreath leaning against the stone
    s += '<circle cx="520" cy="360" r="46" stroke-width="1.4"/>'
    for a in range(0, 360, 22):
        import math as _m
        x1 = 520 + 46 * _m.cos(_m.radians(a))
        y1 = 360 + 46 * _m.sin(_m.radians(a))
        x2 = 520 + 30 * _m.cos(_m.radians(a + 9))
        y2 = 360 + 30 * _m.sin(_m.radians(a + 9))
        s += f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke-width="0.8" opacity="0.7"/>'
    # a small bench
    s += '<line x1="600" y1="420" x2="668" y2="420" stroke-width="2"/>'
    s += '<line x1="604" y1="420" x2="600" y2="452"/><line x1="664" y1="420" x2="668" y2="452"/>'
    # gravel hatch
    for x in range(160, 700, 14):
        s += f'<line x1="{x}" y1="452" x2="{x+5}" y2="472" stroke-width="0.7" opacity="0.4"/>'
    s += '</g>'
    s += f'<g stroke="{RED}" stroke-width="1.4" fill="none">'
    s += '<line x1="860" y1="120" x2="860" y2="452"/>'
    s += '<line x1="850" y1="120" x2="870" y2="120"/>'
    s += '<line x1="850" y1="452" x2="870" y2="452"/>'
    s += '</g>'
    open(os.path.join(ILL, "post-soviet-plot.svg"), "w", encoding="utf-8").write(svg_doc(W, H, s))
    print("post-soviet-plot.svg")


if __name__ == "__main__":
    torn_clip_defs()
    hand_marks()
    cross_typology()
    ritual_sequence()
    soul_path()
    cemetery_plan()
    threshold_diagram()
    colophon_mark()
    empty_house()
    wooden_church()
    post_soviet_plot()

