// Horizon Jets v2 — aircraft comparison tool
// Renders all aircraft from HJ_AIRCRAFT with category filter, search,
// sorting, detail expansion, and side-by-side comparison (up to 3).
// The range map calls HJCompare.setRouteFilter(nm) to limit the grid to
// aircraft that can fly a selected route nonstop.
(function () {
  "use strict";
  if (typeof HJ_AIRCRAFT === "undefined") return;

  var CATS = ["Light Jet", "Midsize Jet", "Super Midsize Jet", "Heavy Jet", "Ultra-Long-Range Jet"];
  // This script runs from /aircraft-comparison/, one level below the site root.
  var HJ_ROOT = "../";
  var state = { cat: "All", q: "", sort: "default", routeMin: null, compare: [] };

  var grid = document.getElementById("ac-grid");
  var countLine = document.getElementById("ac-count");
  var tray = document.getElementById("compare-tray");
  var trayLabel = document.getElementById("compare-tray-label");
  var panel = document.getElementById("compare-panel");
  if (!grid) return;

  function money(n) { return "$" + Number(n).toLocaleString("en-US"); }
  function num(n) { return Number(n).toLocaleString("en-US"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function bySlug(slug) {
    for (var i = 0; i < HJ_AIRCRAFT.length; i++) if (HJ_AIRCRAFT[i].slug === slug) return HJ_AIRCRAFT[i];
    return null;
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var list = HJ_AIRCRAFT.filter(function (a) {
      if (state.cat !== "All" && a.cat !== state.cat) return false;
      if (state.routeMin != null && a.range < state.routeMin) return false;
      if (q && (a.name + " " + a.make + " " + a.model).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var catIdx = function (a) { return CATS.indexOf(a.cat); };
    list.sort(function (a, b) {
      switch (state.sort) {
        case "rate-asc": return a.rate - b.rate;
        case "rate-desc": return b.rate - a.rate;
        case "range-desc": return b.range - a.range;
        case "range-asc": return a.range - b.range;
        case "seats-desc": return b.seats - a.seats;
        case "seats-asc": return a.seats - b.seats;
        case "name": return a.name.localeCompare(b.name);
        default: return (catIdx(a) - catIdx(b)) || (a.rate - b.rate);
      }
    });
    return list;
  }

  function detailRows(a) {
    var rows = [
      ["Seats", a.seats],
      ["Range", num(a.range) + " nm"],
      ["Listed hourly rate", money(a.rate) + " / hr"],
      ["Cruise speed", num(a.speed) + " mph"],
      ["Wi-Fi", a.wifi ? "Yes" : "No"],
      ["Lavatory", a.lav || "—"],
      ["Cabin height", a.ch + " ft"],
      ["Cabin width", a.cw + " ft"],
      ["Cabin length", a.cl + " ft"],
      ["Runway required", num(a.runway) + " ft"],
      ["Year introduced", a.year]
    ];
    var h = "<table>";
    for (var i = 0; i < rows.length; i++) h += "<tr><td>" + rows[i][0] + "</td><td>" + esc(rows[i][1]) + "</td></tr>";
    h += "</table>";
    if (a.routes) h += "<p><strong>Popular routes:</strong> " + esc(a.routes) + "</p>";
    if (a.notes) h += "<p>" + esc(a.notes) + "</p>";
    h += '<p><a class="btn btn-sm" href="' + HJ_ROOT + 'booking/?aircraft=' + encodeURIComponent(a.slug) + '">Request a quote for this aircraft</a></p>';
    return h;
  }

  function cardHtml(a) {
    var checked = state.compare.indexOf(a.slug) !== -1 ? " checked" : "";
    var h = '<article class="ac-card" data-slug="' + esc(a.slug) + '">';
    h += '<img src="' + HJ_IMG_BASE + esc(a.img) + '" alt="' + esc(a.name) + '" loading="lazy">';
    h += '<div class="ac-body"><h3><a href="' + HJ_ROOT + 'aircraft/' + esc(a.slug) + '/">' + esc(a.name) + '</a></h3><div class="ac-cat">' + esc(a.cat) + '</div>';
    h += '<div class="ac-specs">';
    h += '<div><div class="k">Seats</div>' + a.seats + '</div>';
    h += '<div><div class="k">Range</div>' + num(a.range) + ' nm</div>';
    h += '<div><div class="k">Cruise</div>' + num(a.speed) + ' mph</div>';
    h += '<div><div class="k">Wi-Fi</div>' + (a.wifi ? "Yes" : "No") + '</div>';
    h += '</div>';
    h += '<div class="ac-rate">' + money(a.rate) + ' <span class="small">/ hr listed</span></div>';
    h += '<div class="ac-actions">';
    h += '<label class="compare-check"><input type="checkbox" data-compare="' + esc(a.slug) + '"' + checked + '> Compare</label>';
    h += '<button type="button" class="btn btn-sm btn-ghost" data-detail="' + esc(a.slug) + '">Full specs</button>';
    h += '<a class="btn btn-sm btn-ghost" href="' + HJ_ROOT + 'aircraft/' + esc(a.slug) + '/">Full page →</a>';
    h += '</div>';
    h += '<div class="ac-detail" id="detail-' + esc(a.slug) + '">' + detailRows(a) + '</div>';
    h += '</div></article>';
    return h;
  }

  function render() {
    var list = filtered();
    var h = "";
    for (var i = 0; i < list.length; i++) h += cardHtml(list[i]);
    grid.innerHTML = h || '<p>No aircraft match those filters. Try clearing the search or the route filter.</p>';
    var total = HJ_AIRCRAFT.length;
    var msg = "Showing " + list.length + " of " + total + " aircraft";
    if (state.routeMin != null) msg += " that can fly the selected route nonstop (" + num(state.routeMin) + " nm)";
    msg += ".";
    if (countLine) countLine.textContent = msg;
    updateTray();
  }

  function updateTray() {
    var n = state.compare.length;
    if (tray) {
      tray.classList.toggle("show", n > 0);
      document.body.classList.toggle("has-tray", n > 0);
    }
    if (trayLabel) {
      var names = state.compare.map(function (s) { var a = bySlug(s); return a ? a.name : s; });
      trayLabel.textContent = n + " selected: " + names.join(" · ") + (n < 3 ? " — pick up to 3 to compare" : "");
    }
  }

  function specRow(label, fn) {
    var h = "<tr><th>" + label + "</th>";
    for (var i = 0; i < state.compare.length; i++) {
      var a = bySlug(state.compare[i]);
      h += "<td>" + (a ? esc(fn(a)) : "—") + "</td>";
    }
    return h + "</tr>";
  }

  function renderCompare() {
    if (!panel) return;
    if (state.compare.length < 2) {
      panel.innerHTML = "<p>Pick at least 2 aircraft to compare.</p>";
      panel.classList.add("show");
      return;
    }
    var h = '<div class="table-scroll"><table class="data"><thead><tr><th></th>';
    for (var i = 0; i < state.compare.length; i++) {
      var a = bySlug(state.compare[i]);
      h += "<th>" + (a ? esc(a.name) : "") + "</th>";
    }
    h += "</tr></thead><tbody>";
    h += specRow("Category", function (a) { return a.cat; });
    h += specRow("Seats", function (a) { return a.seats; });
    h += specRow("Range", function (a) { return num(a.range) + " nm"; });
    h += specRow("Listed hourly rate", function (a) { return money(a.rate) + " / hr"; });
    h += specRow("Cruise speed", function (a) { return num(a.speed) + " mph"; });
    h += specRow("Wi-Fi", function (a) { return a.wifi ? "Yes" : "No"; });
    h += specRow("Lavatory", function (a) { return a.lav || "—"; });
    h += specRow("Cabin (H × W × L)", function (a) { return a.ch + " × " + a.cw + " × " + a.cl + " ft"; });
    h += specRow("Runway required", function (a) { return num(a.runway) + " ft"; });
    h += specRow("Year introduced", function (a) { return a.year; });
    h += specRow("Popular routes", function (a) { return a.routes || "—"; });
    h += "</tbody></table></div>";
    h += '<p><a class="btn" href="' + HJ_ROOT + 'booking/">Request quotes for these aircraft</a></p>';
    panel.innerHTML = h;
    panel.classList.add("show");
    if (panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Events (delegated — the grid re-renders)
  grid.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t && t.getAttribute && t.getAttribute("data-compare")) {
      var slug = t.getAttribute("data-compare");
      var idx = state.compare.indexOf(slug);
      if (t.checked) {
        if (idx === -1) {
          if (state.compare.length >= 3) { t.checked = false; alert("You can compare up to 3 aircraft at a time."); return; }
          state.compare.push(slug);
        }
      } else if (idx !== -1) { state.compare.splice(idx, 1); }
      updateTray();
    }
  });
  grid.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest("[data-detail]") : null;
    if (!btn) return;
    var slug = btn.getAttribute("data-detail");
    var d = document.getElementById("detail-" + slug);
    if (d) {
      var open = d.classList.toggle("open");
      btn.textContent = open ? "Hide specs" : "Full specs";
    }
  });

  var catBtns = document.querySelectorAll("[data-cat]");
  for (var c = 0; c < catBtns.length; c++) {
    catBtns[c].addEventListener("click", function () {
      state.cat = this.getAttribute("data-cat");
      for (var j = 0; j < catBtns.length; j++) catBtns[j].classList.toggle("active", catBtns[j] === this);
      render();
    });
  }
  var search = document.getElementById("ac-search");
  if (search) search.addEventListener("input", function () { state.q = search.value; render(); });
  var sortSel = document.getElementById("ac-sort");
  if (sortSel) sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });
  var cmpBtn = document.getElementById("compare-now");
  if (cmpBtn) cmpBtn.addEventListener("click", renderCompare);
  var clrBtn = document.getElementById("compare-clear");
  if (clrBtn) clrBtn.addEventListener("click", function () {
    state.compare = [];
    if (panel) panel.classList.remove("show");
    render();
  });

  // Range-map hook: filter the grid by minimum range (nm), or null to clear.
  window.HJCompare = {
    setRouteFilter: function (nm) { state.routeMin = nm; render(); },
    clearRouteFilter: function () { state.routeMin = null; render(); }
  };

  render();
})();
