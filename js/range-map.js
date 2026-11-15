// Horizon Jets v2 — Range Map (upgraded)
// Pick a departure and arrival airport — from the dropdowns OR by clicking
// any airport marker on the map. The map draws the route and range rings
// from the departure airport, and the aircraft list below filters to
// aircraft whose listed range covers the trip nonstop.
// Distances are great-circle (straight-line) planning figures in nautical
// miles — the same unit as the listed aircraft ranges. Real flight distance
// varies with routing, winds, and weather; only a quote for the exact trip
// gives the final answer. No availability is shown or implied.
(function () {
  "use strict";
  if (typeof HJ_AIRPORTS === "undefined") return;

  var depSel = document.getElementById("dep-airport");
  var arrSel = document.getElementById("arr-airport");
  var result = document.getElementById("route-result");
  var clearBtn = document.getElementById("route-clear");
  var mapEl = document.getElementById("range-map");
  if (!depSel || !arrSel) return;

  var NM_TO_M = 1852;
  // This script runs from /aircraft-comparison/, one level below the site root.
  var HJ_ROOT = "../";
  var map = null, markers = [], routeLine = null, rings = [];
  var HOME = ["APF", "FMY", "RSW", "PGD", "SRQ"]; // Southwest Florida home airports

  function byCode(code) {
    for (var i = 0; i < HJ_AIRPORTS.length; i++) if (HJ_AIRPORTS[i].code === code) return HJ_AIRPORTS[i];
    return null;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // Fill a <select> with airports grouped by region.
  function fillSelect(sel, placeholder) {
    var regions = [];
    for (var i = 0; i < HJ_AIRPORTS.length; i++) {
      if (regions.indexOf(HJ_AIRPORTS[i].region) === -1) regions.push(HJ_AIRPORTS[i].region);
    }
    var h = '<option value="">' + placeholder + "</option>";
    for (var r = 0; r < regions.length; r++) {
      h += '<optgroup label="' + regions[r] + '">';
      for (var j = 0; j < HJ_AIRPORTS.length; j++) {
        var a = HJ_AIRPORTS[j];
        if (a.region === regions[r]) h += '<option value="' + a.code + '">' + a.code + " — " + a.city + " (" + a.name + ")</option>";
      }
      h += "</optgroup>";
    }
    sel.innerHTML = h;
  }

  function haversineNm(a, b) {
    var R = 3440.065; // Earth radius in nautical miles
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLon = (b.lon - a.lon) * Math.PI / 180;
    var s1 = Math.sin(dLat / 2), s2 = Math.sin(dLon / 2);
    var h = s1 * s1 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * s2 * s2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Points along the great circle between two airports (for the route line).
  function greatCircle(a, b, steps) {
    var lat1 = a.lat * Math.PI / 180, lon1 = a.lon * Math.PI / 180;
    var lat2 = b.lat * Math.PI / 180, lon2 = b.lon * Math.PI / 180;
    var d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)));
    var pts = [];
    if (d === 0) return [[a.lat, a.lon]];
    for (var i = 0; i <= steps; i++) {
      var f = i / steps;
      var A = Math.sin((1 - f) * d) / Math.sin(d);
      var B = Math.sin(f * d) / Math.sin(d);
      var x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      var y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      var z = A * Math.sin(lat1) + B * Math.sin(lat2);
      var lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
      var lon = Math.atan2(y, x) * 180 / Math.PI;
      pts.push([lat, lon]);
    }
    return pts;
  }

  function airportPopup(a) {
    var home = HOME.indexOf(a.code) !== -1 ? "<br><em>Southwest Florida home airport</em>" : "";
    return "<strong>" + esc(a.code) + "</strong> — " + esc(a.city) + "<br>" + esc(a.name) + home +
      '<br><button type="button" data-set-dep="' + esc(a.code) + '" style="margin:6px 6px 0 0;padding:5px 9px;cursor:pointer">Depart from here</button>' +
      '<button type="button" data-set-arr="' + esc(a.code) + '" style="padding:5px 9px;cursor:pointer">Arrive here</button>';
  }

  function initMap() {
    if (typeof L === "undefined") {
      if (mapEl) mapEl.innerHTML = '<div class="map-fallback">The map could not load (it needs an internet connection for the map tiles). The route distance and aircraft filtering below still work.</div>';
      return;
    }
    map = L.map("range-map", { scrollWheelZoom: false }).setView([39.5, -98.35], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 12,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // Every airport is a clickable marker: gold for SWFL home airports,
    // muted blue for the rest. Clicking one offers departure / arrival.
    HJ_AIRPORTS.forEach(function (a) {
      var home = HOME.indexOf(a.code) !== -1;
      L.circleMarker([a.lat, a.lon], {
        radius: home ? 7 : 5,
        color: home ? "#c9a227" : "#7fa3c7",
        weight: 2, fillColor: home ? "#c9a227" : "#7fa3c7", fillOpacity: 0.85
      }).addTo(map).bindPopup(airportPopup(a));
    });
    // Popup buttons: delegate clicks inside the map element.
    mapEl.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var dep = t.getAttribute("data-set-dep");
      var arr = t.getAttribute("data-set-arr");
      if (dep) { depSel.value = dep; if (map) map.closePopup(); update(); }
      if (arr) { arrSel.value = arr; if (map) map.closePopup(); update(); }
    });
  }

  function clearLayers() {
    markers.forEach(function (m) { map.removeLayer(m); });
    markers = [];
    if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
    rings.forEach(function (r) { map.removeLayer(r); });
    rings = [];
  }

  function drawRoute(dep, arr) {
    if (!map) return;
    clearLayers();
    var depM = L.marker([dep.lat, dep.lon]).addTo(map).bindPopup("<strong>Departure: " + esc(dep.code) + "</strong><br>" + esc(dep.city) + " — " + esc(dep.name));
    var arrM = L.marker([arr.lat, arr.lon]).addTo(map).bindPopup("<strong>Arrival: " + esc(arr.code) + "</strong><br>" + esc(arr.city) + " — " + esc(arr.name));
    markers = [depM, arrM];
    routeLine = L.polyline(greatCircle(dep, arr, 64), { color: "#4da3ff", weight: 3 }).addTo(map);
    // Range rings from the departure airport (2,000 / 4,000 / 6,000 / 8,000 nm).
    [2000, 4000, 6000, 8000].forEach(function (r, i) {
      var ring = L.circle([dep.lat, dep.lon], {
        radius: r * NM_TO_M, color: "#c9a227", weight: 1.5,
        fill: false, opacity: 0.9 - i * 0.15, dashArray: "6 6"
      }).addTo(map);
      ring.bindTooltip(r.toLocaleString("en-US") + " nm from " + dep.code, { permanent: false });
      rings.push(ring);
    });
    map.fitBounds(routeLine.getBounds().pad(0.35));
    depM.openPopup();
  }

  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

  function update() {
    var dep = byCode(depSel.value);
    var arr = byCode(arrSel.value);
    if (!dep || !arr) {
      if (result) result.innerHTML = "<p>Select a departure and an arrival airport — from the lists above, or by clicking any airport on the map — to see the distance and which aircraft can fly the route nonstop.</p>";
      if (window.HJCompare) window.HJCompare.clearRouteFilter();
      return;
    }
    if (dep.code === arr.code) {
      if (result) result.innerHTML = "<p>Departure and arrival are the same airport — pick two different airports.</p>";
      return;
    }
    var distNm = haversineNm(dep, arr);
    var distMi = distNm * 1.15078;
    var capable = 0;
    if (typeof HJ_AIRCRAFT !== "undefined") {
      for (var i = 0; i < HJ_AIRCRAFT.length; i++) if (HJ_AIRCRAFT[i].range >= distNm) capable++;
    }
    drawRoute(dep, arr);
    if (result) {
      result.innerHTML =
        "<p><strong>" + esc(dep.code) + " → " + esc(arr.code) + "</strong> — about <strong>" + fmt(distNm) +
        " nautical miles</strong> (" + fmt(distMi) + " statute miles) straight-line.</p>" +
        "<p><strong>" + capable + " of " + (typeof HJ_AIRCRAFT !== "undefined" ? HJ_AIRCRAFT.length : "?") +
        " aircraft</strong> in the guide have the listed range for this route nonstop — the list below is filtered to those aircraft. " +
        "Range is a planning figure: winds, payload, and weather change what an aircraft can actually fly, so only a quote for your exact trip gives the final answer.</p>" +
        '<p><a class="btn btn-sm" href="' + HJ_ROOT + 'booking/?from=' + encodeURIComponent(dep.code + " — " + dep.city) +
        "&to=" + encodeURIComponent(arr.code + " — " + arr.city) +
        '">Request a quote for this route</a></p>';
    }
    if (window.HJCompare) window.HJCompare.setRouteFilter(Math.ceil(distNm));
  }

  fillSelect(depSel, "Choose departure airport…");
  fillSelect(arrSel, "Choose arrival airport…");
  depSel.addEventListener("change", update);
  arrSel.addEventListener("change", update);
  if (clearBtn) clearBtn.addEventListener("click", function () {
    depSel.value = ""; arrSel.value = "";
    if (map) { clearLayers(); map.setView([39.5, -98.35], 4); }
    update();
  });

  initMap();
})();
