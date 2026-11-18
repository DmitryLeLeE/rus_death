import os

ILL = "assets/illustrations"
os.makedirs(ILL, exist_ok=True)

# ------------------------------------------------------------- 1. Domovina Anatomy
def make_domovina_svg(lang="en"):
    is_ru = lang == "ru"
    title = "АНАТОМИЯ ДОМОВИНЫ: СТРУКТУРА ДОЛБЛЁНОЙ КОЛОДЫ" if is_ru else "ANATOMY OF THE LOG COFFIN (DOMOVINA / KOLODA)"
    sub = "Севернорусский архаический гроб из цельного соснового ствола (X–XIX вв.)" if is_ru else "North Russian archaic coffin hollowed from a single pine log (10th–19th c.)"
    
    t_lid = "КРЫШКА-ГОРБЫЛЬ (РАСКОЛОТЫЙ СТВОЛ)" if is_ru else "SPLIT-LOG LID (GORMASH)"
    d_lid = "Вытесана из той же плахи; уплотнялась сухим лесным мхом" if is_ru else "Hewn from the same split log; caulked with dried forest moss"
    
    t_hole = "СЛУХОВОЕ ОКОНЦЕ ДЛЯ ВЫХОДА ДУШИ" if is_ru else "SOUL PEEPHOLE (SLUKHOVOE OKONTSE)"
    d_hole = "Отверстие в торце или боку у изголовья для свободного исхода души" if is_ru else "Small aperture at the head end for the soul's transit"
    
    t_pillow = "СТРУЖЕЧНАЯ ПОДУШКА" if is_ru else "SHAVINGS PILLOW"
    d_pillow = "Березовые стружки от обтесывания колоды; ветошь и перья табуированы" if is_ru else "Pine/birch shavings from hewing; bird feathers strictly tabooed"
    
    t_pegs = "БЕРЕЗОВЫЕ НАГЕЛИ (БЕЗ ЖЕЛЕЗА)" if is_ru else "BIRCH WOODEN PEGS (NO IRON)"
    d_pegs = "«Железа в домовину не пускать»: крепление деревянными шипами" if is_ru else "Strict taboo on metal nails: assembled exclusively with wooden dowels"
    
    t_pitch = "СМОЛЕНИЕ ОГУЗКА И ШВОВ" if is_ru else "PINE PITCH CAULKING"
    d_pitch = "Варка сосновой смолы для герметизации от талых вод в глине" if is_ru else "Boiled pine resin seal against damp ground and spring thaws"

    src_note = "Источники: Зеленин (1927, с. 347); Барсов (1872, т. 1, с. 305); Кремлёва (1999, с. 521)." if is_ru else "Sources: Zelenin (1927, p. 347); Barsov (1872, vol. 1, p. 305); Kremleva (1999, p. 521)."

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" role="img" aria-label="{title}">
  <rect width="1000" height="700" fill="#E8E2D4"/>
  <rect x="12" y="12" width="976" height="676" fill="none" stroke="#111111" stroke-width="1.5"/>
  
  <!-- Header -->
  <text x="36" y="52" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#111111">{title}</text>
  <text x="36" y="76" font-family="'Courier New', monospace" font-size="12" fill="#555555">{sub}</text>
  <line x1="36" y1="92" x2="964" y2="92" stroke="#111111" stroke-width="1"/>

  <!-- Architectural schematic of the hollowed log -->
  <!-- Main log body -->
  <path d="M 120 300 Q 500 270 880 300 L 880 430 Q 500 480 120 430 Z" fill="#D9D2C0" stroke="#111111" stroke-width="2.5"/>
  <!-- Hollow cavity -->
  <path d="M 150 315 Q 500 290 850 315 L 850 410 Q 500 450 150 410 Z" fill="#C9C2B0" stroke="#111111" stroke-width="1.8" stroke-dasharray="4 3"/>

  <!-- Lid (displaced upward in axonometric exploded view) -->
  <path d="M 120 190 Q 500 160 880 190 L 880 230 Q 500 200 120 230 Z" fill="#E0D9C8" stroke="#111111" stroke-width="2"/>
  <line x1="120" y1="210" x2="880" y2="210" stroke="#111111" stroke-width="1.2"/>

  <!-- Soul peephole at head (left side) -->
  <circle cx="150" cy="360" r="12" fill="#111111"/>
  <circle cx="150" cy="360" r="16" fill="none" stroke="#B3241A" stroke-width="2"/>

  <!-- Shavings pillow inside -->
  <path d="M 170 335 Q 240 330 260 375 Q 210 400 170 395 Z" fill="#F4EFE6" stroke="#111111" stroke-width="1.2"/>
  <text x="215" y="365" font-family="'Courier New', monospace" font-size="10" fill="#111111" text-anchor="middle">···</text>

  <!-- Wooden dowels / pegs -->
  <line x1="220" y1="230" x2="220" y2="305" stroke="#B3241A" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="220" cy="305" r="4" fill="#B3241A"/>
  <line x1="500" y1="205" x2="500" y2="280" stroke="#B3241A" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="500" cy="280" r="4" fill="#B3241A"/>
  <line x1="780" y1="230" x2="780" y2="305" stroke="#B3241A" stroke-width="2" stroke-dasharray="3 3"/>
  <circle cx="780" cy="305" r="4" fill="#B3241A"/>

  <!-- Annotation callouts -->
  <!-- Callout 1: Lid -->
  <line x1="500" y1="170" x2="500" y2="125" stroke="#111111" stroke-width="1.2"/>
  <line x1="500" y1="125" x2="580" y2="125" stroke="#111111" stroke-width="1.2"/>
  <text x="590" y="122" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#B3241A">01. {t_lid}</text>
  <text x="590" y="138" font-family="Georgia, serif" font-size="11" fill="#222222">{d_lid}</text>

  <!-- Callout 2: Peephole -->
  <line x1="150" y1="376" x2="150" y2="520" stroke="#B3241A" stroke-width="1.2"/>
  <line x1="150" y1="520" x2="230" y2="520" stroke="#B3241A" stroke-width="1.2"/>
  <text x="240" y="516" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#B3241A">02. {t_hole}</text>
  <text x="240" y="534" font-family="Georgia, serif" font-size="11" fill="#222222">{d_hole}</text>

  <!-- Callout 3: Pillow -->
  <line x1="215" y1="395" x2="215" y2="575" stroke="#111111" stroke-width="1.2"/>
  <line x1="215" y1="575" x2="295" y2="575" stroke="#111111" stroke-width="1.2"/>
  <text x="305" y="571" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#B3241A">03. {t_pillow}</text>
  <text x="305" y="589" font-family="Georgia, serif" font-size="11" fill="#222222">{d_pillow}</text>

  <!-- Callout 4: Pegs -->
  <line x1="780" y1="270" x2="840" y2="240" stroke="#111111" stroke-width="1.2"/>
  <text x="730" y="215" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#B3241A">04. {t_pegs}</text>
  <text x="730" y="232" font-family="Georgia, serif" font-size="11" fill="#222222">{d_pegs}</text>

  <!-- Callout 5: Pitch / Tar base -->
  <line x1="600" y1="465" x2="600" y2="625" stroke="#111111" stroke-width="1.2"/>
  <line x1="600" y1="625" x2="660" y2="625" stroke="#111111" stroke-width="1.2"/>
  <text x="670" y="621" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#B3241A">05. {t_pitch}</text>
  <text x="670" y="639" font-family="Georgia, serif" font-size="11" fill="#222222">{d_pitch}</text>

  <!-- Footer citation -->
  <line x1="36" y1="662" x2="964" y2="662" stroke="#CCCCCC" stroke-width="1"/>
  <text x="36" y="678" font-family="'Courier New', monospace" font-size="10" fill="#666666">{src_note}</text>
</svg>'''
    return svg


# ------------------------------------------------------------- 2. Cross Types
def make_cross_types_svg(lang="en"):
    is_ru = lang == "ru"
    title = "ТИПОЛОГИЯ НАДМОГИЛЬНЫХ ЗНАКОВ РУССКОГО СЕВЕРА" if is_ru else "TYPOLOGY OF NORTH RUSSIAN GRAVE MARKERS"
    sub = "Эволюция надгробия: от старообрядческого голубца к советскому обелиску" if is_ru else "Evolution of the memorial marker: from Old Believer roofed cross to Soviet obelisk"

    col1_h = "01. СТАРООБРЯДЧЕСКИЙ ГОЛУБЕЦ" if is_ru else "01. OLD BELIEVER GOLUBETS"
    col1_d1 = "Двускатная кровля-теремок" if is_ru else "Gabled timber roof (terem)"
    col1_d2 = "Киотец с медной литой иконкой" if is_ru else "Niche for cast bronze icon"
    col1_d3 = "Подсечка и резные причелины" if is_ru else "Carved eaves and vergeboards"

    col2_h = "02. ОСЬМИКОНЕЧНЫЙ КРЕСТ" if is_ru else "02. EIGHT-POINTED CROSS"
    col2_d1 = "Верхняя табличка («титла»)" if is_ru else "Upper titulus plaque"
    col2_d2 = "Средняя перекладина для рук" if is_ru else "Middle crossbar for arms"
    col2_d3 = "Косая подножка (весы праведные)" if is_ru else "Slanted footrest (righteous scale)"

    col3_h = "03. ПОМОРСКИЙ СТОЛБЕЦ" if is_ru else "03. POMOR GRAVE PILLAR"
    col3_d1 = "Брус со стрельчатой стрехой" if is_ru else "Chiseled column with pointed hood"
    col3_d2 = "Резные солярные розетки" if is_ru else "Carved solar rosettes"
    col3_d3 = "Ориентация изголовьем на восток" if is_ru else "Strict eastward orientation"

    col4_h = "04. СОВЕТСКАЯ ПИРАМИДКА" if is_ru else "04. SOVIET TIN PYRAMID"
    col4_d1 = "Сварной листовой конус" if is_ru else "Welded sheet-metal pyramid"
    col4_d2 = "Красная жестяная пятиконечная звезда" if is_ru else "Red painted five-pointed star"
    col4_d3 = "Эмалированный фотоовал" if is_ru else "Enamel photo-oval plaque"

    src_note = "Источники: Руйе (2007, с. 65); Чистов (1986, с. 142); Мерридейл (2000, с. 210)." if is_ru else "Sources: Rouhier (2007, p. 65); Chistov (1986, p. 142); Merridale (2000, p. 210)."

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" role="img" aria-label="{title}">
  <rect width="1000" height="700" fill="#E8E2D4"/>
  <rect x="12" y="12" width="976" height="676" fill="none" stroke="#111111" stroke-width="1.5"/>

  <!-- Header -->
  <text x="36" y="52" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#111111">{title}</text>
  <text x="36" y="76" font-family="'Courier New', monospace" font-size="12" fill="#555555">{sub}</text>
  <line x1="36" y1="92" x2="964" y2="92" stroke="#111111" stroke-width="1"/>

  <!-- Ground line -->
  <line x1="36" y1="520" x2="964" y2="520" stroke="#111111" stroke-width="2"/>
  <text x="964" y="540" font-family="'Courier New', monospace" font-size="10" fill="#666666" text-anchor="end">HORIZON / УРОВЕНЬ ПОЧВЫ</text>

  <!-- COLUMN 1: Golubets -->
  <g transform="translate(130, 0)">
    <!-- Upright beam -->
    <rect x="-10" y="220" width="20" height="300" fill="#D9D2C0" stroke="#111111" stroke-width="1.8"/>
    <!-- Crossbar -->
    <rect x="-60" y="270" width="120" height="18" fill="#D9D2C0" stroke="#111111" stroke-width="1.8"/>
    <!-- Roof gable -->
    <polygon points="0,170 -80,230 -65,245 0,195 65,245 80,230" fill="#B3241A" stroke="#111111" stroke-width="1.5"/>
    <!-- Icon niche -->
    <rect x="-18" y="280" width="36" height="50" fill="#C9C2B0" stroke="#111111" stroke-width="1.2"/>
    <rect x="-12" y="286" width="24" height="38" fill="#111111"/>
  </g>
  <text x="130" y="560" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#B3241A" text-anchor="middle">{col1_h}</text>
  <text x="130" y="582" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col1_d1}</text>
  <text x="130" y="600" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col1_d2}</text>
  <text x="130" y="618" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col1_d3}</text>

  <!-- COLUMN 2: 8-pointed cross -->
  <g transform="translate(380, 0)">
    <!-- Upright shaft -->
    <rect x="-9" y="160" width="18" height="360" fill="#D9D2C0" stroke="#111111" stroke-width="1.8"/>
    <!-- Top titulus bar -->
    <rect x="-30" y="200" width="60" height="14" fill="#D9D2C0" stroke="#111111" stroke-width="1.5"/>
    <!-- Middle arm bar -->
    <rect x="-75" y="260" width="150" height="18" fill="#D9D2C0" stroke="#111111" stroke-width="1.8"/>
    <!-- Slanted footrest bar -->
    <polygon points="-38,410 38,380 44,394 -32,424" fill="#D9D2C0" stroke="#111111" stroke-width="1.8"/>
  </g>
  <text x="380" y="560" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#B3241A" text-anchor="middle">{col2_h}</text>
  <text x="380" y="582" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col2_d1}</text>
  <text x="380" y="600" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col2_d2}</text>
  <text x="380" y="618" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col2_d3}</text>

  <!-- COLUMN 3: Pomor column -->
  <g transform="translate(630, 0)">
    <!-- Column trunk -->
    <rect x="-14" y="200" width="28" height="320" fill="#D9D2C0" stroke="#111111" stroke-width="1.8"/>
    <!-- Carved boat hood top -->
    <polygon points="0,170 -40,210 40,210" fill="#B3241A" stroke="#111111" stroke-width="1.5"/>
    <!-- Rosette incisions -->
    <circle cx="0" cy="250" r="10" fill="none" stroke="#111111" stroke-width="1.5"/>
    <circle cx="0" cy="250" r="3" fill="#111111"/>
    <line x1="0" y1="237" x2="0" y2="263" stroke="#111111" stroke-width="1.2"/>
    <line x1="-13" y1="250" x2="13" y2="250" stroke="#111111" stroke-width="1.2"/>
  </g>
  <text x="630" y="560" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#B3241A" text-anchor="middle">{col3_h}</text>
  <text x="630" y="582" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col3_d1}</text>
  <text x="630" y="600" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col3_d2}</text>
  <text x="630" y="618" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col3_d3}</text>

  <!-- COLUMN 4: Soviet tin pyramid -->
  <g transform="translate(870, 0)">
    <!-- Metal pyramid body -->
    <polygon points="0,210 -45,520 45,520" fill="#B0B8C0" stroke="#111111" stroke-width="1.8"/>
    <!-- Star on pinnacle -->
    <path d="M 0 170 L 6 186 L 22 186 L 10 196 L 14 212 L 0 202 L -14 212 L -10 196 L -22 186 L -6 186 Z" fill="#B3241A" stroke="#111111" stroke-width="1.2"/>
    <!-- Photo-oval plaque -->
    <ellipse cx="0" cy="330" rx="16" ry="22" fill="#FFFFFF" stroke="#111111" stroke-width="1.5"/>
    <ellipse cx="0" cy="330" rx="12" ry="17" fill="#666666"/>
  </g>
  <text x="870" y="560" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#B3241A" text-anchor="middle">{col4_h}</text>
  <text x="870" y="582" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col4_d1}</text>
  <text x="870" y="600" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col4_d2}</text>
  <text x="870" y="618" font-family="Georgia, serif" font-size="11" fill="#222222" text-anchor="middle">{col4_d3}</text>

  <!-- Footer citation -->
  <line x1="36" y1="662" x2="964" y2="662" stroke="#CCCCCC" stroke-width="1"/>
  <text x="36" y="678" font-family="'Courier New', monospace" font-size="10" fill="#666666">{src_note}</text>
</svg>'''
    return svg

# Write files
with open(os.path.join(ILL, "diagram-domovina-anatomy.svg"), "w", encoding="utf-8") as f:
    f.write(make_domovina_svg("en"))
with open(os.path.join(ILL, "diagram-domovina-anatomy-ru.svg"), "w", encoding="utf-8") as f:
    f.write(make_domovina_svg("ru"))

with open(os.path.join(ILL, "diagram-cross-types.svg"), "w", encoding="utf-8") as f:
    f.write(make_cross_types_svg("en"))
with open(os.path.join(ILL, "diagram-cross-types-ru.svg"), "w", encoding="utf-8") as f:
    f.write(make_cross_types_svg("ru"))

print("Generated new SVGs: domovina-anatomy and cross-types (EN + RU)!")
