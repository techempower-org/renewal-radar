import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute } from '../js/rules.js';
import { buildIcs, escapeText, foldLine } from '../js/ics.js';
import { toDate8, addMonths, compare } from '../js/months.js';

const OCT_2026 = { year: 2026, month: 10 };
const STAMP = '20261023T220000Z';
const ym = (year, month) => ({ year, month });

/** Minimal RFC 5545 parser for tests: unfold, then split into components. */
function parse(ics) {
  assert.ok(ics.endsWith('\r\n'), 'file ends with CRLF');
  const raw = ics.split('\r\n');
  raw.pop(); // trailing empty after final CRLF
  for (const l of raw) {
    assert.ok(!l.includes('\n') && !l.includes('\r'), 'no bare LF/CR inside lines');
    assert.ok(Buffer.byteLength(l, 'utf8') <= 75, `line over 75 octets: ${l}`);
  }
  const unfolded = [];
  for (const l of raw) {
    if (l.startsWith(' ') || l.startsWith('\t')) unfolded[unfolded.length - 1] += l.slice(1);
    else unfolded.push(l);
  }
  const root = { name: 'ROOT', props: [], children: [] };
  const stack = [root];
  for (const l of unfolded) {
    if (l.startsWith('BEGIN:')) {
      const c = { name: l.slice(6), props: [], children: [] };
      stack[stack.length - 1].children.push(c);
      stack.push(c);
    } else if (l.startsWith('END:')) {
      assert.equal(stack[stack.length - 1].name, l.slice(4), 'balanced BEGIN/END');
      stack.pop();
    } else {
      const i = l.indexOf(':');
      assert.ok(i > 0, `property line has a colon: ${l}`);
      const [name, ...params] = l.slice(0, i).split(';');
      stack[stack.length - 1].props.push({ name, params, value: l.slice(i + 1) });
    }
  }
  assert.equal(stack.length, 1, 'all components closed');
  return root.children[0];
}
const prop = (c, name) => c.props.find((p) => p.name === name);

function demoFile() {
  const r = compute({ benefit: 'medical', last: ym(2026, 5), answer: 'yes', today: OCT_2026 });
  return { r, ics: buildIcs(r.entries, OCT_2026, { benefit: 'medical', stamp: STAMP }) };
}

test('escapeText and foldLine', () => {
  assert.equal(escapeText('a,b;c\\d\ne'), 'a\\,b\;c\\\\d\\ne');
  const long = 'DESCRIPTION:' + 'x'.repeat(200);
  const folded = foldLine(long);
  for (const l of folded.split('\r\n')) assert.ok(Buffer.byteLength(l) <= 75);
  assert.equal(folded.split('\r\n').map((l, i) => (i ? l.slice(1) : l)).join(''), long);
  const utf = 'SUMMARY:' + '“é”'.repeat(40);
  const f2 = foldLine(utf);
  assert.equal(f2.split('\r\n').map((l, i) => (i ? l.slice(1) : l)).join(''), utf);
});

test('demo file is well formed and matches the timeline', () => {
  const { r, ics } = demoFile();
  const cal = parse(ics);
  assert.equal(cal.name, 'VCALENDAR');
  assert.equal(prop(cal, 'VERSION').value, '2.0');
  assert.ok(prop(cal, 'PRODID'));
  const events = cal.children.filter((c) => c.name === 'VEVENT');
  assert.ok(events.length > 0);

  const limit = addMonths(OCT_2026, 18);
  const expected = r.entries.filter((e) => e.event && compare(e.date, limit) <= 0).map((e) => toDate8(e.date)).sort();
  const actual = events.map((ev) => prop(ev, 'DTSTART').value).sort();
  assert.deepEqual(actual, expected);

  for (const ev of events) {
    for (const name of ['UID', 'DTSTAMP', 'DTSTART', 'DTEND', 'SUMMARY', 'DESCRIPTION']) assert.ok(prop(ev, name), `${name} present`);
    assert.deepEqual(prop(ev, 'DTSTART').params, ['VALUE=DATE']);
    assert.match(prop(ev, 'DTSTART').value, /^\d{8}$/);
    assert.match(prop(ev, 'DTEND').value, /^\d{8}$/);
    assert.equal(prop(ev, 'DTSTAMP').value, STAMP);
    const alarms = ev.children.filter((c) => c.name === 'VALARM');
    assert.ok(alarms.length >= 1);
    for (const a of alarms) {
      assert.equal(prop(a, 'ACTION').value, 'DISPLAY');
      assert.ok(prop(a, 'TRIGGER'));
      assert.ok(prop(a, 'DESCRIPTION'));
    }
    assert.ok(alarms.some((a) => prop(a, 'TRIGGER').value === '-P7D'), '7-day alarm present');
    assert.match(prop(ev, 'DESCRIPTION').value, /county notice is the final word/);
  }
  const uids = events.map((ev) => prop(ev, 'UID').value);
  assert.equal(new Set(uids).size, uids.length, 'UIDs unique');
});

test('demo file holds nothing after April 2028', () => {
  const { ics } = demoFile();
  const events = parse(ics).children.filter((c) => c.name === 'VEVENT');
  const starts = events.map((ev) => prop(ev, 'DTSTART').value);
  assert.ok(starts.every((d) => d <= '20280430'), starts.join(','));
  assert.ok(starts.includes('20280301'), 'March 2028 renewal starts is in');
  assert.ok(!starts.includes('20280501'), 'May 2028 renewal month is out');
});

test('SAR 7 due date has the 7-day and the 9 a.m. same-day alarms; month-level events are on the 1st', () => {
  const r = compute({ benefit: 'calfresh', last: ym(2026, 10), answer: 'no', today: OCT_2026 });
  const cal = parse(buildIcs(r.entries, OCT_2026, { benefit: 'calfresh', stamp: STAMP }));
  const events = cal.children.filter((c) => c.name === 'VEVENT');
  const due = events.find((ev) => prop(ev, 'DTSTART').value === '20270405');
  assert.ok(due, 'due event present');
  const triggers = due.children.filter((c) => c.name === 'VALARM').map((a) => prop(a, 'TRIGGER').value).sort();
  assert.deepEqual(triggers, ['-P7D', 'PT9H']);
  assert.equal(prop(due, 'DTEND').value, '20270406');
  const arrival = events.find((ev) => prop(ev, 'DTSTART').value === '20270301');
  assert.ok(arrival);
  assert.match(prop(arrival, 'SUMMARY').value, /March 2027/);
});

test('escaped commas in DESCRIPTION survive', () => {
  const { ics } = demoFile();
  assert.ok(ics.includes('\\,'), 'commas are escaped');
});
