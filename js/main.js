// State, progressive reveal, and wiring. The only state is what the person
// has tapped; nothing is stored anywhere.

import { MONTH_NAMES } from './months.js';
import { compute } from './rules.js';
import { renderResults } from './render.js';

const now = new Date();
const today = { year: now.getFullYear(), month: now.getMonth() + 1 };

const state = {
  benefit: null,   // 'medical' | 'calfresh'
  last: null,      // {year, month}
  answer: null,    // 'yes' | 'no' | 'unsure'
  toggle: 'newAdult',
};

const $ = (sel) => document.querySelector(sel);
const sections = {
  month: $('#month-section'),
  qMedical: $('#question-medical'),
  qCalfresh: $('#question-calfresh'),
  results: $('#results-section'),
};
const monthSelect = $('#month');
const yearSelect = $('#year');
const resultsRoot = $('#results');

function fillSelects() {
  monthSelect.append(new Option('Month', '', true, true));
  MONTH_NAMES.forEach((name, i) => monthSelect.append(new Option(name, String(i + 1))));
  yearSelect.append(new Option('Year', '', true, true));
  for (let y = today.year; y >= 2020; y--) yearSelect.append(new Option(String(y), String(y)));
  monthSelect.options[0].disabled = true;
  yearSelect.options[0].disabled = true;
}

function setSelected(group, value) {
  for (const b of group.querySelectorAll('button[data-value]')) {
    const on = b.dataset.value === value;
    b.classList.toggle('selected', on);
    b.setAttribute('aria-pressed', String(on));
  }
}

function questionSection() {
  return state.benefit === 'medical' ? sections.qMedical : sections.qCalfresh;
}

function resetBelowBenefit() {
  state.last = null;
  state.answer = null;
  state.toggle = 'newAdult';
  monthSelect.value = '';
  yearSelect.value = '';
  for (const s of [sections.qMedical, sections.qCalfresh]) {
    s.hidden = true;
    setSelected(s, null);
  }
  sections.results.hidden = true;
  resultsRoot.replaceChildren();
}

function resetBelowMonth() {
  state.answer = null;
  state.toggle = 'newAdult';
  setSelected(questionSection(), null);
  sections.results.hidden = true;
  resultsRoot.replaceChildren();
}

function showResults() {
  const result = compute({ benefit: state.benefit, last: state.last, answer: state.answer, today });
  renderResults(resultsRoot, result, {
    today,
    toggle: state.toggle,
    onToggle: (side) => { state.toggle = side; showResults(); },
  });
  sections.results.hidden = false;
}

// Benefit picker
$('#benefit-picker').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-value]');
  if (!b) return;
  state.benefit = b.dataset.value;
  setSelected($('#benefit-picker'), state.benefit);
  resetBelowBenefit();
  sections.month.hidden = false;
});

// Month picker
function onMonthChange() {
  const m = Number(monthSelect.value);
  const y = Number(yearSelect.value);
  if (!m || !y) return;
  state.last = { year: y, month: m };
  const q = questionSection();
  (state.benefit === 'medical' ? sections.qCalfresh : sections.qMedical).hidden = true;
  q.hidden = false;
  if (state.answer) showResults();
  else {
    sections.results.hidden = true;
    resultsRoot.replaceChildren();
  }
}
monthSelect.addEventListener('change', onMonthChange);
yearSelect.addEventListener('change', onMonthChange);

// Situation questions
for (const s of [sections.qMedical, sections.qCalfresh]) {
  s.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-value]');
    if (!b) return;
    state.answer = b.dataset.value;
    setSelected(s, state.answer);
    showResults();
  });
}

fillSelects();
document.documentElement.classList.add('js');
