// Builds an iCalendar (RFC 5545) file from timeline entries. Conservative
// subset: all-day VALUE=DATE events, relative TRIGGERs, CRLF line endings,
// lines folded at 75 octets. Pure: the stamp is passed in, never read from
// the clock, so tests are deterministic.

import { addMonths, compare, toDate8 } from './months.js';
import { SOURCES, FINAL_WORD } from './sources.js';
import { WINDOW_MONTHS } from './rules.js';

const CRLF = '\r\n';

/** Escape text per RFC 5545 section 3.3.11. */
export function escapeText(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Fold a content line at 75 octets (UTF-8), continuation lines start with a space. */
export function foldLine(line) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const bytes = enc.encode(line);
  if (bytes.length <= 75) return line;
  const parts = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Do not split inside a multi-byte UTF-8 sequence.
    while (end < bytes.length && end > start && (bytes[end] & 0xc0) === 0x80) end--;
    parts.push(dec.decode(bytes.slice(start, end)));
    start = end;
    limit = 74; // continuation lines carry a leading space
  }
  return parts.join(CRLF + ' ');
}

function nextDay({ year, month, day = 1 }) {
  // Day after an all-day event. Month-level events sit on the 1st, so the
  // next day is the 2nd; day-level events (5th, 11th) never cross a month.
  return { year, month, day: day + 1 };
}

function uid(benefit, entry) {
  const kind = entry.event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `${benefit}-${kind}-${toDate8(entry.date)}@renewal-radar`;
}

function alarm(trigger, description) {
  return [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `TRIGGER:${trigger}`,
    `DESCRIPTION:${escapeText(description)}`,
    'END:VALARM',
  ];
}

/**
 * @param {Array} entries  timeline entries from rules.js
 * @param {{year, month}} today
 * @param {{benefit: string, stamp: string}} opts  stamp is a UTC DATE-TIME like 20261023T220000Z
 * @returns {string} iCalendar text with CRLF line endings
 */
export function buildIcs(entries, today, { benefit, stamp }) {
  const limit = addMonths(today, WINDOW_MONTHS);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Techempower//Renewal Radar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Renewal Radar reminders',
  ];

  for (const e of entries) {
    if (!e.event) continue;
    if (compare(e.date, limit) > 0) continue;
    const letters = [...new Set(e.ruleIds.map((id) => SOURCES[id]?.letter).filter(Boolean))].join('; ');
    const description = `${e.action}\nSource: ${letters}.\n${FINAL_WORD}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid(benefit, e)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${toDate8(e.date)}`,
      `DTEND;VALUE=DATE:${toDate8(nextDay(e.date))}`,
      `SUMMARY:${escapeText(e.event.title)}`,
      `DESCRIPTION:${escapeText(description)}`,
      'TRANSP:TRANSPARENT',
    );
    for (const t of e.event.alarms) lines.push(...alarm(t, e.event.title));
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join(CRLF) + CRLF;
}

/** UTC stamp for DTSTAMP from a Date. */
export function stampFromDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}
