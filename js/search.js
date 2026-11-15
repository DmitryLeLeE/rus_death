/* Atlas search and claim ledger: no server, runs on a prebuilt JSON index. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var box = $("[data-search-app]");
  if (box) {
    var input = $("#sq", box), out = $("#sresults", box), status = $("#sstatus", box);
    var chips = $$("[data-kind-chip]", box);
    var idle = box.getAttribute("data-idle"), emptyMsg = box.getAttribute("data-empty"), foundWord = box.getAttribute("data-found");
    var kindNames = JSON.parse(box.getAttribute("data-kinds"));
    var index = null, active = {};
    chips.forEach(function (c) { active[c.getAttribute("data-kind-chip")] = true; });

    fetch(box.getAttribute("data-index")).then(function (r) { return r.json(); }).then(function (j) {
      index = j.map(function (e) { return { k: e[0], t: e[1], u: e[2], x: e[3], h: (e[1] + " " + e[3]).toLowerCase() }; });
      run();
    }).catch(function () { status.textContent = "Index failed to load."; });

    function snippet(text, term) {
      var i = text.toLowerCase().indexOf(term);
      var start = Math.max(0, (i < 0 ? 0 : i) - 70), end = Math.min(text.length, start + 220);
      return { pre: (start > 0 ? "… " : "") + text.slice(start, i < 0 ? end : i), hit: i < 0 ? "" : text.slice(i, i + term.length), post: i < 0 ? "" : text.slice(i + term.length, end) + (end < text.length ? " …" : "") };
    }

    function run() {
      if (!index) return;
      var q = input.value.trim().toLowerCase();
      out.textContent = "";
      if (q.length < 2) { status.textContent = idle; return; }
      var terms = q.split(/\s+/).filter(Boolean);
      var res = [];
      index.forEach(function (e) {
        if (!active[e.k]) return;
        for (var i = 0; i < terms.length; i++) if (e.h.indexOf(terms[i]) < 0) return;
        var inTitle = terms.every(function (t) { return e.t.toLowerCase().indexOf(t) >= 0; });
        res.push({ e: e, s: inTitle ? 0 : 1 });
      });
      res.sort(function (a, b) { return a.s - b.s; });
      status.textContent = foundWord + ": " + res.length;
      if (!res.length) { var p = document.createElement("p"); p.className = "sres__empty"; p.textContent = emptyMsg; out.appendChild(p); return; }
      res.slice(0, 80).forEach(function (r) {
        var li = document.createElement("li"); li.className = "sres";
        var k = document.createElement("span"); k.className = "sres__kind mono"; k.textContent = kindNames[r.e.k] || r.e.k;
        var a = document.createElement("a"); a.className = "sres__title"; a.href = r.e.u; a.textContent = r.e.t;
        var sn = snippet(r.e.x, terms[0]);
        var p = document.createElement("p"); p.className = "sres__snip";
        p.appendChild(document.createTextNode(sn.pre));
        if (sn.hit) { var m = document.createElement("mark"); m.textContent = sn.hit; p.appendChild(m); }
        p.appendChild(document.createTextNode(sn.post));
        li.appendChild(k); li.appendChild(a); li.appendChild(p); out.appendChild(li);
      });
    }
    input.addEventListener("input", run);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var key = c.getAttribute("data-kind-chip");
        active[key] = !active[key];
        c.setAttribute("aria-pressed", active[key] ? "true" : "false");
        run();
      });
    });
    var qs = new URLSearchParams(location.search).get("q");
    if (qs) input.value = qs;
  }

  var led = $("[data-ledger]");
  if (led) {
    var rows = $$("tbody tr", led), lchips = $$("[data-level-chip]"), lstatus = $("#lstatus");
    var cur = "all";
    function apply() {
      var n = 0;
      rows.forEach(function (r) { var show = cur === "all" || r.getAttribute("data-level") === cur; r.hidden = !show; if (show) n++; });
      lstatus.textContent = n + " " + lstatus.getAttribute("data-of") + " " + rows.length;
    }
    lchips.forEach(function (c) {
      c.addEventListener("click", function () {
        cur = c.getAttribute("data-level-chip");
        lchips.forEach(function (o) { o.setAttribute("aria-pressed", o === c ? "true" : "false"); });
        apply();
      });
    });
    apply();
  }
})();
