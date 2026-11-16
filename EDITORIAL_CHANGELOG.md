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
