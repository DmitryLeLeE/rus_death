# EDITORIAL CHANGELOG (stage 2)

2026-11-16, pass 1. Text changes made in the working tree; **nothing committed or pushed**.

## Plate G, EN and RU (`data/plates.json`, `data/ru/plates.json`)

- G/01 rewritten: from an abstract statement about formulas to Barsov’s actual arrangement of the volume (by kinship of the dead), his distinction of the professional lamenter, and the Vyrozero evidence on how laments are built and learned. Reason: the old text asserted a property of the genre without a page.
- G/02 retitled “Occasions, not a score”; the unchecked six-part schema withdrawn as a claim about Barsov. Reason: not read from the source.
- G/03 shortened to its first paragraph and flagged unverified; closing aphorism removed. Reason: unsupported and in the editorial voice the brief asks to remove.
- G/05 replaced the note “What is not quoted” with “Verse not printed here” giving page references for the public-domain 1872 scan. Reason: the old note was methodological commentary.
- G/06 the bibliographic-title quote replaced by one real quotation from Barsov’s introduction (p. II, Russian original, OCR), for which the translation is given in the English edition.
- G/07 Fedosova’s biography extended from Kuznetsova and Kovyrshina.
- `data/sources.json` and `data/ru/sources.json`: Barsov entry corrected; new entry `kuznetsova-kovyrshina2000`.

Verification: `node build/build.mjs`, `node build/validate.mjs` (errors 0, warnings 0), `check_links`, `check_credits` run after the edit. Rendering in a browser was not checked in this pass.

## Plate U, EN and RU (pass 1, second step)

- New section “Burying the rusalka at Bolshaya Vereika” inserted at position 7 (RU keys 7–11 shifted to 8–12): a single-village field record (Grinkova 1947, from the owner-supplied PDF), with the author’s Frazerian frame explicitly not adopted. Reason: plate U had no first-hand regional record from Russian-speaking villagers. New source `grinkova1947`.
- Validator: 157 sections, errors 0, warnings 0.

## Plates A and B, EN and RU (pass 1, third step)

- B/0 “Washing” rewritten as “Washing, and where the water goes”; B/2 as “Dress, and the ban on iron”; B/3 as “The coffin and what went into it”; B table rows for clothing and washing items corrected. Reason: replaced generic statements with Zelenin’s itemised practice and withdrew four unsupported ones (see FACTCHECK_LOG §9).
- A/0 first paragraph corrected on body position and the open window; A/4 heading and second item updated.
- New source `zelenin1927` (EN and RU).
- Validator: errors 0, warnings 0. Plate rendering in a browser not checked.

## Plates S and N (pass 1, fourth step)

- S: new section “Under the stove: Zelenin’s inventory of the domovoi” inserted at position 3 (RU keys shifted). N: new section “The leshii as one survey records him” inserted at position 5 (RU keys shifted). Reason: both plates lacked collector-level detail; Zelenin 1991 §§ 156–158 supplies it with named collectors and states which group each item is told of.
- Validator after both: errors 0, warnings 0. Rendering in a browser not checked.

## Plate T (pass 1, fifth step)

- Two sections inserted after “Three categories in one borderland” (positions 3 and 4; RU keys shifted): “What Zelenin wrote in 1927 about the anger of the earth” and “Ust-Tsilma: the informants’ own list”. New source `dronova2024`; `zelenin1927` limitation updated (§§ 132, 134, 156–158 read).
- Validator: 161 sections, errors 0, warnings 0. Browser rendering not checked.

## Plate G (pass 1, sixth step)

- New section at position 1, “A funeral day in laments, as Vologda performers describe it” (RU keys shifted), from Iugai (owner-supplied PDF). It replaces, with a sourced description, the withdrawn six-station “score”. New source `iugai-letter` (no URL: the PDF does not show journal or year; entry marked incomplete).
- Validator: 162 sections, errors 0, warnings 0.

## Plate E (pass 1, seventh step)

- New section at position 2, “Invited, fed and sent off: the dead on memorial days” (RU keys shifted), from Tolstaya 2024 (owner-supplied PDF). New source `tolstaya2024`. Belarusian, Serbian and Slovene items are labelled as comparisons.
- Left for the voice pass: E/3 “What the category was for” (“an unpaid debt with a voice”) and the empty quote slot E/5.

## Plate T (Sedakova 2020)
- New section at position 5, “Unbaptised and early dead children…”; RU keys shifted. New source `sedakova2020`. The text states that the material is mainly Bulgarian and that the three Russian items are second-hand.

## Plate I (Nikolaev 2012)
- New section at position 6, “‘Buried well’: a village formula and the funeral photograph”; RU keys shifted. New source `nikolaev2012` (journal title still missing). Marked as the author’s hypothesis. The family document he prints is not reproduced.

## Plate U (Dynin 1994)
- New section at position 8, “The rusalka: a southern name that reached the North late”; RU keys shifted. New source `dynin1994`. Late-origin thesis marked contested.

## Plate T (Tolstaya 2024, sections 5–8)
- New section at position 6, “Two kinds of dead, and the acts that kept the unclean ones out”; RU keys shifted. `dynin1994` added to the plate’s sources for the cross-reference. Polesie measures labelled as not Russian.

## Plate T (Maksimov 1903)
- New section at position 7, “What Maksimov wrote about suicides and the drowned”. New source `maksimov1903` (keyword-read only; page numbers from the online copy).

## Plate O (Zelenin § 159, Maksimov)
- New section at position 4, “The water’s owner and what he did with the drowned”; RU keys shifted. `zelenin1927` and `maksimov1903` added to the plate’s sources.

## Plate S (Tolstaya 2024)
- Paragraph added to S/5 “Not every spirit of the house is an ancestor” (EN+RU): Tolstaya on the ancestor origin of house-spirits and the Polesie domovik. `tolstaya2024` added to the plate’s sources.

## Plate M (Moroz 2019, found by browser search)
- New section at position 4, “A written prayer left in a house that is being abandoned, 2015–2017”; RU keys shifted. New source `moroz2019` (volume and pages missing).

## Plate Q (Yankovskaya 2021, found by browser search)
- New section at position 7 (after “The cemeteries under the water”), “Why the flooded villages were remembered late”; RU keys shifted. New source `yankovskaya2021` (abstract and conclusion only).

## Plate Q (Yakubov 2009)
- New section at position 8, “663 settlements, and a prayer at the water’s edge”; RU keys shifted. New source `yakubov2009` (popular magazine). The 663 vs about 700 difference is stated, not resolved. The 294-residents claim is not used.

## Plate I (Koroleva, Chetina, Kolegova 2015)
- New section at position 7, “Trinity Saturday at a mass grave: Yurla district, Perm region, 2013–2015”; RU keys shifted. New source `koroleva2015` (partly read). Informant lines are paraphrased, not reproduced.

## Plate M (Zhigaltsova 2018)
- New section at position 5, “A forest settlement seen by its older residents, 2018”; RU keys shifted. New source `zhigaltsova2018`. Quoted fragments are a few words from the survey answers.

## Plate M (Balabeikina et al. 2023)
- New section at position 6, “Fourteen settlements abolished in north-eastern Karelia, 1938–2005”; RU keys shifted. New source `balabeikina2023`.

## AI-voice pass, first sweep
- Pattern scan of EN and RU text (“The point is”, “This is not … but”, “simply”, “actually”, rhetorical triplets, “does not say”). Most hits are genuine source caveats and were kept. Four rhetorical flourishes rewritten in both languages: C/0 (“widespread, recorded, not the doctrine”), E/5 (“familiar costume”), H/2 (“no remote medieval image”), I/10 (“the point is not arithmetic”).
- Not yet done: a read-through of paragraph openings for sameness, and a check of the “What this plate does not say” sections for template repetition.
- Registers updated: source register (105), gaps by plate, summary.

## Plates V, D, P (Zelenin 1927 §§ 132, 136; Krinichnaya 1997)
- V: new section 3 “A 1927 survey: what was done in the house” (Zelenin § 132, pp. 345–349); six rows added to the register; two notes adjusted; kickers renumbered. Source `zelenin1927` added to V. The earlier idea that § 132 held a passage on mirrors was wrong: the passages read do not mention covering mirrors, and this is stated on the plate. RU keys shifted.
- D: section 0 (“The hot dinner”) rewritten from Zelenin § 136; the unsourced sentence that the meal is “accounting” (feeding those who washed, dug, carried) removed, since no source read supports it. Table rows kutia, bread, honey, vodka and a place for the dead corrected to what Zelenin says; new section 4 “Forty days, and the table for the way home” (Belarusian and Volhynian items labelled as comparison). Kickers renumbered.
- P: section 2 made specific from Krinichnaya’s text and the Primary Chronicle quotation she gives, with the note that the chronicle describes cremation, not burial; the step to crossroads burial is her reading. Limitation of the source updated.

## Plate C (Novaia Skrizhal’ read at source; Zelenin 1927; Samoilova)
- C/0 rewritten. The old text said the handbook ties the fortieth day to the Ascension and that the soul-visit explanations lie outside it. At source (ch. XXIII § 2) the handbook gives several reasons: Neophyte of Rhodes (Resurrection, nine angelic ranks, mourning of Moses), Simeon of Thessalonica (Ascension), its own (the forty of Scripture), and it sets aside a body-decay explanation. The Ascension reason is Simeon’s, not the handbook’s alone, and the fortieth day in Neophyte is Moses, not the Ascension.
- C table: columns changed to “handbook” and “villages”. Cells for the third, ninth and anniversary village readings had no source and now say so; the fortieth day and Radonitsa rows now cite Zelenin 1927 (§§ 132, 136; Zelenin gives Thursday for Radonitsa, the Church’s present rule is Tuesday).
- C/3: Zelenin § 154 added as an example of the survival reading; the Baiburin sentence is marked as not re-read in this edition.
- C/4 “Who does the work” replaced. The earlier text had no source for its claims (judging of laments by voice; Soviet-period contraction of the priest’s role and a post-1991 return) and they were removed. Now one Vologda case from Samoilova (source `samoilova-figures`). It was first written from two web-fetch summaries; the owner then supplied the PDF, and checking it showed that one summary had mistaken a fairy-tale passage (a mother’s gift of a doll in ‘Vasilisa the Beautiful’) for ritual feeding of the funeral figure. That sentence was removed, the ‘neighbour said make a figure’ quotation was assigned to the right recording (the friend, 1996; the neighbour, 2009), and the claim that the number of informants is not given was corrected (four are named for the three cases). The text now cites pp. 251–255 and 265–268, read closely.
- New C/7 “What the handbook says about wailing” (ch. XX § 15).
- C/5 note: “Julian calendar still used by part of the Russian Church” was wrong (the Church keeps it for the whole liturgical year); corrected.
- D/3 kutia: Skrizhal ch. XXIII § 3 added (wheat with honey; the readings of wheat and honey); D table notes adjusted. The remark that the grain reading is “obvious enough to have been made many times independently” was removed as unsupported.

## Plate F (Rozanov read through a fetch summary; Novodevichy)
- F/0: the 1723 decree is now stated as Rozanov gives it (burial at churches only for “notable persons”, the rest outside town) and the quoted phrase “except for notable persons” is no longer put in quotation marks as if it were in the sources read; Pravenc’s tomb/relief detail is kept with its source and was not re-read. “After Peter’s death churchyard burial resumed” replaced by Rozanov’s statement that the decree was not carried out and the old custom stayed. 1771: two Senate decrees from Rozanov (24 March, 1 November) set against the 24 December date in the Siberian article; not reconciled. “Plague killed tens of thousands” removed: the municipal note gives no figure.
- F/1 (“The cemetery as a municipal object”) replaced by “Out of the town, 1771–72” from Rozanov’s list of the new cemeteries. The old text (“walls, gates, a plan, a register, a fee”; class landscape of monastery, merchant, communal trench, unconsecrated ground) had no source, was attributed to Merridale (a twentieth-century book) and was removed.
- Novodevichy section: the claim that it became the place where the state buried its “writers, scientists, generals, cosmonauts” (cited to Merridale) was replaced by an encyclopedia excerpt (new source `novodevichy-encyclopedia`, SEARCH EXCERPT ONLY, work unidentified); cosmonauts are not in the excerpt and were dropped. “Each monument is a curriculum vitae in granite” removed. Heading changed to a plain one.

## Plate F, second pass (Rozanov scan supplied by the owner)
- The owner’s DjVu is Rozanov’s booklet itself (16 pp., an offprint from *Dushepoleznoe chtenie*, June 1868). It had no text layer; read by OCR (Tesseract, Russian). It confirms the 1722 tombstone decree, the 10 October 1723 decree (burial at churches only for ‘notable persons’, others in monasteries and parish churches outside town), that the decree was not carried out after Peter’s death on 27 January 1725, the Senate decrees of 24 March and 1 November 1771.
- Corrected from the fetch summary: “consecrated in 1772” for the Vagankovo church was not established; the register of 31 December 1772 lists the church, and consecration followed “soon”, undated. The list of new cemeteries has six entries (Kalitnikovskoe and Danilovskoe were missing), not four.
- Added from the full text: the 1 November 1771 decree’s wording (grazing land, small wooden churches, at the town’s expense, plague burial places not to be dug up); builders Bazhanov and Durnov; that the better-off were mostly buried in monasteries, that the clergy got no state money, and that only four monasteries (Spaso-Andronikov, Novospassky, Donskoy, Novodevichy) kept burying. This supports a limited form of the “class” statement removed earlier, from this source only.
- Source entry updated: year 1868, offprint details, FULL TEXT READ (OCR).

## Plate J (Death in art), second pass
- J/0 (Perov): the description did not match the painting, checked against the plate’s own image. Wrong: “the coffin is tied behind them”, “a dog runs alongside”, “the widow sits with her back to us”, “huge sky”, “grief behaves like weather”. Now: coffin on the sled, lashed with rope and partly covered with sacking; a woman in front with her back to us; a boy and a girl against the coffin; a dog standing on the road behind; low dark sky. Inventory number, size and provenance confirmed on the Tretyakov record. “Made by contemporaries and repeated by art historians” removed: one contemporary (Stasov, via Azbyka) is shown; the link to Nekrasov is the gallery’s reading, not shown to be Perov’s.
- J/2: “three verdicts” voice removed; the pairing is labelled the atlas’s own reading. Dates checked (1886, 1883 from memory only for Chekhov, 1915).
- J/3 (Malevich): “white cube” removed (no source gives the colour; MK calls it a cube in the form of a black square, Novaya Gazeta a wooden cube by Suetin with a black square on one side). “Nowhere else in this atlas…” removed. Added the later history with attribution (1937, 1941 oak, 1944 stump and brick base, 1950s field, 1988 replacement cube with red square per MK, house on the site per Radio Svoboda, radar claim marked as the article authors’ own). “The cube disappeared” kept only as MK’s statement; the sources do not say where it went.
- J/6: the plate said the Stedelijk log and Novaya Gazeta share a cross detail; they conflict. Stedelijk: designed by Rozhdestvensky and Suetin, cross left out. Novaya Gazeta: cross-shaped coffin requested and made. The plate now says so and leaves the cross open.
- J/4, J/5: the halftone caption no longer claims it is how the image reached viewers; the note no longer claims cropping.
- Source entries updated (tretyakov-perov, mk-malevich, smirnov2015, stedelijk-malevich); added azbyka-perov, svoboda-malevich-grave.
- Not touched: captions of the Anika and Mice lubok figures (plate number 219 and the “1900” Rovinsky edition not re-verified; the 1900 two-volume edition exists).

## Plate K (Soviet afterlife), second pass
- Source failure: the URL behind `mospravda-crematorium` (Moskovskaia pravda, “Ognennoe pogrebenie”) returns an unrelated 2025 article. The plate’s crematorium paragraph, the 1925/1927 table rows, timeline t1925/t1927 and the Moscow place entry all rested on it. All were re-sourced; the entry is kept and marked DEAD LINK.
- K/0 rewritten: “the Moscow Soviet decided in 1925” and “the state confiscated one” removed (neither verified; one page calls the building an unfinished church never consecrated). Now: 1925 design competition (Tehne, quoting a 1926 magazine), Osipov (hobbyist page), Topf and Sons (Pravoslavie.ru), dates that differ by a day (12 Jan per Sokolova, 11 Jan trial per hobbyist page; 6 Oct official per Memorial/Tehne, 7 Oct per hobbyist page). Added from Memorial’s Topos: cremation of the shot from 1934. The interpretive closing sentence removed.
- K/1 replaced: the unsourced “hall, portrait, orchestra, red coffin, medals on cushions, municipal apparatus” and “script and timetable” removed; now Sokolova (2013): the 1920s red funeral and its rarity, Moscow 1925–26 shares without a church service, Tambov figures, 1960s campaign. Read as a machine summary only.
- K/2 table: rows re-sourced and extended (1723 per Rozanov; 1771–72; 1925; 1927; from 1934; 1972; 1996). The unsourced 1991 row removed.
- K/3 “After 1991” replaced (it was an unsourced editorial sketch with an invented detail, the priest arriving after the orchestra) by a sourced Moscow 1996–2012 section (law 8-FZ; Moscow Times 21 June 2012).
- K/4: no longer says these things are “visible in contemporary Russia”.
- K/5 pull-quote: attribution “after Merridale and Etkind” removed (Etkind is not a source of the plate, Merridale was not read); replaced by Sokolova’s Moscow figure.
- K/7: Donskoy closure now cites a second page (places.moscow) that agrees only on “the 1970s”.
- Dek rewritten (“then the collective dissolved” removed).
- Also corrected outside K: timeline t1935 and its RU still said “white cube” (J fix not carried over); now matches plate J.
- Not checked: Piskaryovskoye 9 May 1960 and Tomb of the Unknown Soldier 8 May 1967 rows (sources not re-read); captions of the five photographs (Chekhov 1904, Tolstoy 1910, Chapaev 1918, Bulla 1917, Port Arthur 1905); Merridale, Tumarkin and Yurchak remain unread for this plate.

## Plate L (Unfinished archive), second pass
- Dek, marginal note, two photo captions and the pull-quote rewritten plainly (“lying about the record”, “monument to maintenance”, “second kind of cemetery record”, “the archive keeps losing pages” removed). The pull-quote is now a count taken from the plate’s own Moscow register.
- L/0: the unsourced general claim about roads, stones as paving and lost registers replaced by what the Mertsalova (2013) list actually gives.
- Register of losses: Malevich row aligned with plate J (site disputed, oak felled by one account, cube’s fate not stated); “abundant, undocumented” for grave portraits removed (no source); Vagankovo row now says the municipal note speaks of unnamed Muscovites and no list was found, not “not recoverable”.
- Moscow register checked against the AiF article (machine summary): Dorogomilovskoe now says reburial at Vostryakovskoe was offered and the rest demolished in 1948; Bratskoe corrected from “a park from 1932” to conserved until reorganised in 1932, Chapaev Park now. Other four rows match.
- Not verified: Vagankovo PDF could not be re-fetched (not on the session allowlist); etkind2013 unread.

## Plate M (Empty house), second pass — started
- Dek and marginal note rewritten in EN and RU (“less than the title suggests” removed; “villages where no one lives” corrected to “villages with no registered residents”, which is what the census counts). Rest of M not yet re-checked; moroz2019 and zhigaltsova2018 still lack journal, volume and pages.

## Plate M (Empty house), second pass — started
- Dek and marginal note rewritten in EN and RU (“less than the title suggests” removed; “villages where no one lives” corrected to “villages with no registered residents”, which is what the census counts). Rest of M not yet re-checked; moroz2019 and zhigaltsova2018 still lack journal, volume and pages.
- M: moroz2019 reference completed from the HSE repository copy (DOI 10.31168/2658-3356.2019.15, starts p. 247; volume/issue still not established). Its three cases, the matitsa detail and the “spread unknown” statement re-confirmed.
- M: zhigaltsova2018 not completed. A search found a Zhigaltsova article on the same settlement (Komsomolsky, Velsk district) in SENTENTIA 2020, no. 3, pp. 28–42, which may be a different paper; the 2018 Izvestiya Komi NTs reference on the plate was not re-verified.
- M (correction of the line above): zhigaltsova2018 re-checked on the page itself: Izvestiia Komi NTs UrO RAN, 2018, issue 1 (33), pp. 113–117 (the SENTENTIA 2020 paper is a different article). The plate mixed emotion categories: school 28.1%, abandoned houses 15.6% and hospital 12.5% are “pity”; the dump 21% is “shame”; the claim that abandoned houses led the shame list was not supported and was removed (EN and RU).

## User text package (TEXTUAL_ADDITIONS_RUS_DEATH), second pass
- Barsov 1872 passages added as paraphrase, EN and RU, each checked against the page image: A/0 (bench, coins, sweeping, window towel, Chimkinichi window exit), B/0 (washing), B/2 (grave clothes), D/4 (empty place, bed, table on the stove), E/2 (tests for the dead’s presence; the role-play of the favourite is the Mordvin rite of Penza province, p. 310–311, not Russian), F/4 (grave-houses, Cherepovets district), G/1 (order of laments at the table; Stoglav 1551 and the 1715 decree, quoted by Barsov at second hand), G/8 (performer register: Momokova, Perventseva, Fedorova), T/7 (unbaptised, suicides), V/0 (protective acts, forgiveness of sins, no commemoration in Kargopol parishes).
- F/4: the sentence “the only source for the form and the word is a popular article” narrowed: Barsov is separate evidence for a small house over a grave, not for the word.
- Build: new section type `text` (build/build.mjs), labels (build/ui.mjs), CSS (css/plates.css), search rows. The data files data/voices.json, data/ru/voices.json and data/songs.json are not in the repository; without them the text sections are dropped and the pages are unchanged. build/enable_texts.mjs replaces the “no verse printed” statements and rebuilds once the files are copied in. Tested only with placeholder lines in a temporary copy.
- Sources added: 7 bibliography entries for the poems, epitaph and sticheron, 4 for the songs (EN and RU). Their text was verified in the owner’s package, not re-read here.
- data/ru/songs.json: Russian context, notes and rights lines for the four songs (no verse).
- Not done: the 16 photographs (Commons not reachable in this session, licences unchecked); the Voices index tab (no new page furniture).

## Plate M (Empty house), second pass — completed
- Source checks on 2026-11-16 (web-fetch summaries, machine-read): Balabeikina et al. (14 settlements; Art. 13 criteria; Yuma 1989; Pulozero 52 inhabitants in 1905; Petrovsky Yam 1982; 70 km route) confirmed. Corrected: the plate said ‘front-line hospital’ and ‘Finnish raid’ and an ‘annual’ Memory Escort; the article says hospital no. 2212 of the Karelian Front, a Finnish sabotage group, and a procession held for several decades on dates near the anniversary. Added the second exception, Soroka (joined to Belomorsk). EN and RU.
- TASS (19,400 villages with no residents, 48% more), OSW (134,000 villages, 8,500 fewer in eight years; fall attributed to villages left empty and to merging of administrative units; no count of uninhabited villages) and RTE (13,000 to 19,400; 36,200 with under ten residents, quoted from the Rosstat head) match the plate. OSW’s cause of the fall added to the register row.
- Internal contradiction removed: the caution note said no source recorded practices in abandoned houses, and the register ‘Four bodies of evidence’ left out Moroz, Zhigaltsova and Balabeikina. Note now says Moroz’s three cases are the one record (spread unknown) and Zhigaltsova records feelings, not beliefs; the register has a new ‘Leaving a house’ row and the heading no longer counts ‘four’.
- Dek no longer says ‘four parts’ (the plate has additional leaving-a-house sections).
- Not re-read: Andryunina, Lewkijewskaja (abstracts only), Plotnikova (record incomplete).

## Plate N (Forest edge), second pass
- Silinskaya volost (Simbirsk): the ‘deaf forest ravine’ as the proper grave of a drunkard, and the statement that cemetery burial brings drought and crop failure, confirmed against a search excerpt of Zelenin 1916 on svitk.ru (machine search result, not the book page). Orkino (Mordvin report) not re-read; the page could not be fetched.
- Koiva et al. 2025 and Santos Marinas 2025 not re-read (doi.org blocked in this session); their claims remain as read earlier from the abstract and the passages named in the source entries.
- Contradiction removed: the caution note said no source used on the plate links the forest spirit with the dead, while the leshii section (Zelenin 1927, pp. 410, 415) reports exactly that opinion. The note now says so and that the plate does not decide it.
- Numbering and counts: two parts were both ‘PART III’; the leshii section is now PART V. Dek, marginal note and period no longer say ‘three kinds’ and now include the 1927 survey. Register heading no longer says ‘four’; row V added (Zelenin 1927) and `zelenin1927` added to its sources. EN and RU.
- Not checked: the Nansen photographs’ captions (Kureika 8 September 1913; Amur 12 August 1913), the Domodedovo photograph. Commons was not reachable.

## Plate O (Water, marsh and river), second pass
- Semik entry (bigenc.ru) re-checked: all five claims on the plate are stated (Thursday before Trinity; Vyatka drowned’s day and boisterous cemetery feasts; Smolensk water ban; wreaths and birches in water; skudelnitsy and the 1771 decree of Catherine II). Entry still unsigned and undated.
- Maksimov re-read in the owner’s HTML files: bruises and scratches as proof of the spirit’s grip confirmed; the cup with three candles was said to sink and stop over the drowned, not just ‘stop above’; text now says so (EN and RU). Page numbers still those of the online copy.
- Register ‘Water in three kinds of source’ left out Zelenin 1927, Maksimov, Barsov and Sadovnikov; now ‘Water, source by source’ with four new rows and sources added.
- Caution note said the swamp and water spirits are not treated as the drowned, while Zelenin 1927 (vodyanoi as drowned ‘pledged’ dead; drowned girls as rusalki) and Lavrenova (kikimora as a girl drowned in a swamp) report that link. Rewritten: the plate passes it on as the sources’ opinion and does not decide it. Added a note that the lament and the song are texts, not evidence of a rite. Maksimov’s keyword-only reading added to the limitations item.
- Kickers renumbered (O / 04 water spirit, O / 05 register). Dek, marginal note and period now cover the water-spirit passages and the two texts.
- Not re-read: Zelenin 1927 § 159 (the owner’s PDF is not staged in this session), Lavrenova, Zelenin 1916 citations (Dobrovolsky, Georgievsky, Veshchomov, Glushkov), the captions of the two Picturesque Russia engravings.

## Plate P (Roads and crossroads), second pass
- Krinichnaya 1997 re-read in the owner’s PDF: parting at the crossroads, the Primary Chronicle passage (Radimichi, Viatichi, Severians; bones in a small vessel on a pillar ‘on the ways’; the Viatichi still keep it in the Laurentian text), and the later burial of ‘pledged’ dead at crossroads (hanged, drowned, drunkards and other suicides, stillborn, miscarried and unbaptised) match the plate. The ashes/urn wording is hers; the plate follows the chronicle (bones).
- Matlin 2021 re-checked against the full-text PDF (press.psu.ru, machine summary): 362 km, counts 132/95/72, date ranges, visit years, two sign families, ten temporary signs lasting one to three years confirmed. Corrected: ‘photographed every sign … recorded its location and asked road workers and residents’ (the article says the signs were recorded in a continuous pass and photographed, coordinates were fixed for some, interviews were partial with road workers and residents, number not given); ‘most signs stand on slopes (Mordovia) / in the roadside strip (Tatarstan)’ (these are the largest categories, 47.9% and 30.8%, not majorities; Chuvashia woodland about 62%); the European/North American contrast now says what the author says (very rarely on the verge here); ‘does not publish coordinates sign by sign’ now ‘gives coordinates for some signs and no list’.
- Matlin 2022: 33% (A 151) and 50% (R 178) seen again in the article text; 19% (R 241) from the abstract.
- Title ‘Roads, Crossroads and Borders’ promised borders; no section deals with them. Title now ‘Roads and Crossroads’ (EN, RU), matching the navigation label. Dek no longer calls the count ‘firmer’.
- Not checked: captions of the Reshma cross photograph (Ivanovo Oblast, 2011) and the Vasnetsov painting (Commons not reachable); the 19% figure for R 241.

## Plate Q (Vanished village), second pass
- RAPSI feature (13 July 2026) now read in full (machine summary of the page; it could not be fetched earlier): headline ‘Russian Atlantis: the law of flooded cities’, no author named. It states the cemetery claim (design rules required moving cemeteries; only some churchyards were moved in the 1930s–40s; many Mologa-area cemeteries went under water) and the 100,000–130,000 range, but names no archive, decree, historian or document for either. Claims stay ‘unverified’; the description of how the page was read was corrected (‘could not be fetched … search excerpt’ replaced) and the marginal note no longer says ‘seen only in an excerpt’. Added the feature’s statement that earlier design rules required moving cemeteries before filling, and its start date for filling (13 April 1941).
- Period said ‘Flooding 1937–1947’. Yakubov (April 1941 to 1947) and RAPSI (13 April 1941) put the filling at 1941–1947; the decree is of 1936 (Tsipileva). Now ‘Resettlement decree 1936; reservoir filled 1941–1947’ (EN, RU).
- Filatova 2026 figures re-checked in the article text (over 300,000 ha, over 40 churches, three monasteries, about 700 villages, six towns incl. Mologa and Korcheva): match. (Other sources give other church counts, e.g. about 50 and 140 in press; not used.)
- Register: Yakubov (663 settlements, 130,000) added so that the plate’s own differing counts are visible; RAPSI status updated; kickers renumbered (Q/04, Q/05, Q/06). OSW and RTE removed from the plate’s sources (the plate cites only TASS for the census figure).
- Caution note: added that the song printed at the end is a convict song of return, not about flooding and not evidence of a practice. Research leads: the decrees RAPSI names are listed as unchecked.
- Not re-read: Tsipileva and Skorodumova (booksite.ru returned errors this session); Yankovskaya (abstract only, as before); captions of the Mologa, Kalyazin and Sentinel images (Commons unreachable).

## Plate R (Underground), second pass
- Azbyka.ru page re-read in full (machine summary): ‘monastery cemetery’ is said of the **far** caves; the plate (EN, RU) said the near caves. Corrected. Added from the same page: laypeople were later buried too (first recorded layman 1528; monks in the fifth and sixth of seven galleries). The 10,000 is stated for the whole burial complex.
- dp.ru (author Vadim Kuzmitsky, 18 July 2024) re-read: the Izborsk legend (about 20 km) and mass burials confirmed; it also quotes the head of a restoration firm (ASM): 486 keramidy found, the earliest from the 15th century. Added as a count of slabs, not of burials; new register row; marginal note updated.
- Rosatom feature (D. Anokhin, 19 October 2023) re-read: seven streets over 200 m, results and the 3 × 6 × 3 m cavity confirmed. Corrected: the newspaper names Natalya Polukhina without patronymic (N. G. is from the paper’s author list); nuclear emulsions are named in the preprint, not in the feature’s main text; the Izborsk account (about 15 km) is attributed to Metropolitan Tikhon, head of the monastery, not ‘the abbot’, and is presented as legends, not as ‘unverified folklore’ in those words.
- Preprint re-read (summary of the page): 13 detectors, 112 days, crypt about 2.5 × 2.5 m, corridor 1–3 m by up to 12 m, cavity about 2 m high, 3 × 6 m, altitude 77–79 m, no formal uncertainties, no count of burials: all match the plate.
- Not re-read: the journal version (doi.org blocked); captions of the photographs (Sigachyov, Macuser, Lobusov, the 1974 plaque) — Commons unreachable.

## Plate S (Household spirits), second pass
- Granova 2019 re-read in the open full text (press.psu.ru; machine summary). Corrected: the formula for taking the spirit to a new house is **not** from Severny Kommunar (the article cites it from other districts; in this village two-part names are only nominations); the empty table is a reason the spirit misbehaves, and informants say it should not be left empty so he has something to feast on; the harmful female cellar spirit is a pairing with the male house spirit that no other district in her archives shows, not simply ‘not recorded elsewhere’; Kuzka and the cartoon is her suggestion with another derivation offered; ‘dedushka’ may also just describe an old man.
- Ansimova and Golubkova 2016 re-read in the open full text (machine summaries). Corrected: the forty-day detail is one Novosibirsk informant, and food at commemorations for dead parents is one Pskov informant (the plate had both as general statements); the 2015 survey was of 317 urban respondents, and although the article calls students aged 17–25 the main part, its own breakdown gives 21% students and 53% with higher education, so ‘survey of students’ / ‘sample mostly students’ was removed (marginal note, caution note, source entry; EN and RU). The 1950s recollections concern kikimora mummers in parts of Western Siberia.
- Drannikova: confirmed (23 names; ancestor and first ancestor; unrepentant man; knock and groan; 1990–2012 expeditions). ‘May look like a dead grandfather’ is one example in the article, not a stated pattern; reworded.
- Denisevich: confirmed (master of the household, livestock, ancestor tie for the domovoy only); the dvorovoy is treated as not wholly separate from the domovoy, so ‘separate spirits’ was reworded.
- Tolstaya 2024 re-read in the owner’s PDF: house-spirits from revered ancestors of the family, and the Polesie domovik passage, confirmed (pp. 11–12). Source link replaced with the DOI printed in the PDF.
- RU kicker of S/03 read ‘S / 0x’ (placeholder); now ‘S / 03’. Kickers renumbered (S/04 Zelenin, S/05, S/06). Register: rows added for Zelenin 1927 and Tolstaya 2024 (and sources). Dek, marginal note and period now include them. Caution note: ‘mill’ removed (no mill spirit on the plate).
- Not re-read: Zelenin 1927 pp. 412–414 (the owner’s PDF is not staged in this session); the culture.ru page behind the research lead (fetch error); the Kustodiev caption; Krinichnaya 2004.
