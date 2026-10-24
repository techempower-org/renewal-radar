// Turns a compute() result into DOM. Uses textContent only; no data goes
// through innerHTML.

import { format, formatDate } from './months.js';
import { SOURCES, FINAL_WORD, HAVE_READY } from './sources.js';

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

function whyThisDate(ruleIds) {
  const details = el('details', { class: 'why' });
  details.append(el('summary', { text: 'Why this date?' }));
  for (const id of ruleIds) {
    const s = SOURCES[id];
    if (!s) continue;
    const p = el('p', { class: 'source' });
    const a = el('a', { href: s.url, target: '_blank', rel: 'noopener', text: `${s.letter}, ${s.page}` });
    p.append(a, el('span', { class: 'quote', text: ` “${s.quote}”` }));
    details.append(p);
  }
  return details;
}

function noteBlock(note, cls = 'note') {
  return el('div', { class: cls }, [
    el('p', { text: note.text }),
    whyThisDate(note.ruleIds),
  ]);
}

function entryItem(entry) {
  const li = el('li', { class: 'entry' + (entry.approximate ? ' approximate' : '') });
  li.append(el('p', { class: 'date', text: formatDate(entry.date) }));
  if (entry.approximate) li.append(el('p', { class: 'approx-label', text: 'About this month. Your notice gives the exact month.' }));
  li.append(el('p', { class: 'label', text: entry.label }));
  li.append(el('p', { class: 'action', text: entry.action }));
  li.append(whyThisDate(entry.ruleIds));
  if (entry.note) li.append(noteBlock(entry.note, 'note inline-note'));
  return li;
}

/** Renders one schedule (entries, notes, banner) into a fragment. */
export function renderSchedule(result, { today }) {
  const frag = document.createDocumentFragment();
  if (result.summary) frag.append(el('p', { class: 'summary', text: result.summary }));
  if (result.banner) frag.append(noteBlock(result.banner, 'banner'));
  for (const n of result.notes) frag.append(noteBlock(n));
  if (result.countedForward) {
    frag.append(el('p', { class: 'note counted-forward',
      text: 'We counted forward from the month you entered. If you have not done a renewal since then, call your county now.' }));
  }
  if (result.entries.length) {
    frag.append(el('ol', { class: 'timeline' }, result.entries.map(entryItem)));
  }
  return frag;
}

export function renderFooterLines() {
  return el('div', { class: 'always' }, [
    el('p', { text: HAVE_READY }),
    el('p', { class: 'final-word', text: FINAL_WORD }),
  ]);
}

/**
 * Renders the whole results area for a compute() result.
 * @param {HTMLElement} root
 * @param {object} result
 * @param {{today, toggle: 'newAdult'|'standard', onToggle: (side) => void}} ctx
 */
function calendarButton(ctx, entries) {
  const wrap = el('div', { class: 'calendar' });
  const b = el('button', { type: 'button', class: 'primary', text: 'Add these to my calendar' });
  b.addEventListener('click', () => ctx.onDownload(entries));
  wrap.append(b, el('p', { class: 'hint', text: 'Downloads a small calendar file (renewal-radar.ics) with a reminder 7 days before each date. Open it and your phone\u2019s calendar will offer to add them.' }));
  return wrap;
}

export function renderResults(root, result, ctx) {
  root.replaceChildren();
  if (!result) return;
  if (result.kind === 'future') {
    root.append(el('p', { class: 'note future',
      text: "That month hasn't happened yet. Check the date on your letter." }));
    return;
  }
  root.append(el('p', { class: 'this-month', text: `We counted this month as ${format(ctx.today)}.` }));

  if (result.kind === 'medical-unsure') {
    root.append(el('p', { class: 'toggle-hint', text: 'Your county notice tells you which one applies to you.' }));
    const bar = el('div', { class: 'toggle', role: 'group', 'aria-label': 'Which schedule to show' });
    const sides = [
      ['newAdult', "If you're in the adult income group"],
      ['standard', "If you're not"],
    ];
    for (const [side, label] of sides) {
      const b = el('button', { type: 'button', class: 'choice' + (ctx.toggle === side ? ' selected' : ''), 'aria-pressed': String(ctx.toggle === side), text: label });
      b.addEventListener('click', () => ctx.onToggle(side));
      bar.append(b);
    }
    root.append(bar);
    const shown = ctx.toggle === 'standard' ? result.standard : result.newAdult;
    root.append(renderSchedule(shown, ctx));
    if (shown.entries.length) root.append(calendarButton(ctx, shown.entries));
  } else {
    root.append(renderSchedule(result, ctx));
    if (result.entries.length) root.append(calendarButton(ctx, result.entries));
  }

  root.append(renderFooterLines());
}
