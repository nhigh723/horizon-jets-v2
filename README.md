# Horizon Jets v2 — static rebuild

A new static version of horizonjets.com, built to compare side-by-side with
Nick's WordPress original. If it's better, migrate. If not, the original
stays. **Nothing on the live WordPress site was touched.**

## What's in here

- `index.html` — Home (root)
- `about-us/`, `our-services/`, `aircraft-comparison/`, `jet-card/`,
  `empty-leg/`, `faq/`, `booking/`, `contact-us/`, `privacy/`,
  `terms-of-service/` — one `index.html` per page, in the **same URL slugs
  as the original WordPress site**, so already-indexed URLs keep working
  after migration.
- `aircraft/<slug>/` — one indexable detail page per aircraft (49 total),
  using the **same slugs as the original** (e.g.
  `/aircraft/boeing-bbj-737-700/`).
- `css/style.css` — all styles (dark navy + gold, system fonts only).
- `js/aircraft-data.js` — the full aircraft database (49 aircraft,
  transcribed from the WordPress REST API, Nov 15, 2026).
- `js/airports.js` — 55 airports for the range map.
- `js/aircraft.js` — comparison tool. `js/range-map.js` — interactive
  range map (Leaflet + OpenStreetMap, the only library used).
  `js/main.js` — nav + form handling.
- `tools/generate-aircraft-pages.js` — regenerates the 49 aircraft pages,
  the comparison page's ItemList schema, and `sitemap.xml` from
  `js/aircraft-data.js`. Run `node tools/generate-aircraft-pages.js` after
  any data change. `tools/restructure-urls.js` was the one-off move to
  WordPress URL slugs — already run, kept for reference.
- `sitemap.xml` (60 URLs), `robots.txt`, `.nojekyll`.

## The aircraft data (the crown jewels)

49 aircraft, every spec exactly as extracted from the WordPress API:
make, model, category, seating, range (nm), listed hourly rate, Wi-Fi,
lavatory, cruise speed, cabin H/W/L, runway, year, Popular Routes, Notes.
Photos are hotlinked from horizonjets.com (same owner) — no images were
downloaded. **Nothing was invented.** The G650 has no Popular Routes or
Notes in the source, so its page shows neither. The ACF typo "Citaton XLS+"
is shown as "Citation XLS+" per the post title.

Category counts: Light Jet 10, Midsize Jet 9, Super Midsize Jet 10,
Heavy Jet 10, Ultra-Long-Range Jet 10.

## The map

The original's map is the **Range Map** on the Aircraft Comparison page:
departure/arrival airport dropdowns, a route line, range rings, and a
legend. The original's exact airport list and JavaScript could not be
recovered (the tool is client-side JS that text extraction can't see), so
v2 rebuilds it faithfully in function and **upgrades** it:

- Interactive Leaflet map (free, no API key) with OpenStreetMap tiles.
- **Every airport is a clickable marker** — click one and set it as your
  departure or arrival airport, or use the dropdowns.
- 55 airports: every code in his Popular Routes data, his Southwest
  Florida home airports (APF, FMY, RSW, PGD, SRQ — gold markers), and
  major US + international hubs.
- Great-circle route line, range rings at 2,000 / 4,000 / 6,000 / 8,000 nm
  from departure, and the aircraft list filters to jets that can fly the
  route nonstop. Distances are straight-line planning figures.

## SEO

- Every aircraft page: unique title + meta description, canonical URL,
  full spec table, Popular Routes + Notes, photo, **schema.org Vehicle**
  JSON-LD (specs in `additionalProperty` — there is no aircraft-specific
  schema.org type, so Vehicle is the most correct option) plus a
  **BreadcrumbList**.
- Comparison page: **ItemList** JSON-LD linking to all 49 aircraft pages.
- FAQ page: FAQPage JSON-LD.
- Internal linking: comparison links to every aircraft page; each aircraft
  page links back to the comparison and to 4 related aircraft in the same
  category.
- One H1 per page, unique SEO title + meta per page, sitemap + robots.

## Honesty rules (from REWRITE.md)

Broker positioning with the Part 295 disclosure on home, booking, FAQ,
About, and the footer. No fleet claims, no team/24-7 claims, no fake
testimonials (the /testimonials/ and /our-team/ pages were dropped), no
ARGUS/Wyvern claims, no other brands' logos, no instant booking/quotes, no
named operators, no invented prices or availability. Hourly rates are
labeled as listed rates. The "Aquistions" typo appears nowhere.

## Forms

Same pattern as the rank-and-rent sites: `FORM_ENDPOINT` in `js/main.js`
is empty for now. Until it's wired to a form service (Formspree), the form
shows the request on the page with an "Open in my email app" button
(mailto with **no recipient** — the visitor addresses it) and a copy
button. No email address is in any form action. To wire it: set
`FORM_ENDPOINT` to the form service URL and redeploy.

## Contact details

Phone 781-772-5248, email Sales@HorizonJets.com, address Boston, MA are
Nick's own published details from the live contact page, reproduced here.
**Confirm they're current before migration.**

## What was NOT preserved, and why

- The original's exact airport list and map JavaScript: unrecoverable from
  text extraction (client-side JS). Rebuilt in function with a larger
  airport database (54 airports).
- The G650's Popular Routes / Notes: blank in the source, so blank here.
- /testimonials/, /our-team/, /header/, /on-demand-booking/: dropped
  deliberately (fake content / duplicate of booking).

## Verify before publishing

- `node --check js/*.js` — all JS parses.
- Grep for banned claims: `our fleet`, `24/7`, `ARGUS`, `Wyvern`,
  `instant`, `testimonial`, `Aquistions`, `Ferrari`, `NBAA` — each must
  appear only in a negation or not at all.
- Check all 49 aircraft appear in the comparison and in the sitemap.
- Load every page and check zero console errors; test the map, the compare
  tool (up to 3), and the form's mailto fallback.
