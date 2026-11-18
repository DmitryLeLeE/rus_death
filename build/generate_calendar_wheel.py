import math
import os

os.makedirs("assets/illustrations", exist_ok=True)

def generate_calendar_wheel(lang="en"):
    w, h = 900, 720
    cx, cy = 450, 375
    r_outer = 270
    r_mid = 180
    r_inner = 90
    is_ru = lang == "ru"

    title = "ГОДИЧНЫЙ КРУГЪ ПОМИНОВЕНIЯ" if is_ru else "ANNUAL CYCLE OF THE DEAD"
    sub = "Сетка родительских дней: подвижный пасхальный и неподвижный осенний круги" if is_ru else "Liturgical & folk ancestor calendar: movable Easter and fixed autumn cycles"

    days = [
        (30, "МЯСОПУСТНАЯ СУББОТА" if is_ru else "MEATFARE SATURDAY",
             "Подвижный цикл (-57 дн. к Пасхе)" if is_ru else "Movable (-57d to Easter)",
             "Блины, кутья" if is_ru else "Bliny, kutia",
             "Все от века усопшие; безвестные и застигнутые внезапной смертью" if is_ru else "All ancient dead; those dying without rites in water or cold"),
        (75, "ВЕЛИКОПОСТНЫЕ СУББОТЫ (2, 3, 4)" if is_ru else "LENTEN SATURDAYS (2, 3, 4)",
             "Подвижный цикл (Великий пост)" if is_ru else "Movable (Weeks 2, 3, 4 of Lent)",
             "Постный поминальный хлеб" if is_ru else "Lenten memorial bread",
             "Приходские и семейные усопшие; поминовение записками" if is_ru else "Parish & kinship deceased; liturgical commemoration"),
        (130, "РАДОНИЦА" if is_ru else "RADONITSA",
             "Вторник Фоминой седмицы (+9 дн.)" if is_ru else "Tuesday after Thomas Sunday (+9d)",
             "Крашеные яйца, кулич, вино" if is_ru else "Dyed eggs, kulich, wine on turf",
             "Пасха мертвых; христосование с могилой, радость Воскресения" if is_ru else "Easter of the dead; rolling eggs on grave turf"),
        (175, "СЕМИКЪ" if is_ru else "SEMIK (7th THURSDAY)",
             "Четверг 7-й седмицы (+47 дн.)" if is_ru else "7th Thursday after Easter (+47d)",
             "Яичница, пиво, березовые венки" if is_ru else "Fried eggs, birch wreaths",
             "ЗАЛОЖНЫЕ: самоубийцы, утопленники, опойцы, скудельницы" if is_ru else "UNQUIET / ZALOZHNYE: suicides, drowned, unbaptized"),
        (215, "ТРОИЦКАЯ ВСЕЛЕНСКАЯ" if is_ru else "TRINITY SATURDAY",
             "Суббота перед Пятидесятницей (+49 дн.)" if is_ru else "Eve of Pentecost (+49d)",
             "Зелёный стол, каравай, блины" if is_ru else "Herbal feast, karavai, bliny",
             "Вселенское поминовение; переход от весны к лету" if is_ru else "Universal commemoration; threshold to summer"),
        (280, "ПОКРОВСКАЯ СУББОТА" if is_ru else "POKROV SATURDAY",
             "Неподвижный (суббота до 1/14 окт.)" if is_ru else "Fixed (Saturday before Oct 1)",
             "Каша, овсяный кисель" if is_ru else "Millet porridge, oat kisel",
             "Павшие воины (учреждена после Казанского похода 1552 г.)" if is_ru else "Fallen warriors (established after 1552 Kazan siege)"),
        (335, "ДИМИТРИЕВСКАЯ СУББОТА" if is_ru else "DEMETRIUS SATURDAY",
             "Неподвижный (суббота до 26 окт./8 нояб.)" if is_ru else "Fixed (Saturday before Nov 8)",
             "Обильный горячий обед, пироги" if is_ru else "Sumptuous hot dinner, pies",
             "Родители и «деды»; переход природы в зимнее омертвение" if is_ru else "Ancestral 'Dedy'; onset of winter dormancy")
    ]

    rays_svg = []
    labels_svg = []

    for deg, name, cat, food, who in days:
        rad = math.radians(deg)
        x_outer = cx + r_outer * math.cos(rad)
        y_outer = cy + r_outer * math.sin(rad)
        x_inner = cx + r_inner * math.cos(rad)
        y_inner = cy + r_inner * math.sin(rad)
        
        is_semik = "СЕМИК" in name or "SEMIK" in name
        stroke_color = "#b13227" if is_semik else "#4a4438"
        stroke_width = "2.5" if is_semik else "1.2"
        dash = "none" if is_semik else "3,3"
        rays_svg.append(f'<line x1="{x_inner}" y1="{y_inner}" x2="{x_outer}" y2="{y_outer}" stroke="{stroke_color}" stroke-width="{stroke_width}" stroke-dasharray="{dash}" />')
        
        x_text = cx + (r_outer + 30) * math.cos(rad)
        y_text = cy + (r_outer + 30) * math.sin(rad)
        anchor = "start" if math.cos(rad) > 0.2 else ("end" if math.cos(rad) < -0.2 else "middle")
        
        t_color = "#b13227" if is_semik else "#e8e4dc"
        w_color = "#e8a87c" if is_semik else "#7a756b"
        
        labels_svg.append(f'''<g transform="translate({x_text}, {y_text})">
  <text x="0" y="-12" font-family="'Anton', sans-serif" font-size="13" fill="{t_color}" text-anchor="{anchor}" letter-spacing="0.05em">{name}</text>
  <text x="0" y="3" font-family="'Inter', sans-serif" font-size="10" fill="#9c9588" text-anchor="{anchor}">{cat}</text>
  <text x="0" y="16" font-family="'Inter', sans-serif" font-size="10" fill="{w_color}" text-anchor="{anchor}" font-style="italic">{who}</text>
  <text x="0" y="28" font-family="'Inter', monospace" font-size="9" fill="#888" text-anchor="{anchor}">[{food}]</text>
</g>''')

    rays_block = "\n".join(rays_svg)
    labels_block = "\n".join(labels_svg)
    center_lbl = "ВЕЛИКИЙ ДЕНЬ" if is_ru else "EASTER AXIS"
    center_sub1 = "Светлое Воскресение" if is_ru else "Central Datum (0d)"
    center_sub2 = "Точка отсчета весеннего круга" if is_ru else "Spring Movable Anchor"

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="auto">
  <defs>
    <style>
      .bg {{ fill: #0d0c0b; }}
      .frame {{ stroke: #423d33; stroke-width: 1.5; fill: none; }}
      .title {{ font-family: 'Anton', serif; font-size: 26px; fill: #e8e4dc; letter-spacing: 0.12em; }}
      .sub {{ font-family: 'Inter', sans-serif; font-size: 13px; fill: #9c9588; font-style: italic; }}
      .ring {{ fill: none; stroke: #332e25; stroke-width: 1.5; }}
      .center-lbl {{ font-family: 'Anton', sans-serif; font-size: 16px; fill: #b13227; letter-spacing: 0.1em; text-anchor: middle; }}
      .center-sub {{ font-family: 'Inter', sans-serif; font-size: 10px; fill: #7a756b; text-anchor: middle; }}
    </style>
  </defs>

  <rect width="{w}" height="{h}" class="bg" />
  <rect x="25" y="25" width="{w-50}" height="{h-50}" class="frame" />

  <!-- Header -->
  <g transform="translate(60, 68)">
    <text x="0" y="0" font-family="'Inter', sans-serif" font-size="11" fill="#b13227" font-weight="bold" letter-spacing="0.15em">LITURGICA ET FOLKLORICA</text>
    <text x="0" y="28" class="title">{title}</text>
    <text x="0" y="48" class="sub">{sub}</text>
  </g>

  <!-- Concentric Rings -->
  <circle cx="{cx}" cy="{cy}" r="{r_outer}" class="ring" />
  <circle cx="{cx}" cy="{cy}" r="{r_mid}" class="ring" stroke-dasharray="2,5" />
  <circle cx="{cx}" cy="{cy}" r="{r_inner}" class="ring" stroke="#4a4438" />

  <!-- Center Hub -->
  <circle cx="{cx}" cy="{cy}" r="{r_inner-15}" fill="#161412" stroke="#b13227" stroke-width="1.5" />
  <text x="{cx}" y="{cy-8}" class="center-lbl">{center_lbl}</text>
  <text x="{cx}" y="{cy+8}" class="center-sub">{center_sub1}</text>
  <text x="{cx}" y="{cy+22}" class="center-sub">{center_sub2}</text>

  <!-- Rays -->
  {rays_block}

  <!-- Labels -->
  {labels_block}

  <!-- Footer -->
  <g transform="translate(60, {h-45})">
    <text x="0" y="0" font-family="'Inter', sans-serif" font-size="10" fill="#7a756b">RUSSIAN CHTHONIC ATLAS · LITURGICAL CALENDAR MATRIX</text>
    <text x="{w-120}" y="0" font-family="'Inter', sans-serif" font-size="10" fill="#7a756b" text-anchor="end">ORIGINAL RECONSTRUCTION · CC BY-SA 4.0</text>
  </g>
</svg>'''

    filename = f"diagram-calendar-wheel{'-ru' if is_ru else ''}.svg"
    path = os.path.join("assets/illustrations", filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Generated {path}")

generate_calendar_wheel("en")
generate_calendar_wheel("ru")
