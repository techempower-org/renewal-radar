// Month arithmetic over plain {year, month} objects (month is 1..12).
// No Date objects, so no time zones can shift a month boundary.

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function ym(year, month) {
  return { year, month };
}

function index({ year, month }) {
  return year * 12 + (month - 1);
}

export function addMonths(a, n) {
  const i = index(a) + n;
  return { year: Math.floor(i / 12), month: (i % 12) + 1 };
}

/** Positive when a is after b, zero when the same month, negative when before. */
export function compare(a, b) {
  return index(a) - index(b);
}

export function isOnOrAfter(a, b) {
  return compare(a, b) >= 0;
}

/** Months from b to a (a minus b). */
export function diffMonths(a, b) {
  return compare(a, b);
}

/** "May 2027" */
export function format({ year, month }) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** "August 5, 2027" */
export function formatDay({ year, month, day }) {
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

/** Either form, depending on whether the date carries a day. */
export function formatDate(d) {
  return d.day ? formatDay(d) : format(d);
}

/** "20270801" for iCalendar DATE values; day defaults to the 1st. */
export function toDate8({ year, month, day = 1 }) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}${mm}${dd}`;
}
