# -*- coding: utf-8 -*-
"""Original editorial diagrams (EN + RU). Every number or claim drawn here is taken from a plate's own sourced text.
Outputs assets/illustrations/<name>.svg and <name>-ru.svg. Run: python3 build/make_diagrams.py"""
import os
from xml.sax.saxutils import escape as esc
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "illustrations")
INK, RED, PAPER, GREY = "#111111", "#B00000", "#E8E2D4", "#6b665c"
MONO = "'Courier New', Courier, monospace"
SERIF = "Georgia, 'Times New Roman', serif"

def T(x, y, s, size=14, fill=INK, anchor="start", font=MONO, weight="normal", style="normal"):
    return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" font-style="{style}">{esc(s)}</text>'

def lines(x, y, arr, size=13, lh=17, **kw):
    return "".join(T(x, y + i * lh, a, size=size, **kw) for i, a in enumerate(arr))

def wrap(doc_w, doc_h, title, sub, body, foot):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {doc_w} {doc_h}" role="img">'
            f'<rect width="{doc_w}" height="{doc_h}" fill="{PAPER}"/>'
            f'<rect x="10" y="10" width="{doc_w-20}" height="{doc_h-20}" fill="none" stroke="{INK}" stroke-width="1.5"/>'
            + T(30, 44, title, 20, INK, font=SERIF, weight="bold")
            + T(30, 66, sub, 12, GREY)
            + body
            + f'<line x1="30" y1="{doc_h-44}" x2="{doc_w-30}" y2="{doc_h-44}" stroke="{INK}" stroke-width="0.8"/>'
            + T(30, doc_h - 24, foot, 11, RED, weight="bold")
            + '</svg>\n')

def save(name, lang, svg):
    p = os.path.join(OUT, name + ("-ru" if lang == "ru" else "") + ".svg")
    open(p, "w", encoding="utf-8").write(svg)

# ---------------------------------------------------------------- E: Zelenin timeline
def zelenin(L):
    S = {
      "en": dict(t="HOW THE CATEGORY WAS BUILT", s="Zelenin's 'pledged dead': 1909 to 1916, as stated in his own preface",
        ev=[("1909","Summer fieldwork among the","Besermyans, Vyatka province:","offering 'kuyas'kon' to people","dead young by unnatural death"),
            ("1911","Article in Zhivaya starina:","cult of the unnaturally dead","among Russians and Finns","(Russians and Finns added)"),
            ("1916","Book, Petrograd, A. V. Orlov,","328 pp.: the dead by unnatural","death and rusalki; the category","set out in book form")],
        a="NON-RUSSIAN RITE", b="RUSSIAN AND FINNISH REPORTS", c="NAMED CATEGORY",
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCES: ZELENIN PREFACE (2024 REISSUE), WIKISOURCE IMPRINT"),
      "ru": dict(t="КАК СОБИРАЛАСЬ КАТЕГОРИЯ", s="«Заложные» Зеленина: 1909–1916, по его собственному предисловию",
        ev=[("1909","Летняя полевая работа среди","бесермян Вятской губернии:","жертва «куяськон» умершим","рано неестественной смертью"),
            ("1911","Статья в «Живой старине»:","культ умерших неестественной","смертью у русских и финнов","(добавлены русские и финны)"),
            ("1916","Книга, Петроград, А. В. Орлов,","328 с.: умершие неестественной","смертью и русалки; категория","изложена книгой")],
        a="НЕРУССКИЙ ОБРЯД", b="РУССКИЕ И ФИННСКИЕ СООБЩЕНИЯ", c="ИМЕНОВАННАЯ КАТЕГОРИЯ",
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИКИ: ПРЕДИСЛОВИЕ ЗЕЛЕНИНА (ПЕРЕИЗДАНИЕ 2024), ВИКИТЕКА")}[L]
    b = f'<line x1="90" y1="170" x2="910" y2="170" stroke="{INK}" stroke-width="2"/>'
    xs = [190, 500, 810]
    heads = [S["a"], S["b"], S["c"]]
    for x, (yr, *ls), h in zip(xs, S["ev"], heads):
        b += f'<circle cx="{x}" cy="170" r="9" fill="{RED}"/>' + T(x, 140, yr, 26, RED, "middle", SERIF, "bold")
        b += T(x, 112, h, 11, GREY, "middle", weight="bold")
        b += lines(x, 212, ls, 13, 18, anchor="middle")
    b += f'<path d="M205 170 L485 170" stroke="{RED}" stroke-width="3" stroke-dasharray="2 7"/>'
    b += f'<path d="M515 170 L795 170" stroke="{RED}" stroke-width="3" stroke-dasharray="2 7"/>'
    note = {"en": ["INTERPRETATION: the plate reads this order as one reason for caution,", "not as proof that the category fails. Only the preface was read."],
            "ru": ["ИНТЕРПРЕТАЦИЯ: лист читает этот порядок как причину осторожности,", "а не как доказательство, что категория неверна. Читалось только предисловие."]}[L]
    b += lines(30, 340, note, 12, 17, fill=INK)
    return wrap(1000, 420, S["t"], S["s"], b, S["foot"])

# ---------------------------------------------------------------- U: counted from Easter
def calendar(L):
    S = {
      "en": dict(t="DAYS COUNTED FROM EASTER", s="Schematic axis. Day numbers as given on the plate: Radonitsa 9 (Church), Semik 45, Trinity Saturday 48",
        e="EASTER", d0="day 0", r="RADONITSA", rd="day 9 (Tuesday of Thomas week, Church)", rn="1913 reference: mostly the Monday, some places Tuesday",
        sm="SEMIK", sd="day 45 (Thursday, seventh week)", sn="a folk day; not in the Church calendar", tr="TRINITY SAT.", td="day 48 (Church)",
        key=["RED = day named in the sources", "The day numbers are this plate's arithmetic, not a statement in the sources.", "No date of any year is given: Easter moves."],
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCES: AZBYKA 2024, BOGOSLOV 1913, MALTSEV 2020, BRE (SEMIK)"),
      "ru": dict(t="ДНИ ОТ ПАСХИ", s="Схематическая ось. Номера дней, как на листе: Радоница 9 (Церковь), Семик 45, Троицкая суббота 48",
        e="ПАСХА", d0="день 0", r="РАДОНИЦА", rd="день 9 (вторник Фоминой недели, Церковь)", rn="справочник 1913: чаще понедельник, местами вторник",
        sm="СЕМИК", sd="день 45 (четверг седьмой недели)", sn="народный день; нет в церковном календаре", tr="ТРОИЦКАЯ СУББ.", td="день 48 (Церковь)",
        key=["КРАСНЫМ — дни, названные в источниках", "Номера дней — арифметика листа, а не утверждение источников.", "Дат какого-либо года нет: Пасха подвижна."],
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИКИ: АЗБУКА 2024, БОГОСЛОВ 1913, МАЛЬЦЕВ 2020, БРЭ (СЕМИК)")}[L]
    x0, x1, y = 70, 930, 230
    sc = (x1 - x0) / 50.0
    px = lambda d: x0 + d * sc
    b = f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{INK}" stroke-width="2"/>'
    for d in range(0, 51, 7):
        b += f'<line x1="{px(d)}" y1="{y-6}" x2="{px(d)}" y2="{y+6}" stroke="{INK}"/>'
        b += T(px(d), y + 24, str(d), 10, GREY, "middle")
    pts = [(0, S["e"], S["d0"], None, "up"), (9, S["r"], S["rd"], S["rn"], "up"), (45, S["sm"], S["sd"], S["sn"], "up"), (48, S["tr"], S["td"], None, "down")]
    for d, nm, dd, nn, side in pts:
        x = px(d)
        b += f'<circle cx="{x}" cy="{y}" r="8" fill="{RED}"/>'
        if side == "up":
            b += f'<line x1="{x}" y1="{y-9}" x2="{x}" y2="{y-60}" stroke="{RED}"/>'
            anchor = "start" if d < 40 else "end"
            tx = x + (6 if anchor == "start" else -6)
            b += T(tx, y - 98, nm, 15, RED, anchor, weight="bold") + T(tx, y - 80, dd, 11, INK, anchor)
            if nn: b += T(tx, y - 64, nn, 10.5, GREY, anchor)
        else:
            b += f'<line x1="{x}" y1="{y+9}" x2="{x}" y2="{y+58}" stroke="{RED}"/>'
            b += T(x + 6, y + 76, nm, 15, RED, "end", weight="bold") + T(x + 6, y + 94, dd, 11, INK, "end")
    b += lines(30, 372, S["key"], 12, 17)
    return wrap(1000, 460, S["t"], S["s"], b, S["foot"])

# ---------------------------------------------------------------- V: two aims, one boundary
def two_aims(L):
    S = {
      "en": dict(t="OPEN BOUNDARY, PROTECTIVE ACTS", s="After the BIGENC article on East Slavic funeral rites: the article gives no date or reason for each act; tick spacing is schematic",
        bar="BOUNDARY BETWEEN THE WORLDS STAYS OPEN", d="DEATH", bu="BURIAL", f="40TH DAY",
        pr="PROTECTIVE AND CLEANSING ACTS (listed, not placed in time)", pa=["washing the house after the coffin is carried out", "turning objects over", "covering mirrors", "washing hands on return from the cemetery"],
        pb="PROHIBITIONS (listed, not placed in time)", pc=["close relatives do not make the coffin", "no food is brought back from the cemetery"],
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCE: BIGENC FUNERAL ARTICLE (NO AUTHOR NAMED); GENERAL ACCOUNT, NOT A LOCAL RECORD"),
      "ru": dict(t="ОТКРЫТАЯ ГРАНИЦА, ЗАЩИТНЫЕ ДЕЙСТВИЯ", s="По статье БРЭ о восточнославянских похоронах: статья не даёт ни даты, ни причины для каждого действия; расстояния схематичны",
        bar="ГРАНИЦА МЕЖДУ МИРАМИ ОСТАЁТСЯ ОТКРЫТОЙ", d="СМЕРТЬ", bu="ПОГРЕБЕНИЕ", f="40-Й ДЕНЬ",
        pr="ЗАЩИТНЫЕ И ОЧИЩАЮЩИЕ ДЕЙСТВИЯ (перечень, без привязки ко времени)", pa=["мытьё дома после выноса гроба", "переворачивание предметов", "занавешивание зеркал", "мытьё рук по возвращении с кладбища"],
        pb="ЗАПРЕТЫ (перечень, без привязки ко времени)", pc=["близкие родственники не делают гроб", "с кладбища не приносят еду"],
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИК: СТАТЬЯ О ПОХОРОНАХ В БРЭ (АВТОР НЕ НАЗВАН); ОБЩИЙ ОБЗОР, НЕ МЕСТНАЯ ЗАПИСЬ")}[L]
    b = f'<rect x="90" y="108" width="820" height="26" fill="{RED}"/>' + T(660, 126, S["bar"], 13, PAPER, "middle", weight="bold")
    for x, k in [(90, "d"), (400, "bu"), (910, "f")]:
        b += f'<line x1="{x}" y1="100" x2="{x}" y2="150" stroke="{INK}" stroke-width="2"/>' + T(x, 168, S[k], 13, INK, "middle", weight="bold")
    b += T(30, 214, S["pr"], 13, RED, weight="bold") + lines(46, 238, ["- " + a for a in S["pa"]], 13, 19)
    b += T(30, 336, S["pb"], 13, RED, weight="bold") + lines(46, 360, ["- " + a for a in S["pc"]], 13, 19)
    return wrap(1000, 460, S["t"], S["s"], b, S["foot"])

# ---------------------------------------------------------------- X: procedure for a dead user's page
def digital(L):
    S = {
      "en": dict(t="A PAGE OF THE DEAD AS A PROCEDURE", s="As a news item reports VKontakte policy; the item's date is not shown in the excerpt read",
        st=["RELATIVES", "PHOTO", "VK DECIDES"], st2=["ask the platform", "of the death certificate", "per request"],
        o1="KEEP: the page stays; the words 'Страница умершего", o1b="человека' replace the last-visit time", o2="DELETE:", o2b="page removed",
        oth="Same item: Odnoklassniki adds a black ribbon or turns the photo black and white;", oth2="Facebook has a 'legacy contact' and a memorial label.",
        foot="EDITORIAL DIAGRAM  /  ORIGINAL  /  SOURCE: RTVI NEWS ITEM; PLATFORM HELP PAGES NOT READ; RULES MAY HAVE CHANGED"),
      "ru": dict(t="СТРАНИЦА УМЕРШЕГО КАК ПРОЦЕДУРА", s="Как политику «ВКонтакте» описывает новостная заметка; дата заметки в прочитанном отрывке не видна",
        st=["РОДСТВЕННИКИ", "ФОТО", "ВК РЕШАЕТ"], st2=["обращаются в сервис", "свидетельства о смерти", "по запросу"],
        o1="СОХРАНИТЬ: страница остаётся; вместо времени", o1b="визита — «Страница умершего человека»", o2="УДАЛИТЬ:", o2b="страница удаляется",
        oth="В той же заметке: «Одноклассники» ставят чёрную ленту или делают фото чёрно-белым;", oth2="у Facebook есть «контакт для наследия» и пометка памяти.",
        foot="РЕДАКЦИОННАЯ ДИАГРАММА  /  ОРИГИНАЛ  /  ИСТОЧНИК: ЗАМЕТКА RTVI; СПРАВКА ПЛАТФОРМ НЕ ЧИТАЛАСЬ; ПРАВИЛА МОГЛИ ИЗМЕНИТЬСЯ")}[L]
    b = ""
    xs = [60, 370, 680]
    for i, x in enumerate(xs):
        b += f'<rect x="{x}" y="110" width="260" height="74" fill="none" stroke="{INK}" stroke-width="2"/>'
        b += T(x + 130, 142, S["st"][i], 14, INK, "middle", weight="bold") + T(x + 130, 164, S["st2"][i], 11, GREY, "middle")
        if i < 2: b += f'<path d="M{x+262} 147 L{x+306} 147" stroke="{RED}" stroke-width="3"/><path d="M{x+298} 140 L{x+308} 147 L{x+298} 154" fill="none" stroke="{RED}" stroke-width="3"/>'
    b += f'<path d="M810 186 L810 220 L340 220 L340 238" fill="none" stroke="{RED}" stroke-width="2"/>'
    b += f'<path d="M790 220 L790 238" fill="none" stroke="{RED}" stroke-width="2"/>'
    b += f'<rect x="60" y="240" width="560" height="52" fill="none" stroke="{INK}"/>' + T(70, 263, S["o1"], 12, INK) + T(70, 281, S["o1b"], 12, INK)
    b += f'<rect x="640" y="240" width="300" height="52" fill="none" stroke="{INK}"/>' + T(650, 263, S["o2"], 12, INK, weight="bold") + T(650, 281, S["o2b"], 12, INK)
    b += T(30, 332, S["oth"], 11.5, GREY) + T(30, 350, S["oth2"], 11.5, GREY)
    return wrap(1000, 410, S["t"], S["s"], b, S["foot"])

if __name__ == "__main__":
    for name, fn in [("diagram-zelenin-timeline", zelenin), ("diagram-calendar-from-easter", calendar),
                     ("diagram-two-aims", two_aims), ("diagram-dead-page-procedure", digital)]:
        for L in ("en", "ru"):
            save(name, L, fn(L))
    print("ok")
