import os

os.makedirs("assets/illustrations", exist_ok=True)

def make_botany_svg(species_id, lang="en"):
    w, h = 900, 600
    is_ru = lang == "ru"
    
    if species_id == "spruce":
        latin = "Picea abies (L.) H. Karst."
        title = "ЕЛОВЫЙ ЛАПНИКЪ" if is_ru else "SPRUCE BOUGHS"
        sub = "Пограничный барьер и устилание пути гроба" if is_ru else "Liminal barrier &amp; mortuary path-strewn carpet"
        labels = [
            ("1", "Колючая хвоя (не даёт душе вернуться)" if is_ru else "Prickly needle barrier (confuses soul's path)", 180, 220),
            ("2", "Смоляной бальзамический покров" if is_ru else "Resinous scent masking cadaveric decomposition", 620, 280),
            ("3", "Погребальная соломка и лапник" if is_ru else "Strewn behind sled from izba to pogost", 240, 510),
            ("4", "«Угодить под ель» (народный эвфемизм смерти)" if is_ru else "'To go under the spruce' (ancestral euphemism)", 560, 470)
        ]
        # Branches artwork
        art = '''
        <!-- Central stylized spruce branch -->
        <g stroke="#e2ded4" stroke-width="2.5" fill="none" stroke-linecap="round">
          <!-- Main stem -->
          <path d="M 450 540 C 450 380, 440 220, 450 90" />
          <!-- Sub branches left -->
          <path d="M 450 480 C 370 470, 310 430, 240 460" />
          <path d="M 448 410 C 350 390, 290 350, 210 370" />
          <path d="M 447 340 C 360 320, 310 270, 230 280" />
          <path d="M 448 260 C 370 240, 320 190, 260 190" />
          <path d="M 450 180 C 390 160, 340 120, 300 110" />
          <!-- Sub branches right -->
          <path d="M 450 480 C 530 470, 590 430, 660 460" />
          <path d="M 448 410 C 550 390, 610 350, 690 370" />
          <path d="M 447 340 C 540 320, 590 270, 670 280" />
          <path d="M 448 260 C 530 240, 580 190, 640 190" />
          <path d="M 450 180 C 510 160, 560 120, 600 110" />
        </g>
        <!-- Needles shading -->
        <g stroke="#9c9588" stroke-width="1.2" stroke-linecap="round">
          <!-- Needles cluster -->
          <path d="M 235 455 l -15 -10 m 15 10 l -10 15 m -20 -10 l 15 5 m -10 -20 l 8 18 M 270 445 l -12 -15 m 12 15 l 5 -18" />
          <path d="M 665 455 l 15 -10 m -15 10 l 10 15 m 20 -10 l -15 5 m 10 -20 l -8 18 M 630 445 l 12 -15 m -12 15 l -5 -18" />
          <path d="M 205 365 l -18 -8 m 18 8 l -8 18 m 10 -15 l -15 -10 m 20 2 l -12 16 M 245 360 l -14 -12 m 14 12 l 2 -18" />
          <path d="M 695 365 l 18 -8 m -18 8 l 8 18 m -10 -15 l 15 -10 m -20 2 l 12 16 M 655 360 l 14 -12 m -14 12 l -2 -18" />
          <path d="M 225 275 l -15 -10 m 15 10 l -10 15 m -8 -18 l 14 12 M 275 285 l -12 -15" />
          <path d="M 675 275 l 15 -10 m -15 10 l 10 15 m 8 -18 l -14 12 M 625 285 l 12 -15" />
          <!-- Pendant cone -->
          <path d="M 445 280 C 430 330, 430 390, 445 420 C 460 390, 460 330, 445 280 Z" fill="#2a2520" stroke="#b13227" stroke-width="1.8" />
          <path d="M 435 320 Q 445 330 455 320 M 432 350 Q 445 360 458 350 M 435 380 Q 445 390 455 380" stroke="#b13227" stroke-width="1.2" fill="none" />
        </g>
        '''
    elif species_id == "aspen":
        latin = "Populus tremula L."
        title = "ОСИНОВЫЙ КОЛЪ" if is_ru else "ASPEN STAKE"
        sub = "Хтоническое древо казни и удержания заложных" if is_ru else "Chthonic tree of pinning and anti-revenant defense"
        labels = [
            ("1", "Дрожащие черешки (вечный трепет Иуды)" if is_ru else "Flattened trembling petioles (perpetual tremor)", 170, 200),
            ("2", "Округлые зубчатые листья (Populus tremula)" if is_ru else "Dentate orbicular leaf morphology", 680, 220),
            ("3", "Заострённый комлевой кол (1.5 сажени)" if is_ru else "Sharpened heartwood stake (penetrates grave)", 650, 430),
            ("4", "Фиксация позвоночника упыря в земле" if is_ru else "Spinal pinning preventing nocturnal rising", 180, 460)
        ]
        art = '''
        <!-- Aspen branch & sharpened stake -->
        <g stroke="#e2ded4" stroke-width="2.5" fill="none" stroke-linecap="round">
          <!-- The Sharpened Stake (Center Left) -->
          <path d="M 400 90 L 430 90 L 430 460 L 415 540 L 400 460 Z" fill="#1b1815" stroke="#b13227" stroke-width="2" />
          <!-- Wood grain rings and cuts on stake -->
          <path d="M 405 150 L 425 155 M 402 240 L 428 245 M 405 340 L 425 335 M 403 440 L 427 435" stroke="#7a756b" stroke-width="1.2" />
          <path d="M 415 460 L 415 530" stroke="#b13227" stroke-width="1.5" />
          <!-- Branch with leaves curling around -->
          <path d="M 430 180 C 490 170, 530 140, 580 120" />
          <path d="M 430 270 C 510 270, 560 250, 620 210" />
          <path d="M 400 220 C 330 200, 290 180, 240 140" />
          <path d="M 400 320 C 320 330, 270 300, 210 270" />
        </g>
        <!-- Aspen Leaves -->
        <g fill="#211e1a" stroke="#e2ded4" stroke-width="1.8">
          <!-- Leaf 1 Right -->
          <path d="M 580 120 C 600 90, 640 90, 650 120 C 660 150, 610 170, 580 120 Z" />
          <!-- Leaf 2 Right -->
          <path d="M 620 210 C 650 180, 690 190, 690 230 C 680 260, 630 260, 620 210 Z" />
          <!-- Leaf 1 Left -->
          <path d="M 240 140 C 210 110, 170 120, 180 160 C 190 180, 230 180, 240 140 Z" />
          <!-- Leaf 2 Left -->
          <path d="M 210 270 C 170 250, 150 280, 160 310 C 180 330, 220 310, 210 270 Z" />
        </g>
        <g stroke="#7a756b" stroke-width="1" fill="none">
          <path d="M 590 122 L 635 125 M 630 215 L 670 225 M 230 145 L 195 150 M 200 275 L 175 295" />
        </g>
        '''
    elif species_id == "poppy":
        latin = "Papaver rhoeas / somniferum L."
        title = "МАКОВОЕ СѢМЯ" if is_ru else "WILD POPPY SEEDS"
        sub = "Неисчислимый счётный барьер порога и могилы" if is_ru else "Innumerable counting barrier of threshold &amp; grave"
        labels = [
            ("1", "Коробочка с порами (Papaver somniferum)" if is_ru else "Porous capsule containing thousands of seeds", 680, 200),
            ("2", "Зубчатая звездчатая коронка" if is_ru else "Stigmatic disc sealing the seed chamber", 650, 90),
            ("3", "Рассыпание мака на перекрёстках дорог" if is_ru else "Scattering ritual at funeral crossroads", 180, 240),
            ("4", "Счёт до первых петухов (удержание упыря)" if is_ru else "Counting until cockcrow (disables revenant)", 210, 480)
        ]
        art = '''
        <g stroke="#e2ded4" stroke-width="2.5" fill="none" stroke-linecap="round">
          <!-- Central Poppy Stem -->
          <path d="M 450 540 C 450 420, 440 280, 450 180" />
          <!-- Flower bud / pod -->
          <path d="M 420 180 C 410 120, 490 120, 480 180 Z" fill="#1b1815" stroke="#b13227" stroke-width="2" />
          <!-- Starry crown -->
          <path d="M 410 120 L 490 120 L 485 105 L 470 112 L 450 102 L 430 112 L 415 105 Z" fill="#2a2520" stroke="#b13227" stroke-width="1.8" />
          <!-- Pores under crown -->
          <circle cx="430" cy="135" r="2.5" fill="#e2ded4" />
          <circle cx="443" cy="135" r="2.5" fill="#e2ded4" />
          <circle cx="457" cy="135" r="2.5" fill="#e2ded4" />
          <circle cx="470" cy="135" r="2.5" fill="#e2ded4" />
          <!-- Falling seed stream -->
          <path d="M 450 190 Q 420 320 340 420" stroke="#7a756b" stroke-dasharray="3,6" stroke-width="1.5" />
          <path d="M 450 190 Q 480 320 540 450" stroke="#7a756b" stroke-dasharray="3,6" stroke-width="1.5" />
        </g>
        <!-- Scattered tiny seeds (circles) -->
        <g fill="#e2ded4">
          <circle cx="340" cy="425" r="3" /><circle cx="355" cy="440" r="2.5" /><circle cx="330" cy="445" r="3.2" />
          <circle cx="370" cy="430" r="2" /><circle cx="320" cy="460" r="2.8" /><circle cx="360" cy="465" r="3" />
          <circle cx="535" cy="455" r="3" /><circle cx="550" cy="470" r="2.5" /><circle cx="520" cy="480" r="3.2" />
          <circle cx="565" cy="460" r="2.2" /><circle cx="545" cy="495" r="3" /><circle cx="575" cy="490" r="2.7" />
          <circle cx="445" cy="490" r="3" /><circle cx="460" cy="510" r="2.5" /><circle cx="430" cy="520" r="3.2" />
        </g>
        '''
    else: # juniper
        latin = "Juniperus communis L."
        title = "ВЕРЕСЪ / МОЖЖЕВЕЛЬНИКЪ" if is_ru else "COMMON JUNIPER"
        sub = "Очистительное окуривание избы от мертвечины" if is_ru else "Apotropaic fumigant cleansing cadaveric air"
        labels = [
            ("1", "Тройчатые шиловидные иглы (колючий щит)" if is_ru else "Ternate pungent needle whorls", 210, 180),
            ("2", "Шишкоягоды (созревание на второй год)" if is_ru else "Fleshy berry-cones (2-year maturation)", 680, 220),
            ("3", "Печная железная лопата с углями" if is_ru else "Fumigation shovel with live hearth embers", 200, 470),
            ("4", "Очищение углов и подполья от скверны" if is_ru else "Cleansing corners and subfloor of corruption", 640, 480)
        ]
        art = '''
        <g stroke="#e2ded4" stroke-width="2.5" fill="none" stroke-linecap="round">
          <!-- Juniper Branch Cluster -->
          <path d="M 450 520 C 450 380, 420 260, 440 110" />
          <path d="M 435 440 C 370 410, 310 380, 260 370" />
          <path d="M 438 340 C 360 300, 310 240, 260 210" />
          <path d="M 445 420 C 510 400, 580 370, 630 350" />
          <path d="M 442 310 C 510 280, 570 230, 620 180" />
        </g>
        <!-- Whorls of needles (3-pronged) -->
        <g stroke="#9c9588" stroke-width="1.4" fill="none">
          <path d="M 260 370 l -15 -15 m 15 15 l -20 0 m 20 0 l -12 18" />
          <path d="M 310 380 l -15 -12 m 15 12 l -18 5 m 18 -5 l -8 18" />
          <path d="M 260 210 l -18 -12 m 18 12 l -18 2 m 18 -2 l -10 16" />
          <path d="M 320 250 l -15 -15 m 15 15 l -18 4" />
          <path d="M 630 350 l 18 -12 m -18 12 l 20 2 m -20 -2 l 14 16" />
          <path d="M 570 375 l 16 -12 m -16 12 l 18 4 m -18 -4 l 10 18" />
          <path d="M 620 180 l 18 -12 m -18 12 l 18 2 m -18 -2 l 12 16" />
        </g>
        <!-- Fleshy Berry-cones -->
        <g fill="#1f232b" stroke="#b13227" stroke-width="1.8">
          <circle cx="420" cy="330" r="10" /><circle cx="445" cy="300" r="9" />
          <circle cx="360" cy="310" r="9.5" /><circle cx="510" cy="290" r="10" />
          <circle cx="530" cy="380" r="9" /><circle cx="370" cy="415" r="9.5" />
        </g>
        <!-- Tri-radiate clefts on berry top -->
        <g stroke="#b13227" stroke-width="1.2">
          <path d="M 420 326 l 0 4 l -3 3 m 3 -3 l 3 3" />
          <path d="M 510 286 l 0 4 l -3 3 m 3 -3 l 3 3" />
          <path d="M 360 306 l 0 4 l -3 3 m 3 -3 l 3 3" />
        </g>
        <!-- Smoke plume at bottom -->
        <g stroke="#7a756b" stroke-width="1.5" stroke-dasharray="4,8" fill="none">
          <path d="M 430 520 Q 380 480 390 420 T 430 320" />
          <path d="M 470 520 Q 520 480 500 410 T 460 300" />
        </g>
        '''

    labels_svg = "\n".join([
        f'''<g class="callout">
          <circle cx="{x-20}" cy="{y-5}" r="12" fill="#1b1815" stroke="#b13227" stroke-width="1.5" />
          <text x="{x-20}" y="{y}" font-family="'Anton', sans-serif" font-size="12" fill="#b13227" text-anchor="middle">{num}</text>
          <text x="{x}" y="{y}" font-family="'Inter', sans-serif" font-size="12" fill="#e2ded4" letter-spacing="0.02em">{txt}</text>
        </g>'''
        for num, txt, x, y in labels
    ])

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="auto">
  <defs>
    <style>
      .bg {{ fill: #0d0c0b; }}
      .frame {{ stroke: #423d33; stroke-width: 1.5; fill: none; }}
      .inner-frame {{ stroke: #2a2620; stroke-width: 0.8; fill: none; }}
      .title {{ font-family: 'Anton', 'Cinzel', serif; font-size: 26px; fill: #e8e4dc; letter-spacing: 0.12em; }}
      .sub {{ font-family: 'Inter', sans-serif; font-size: 13px; fill: #9c9588; font-style: italic; letter-spacing: 0.05em; }}
      .latin {{ font-family: 'Inter', sans-serif; font-size: 11px; fill: #b13227; font-weight: bold; letter-spacing: 0.15em; }}
      .plate-no {{ font-family: 'Anton', monospace; font-size: 14px; fill: #b13227; }}
    </style>
  </defs>

  <!-- Background -->
  <rect width="{w}" height="{h}" class="bg" />
  
  <!-- Outer & Inner Archival Frames -->
  <rect x="25" y="25" width="{w-50}" height="{h-50}" class="frame" />
  <rect x="33" y="33" width="{w-66}" height="{h-66}" class="inner-frame" />
  
  <!-- Header Block -->
  <g transform="translate(60, 68)">
    <text x="0" y="0" class="latin">{latin.upper()}</text>
    <text x="0" y="28" class="title">{title}</text>
    <text x="0" y="48" class="sub">{sub}</text>
  </g>
  <text x="{w-60}" y="70" class="plate-no" text-anchor="end">HERBARIUM CHTHONICUM</text>

  <!-- Botanical Artwork -->
  {art}

  <!-- Callouts -->
  {labels_svg}

  <!-- Footer metadata -->
  <g transform="translate(60, {h-45})">
    <text x="0" y="0" font-family="'Inter', sans-serif" font-size="10" fill="#7a756b" letter-spacing="0.08em">RUSSIAN CHTHONIC ATLAS · SECTION BOTANICA</text>
    <text x="{w-120}" y="0" font-family="'Inter', sans-serif" font-size="10" fill="#7a756b" text-anchor="end">ARCHIVAL RECONSTRUCTION · CC BY-SA 4.0</text>
  </g>
</svg>'''
    
    filename = f"diagram-botany-{species_id}{'-ru' if is_ru else ''}.svg"
    path = os.path.join("assets/illustrations", filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Generated {path}")

for sp in ["spruce", "aspen", "poppy", "juniper"]:
    make_botany_svg(sp, "en")
    make_botany_svg(sp, "ru")
