/**
 * History Page — Monthly Overview
 * ─────────────────────────────────
 * Shows a per-habit breakdown for any past month, a trend bar chart for the
 * last 6 months, and a heat-map-style completion grid.
 */

import { getState, subscribe, setHistoryMonth } from '../core/store.js';
import { MONTHS, MONTHS_SHORT, CATEGORY_META } from '../core/constants.js';
import { getDaysInMonth, dateKey, addMonths, isToday, isFuture, formatMonthYear } from '../utils/date.js';
import { getMonthSummary, getMonthlyTrend, getDashboardStats } from '../utils/stats.js';
import { renderEmptyState, escHtml, renderProgressBar } from '../components/shared.js';

// ── Heat map grid ─────────────────────────────────────────────────────────────
function renderHeatMap(habit, completions, year, month) {
  const days = getDaysInMonth(year, month);
  let cells = '';
  for (let d = 1; d <= days; d++) {
    const done = !!completions[`${habit.id}_${dateKey(year, month, d)}`];
    const future = isFuture(year, month, d);
    const today = isToday(year, month, d);
    cells += `<div class="hm-cell${done ? ' done' : ''}${future ? ' future' : ''}${today ? ' today' : ''}"
      title="Day ${d}: ${done ? 'Done ✓' : future ? 'Future' : 'Missed'}"></div>`;
  }
  return `<div class="hm-grid" aria-label="Completion heat map for ${habit.name}">${cells}</div>`;
}

// ── Trend chart (pure CSS bar chart) ─────────────────────────────────────────
function renderTrendChart(trend) {
  const bars = trend.map(t => {
    const cls = t.pct >= 80 ? 'high' : t.pct >= 50 ? 'mid' : 'low';
    return `
    <div class="trend-col">
      <div class="trend-bar-wrap">
        <div class="trend-bar ${cls}" style="height:${Math.max(t.pct, 4)}%" title="${t.pct}%">
          <span class="trend-pct">${t.pct}%</span>
        </div>
      </div>
      <div class="trend-label">${MONTHS_SHORT[t.month]}</div>
    </div>`;
  }).join('');
  return `<div class="trend-chart" role="img" aria-label="6-month completion trend">${bars}</div>`;
}

// ── Month summary cards ───────────────────────────────────────────────────────
function renderSummaryCards(summary, year, month) {
  if (!summary.length) return renderEmptyState({ icon: '📅', title: 'No habits to show', body: 'Add habits on the Tracker page.' });

  return summary.map(({ habit, count, pct, cls, currentStreak, bestStreak }) => {
    const catMeta = CATEGORY_META[habit.category] || CATEGORY_META.Other;
    return `
    <div class="history-habit-card">
      <div class="hhc-header">
        <span class="hhc-emoji">${habit.emoji}</span>
        <div class="hhc-info">
          <div class="hhc-name">${escHtml(habit.name)}</div>
          <span class="habit-cat-badge ${catMeta.color}">${habit.category}</span>
        </div>
        <div class="hhc-pct ${cls}">${pct}%</div>
      </div>
      <div class="hhc-stats">
        <div class="hhc-stat"><span class="hhc-stat-val">${count}</span><span class="hhc-stat-label">completed</span></div>
        <div class="hhc-stat"><span class="hhc-stat-val">${habit.goal}</span><span class="hhc-stat-label">goal</span></div>
        <div class="hhc-stat"><span class="hhc-stat-val">${currentStreak}</span><span class="hhc-stat-label">streak</span></div>
        <div class="hhc-stat"><span class="hhc-stat-val">${bestStreak}</span><span class="hhc-stat-label">best</span></div>
      </div>
      ${renderProgressBar(count, habit.goal)}
    </div>`;
  }).join('');
}

// ── Page render ───────────────────────────────────────────────────────────────
function renderHistoryPage(state) {
  const { habits, completions, historyYear: y, historyMonth: m } = state;
  const trend   = getMonthlyTrend(habits, completions, y, m, 6);
  const summary = getMonthSummary(habits, completions, y, m);
  const stats   = getDashboardStats(habits, completions, y, m);

  const isPrevDisabled = false; // allow any past month
  const isNextDisabled = false;

  return `
  <div id="main">
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">Monthly History</h1>
        <p class="page-subtitle">Review your progress over time</p>
      </div>
      <div class="page-header-actions month-nav">
        <button class="icon-btn" data-action="hist-prev">&#8249;</button>
        <span class="month-label">${formatMonthYear(y, m)}</span>
        <button class="icon-btn" data-action="hist-next">&#8250;</button>
      </div>
    </div>

    <!-- 6-month trend -->
    <section class="history-section">
      <h2 class="section-title">6-Month Trend</h2>
      <div class="trend-card">
        ${renderTrendChart(trend)}
      </div>
    </section>

    <!-- Month summary stats -->
    <section class="history-section">
      <h2 class="section-title">${MONTHS[m]} ${y} — Summary</h2>
      <div class="hist-stats-row">
        <div class="hist-stat-chip blue">
          <span class="hsc-val">${stats.totalHabits}</span>
          <span class="hsc-label">Habits</span>
        </div>
        <div class="hist-stat-chip green">
          <span class="hsc-val">${stats.monthPct}%</span>
          <span class="hsc-label">Completion</span>
        </div>
        <div class="hist-stat-chip amber">
          <span class="hsc-val">${stats.avgStreak}</span>
          <span class="hsc-label">Avg Streak</span>
        </div>
        <div class="hist-stat-chip purple">
          <span class="hsc-val">${stats.done}</span>
          <span class="hsc-label">Days Done</span>
        </div>
      </div>
    </section>

    <!-- Per-habit cards -->
    <section class="history-section">
      <h2 class="section-title">Habit Breakdown</h2>
      <div class="history-habits-grid">
        ${renderSummaryCards(summary, y, m)}
      </div>
    </section>
  </div>`;
}

// ── Mount ─────────────────────────────────────────────────────────────────────
export function mountHistoryPage(container) {
  let _unsub;

  function render(state) {
    container.innerHTML = renderHistoryPage(state);
    bindEvents(state);
  }

  function bindEvents(state) {
    container.querySelector('[data-action="hist-prev"]')?.addEventListener('click', () => {
      const { year, month } = addMonths(state.historyYear, state.historyMonth, -1);
      setHistoryMonth(year, month);
    });
    container.querySelector('[data-action="hist-next"]')?.addEventListener('click', () => {
      const { year, month } = addMonths(state.historyYear, state.historyMonth, 1);
      setHistoryMonth(year, month);
    });
  }

  let _prev = {};
  _unsub = subscribe(state => {
    const { habits, completions, historyYear, historyMonth } = state;
    const changed = habits !== _prev.habits || completions !== _prev.completions
      || historyYear !== _prev.historyYear || historyMonth !== _prev.historyMonth;
    if (changed) {
      _prev = { habits, completions, historyYear, historyMonth };
      render(state);
    }
  });

  render(getState());
  return () => _unsub?.();
}
