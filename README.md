# Renewal Radar

See when your next Medi-Cal or CalFresh renewal and report dates are coming, and why.

People in California lose Medi-Cal and CalFresh not because they stop qualifying but because they miss a renewal packet or a semiannual report. Starting with renewals due in March 2027, Medi-Cal moves most working-age adults who qualify by income (the MAGI New Adult Group) from yearly to six-month renewals (DHCS letter ACWDL 26-14), and most people won't know their schedule changed.

Renewal Radar is a one-page tool for a phone. Pick your benefit, enter the month on your last approval or renewal letter, answer one question, and it shows your next renewal or report windows with dates, what to have ready, the official source behind every date, and a calendar file you can add in one tap.

**Nothing you enter is stored or sent anywhere.** There is no account, no server, no analytics. Everything runs in your browser.

Built by [TechEMPOWER](https://techempower.org), a small Grass Valley, California nonprofit that helps people get and use technology, for the Devpost **Build With AI: Basics** hackathon.

## Try it

The page is plain HTML, CSS and JavaScript modules with no build step. Module scripts need an HTTP origin, so serve the folder rather than opening the file directly:

```
python3 -m http.server 8080
```

Then open <http://localhost:8080/>. Any static file server works.

Demo case: **Medi-Cal → May 2026 → Yes**. You should see a heads-up that six-month renewals start with the May 2027 renewal, then March 2027, May 2027, September 2027, November 2027, March 2028, May 2028, each with a "Why this date?" link to the official letter.

## Tests

```
npm test
```

Runs Node's built-in test runner (Node 22, no dependencies) over the date rules and the calendar builder. Every example in `devpost/prd.md` is a test case, and the generated `.ics` file is parsed back and checked line by line against RFC 5545.

## Where the rules come from

Every date the app shows traces to a row in [`research/FACTS.md`](research/FACTS.md): official DHCS and CDSS letters, with page, verbatim quote and a confidence rating. Only high-confidence rules drive a computed date. The one medium-high rule (CalFresh recertification is yearly) appears only as an approximate, labelled reminder. The same table is in [`js/sources.js`](js/sources.js), and a test checks nothing else leaks in.

The app does not know your group or your dates. **Your county notice is the final word**, and the page says so under every result.

What the app deliberately does not do: eligibility, benefit amounts, work requirements, exact packet mail dates, or schedules for elderly, disabled or ESAP CalFresh households (it shows a message and computes nothing).

## Not verified

- **Phone calendar import.** The `.ics` file uses a conservative RFC 5545 subset (all-day `VALUE=DATE` events, relative `TRIGGER`s, CRLF, 75-octet folding) and is validated by parse-back in the tests, but it has not yet been opened on a real iPhone or Android phone. The 7-day reminder is the firm requirement; the 9 a.m. same-day reminder on the SAR 7 due date is best effort.
- **Holidays.** The CalFresh "last chance" sentence names only the month ("the first working day of May 2027") because the letters give no holiday list.

## Layout

```
index.html        page shell
css/styles.css    light and dark themes, Atkinson Hyperlegible
js/rules.js       pure date rules; every entry cites a rule id
js/sources.js     rule id → letter, link, page, quote, confidence
js/months.js      {year, month} arithmetic
js/render.js      DOM rendering
js/ics.js         iCalendar builder
test/             node --test
research/         FACTS.md, the sourced rules
devpost/          planning docs from the hackathon curriculum
```

## Hackathon curriculum

The planning documents in `devpost/` were produced with the Devpost Learn **Build With AI: Basics** skill pack from [github.com/challengepost/learn-ai-basics](https://github.com/challengepost/learn-ai-basics). `skills-lock.json` records the exact skill versions used; the skill folders themselves are not committed.

## License

Copyright (C) 2026 Techempower. Licensed under the GNU Affero General Public License, version 3 or later; see [LICENSE](LICENSE).

The Atkinson Hyperlegible font (Braille Institute of America) is under the SIL Open Font License 1.1; see [fonts/LICENSE.txt](fonts/LICENSE.txt).
