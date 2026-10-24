import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, compare, format, formatDay, toDate8, diffMonths } from '../js/months.js';

test('addMonths crosses year boundaries both ways', () => {
  assert.deepEqual(addMonths({ year: 2026, month: 5 }, 12), { year: 2027, month: 5 });
  assert.deepEqual(addMonths({ year: 2027, month: 11 }, 6), { year: 2028, month: 5 });
  assert.deepEqual(addMonths({ year: 2027, month: 1 }, -2), { year: 2026, month: 11 });
  assert.deepEqual(addMonths({ year: 2026, month: 12 }, 1), { year: 2027, month: 1 });
});

test('compare and diffMonths', () => {
  assert.ok(compare({ year: 2027, month: 3 }, { year: 2027, month: 2 }) > 0);
  assert.equal(compare({ year: 2027, month: 3 }, { year: 2027, month: 3 }), 0);
  assert.equal(diffMonths({ year: 2028, month: 4 }, { year: 2026, month: 10 }), 18);
});

test('formatting', () => {
  assert.equal(format({ year: 2027, month: 5 }), 'May 2027');
  assert.equal(formatDay({ year: 2027, month: 8, day: 5 }), 'August 5, 2027');
  assert.equal(toDate8({ year: 2027, month: 3 }), '20270301');
  assert.equal(toDate8({ year: 2027, month: 8, day: 11 }), '20270811');
});
