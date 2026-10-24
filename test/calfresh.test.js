import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../js/rules.js';
import { SOURCES } from '../js/sources.js';
import { formatDate } from '../js/months.js';

const OCT_2026 = { year: 2026, month: 10 };
const ym = (year, month) => ({ year, month });
const dates = (r) => r.entries.map((e) => formatDate(e.date));

test('CalFresh approved October 2026, standard (no)', () => {
  const r = compute({ benefit: 'calfresh', last: ym(2026, 10), answer: 'no', today: OCT_2026 });
  assert.equal(r.kind, 'calfresh-standard');
  assert.deepEqual(dates(r).slice(0, 5), ['March 2027', 'April 5, 2027', 'April 11, 2027', 'October 2027', 'March 2028']);
  const late = r.entries[2];
  assert.match(late.note.text, /first working day of May 2027/);
  assert.doesNotMatch(late.note.text, /May \d+, 2027/);
  const due = r.entries[1];
  assert.match(due.action, /Report what happened in March 2027/);
  assert.deepEqual(due.event.alarms, ['-P7D', 'PT9H']);
  const recert = r.entries[3];
  assert.equal(recert.approximate, true);
  assert.deepEqual(recert.ruleIds, ['C2']);
  assert.equal(r.countedForward, false);
  assert.equal(r.notes.length, 0);
});

test('CalFresh yes (60+ or disabled): message only, no dates', () => {
  const r = compute({ benefit: 'calfresh', last: ym(2026, 10), answer: 'yes', today: OCT_2026 });
  assert.equal(r.kind, 'calfresh-different');
  assert.equal(r.entries.length, 0);
  assert.equal(r.notes.length, 1);
  assert.deepEqual(r.notes[0].ruleIds, ['C7']);
  assert.match(r.notes[0].text, /60 or older/);
});

test('CalFresh not sure: C7 note on top of the standard schedule', () => {
  const r = compute({ benefit: 'calfresh', last: ym(2026, 10), answer: 'unsure', today: OCT_2026 });
  assert.equal(r.kind, 'calfresh-standard');
  assert.deepEqual(r.notes[0].ruleIds, ['C7']);
  assert.ok(r.entries.length > 0);
});

test('confidence leak check: only C2 on approximate entries and C7 on notes are below/at the exceptions', () => {
  for (const answer of ['no', 'unsure', 'yes']) {
    const r = compute({ benefit: 'calfresh', last: ym(2026, 10), answer, today: OCT_2026 });
    for (const e of r.entries) {
      for (const id of e.ruleIds) {
        assert.ok(SOURCES[id], `missing ${id}`);
        if (id === 'C2') assert.equal(e.approximate, true, 'C2 only on approximate entries');
        else assert.equal(SOURCES[id].confidence, 'high', `${id} not high`);
        assert.notEqual(id, 'C7', 'C7 never drives an entry');
      }
      if (e.note) for (const id of e.note.ruleIds) assert.equal(SOURCES[id].confidence, 'high');
      assert.equal(e.skippable, undefined);
    }
    for (const n of r.notes) for (const id of n.ruleIds) assert.ok(SOURCES[id]);
  }
});
