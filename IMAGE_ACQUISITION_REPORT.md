# Image acquisition report — plates V, X, N, O, S, T

Written 2026-11-15. This is a log of what was tried and what came of it. No archive is called exhausted here: where an access method failed, the entry says which method failed and what is still open.

Rule used throughout: an image counts as acquired only when its record, caption page and licence were read and the file is in the repository with an entry in `data/images.json`. A thumbnail in a search result was never treated as permission.

## 1. Source by source

| Source | How it was approached | Result | Still open |
|---|---|---|---|
| Internet Archive (archive.org) | Search API (`advancedsearch.php`), per-item metadata, full-text search inside items (`fulltext/inside.php`), page images from the viewer, all through the built-in browser. | Works. Found *Picturesque Russia* (Живописная Россия, ed. Semenov-Tyan-Shansky, 1881–1901) with the Public Domain Mark on at least vol. 3. **Two engravings acquired** (plate O). Captions searched in vols. 1 (parts 1–2), 2 (part 1), 6, 7, 8 for izba, bath, barn, cemetery, grave, chapel, coffin: no engraving suited to S, T, N or V was identified. Rovinsky, *Russian Folk Pictures* (1900, vols. 1–2) searched for death, sorcerer, bath, water spirit terms: only prints already used or not on topic. | Vols. 4, 5, 9–12 of *Picturesque Russia* not searched. Page-level search was by caption words in pre-1918 spelling, so a missed spelling means a missed picture. Texts by Minkh (Saratov province, 1890), Gavrilov (Votyak rites, 1880), Maksimov *Unclean Power* (1899) not checked for illustrations. |
| Wikimedia Commons | Earlier rounds, through the Commons API and category pages. | Source of most existing photographs and paintings. | Nansen 1913 corpse-transport photo awaits a placement decision (18+ gate). |
| Library of Congress | Official JSON API via WebFetch: refused (`robots_disallowed`). Same API in the built-in browser: Cloudflare challenge, HTTP 403. | **Inaccessible by both methods.** The challenge was not bypassed. | A request to the library; or a public bulk file or permitted endpoint if LoC publishes one. Nothing from LoC has been seen, so nothing can be said about its holdings. |
| Finna | Official search API via WebFetch: `client_error`. In the built-in browser: Cloudflare challenge, HTTP 403. | **Inaccessible by both methods.** Not bypassed. | Contact the service; try again later; Finnish-language records of Karelian and Ingrian material would be the target. |
| Europeana | Official record API with the public demo key, through the built-in browser. 12 themed queries (cemetery, izba, bath, funeral, Old Believers, marsh and others, restricted to open rights and images). | Works. Most queries returned nothing relevant. One lead: **five CC0 photographs of Old Believers' cemeteries in Estonia** (Varnja, Piiri, Kükita, Tartu, Saare; Estonian National Heritage Board record, no photographer or date in the record). The files sit on `register.muinas.ee`, which answers with a Cloudflare challenge; only Europeana's own small preview is reachable. **Not acquired.** A CC0 Estonian National Museum item of 1935 ("white izba", Volkovo) was seen in results and not opened. | Ask the Heritage Board for the originals; read the Estonian National Museum record; a production API key instead of the demo key. |
| Russian Museum of Ethnography (collection.ethnomuseum.ru) | Site opened in the built-in browser; terms read on the home page. | Accessible. Terms: reprinting only by agreement with the museum; no reproduction in any form without prior written permission. **Permission required.** No object was searched. | Object-level search for S, V, T and a written request listing the objects. |
| Kunstkamera (collection.kunstkamera.ru) | Site and terms page opened. | Accessible. Terms identical in substance to the above: written permission needed. **Permission required.** Sections "Ethnography of Europe" and "Ethnographic drawing" exist; not searched. | As above. |
| National Library of Russia, manuscripts (nlr.ru/manuscripts) | Home page opened. | Accessible; it is an ordering page, not an image catalogue. No digital object was searched. | Digital library search; orders through the reading room. |
| Russian State Library (rsl.ru) | Home page opened. | Accessible; no catalogue search made. | Digital collections search. |

## 2. Per plate

### V — Taboo and protection
- Existing usable: one original diagram (open boundary and protective acts).
- Newly discovered: none.
- Acquired: none this round.
- Permission needed: possible objects at the two Russian museums (mirror, towel, washing vessels), not yet identified.
- Inaccessible: LoC, Finna.
- Original illustrations made: none this round (the existing diagram is the only one).
- Remaining gap: no archival image of a mirror covered, funeral washing or household cleansing. Candidates for a drawing: a comparative plate of the protective acts, only if the plate's sources give enough object detail.

### X — Digital afterlife
- Existing usable: one original diagram (procedure of the "dead page").
- Newly discovered / acquired: none; historical photographs are not wanted for this plate.
- Remaining gap: no screenshot or documented interface of a memorial service. Screenshots would need the service's terms read first, and a live site's page is not archival evidence of anything but itself.

### N — Forest edge
- Existing usable: one photograph (forest edge, Domodedovo).
- Newly discovered: none; the *Picturesque Russia* volume read is about the Lithuanian and Belarusian Polesye and its forest engravings were not matched to a documented burial or boundary.
- Acquired: none.
- Remaining gap: a forest-boundary or forest-burial image with a source. Estonian Old Believers' cemeteries (Europeana) are a lead, but they are not Russian-forest evidence either and are not acquired.

### O — Water, marsh and river
- Existing usable: one photograph (bog, Karelia), one original diagram (Semik reports and how they are read).
- Acquired: **2 engravings**, *Picturesque Russia* vol. 3 (1882), Internet Archive, Public Domain Mark:
  - "Деревня близь Припети" (p. 345), village on a creek in the Pinsk Polesye; artist per the volume's list of illustrations (OCR) Dmokhovsky, not checked on the block.
  - "Осушенные болота" (p. 353), drainage works; no artist named in the part of the list read.
  Both are landscapes, not ritual images; the captions say so. The Polesye is today in Belarus.
- Remaining gap: no river crossing, no drowning-related record or ritual object with a source. The same volume's engraving "Половодье" (flood), credited in the OCR of the list to a name that reads as Chistyakov, was seen in the list and not located on a page.

### S — Household spirits
- Existing usable: one painting reproduction (Kustodiev), one original diagram (farmstead and link to the dead).
- Newly discovered: none acceptable. Captions "Черемисская изба" (vol. 8) and "Внутренность промысловой хижины" (vol. 1) were seen; the first is a Mari house, the second a hunters' hut in the far north, so neither fits.
- Permission needed: stove, bath and barn objects at the two Russian museums, not yet identified.
- Remaining gap: a documented Russian izba interior with stove, red corner and bath or barn drawings with a named source.

### T — The unquiet dead
- Existing usable: one painting reproduction (Makovsky), one original diagram (who lay where).
- Newly discovered: five CC0 records of Old Believers' cemeteries in Estonia (see Europeana); not acquired.
- Remaining gap: a cemetery boundary, crossroads or ditch burial with a source. None found.

## 3. Original illustrations (all labelled as original editorial diagrams, not evidence)
- T: "Who lay where" (EN, RU), S: "Where the spirit lives" (EN, RU), O: "Semik and the drowned" (EN, RU). Built only from each plate's sourced text; each says what its frames mean.
- Earlier: open boundary and protective acts (V), procedure of the "dead page" (X).

## 4. Next steps in order of expected yield
1. *Picturesque Russia* vols. 4, 5, 9–12 and the unread part of vol. 3: caption search with more spellings, then page check.
2. Estonian Heritage Board and Estonian National Museum: ask for the originals of the five Old Believers' cemetery photographs and read the "white izba" record.
3. Written permission request to the Museum of Ethnography and Kunstkamera, after object-level search so the request names objects.
4. LoC and Finna: retry later, or write to the institutions.
5. NLR and RSL digital collections: search for ethnographic albums of the 1890s–1910s.

## Update 2026-11-15 (later pass): open-source sweep

**Acquired**
- Plate N: Nansen, Old native graves in the forest of Kureika, 8 Sept 1913 (Commons, PD). Caption keeps Nansen's reading apart from the evidence.
- Plate F: five Old Believers' cemeteries in Estonia (Estonian National Heritage Board register nos. 4264, 8410, 5862, 4327, 8411), rights CC0 1.0 in the Europeana records. Shown as present-day comparison outside Russia, level DOCUMENTED (the cemeteries exist; photographer and date are not given). **These are Europeana's cached 400 px copies**: the 800–900 px source files on register.muinas.ee sit behind a Cloudflare bot check and were not fetched or bypassed.

**Checked and not acquired**
- Picturesque Russia vol. 3 "Night in the Pripyat valley": landscape only, adds nothing to the funerary theme; not taken. "Pinsk marsh" is the engraving already used (another copy of the book, different leaf numbering).
- Picturesque Russia vol. 5 (Little Russia) and vol. 10 (Central Asia): out of geographic scope by volume title; the captions "Shchekovitsa and cemetery" and "Tombs of the demons" were not opened. Vol. 12 "Siberian graves": no text says whose graves; not taken. Vols 4, 9, 11 were searched by caption only.
- Finna: api.finna.fi is behind the same bot check (HTTP 403); not bypassed. Queries are documented in the Finna API wiki (online images, usage_rights filter) and can be run by a person in an ordinary browser.
- NLR manuscripts catalogue (nlr.ru/manuscripts/RA1527): reachable; search form only, no API found. Site terms allow personal non-commercial use only, so no scans taken. Query "синодик" with "digital copy" ticked: 23 records, first 10 read (F.I.256, F.I.323, F.I.488, F.I.725, F.I.734, F.I.879, F.IV.561, Q.I.407, Q.I.1152, Вяз. F. 58); the other 13 were not read.
- Europeana sweep (open reuse, images): "Russian funeral", "Siberia grave", "banya Russia", "Samoyed/Ostyak grave", "Pomor cross", "Karelia cemetery" returned nothing usable for the plates; "кладбище" returned 6164 mostly Jewish and Baltic cemeteries, not Russian rites.

### Update 2026-11-15 (plates G/H/D pass, part 1)
- Plate H: added original diagram "The forty days, in two registers" (EN + RU). It is an ORIGINAL ILLUSTRATION, not an archival image; it only restates claims already sourced in plate H (Novaia Skrizhal’ 1803, Ivanits 1989, the azbyka article on the toll-houses). Toll-houses are deliberately not placed on the day line.
- Evidence status was filled in for 13 images that had none (check_credits no longer reports "no evidence status").
- Plates G and D: added two original diagrams (EN + RU): "The movement of a lament" (G; labelled RECONSTRUCTION, structure only, no lament text) and "The hot dinner as an account" (D; DOCUMENTED, restates the plate’s own text and confidence column). No new open-source photographs were found for G or D in this pass.

### Update 2026-11-15 (user's list of finds; every Commons record re-read through the Commons API)
**Placed (4):**
- Plate F: cross procession from the Rogozhskoye Old Believers’ cemetery, 1907 (PD-Russia-expired as set on Commons; author unknown, from PastVu). The printed caption on the magazine page describes a thanksgiving service of 17 June in memory of deliverance from the 1904 hurricane, so it is labelled a procession, not a funeral. The caption was read from the digitised file, not the magazine.
- Plate S: peasant-house interior, Veliky Novgorod, 2019 (CC BY-SA 4.0); old banya in Kobona, 2026 (CC BY-SA 4.0). Context only, no belief claimed for either.
- Plate X: QR tags at the Thornton graves, Congressional Cemetery, Washington (CC0), labelled as a comparison from outside Russia. The list gave the title “QR Code on a Cenotaph”; the file used is `QR CC both Thorntons.JPG`, picked because its size matches the list and the tags are visible.

**Already in the atlas, not re-added:** Plattonen funeral (G), Nansen at Kureika (N), the 1880 laid-out corpse (B, behind the 18+ gate).

**Verified on Commons, downloaded and looked at, not placed** (no plate has a sourced place for them yet):
- Chekhov’s funeral, Nikolaevsky station, 1904 (PD-RusEmpire); Tolstoy’s coffin carried out at Astapovo, 1910 (PD-Russia-1996, author unknown, State Historical Museum); Chapaev at his brother’s funeral, Balakovo, 1918 (PD-old-70, I. P. Zefirov); Karl Bulla, funeral of revolution victims on the Field of Mars, 1917 (CC BY 4.0, Finnish Heritage Agency; the file page carries a licence-review template, so check its status before use); banya at Mandrogy (CC BY-SA 4.0, an open-air museum); Old Believers’ house interior, Ulan-Ude (CC BY 2.0, a museum).
- The Chapaev and Tolstoy pictures show a body in an open coffin, so each would need the 18+ gate. Plate I states that it uses no photographs of corpses, which rules out the Port Arthur stereograph (dead laid on the ground; PD via the Library of Congress copy on Commons) there; it would also need the gate elsewhere.
- Nansen, “Mode of transporting a corpse through the taiga in the Amur country” (P452a, PD-old-70-1923): a body on a sledge; the list called its licence unconfirmed, but Commons sets PD-old-70-1923. Not placed: no plate discusses transport of the dead, and it would need the gate.
- Rejected: Pskovo-Pechersky ledger. Commons gives the source as a 1974 book and applies PD-Art to a photograph of a three-dimensional ceramic tile, which is not clearly a flat reproduction; left out until the photographer and the basis are known.
- Not obtained: Suistamo photographs, corpse boards (Finna, blocked by Cloudflare; not bypassed), and the Fedurino grave (no source given). Open next step: the same files may exist on Commons via the Finnish Heritage Agency; not searched yet.
