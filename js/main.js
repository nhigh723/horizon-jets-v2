// Horizon Jets v2 — shared site JS
// Form backend: set FORM_ENDPOINT to a form-service URL (e.g. Formspree)
// when one is ready. While it is empty, submissions fall back to the
// visitor's own email app (pre-filled subject + body, no recipient in the
// form action) and show the request on the page with a copy button.
var FORM_ENDPOINT = "";
var FORM_MAILTO = ""; // intentionally empty — no email address in a public form action

(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Footer year
  var yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // Generic form handling for .hj-form (booking + contact).
  // Fields carry data-label attributes used to build the readable summary.
  function buildSummary(form) {
    var lines = [];
    var fields = form.querySelectorAll("[data-label]");
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var v = (f.value || "").trim();
      if (v) lines.push(f.getAttribute("data-label") + ": " + v);
    }
    return lines.join("\n");
  }

  function showResult(form, summary, subject) {
    var box = form.parentElement.querySelector(".form-result");
    if (!box) return;
    box.innerHTML =
      '<strong>Your request is ready to send.</strong>' +
      "<p>Our online form isn't connected yet, so your request is shown below. " +
      "Use the button to open it in your email app, or copy it and send it to the email address in the footer below.</p>" +
      "<pre>" + esc(summary) + "</pre>" +
      '<p><a class="btn" href="mailto:' + FORM_MAILTO +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(summary) +
      '">Open in my email app</a> ' +
      '<button type="button" class="btn btn-ghost" data-copy>Copy request</button></p>';
    box.classList.add("show");
    if (box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    var copyBtn = box.querySelector("[data-copy]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var done = function () { copyBtn.textContent = "Copied"; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(summary).then(done, function () { fallbackCopy(); });
        } else { fallbackCopy(); }
        function fallbackCopy() {
          var ta = document.createElement("textarea");
          ta.value = summary; document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (e) { /* leave as-is */ }
          document.body.removeChild(ta);
        }
      });
    }
  }

  document.addEventListener("submit", function (ev) {
    var form = ev.target;
    if (!form.classList || !form.classList.contains("hj-form")) return;
    ev.preventDefault();
    var summary = buildSummary(form);
    var subject = form.getAttribute("data-subject") || "Horizon Jets request";
    if (!FORM_ENDPOINT) { showResult(form, summary, subject); return; }
    var data = new FormData(form);
    fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { "Accept": "application/json" } })
      .then(function (resp) {
        if (resp.ok) {
          var box = form.parentElement.querySelector(".form-result");
          if (box) {
            box.innerHTML = "<strong>Thanks — your request is in.</strong><p>We will review your trip and come back with real pricing. If any detail needs clarifying, we will reach out at the email you gave. There is no obligation to book.</p>";
            box.classList.add("show");
          }
          form.reset();
        } else { showResult(form, summary, subject); }
      })
      .catch(function () { showResult(form, summary, subject); });
  });
})();
