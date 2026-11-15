/* ARCHÆOLOGY OF RUSSIAN DEATH — interactions
   Plain vanilla JS. No dependencies. Progressive enhancement. */
(() => {
  "use strict";

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
        img.alt = b.title || "Archive image";
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
    pins.forEach((pin) => {
      pin.setAttribute("aria-pressed", "false");
      pin.addEventListener("click", () => select(pin.dataset.place, true));
    });
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
        if (status) status.textContent = n + " ENTRIES";
      });
    });
  }

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
})();
