# -*- coding: utf-8 -*-
"""Second set of original editorial diagrams (EN + RU): plates T, S, O.
Every claim drawn here is taken from the plate's own sourced text; positions are schematic.
Run from the repo root: python3 build/make_diagrams2.py"""
import os, sys, textwrap
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from make_diagrams import T, lines, wrap, save, esc, INK, RED, PAPER, GREY, MONO, SERIF

MID = "#c9c2b0"   # light rule / hatch
SOFT = "#d9d2c0"  # field tint


def wrapn(s, size, px):
    """wrap text to a pixel width for a monospace face"""
    n = max(8, int(px / (size * 0.6)))
    return textwrap.wrap(s, n)


def chip(x, y, w, head, body, src, size=11, dashed=False, accent=INK, num=None):
    """a labelled note: optional number badge, wrapped heading, wrapped body, source line. returns (svg, height)"""
    lh = size + 4
    off = 36 if num else 10
    hl = wrapn(head, size + 0.5, w - off - 10)
    bl = wrapn(body, size, w - 20)
    sl = wrapn(src, size - 1, w - 20)
    h = 12 + len(hl) * (lh + 1) + 8 + len(bl) * lh + 6 + len(sl) * (lh - 1) + 10
    dash = ' stroke-dasharray="5 4"' if dashed else ""
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{PAPER}" stroke="{accent}" stroke-width="1.6"{dash}/>'
    if num:
        s += f'<circle cx="{x+20}" cy="{y+22}" r="11" fill="{RED}"/>' + T(x + 20, y + 26.5, str(num), 12.5, PAPER, "middle", weight="bold")
    s += lines(x + off, y + 20, hl, size + 0.5, lh + 1, fill=accent, weight="bold")
    by = y + 12 + len(hl) * (lh + 1) + 6
    s += lines(x + 10, by + 12, bl, size, lh)
    s += lines(x + 10, by + 12 + len(bl) * lh + 8, sl, size - 1, lh - 1, fill=GREY)
    return s, h


def cross(x, y, k=1.0, col=INK):
    return (f'<path d="M{x} {y-9*k} L{x} {y+9*k} M{x-5*k} {y-4*k} L{x+5*k} {y-4*k}" stroke="{col}" stroke-width="1.6" fill="none"/>')


# ------------------------------------------------------------------ T: who lay where
def burial_plan(L):
    S = {
      "en": dict(t="WHO LAY WHERE, ON A PLAN OF THE CEMETERY",
        s="Schematic: zones, not distances. Each note is placed by what its source says and carries that source's date and limit.",
        inside="COMMON CEMETERY", fence="FENCE", np="OUTSIDE · PLACE NOT GIVEN",
        z=dict(forest="forest", hills="hills", swamp="swamp", road="crossroads", ditch="ditch by the cemetery"),
        c_inf=("UNBAPTISED INFANTS, SMOLENSK, 2018–19", "Buried in the common cemetery; not called ‘unclean’.", "Ryko. Informants’ memory; one region."),
        c_vio=("VIOLENT DEATH, MUSCOVITE RUSSIA", "No obstacle to cemetery burial and commemoration, on the author’s reading.", "Avdeev. Abstract only; article not read."),
        c_sor=("SORCERERS", "Outside the cemetery or by its fence. Stake and severed head are reported, from one modern informant.", "Ovseichik. Vitebsk, Pskov, Smolensk."),
        c_sui=("SUICIDES", "Crossroads, swamp, ditch by the cemetery, hills, forest. No wash, meal or service; sometimes an aspen stake.", "Ovseichik. 19th – early 20th c."),
        c_unb=("UNBAPTISED CHILDREN", "Kept out of common cemeteries; the ban called strictly enforced. Place not given.", "Ovseichik. First half of the 20th c."),
        c_han=("HANGED AND DROWNED, SMOLENSK", "A former ban on the common cemetery, remembered by people born in the 1930s.", "Ryko. One district."),
        key=["SOLID = reported practice, source read", "DASHED = memory of informants, or a source read only in part",
             "The sources disagree: Ryko’s infants lie inside; Ovseichik’s children were kept out. Different regions and decades; the plate does not reconcile them."],
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCES: OVSEICHIK 2022, RYKO 2025, AVDEEV 2019 (ABSTRACT), TOWNSEND 2011"),
      "ru": dict(t="КТО ГДЕ ЛЁГ: ПЛАН КЛАДБИЩА",
        s="Схема: зоны, а не расстояния. Каждая заметка поставлена по тому, что говорит её источник, с датой и границей источника.",
        inside="ОБЩЕЕ КЛАДБИЩЕ", fence="ОГРАДА", np="СНАРУЖИ · МЕСТО НЕ НАЗВАНО",
        z=dict(forest="лес", hills="холмы", swamp="болото", road="перекрёсток", ditch="канава у кладбища"),
        c_inf=("НЕКРЕЩЁНЫЕ МЛАДЕНЦЫ, СМОЛЕНСК, 2018–19", "Хоронили на общем кладбище; «нечистыми» не называют.", "Рыко. Память информантов; один регион."),
        c_vio=("НАСИЛЬСТВЕННАЯ СМЕРТЬ, МОСКОВСКАЯ РУСЬ", "Препятствий погребению на кладбище и поминовению нет, по прочтению автора.", "Авдеев. Только аннотация; статья не читалась."),
        c_sor=("КОЛДУНЫ", "За кладбищем или у ограды. Кол и отсечённая голова названы со слов одного современного информанта.", "Овсейчик. Витебск, Псков, Смоленск."),
        c_sui=("САМОУБИЙЦЫ", "Перекрёсток, болото, канава у кладбища, холмы, лес. Без омовения, трапезы и службы; иногда осиновый кол.", "Овсейчик. XIX — начало XX в."),
        c_unb=("НЕКРЕЩЁНЫЕ ДЕТИ", "Не допускались на общие кладбища; запрет назван строго соблюдавшимся. Место не названо.", "Овсейчик. Первая половина XX в."),
        c_han=("ПОВЕШЕННЫЕ И УТОПЛЕННИКИ, СМОЛЕНСК", "Прежний запрет на общее кладбище, помнят родившиеся в 1930-е.", "Рыко. Один район."),
        key=["СПЛОШНАЯ РАМКА = записанная практика, источник читался", "ПУНКТИР = память информантов или источник, читавшийся лишь частично",
             "Источники расходятся: младенцы у Рыко лежат внутри, дети у Овсейчик не допускались. Разные регионы и десятилетия; лист их не примиряет."],
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИКИ: ОВСЕЙЧИК 2022, РЫКО 2025, АВДЕЕВ 2019 (АННОТАЦИЯ), ТАУНСЕНД 2011")}[L]
    W, H = 1000, 872
    b = ""
    cx0, cy0, cx1, cy1 = 385, 310, 615, 470
    def num(x, y, n):
        return f'<circle cx="{x}" cy="{y}" r="11" fill="{RED}" stroke="{PAPER}" stroke-width="2"/>' + T(x, y + 4.5, str(n), 12.5, PAPER, "middle", weight="bold")
    # fence (dashed) and field
    b += f'<rect x="{cx0-24}" y="{cy0-24}" width="{cx1-cx0+48}" height="{cy1-cy0+48}" fill="none" stroke="{INK}" stroke-width="1.5" stroke-dasharray="9 5"/>'
    b += f'<rect x="{cx0}" y="{cy0}" width="{cx1-cx0}" height="{cy1-cy0}" fill="{SOFT}" stroke="{INK}" stroke-width="2.4"/>'
    for gx in range(cx0 + 26, cx1 - 10, 42):
        for gy in range(cy0 + 30, cy1 - 8, 42):
            b += cross(gx, gy, 0.75, "#8c8574")
    b += T(500, 395, S["inside"], 12.5, INK, "middle", weight="bold")
    b += T(500, cy0 - 30, S["fence"], 10.5, GREY, "middle")
    # forest (top-left of centre)
    for gx, gy in [(405, 150), (437, 138), (469, 154), (421, 176), (453, 180)]:
        b += f'<path d="M{gx} {gy} l-13 26 h26 z" fill="none" stroke="{INK}" stroke-width="1.5"/><line x1="{gx}" y1="{gy+26}" x2="{gx}" y2="{gy+33}" stroke="{INK}" stroke-width="1.5"/>'
    b += T(437, 232, S["z"]["forest"], 11, GREY, "middle", style="italic") + num(484, 138, 3)
    # hills (top-right of centre)
    for gx in (545, 595):
        b += f'<path d="M{gx-30} 190 Q{gx} 140 {gx+30} 190" fill="none" stroke="{INK}" stroke-width="1.6"/>'
    b += T(570, 232, S["z"]["hills"], 11, GREY, "middle", style="italic") + num(626, 150, 3)
    # ditch along the lower fence
    b += f'<path d="M{cx0-24} {cy1+44} L{cx1+24} {cy1+44}" stroke="{INK}" stroke-width="1.5" stroke-dasharray="2 4"/>'
    b += T(500, cy1 + 66, S["z"]["ditch"], 10.5, GREY, "middle", style="italic") + num(500, cy1 + 44, 3)
    # swamp (bottom-left of centre)
    for gy in (575, 593, 611):
        b += f'<path d="M385 {gy} q15 -9 30 0 t30 0 t30 0" fill="none" stroke="{INK}" stroke-width="1.5"/>'
    b += T(430, 640, S["z"]["swamp"], 11, GREY, "middle", style="italic") + num(484, 571, 3)
    # crossroads (bottom-right of centre)
    b += f'<path d="M550 572 L610 632 M610 572 L550 632" stroke="{INK}" stroke-width="3"/>'
    b += T(580, 654, S["z"]["road"], 11, GREY, "middle", style="italic") + num(626, 572, 3)
    # markers inside / fence
    b += num(440, 345, 1) + num(560, 435, 4) + num(cx0 - 24, 395, 2)
    # outside, place not given
    b += f'<rect x="{cx0-24}" y="690" width="{cx1-cx0+48}" height="34" fill="none" stroke="{INK}" stroke-width="1.4" stroke-dasharray="3 4"/>'
    b += T(500, 711, S["np"], 10.5, GREY, "middle", style="italic") + num(cx0 - 6, 707, 5) + num(cx1 + 6, 707, 6)

    def leader(x0, y0, x1, y1):
        return f'<path d="M{x0} {y0} L{x1} {y1}" stroke="{RED}" stroke-width="1.3" fill="none"/>'
    cl = [("c_inf", 30, 100, True, 1, (320, 140, 429, 340)), ("c_sor", 30, 300, True, 2, (320, 340, 361, 392)),
          ("c_unb", 30, 500, False, 5, (320, 560, 379, 705)),
          ("c_vio", 680, 100, True, 4, (680, 140, 571, 430)), ("c_sui", 680, 300, False, 3, None),
          ("c_han", 680, 520, True, 6, (680, 590, 621, 705))]
    ch = ""
    for k, x, y, dashed, n, ld in cl:
        sv, h = chip(x, y, 290, *S[k], size=11, dashed=dashed, num=n)
        ch += sv
        if ld: ch = leader(*ld) + ch
    b = ch + b
    b += lines(30, 758, [S["key"][0] + "      " + "", S["key"][1]], 11, 15, fill=INK)
    b += lines(30, 790, wrapn(S["key"][2], 10.5, 940), 10.5, 14, fill=GREY)
    return wrap(W, H, S["t"], S["s"], b, S["foot"])


# ------------------------------------------------------------------ S: house and yard
def house_plan(L):
    S = {
      "en": dict(t="WHERE THE SPIRIT LIVES, AND WHO SAYS IT IS A DEAD PERSON",
        s="A schematic farmstead, not a plan of any village. Marks show what each source states about a link to the dead.",
        izba="DWELLING HOUSE", yard="YARD", barn="THRESHING BARN", bath="BATHHOUSE", cellar="CELLAR",
        lg=["● the source says the spirit is, or may be, a dead person (ancestor or relative)", "◐ tied to the ancestor cult in a general statement, or a possibility only", "○ no link to the dead stated", "■ linked to a particular dead: unbaptised infants"],
        d1=("DOMOVOY", "●", "Ancestor’s soul that became the soul of the house; possibly a restless soul of a relative.", "Ansimova and Golubkova"),
        d2=("DOMOVOY, ARKHANGELSK OBL.", "●", "Usually a deceased member of the family, first ancestor of the clan.", "Drannikova; fieldwork 1990–2012"),
        d3=("DOMOVOY, PERM, 2019", "◐", "Names such as ‘grandfather’ may point to a family ancestor.", "Granova; one village"),
        d4=("DOMOVOY, KARGOPOL", "◐", "Tied to the ancestor cult in a general statement; not said to be a dead person.", "Denisevich; student work"),
        d5=("KIKIMORA", "■", "Unbaptised dead infants.", "Ansimova and Golubkova"),
        d6=("FEMALE SPIRIT IN THE CELLAR", "○", "Harmful; not recorded elsewhere in the Perm archives read.", "Granova; one village"),
        d7=("BANNIK / BAENNIK", "○", "Set apart as most dangerous; no ancestor link stated.", "Ansimova and Golubkova; Denisevich"),
        d8=("OVINNIK", "○", "Spirit of the threshing barn; no link stated.", "Denisevich"),
        d9=("DVOROVOY", "○", "Spirit of the yard; no link stated.", "Denisevich"),
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCES: ANSIMOVA AND GOLUBKOVA 2016, GRANOVA 2019, DRANNIKOVA, DENISEVICH (KARGOPOL)"),
      "ru": dict(t="ГДЕ ЖИВЁТ ДУХ И КТО СЧИТАЕТ ЕГО УМЕРШИМ",
        s="Схема усадьбы, а не план какой-либо деревни. Знаки показывают, что каждый источник говорит о связи с умершими.",
        izba="ЖИЛОЙ ДОМ", yard="ДВОР", barn="ОВИН", bath="БАНЯ", cellar="ПОДПОЛЬЕ",
        lg=["● источник говорит, что дух есть или может быть умершим (предок, родственник)", "◐ связан с культом предков общим утверждением или только как возможность", "○ связь с умершими не названа", "■ связан с определёнными умершими: некрещёнными младенцами"],
        d1=("ДОМОВОЙ", "●", "Душа предка, ставшая душой дома; возможно, неупокоенная душа родственника.", "Ансимова и Голубкова"),
        d2=("ДОМОВОЙ, АРХАНГЕЛЬСКАЯ ОБЛ.", "●", "Обычно умерший член семьи, первый предок рода.", "Дранникова; полевые материалы 1990–2012"),
        d3=("ДОМОВОЙ, ПЕРМСКИЙ КРАЙ, 2019", "◐", "Имена вроде «дедушка» могут указывать на предка семьи.", "Гранова; одна деревня"),
        d4=("ДОМОВОЙ, КАРГОПОЛЬЕ", "◐", "Связан с культом предков общим утверждением; умершим не назван.", "Денисевич; студенческая работа"),
        d5=("КИКИМОРА", "■", "Некрещёные умершие младенцы.", "Ансимова и Голубкова"),
        d6=("ЖЕНСКИЙ ДУХ В ПОДПОЛЬЕ", "○", "Вредный; в прочитанных пермских архивах не отмечен.", "Гранова; одна деревня"),
        d7=("БАННИК / БАЕННИК", "○", "Выделен как самый опасный; связь с предками не названа.", "Ансимова и Голубкова; Денисевич"),
        d8=("ОВИННИК", "○", "Дух овина; связь не названа.", "Денисевич"),
        d9=("ДВОРОВОЙ", "○", "Дух двора; связь не названа.", "Денисевич"),
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИКИ: АНСИМОВА И ГОЛУБКОВА 2016, ГРАНОВА 2019, ДРАННИКОВА, ДЕНИСЕВИЧ (КАРГОПОЛЬЕ)")}[L]
    W = 1000
    b = ""
    def mark(x, y, g, n):
        if g == "●": sh = f'<circle cx="{x}" cy="{y}" r="12" fill="{RED}"/>'; tc = PAPER
        elif g == "◐": sh = f'<circle cx="{x}" cy="{y}" r="12" fill="#e8b9b0" stroke="{RED}" stroke-width="2.4"/>'; tc = INK
        elif g == "○": sh = f'<circle cx="{x}" cy="{y}" r="12" fill="{PAPER}" stroke="{INK}" stroke-width="2"/>'; tc = INK
        else: sh = f'<rect x="{x-11}" y="{y-11}" width="22" height="22" fill="{RED}" transform="rotate(45 {x} {y})"/>'; tc = PAPER
        return sh + T(x, y + 4.5, str(n), 12, tc, "middle", weight="bold")
    # buildings
    ix0, iy0, ix1, iy1 = 330, 130, 670, 270
    b += f'<rect x="{ix0}" y="{iy0}" width="{ix1-ix0}" height="{iy1-iy0}" fill="{SOFT}" stroke="{INK}" stroke-width="2.4"/>'
    b += T(500, iy0 - 10, S["izba"], 12.5, INK, "middle", weight="bold")
    b += f'<rect x="{ix0+80}" y="{iy1}" width="{ix1-ix0-160}" height="44" fill="none" stroke="{INK}" stroke-width="1.6" stroke-dasharray="6 4"/>'
    b += T(530, iy1 + 30, S["cellar"], 11, GREY, "middle", style="italic")
    bx0, by0, bx1, by1 = 60, 170, 230, 270
    b += f'<rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" fill="none" stroke="{INK}" stroke-width="2"/>'
    for k in range(1, 6): b += f'<line x1="{bx0}" y1="{by0+k*16.6}" x2="{bx1}" y2="{by0+k*16.6}" stroke="{MID}"/>'
    b += T(145, by0 - 10, S["barn"], 11.5, INK, "middle", weight="bold")
    b += f'<rect x="790" y="180" width="130" height="90" fill="none" stroke="{INK}" stroke-width="2"/>'
    b += T(855, 170, S["bath"], 11.5, INK, "middle", weight="bold")
    b += f'<rect x="200" y="330" width="600" height="80" fill="none" stroke="{INK}" stroke-width="1.4" stroke-dasharray="3 5"/>'
    b += T(500, 376, S["yard"], 12, INK, "middle", weight="bold")
    # markers: number = note number
    pos = {1: (395, 185), 2: (445, 215), 3: (560, 185), 4: (610, 215), 5: (520, 245), 6: (440, 292), 7: (855, 235), 8: (145, 225), 9: (350, 372)}
    order = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9"]
    for n, k in enumerate(order, 1):
        x, y = pos[n]; b += mark(x, y, S[k][1], n)
    # notes in a 3 x 3 grid
    cw = 300; xs = [30, 350, 670]; ys = [450, 450, 450]
    y = 450
    for r in range(3):
        rowh = 0; chips = []
        for c in range(3):
            n = r * 3 + c + 1; head, g, body, src = S[order[n - 1]]
            sv, h = chip(xs[c], y, cw, head, body, src, size=10.5, num=None)
            chips.append((sv, h, n, g, xs[c])); rowh = max(rowh, h)
        for sv, h, n, g, x in chips:
            # redraw with uniform height: simple approach, draw chip then marker at its right top
            b += sv + mark(x + cw - 20, y + 22, g, n)
        y += rowh + 14
    b += lines(30, y + 10, S["lg"], 10.5, 16)
    H = int(y + 120)
    return wrap(W, H, S["t"], S["s"], b, S["foot"])


# ------------------------------------------------------------------ O: Semik reports, by place and by source
def semik_chain(L):
    S = {
      "en": dict(t="SEMIK AND THE DROWNED: WHO REPORTED WHAT, AND THROUGH WHOM WE READ IT",
        s="Each line is a report in Zelenin’s compilation; the originals were not seen. Years are those of the cited work.",
        h1="YEAR OF CITED WORK", h2="PLACE", h3="WHAT IS REPORTED", h4="AS CITED BY ZELENIN",
        rows=[("1807 (publ. 1908)", "Khlynov (Vyatka)", "Semik Thursday memorial services at the former poor-house burial ground, where executed criminals and unclaimed poor lay.", "Veshchomov, p. 192"),
              ("1862", "Kotelnich", "Festive commemoration, with egg-throwing and clay-ball fights.", "Glushkov, pp. 27–30"),
              ("1894", "Smolensk (city)", "Memorial service at the Petropavlovsk parish cemetery for those who died violent deaths and stayed unidentified.", "Georgievsky, p. 3"),
              ("1904", "Ledovo, Yaransk district", "Commemoration on the Saturday after Trinity, at the site of a former poor house.", "Zelenin’s own record, p. 161"),
              ("1908", "Smolensk province", "Peasants remember the drowned, the hanged and others who died suddenly, on Semik.", "Dobrovolsky, p. 14")],
        read="READ HERE THROUGH", read2="Zelenin 1916, chapter 4, in the 1995 reprint", read3="originals not seen",
        side="NOT IN THE ZELENIN PASSAGES READ", side2="Smolensk province: no washing, rinsing or work with water on Semik, so no one drowns. Wreaths and birches thrown into rivers; floating or sinking read as marriage or death.",
        side3="Great Russian Encyclopedia entry: anonymous, undated, no original cited.",
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCES: ZELENIN 1916 (1995 REPRINT, CH. 4), BRE ‘SEMIK’"),
      "ru": dict(t="СЕМИК И УТОПЛЕННИКИ: КТО ЧТО СООБЩИЛ И ЧЕРЕЗ КОГО МЫ ЭТО ЧИТАЕМ",
        s="Каждая строка — сообщение в компиляции Зеленина; оригиналы не видели. Годы — годы цитируемой работы.",
        h1="ГОД РАБОТЫ", h2="МЕСТО", h3="ЧТО СООБЩАЕТСЯ", h4="КАК ЦИТИРУЕТ ЗЕЛЕНИН",
        rows=[("1807 (изд. 1908)", "Хлынов (Вятка)", "В семицкий четверг панихиды на бывшем убогом доме, где лежали казнённые преступники и безродные бедняки.", "Вещомов, с. 192"),
              ("1862", "Котельнич", "Праздничное поминовение, с бросанием яиц и боем глиняных шаров.", "Глушков, с. 27–30"),
              ("1894", "Смоленск (город)", "Панихида на Петропавловском приходском кладбище по умершим насильственной смертью и неопознанным.", "Георгиевский, с. 3"),
              ("1904", "Ледово, Яранский уезд", "Поминовение в субботу после Троицы на месте бывшего убогого дома.", "Собственная запись Зеленина, с. 161"),
              ("1908", "Смоленская губерния", "Крестьяне поминают на Семик утопленников, повешенных и других внезапно умерших.", "Добровольский, с. 14")],
        read="ЧИТАЕТСЯ ЗДЕСЬ ЧЕРЕЗ", read2="Зеленин 1916, гл. 4, по переизданию 1995", read3="оригиналы не видели",
        side="НЕТ В ПРОЧИТАННЫХ ОТРЫВКАХ ЗЕЛЕНИНА", side2="Смоленская губерния: на Семик не стирают, не полощут и не работают с водой, чтобы никто не утонул. Венки и берёзки бросают в реки; всплыл или утонул венок — знак брака или смерти.",
        side3="Статья БРЭ: без автора, без даты, оригинал не указан.",
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИКИ: ЗЕЛЕНИН 1916 (ПЕРЕИЗДАНИЕ 1995, ГЛ. 4), БРЭ «СЕМИК»")}[L]
    W, H = 1000, 700
    b = ""
    cols = [30, 190, 380, 700]
    hh = [S["h1"], S["h2"], S["h3"], S["h4"]]
    for x, h in zip(cols, hh):
        b += T(x, 104, h, 10.5, GREY, weight="bold")
    b += f'<line x1="30" y1="112" x2="970" y2="112" stroke="{INK}" stroke-width="1.5"/>'
    y = 124
    rowy = []
    for yr, pl, what, cite in S["rows"]:
        wl = wrapn(what, 11, 300)
        pll = wrapn(pl, 11.5, 170)
        h = max(len(wl) * 15, len(pll) * 15) + 18
        b += T(cols[0], y + 22, yr, 12.5, RED, weight="bold")
        b += lines(cols[1], y + 22, pll, 11.5, 15, weight="bold")
        b += lines(cols[2], y + 22, wl, 11, 15)
        b += lines(cols[3], y + 22, wrapn(cite, 11.5, 150), 11.5, 15, fill=INK)
        b += f'<line x1="30" y1="{y+h}" x2="970" y2="{y+h}" stroke="{MID}" stroke-width="1"/>'
        rowy.append((y, h))
        y += h + 4
    top, bottom = 124, y - 4
    # read-through box below the table (clearer than a side box)
    ry = bottom + 28
    b += f'<path d="M500 {bottom+4} L500 {ry}" stroke="{RED}" stroke-width="2"/><path d="M493 {ry-8} L500 {ry} L507 {ry-8}" fill="none" stroke="{RED}" stroke-width="2"/>'
    b += f'<rect x="250" y="{ry}" width="500" height="64" fill="none" stroke="{INK}" stroke-width="2.2"/>'
    b += T(500, ry + 22, S["read"], 10.5, GREY, "middle", weight="bold") + T(500, ry + 40, S["read2"], 12.5, INK, "middle", weight="bold") + T(500, ry + 56, S["read3"], 11, RED, "middle")
    # side lane: dashed, separate
    sy = ry + 96
    sl = wrapn(S["side2"], 11, 880)
    h = 28 + len(sl) * 15 + 34
    b += f'<rect x="30" y="{sy}" width="940" height="{h}" fill="none" stroke="{INK}" stroke-width="1.6" stroke-dasharray="6 4"/>'
    b += T(44, sy + 20, S["side"], 10.5, RED, weight="bold") + lines(44, sy + 40, sl, 11, 15) + T(44, sy + 40 + len(sl) * 15 + 4, S["side3"], 10.5, GREY, style="italic")
    H = int(sy + h + 62)
    return wrap(W, H, S["t"], S["s"], b, S["foot"])


# ------------------------------------------------------------------ H: the days, two registers
def commemoration_days(L):
    S = {
      "en": dict(t="THE FORTY DAYS, IN TWO REGISTERS",
        s="Above the line: the Church handbook’s stated reasons. Below, dashed: what the atlas files as folk elaboration.",
        ax=["DEATH", "DAY 3", "DAY 9", "DAY 40", "THE YEAR"], lab_d="DOCTRINE · DOCUMENTED", lab_f="FOLK ELABORATION · INTERPRETATION",
        d=[("THIRD DAY", "Reason given: the Resurrection.", "Novaia Skrizhal’ (1803), as summarised in this atlas."),
           ("NINTH DAY", "Reason given: the nine ranks of angels.", "Novaia Skrizhal’ (1803)."),
           ("FORTIETH DAY", "Reason given: the Ascension, on the fortieth day. The last of the appointed commemorations.", "Novaia Skrizhal’ (1803)."),
           ("THE YEAR", "The annual commemoration continues after the fortieth day.", "Plate H, from the same handbook.")],
        f1=("UP TO THE FORTIETH DAY", "The soul lingers, wanders, visits the house and needs to be fed.", "Ivanits 1989, as set out in the plate’s table."),
        f2=("AT THE FORTIETH DAY", "The soul departs, after a journey.", "Ivanits 1989."),
        tollh=("TOLL-HOUSES · NOT PLACED ON THE LINE", "The vision of Theodora in the Life of St Basil the New: angels lead the dead woman through trials where evil spirits try to claim her soul. A hagiographic narrative, widely received, never a binding dogma. The trials are not listed here because the Life itself was not read.", "Orthodox theological article citing the Orthodox Encyclopedia."),
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCES: NOVAIA SKRIZHAL’ 1803, IVANITS 1989, AZBYKA ‘MYTARSTVA’ ARTICLE"),
      "ru": dict(t="СОРОК ДНЕЙ В ДВУХ РЕГИСТРАХ",
        s="Над линией: причины, названные в церковном требнике. Под линией, пунктиром: то, что атлас относит к народному развитию.",
        ax=["СМЕРТЬ", "3-Й ДЕНЬ", "9-Й ДЕНЬ", "40-Й ДЕНЬ", "ГОД"], lab_d="ДОКТРИНА · ДОКУМЕНТИРОВАНО", lab_f="НАРОДНОЕ РАЗВИТИЕ · ИНТЕРПРЕТАЦИЯ",
        d=[("ТРЕТИЙ ДЕНЬ", "Названная причина: Воскресение.", "«Новая скрижаль» (1803), в пересказе атласа."),
           ("ДЕВЯТЫЙ ДЕНЬ", "Названная причина: девять ангельских чинов.", "«Новая скрижаль» (1803)."),
           ("СОРОКОВОЙ ДЕНЬ", "Названная причина: Вознесение на сороковой день. Последнее из установленных поминовений.", "«Новая скрижаль» (1803)."),
           ("ГОД", "Годовое поминовение продолжается после сорокового дня.", "Плита H, по тому же требнику.")],
        f1=("ДО СОРОКОВОГО ДНЯ", "Душа задерживается, блуждает, навещает дом и нуждается в пище.", "Айваниц 1989, по таблице плиты."),
        f2=("В СОРОКОВОЙ ДЕНЬ", "Душа уходит после странствия.", "Айваниц 1989."),
        tollh=("МЫТАРСТВА · НА ЛИНИЮ НЕ ПОСТАВЛЕНЫ", "Видение Феодоры в Житии св. Василия Нового: ангелы ведут умершую женщину через испытания, где злые духи пытаются завладеть её душой. Агиографическое повествование, широко принятое, но никогда не обязательный догмат. Испытания здесь не перечислены: само Житие не читалось.", "Богословская статья, цитирующая «Православную энциклопедию»."),
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИКИ: «НОВАЯ СКРИЖАЛЬ» 1803, АЙВАНИЦ 1989, СТАТЬЯ AZBYKA О МЫТАРСТВАХ")}[L]
    W = 1000
    xs = [30, 270, 510, 750]; cw = 220
    b = ""
    b += T(30, 104, S["lab_d"], 10.5, GREY, weight="bold")
    chips = []; hmax = 0
    for x, (h_, b_, s_) in zip(xs, S["d"]):
        svg, h = chip(x, 116, cw, h_, b_, s_)
        chips.append(svg); hmax = max(hmax, h)
    b += "".join(chips)
    ay = 116 + hmax + 52
    b += f'<line x1="30" y1="{ay}" x2="970" y2="{ay}" stroke="{INK}" stroke-width="2.4"/>'
    pts = [60, 380, 620, 860, 940]
    # death at 60, day3 at xs[0]+cw/2 ...; place ticks under the doctrine chips
    tick = [60, xs[0] + cw / 2, xs[1] + cw / 2, xs[2] + cw / 2, xs[3] + cw / 2]
    for x, lab in zip(tick, S["ax"]):
        b += f'<line x1="{x}" y1="{ay-8}" x2="{x}" y2="{ay+8}" stroke="{INK}" stroke-width="2.4"/>' + T(x, ay + 26, lab, 11, RED, "middle", weight="bold")
    for x in tick[1:]:
        b += f'<path d="M{x} {116+hmax} L{x} {ay-8}" stroke="{MID}" stroke-width="1.2"/>'
    fy = ay + 62
    b += T(30, fy, S["lab_f"], 10.5, GREY, weight="bold")
    f1s, h1 = chip(30, fy + 12, 470, S["f1"][0], S["f1"][1], S["f1"][2], dashed=True)
    f2s, h2 = chip(510, fy + 12, cw, S["f2"][0], S["f2"][1], S["f2"][2], dashed=True)
    b += f1s + f2s
    ty = fy + 12 + max(h1, h2) + 30
    ts, ht = chip(30, ty, 940, S["tollh"][0], S["tollh"][1], S["tollh"][2], dashed=True, accent=RED)
    b += ts
    H = int(ty + ht + 62)
    return wrap(W, H, S["t"], S["s"], b, S["foot"])


if __name__ == "__main__":
    for name, fn in [("diagram-burial-plan", burial_plan), ("diagram-spirit-house-plan", house_plan), ("diagram-semik-chain", semik_chain), ("diagram-commemoration-days", commemoration_days)]:
        for L in ("en", "ru"):
            save(name, L, fn(L))
    print("ok")
