#!/usr/bin/env python3
"""Regenerate VISUAL_AUDIT.md from the built English plate pages and data/images.json.
Counts files referenced on each plate page (excluding the hand-mark sprite, colophon mark and Eurasia map)."""
import json, re, datetime, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
imgs = json.load(open('data/images.json'))['images']
by_file = {i['file']: i for i in imgs}
plates = json.load(open('data/plates.json')); plates = plates if isinstance(plates, list) else plates['plates']
SKIP = ('hand-marks', 'colophon-mark', 'map-eurasia')
pat = re.compile(r'assets/(?:images|illustrations|derived)/[^"\'\s)>]+')
rows = []; unreg_all = []
for p in plates:
    cand = [f for f in glob.glob('plates/*.html') if os.path.basename(f).startswith(p['id'] + '-')]
    html = open(cand[0], encoding='utf8').read()
    files = sorted({m.group(0).replace('../', '') for m in pat.finditer(html) if not any(s in m.group(0) for s in SKIP)})
    c = dict(arch=0, ctx=0, art=0, dia=0, der=0, unreg=0)
    for f in files:
        e = by_file.get(f)
        if not e: c['unreg'] += 1; unreg_all.append((p['id'], f)); continue
        if e.get('kind') == 'derivative': c['der'] += 1
        else:
            r = e.get('role')
            c[{'archival': 'arch', 'contextual': 'ctx', 'artwork-reproduction': 'art', 'original-diagram': 'dia'}.get(r, 'unreg')] += 1
    rows.append((p, len(files), c))
out = ["# VISUAL AUDIT — RUSSIAN CHTHONIC ATLAS", "",
 f"Generated {datetime.date.today().isoformat()} by `build/make_visual_audit.py` from the built English plate pages and `data/images.json`. Counts are files referenced on each plate page, excluding the hand-mark sprite, colophon mark and the Eurasia map. A derivative (halftone, duotone, xerox) is counted separately from its original, so one photograph shown in two states counts twice. “Role” is the one recorded in `data/images.json` (see ASSET_CREDITS.md). This file records counts and gaps; it does not claim the gaps are filled.", "",
 "| Plate | Title | Vol | Files | Archival | Contextual | Artwork repro. | Original diagram | Derivative | Unregistered |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
tot = 0
for p, n, c in rows:
    tot += n
    out.append(f"| {p['id'].upper()} | {p.get('title','').upper()} | {p.get('volume','')} | {n} | {c['arch']} | {c['ctx']} | {c['art']} | {c['dia']} | {c['der']} | {c['unreg']} |")
out += ["", f"Total file references over {len(rows)} plates: {tot}.", "", "## Plates under three files", ""]
low = [(p, n) for p, n, c in rows if n < 3]
out += [f"- {p['id'].upper()} {p.get('title','').upper()}: {n}" for p, n in low] or ["- none"]
out += ["", "## Plates with no original diagram", "", ", ".join(p['id'].upper() for p, n, c in rows if c['dia'] == 0) or "none", "",
 "## Unregistered files", ""]
out += [f"- {a.upper()}: {f}" for a, f in unreg_all] or ["- none"]
out += ["", "## Gaps by category (honest status)", "",
 "- Manuscripts, old books, funeral notices, old maps: only partly searched. Internet Archive, Commons and Europeana were searched; Library of Congress, Finna and the Estonian register were blocked by bot protection and not bypassed; museum collections that require written permission were not used. See IMAGE_ACQUISITION_REPORT.md.",
 "- Ethnographic reconstructions (cross forms, burial clothing, table layouts): not drawn; each needs a documented source for its shape and must be labelled a reconstruction.",
 "- Original diagrams draw only what the plate’s sourced text states; each is labelled as an editorial diagram.",
 "- Mobile: diagrams scroll horizontally inside their frame at widths under 700 px; the text in them is not readable without scrolling. Not retested in this pass."]
open('VISUAL_AUDIT.md', 'w', encoding='utf8').write("\n".join(out) + "\n")
print('ok', len(rows), tot)
