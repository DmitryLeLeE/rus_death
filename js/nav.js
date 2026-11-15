/* ARCHÆOLOGY OF RUSSIAN DEATH — pages change in place.
   A click on a link inside the atlas fetches the next page and swaps it in, so the sound
   keeps running between pages (a full reload would stop it until the next touch).
   Anything unusual falls back to an ordinary page load: other language, search page,
   new style sheets, modified clicks, non-page files, any failed request. */
(() => {
  "use strict";
  if (!window.fetch || !history.pushState || !window.DOMParser || !window.RD || !window.RD.init) return;

  const root = document.documentElement;
  const cache = new Map();
  const NOT_PAGES = /\.(pdf|json|xml|txt|jpe?g|png|webp|gif|svg|zip|css|js|woff2?|ico|md)$/i;
  const inRu = (p) => /\/ru\//.test(p);
  const sheets = (doc) => Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map((l) => new URL(l.getAttribute("href"), doc.baseURI).pathname).sort().join("|");
  const hard = (url) => { location.href = url; };
  let busy = false;
  let here = location.pathname + location.search;

  history.scrollRestoration = "manual";
  history.replaceState({ y: scrollY }, "", location.href);

  function eligible(a, e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== "_self") return false;
    if (a.hasAttribute("download") || a.hasAttribute("data-lang-pick")) return false;
    if (a.origin !== location.origin || NOT_PAGES.test(a.pathname)) return false;
    if (inRu(a.pathname) !== inRu(location.pathname)) return false;
    if (/\/search\.html$/.test(a.pathname)) return false;
    if (a.pathname === location.pathname && a.search === location.search) return false; // same page: anchors, default behaviour
    return true;
  }

  async function fetchPage(url) {
    if (cache.has(url)) return cache.get(url);
    const r = await fetch(url, { credentials: "same-origin" });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !/text\/html/.test(type)) throw new Error("not a page");
    const doc = new DOMParser().parseFromString(await r.text(), "text/html");
    if (!doc.body || !doc.body.dataset.page) throw new Error("not an atlas page");
    if (doc.querySelector('script[src*="search.js"]')) throw new Error("needs its own script");
    if (sheets(doc) !== sheets(document)) throw new Error("different style sheets");
    cache.set(url, doc);
    return doc;
  }

  const HEAD_SYNC = 'meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], link[rel="alternate"], link[rel~="icon"], link[rel="apple-touch-icon"], script[type="application/ld+json"]';

  function swap(doc, url) {
    const head = document.head;
    head.querySelectorAll(HEAD_SYNC).forEach((n) => n.remove());
    doc.head.querySelectorAll(HEAD_SYNC).forEach((n) => head.appendChild(document.importNode(n, true)));
    document.title = doc.title;

    const keep = (n) => n.matches("script, [data-sound], .sound-note");
    const anchor = document.querySelector("[data-sound]");
    Array.from(document.body.children).filter((n) => !keep(n)).forEach((n) => n.remove());
    Array.from(doc.body.children).filter((n) => !n.matches("script, [data-sound]")).forEach((n) => {
      document.body.insertBefore(document.importNode(n, true), anchor);
    });
    document.body.className = doc.body.className;
    document.body.dataset.page = doc.body.dataset.page;
    root.classList.remove("has-dialog");

    const hash = new URL(url, location.href).hash;
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    window.RD.init();
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
    const main = document.getElementById("main");
    if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
    document.dispatchEvent(new CustomEvent("rd:navigate", { detail: { page: doc.body.dataset.page, url } }));
  }

  async function go(url, { push = true, y = 0 } = {}) {
    if (busy) return hard(url);
    busy = true;
    try {
      const doc = await fetchPage(url.split("#")[0]);
      if (push) {
        history.replaceState({ y: scrollY }, "", location.href);
        history.pushState({ y: 0 }, "", url);
      }
      swap(doc, url);
      here = location.pathname + location.search;
      if (!push) window.scrollTo(0, y);
    } catch (err) {
      hard(url);
    } finally {
      busy = false;
    }
  }

  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!a || !eligible(a, e)) return;
    e.preventDefault();
    go(a.href);
  });

  addEventListener("popstate", (e) => {
    if (location.pathname + location.search === here) return; // only the #anchor changed
    go(location.href, { push: false, y: (e.state && e.state.y) || 0 });
  });
})();
