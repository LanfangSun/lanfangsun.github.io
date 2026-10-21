/* Lanfang Sun — site scripts: menu, theme, publications, sea chart, globe */
(function () {
  "use strict";
  var S = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  var ZH = (document.documentElement.lang || "").indexOf("zh") === 0;
  var ZH_NAMES = { "Asia": "亚洲", "North America": "北美洲", "Mainland China": "中国内地", "Macau": "澳门", "Taiwan": "台湾",
    "Japan": "日本", "South Korea": "韩国", "Thailand": "泰国", "Philippines": "菲律宾", "Malaysia": "马来西亚", "Brunei": "文莱", "United States": "美国" };
  var tr = function (t) { return ZH ? (ZH_NAMES[t] || t) : t; };
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------- menu ---------- */
  var menu = $(".menu"), nav = $("#navigation");
  if (menu && nav) menu.addEventListener("click", function () {
    var open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  });

  /* ---------- theme ---------- */
  var saved = store("ls-theme");
  if (saved === "light" || saved === "dark") document.documentElement.setAttribute("data-theme", saved);
  var tt = $(".theme-toggle");
  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function paintToggle() {
    if (!tt) return;
    var dark = isDark();
    tt.setAttribute("aria-label", dark ? "Switch to daylight colours" : "Switch to night-sea colours");
    tt.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  }
  if (tt) {
    paintToggle();
    tt.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      store("ls-theme", next);
      paintToggle();
    });
  }

  /* ---------- shared publication helpers ---------- */
  var J = S.journals || {};
  function journalName(p) { return (J[p.j] && J[p.j].name) || p.j; }
  function qClass(p) { var q = J[p.j] && J[p.j].q; return q === "Q1" ? "q1" : q === "Q2" ? "q2" : "q0"; }
  function link(p) { return p.doi ? "https://doi.org/" + p.doi : (p.url || null); }
  function citeHTML(p) {
    return p.authors + " (" + p.year + "). " + p.title + ". <i>" + journalName(p) + "</i>" + (p.details ? ", " + p.details : "") + ".";
  }
  function entryHTML(p, withYear) {
    return '<h3 class="pt">' + p.title + "</h3>" +
      '<p class="pa">' + p.authors + "</p>" +
      '<p class="pj"><i>' + journalName(p) + "</i>" + (p.details ? ", " + p.details : "") + (withYear ? " · " + p.year : "") + "</p>";
  }
  function tagsHTML(p) {
    var j = J[p.j] || {}, h = "";
    if (j.index) h += '<span class="tag idx">' + j.index + "</span>";
    if (j.q) h += '<span class="tag q ' + qClass(p) + '">' + S.jcrLabel + " " + j.q + "</span>";
    if (j.jif) h += '<span class="tag if">IF ' + j.jif.toFixed(1) + "</span>";
    if (p.doi) h += '<a class="tag doi" href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener">DOI ' + p.doi + "</a>";
    else if (p.url) h += '<a class="tag doi" href="' + p.url + '" target="_blank" rel="noopener">Full text</a>';
    return h;
  }

  /* ---------- home: profile links ---------- */
  var pl = $("#profile-links"), L = S.links || {};
  if (pl) {
    var items = [
      [L.orcid, "ORCID"],
      [L.scholar, "Google Scholar"],
      [L.linkedin, "LinkedIn"]
    ].filter(function (x) { return x[0]; });
    pl.innerHTML = items.map(function (x) {
      return '<a href="' + x[0] + '"' + (x[0].indexOf("mailto:") === 0 ? "" : ' target="_blank" rel="noopener me"') + ">" + x[1] + "</a>";
    }).join("");
  }

  /* ---------- home: selected works ---------- */
  var sel = $("#selected-works");
  if (sel && S.pubs) {
    ["vaill", "ijal", "sys"].forEach(function (id) {
      var p = S.pubs.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      var a = document.createElement("article");
      a.className = "work";
      a.innerHTML = entryHTML(p, true) + '<div class="tags">' + tagsHTML(p) + "</div>";
      sel.appendChild(a);
    });
  }

  /* ---------- publications page ---------- */
  var list = $("#pub-list");
  if (list && S.pubs) {
    var years = [];
    S.pubs.forEach(function (p) { if (years.indexOf(p.year) < 0) years.push(p.year); });
    years.sort(function (a, b) { return b - a; });

    // list
    years.forEach(function (y) {
      var g = document.createElement("section");
      g.className = "year-group";
      g.innerHTML = '<h2 class="pub-year">' + y + "</h2>";
      S.pubs.filter(function (p) { return p.year === y; }).forEach(function (p) {
        var a = document.createElement("article");
        a.className = "publication";
        a.id = "pub-" + p.id;
        a.dataset.year = y;
        a.dataset.id = p.id;
        a.dataset.indexed = J[p.j] && J[p.j].index ? "1" : "0";
        a.innerHTML = entryHTML(p, false) + '<div class="tags">' + tagsHTML(p) + "</div>";
        g.appendChild(a);
      });
      list.appendChild(g);
    });

    // year filter buttons
    var fbox = $("#year-filters");
    var yearSel = "all", idxOnly = false;
    if (fbox) {
      var mk = function (label, val) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = label; b.dataset.filter = val;
        b.setAttribute("aria-pressed", String(val === "all"));
        fbox.appendChild(b);
      };
      mk("All years", "all");
      years.forEach(function (y) { mk(String(y), String(y)); });
    }
    var idxBtn = $("#indexed-only");
    var search = $("#publication-search");
    var count = $("#result-count"), none = $("#no-results");

    function applyFilter() {
      var q = (search && search.value || "").toLowerCase().trim(), n = 0, visible = {};
      $$(".publication", list).forEach(function (e) {
        var ok = (yearSel === "all" || e.dataset.year === yearSel) &&
                 (!idxOnly || e.dataset.indexed === "1") &&
                 e.textContent.toLowerCase().indexOf(q) > -1;
        e.hidden = !ok;
        if (ok) { n++; visible[e.dataset.id] = 1; }
      });
      $$(".year-group", list).forEach(function (g) {
        g.hidden = !$$(".publication", g).some(function (e) { return !e.hidden; });
      });
      if (count) count.textContent = n + (n === 1 ? " publication" : " publications");
      if (none) none.hidden = n !== 0;
      $$(".buoy").forEach(function (b) { b.classList.toggle("dim", !visible[b.dataset.id]); });
    }
    if (fbox) fbox.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      yearSel = b.dataset.filter;
      $$("button", fbox).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      applyFilter();
    });
    if (idxBtn) idxBtn.addEventListener("click", function () {
      idxOnly = !idxOnly; idxBtn.setAttribute("aria-pressed", String(idxOnly)); applyFilter();
    });
    if (search) search.addEventListener("input", applyFilter);

    // at a glance
    var gl = $("#glance");
    if (gl) {
      var asc = years.slice().sort();
      var t = "<table><thead><tr><th scope=\"col\"><span class=\"sr\"></span></th>";
      asc.forEach(function (y) { t += '<th scope="col">' + y + "</th>"; });
      t += "</tr></thead><tbody>";
      [["first", "First author"], ["co", "Co-author"]].forEach(function (r) {
        t += '<tr><th scope="row">' + r[1] + "</th>";
        asc.forEach(function (y) {
          t += "<td>";
          S.pubs.filter(function (p) { return p.year === y && p.role === r[0]; }).forEach(function (p) {
            var href = link(p) || "#pub-" + p.id, ext = !!link(p);
            t += '<a class="chip ' + qClass(p) + '" href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : "") +
                 ' title="' + p.title.replace(/"/g, "&quot;") + " — " + journalName(p) + '">' + p.j + "</a>";
          });
          t += "</td>";
        });
        t += "</tr>";
      });
      gl.innerHTML = t + "</tbody></table>";
    }

    buildSeaChart();
    applyFilter();
  }

  /* ---------- sea chart (publication map) ---------- */
  function rand(seed, i) { var x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
  function blobPath(cx, cy, r, seed, scale) {
    var n = 12, pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2, rr = r * scale * (0.82 + 0.36 * rand(seed, i));
      pts.push([cx + Math.cos(a) * rr * 1.18, cy + Math.sin(a) * rr * 0.86]);
    }
    var d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
    for (var k = 0; k < n; k++) {
      var p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      var c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += "C" + c1[0].toFixed(1) + "," + c1[1].toFixed(1) + " " + c2[0].toFixed(1) + "," + c2[1].toFixed(1) + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d + "Z";
  }

  function placeOf(p) {
    if (!p.pos) return "Early essays";
    var x = p.pos[0], y = p.pos[1];
    var who = y > 0.12 ? "Teachers" : y < -0.12 ? "Learners" : "Teachers & learners";
    var where = x < -0.12 ? "formal settings" : x > 0.12 ? "informal settings" : "formal & informal settings";
    return who + " · " + where + (p.ai ? " · generative AI" : "");
  }
  function smooth(pts) {
    var d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
    for (var k = 0; k < pts.length - 1; k++) {
      var p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
           (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d;
  }

  function buildSeaChart() {
    var host = $("#seachart"), card = $("#buoy-card");
    if (!host || !S.quadrants) return;
    var W = 1000, H = 640, CX = 525, CY = 325;
    var X = function (v) { return CX + v * 400; }, Y = function (v) { return CY - v * 255; };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "group", "aria-label": "Sea chart of publications. West is formal settings, east is informal settings, north is teachers, south is learners. Buoys are papers." }, host);
    var defs = el("defs", {}, svg);
    var lg = el("linearGradient", { id: "depthG", x1: "0", x2: "1" }, defs);
    el("stop", { offset: "0", style: "stop-color:var(--paper);stop-opacity:.55" }, lg);
    el("stop", { offset: "1", style: "stop-color:var(--glass);stop-opacity:.35" }, lg);
    el("rect", { x: 0, y: 0, width: W, height: H, fill: "url(#depthG)" }, svg);

    var bg = el("g", { "aria-hidden": "true" }, svg);
    // coastline (formal settings) and depth contours that widen toward the open sea
    function coast(off) {
      var pts = [];
      for (var i = 0; i <= 16; i++) pts.push([62 + off + Math.sin(i * 1.3 + off * 0.01) * 10 + rand(5, i) * 12 * (1 + off / 300), i * 40]);
      return pts;
    }
    [40, 110, 210, 340].forEach(function (off, i) {
      el("path", { d: smooth(coast(off)), class: "sc-contour" + (i > 1 ? " dash" : "") }, bg);
    });
    var cp = coast(0);
    el("path", { d: smooth(cp) + "L0,640L0,0Z", class: "sc-island" }, bg);
    // harbour breakwater
    // soundings: deeper toward the open sea
    for (var s = 0; s < 26; s++) {
      var sx = 120 + rand(91, s) * 860, sy = 30 + rand(37, s) * 590;
      if (Math.abs(sx - CX) < 70 && Math.abs(sy - CY) < 70) continue;
      var t = el("text", { x: sx.toFixed(0), y: sy.toFixed(0), class: "sc-sounding" }, bg);
      t.textContent = String(Math.round(2 + (sx - 100) / 22 + rand(13, s) * 6));
    }
    // axes and compass
    el("line", { x1: 120, y1: CY, x2: 960, y2: CY, class: "sc-axis" }, bg);
    el("line", { x1: CX, y1: 40, x2: CX, y2: 612, class: "sc-axis" }, bg);
    var cg = el("g", { transform: "translate(" + CX + "," + CY + ")" }, bg);
    el("circle", { r: 30, class: "sc-compass sc-compass-bg" }, cg);
    el("circle", { r: 23, class: "sc-compass", "stroke-dasharray": "1 3" }, cg);
    el("path", { d: "M0,-38 L6,0 L0,38 L-6,0Z M-38,0 L0,5 L38,0 L0,-5Z", class: "sc-compass" }, cg);
    el("path", { d: "M0,-38 L6,0 L-6,0Z", class: "sc-compass-n" }, cg);
    function lbl(x, y, txt, cls, anchor) { var n = el("text", { x: x, y: y, class: cls, "text-anchor": anchor || "middle" }, bg); n.textContent = txt; return n; }
    lbl(CX, 28, "Teachers", "sc-pole");
    lbl(CX, 634, "Learners", "sc-pole");
    lbl(132, CY - 10, "Formal", "sc-pole", "start");
    lbl(962, CY - 10, "Informal", "sc-pole", "end");
    lbl(132, CY + 18, "the coast: classrooms, courses", "sc-sub", "start");
    lbl(962, CY + 18, "open sea: media, everyday life", "sc-sub", "end");
    var Q = S.quadrants;
    lbl(132, 60, Q.nw, "sc-quad", "start"); lbl(962, 60, Q.ne, "sc-quad", "end");
    lbl(132, 600, Q.sw, "sc-quad", "start"); lbl(962, 600, Q.se, "sc-quad", "end");

    // the generative-AI current
    if (S.current) {
      var cpts = S.current.map(function (v) { return [X(v[0]), Y(v[1])]; });
      var cd = smooth(cpts);
      el("path", { d: cd, class: "sc-current-band" }, bg);
      el("path", { d: cd, id: "aiCurrent", class: "sc-current-line" }, bg);
      var tx = el("text", { class: "sc-current-label", dy: -16 }, bg);
      var tp = el("textPath", { href: "#aiCurrent", startOffset: "4%" }, tx);
      tp.textContent = "generative AI current →";
    }

    var buoyLayer = el("g", {}, svg);
    S.pubs.forEach(function (p) {
      if (!p.pos) return;
      var bx = X(p.pos[0]), by = Y(p.pos[1]), big = p.role === "first", rr = big ? 11 : 7.5;
      var b = el("g", { class: "buoy " + qClass(p), tabindex: "0", role: "button", "data-id": p.id,
        "aria-label": p.title + ". " + journalName(p) + ", " + p.year + ". " + placeOf(p) + (big ? ". First-authored." : ".") }, buoyLayer);
      el("circle", { cx: bx, cy: by, r: rr + 7, class: "ring" }, b);
      if (p.ai) el("circle", { cx: bx, cy: by, r: rr + 4, class: "halo" }, b);
      el("line", { x1: bx, y1: by - rr, x2: bx, y2: by - rr - 7, stroke: "currentColor", "stroke-width": 1.6, style: "color:var(--ink)" }, b);
      el("circle", { cx: bx, cy: by, r: rr, class: "body" }, b);
      var tt = el("title", {}, b); tt.textContent = p.title + " (" + p.year + ")";
    });

    function show(id, pin) {
      var p = S.pubs.filter(function (x) { return x.id === id; })[0];
      if (!p || !card) return;
      $$(".buoy").forEach(function (b) { b.classList.toggle("active", b.dataset.id === id); });
      card.innerHTML =
        '<p class="sea-label" style="margin:0 0 6px">' + placeOf(p) + "<br>" + p.year + (p.role === "first" ? " · first author" : "") + "</p>" +
        entryHTML(p, false) +
        '<div class="tags">' + tagsHTML(p) + "</div>" +
        '<p style="margin:14px 0 0;font-size:.9rem"><a href="#pub-' + p.id + '" data-jump="' + p.id + '">Show in the list</a></p>';
      if (pin) card.dataset.pinned = id;
    }
    host.addEventListener("mouseover", function (e) { var b = e.target.closest(".buoy"); if (b) show(b.dataset.id); });
    host.addEventListener("mouseleave", function () { if (card && card.dataset.pinned) show(card.dataset.pinned); });
    host.addEventListener("focusin", function (e) { var b = e.target.closest(".buoy"); if (b) show(b.dataset.id, true); });
    host.addEventListener("click", function (e) { var b = e.target.closest(".buoy"); if (b) show(b.dataset.id, true); });
    host.addEventListener("keydown", function (e) {
      var b = e.target.closest(".buoy");
      if (b && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); var u = link(S.pubs.filter(function (x) { return x.id === b.dataset.id; })[0]); if (u) window.open(u, "_blank", "noopener"); }
    });
    if (card) card.addEventListener("click", function (e) {
      var a = e.target.closest("[data-jump]"); if (!a) return;
      var tgt = document.getElementById("pub-" + a.dataset.jump);
      if (tgt) { tgt.classList.remove("flash"); void tgt.offsetWidth; tgt.classList.add("flash"); }
    });
  }

  /* ---------- publications: where my work travels (OpenAlex citations by country) ---------- */
  var cmap = $("#cite-map");
  if (cmap && S.pubs) {
    var OA = "https://api.openalex.org/works";
    var dois = S.pubs.filter(function (p) { return p.doi; }).map(function (p) { return p.doi.toLowerCase(); });
    var setText = function (sel, txt) { var n = $(sel); if (n) n.textContent = txt; };
    var getJSON = function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };

    var loadData = function () {
      var cached = null;
      try { cached = JSON.parse(localStorage.getItem("ls-cites") || "null"); } catch (e) {}
      if (cached && cached.v === dois.join("|") && Date.now() - cached.t < 864e5) return Promise.resolve(cached);
      return getJSON(OA + "?filter=doi:" + dois.join("|") + "&select=id,doi&per-page=100").then(function (r) {
        var ids = r.results.map(function (w) { return w.id.split("/").pop(); });
        if (!ids.length) return { v: dois.join("|"), t: Date.now(), sources: 0, citing: 0, groups: [] };
        var f = "cites:" + ids.join("|");
        return Promise.all([
          getJSON(OA + "?filter=" + f + "&group_by=authorships.countries&per-page=200"),
          getJSON(OA + "?filter=" + f + "&per-page=1&select=id")
        ]).then(function (res) {
          var groups = res[0].group_by.map(function (g) {
            return { code: String(g.key).split("/").pop().toUpperCase(), name: g.key_display_name, n: g.count };
          }).filter(function (g) { return /^[A-Z]{2}$/.test(g.code); }).sort(function (a, b) { return b.n - a.n; });
          var d = { v: dois.join("|"), t: Date.now(), sources: ids.length, citing: res[1].meta.count, groups: groups };
          try { localStorage.setItem("ls-cites", JSON.stringify(d)); } catch (e) {}
          return d;
        });
      });
    };

    var drawCites = function (d) {
      setText("#cs-sources", d.sources);
      setText("#cs-citing", d.citing);
      setText("#cs-countries", d.groups.length);
      var listEl = $("#cite-list"), max = d.groups.length ? d.groups[0].n : 1;
      listEl.innerHTML = d.groups.slice(0, 12).map(function (g) {
        return '<li><span class="cl-name">' + g.name + '</span><span class="cl-bar"><i style="width:' + (100 * g.n / max).toFixed(1) + '%"></i></span><span class="cl-n">' + g.n + "</span></li>";
      }).join("") + (d.groups.length > 12 ? '<li class="cl-more">+ ' + (d.groups.length - 12) + " more</li>" : "");
      var d3 = window.d3, topo = window.topojson, G = window.GEO;
      if (!d3 || !topo || !G) { cmap.innerHTML = '<p class="empty">The map could not load; the list shows every country.</p>'; return; }
      d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json").then(function (world) {
        var W = 960, H = 470, by = {};
        d.groups.forEach(function (g) { by[g.code] = g; });
        var countries = topo.feature(world, world.objects.countries);
        countries.features = countries.features.filter(function (f) { return f.id !== "010"; }); // drop Antarctica
        var proj = d3.geoNaturalEarth1().fitExtent([[8, 8], [W - 8, H - 8]], countries);
        var path = d3.geoPath(proj);
        cmap.innerHTML = "";
        var svg = d3.select(cmap).append("svg").attr("viewBox", "0 0 " + W + " " + H).attr("role", "img")
          .attr("aria-label", "World map of citing authors' countries; the list beside it gives the counts.");
        svg.append("path").datum({ type: "Sphere" }).attr("d", path).attr("class", "cm-sea");
        svg.append("path").datum(d3.geoGraticule10()).attr("d", path).attr("class", "globe-grat");
        svg.append("g").selectAll("path").data(countries.features).enter().append("path")
          .attr("d", path).attr("class", function (f) { return "cm-land" + (by[G.n[f.id]] ? " reached" : ""); })
          .append("title").text(function (f) { var g = by[G.n[f.id]]; return g ? g.name + ": " + g.n : ""; });
        var rs = d3.scaleSqrt().domain([0, max]).range([0, 22]);
        var pts = d.groups.filter(function (g) { return G.c[g.code]; }).sort(function (a, b) { return b.n - a.n; });
        var gg = svg.append("g").selectAll("g").data(pts).enter().append("g").attr("class", "cm-port")
          .attr("transform", function (g) { var p = proj([G.c[g.code][0], G.c[g.code][1]]); return "translate(" + p[0] + "," + p[1] + ")"; });
        gg.append("circle").attr("r", function (g) { return Math.max(3.5, rs(g.n)); });
        gg.filter(function (g) { return rs(g.n) >= 10; }).append("text").attr("dy", "0.35em").text(function (g) { return g.n; });
        gg.append("title").text(function (g) { return g.name + ": " + g.n + (g.n === 1 ? " citing work" : " citing works"); });
      }).catch(function () { cmap.innerHTML = '<p class="empty">The map could not load; the list shows every country.</p>'; });
    };

    var startCites = function () {
      loadData().then(drawCites).catch(function () {
        cmap.innerHTML = '<p class="empty">Citation data from OpenAlex is unavailable right now. Try again later.</p>';
      });
    };
    if (document.readyState === "complete") startCites(); else window.addEventListener("load", startCites);
  }

  /* ---------- home: globe of travels ---------- */
  var gbox = $("#globe");
  if (gbox && S.stops) {
    var stops = S.stops, kind = "all", current = null;
    var cardEl = $("#stop-card"), listEl = $("#stop-list");
    function dms(v, pos, neg) {
      var a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60);
      if (m === 60) { d++; m = 0; }
      return d + "°" + (m < 10 ? "0" : "") + m + "′" + (v >= 0 ? pos : neg);
    }
    // group the list by continent, then by country or region, in data order
    var uniq = function (arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); };
    var continents = uniq(stops.map(function (s) { return s.continent; }));
    var regions = uniq(stops.map(function (s) { return s.region; }));
    continents.forEach(function (c) {
      var ps = stops.filter(function (s) { return s.continent === c; });
      var div = document.createElement("div");
      div.className = "port-group"; div.dataset.group = c;
      var h = "<h4>" + tr(c) + " <span>" + ps.filter(function (s) { return !s.home; }).length + "</span></h4>";
      uniq(ps.map(function (s) { return s.region; })).forEach(function (r) {
        var rs = ps.filter(function (s) { return s.region === r; });
        h += '<div class="port-region"><p>' + tr(r) + "</p><div>" + rs.map(function (s) {
          return '<button type="button" class="port' + (s.home ? " home" : "") + '" data-stop="' + s.id + '">' + (ZH ? s.zh : s.name) + "</button>";
        }).join("") + "</div></div>";
      });
      div.innerHTML = h;
      listEl.appendChild(div);
    });
    var tally = $("#travel-tally");
    if (tally) tally.textContent = ZH ? "共 " + (stops.length - 1) + " 个地方，分布于 " + regions.length + " 个国家和地区"
                                     : (stops.length - 1) + " places in " + regions.length + " countries and regions";
    function card(s) {
      cardEl.innerHTML = '<p class="stamp-country">' + (s.home ? (ZH ? "家乡 · " : "Home port · ") + tr(s.region) : tr(s.region) + " · " + tr(s.continent)) + "</p>" +
        (ZH ? '<h3 lang="zh-CN">' + s.zh + '</h3><p class="stamp-zh" lang="en">' + s.name + "</p>"
            : '<h3>' + s.name + '</h3><p class="stamp-zh" lang="zh-CN">' + s.zh + "</p>") +
        '<p class="stamp-pos">' + dms(s.lat, "N", "S") + "&ensp;" + dms(s.lon, "E", "W") + "</p>";
      $$("[data-stop]", listEl).forEach(function (b) { b.setAttribute("aria-current", String(b.dataset.stop === s.id)); });
    }
    var globe = null;
    function select(id) {
      var s = stops.filter(function (x) { return x.id === id; })[0]; if (!s) return;
      current = s; card(s); if (globe) globe.focus(s);
    }
    listEl.addEventListener("click", function (e) { var b = e.target.closest("[data-stop]"); if (b) select(b.dataset.stop); });
    var tabs = $("#stop-tabs");
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      kind = b.dataset.kind;
      $$("button", tabs).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $$(".port-group", listEl).forEach(function (g) { g.hidden = !(kind === "all" || g.dataset.group === kind); });
      var first = stops.filter(function (x) { return kind === "all" ? x.home : x.continent === kind; })[0];
      if (first) select(first.id);
      if (globe) globe.redraw();
    });
    current = stops.filter(function (x) { return x.home; })[0] || stops[0];
    card(current);

    function startGlobe() {
      var d3 = window.d3, topo = window.topojson;
      if (!d3 || !topo) return fail();
      d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json").then(function (world) {
        var land = topo.feature(world, world.objects.land);
        var size = 560, base = 268, start = 268;
        var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
        var proj = d3.geoOrthographic().translate([size / 2, size / 2]).scale(start).rotate([-114, -31]).clipAngle(90).precision(.4);
        var path = d3.geoPath(proj);
        gbox.innerHTML = "";
        var svg = d3.select(gbox).append("svg").attr("viewBox", "0 0 " + size + " " + size)
          .attr("role", "img").attr("aria-label", "Globe showing places I have studied, worked, and presented. Use the list to explore each place.");
        var defs = svg.append("defs");
        var gr = defs.append("radialGradient").attr("id", "oceanGrad").attr("cx", "40%").attr("cy", "35%").attr("r", "70%");
        gr.append("stop").attr("offset", "0%").attr("style", "stop-color:var(--shoal)");
        gr.append("stop").attr("offset", "100%").attr("style", "stop-color:var(--glass)");
        var clip = defs.append("clipPath").attr("id", "globeClip");
        var clipC = clip.append("circle").attr("cx", size / 2).attr("cy", size / 2);
        var sphere = svg.append("path").datum({ type: "Sphere" }).attr("class", "globe-ocean");
        var g = svg.append("g").attr("clip-path", "url(#globeClip)");
        var grat = g.append("path").datum(d3.geoGraticule10()).attr("class", "globe-grat");
        var landP = g.append("path").datum(land).attr("class", "globe-land");
        var home = stops.filter(function (x) { return x.home; })[0];
        var route = g.append("path").attr("class", "globe-route");
        var rim = svg.append("path").datum({ type: "Sphere" }).attr("class", "globe-rim");
        var dots = svg.append("g").selectAll("circle").data(stops).enter().append("circle")
          .attr("class", function (d) { return "stop-dot " + (d.home ? "home" : d.continent === "Asia" ? "g-asia" : "g-na"); })
          .on("click", function (ev, d) { select(d.id); });
        dots.append("title").text(function (d) { return d.name + " · " + d.zh; });

        function redraw() {
          var r = proj.rotate(), center = [-r[0], -r[1]];
          clipC.attr("r", proj.scale());
          sphere.attr("d", path); rim.attr("d", path); grat.attr("d", path); landP.attr("d", path);
          route.attr("d", current && home && current.id !== home.id ? path({ type: "LineString", coordinates: [[home.lon, home.lat], [current.lon, current.lat]] }) : null);
          var k = Math.max(1, Math.min(1.6, proj.scale() / base));
          dots.each(function (d) {
            var vis = d3.geoDistance([d.lon, d.lat], center) < Math.PI / 2 - 0.02 && (kind === "all" || d.continent === kind || d.home);
            var p = proj([d.lon, d.lat]);
            d3.select(this).attr("display", vis ? null : "none").attr("cx", p[0]).attr("cy", p[1])
              .attr("r", (d.home ? 7 : 4.5) * k)
              .classed("active", current && current.id === d.id);
          });
        }
        svg.call(d3.drag().on("drag", function (ev) {
          var r = proj.rotate(), f = 0.25 * base / proj.scale();
          proj.rotate([r[0] + ev.dx * f, Math.max(-80, Math.min(80, r[1] - ev.dy * f))]); redraw();
        }));
        function zoomBy(m) { proj.scale(Math.max(200, Math.min(1600, proj.scale() * m))); redraw(); }
        gbox.addEventListener("wheel", function (e) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
        var ctr = document.createElement("div"); ctr.className = "globe-controls";
        ctr.innerHTML = '<button type="button" aria-label="Zoom in">+</button><button type="button" aria-label="Zoom out">−</button><button type="button" aria-label="Reset view">⟲</button>';
        gbox.appendChild(ctr);
        var bs = ctr.querySelectorAll("button");
        bs[0].onclick = function () { zoomBy(1.3); };
        bs[1].onclick = function () { zoomBy(1 / 1.3); };
        bs[2].onclick = function () { fly([114, 31], start); };

        function fly(lonlat, targetScale) {
          var r0 = proj.rotate(), s0 = proj.scale(), r1 = [-lonlat[0], -lonlat[1]];
          var dl = ((r1[0] - r0[0] + 540) % 360) - 180;
          if (reduce) { proj.rotate(r1).scale(targetScale); return redraw(); }
          d3.transition().duration(1100).ease(d3.easeCubicInOut).tween("fly", function () {
            return function (t) { proj.rotate([r0[0] + dl * t, r0[1] + (r1[1] - r0[1]) * t]).scale(s0 + (targetScale - s0) * t); redraw(); };
          });
        }
        var zoomFor = { "Asia": 520, "North America": 520 };
        globe = {
          redraw: redraw,
          focus: function (s) { fly([s.lon, s.lat], s.home ? start : (zoomFor[s.continent] || 420)); }
        };
        redraw();
      }).catch(fail);
    }
    function fail() {
      gbox.innerHTML = '<p class="empty" style="padding:40px 20px;text-align:center">The globe could not load (it needs an internet connection). Every stop is still listed alongside.</p>';
    }
    if (document.readyState === "complete") startGlobe(); else window.addEventListener("load", startGlobe);
  }
})();
