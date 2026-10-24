// Official sources for every rule the app may state.
// Copied from research/FACTS.md. Only rules with confidence "high" may drive
// a computed date; C2 appears only on the approximate recertification entry
// and C7 only on the different-schedule message.

const ACWDL_26_14 = {
  letter: 'DHCS letter ACWDL 26-14',
  url: 'https://www.dhcs.ca.gov/wp-content/uploads/2026/09/ACWDL-26-14.pdf',
};
const ACWDL_22_33 = {
  letter: 'DHCS letter ACWDL 22-33',
  url: 'https://www.dhcs.ca.gov/wp-content/uploads/2025/10/22-33.pdf',
};
const ACL_24_06 = {
  letter: 'CDSS letter ACL 24-06',
  url: 'https://cdss.ca.gov/Portals/9/Additional-Resources/Letters-and-Notices/ACLs/2024/24-06.pdf',
};
const ACL_22_15 = {
  letter: 'CDSS letter ACL 22-15',
  url: 'https://cdss.ca.gov/Portals/9/Additional-Resources/Letters-and-Notices/ACLs/2022/22-15.pdf',
};

export const SOURCES = {
  M1: { ...ACWDL_26_14, page: 'page 2', confidence: 'high',
    rule: 'Most members renew every 12 months',
    quote: 'most Medi-Cal members receive annual renewals every twelve (12) months' },
  M2: { ...ACWDL_26_14, page: 'page 3', confidence: 'high',
    rule: 'The renewal is initiated 2 months before the renewal month',
    quote: 'a renewal is considered initiated two months before the renewal month' },
  M3: { ...ACWDL_26_14, page: 'page 3', confidence: 'high',
    rule: '60 days to send back requested information',
    quote: 'the 60-day period for members to submit required information' },
  M4: { ...ACWDL_22_33, page: 'page 16 (and ACWDL 26-14, page 4 chart)', confidence: 'high',
    rule: 'If coverage ends for not returning information, there are 90 days to send it and get coverage back',
    quote: 'entitled to a 90-Day Cure Period if they are discontinued' },
  M5: { ...ACWDL_26_14, page: 'pages 1 to 2', confidence: 'high',
    rule: 'From 2027, adults in the MAGI New Adult Group renew every 6 months',
    quote: 'redeterminations for this population every six months beginning January 1, 2027' },
  M6: { ...ACWDL_26_14, page: 'page 2', confidence: 'high',
    rule: 'Children, non-MAGI adults, pregnant and postpartum, American Indian/Alaska Native and protected groups stay on 12 months',
    quote: 'All other populations including children, Non-MAGI adults, pregnant individuals' },
  M7: { ...ACWDL_26_14, page: 'page 3', confidence: 'high',
    rule: 'The first six-month cycles start with March 2027 renewals',
    quote: 'starting with renewals due in March 2027' },
  M8: { ...ACWDL_26_14, page: 'page 3', confidence: 'high',
    rule: 'January and February 2027 renewals stay 12 months once more',
    quote: 'must not transition to the six-month renewal cycle at that time' },
  M9: { ...ACWDL_26_14, page: 'page 4 chart', confidence: 'high',
    rule: 'March 2027 renewal, then September 2027, then March 2028, and so on',
    quote: 'This chart supersedes the chart in ACWDL 25-31, page 19.' },

  C1: { ...ACL_24_06, page: 'page 3', confidence: 'high',
    rule: 'Most households send a SAR 7 six months after approval and after each recertification',
    quote: 'submit a periodic report six months after their initial certification' },
  C2: { ...ACL_24_06, page: 'SAR 7A, page 1', confidence: 'med-high',
    rule: 'SAR 7 is due at the 6th or 12th month after application or annual renewal',
    quote: 'due at the 6th or 12th month after your application/annual renewal' },
  C3: { ...ACL_24_06, page: 'page 7', confidence: 'high',
    rule: 'The prepopulated SAR 7 arrives by mail in the 5th month',
    quote: 'receive their prepopulated SAR 7 via mail on the 5th month' },
  C4: { ...ACL_24_06, page: 'SAR 7A', confidence: 'high',
    rule: 'Due by the 5th of the submit month; late after the 11th',
    quote: 'Your completed SAR 7 is due on the 5th day' },
  C5: { ...ACL_24_06, page: 'SAR 7A', confidence: 'high',
    rule: 'Accepted until the first working day after the submit month; benefits may be late',
    quote: 'until the first working day following your submit month' },
  C6: { ...ACL_24_06, page: 'SAR 7A', confidence: 'high',
    rule: 'Report information from the month before the submit month',
    quote: 'The month before the submit month.' },
  C7: { ...ACL_24_06, page: 'page 3 (and ACL 22-15)', confidence: 'high',
    rule: 'Elderly and/or disabled households often skip the 6-month SAR 7; schedules differ',
    quote: 'a SAR 7 is not required six months after certification',
    also: ACL_22_15 },
};

export const FINAL_WORD =
  "Your county notice is the final word. If anything here doesn't match your notice, trust the notice.";
export const HAVE_READY =
  'Have recent proof of income and any changes in your household ready.';
export const PRIVACY =
  "Nothing you enter is stored or sent anywhere. It stays on your phone.";
