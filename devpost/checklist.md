---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Medi-Cal timeline end to end, six-month rule first**
  Becomes usable: Open the page, tap Medi-Cal, pick May 2026, answer the checklist Yes, and see the amber heads-up plus the timeline March 2027, May 2027, September 2027, November 2027, March 2028, May 2028, each with a "Why this date?" source. No shows the 12-month schedule; Not sure shows the toggle. The cycle walker already drops past entries and stops at the 18-month window.
  Why now: The kernel is the six-month rule, so it is proven first, end to end, with the scaffold inside this slice. Every later slice lands on a working page.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Benefit Picker`, `prd.md > Month Picker`, `prd.md > Situation Questions`, `prd.md > Medi-Cal Standard Schedule (12 months)`, `prd.md > Medi-Cal New Adult Schedule (6 months from March 2027)`, `prd.md > Medi-Cal "Not Sure" Toggle`, `prd.md > Why This Date? Disclosures`, `prd.md > Always-Visible Lines`
  Spec ref: `spec.md > Page Shell (index.html)`, `spec.md > State and Wiring (js/main.js)`, `spec.md > Month Arithmetic (js/months.js)`, `spec.md > Rules (js/rules.js)`, `spec.md > Sources (js/sources.js)`, `spec.md > Renderer (js/render.js)`, `spec.md > Tests (test/)`
  Build: package.json (type module, test script), index.html with the five sections, minimal styles.css (layout and controls only, themes come later), months.js, sources.js from FACTS.md, rules.js with mediCalStandard, mediCalNewAdult, compute (Medi-Cal routes, shared cycle walker with counting forward and the 18-month window), render.js, main.js with progressive reveal and reset-below. Tests: months.test.js; rules.test.js for May 2026 Yes/No, January 2026 Yes, March 2026 Yes, Not sure returns both, every rule id exists in sources.
  Verify (mechanical): `npm test` passes; `python3 -m http.server 8080` serves the page; a headless check (curl of index.html plus a node script importing rules.js) confirms the demo case renders the six expected months and the banner names May 2027.
  Learner check: Start the server, open the page at phone width, do Medi-Cal, May 2026, Yes. Does the timeline read the way you pictured, and does the checklist question make sense to a 6th-grade reader?
  Commit: `feat: Medi-Cal renewal timeline with six-month rule and sources`

- [x] **2. CalFresh SAR 7 schedule and the different-schedule message**
  Becomes usable: Tap CalFresh, pick a month, answer the 60+/disabled question. No shows SAR 7 arrival, due (5th), late (11th), the last-chance sentence naming only the month, and the approximate recertification. Yes shows the C7 message only. Not sure shows the message above the standard timeline. Switching benefits resets everything below.
  Why now: Second schedule family exercises the shared walker with day-level dates and the approximate label, and completes both benefits before the calendar file needs them.
  PRD ref: `prd.md > CalFresh Standard Schedule (SAR 7 and recertification)`, `prd.md > CalFresh Different-Schedule Message (60+ or disabled)`, `prd.md > Benefit Picker`
  Spec ref: `spec.md > Rules (js/rules.js)`, `spec.md > Renderer (js/render.js)`, `spec.md > Tests (test/)`
  Build: calFreshStandard, calFreshDifferent, compute CalFresh routes, day-level entry rendering and the approximate label, C7 note rendering. Tests: October 2026 No, Yes, Not sure; benefit switch reset covered by a render-independent state test or manual check; no non-high rule leaks except C2 on the approximate entry and C7 on its message.
  Verify (mechanical): `npm test` passes including the CalFresh cases; node script confirms October 2026 No yields March 2027 arrival, April 5 2027 due, April 11 2027 late, "first working day of May 2027" text, recertification about October 2027.
  Learner check: Do CalFresh, October 2026, No, then switch to Yes and Not sure, then tap Medi-Cal and confirm everything below cleared.
  Commit: `feat: CalFresh SAR 7 timeline and 60+/disabled message`

- [x] **3. Past and future months handled honestly**
  Becomes usable: A future month shows "That month hasn't happened yet. Check the date on your letter." and nothing else. An old month counts forward with the plain note, applying 12-or-6 at each step. The current month computes normally. The results state the month counted as "this month".
  Why now: These are the edge states a real letter produces; they must be right before the calendar file freezes dates into reminders.
  PRD ref: `prd.md > Month Picker`, `prd.md > Counting Forward`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Rules (js/rules.js)` (counting forward and the window), `spec.md > Important Failure Modes`
  Build: futureMonth result and its message; countedForward flag set only when a renewal, SAR 7 due or recertification month was skipped; the note text; "this month" line. Tests: March 2024 Yes (March 2027, September 2027, March 2028, note set); CalFresh February 2026 No viewed October 2026 (starts at February 2027 recertification, note set); November 2025 Medi-Cal No (no note); future month; current month.
  Verify (mechanical): `npm test` passes with the new cases.
  Learner check: Try a 2024 month and a month after today; read both messages aloud for tone.
  Commit: `feat: future-month guard and counted-forward note`

- [x] **4. One-tap calendar file with validated reminders**
  Becomes usable: "Add these to my calendar" downloads renewal-radar.ics with every in-window event, 7-day alerts, and a 9 a.m. same-day alert on the SAR 7 due date. The file for Medi-Cal Not sure follows the toggle.
  Why now: The payoff behavior, and the spec's biggest unknown; the parse-back test is the agreed evidence since no phone is available.
  PRD ref: `prd.md > Calendar Reminder File`
  Spec ref: `spec.md > Calendar Builder (js/ics.js)`, `spec.md > Tests (test/)`, `spec.md > Decisions and Open Issues`
  Build: ics.js (VCALENDAR, VEVENT with VALUE=DATE, deterministic UID, DTSTAMP from a passed stamp, escaped DESCRIPTION, VALARMs, CRLF, 75-octet folding), download wiring in main.js, button rendering. Tests: ics.test.js parses the demo file back and checks every property listed in the spec; demo file holds nothing after April 2028; due-date event has two alarms.
  Verify (mechanical): `npm test` passes; a node script writes the demo .ics to the scratchpad and `grep -c $'\r$'` equals the line count; no line over 75 octets.
  Learner check: Tap the calendar button on the demo case and open the downloaded file in a text editor; confirm the events match the timeline.
  Commit: `feat: downloadable .ics reminders with RFC 5545 parse-back tests`

- [x] **5. Library-handout look, themes, font, README and license**
  Becomes usable: The page looks like the PRD describes: Atkinson Hyperlegible self-hosted with fallback, teal and amber tokens, light and dark themes, 48px controls, favicon, reduced-motion respect, noscript fallback. README explains run, test, sources, and what is not verified. LICENSE is AGPL-3.0-or-later, Techempower; fonts carry the OFL.
  Why now: Visual polish last so it styles finished behavior; the README's "not verified" line needs the final calendar behavior to describe.
  PRD ref: `prd.md > Look and Feel`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Styles (css/styles.css)`, `spec.md > Stack`, `spec.md > Important Failure Modes`, `spec.md > File Structure`
  Build: download the WOFF2 files and OFL text into fonts/, @font-face, full styles.css with custom properties for both themes, favicon.svg, noscript line, README.md, LICENSE.
  Verify (mechanical): `npm test` still passes; fonts load with HTTP 200 from the local server; CSS has no gradients or red tokens (grep); contrast of the main token pairs checked with a small node script against WCAG AA.
  Learner check: Open the page in light and dark, phone width. Does it feel like a calm library handout, not a government form or a startup app?
  Commit: `feat: themed library-handout styling, self-hosted font, README and AGPL license`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1 (Medi-Cal demo case). At the learner's request the agent stated what a person would see and continued; the hands-on review was folded into the final kick-the-tires session.
- [x] Final kick-the-tires exploration and feedback completed — learner reviewed with headless Playwright at 390 px, light and dark: looked right, no console errors; four changes requested and listed under Final Review.

## Final Review

- [x] One-line summary at the top of the results (rules.js `summary`, rendered first; tested for Medi-Cal 6-month, 12-month, CalFresh and counted-forward cases)
- [x] Footer: "reminder tool, not eligibility advice", TechEMPOWER line, link to `research/FACTS.md` (index.html, PRD updated)
- [x] Commit `skills-lock.json`; ignore `.agents/`, `.claude/`, `agent/`; README now names the skill pack and the lockfile
- [x] Review server rebound to 127.0.0.1:8080
- [x] Final review complete — feedback resolved; learner's review found no defects and directed the build to finish and stop (verified: `npm test` 27 pass; Playwright 390 px light and dark, no console errors, download produced renewal-radar.ics with 5 events)

## Code Tour and App Map

- [x] Learning activity complete — brief evidence-based recap (learner asked the build to finish and stop; no live exercise)
- [x] Optional edit and transfer reflection addressed — edit not applicable; one transfer question offered in the final report, answer optional
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Recap connected to the learner's goal ("see how much an interview-first plan changes a small build"). Evidence: the PRD's January 2026 example (`prd.md > Medi-Cal New Adult Schedule`) versus the spec's derived 18-month window rule; `test/rules.test.js` "M8: January 2026 New Adult stays yearly once" failed on first run, fixed in `mediCalSchedule` (js/rules.js), recorded under Revisions. Also: the interview decided the past-month, future-month and CalFresh Not-sure behaviours (`prd.md > Counting Forward`, `Month Picker`, `CalFresh Different-Schedule Message`) before any code, each now a test in `test/edges.test.js` and `test/calfresh.test.js`.
Route and stops: Reference route only, not toured: js/rules.js `nextNewAdult` + `SIX_MONTH_START`; js/render.js `whyThisDate` + js/sources.js; js/ics.js `buildIcs` + js/main.js `downloadIcs`.
Edit outcome: Not applicable (learner directed finish-and-stop).
Reflection: Offered once in the final report; not answered yet.
Activity mode: Recap with map; headless Playwright review at 390 px by the learner stood in for the hands-on checkpoint.

## Revisions

- New Adult timeline always includes the renewal after the first six-month renewal, even past the 18-month window — the PRD's January 2026 example (January 2027, January 2028, July 2028) showed the strict window would hide the very rhythm the heads-up announces. The calendar file keeps the strict 18-month window.
