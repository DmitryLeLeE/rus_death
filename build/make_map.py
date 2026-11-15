# -*- coding: utf-8 -*-
"""
Builds the atlas working map from Natural Earth 1:110m data (public domain).
Projection: equirectangular with latitude-compensated longitude (plate carrée, cos 55°).
This is deliberately a working sheet, not a thematic map: it shows the ground,
not the distribution of customs.

Output: assets/illustrations/map-eurasia.svg
        data/places.geo.json  (normalised marker positions)
"""
import json, os, math, io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NE_DIR = r"C:\Users\news-\OneDrive\Документы\deepseek-harness\default-workspace"
COUNTRIES = os.path.join(NE_DIR, "_ne110.geojson")
RIVERS = os.path.join(NE_DIR, "_ne50_rivers.geojson")
LAKES = os.path.join(NE_DIR, "_ne110_lakes.geojson")

W, H = 880, 1080
PAD = 26
LON_MIN, LON_MAX = 20.0, 56.0
LAT_MIN, LAT_MAX = 42.0, 68.0
KX = math.cos(math.radians(55.0))

PLACES = {
    "moscow": (37.55, 55.74),
    "st-petersburg": (30.32, 59.90),
    "novgorod": (31.27, 58.52),
    "olonets-karelia": (33.6, 61.6),
    "volga-region": (47.5, 53.5),
    "volgograd": (44.53, 48.74),
    "rostov-on-don": (39.72, 47.24),
    "tymky-ukraine": (34.5, 50.0),
}
NEIGHBOURS = ["Ukraine", "Belarus", "Kazakhstan", "Finland", "Norway", "Mongolia",
              "China", "Georgia", "Azerbaijan", "Latvia", "Estonia", "Lithuania",
              "Poland", "Turkey", "Japan"]


def proj(lon, lat):
    return ((lon - LON_MIN) * KX, (LAT_MAX - lat))


def build_transform():
    w = (LON_MAX - LON_MIN) * KX
    h = (LAT_MAX - LAT_MIN)
    sc = min((W - 2 * PAD) / w, (H - 2 * PAD) / h)

    def tx(p):
        return (PAD + p[0] * sc, PAD + p[1] * sc)
    return tx


def rings(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"][0]]
    if geom["type"] == "MultiPolygon":
        return [poly[0] for poly in geom["coordinates"]]
    return []


def lines(geom):
    if geom["type"] == "LineString":
        return [geom["coordinates"]]
    if geom["type"] == "MultiLineString":
        return geom["coordinates"]
    if geom["type"] == "Polygon":
        return [geom["coordinates"][0]]
    if geom["type"] == "MultiPolygon":
        return [poly[0] for poly in geom["coordinates"]]
    return []


def simplify(points, tol):
    if len(points) < 4:
        return points
    if points[0] == points[-1]:
        closed = True
        points = points[:-1]
    else:
        closed = False

    def dp(pts):
        if len(pts) < 3:
            return pts
        (ax, ay), (bx, by) = pts[0], pts[-1]
        dx, dy = bx - ax, by - ay
        norm = math.hypot(dx, dy) or 1e-9
        idx, dmax = 0, 0.0
        for i in range(1, len(pts) - 1):
            px, py = pts[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / norm
            if d > dmax:
                idx, dmax = i, d
        if dmax > tol:
            return dp(pts[:idx + 1])[:-1] + dp(pts[idx:])
        return [pts[0], pts[-1]]

    res = dp(points)
    if closed and res:
        res = res + [res[0]]
    return res


def inside(lon, lat):
    return (LON_MIN - 1) <= lon <= (LON_MAX + 1) and (LAT_MIN - 1) <= lat <= (LAT_MAX + 1)


def clipped_path(ring, tx, tol=0.02):
    """Outline fragments of a ring that fall inside the working window.
    Splitting the ring avoids the false straight lines produced by the antimeridian
    and by polygons that continue far outside the sheet."""
    runs, run = [], []
    for lon, lat in ring:
        if inside(lon, lat):
            run.append(tx(proj(lon, lat)))
        else:
            if len(run) > 1:
                runs.append(run)
            run = []
    if len(run) > 1:
        runs.append(run)
    out = []
    for pts in runs:
        pts = simplify(pts, tol)
        if len(pts) < 2:
            continue
        out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts))
    return "".join(out)


def d_from(rings_, tx, tol, close=True):
    out = []
    for ring in rings_:
        pts = [tx(proj(x, y)) for x, y in ring]
        pts = simplify(pts, tol)
        if len(pts) < 2:
            continue
        out.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + ("Z" if close else ""))
    return "".join(out)


def main():
    tx = build_transform()
    countries = json.load(open(COUNTRIES, encoding="utf-8"))["features"]
    by_name = {f["properties"]["ADMIN"]: f for f in countries}

    body = []
    # graticule
    body.append('<g class="graticule" stroke="#111111" stroke-width="0.7" opacity="0.22" fill="none">')
    for lon in range(20, 57, 5):
        x0, y0 = tx(proj(lon, LAT_MIN))
        x1, y1 = tx(proj(lon, LAT_MAX))
        body.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke-dasharray="3 5"/>')
    for lat in range(42, 69, 5):
        x0, y0 = tx(proj(LON_MIN, lat))
        x1, y1 = tx(proj(LON_MAX, lat))
        body.append(f'<line x1="{x0:.1f}" y1="{y0:.1f}" x2="{x1:.1f}" y2="{y1:.1f}" stroke-dasharray="3 5"/>')
    body.append("</g>")

    # lakes
    try:
        lakes = json.load(open(LAKES, encoding="utf-8"))["features"]
        body.append('<g fill="#E8E2D4" stroke="#111111" stroke-width="0.9" opacity="0.9">')
        for f in lakes:
            d = d_from(rings(f["geometry"]), tx, 0.01)
            if d:
                body.append(f'<path d="{d}"/>')
        body.append("</g>")
    except Exception as exc:
        print("lakes skipped", exc)

    # rivers
    try:
        rivers = json.load(open(RIVERS, encoding="utf-8"))["features"]
        body.append('<g fill="none" stroke="#111111" stroke-width="0.85" opacity="0.55">')
        for f in rivers:
            coords = [p for line in lines(f["geometry"]) for p in line]
            if not coords:
                continue
            lons_ = [p[0] for p in coords]; lats_ = [p[1] for p in coords]
            if max(lons_) < LON_MIN or min(lons_) > LON_MAX or max(lats_) < LAT_MIN or min(lats_) > LAT_MAX:
                continue
            d = d_from(lines(f["geometry"]), tx, 0.02, close=False)
            if d:
                body.append(f'<path d="{d}"/>')
        body.append("</g>")
    except Exception as exc:
        print("rivers skipped", exc)

    # neighbours: thin
    body.append('<g fill="none" stroke="#111111" stroke-width="0.9" opacity="0.38">')
    for name in NEIGHBOURS:
        f = by_name.get(name)
        if not f:
            continue
        d = d_from(rings(f["geometry"]), tx, 0.008)
        if d:
            body.append(f'<path d="{d}"/>')
    body.append("</g>")

    # Russia: heavy
    body.append('<g fill="none" stroke="#111111" stroke-width="2.1">')
    d = "".join(clipped_path(r, tx) for r in rings(by_name["Russia"]["geometry"]))
    body.append(f'<path d="{d}"/>')
    body.append("</g>")

    # small crosshair at the centre of the sheet (a working-map mark, not a marker)
    cx, cy = tx(proj((LON_MIN + LON_MAX) / 2, (LAT_MIN + LAT_MAX) / 2))
    body.append(f'<g stroke="#B00000" stroke-width="0.9" opacity="0.5"><line x1="{cx-7}" y1="{cy}" x2="{cx+7}" y2="{cy}"/><line x1="{cx}" y1="{cy-7}" x2="{cx}" y2="{cy+7}"/></g>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
           f'role="img" aria-hidden="true">{"".join(body)}</svg>')
    open(os.path.join(ROOT, "assets", "illustrations", "map-eurasia.svg"), "w", encoding="utf-8").write(svg)

    pos = {}
    for key, (lon, lat) in PLACES.items():
        x, y = tx(proj(lon, lat))
        pos[key] = {"x": round(x / W * 100, 3), "y": round(y / H * 100, 3), "lon": lon, "lat": lat}
    json.dump(pos, open(os.path.join(ROOT, "data", "places.geo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("map", len(svg) // 1024, "K")
    for k, v in pos.items():
        print(f"  {k}: {v['x']}% / {v['y']}%")


if __name__ == "__main__":
    main()


