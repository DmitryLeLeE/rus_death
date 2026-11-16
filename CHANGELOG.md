# Changelog

## Unreleased — Russian Chthonic Atlas

- Voices index (2026-11-16): `voices.html` and `ru/voices.html`, generated from `data/voices.json` and `data/songs.json`: title, genre, place, date, author or collector, complete or excerpt, and a link to the plate that carries each text. No verse is shown on the index. Linked from the footer navigation and the sitemap; the top navigation is unchanged.
- Illustration expansion and fact-check pass (2026-11-15). Plate F: five Estonian Old Believers' cemeteries (Estonian Heritage Board via Europeana, CC0, 400 px copies) as a present-day comparison from outside Russia; the golubets section rewritten to what its only source supports. Plate N: Nansen's 1913 photograph of old graves at Kureika. Plates G, H, D: three original editorial diagrams (structure of a lament, the forty days in two registers, the hot dinner as an account), EN and RU. Evidence status filled in for 13 images that lacked it.
- Four more Commons photographs, each record re-read through the API: Rogozhskoye Old Believers’ procession, 1907 (F; a thanksgiving procession, not a funeral); a peasant interior and an old banya (S, context only); QR tags on graves in Washington (X, a comparison from outside Russia). Other verified candidates are listed in `IMAGE_ACQUISITION_REPORT.md` with the reason each was not placed.
- Seventeen more Commons photographs (links to the Commons licence on every record): five Suistamo cemetery photographs (F), three more frames of the Plattonen funeral (G), five public funerals 1904–1918 with an editorial note (K), Nansen’s sledge with a body (N), a Pskov Caves grave plaque (R), a museum banya and an Old Believers’ museum interior (S). Photographs showing the dead (Tolstoy, Chapaev, Port Arthur, Nansen) are behind the 18+ gate.
- Chronology, lexicon, object catalogue and routes checked against independent sources: the 1723 burial decree and the order on tombstones are now stated as disputed between sources (Rozanov added), the Barsov volume dates and two lexicon glosses corrected. Details and the list of what was not checked are in `FACTCHECK_LOG.md`.
- `IMAGE_ACQUISITION_REPORT.md` (new): source-by-source record of the image search, including archives that were blocked and not bypassed. `build/make_visual_audit.py` regenerates `VISUAL_AUDIT.md`.
- README rewritten for the 24-plate, four-volume edition.

- Volume IV: plate W, *The Materials of Abandonment* (reported dated decisions on Siberian cemeteries, 2019 gravestone curbs in Moscow; the larger claims marked UNVERIFIED) and plate X, *The Digital Afterlife* (three sources read at abstract or news level, stated as such). Seven new sources and one CC0 photograph. All four volumes are now published.
- Plate V, *Taboo, Omen and Protection* (Vol. III): funeral prohibitions and protective acts as reported by an encyclopedia article, a review of village and urban rites, a 2018–19 Smolensk field study and a church polemic; the reasons for covering mirrors are listed as contested. Two new sources. Volume III (S–V) is now complete.
- Plate U, *The Calendar of the Dead* (Vol. III): a table of who named which commemoration day — the Church's own account, a Komi-Permyak comparison and a 2016–17 Kostroma/Vladimir field study — with the question of origin marked contested and left open. Three new sources.
- Plate T, *The Unquiet Dead* (Vol. III): impure dead of the Belarusian-Russian borderland, Zelenin's term set apart from informants' words, a church-history dissent marked contested (abstract only), the literary vampire kept out. Four new sources, one Makovsky painting.
- Plate S, *Household Spirits* (Vol. III): the domovoy read as an ancestor, set against two regional studies and a student survey, with the bannik and kikimora kept out of that story; marked contested. Two new sources, one lead-only portal source, one Kustodiev painting. Volume III now begun.
- Plate R, *The Underground* (Vol. II): the burial caves of the Pskov-Caves Monastery, the 2023 muon survey and the Izborsk tunnel legend, with four new sources and one photograph. Volume II no longer lists R as a research lead.
- New evidence level UNVERIFIED and a CONTESTED flag, shown on plates, in the ledger and in the method page.

- Two more images on Vol. II: Vasnetsov's *Knight at the Crossroads* (plate P, painted epic image, labelled as such) and a pre-1910 photograph of Mologa (plate Q). Both public domain via Wikimedia Commons.

- Search page over the whole atlas (client-side, prebuilt JSON index, EN/RU), a claim ledger generated from plate data (every section, evidence level, sources), and five reading routes.

- The site is now the *Russian Chthonic Atlas*. *Archæology of Russian Death* is Volume I (plates A–L).
- New volumes page (`volumes.html`, EN and RU): four volumes, published plates as cards, planned plates as research leads. Nothing planned is presented as content.
- Plate M, *The Empty House* (Volume II), EN and RU, with six new sources whose limitations are recorded in the bibliography (two have incomplete bibliographic records).
- Plate N, *The Forest Edge* (Volume II), EN and RU, with three sources; the Mordvin and Estonian–Belarusian provenance of its evidence is stated on the plate. New photograph: forest edge, Domodedovo (CC0).
- Plate O, *Water, Marsh and River* (Volume II), EN and RU, with two new sources (Lavrenova 2022; the online encyclopedia entry on Semik, whose page shows no author or year) and a Karelian bog photograph (CC BY-SA 4.0).
- Plates P (*Roads, Crossroads and Borders*) and Q (*The Vanished Village*), Volume II, EN and RU, with seven new sources. Two sources are marked on the plates as unverified or incomplete: the RAPSI news feature on cemeteries under the Rybinsk Reservoir, read only in a search excerpt, and the Tsipileva article, seen only in its opening. New photographs: a cross at a road turn (CC BY 3.0) and the market square of Mologa (public domain).
- Plate counts in page text are derived from the data, not typed in.
- Plate headers show volume and position within the volume.
- Social cards regenerated for all plates, including M.

## Earlier

- Russian edition, sound, print stylesheet, per-plate social cards, map, nine plate photographs, text audit, and replacement of hand-drawn schematics with Wikimedia Commons photographs (see `ASSET_CREDITS.md`).
