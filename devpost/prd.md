---
doc: prd
status: approved
created: 2026-10-23
---

# Renewal Radar — Product Requirements

One line: a one-page phone tool for TechEMPOWER help-desk clients that turns "which benefit, and the month on your last approval letter" into a dated timeline of Medi-Cal or CalFresh renewal and report windows, each tied to the official rule, with a one-tap calendar reminder file.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`, `scope.md > The Core Loop`.

Rules the app may state come only from the high-confidence rows of `research/FACTS.md` (M1–M9, C1, C3–C6, C7's "schedules differ"). C2 (CalFresh recertification is yearly) is medium-high and appears only as an approximate, labelled reminder.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. The person opens the page on their phone. They see the name, one sentence saying what it does, a line that nothing is stored or sent, and the first question: which benefit.
2. They tap Medi-Cal or CalFresh. The next part appears below: "The month on your last approval or renewal letter", two big drop-downs (month name, year) with a short hint.
3. They pick the month and year. The one situation question for that benefit appears (see **Situation Questions**), with Yes, No, and Not sure buttons.
4. They answer. The results appear below: a heads-up banner when it applies, a timeline of dated entries, each with a plain label, one line of what to do, and a "Why this date?" disclosure showing the letter and the quote.
5. They tap "Add these to my calendar" and get one .ics file with every event on the timeline, alerts set.
6. Every result ends with: "Your county notice is the final word. If anything here doesn't match your notice, trust the notice."
7. Earlier answers stay editable above. Changing the benefit resets everything below it; changing the month or the situation answer recomputes the results.

Demo moment: Medi-Cal, May 2026, Yes to the adult income question. The banner says that starting with the May 2027 renewal Medi-Cal checks every 6 months. The timeline reads: packet around March 2027, renewal month May 2027, packet around September 2027, renewal month November 2027, packet around March 2028, renewal month May 2028. One tap adds them to the calendar.

## Screens and Layout
Source: `scope.md > Who It's For`.

One scrolling page, phone-first. Sections stack top to bottom in journey order and reveal as answers arrive:

1. **Header**: name, one-line purpose, privacy line.
2. **Benefit picker**: two large buttons, Medi-Cal and CalFresh. One benefit at a time.
3. **Month picker**: label "The month on your last approval or renewal letter", month drop-down, year drop-down, hint text ("Look for the date your benefits were approved or renewed. If you have more than one letter, use the newest.").
4. **Situation question**: one question, three big buttons: Yes, No, Not sure.
5. **Results**: optional banner, optional schedule toggle (Medi-Cal "not sure" only), timeline entries, calendar button, final-word line, counted-forward note when it applies.

All tap targets are large enough for a thumb. No navigation, no second page, no modal dialogs. Disclosures ("Why this date?") expand in place.

## Look and Feel
Source: `scope.md > Inspiration & Identity`, learner's answers in this interview.

- **Mood**: calm, warm, trustworthy. Like a good library help-desk handout. Not a government form, not a startup app.
- **Type**: Atkinson Hyperlegible, built for low-vision readers. Generous size; plain language at about a 6th-grade reading level throughout.
- **Color**: deep teal as the main color. A warm amber highlight reserved for the "heads up" banner about six-month renewals. Light and dark themes following the phone's setting.
- **Avoid**: red alarm styling, emoji, gradients, and any agency logos or seals.
- Dates are written in words ("May 2027"; "August 5, 2026" only where a day is firm).

## Features and Behavior

### Benefit Picker
Source: `scope.md > The Core Loop`.
- Two buttons, Medi-Cal and CalFresh. Selecting one reveals the month picker.
- Switching benefits clears the month, the situation answer and the results.
  - [ ] Tapping Medi-Cal shows the month picker; tapping CalFresh afterwards clears any month and results already shown.

### Month Picker
- Month and year drop-downs. Year range: from 2020 to the current year (assumption, see **Product Decisions**).
- The current month is accepted. A month after the current month is not computed; the page shows "That month hasn't happened yet. Check the date on your letter." and no timeline.
  - [ ] Selecting a future month shows that message and no timeline, calendar button, or banner.
  - [ ] Selecting the current month computes normally.

### Situation Questions
Source: `research/FACTS.md > Encode in rules.js` items 2 and 4.
- **Medi-Cal**: "Are you 19 to 64, covered because of your income, and not pregnant, not within 12 months after a pregnancy, not American Indian or Alaska Native, and not on Medicare?" Shown as a short plain-language checklist (learner's choice), answered with a single Yes / No / Not sure.
- **CalFresh**: "Is anyone in your household 60 or older, or living with a disability?" Yes / No / Not sure.
  - [ ] Each benefit shows exactly one situation question with three buttons.

### Medi-Cal Standard Schedule (12 months)
Source: `scope.md > The POC Boundary`; rules M1–M4.
Applies when the Medi-Cal answer is No, and as the "If you're not" side of the toggle when the answer is Not sure.
- Renewal month = the entered month plus 12, repeated as needed (see **Counting Forward**).
- Timeline entries per renewal, in date order:
  - Renewal month minus 2: "Your renewal starts. Watch your mail for a packet or a letter." What to do: "Open everything from the county. If they ask for information, send it back within 60 days." Source M2, M3.
  - Renewal month: "Your Medi-Cal renewal month." What to do: "If you haven't heard from the county, call them." Source M1.
- Text under the timeline, not an event: "If your coverage ends because something wasn't returned, you have 90 days to send it and get your coverage back. For a [renewal month] renewal, that runs through [renewal month plus 3]." Source M4.
  - [ ] Medi-Cal, last renewal May 2026, answer No: timeline shows March 2027 (renewal starts) and May 2027 (renewal month), then March 2028 and May 2028 if within the 18-month window; cure text names August 2027.

### Medi-Cal New Adult Schedule (6 months from March 2027)
Source: `scope.md > The Unique Kernel`; rules M5–M9.
Applies when the Medi-Cal answer is Yes, and as the default side of the toggle when Not sure.
- Starting from the entered month, each next renewal is the previous renewal plus 6 months if that previous renewal is March 2027 or later, otherwise plus 12 months.
- The amber heads-up banner appears whenever the shown schedule includes a six-month step: "Heads up: starting with your [first six-month renewal] renewal, Medi-Cal checks your coverage every 6 months instead of once a year. This is new in 2027." Source M5, M7, with the "Why this date?" disclosure.
- Timeline entries are the same two per renewal as the standard schedule (renewal starts at minus 2, renewal month), using the six-month dates.
- The 90-day cure text applies the same way.
  - [ ] May 2026, Yes: renewals May 2027, November 2027, May 2028; renewal-starts entries March 2027, September 2027, March 2028; banner names May 2027.
  - [ ] January 2026, Yes: renewals January 2027 then January 2028 then July 2028 (January 2027 stays yearly once, M8).
  - [ ] March 2026, Yes: renewals March 2027, September 2027, March 2028.

### Medi-Cal "Not Sure" Toggle
- Two buttons at the top of the results: "If you're in the adult income group" and "If you're not". One schedule shows at a time. Default: the adult income (six-month) side.
- A line above the toggle: "Your county notice tells you which one applies to you."
- The calendar file contains the schedule currently shown.
  - [ ] Not sure shows the toggle, defaults to the six-month schedule, and switching sides changes the timeline and the calendar contents.

### CalFresh Standard Schedule (SAR 7 and recertification)
Source: `scope.md > The POC Boundary`; rules C1, C3–C6, and C2 as approximate.
Applies when the CalFresh answer is No, and with the C7 note on top when Not sure.
- Starting from the entered approval or recertification month, each 12-month cycle has a SAR 7 submit month at plus 6 and a recertification at plus 12; the next cycle counts from the recertification month.
- Timeline entries per cycle, in date order:
  - Submit month minus 1 (month plus 5): "Your SAR 7 report form should arrive in the mail." What to do: "Keep it somewhere you'll find it." Source C3.
  - Submit month, day 5: "Your SAR 7 is due." What to do: "Send it back by this day. Report what happened in [the month before the submit month]." Source C4, C6.
  - Submit month, day 11: "Last day before your SAR 7 is late." What to do: "After this day it counts as late. Send it anyway." Source C4.
  - Text under those entries, not an event: "The county will still take it until the first working day of [the month after], but your benefits may be late." Source C5.
  - Recertification month (plus 12): "Your CalFresh renewal is due about now." Labelled approximate: "Your notice gives the exact month." Source C2.
  - [ ] CalFresh, approved February 2026, answer No, viewed in October 2026: the August 2026 SAR 7 is in the past, so the timeline starts at the February 2027 recertification (approximate), then the SAR 7 form arriving July 2027, due August 5, 2027, late after August 11, 2027; the counted-forward note appears.
  - [ ] CalFresh, approved October 2026, answer No: SAR 7 form arrives March 2027, due April 5, 2027, late after April 11, 2027, last-chance text names May 2027; recertification about October 2027.

### CalFresh Different-Schedule Message (60+ or disabled)
Source: `scope.md > The POC Boundary`; rule C7.
- Answer Yes: no timeline, no calendar button. The page shows: "If anyone in your household is 60 or older or has a disability, your schedule may be different. Many of these households don't send a SAR 7 at 6 months. Check your newest notice or BenefitsCal, or call your county." Source C7 link.
- Answer Not sure: the standard schedule computes, with the same message shown as a note above the timeline.
  - [ ] Yes shows the message only; Not sure shows the message plus the standard timeline.

### Why This Date? Disclosures
Source: `scope.md > The Unique Kernel`.
- Every timeline entry and the banner have a "Why this date?" control that expands in place to show the letter name as a link (for example "DHCS letter ACWDL 26-14, page 3") and the short quote from `research/FACTS.md`.
- Nothing on the page states a date without one of these.
  - [ ] Every entry and the banner expand to a source link and a quote, and the link opens the official PDF.

### Counting Forward
- If the computed next date is already past, the app keeps applying the cycle rule until the first shown date is in the current month or later, and shows: "We counted forward from the month you entered. If you have not done a renewal since then, call your county now."
- The note does not appear when the first computed cycle is already ahead.
  - [ ] Medi-Cal, March 2024, Yes, viewed October 2026: March 2025 and March 2026 are skipped, March 2027 is the first renewal, then September 2027 and March 2028; the counted-forward note appears.

### Calendar Reminder File
Source: `scope.md > What "Working" Looks Like`.
- One button, "Add these to my calendar", downloads one .ics file holding every timeline event within the next 18 months from today.
- Month-level events (renewal starts, renewal month, SAR 7 form arrives, recertification) are all-day events on the 1st of that month, titled so the month is the point, for example "Medi-Cal renewal month (May 2027): watch your mail".
- SAR 7 due (5th) and late (11th) are all-day events on those days.
- Every event has an alert 7 days before. The SAR 7 due-date event also has an alert the morning of.
- Each event's description carries the what-to-do line, the source letter name, and the final-word sentence.
- The 90-day cure window and the last-chance date are page text only, not events.
  - [ ] The downloaded file opens in a phone calendar app and shows the same dates as the timeline, with the alerts above.
  - [ ] For the May 2026 demo case the file holds the events through April 2028 only (18 months from October 2026).

### Always-Visible Lines
- Header: "Nothing you enter is stored or sent anywhere. It stays on your phone."
- Under every result: "Your county notice is the final word. If anything here doesn't match your notice, trust the notice."
- Under every result: "Have recent proof of income and any changes in your household ready."
  - [ ] All three lines are present whenever results show.

## States and Boundaries

- **First open**: header and benefit picker only. Nothing else until a benefit is tapped.
- **Partial answers**: each section appears only after the one above is answered; the calendar button appears only with a timeline.
- **Future month**: the kind message, no timeline (see **Month Picker**).
- **Past month**: counted forward with the note (see **Counting Forward**).
- **CalFresh Yes**: message only, no dates (see **CalFresh Different-Schedule Message**).
- **Switching benefit**: everything below resets.
- **Nothing persists**: reloading the page starts over. No account, no saved results, nothing leaves the phone. The only thing the person keeps is the .ics file they downloaded.
- **Offline**: the page itself works without a network connection; the source links need one.

## Product Decisions
- One scrolling page with progressive reveal, earlier answers editable above: fewer places to get lost on a phone than a multi-step wizard.
- Two big drop-downs for month and year, labelled around the letter: the person is reading a letter they may not fully understand.
- Dates in words, a day only where a day is firm (SAR 7 due and late): matches how firm the rules actually are.
- "Why this date?" disclosure with letter link plus quote: trust without clutter.
- Medi-Cal Not sure shows one schedule at a time behind a toggle, default six-month: honest about uncertainty, readable on a phone, and the new rule is the one people are least likely to know.
- CalFresh Not sure computes the standard schedule with the C7 note; Yes computes nothing: a wrong date for an elderly or disabled household would do harm, a note for a standard household does none.
- Count forward for past months with a plain note; refuse future months kindly: past months are common (old letters), future months are almost always a misread.
- Keep C2 as an approximate, labelled recertification reminder with its source: useful, honest about its confidence.
- Calendar: one .ics, 18 months, 7-day alerts plus morning-of for the due date, all-day events on the 1st for month-level items; cure window and last-chance date stay as text: reminders should fire for things a person acts on, not for every fact.
- Feel: calm library handout, Atkinson Hyperlegible, deep teal with amber for the heads-up, light and dark, no red, emoji, gradients, logos or seals.
- Year drop-down covers 2020 through the current year (confirmed by the learner).
- "Ahead of today" for counting forward means the first shown date is in the current month or later (confirmed by the learner).

## What We're Building
Everything under **Features and Behavior**: benefit picker, month picker with the future-month message, one situation question per benefit, Medi-Cal standard and New Adult schedules with the toggle for Not sure, CalFresh standard schedule and the 60+/disabled message, Why-this-date disclosures on every date, counting forward with its note, the .ics download with alerts, the three always-visible lines, light and dark themes, phone-first layout.

## Deferred From the POC
Source: `scope.md > Later`.
- Spanish and other languages: the help desk serves them, but translation of rule text needs its own care.
- Program-specific "what to have ready" lists: DHCS's page cannot be read reliably yet; the generic line is safe.
- Combined Medi-Cal plus CalFresh timeline: one benefit at a time keeps the page readable; a merged view is a design task of its own.
- Printable handout version for volunteers.
- Public deployment: optional for the hackathon; the repo and demo video are the requirements.

## Possible Later Enhancements
- A "text me this link" or QR code for volunteers to hand the page to a client.
- Remembering the last entry on the phone only, with a clear "forget this" control.
- A volunteer mode that shows all schedules side by side.

## Non-Goals
Source: `scope.md > Explicitly Cut`.
- Eligibility, benefit amounts, work requirements, and consequences of late or incomplete forms beyond C4, C5 and M4: not sourced, and wrong answers hurt people.
- Exact Medi-Cal packet mail dates: the letters only support "about 2 months before".
- Schedules for elderly, disabled, or ESAP CalFresh households: low confidence on current ESAP rules; message only.
- CalFresh recertification interview timing: unsettled and not needed.
- Accounts, storage, notifications, or any server: the privacy promise is part of the product.
- Guessing the person's group: the app asks and defers to the notice.
- Any date the app cannot tie to a high-confidence row in `research/FACTS.md`.

## Open Questions
- Whether phone calendar apps honour the morning-of alert on an all-day event: verify in the build; the 7-day alert is the firm requirement.
