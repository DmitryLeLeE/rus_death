import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

CARDS = [
    {
        "out": "social/plate-y.jpg",
        "image": "assets/derived/soldier-flowers.webp",
        "kicker": "PLATE Y · VOLUME IV · THE MILITARY CENOTAPH",
        "letter": "Y",
        "title": "THE MILITARY\nCENOTAPH",
        "subtitle": "Sanitary burials, mass graves, the Unknown Soldier\nand the search movement.",
        "meta": "1941–1945 · RZHEV, NOVGOROD, VOLGOGRAD",
        "site": "RUSSIAN CHTHONIC ATLAS",
        "is_ru": False,
    },
    {
        "out": "social/ru-plate-y.jpg",
        "image": "assets/derived/soldier-flowers.webp",
        "kicker": "ЛИСТ Y · ТОМ IV · ВОИНСКИЙ КЕНОТАФ",
        "letter": "Y",
        "title": "ВОИНСКИЙ\nКЕНОТАФ",
        "subtitle": "Военные захоронения, братские могилы,\nкульт Неизвестного солдата и поисковые отряды.",
        "meta": "1941–1945 · РЖЕВ, НОВГОРОД, ВОЛГОГРАД",
        "site": "РУССКИЙ ХТОНИЧЕСКИЙ АТЛАС",
        "is_ru": True,
    },
    {
        "out": "social/plate-z.jpg",
        "image": "assets/derived/keret-graves-faded.webp",
        "kicker": "PLATE Z · VOLUME IV · OBLIVION AND RECLAMATION",
        "letter": "Z",
        "title": "OBLIVION &\nRECLAMATION",
        "subtitle": "The material dissolution of the cemetery:\ntimber decay, weathered limestone and the return of turf.",
        "meta": "ECOLOGICAL THRESHOLD · NORTHERN RUSSIAN FORESTS",
        "site": "RUSSIAN CHTHONIC ATLAS",
        "is_ru": False,
    },
    {
        "out": "social/ru-plate-z.jpg",
        "image": "assets/derived/keret-graves-faded.webp",
        "kicker": "ЛИСТ Z · ТОМ IV · ЗАБВЕНИЕ И УХОД В ЗЕМЛЮ",
        "letter": "Z",
        "title": "ЗАБВЕНИЕ И\nУХОД В ЗЕМЛЮ",
        "subtitle": "Материальный конец кладбища: истлевание крестов,\nвыветривание известняка и наступление дерна.",
        "meta": "ЭКОЛОГИЧЕСКИЙ ПОРОГ · СЕВЕРНЫЕ КЛАДБИЩА",
        "site": "РУССКИЙ ХТОНИЧЕСКИЙ АТЛАС",
        "is_ru": True,
    },
]

def render_card(c):
    W, H = 1200, 630
    canvas = Image.new("RGB", (W, H), (13, 12, 11))
    
    # Load and process ground image
    if os.path.exists(c["image"]):
        bg = Image.open(c["image"]).convert("RGB")
        # Resize preserving aspect ratio to cover
        bw, bh = bg.size
        scale = max(W / bw, H / bh)
        nw, nh = int(bw * scale), int(bh * scale)
        bg = bg.resize((nw, nh), Image.LANCZOS)
        # Crop center
        left = (nw - W) // 2
        top = (nh - H) // 2
        bg = bg.crop((left, top, left + W, top + H))
        # Convert to grayscale, boost contrast, dim
        bg = bg.convert("L").convert("RGB")
        enhancer = ImageEnhance.Contrast(bg)
        bg = enhancer.enhance(1.2)
        enhancer = ImageEnhance.Brightness(bg)
        bg = enhancer.enhance(0.45)
        canvas.paste(bg, (0, 0))
    
    # Horizontal dark gradient shade overlay
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shade_draw = ImageDraw.Draw(shade)
    for x in range(W):
        # 0 to 55% -> heavy dark; 55% to 100% -> lighter
        factor = x / W
        if factor < 0.55:
            alpha = int(240 - factor * 80)
        else:
            alpha = int(196 - (factor - 0.55) * 350)
        alpha = max(40, min(250, alpha))
        shade_draw.line([(x, 0), (x, H)], fill=(13, 12, 11, alpha))
    canvas.paste(shade, (0, 0), shade)
    
    draw = ImageDraw.Draw(canvas)
    
    # Fonts
    font_impact_huge = ImageFont.truetype("C:/Windows/Fonts/impact.ttf", 380)
    font_impact_title = ImageFont.truetype("C:/Windows/Fonts/impact.ttf", 94 if c["is_ru"] else 104)
    font_mono = ImageFont.truetype("C:/Windows/Fonts/cour.ttf", 15)
    font_serif = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 26)
    
    # Large letter on the right (red)
    draw.text((W - 270, 40), c["letter"], font=font_impact_huge, fill=(180, 40, 25))
    
    # Red kicker
    draw.text((56, 44), c["kicker"], font=font_mono, fill=(217, 59, 39))
    
    # Title
    draw.text((54, 110), c["title"], font=font_impact_title, fill=(243, 238, 226), spacing=10)
    
    # Red separator bar above subtitle
    sub_y = 360 if "\n" in c["title"] else 300
    draw.rectangle([(56, sub_y), (132, sub_y + 4)], fill=(217, 59, 39))
    
    # Subtitle (serif italic)
    draw.text((56, sub_y + 20), c["subtitle"], font=font_serif, fill=(243, 238, 226), spacing=8)
    
    # Bottom metadata
    draw.text((56, H - 46), c["meta"], font=font_mono, fill=(180, 175, 165))
    draw.text((W - 320, H - 46), c["site"], font=font_mono, fill=(180, 175, 165))
    
    # Bottom accent line (red)
    draw.rectangle([(0, H - 7), (W, H)], fill=(179, 36, 26))
    
    canvas.save(c["out"], "JPEG", quality=92)
    print(f"Generated {c['out']}")

for c in CARDS:
    render_card(c)
print("All social cards generated.")
