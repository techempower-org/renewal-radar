---
doc: scope
status: approved
created: 2026-10-23
---

# Renewal Radar

One line: tell it which benefit you have and when you were last approved, and it shows your next Medi-Cal or CalFresh renewal and report windows, with the official rule behind each date and a calendar reminder you can add in one tap.

## The Unique Kernel
Starting with renewals due in March 2027, Medi-Cal moves most working-age adults who qualify by income (the MAGI New Adult Group) from yearly to six-month renewals (DHCS ACWDL 26-14). Almost nobody affected knows their schedule changed. Renewal Radar is the only place a person can type "last renewed May 2026", tap "yes, adult covered because of my income", and see the new rhythm laid out: May 2027, then November 2027, then May 2028, packet around March 2027. Every date is tied to a quoted official rule, and the app computes nothing it cannot source.

## Who It's For
A TechEMPOWER help-desk client in Nevada County, California, alone on a small phone after a visit or from a link a volunteer handed them. They have Medi-Cal, CalFresh, or both. Today they find out about a renewal when a packet arrives in the mail, if it arrives, and if they open it in time. Many lose coverage without ever becoming ineligible. Volunteers will also use it beside a client, but the design target is one person, one phone, plain language at about a 6th-grade reading level, big tap targets, English for now.

## The Core Loop
Open the page. Pick a benefit. Enter the month you were last approved or renewed. Answer one or two yes/no/not-sure questions about your situation. See a timeline of your next windows: when the renewal or report starts, when things are due, when the last chance ends. Tap once to add those windows to your phone's calendar. Come back when a new approval letter arrives and do it again. Nothing is stored, sent, or signed into.

## Inspiration & Identity
Not yet discussed in detail. Volunteered direction: plain language, big tap targets, phone-first, trustworthy enough that a person believes a date and acts on it, with the county notice always named as the final word. `3-prd` fills in look and feel.

## Why This Matters to the Learner
TechEMPOWER runs a help desk for phone, internet and benefits paperwork, so these are the team's actual clients. The timing matters: the six-month change begins with March 2027 renewals, and the tool needs to exist before people start missing packets they did not expect. For the team, this is also a deliberate experiment: see how much an interview-first plan changes a small build compared with how they usually start.

## What "Working" Looks Like
On a phone, someone picks Medi-Cal, enters May 2026 as their last renewal, answers yes to "adult, covered because of your income", and the screen says: heads up, starting with your May 2027 renewal Medi-Cal checks every 6 months. Your renewals are May 2027, then November 2027, then May 2028, and your packet comes around March 2027. Each line shows the official source. One tap adds those reminders to their calendar. That timeline with the six-month change is the oh-that's-the-point beat. The same flow works for CalFresh, producing SAR 7 report windows with firm due dates. Demonstrable in under a minute on screen, which is what the required demo video needs.

## The POC Boundary
In, and only in:
- Medi-Cal on the standard 12-month cycle: next renewal, packet window (about 2 months before), 60 days to return information, and the 90-day cure window if coverage ends (M1–M4).
- Medi-Cal for the New Adult Group: six-month renewals starting with renewals due March 2027, with January and February 2027 renewals staying yearly one more time (M5–M9). "Not sure" shows both schedules, labelled.
- CalFresh standard households: SAR 7 submit month, when the form arrives, due on the 5th, late after the 11th, last chance the first working day of the next month (C1, C3–C6). Recertification shown as "about 12 months after approval, your notice gives the exact month" with its source, because C2 is medium-high confidence, not high.
- CalFresh households with anyone 60 or older or disabled: no computation, only the message that their schedule may differ and to check their notice or BenefitsCal (C7).
- Every result carries the official source for each rule and the line that the county notice is the final word.
- Downloadable calendar reminder for the windows shown.
- No account, no storage, nothing sent to a server. Runs on a phone browser.
- English only; roughly 6th-grade reading level; a generic "have recent proof of income and any household changes ready".

## Later
- Spanish and other languages the help desk serves.
- Program-specific "what to have ready" lists, once DHCS's page can be read reliably.
- Both benefits in one combined timeline for people who have Medi-Cal and CalFresh.
- Printable one-page version for volunteers to hand out.
- Deployment to a public URL (optional for the hackathon; the repo and demo video are the requirements).

## Explicitly Cut
- Anything about eligibility, benefit amounts, work requirements, or what happens with late or incomplete forms beyond C4, C5 and M4. Not sourced, and wrong answers here hurt people.
- Exact Medi-Cal packet mail dates. The letters only support "about 2 months before your renewal month".
- Schedules for elderly, disabled, or ESAP CalFresh households. The current ESAP rule is low confidence (ACL 22-15's waiver ran to 9/30/2026), so the app shows a message and computes nothing.
- CalFresh recertification interview timing. Not settled in the sources and not needed to prove the kernel.
- Accounts, saved results, notifications, or any server-side anything. The privacy promise is part of the product, and a static page is enough.
- Guessing the user's group from their answers. The app asks, labels "not sure", and defers to the notice.
