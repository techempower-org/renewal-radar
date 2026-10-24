import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, mediCalStandard } from '../js/rules.js';
import { formatDate } from '../js/months.js';

const OCT_2026 = { year: 2026, month: 10 };
const ym = (year, month) => ({ year, month });
const dates = (r) => r.entries.map((e) => formatDate(e.date));
const renewals = (r) => r.entries.filter((e) => e.label.startsWith('Your Medi-Cal renewal month')).map((e) => formatDate(e.date));

test('future month is refused, nothing computed', () => {
  const r = compute({ benefit: 'medical', last: ym(2026, 11), answer: 'yes', today: OCT_2026 });
  assert.equal(r.kind, 'future');
  assert.equal(r.futureMonth, true);
  assert.equal(r.entries, undefined);
  const c = compute({ benefit: 'calfresh', last: ym(2027, 1), answer: 'no', today: OCT_2026 });
  assert.equal(c.kind, 'future');
});

test('current month computes normally', () => {
  const r = compute({ benefit: 'medical', last: OCT_2026, answer: 'no', today: OCT_2026 });
  assert.equal(r.kind, 'medical-standard');
  assert.deepEqual(dates(r), ['August 2027', 'October 2027']);
  assert.equal(r.countedForward, false);
});

test('counting forward: Medi-Cal March 2024, New Adult, viewed October 2026', () => {
  const r = compute({ benefit: 'medical', last: ym(2024, 3), answer: 'yes', today: OCT_2026 });
  assert.deepEqual(renewals(r), ['March 2027', 'September 2027', 'March 2028']);
  assert.equal(r.countedForward, true);
  assert.match(r.banner.text, /starting with your March 2027 renewal/);
});

test('counting forward: CalFresh February 2026, viewed October 2026', () => {
  const r = compute({ benefit: 'calfresh', last: ym(2026, 2), answer: 'no', today: OCT_2026 });
  assert.deepEqual(dates(r).slice(0, 4), ['February 2027', 'July 2027', 'August 5, 2027', 'August 11, 2027']);
  assert.equal(r.entries[0].approximate, true);
  assert.equal(r.countedForward, true);
});

test('a renewal next month does not trigger the counted-forward note', () => {
  const r = mediCalStandard(ym(2025, 11), OCT_2026);
  assert.equal(r.countedForward, false);
  assert.equal(dates(r)[0], 'November 2026');
});

test('counting forward applies 12-or-6 at each skipped step', () => {
  // Jan 2025 New Adult: Jan 2026 (skipped), Jan 2027 (ahead; < March 2027 so +12), Jan 2028, Jul 2028
  const r = compute({ benefit: 'medical', last: ym(2025, 1), answer: 'yes', today: OCT_2026 });
  assert.deepEqual(renewals(r), ['January 2027', 'January 2028', 'July 2028']);
  assert.equal(r.countedForward, true);
});

test('summary lines', () => {
  const s = (benefit, last, answer) => compute({ benefit, last, answer, today: OCT_2026 }).summary;
  assert.equal(s('medical', ym(2026, 5), 'yes'), 'Next: Medi-Cal renewal in May 2027, then every 6 months.');
  assert.equal(s('medical', ym(2026, 1), 'yes'), 'Next: Medi-Cal renewal in January 2027, then every 6 months starting January 2028.');
  assert.equal(s('medical', ym(2026, 5), 'no'), 'Next: Medi-Cal renewal in May 2027, then once a year.');
  assert.equal(s('calfresh', ym(2026, 10), 'no'), 'Next: CalFresh SAR 7 report due April 5, 2027, then a renewal about October 2027.');
  assert.equal(s('calfresh', ym(2026, 2), 'no'), 'Next: CalFresh renewal about February 2027, then a SAR 7 report due August 5, 2027.');
  assert.equal(s('calfresh', ym(2026, 10), 'yes'), null);
  const unsure = compute({ benefit: 'medical', last: ym(2026, 5), answer: 'unsure', today: OCT_2026 });
  assert.match(unsure.newAdult.summary, /every 6 months/);
  assert.match(unsure.standard.summary, /once a year/);
});
