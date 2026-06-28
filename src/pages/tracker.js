/**
 * Tracker Page — Main Habit Grid
 * ────────────────────────────────
 * Each habit is ONE row. Days 1-31 are columns.
 * Week labels live in a top header row using colspan — not repeated tbody rows.
 * Event delegation uses a single persistent listener bound once per mount,
 * always reading fresh state via getState() to avoid stale closures.
 */

import {
  getState, subscribe,
  actionAddHabit, actionUpdateHabit, actionDeleteHabit,
  actionToggleDay, setFilter, setCategoryFilter,
} from '../core/store.js';
import { CATEGORIES, CATEGORY_META } from '../core/constants.js';
import { dateKey, getDaysInMonth, getWeeksInMonth, isToday, isFuture } from '../utils/date.js';
import { getDashboardStats, getHabitProgress } from '../utils/stats.js';
import { openHabitModal } from '../components/habitModal.js';
import { showToast, launchConfetti } from '../components/toast.js';
import { renderStatCard, renderCategoryBadge, renderEmptyState, escHtml } from '../components/shared.js';

// ─── Global tick handler (inline onclick needs window scope) ─────────────────
// Only toggleDay is exposed globally — edit/delete use delegated events.
window.__toggleDay = async (habitId, year, month, day) => {
  const dk = dateKey(year, month, day);
  await actionToggleDay(habitId, dk);
  const { completions, habits } = getState();
  _patchCell(habitId, year, month, day, completions);
  _patchProgress(habitId, habits, completions, year, month);
  _patchDashboard();
  _checkCelebration(habits, completions);
};

// ─── Celebration ─────────────────────────────────────────────────────────────
let _celebratedToday = false;
function _checkCelebration(habits, completions) {
  if (_celebratedToday || !habits.length) return;
  const n = new Date();
  const dk = dateKey(n.getFullYear(), n.getMonth(), n.getDate());
  if (habits.every(h => !!completions[`${h.id}_${dk}`])) {
    _celebratedToday = true;
    const msgs = [
      '🎉 All habits done today! You crushed it!',
      '🏆 Perfect day! Every box checked!',
      '✨ 100% today — you\'re on fire!',
      '🌟 All habits complete! Keep the streak alive!',
    ];
    showToast(msgs[Math.floor(Math.random() * msgs.length)], 'celebrate');
    launchConfetti();
    setTimeout(() => { _celebratedToday = false; }, new Date().setHours(24, 0, 0, 0) - Date.now());
  }
}

// ─── Surgical DOM patches (avoid full re-render on tick toggle) ──────────────
function _patchCell(habitId, year, month, day, completions) {
  const row = document.querySelector(`.habit-row[data-id="${habitId}"]`);
  if (!row) return;
  const btn = row.querySelectorAll('td.cell-day')[day - 1]?.querySelector('.tick-btn');
  if (!btn) return;
  const done = !!completions[`${habitId}_${dateKey(year, month, day)}`];
  btn.className = ['tick-btn',
    done               ? 'checked'    : '',
    isToday(year, month, day) ? 'today-cell' : '',
    isFuture(year, month, day) ? 'no-future'  : '',
  ].filter(Boolean).join(' ');
  btn.innerHTML = done ? '✓' : '';
  btn.title = done ? 'Mark incomplete' : 'Mark complete';
}

function _patchProgress(habitId, habits, completions, year, month) {
  const row = document.querySelector(`.habit-row[data-id="${habitId}"]`);
  const cell = row?.querySelector('.cell-prog');
  if (!cell) return;
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;
  const { count, goal, pct, cls } = getHabitProgress(habit, completions, year, month);
  cell.innerHTML = `
    <div class="prog-top">
      <span class="prog-count">${count}</span><span class="prog-sep">/</span>
      <span class="prog-goal">${goal}</span>
      <span class="prog-pct ${cls}">${pct}%</span>
    </div>
    <div class="prog-bar-track">
      <div class="prog-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>`;
}

function _patchDashboard() {
  const el = document.getElementById('tracker-dashboard');
  if (!el) return;
  const { habits, completions, currentYear, currentMonth } = getState();
  el.innerHTML = renderDashboard(habits, completions, currentYear, currentMonth);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function renderDashboard(habits, completions, year, month) {
  const s = getDashboardStats(habits, completions, year, month);
  return [
    renderStatCard('blue',   '📋', 'Total Habits',  s.totalHabits,    'being tracked'),
    renderStatCard('green',  '✅', 'Done Today',    s.completedToday, `of ${s.totalHabits} habits`),
    renderStatCard('amber',  '🔥', 'Avg Streak',    s.avgStreak,      'days current'),
    renderStatCard('purple', '🏆', 'Best Streak',   s.bestStreak,     'days average'),
    renderStatCard('pink',   '📈', 'Monthly',       `${s.monthPct}%`, 'completion rate'),
  ].join('');
}

// ─── Filters bar ──────────────────────────────────────────────────────────────
function renderFilters(filter, categoryFilter) {
  const chips = [
    { key: 'all',    label: 'All Habits' },
    { key: 'today',  label: '✅ Done Today' },
    { key: 'missed', label: '❌ Missed Today' },
  ].map(f =>
    `<button class="filter-chip${filter === f.key ? ' active' : ''}" data-filter="${f.key}">${f.label}</button>`
  ).join('');

  const catOpts = CATEGORIES.map(c =>
    `<option value="${c}"${categoryFilter === c ? ' selected' : ''}>${c}</option>`
  ).join('');

  return `
  <div id="filters-bar">
    ${chips}
    <div class="filter-sep"></div>
    <div class="category-filter">
      <select id="cat-select">
        <option value="">All Categories</option>${catOpts}
      </select>
    </div>
  </div>`;
}

// ─── Grid ─────────────────────────────────────────────────────────────────────
/**
 * Structure:
 *   <thead>
 *     <tr>  ← Week label row: "Week 1" spans days 1-7, "Week 2" spans days 8-14, etc.
 *     <tr>  ← Day number row: th for each day 1..31
 *   </thead>
 *   <tbody>
 *     one <tr> per habit — NO repetition
 *   </tbody>
 *
 * Week column shading is applied via td background-color on each cell,
 * alternating between weeks. No rows are duplicated.
 */
function renderGrid(habits, completions, year, month, filter, categoryFilter) {
  // ── Apply filters ────────────────────────────────────────────────────────
  let filtered = [...habits];
  if (categoryFilter) {
    filtered = filtered.filter(h => h.category === categoryFilter);
  }
  if (filter === 'today') {
    const dk = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    filtered = filtered.filter(h => !!completions[`${h.id}_${dk}`]);
  } else if (filter === 'missed') {
    const dk = dateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    filtered = filtered.filter(h => !completions[`${h.id}_${dk}`]);
  }

  if (!habits.length) {
    return renderEmptyState({
      icon: '📋',
      title: 'No habits yet',
      body: 'Start building better routines. Add your first habit.',
      actionHtml: `<button class="btn btn-primary" data-action="add-habit">+ Add Your First Habit</button>`,
    });
  }
  if (!filtered.length) {
    return renderEmptyState({
      icon: '🔍',
      title: 'No habits match this filter',
      body: 'Try a different filter or category.',
      actionHtml: `<button class="btn btn-ghost" data-filter="all">Clear Filters</button>`,
    });
  }

  const days  = getDaysInMonth(year, month);
  const weeks = getWeeksInMonth(year, month);
  const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // ── Pre-compute which week (0-indexed) each day belongs to ───────────────
  // weekIndex[d] = 0 for Week1, 1 for Week2, etc. (used for alternating shade)
  const weekIndex = new Array(days + 1).fill(0);
  for (let wi = 0; wi < weeks.length; wi++) {
    for (let d = weeks[wi].start; d <= weeks[wi].end; d++) {
      weekIndex[d] = wi;
    }
  }

  // ── Header row 1: week label cells with colspan ──────────────────────────
  // Layout: [Habit col] [Goal col] [week1 colspan] [week2 colspan] ... [Progress col]
  let weekLabelCells = `
    <th class="th-habit th-week-label" rowspan="2">Habit</th>
    <th class="th-goal col-goal th-week-label" rowspan="2">Goal</th>`;
  for (const { week, start, end } of weeks) {
    const span = end - start + 1;
    weekLabelCells += `
    <th class="th-week-group week-shade-${(week - 1) % 2}" colspan="${span}">
      Week ${week}
    </th>`;
  }
  weekLabelCells += `<th class="th-prog th-week-label" rowspan="2">Progress</th>`;

  // ── Header row 2: individual day number cells ────────────────────────────
  let dayNumberCells = '';
  for (let d = 1; d <= days; d++) {
    const dow     = new Date(year, month, d).getDay();
    const todayCls = isToday(year, month, d) ? ' today-col' : '';
    const wi      = weekIndex[d];
    dayNumberCells += `
    <th class="th-day col-day week-shade-${wi % 2}${todayCls}">
      <span class="day-num${isToday(year, month, d) ? ' day-num-today' : ''}">${d}</span>
      <span class="day-dow">${DAYS_SHORT[dow]}</span>
    </th>`;
  }

  // ── Habit rows (one per habit, no repetition) ────────────────────────────
  let habitRows = '';
  for (const habit of filtered) {
    const { count, goal, pct, cls } = getHabitProgress(habit, completions, year, month);

    let dayCells = '';
    for (let d = 1; d <= days; d++) {
      const future  = isFuture(year, month, d);
      const today   = isToday(year, month, d);
      const done    = !!completions[`${habit.id}_${dateKey(year, month, d)}`];
      const wi      = weekIndex[d];

      const tickCls = ['tick-btn',
        done    ? 'checked'    : '',
        today   ? 'today-cell' : '',
        future  ? 'no-future'  : '',
      ].filter(Boolean).join(' ');

      dayCells += `
      <td class="cell-day week-shade-${wi % 2}${future ? ' future-day' : ''}">
        <button class="${tickCls}"
          onclick="__toggleDay('${habit.id}',${year},${month},${d})"
          title="${done ? 'Mark incomplete' : 'Mark complete'}"
          ${future ? 'disabled aria-disabled="true"' : ''}>
          ${done ? '✓' : ''}
        </button>
      </td>`;
    }

    habitRows += `
    <tr class="habit-row" data-id="${habit.id}">
      <td class="cell-habit">
        <div class="habit-name-wrap">
          <span class="habit-emoji">${habit.emoji}</span>
          <div>
            <div class="habit-name-text" title="${escHtml(habit.name)}">${escHtml(habit.name)}</div>
            ${renderCategoryBadge(habit.category)}
            <div class="habit-row-actions">
              <button class="row-action-btn edit"
                data-action="edit-habit"
                data-habit-id="${habit.id}">Edit</button>
              <button class="row-action-btn del"
                data-action="del-habit"
                data-habit-id="${habit.id}">Delete</button>
            </div>
          </div>
        </div>
      </td>
      <td class="cell-goal col-goal">
        <div class="goal-val">${goal}</div>
        <div class="goal-sub">days</div>
      </td>
      ${dayCells}
      <td class="cell-prog">
        <div class="prog-top">
          <span class="prog-count">${count}</span>
          <span class="prog-sep">/</span>
          <span class="prog-goal">${goal}</span>
          <span class="prog-pct ${cls}">${pct}%</span>
        </div>
        <div class="prog-bar-track">
          <div class="prog-bar-fill ${cls}" style="width:${pct}%"></div>
        </div>
      </td>
    </tr>`;
  }

  // ── Assemble table ───────────────────────────────────────────────────────
  const colGroup = `
  <colgroup>
    <col class="col-habit">
    <col class="col-goal">
    ${Array.from({ length: days }, () => '<col class="col-day">').join('')}
    <col class="col-prog">
  </colgroup>`;

  return `
  <div class="grid-scroll-wrap">
    <table class="habit-table" role="grid" aria-label="Habit tracking grid">
      ${colGroup}
      <thead>
        <tr class="thead-week-row">${weekLabelCells}</tr>
        <tr class="thead-day-row">${dayNumberCells}</tr>
      </thead>
      <tbody>${habitRows}</tbody>
    </table>
  </div>`;
}

// ─── Mount ────────────────────────────────────────────────────────────────────
export function mountTrackerPage(container) {

  // ── Render the full page HTML ──────────────────────────────────────────────
  function render(state) {
    const { habits, completions, currentYear: y, currentMonth: m, filter, categoryFilter } = state;
    container.innerHTML = `
    <div id="main">
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">Monthly Tracker</h1>
          <p class="page-subtitle">Track your habits day by day</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" data-action="add-habit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      <div id="tracker-dashboard" class="dashboard-grid">
        ${renderDashboard(habits, completions, y, m)}
      </div>

      ${renderFilters(filter, categoryFilter)}

      <div id="grid-section">
        ${renderGrid(habits, completions, y, m, filter, categoryFilter)}
      </div>
    </div>`;
  }

  // ── Single persistent delegated listener (bound ONCE per mount) ───────────
  // Always reads fresh state via getState() — never captures stale closure.
  async function handleClick(e) {
    // ── Filter chips ────────────────────────────────────────────────────────
    const filterBtn = e.target.closest('[data-filter]');
    if (filterBtn) {
      setFilter(filterBtn.dataset.filter);
      return;
    }

    // ── Category select is handled separately (change event) ────────────────

    // ── Action buttons ───────────────────────────────────────────────────────
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    if (action === 'add-habit') {
      const data = await openHabitModal();
      if (data) {
        await actionAddHabit(data);
        showToast('🎉 Habit added!', 'success');
      }
      return;
    }

    if (action === 'edit-habit') {
      // Read habit id from the button's own data-habit-id attribute
      const id    = actionEl.dataset.habitId;
      // Always fetch fresh state — not the render-time snapshot
      const habit = getState().habits.find(h => h.id === id);
      if (!habit) return;
      const data = await openHabitModal(habit);
      if (data) {
        await actionUpdateHabit(id, data);
        showToast('✏️ Habit updated!', 'success');
      }
      return;
    }

    if (action === 'del-habit') {
      const id    = actionEl.dataset.habitId;
      const habit = getState().habits.find(h => h.id === id);
      if (!confirm(`Delete "${habit?.name ?? 'this habit'}"?\nThis will remove all its completion data.`)) return;
      await actionDeleteHabit(id);
      showToast('🗑️ Habit deleted.', 'default');
      return;
    }
  }

  // Bind click once — it survives re-renders because we only replace innerHTML,
  // not the container element itself.
  container.addEventListener('click', handleClick);

  // Category select: re-bind after each render (the select element is recreated)
  function bindCatSelect() {
    const sel = container.querySelector('#cat-select');
    if (sel) sel.addEventListener('change', () => setCategoryFilter(sel.value));
  }

  // After rendering, measure row-1 height so row-2 sticky top is exact
  function _measureHeaderRow() {
    requestAnimationFrame(() => {
      const row1 = container.querySelector('.thead-week-row');
      if (row1) {
        const h = row1.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--thead-row1-h', `${h}px`);
      }
    });
  }

  // ── Subscribe to store ────────────────────────────────────────────────────
  // Only re-render when fields that affect this page actually change.
  let _prev = {};
  const unsub = subscribe(state => {
    const { habits, completions, currentYear, currentMonth, filter, categoryFilter } = state;
    const changed =
      habits         !== _prev.habits         ||
      completions    !== _prev.completions    ||
      currentYear    !== _prev.currentYear    ||
      currentMonth   !== _prev.currentMonth   ||
      filter         !== _prev.filter         ||
      categoryFilter !== _prev.categoryFilter;

    if (changed) {
      _prev = { habits, completions, currentYear, currentMonth, filter, categoryFilter };
      render(state);
      bindCatSelect();
      _measureHeaderRow();
    }
  });

  // Initial render
  render(getState());
  bindCatSelect();
  _measureHeaderRow();

  // Teardown: remove listener and unsubscribe
  return () => {
    container.removeEventListener('click', handleClick);
    unsub();
  };
}
