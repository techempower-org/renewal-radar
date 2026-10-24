# FACTS.md: date rules Renewal Radar may state

Researched by the TechEMPOWER team on 2026-10-23. Sources are official DHCS / CDSS letters, downloaded and read as text. Quotes are verbatim and under 15 words.

## Medi-Cal (DHCS)

| # | Rule | Value | Source | Quote | Conf. |
|---|---|---|---|---|---|
| M1 | Default cycle | Most members renew every 12 months | [ACWDL 26-14](https://www.dhcs.ca.gov/wp-content/uploads/2026/09/ACWDL-26-14.pdf), p.2 | "most Medi-Cal members receive annual renewals every twelve (12) months" | high |
| M2 | Renewal starts early | The renewal is initiated 2 months before the renewal month (ex parte review, then the packet) | ACWDL 26-14, p.3 | "a renewal is considered initiated two months before the renewal month" | high |
| M3 | Time to return | 60 days to send back requested information | ACWDL 26-14, p.3 | "the 60-day period for members to submit required information" | high |
| M4 | 90-day cure | If coverage ends for not returning information, there are 90 days to send it and get coverage back | [ACWDL 22-33](https://www.dhcs.ca.gov/wp-content/uploads/2025/10/22-33.pdf), p.16; ACWDL 26-14, p.4 chart (March renewal → cure ends June) | "entitled to a 90-Day Cure Period if they are discontinued" | high |
| M5 | Six-month renewals | From 2027, adults in the MAGI New Adult Group renew every 6 months | ACWDL 26-14, p.1–2 | "redeterminations for this population every six months beginning January 1, 2027" | high |
| M6 | Who is NOT moved | Children, non-MAGI adults, pregnant and 12-month postpartum, American Indian/Alaska Native, and protected groups stay on 12 months | ACWDL 26-14, p.2 | "All other populations including children, Non-MAGI adults, pregnant individuals" | high |
| M7 | Transition timing | Moved at the next renewal initiated on/after 1/1/2027, so the **first six-month cycles start with March 2027 renewals** | ACWDL 26-14, p.3 | "starting with renewals due in March 2027" | high |
| M8 | Jan/Feb 2027 renewals | Stay 12 months once more (to Jan/Feb 2028), then go six-monthly | ACWDL 26-14, p.3 | "must not transition to the six-month renewal cycle at that time" | high |
| M9 | Transition chart | March 2027 renewal → 1st 6MR Sept 2027 → 2nd March 2028 (and so on for each month) | ACWDL 26-14, p.4 chart | "This chart supersedes the chart in ACWDL 25-31, page 19." | high |

## CalFresh (CDSS)

| # | Rule | Value | Source | Quote | Conf. |
|---|---|---|---|---|---|
| C1 | Semiannual report | Most households send a SAR 7 six months after approval and six months after each recertification | [ACL 24-06](https://cdss.ca.gov/Portals/9/Additional-Resources/Letters-and-Notices/ACLs/2024/24-06.pdf), p.3 | "submit a periodic report six months after their initial certification" | high |
| C2 | Annual renewal | SAR 7 is due at the 6th or 12th month after application or annual renewal (so the renewal is yearly) | ACL 24-06, SAR 7A p.1 | "due at the 6th or 12th month after your application/annual renewal" | med-high |
| C3 | When the form arrives | The prepopulated SAR 7 arrives by mail in the 5th month | ACL 24-06, p.7 | "receive their prepopulated SAR 7 via mail on the 5th month" | high |
| C4 | Due date | Due by the 5th of the submit month; late after the 11th | ACL 24-06, SAR 7A | "Your completed SAR 7 is due on the 5th day" | high |
| C5 | Last chance | Accepted until the first working day after the submit month (benefits may be late) | ACL 24-06, SAR 7A | "until the first working day following your submit month" | high |
| C6 | Data month | Report information from the month before the submit month | ACL 24-06, SAR 7A | "The month before the submit month." | high |
| C7 | Different schedules | Elderly and/or disabled households often skip the 6-month SAR 7; some get it at 12 months; ESAP households have 36-month periods | ACL 24-06, p.3; [ACL 22-15](https://cdss.ca.gov/Portals/9/Additional-Resources/Letters-and-Notices/ACLs/2022/22-15.pdf) | "a SAR 7 is not required six months after certification" | high (that they differ); **low** (exact current ESAP status: ACL 22-15's waiver ran to 9/30/2026) |

## What the app must NOT claim

- That it knows the user's group or dates. **The county notice is the final word.** Say so on every result.
- Exact packet mail dates for Medi-Cal: only "the renewal starts about 2 months before your renewal month."
- Any schedule for elderly/disabled or ESAP CalFresh households (C7). Show "Your schedule may be different. Check your notice or BenefitsCal" and compute nothing.
- Anything about eligibility, amounts, work requirements, or what happens with late or incomplete forms beyond C4/C5 and M4.

## Encode in rules.js (only these)

1. **Medi-Cal, 12-month (M1):** next renewal = last renewal/approval month + 12. Packet window opens = renewal month − 2 (M2). Return within 60 days of the packet (M3). If coverage ends: cure window = renewal month + 3 (M4 chart).
2. **Medi-Cal, New Adult (M5–M9):** ask "Are you 19–64, covered because of your income, and not pregnant, postpartum, American Indian/Alaska Native, or on Medicare?" Yes → for each renewal R: next = R + 6 if R ≥ March 2027, else R + 12. (Check: Jan 2027 → Jan 2028 → Jul 2028; Mar 2027 → Sep 2027 → Mar 2028.) "Not sure" → show both schedules, labelled.
3. **CalFresh, standard household (C1–C6):** SAR 7 submit month = approval/recert month + 6; the form arrives in month + 5; due on the 5th of the submit month, late after the 11th, last chance the first working day of the next month. Recertification = approval/recert month + 12.
4. **CalFresh, everyone 60+ or disabled:** no computation; show the C7 message.

Not settled, and not needed for the PoC: CalFresh recertification interview timing, Medi-Cal "what to have ready" specifics (DHCS's Keep Your Medi-Cal page blocks scripted fetches, Incapsula). Use the generic "have recent proof of income and any changes in your household ready", which is safe and true of both programs' forms.
