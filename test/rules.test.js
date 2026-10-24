import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, mediCalNewAdult, mediCalStandard } from '../js/rules.js';
import { SOURCES } from '../js/sources.js';
import { format } from '../js/months.js';

const OCT_2026 = { year: 2026, month: 10 };
const ym = (year, month) => ({ year, month });

function months(result) {
  return result.entries.map((e) => format(e.date));
}
function renewalMonths(result) {
  return result.entries.filter((e) => e.label.startsWith('Your Medi-Cal renewal month')).map((e) => format(e.date));
}

test('demo case: Medi-Cal May 2026, New Adult (yes)', () => {
  const r = compute({ benefit: 'medical', last: ym(2026, 5), answer: 'yes', today: OCT_2026 });
  assert.equal(r.kind, 'medical-new-adult');
  assert.deepEqual(months(r), ['March 2027', 'May 2027', 'September 2027', 'November 2027', 'March 2028', 'May 2028']);
  assert.match(r.banner.text, /starting with your May 2027 renewal/);
  assert.equal(r.countedForward, false);
  const renewal = r.entries.find((e) => format(e.date) === 'May 2027');
  assert.match(renewal.note.text, /runs through August 2027/);
});

test('Medi-Cal May 2026, standard (no)', () => {
  const r = compute({ benefit: 'medical', last: ym(2026, 5), answer: 'no', today: OCT_2026 });
  assert.equal(r.kind, 'medical-standard');
  assert.deepEqual(months(r), ['March 2027', 'May 2027', 'March 2028', 'May 2028']);
  assert.equal(r.banner, null);
  assert.match(r.entries[1].note.text, /runs through August 2027/);
});

test('M8: January 2026 New Adult stays yearly once, then six-monthly', () => {
  const r = mediCalNewAdult(ym(2026, 1), OCT_2026);
  assert.deepEqual(renewalMonths(r), ['January 2027', 'January 2028', 'July 2028']);
  assert.match(r.banner.text, /starting with your January 2028 renewal/);
});

test('M9 chart: March 2026 New Adult', () => {
  const r = mediCalNewAdult(ym(2026, 3), OCT_2026);
  assert.deepEqual(renewalMonths(r), ['March 2027', 'September 2027', 'March 2028']);
});

test('Not sure returns both schedules, labelled', () => {
  const r = compute({ benefit: 'medical', last: ym(2026, 5), answer: 'unsure', today: OCT_2026 });
  assert.equal(r.kind, 'medical-unsure');
  assert.equal(r.newAdult.kind, 'medical-new-adult');
  assert.equal(r.standard.kind, 'medical-standard');
  assert.deepEqual(renewalMonths(r.newAdult), ['May 2027', 'November 2027', 'May 2028']);
  assert.deepEqual(renewalMonths(r.standard), ['May 2027', 'May 2028']);
});

test('a renewal next month keeps its renewal entry but drops the past "starts" entry, no counted-forward note', () => {
  const r = mediCalStandard(ym(2025, 11), OCT_2026);
  assert.deepEqual(months(r), ['November 2026', 'September 2027', 'November 2027']);
  assert.equal(r.countedForward, false);
});

function allRuleIds(result) {
  const ids = [];
  const take = (r) => {
    for (const e of r.entries) { ids.push(...e.ruleIds); if (e.note) ids.push(...e.note.ruleIds); }
    for (const n of r.notes) ids.push(...n.ruleIds);
    if (r.banner) ids.push(...r.banner.ruleIds);
  };
  if (result.kind === 'medical-unsure') { take(result.newAdult); take(result.standard); } else take(result);
  return ids;
}

test('every cited rule exists in sources and is high confidence', () => {
  for (const answer of ['yes', 'no', 'unsure']) {
    const r = compute({ benefit: 'medical', last: ym(2026, 5), answer, today: OCT_2026 });
    for (const id of allRuleIds(r)) {
      assert.ok(SOURCES[id], `missing source ${id}`);
      assert.equal(SOURCES[id].confidence, 'high', `${id} is not high confidence`);
    }
  }
});

test('every entry has at least one rule id', () => {
  const r = compute({ benefit: 'medical', last: ym(2026, 5), answer: 'yes', today: OCT_2026 });
  for (const e of r.entries) assert.ok(e.ruleIds.length > 0);
});
