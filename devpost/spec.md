---
doc: spec
status: approved
created: 2026-10-23
---

# Renewal Radar — Technical Spec

## How This Works, In Plain Language
Renewal Radar is one web page and a handful of small JavaScript files. Nothing runs on a server: the browser downloads the page and the scripts, and every calculation happens on the phone. The person picks a benefit, a month and an answer. Those three values are the only "state" the app has, and they live in memory on the page; reloading forgets them.

The date math lives in one file, `rules.js`. Every function in it is pure: it takes the entered month and today's month as inputs and returns a list of dated entries. Each entry names the rule it came from (M1, C4, and so on), and a second file, `sources.js`, holds the official letter, link, page and quote for every rule, copied from `research/FACTS.md`. The page never shows a date that doesn't point back to one of those rows.

A third file, `ics.js`, turns the same entries into a calendar file in the standard iCalendar format that phone calendars import. The page offers it as a download. Because the math and the calendar builder are plain functions with no browser dependencies, Node's built-in test runner checks them against every example in the PRD, and parses the generated calendar file back to confirm it is well formed.

Why this shape: the product promise is "nothing stored or sent", the rules are a small, finite table, and the whole thing has to be reviewable by a volunteer who reads the source. No framework, no build step, no dependencies to install, nothing to deploy beyond copying files.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. The person opens `index.html` on their phone (served as static files). The page loads `css/styles.css`, the self-hosted font, and `js/main.js` as a module. Only the header and the two benefit buttons are visible; later sections exist in the HTML but are hidden.
2. They tap Medi-Cal. `main.js` sets `state.benefit`, clears the rest of the state, and reveals the month picker. The year drop-down was filled on load with 2020 through the current year.
3. They pick May and 2026. `main.js` stores `{year: 2026, month: 5}` and reveals the Medi-Cal situation checklist with Yes / No / Not sure.
4. They tap Yes. `main.js` calls `compute({benefit, last, answer, today})` in `rules.js`. For the New Adult path it walks forward from May 2026 (+12 to May 2027, then +6 because May 2027 is on or after March 2027) until the renewals pass the 18-month window, building entries at each renewal month minus 2 and each renewal month, plus the banner and the cure-window note. Each entry carries rule ids.
5. `render.js` draws the results: the amber banner, the timeline, a "Why this date?" disclosure under each entry (looked up in `sources.js`), the cure note, the counted-forward note if set, the three always-visible lines, and the calendar button.
6. They tap "Add these to my calendar". `main.js` calls `buildIcs(entries, today)` in `ics.js`, which returns the iCalendar text; the page wraps it in a Blob and triggers a download of `renewal-radar.ics`. The phone's calendar app offers to import it.
7. If they change the month or answer above, step 4 onward runs again. If they tap CalFresh, step 2 runs again and everything below is cleared.

## Stack
Learner-selected; all accepted with their tradeoffs.

- **HTML, CSS, JavaScript (ES2022 modules)** in the browser. No framework, no bundler, no transpiler. Tradeoff accepted: module scripts need an HTTP origin, so local trial uses a one-line static server. Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **Node.js 22 (present on the build host: v22.22.1)** for tests only, using the built-in runner `node --test` and `node:assert`. No npm dependencies. Docs: https://nodejs.org/docs/latest-v22.x/api/test.html
- **iCalendar (RFC 5545)** hand-written in `ics.js`, conservative subset: `VALUE=DATE` all-day events, relative `TRIGGER`s, CRLF line endings, lines folded at 75 octets. Spec: https://datatracker.ietf.org/doc/html/rfc5545
- **Atkinson Hyperlegible** self-hosted as WOFF2 (SIL Open Font License), with a system sans-serif fallback stack. Source: https://www.brailleinstitute.org/freefont/ (also on Google Fonts). The files are fetched once during the build and committed under `fonts/`.
- **No backend, no storage, no analytics, no third-party scripts.** The only network requests are the page's own files and, if tapped, the official PDF links.

Unverified, to check early in the build: the exact WOFF2 file names in the current Atkinson Hyperlegible release, and whether `node --test` glob handling on v22 picks up `test/*.test.js` with the planned `npm test` script (fallback: list files explicitly).

## Where It Runs and How Someone Tries It
- **Runtime**: any modern phone or desktop browser. No keys, no accounts, no environment variables.
- **Start locally**:
  ```
  python3 -m http.server 8080
  ```
  from the repo root, then open `http://localhost:8080/`. For the demo video, record a phone-width browser window (or device emulation in desktop dev tools) walking the demo case: Medi-Cal, May 2026, Yes, tap the calendar button.
- **Tests**:
  ```
  npm test
  ```
  which runs `node --test` over `test/`. No install step.
- **Submission**: short demo video plus the public GitHub repository are required. The repo stays private until the team's final review on Sunday 2026-10-25, then goes public.
- **Optional deployment**: GitHub Pages from the repo root, decided and turned on in `6-ship`, not before. The page is already static with no build, so nothing in the architecture depends on it.

## Look and Feel
From `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.

- **Palette as CSS custom properties on `:root`**: deep teal for headings, buttons and the timeline rail; near-white warm paper background in light mode, deep charcoal-teal in dark mode via `prefers-color-scheme: dark`; a warm amber used only for the six-month heads-up banner and the approximate-date label. No red anywhere; "late" is amber text, not an alarm. No gradients, no emoji, no logos or seals. Contrast at or above WCAG AA on both themes.
- **Type**: Atkinson Hyperlegible regular and bold; base size 18px on phones, line height 1.5, generous spacing. Dates in words.
- **Density and energy**: spacious and calm, one column, sections separated by whitespace rather than boxes. Like a well-made library handout.
- **Controls**: buttons and drop-downs at least 48px tall, full width on phones. Selected state shown by a solid teal fill; unselected by a teal outline.
- **Copy tone**: plain, kind, second person, about a 6th-grade reading level. Say "call your county", not "contact your eligibility worker".
- **Favicon**: an inline SVG radar-sweep mark in teal, `favicon.svg`.

## Components

### Page Shell (`index.html`)
Static markup for all five sections in journey order, each a `<section>` with a `hidden` attribute until revealed. Loads the font, the stylesheet, and `js/main.js` as `type="module"`. Contains the header lines verbatim. The situation questions are in the markup (Medi-Cal checklist, CalFresh question) and shown by benefit.
PRD ref: `prd.md > Screens and Layout`, `prd.md > Always-Visible Lines`.

### State and Wiring (`js/main.js`)
Holds `state = {benefit, last: {year, month} | null, answer: 'yes'|'no'|'unsure'|null, toggle: 'newAdult'|'standard'}` and `today` (computed once from the clock as `{year, month}`). Attaches click and change handlers; on any change it clears everything below the changed section, calls `compute`, and asks `render.js` to redraw. Fills the year drop-down with 2020 through the current year. Owns the download: builds the Blob and the temporary `<a download>`.
PRD ref: `prd.md > Benefit Picker`, `prd.md > Month Picker`, `prd.md > Situation Questions`, `prd.md > States and Boundaries`.

### Month Arithmetic (`js/months.js`)
Tiny helpers over `{year, month}` with month 1 to 12, so no `Date` objects and no time zones are involved in the rule math: `addMonths`, `compare`, `isOnOrAfter`, `diffMonths`, `format` ("May 2027"), `formatDay` ("August 5, 2027"). No weekday computation: the C5 last-chance sentence names only the month ("the first working day of May 2027"), because FACTS.md gives no holiday list and a computed day could be wrong.
PRD ref: supports every schedule heading under `prd.md > Features and Behavior`.

### Rules (`js/rules.js`)
Pure functions. Each returns `{ entries, notes, banner, countedForward, kind }`.

- `mediCalStandard(last, today)`: renewals every 12 months from `last`. Implements `prd.md > Medi-Cal Standard Schedule (12 months)`.
- `mediCalNewAdult(last, today)`: next renewal = previous + 6 if previous is on or after March 2027, else + 12. Sets `banner` with the first six-month renewal when any step is 6. Implements `prd.md > Medi-Cal New Adult Schedule (6 months from March 2027)`.
- `calFreshStandard(last, today)`: per 12-month cycle, SAR 7 arrival at +5, due day 5 and late day 11 of month +6, last-chance note naming only the month ("the first working day of [month +7]"), approximate recertification at +12; the next cycle counts from the recertification month. Implements `prd.md > CalFresh Standard Schedule (SAR 7 and recertification)`.
- `calFreshDifferent()`: no entries, the C7 note only. Implements `prd.md > CalFresh Different-Schedule Message (60+ or disabled)`.
- `compute({benefit, last, answer, today})`: returns `{ futureMonth: true }` if `last` is after `today`; otherwise routes: Medi-Cal yes → New Adult, no → standard, unsure → `{ newAdult, standard }` both; CalFresh yes → different, no → standard, unsure → standard with the C7 note prepended. Implements `prd.md > Month Picker` (future month) and `prd.md > Medi-Cal "Not Sure" Toggle`.

Counting forward and the window, shared by all schedules:
- Walk cycles from `last` until the renewal (or SAR 7 submit) month is on or after `today`. Set `countedForward` when any renewal month, SAR 7 due date or recertification month fell before the current month and was skipped (a dropped "renewal starts" entry alone does not count, because that renewal is still ahead). Implements `prd.md > Counting Forward`.
- Entries dated before `today`'s month are dropped (for example a "renewal starts" two months before a renewal that is next month).
- Timeline window: a renewal or report cycle is shown whole if its first entry falls within 18 months of `today`. New Adult schedules additionally always show the renewal after the first six-month renewal, so the six-month rhythm is visible (build revision). Calendar window: only events dated within 18 months of `today` go into the file. This is what makes the demo timeline end at May 2028 while the file ends in April 2028.

Every entry: `{ date: {year, month, day?}, label, action, ruleIds: ['M2','M3'], approximate?: true, event: { title, alarms: ['-P7D'] | ['-P7D','PT9H'] } | null }`. Notes: `{ text, ruleIds }`. Nothing is returned without at least one rule id.

### Sources (`js/sources.js`)
One exported object keyed by rule id (M1–M9, C1–C7), each `{ letter, url, page, quote, confidence }`, copied from `research/FACTS.md`. `render.js` reads it for the disclosures; a test asserts every rule id used by `rules.js` exists here and that no entry cites a rule with confidence below "high" except C2 on the approximate recertification entry and C7 on its message.
PRD ref: `prd.md > Why This Date? Disclosures`.

### Renderer (`js/render.js`)
Builds DOM from a `compute` result: banner, optional toggle (Medi-Cal unsure), optional C7 note, counted-forward note, timeline list, cure and last-chance notes, the always-visible lines, and the calendar button. Each entry gets a `<details>` element labelled "Why this date?" containing the letter name as a link and the quote. Uses `textContent`, never `innerHTML` with data.
PRD ref: `prd.md > Features and Behavior` (all headings), `prd.md > Why This Date? Disclosures`.

### Calendar Builder (`js/ics.js`)
`buildIcs(entries, today, {benefit, stamp})` returns a string: `BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID`, `CALSCALE:GREGORIAN`, then one `VEVENT` per entry with an `event` and a date within 18 months. Each event: deterministic `UID` (benefit, kind, date, `@renewal-radar`), `DTSTAMP` from the passed stamp, `DTSTART;VALUE=DATE:YYYYMMDD` (day 1 for month-level entries), `DTEND;VALUE=DATE` the next day, `SUMMARY`, `DESCRIPTION` (action, source letter, final-word line; commas, semicolons and newlines escaped), and a `VALARM` block per alarm (`ACTION:DISPLAY`, `TRIGGER:-P7D`; the due-date event adds `TRIGGER:PT9H` so it fires at 9 a.m. that day). Lines end in CRLF and are folded at 75 octets.
PRD ref: `prd.md > Calendar Reminder File`.

### Styles (`css/styles.css`)
Custom properties for both themes, the font-face declarations, the one-column layout, large controls, the timeline rail, banner and label styles, and `prefers-reduced-motion` respect for the reveal transitions.
PRD ref: `prd.md > Look and Feel`.

### Tests (`test/`)
`node --test`, no dependencies, `today` pinned to October 2026 unless a case says otherwise.
- `months.test.js`: arithmetic, formatting.
- `rules.test.js`: every acceptance example in `prd.md`: May 2026 Yes and No; January 2026 Yes (M8); March 2026 Yes; March 2024 Yes (counting forward); CalFresh February 2026 and October 2026 No; CalFresh Yes and Not sure; future month; current month; Not sure toggle returns both schedules; every entry has a rule id present in `sources.js`; no non-high rule leaks except C2 on the approximate entry.
- `ics.test.js`: builds the demo file and parses it back with a small test-side parser: unfold lines, split components, assert CRLF only, no line over 75 octets, `VERSION`/`PRODID` present, every `VEVENT` has `UID`, `DTSTAMP`, `DTSTART;VALUE=DATE` matching `^\d{8}$`, `DTEND`, `SUMMARY`; every `VALARM` has `ACTION`, `TRIGGER` and `DESCRIPTION`; the set of `DTSTART`s equals the timeline's in-window event dates; the due-date event has two alarms; the file for the demo case contains nothing after April 2028.
PRD ref: all acceptance criteria under `prd.md > Features and Behavior`.

## Data Model
There is no stored data. In-memory only:

- `today: {year, month}`: read from the clock once at load (tests pass it in).
- `state`: `{benefit, last, answer, toggle}` as above. Updated by taps; cleared downward on change; gone on reload.
- `compute` result: derived, never stored, recomputed on every change.
- `sources`: constant table in code.
- The `.ics` file: generated on tap, handed to the browser as a download. The only thing that leaves the page, and it goes to the person's own phone.

## File Structure
```
renewal-radar/
├── index.html            # page shell: five sections, header lines, situation questions
├── favicon.svg           # teal radar mark
├── css/
│   └── styles.css        # themes (light/dark), font-face, layout, controls, timeline
├── fonts/
│   ├── AtkinsonHyperlegible-Regular.woff2
│   ├── AtkinsonHyperlegible-Bold.woff2
│   └── LICENSE.txt       # SIL OFL
├── js/
│   ├── main.js           # state, reveal logic, event handlers, download
│   ├── months.js         # {year, month} arithmetic and formatting
│   ├── rules.js          # pure schedule functions; every entry cites rule ids
│   ├── sources.js        # rule id → letter, url, page, quote, confidence (from FACTS.md)
│   ├── render.js         # DOM rendering of results and disclosures
│   └── ics.js            # RFC 5545 builder
├── test/
│   ├── months.test.js
│   ├── rules.test.js     # every PRD example
│   └── ics.test.js       # parse-back validation of the generated file
├── research/
│   └── FACTS.md          # sourced rules; sources.js must match it
├── devpost/              # learner profile (gitignored), scope, prd, spec, checklist
├── package.json          # "type": "module", "scripts": {"test": "node --test test/"}
├── README.md             # what it is, how to run, how to test, what is not verified (phone import)
├── LICENSE               # AGPL-3.0-or-later, copyright Techempower; fonts/ keeps its SIL OFL
└── .gitignore            # devpost/learner-profile.md, .env*, !.env.example
```

## External Services and Dependencies
None at runtime. The official PDF links in `sources.js` open in a new tab when tapped; the app never fetches them. Build-time only: downloading the two WOFF2 files once. Tests use Node's standard library only.

## Important Failure Modes
- **Module scripts opened from `file://`** → blank page. README and the first build step say to use the one-line static server; `index.html` carries a `<noscript>` line and a visible fallback message if `main.js` never runs.
- **Phone calendar ignores the download or the morning-of alarm** → not testable this weekend (no phone). The file is kept to the conservative RFC 5545 subset and validated by parse-back in tests; the README records phone import behaviour as not verified. The 7-day alarm is the firm requirement; the morning-of alarm is best effort.
- **Font files fail to load** → system sans-serif fallback stack; layout does not depend on font metrics.
- **Clock skew or a device set to the wrong date** → "today" is wrong, so the counted-forward note may appear or not. Out of the app's control; the results screen states the month it counted as "this month".

## What Was Simplified and Why
- **One benefit at a time** instead of a combined Medi-Cal plus CalFresh timeline: per `prd.md > Deferred From the POC`; a merged view is a design task of its own.
- **No weekday computation for the C5 last-chance date**: the sentence names only the month. FACTS.md has no holiday list, so a computed day could be wrong; the county notice is the final word anyway.
- **No persistence of the last entry**: the privacy promise is simpler to state and audit when nothing is written anywhere.
- **Hand-written iCalendar** instead of a library: the subset needed is small, a library would be the only dependency, and the parse-back test covers the format.
- **No phone test** this weekend: replaced by RFC 5545 validation in tests and an honest README line.

## Decisions and Open Issues
Learner choices:
- Plain HTML/CSS/JS ES modules, no framework, no build, no backend: matches the privacy promise and keeps the code reviewable by a volunteer. Tradeoff: local trial needs an HTTP origin.
- One rules module with a source per rule, tested by `node --test` against every PRD example.
- Self-hosted Atkinson Hyperlegible WOFF2 with system fallback: offline and low-vision readers first; a few hundred KB in the repo.
- Deployment left to `6-ship`; repo private until the Sunday review, then public with GitHub Pages.
- License: AGPL-3.0-or-later, copyright Techempower (the nonprofit's legal name). The Atkinson Hyperlegible files keep their SIL Open Font License under `fonts/LICENSE.txt`.
- Calendar unknown handled by parse-back validation and conservative formatting; phone behaviour recorded as not verified.

Derived implementation decisions (mine, following from the above):
- `{year, month}` arithmetic instead of `Date` to avoid time-zone drift in month math.
- Entries before the current month are dropped; a cycle is shown on the timeline if its first entry is within 18 months; the calendar file holds only events within 18 months. This reconciles the demo timeline (ends May 2028) with the file (ends April 2028).
- `today` is a parameter everywhere so tests are deterministic.
- `textContent` only when rendering data; no HTML injection surface.

The one useful unknown: whether phone calendar apps import the generated `.ics` and honour a 9 a.m. same-day alarm on an all-day event. Clarified as: not checkable this weekend; the agreed evidence is the parse-back test passing on the conservative format, plus a README line stating that real-device import was not verified. Carried from `prd.md > Open Questions`.

Still open, non-blocking:
- Exact WOFF2 file names in the current font release (check at the first build step).
- Whether `node --test test/` resolves the directory on Node 22 as planned, or needs the files listed (check at the first build step).
