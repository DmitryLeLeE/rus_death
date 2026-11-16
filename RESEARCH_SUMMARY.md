# RESEARCH SUMMARY — stage 2 (status 2026-11-16)

## What was done

- Source audit of all 24 plates; the register now holds 128 entries (90 at the start of stage 2), each with a reading status and limits (`RESEARCH_SOURCE_REGISTER.md`, `data/sources.json`, RU overlay `data/ru/sources.json`).
- First round (commits f0cf808, 6de0ad3): sourced EN+RU sections on plates C, D, E, F, G, H, I, J, K, L, M, plus the user's text package (Barsov passages, public-domain texts, songs).
- Second round, plate by plate, text only (commits c544be3 to ef6184c): plates M to X were re-read against their sources, corrected in EN and RU, logged in `EDITORIAL_CHANGELOG.md` and `FACTCHECK_LOG.md`, rebuilt, validated (0 errors, 0 warnings) and pushed to `main` and `gh-pages`.
- Typical corrections of the second round: figures and counts that a source did not give (informants, respondents), single informants generalised to a region, one scholar’s interpretation presented as a record, a day number computed wrongly (plate U, Semik day 46, not 45), source details filled in (journal, year, author), kickers and registers renumbered.
- Plate G: the Iugai source entry now has journal, volume and year (The Ritual Year 11, 2016); the contents-page numbers of Barsov vol. 1 re-read in the Internet Archive text; the Fedosova birth-year note (1827 or 1831) confirmed as a real disagreement between reference works.

## What was read

Owner-supplied PDFs and HTML (Zelenin 1927, Tolstaya 2024, Sedakova 2020, Nikolaev 2012, Dynin 1994, Maksimov 1903, Dronova 2024, Grinkova 1947, Iugai, Krinichnaya, Barsov page images) and open articles and pages read through fetch tools (machine summaries, so each entry says so). Some sources remain abstract-only (Avdeev 2019, Townsend 2011, Linden beyond the title pages, Sergeeva et al. beyond the abstract, Chesnokova); statuses are in the register.

## What was not done

- Plates A, B, D, F and H to L were revised in the first round only; they have not had the claim-by-claim second pass that M to X had.
- Zelenin 1927 §§ 132, 134 and 156–159 and Barsov page images could not be re-read in the later sessions (the owner’s files were not staged); claims resting on them were left unchanged.
- No file in `research/downloads/` (the shell has no general network access).
- No verse or prayer text is reproduced by the research text; informant lines are paraphrased. Variant texts of songs and laments have not been collated.
- Photographs verified on Commons but not placed are listed in `IMAGE_ACQUISITION_REPORT.md`; Finna originals were blocked and not bypassed.
- Visual check of the rendered pages (line breaks of the voice text on plate G, RU labels) is still to be done by eye.

## Next

1. Second pass for plates A to L in the same way as M to X.
2. Stage Zelenin 1927 and the Barsov images again and re-check the claims that rest on them.
3. A Voices index page built from `data/voices.json` (metadata and links only).
4. Look at the live pages, plate G first.
