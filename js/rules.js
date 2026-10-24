// Pure date rules. Every function takes the entered month and today's month
// as {year, month} and returns plain data. Nothing here touches the DOM or
// the clock. Every entry and note cites at least one rule id from sources.js.

import { addMonths, compare, format } from './months.js';

/** Six-month Medi-Cal renewals begin with renewals due in March 2027 (M7). */
export const SIX_MONTH_START = { year: 2027, month: 3 };

/** Timeline and calendar window, in months from today. */
export const WINDOW_MONTHS = 18;

function withinWindow(date, today) {
  return compare(date, addMonths(today, WINDOW_MONTHS)) <= 0;
}

function isPast(date, today) {
  return compare(date, today) < 0;
}

// ---------------------------------------------------------------- Medi-Cal

function nextStandard(renewal) {
  return addMonths(renewal, 12);
}

/** M5 to M9: +6 once the renewal is on or after March 2027, otherwise +12. */
function nextNewAdult(renewal) {
  return compare(renewal, SIX_MONTH_START) >= 0
    ? addMonths(renewal, 6)
    : addMonths(renewal, 12);
}

function mediCalSchedule(last, today, next, kind) {
  let renewal = next(last);
  let countedForward = false;
  while (isPast(renewal, today)) {
    renewal = next(renewal);
    countedForward = true;
  }

  const renewals = [];
  // A renewal is shown whole if its first entry (renewal starts, minus 2)
  // falls within the window.
  while (withinWindow(addMonths(renewal, -2), today)) {
    renewals.push(renewal);
    renewal = next(renewal);
  }
  // New Adult: always show the renewal after the first six-month renewal,
  // even past the window, so the rhythm the heads-up announces is visible.
  if (kind === 'medical-new-adult' && renewals.length) {
    const firstSixIdx = renewals.findIndex((r) => compare(r, SIX_MONTH_START) >= 0);
    if (firstSixIdx !== -1 && firstSixIdx === renewals.length - 1) {
      renewals.push(renewal);
    }
  }

  const entries = [];
  const renewalRule = kind === 'medical-new-adult' ? ['M5', 'M7'] : ['M1'];
  for (const r of renewals) {
    const starts = addMonths(r, -2);
    if (!isPast(starts, today)) {
      entries.push({
        date: starts,
        label: 'Your renewal starts. Watch your mail for a packet or a letter.',
        action: 'Open everything from the county. If they ask for information, send it back within 60 days.',
        ruleIds: ['M2', 'M3'],
        event: {
          title: `Medi-Cal renewal starts (${format(starts)}): watch your mail`,
          alarms: ['-P7D'],
        },
      });
    }
    entries.push({
      date: r,
      label: 'Your Medi-Cal renewal month.',
      action: "If you haven't heard from the county, call them.",
      ruleIds: renewalRule,
      event: {
        title: `Medi-Cal renewal month (${format(r)}): watch your mail`,
        alarms: ['-P7D'],
      },
    });
  }

  // M4: 90-day cure window, page text only, for the first renewal shown.
  if (renewals.length) {
    const first = renewals[0];
    const lastEntry = entries.find((e) => compare(e.date, first) === 0);
    lastEntry.note = {
      text: `If your coverage ends because something wasn't returned, you have 90 days to send it and get your coverage back. For a ${format(first)} renewal, that runs through ${format(addMonths(first, 3))}.`,
      ruleIds: ['M4'],
    };
  }

  let banner = null;
  if (kind === 'medical-new-adult') {
    const firstSix = renewals.find((r) => compare(r, SIX_MONTH_START) >= 0);
    if (firstSix) {
      banner = {
        text: `Heads up: starting with your ${format(firstSix)} renewal, Medi-Cal checks your coverage every 6 months instead of once a year. This is new in 2027.`,
        ruleIds: ['M5', 'M7'],
      };
    }
  }

  return { kind, entries, notes: [], banner, countedForward };
}

export function mediCalStandard(last, today) {
  return mediCalSchedule(last, today, nextStandard, 'medical-standard');
}

export function mediCalNewAdult(last, today) {
  return mediCalSchedule(last, today, nextNewAdult, 'medical-new-adult');
}

// ----------------------------------------------------------------- Routing

/**
 * @param {{benefit: 'medical'|'calfresh', last: {year, month}, answer: 'yes'|'no'|'unsure', today: {year, month}}} input
 */
export function compute({ benefit, last, answer, today }) {
  if (compare(last, today) > 0) {
    return { kind: 'future', futureMonth: true };
  }
  if (benefit === 'medical') {
    if (answer === 'yes') return mediCalNewAdult(last, today);
    if (answer === 'no') return mediCalStandard(last, today);
    return {
      kind: 'medical-unsure',
      newAdult: mediCalNewAdult(last, today),
      standard: mediCalStandard(last, today),
    };
  }
  throw new Error(`Unknown benefit: ${benefit}`);
}
