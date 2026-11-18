/* ARCHÆOLOGY OF RUSSIAN DEATH — interactions
   Plain vanilla JS. No dependencies. Progressive enhancement. */
(() => {
  "use strict";

  const RU = document.documentElement.lang === "ru";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------- dialogs ---- */
  const focusables = (root) => $$(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    root
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);

  function trapTab(e, dialog) {
    if (e.key !== "Tab") return;
    const f = focusables(dialog);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  let lastTrigger = null;

  const openDialog = (dialog, trigger) => {
    lastTrigger = trigger || document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.documentElement.classList.add("has-dialog");
    const first = focusables(dialog)[0];
    if (first) setTimeout(() => first.focus(), 20);
  };

  const closeDialog = (dialog) => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.documentElement.classList.remove("has-dialog");
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  };

  /* Listeners on window are removed before the page is wired again (pages change in place, see nav.js). */
  const offs = [];
  const win = (type, fn, opts) => { addEventListener(type, fn, opts); offs.push(() => removeEventListener(type, fn, opts)); };

  function init() {
    offs.splice(0).forEach((f) => f());
    document.documentElement.classList.remove("has-dialog");
    /* ------------------------------------------------------------ contents -- */
    const menu = $("#contents-dialog");
    if (menu) {
      $$("[data-menu-open]").forEach((btn) =>
        btn.addEventListener("click", () => openDialog(menu, btn))
      );
      $$("[data-menu-close]", menu).forEach((btn) =>
        btn.addEventListener("click", () => closeDialog(menu))
      );
      menu.addEventListener("click", (e) => {
        if (e.target === menu) closeDialog(menu);
      });
      menu.addEventListener("keydown", (e) => trapTab(e, menu));
    }

    /* ------------------------------------------------------------ 18+ gate -- */
    $$("[data-gate]").forEach((g) =>
      g.addEventListener("click", () => {
        const ph = g.closest("[data-mature]");
        if (ph) ph.classList.add("is-revealed");
      })
    );

    /* --------------------------------------------------------------- figure -- */
    const fv = $("#figureview");
    if (fv) {
      const img = $(".figureview__stage img", fv);
      const stage = $(".figureview__stage", fv);
      const title = $("#fv-title", fv);
      const cap = $("[data-cap]", fv);
      const credit = $("[data-credit]", fv);
      const zoomBtn = $("[data-zoom-toggle]", fv);

      $$("[data-examine]").forEach((btn) =>
        btn.addEventListener("click", () => {
          const b = btn.dataset;
          img.src = b.full || "";
          img.alt = b.title || (RU ? "Архивное изображение" : "Archive image");
          title.textContent = b.title || "IMAGE";
          cap.textContent = b.cap || "";
          credit.textContent = b.credit || "";
          stage.classList.remove("is-zoomed");
          zoomBtn.setAttribute("aria-pressed", "false");
          openDialog(fv, btn);
        })
      );

      $$("[data-close]", fv).forEach((btn) => btn.addEventListener("click", () => closeDialog(fv)));
      fv.addEventListener("click", (e) => {
        if (e.target === fv) closeDialog(fv);
      });
      fv.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeDialog(fv);
          return;
        }
        if (e.key === "Tab") trapTab(e, fv);
      });
      zoomBtn.addEventListener("click", () => {
        const on = stage.classList.toggle("is-zoomed");
        zoomBtn.setAttribute("aria-pressed", String(on));
        zoomBtn.textContent = on ? "FIT" : "ZOOM";
      });
    }

    /* ---------------------------------------------------------------- index -- */
    const catalog = $(".catalog");
    if (catalog) {
      const tabs = $$("[data-tab]", catalog);
      const panels = $$("[data-panel]", catalog);
      const status = $("#status");
      const empty = $("#empty");
      const search = $("#q");
      const chips = $$("[data-filter]", catalog);
      const reset = $("[data-reset]", catalog);
      let activeTab = "plate";
      let theme = null;

      const activePanel = () => $(`[data-panel="${activeTab}"]`, catalog);
      const cardsIn = (kind) => $$('[data-kind="' + kind + '"]', activePanel());

      function apply() {
        const term = (search && search.value ? search.value : "").trim().toLowerCase();
        let shown = 0;
        $$("[data-kind]", catalog).forEach((card) => {
          const inPanel = card.closest("[data-panel]") === activePanel();
          const text = card.dataset.search || "";
          const kind = card.dataset.kind;
          let ok = true;
          if (kind === "plate" && theme) ok = card.dataset.theme === theme;
          if (term) ok = ok && text.includes(term);
          const visible = inPanel && ok;
          card.hidden = !visible;
          if (visible) shown += 1;
        });
        if (status) {
          const label = activeTab === "plate" ? "PLATES" : activeTab === "object" ? "OBJECTS" : activeTab === "concept" ? "CONCEPTS" : "PLACES";
          status.textContent = shown + " " + label + (theme && activeTab === "plate" ? " · THEME: " + theme.toUpperCase() : "");
        }
        if (empty) empty.hidden = shown > 0;
      }

      function selectTab(kind, focus) {
        activeTab = kind;
        tabs.forEach((t) => {
          const on = t.dataset.tab === kind;
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          if (on && focus) t.focus();
        });
        panels.forEach((p) => (p.hidden = p.dataset.panel !== kind));
        apply();
      }

      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => selectTab(tab.dataset.tab));
        tab.addEventListener("keydown", (e) => {
          if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            let n = i;
            if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
            if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
            if (e.key === "Home") n = 0;
            if (e.key === "End") n = tabs.length - 1;
            selectTab(tabs[n].dataset.tab, true);
          }
        });
      });

      chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          const value = chip.dataset.filter;
          const on = chip.getAttribute("aria-pressed") === "true";
          chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
          if (on) {
            theme = null;
          } else {
            chip.setAttribute("aria-pressed", "true");
            theme = value.replace("theme:", "");
          }
          apply();
        });
      });
      if (reset) {
        reset.addEventListener("click", () => {
          chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
          theme = null;
          if (search) search.value = "";
          apply();
          const q = $("#q");
          if (q) q.focus();
        });
      }
      if (search) {
        let t;
        search.addEventListener("input", () => {
          clearTimeout(t);
          t = setTimeout(apply, 90);
        });
      }

      // deep links to object / concept / place entries
      const hash = location.hash;
      const target = hash ? document.querySelector(hash) : null;
      if (target && target.dataset && target.dataset.kind && target.dataset.kind !== "plate") {
        selectTab(target.dataset.kind);
        setTimeout(() => {
          target.scrollIntoView({ block: "center" });
          target.classList.add("is-flash");
          setTimeout(() => target.classList.remove("is-flash"), 1800);
        }, 60);
      } else {
        selectTab("plate");
      }
    }

    /* ------------------------------------------------------------------ map -- */
    const map = $(".map-plane");
    if (map) {
      const pins = $$(".pin", map);
      const cards = $$(".place");
      const select = (marker, scroll) => {
        pins.forEach((p) => {
          const on = p.dataset.place === marker;
          p.classList.toggle("is-active", on);
          p.setAttribute("aria-pressed", String(on));
        });
        cards.forEach((c) => c.classList.toggle("is-active", c.dataset.marker === marker));
        const card = document.getElementById("place-card-" + marker);
        if (card && scroll) {
          card.scrollIntoView({ block: "center", behavior: "smooth" });
          const h = card.querySelector(".place__name");
          if (h) {
            h.setAttribute("tabindex", "-1");
            h.focus({ preventScroll: true });
          }
        }
      };
      pins.forEach((pin, i) => {
        pin.setAttribute("aria-pressed", "false");
        pin.addEventListener("click", () => select(pin.dataset.place, true));
        // arrow keys walk from pin to pin
        pin.addEventListener("keydown", (e) => {
          const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          pins[(i + step + pins.length) % pins.length].focus();
        });
      });

      // region filtering
      const regionChips = $$("[data-region-filter]");
      if (regionChips.length) {
        regionChips.forEach((chip) => {
          chip.addEventListener("click", () => {
            regionChips.forEach((c) => c.setAttribute("aria-pressed", "false"));
            chip.setAttribute("aria-pressed", "true");
            const reg = chip.dataset.regionFilter;
            pins.forEach((p) => {
              const show = reg === "all" || p.dataset.region === reg;
              p.style.display = show ? "" : "none";
            });
            cards.forEach((c) => {
              const show = reg === "all" || c.dataset.region === reg;
              c.hidden = !show;
            });
          });
        });
      }
      // clicking a card lights its pin; #place-card-… in the address opens that place
      cards.forEach((c) => c.addEventListener("click", (e) => { if (!e.target.closest("a")) select(c.dataset.marker, false); }));
      const fromHash = () => {
        const m = /^#place-card-(.+)$/.exec(location.hash);
        if (m && pins.some((p) => p.dataset.place === m[1])) select(m[1], true);
      };
      fromHash();
      win("hashchange", fromHash);
    }

    /* ----------------------------------------------------------- chronology -- */
    const tl = $("#tl-list");
    if (tl) {
      const chips = $$("[data-era-filter]");
      const status = $("#tlstatus");
      const items = $$(".tl__item", tl);
      chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
          chip.setAttribute("aria-pressed", "true");
          const era = chip.dataset.eraFilter;
          let n = 0;
          items.forEach((it) => {
            const show = era === "all" || it.dataset.era === era;
            it.hidden = !show;
            if (show) n += 1;
          });
          if (status) status.textContent = RU ? n + " ЗАПИС" + (n % 10 === 1 && n % 100 !== 11 ? "Ь" : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "И" : "ЕЙ")) : n + " ENTRIES";
        });
      });
    }

    /* -------------------------------------------------------- copy citation -- */
    $$("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.dataset.copy;
        if (!text) return;
        const orig = btn.textContent;
        const notify = () => {
          btn.textContent = RU ? "СКОПИРОВАНО" : "COPIED";
          btn.classList.add("is-copied");
          setTimeout(() => {
            btn.textContent = orig;
            btn.classList.remove("is-copied");
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(notify).catch(() => {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            notify();
          });
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          notify();
        }
      });
    });

    /* ------------------------------------------------------------ marginalia -- */
    $$("[data-marginal]").forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        const note = document.getElementById(btn.getAttribute("aria-controls"));
        if (note) {
          note.hidden = open;
          if (!open) note.focus({ preventScroll: false });
        }
      });
    });

    /* ------------------------------------------------------- language, reading -- */
    const store = {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    };
    $$("[data-lang-pick]").forEach((a) => a.addEventListener("click", () => store.set("rd-lang", a.dataset.langPick)));

    // Russian-language visitors on the English page are offered the Russian edition once.
    const banner = $("[data-rubanner]");
    if (banner && !store.get("rd-lang")) {
      const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]).map((l) => String(l).toLowerCase());
      if (langs.some((l) => l.startsWith("ru"))) banner.hidden = false;
      $("[data-rubanner-close]", banner).addEventListener("click", () => { banner.hidden = true; store.set("rd-lang", "en"); });
    }

    const readBtn = $("[data-readable]");
    if (readBtn) {
      const root = document.documentElement;
      const paint = () => {
        const on = root.classList.contains("is-plain");
        readBtn.setAttribute("aria-pressed", String(on));
        readBtn.textContent = on ? readBtn.dataset.on : readBtn.dataset.off;
      };
      paint();
      readBtn.addEventListener("click", () => {
        root.classList.toggle("is-plain");
        store.set("rd-plain", root.classList.contains("is-plain") ? "1" : "0");
        paint();
      });
    }

    /* ----------------------------------------------------------- motion layer -- */
    const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const thread = $(".thread");
    if (thread && !still) {
      let tick = false;
      const upd = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        thread.style.setProperty("--read", h > 0 ? Math.min(1, scrollY / h).toFixed(4) : 0);
        tick = false;
      };
      win("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
      upd();
    } else if (thread) thread.hidden = true;

    if (!still && "IntersectionObserver" in window) {
      const targets = $$(".photo img, figure.photo, .pro__art img").filter((el) => el.tagName === "IMG");
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      targets.forEach((img) => {
        if (img.getBoundingClientRect().top < innerHeight) return; // already on screen: no flash
        img.classList.add("devel");
        io.observe(img);
      });
    }
    /* ------------------------------------------------------------ term popover -- */
    let activePopover = null;
    const closePopover = () => {
      if (activePopover) {
        activePopover.remove();
        activePopover = null;
      }
    };

    document.addEventListener("click", (e) => {
      const ref = e.target.closest(".term-ref");
      if (!ref) {
        closePopover();
        return;
      }
      e.stopPropagation();
      if (activePopover && activePopover.dataset.forTerm === ref.dataset.term) {
        closePopover();
        return;
      }
      closePopover();

      const title = ref.dataset.title || ref.textContent;
      const gloss = ref.dataset.gloss || "";
      const termId = ref.dataset.term;
      const isPlate = location.pathname.includes("/plates/");
      const href = (isPlate ? "../" : "") + "words.html#word-" + termId;

      const pop = document.createElement("div");
      pop.className = "term-popover";
      pop.dataset.forTerm = termId;
      pop.innerHTML = `
        <div class="term-popover__head">
          <span class="term-popover__title mono">${title}</span>
          <button type="button" class="term-popover__close" aria-label="Close">×</button>
        </div>
        <p class="term-popover__gloss">${gloss}</p>
        <a class="term-popover__link mono" href="${href}">${RU ? "В словарь терминов →" : "To full lexicon →"}</a>
      `;

      document.body.appendChild(pop);
      activePopover = pop;

      const rect = ref.getBoundingClientRect();
      const popRect = pop.getBoundingClientRect();
      let top = rect.bottom + window.scrollY + 6;
      let left = rect.left + window.scrollX - 10;

      if (left + popRect.width > window.innerWidth - 16) {
        left = window.innerWidth - popRect.width - 16;
      }
      if (left < 16) left = 16;
      if (rect.bottom + popRect.height > window.innerHeight) {
        top = rect.top + window.scrollY - popRect.height - 6;
      }

      pop.style.top = top + "px";
      pop.style.left = left + "px";

      pop.querySelector(".term-popover__close").addEventListener("click", (ev) => {
        ev.stopPropagation();
        closePopover();
      });
    });

    win("keydown", (e) => {
      if (e.key === "Escape") closePopover();
    });

    /* -------------------------------------------------------- metrics filter -- */
    const mChips = $$("[data-metric-filter]");
    if (mChips.length) {
      const mRows = $$("[data-metric-cat]");
      mChips.forEach((chip) => {
        chip.addEventListener("click", () => {
          mChips.forEach((c) => c.classList.remove("is-active"));
          chip.classList.add("is-active");
          const cat = chip.dataset.metricFilter;
          mRows.forEach((r) => {
            const show = cat === "all" || r.dataset.metricCat === cat;
            r.hidden = !show;
          });
        });
      });
    }

    /* -------------------------------------------------------- image hotspots -- */
    let activeHotspotCard = null;
    const closeHotspot = () => {
      if (activeHotspotCard) {
        activeHotspotCard.remove();
        activeHotspotCard = null;
        $$(".hotspot.is-active").forEach((h) => h.classList.remove("is-active"));
      }
    };

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-hotspot]");
      if (!btn) {
        if (activeHotspotCard && !e.target.closest(".hotspot-card")) {
          closeHotspot();
        }
        return;
      }
      e.stopPropagation();
      if (btn.classList.contains("is-active")) {
        closeHotspot();
        return;
      }
      closeHotspot();
      btn.classList.add("is-active");

      const card = document.createElement("div");
      card.className = "hotspot-card";
      card.innerHTML = `
        <div class="hotspot-card__head">
          <span class="hotspot-card__title">${btn.dataset.title || ""}</span>
          <button type="button" class="hotspot-card__close" aria-label="Close">×</button>
        </div>
        <p class="hotspot-card__text">${btn.dataset.text || ""}</p>
      `;

      btn.parentElement.appendChild(card);
      activeHotspotCard = card;

      const btnLeft = parseFloat(btn.style.left) || 50;
      let left = btn.offsetLeft + 20;
      let top = btn.offsetTop - 10;

      if (btnLeft > 60) {
        left = btn.offsetLeft - 290;
      }
      if (left < 10) left = 10;

      card.style.left = left + "px";
      card.style.top = top + "px";

      card.querySelector(".hotspot-card__close").addEventListener("click", (ev) => {
        ev.stopPropagation();
        closeHotspot();
      });
    });

    win("keydown", (e) => {
      if (e.key === "Escape") closeHotspot();
    });

    /* ---------------------------------------------------- expedition tracks -- */
    const expBtns = $$("[data-expedition-track]");
    if (expBtns.length) {
      expBtns.forEach((b) => {
        b.addEventListener("click", () => {
          const trackId = b.dataset.expeditionTrack;
          const track = document.getElementById(trackId);
          const wasActive = track && track.classList.contains("is-highlighted");
          $$(".route-track").forEach((t) => t.classList.remove("is-highlighted"));
          if (!wasActive && track) {
            track.classList.add("is-highlighted");
            const mapPlane = document.querySelector(".map-plane");
            if (mapPlane) {
              mapPlane.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        });
      });
    }

    /* ---------------------------------------------------- gramophone audio -- */
    const players = $$("[data-player]");
    if (players.length) {
      players.forEach((p) => {
        const audio = p.querySelector("audio");
        const playBtn = p.querySelector(".gp-play-btn");
        const playIcon = p.querySelector(".gp-icon-play");
        const pauseIcon = p.querySelector(".gp-icon-pause");
        const disc = p.querySelector(".gp-disc");
        const scrubber = p.querySelector(".gp-scrubber");
        const progBar = p.querySelector(".gp-progress-bar");
        const curTime = p.querySelector(".gp-current");
        const durTime = p.querySelector(".gp-duration");

        if (!audio || !playBtn) return;

        const formatTime = (sec) => {
          if (!sec || isNaN(sec)) return "0:00";
          const m = Math.floor(sec / 60);
          const s = Math.floor(sec % 60);
          return `${m}:${s < 10 ? "0" : ""}${s}`;
        };

        const updatePlayState = (playing) => {
          if (playIcon) playIcon.hidden = playing;
          if (pauseIcon) pauseIcon.hidden = !playing;
          if (disc) disc.classList.toggle("is-playing", playing);
          p.classList.toggle("is-playing", playing);
        };

        const togglePlay = () => {
          if (audio.paused) {
            $$("[data-player] audio").forEach((other) => {
              if (other !== audio && !other.paused) {
                other.pause();
              }
            });
            const p = audio.play();
            if (p && p.then) {
              p.then(() => {
                window.dispatchEvent(new CustomEvent("rd:audio-play"));
              }).catch((err) => {
                console.warn("Audio play prevented:", err);
              });
            }
          } else {
            audio.pause();
          }
        };

        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          togglePlay();
        });

        if (disc) {
          disc.style.cursor = "pointer";
          disc.setAttribute("role", "button");
          disc.setAttribute("aria-label", playBtn.getAttribute("aria-label") || "Play");
          disc.addEventListener("click", (e) => {
            e.stopPropagation();
            togglePlay();
          });
        }

        audio.addEventListener("error", (e) => {
          console.warn("Audio element error:", audio.error, audio.currentSrc);
        });

        audio.addEventListener("play", () => {
          updatePlayState(true);
        });

        audio.addEventListener("pause", () => {
          updatePlayState(false);
          const anyPlaying = Array.from($$("[data-player] audio")).some((a) => !a.paused);
          if (!anyPlaying) {
            window.dispatchEvent(new CustomEvent("rd:audio-pause"));
          }
        });

        audio.addEventListener("ended", () => {
          updatePlayState(false);
          if (scrubber) scrubber.value = 0;
          if (progBar) progBar.style.width = "0%";
          if (curTime) curTime.textContent = "0:00";
          const anyPlaying = Array.from($$("[data-player] audio")).some((a) => !a.paused);
          if (!anyPlaying) {
            window.dispatchEvent(new CustomEvent("rd:audio-pause"));
          }
        });

        audio.addEventListener("timeupdate", () => {
          if (!audio.duration) return;
          const pct = (audio.currentTime / audio.duration) * 100;
          if (progBar) progBar.style.width = `${pct}%`;
          if (scrubber && !scrubber.matches(":active")) scrubber.value = pct;
          if (curTime) curTime.textContent = formatTime(audio.currentTime);
        });

        audio.addEventListener("loadedmetadata", () => {
          if (durTime && audio.duration) {
            durTime.textContent = formatTime(audio.duration);
          }
        });

        if (scrubber) {
          scrubber.addEventListener("input", () => {
            if (audio.duration) {
              const target = (scrubber.value / 100) * audio.duration;
              audio.currentTime = target;
              if (progBar) progBar.style.width = `${scrubber.value}%`;
            }
          });
        }
      });
    }
  }

  window.RD = Object.assign(window.RD || {}, { init });
  init();
})();
