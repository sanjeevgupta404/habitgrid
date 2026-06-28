/**
 * Stats & Analytics
 * ──────────────────
 * All pure computation functions. Take completions dict + habits array as
 * arguments (never read from store directly) so they're trivially testable
 * and backend-agnostic.
 */

import { getDaysInMonth, dateKey, isFuture } from './date.js';

// ── Per-habit ─────────────────────────────────────────────────────────────────

export function countCompletionsInMonth(habitId, completions, year, month) {
  const days = getDaysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= days; d++) {
    if (completions[`${habitId}_${dateKey(year, month, d)}`]) count++;
  }
  return count;
}

export function isHabitDoneOn(habitId, completions, year, month, day) {
  return !!completions[`${habitId}_${dateKey(year, month, day)}`];
}

export function calcStreaks(habitId, completions) {
  const dateKeys = Object.keys(completions)
    .filter(k => k.startsWith(`${habitId}_`))
    .map(k => k.slice(habitId.length + 1))
    .sort();

  if (dateKeys.length === 0) return { current: 0, best: 0 };

  let best = 1, cur = 1;
  for (let i = 1; i < dateKeys.length; i++) {
    const prev = new Date(dateKeys[i - 1]);
    const curr = new Date(dateKeys[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { cur++; if (cur > best) best = cur; }
    else cur = 1;
  }

  // Is streak still alive? Last completion must be today or yesterday
  const last = new Date(dateKeys[dateKeys.length - 1]);
  const today = new Date(); today.setHours(0, 0, 0, 0); last.setHours(0, 0, 0, 0);
  if ((today - last) / 86400000 > 1) cur = 0;

  return { current: cur, best };
}

export function getHabitProgress(habit, completions, year, month) {
  const count = countCompletionsInMonth(habit.id, completions, year, month);
  const pct = habit.goal > 0 ? Math.min(100, Math.round((count / habit.goal) * 100)) : 0;
  const cls = pct >= 100 ? 'done' : pct >= 60 ? 'close' : 'low';
  return { count, goal: habit.goal, pct, cls };
}

// ── Dashboard totals ──────────────────────────────────────────────────────────

export function getDashboardStats(habits, completions, year, month) {
  const today = new Date();
  const ty = today.getFullYear(), tm = today.getMonth(), td = today.getDate();
  const totalHabits = habits.length;
  let completedToday = 0, totalCurrent = 0, totalBest = 0;

  for (const h of habits) {
    if (isHabitDoneOn(h.id, completions, ty, tm, td)) completedToday++;
    const { current, best } = calcStreaks(h.id, completions);
    totalCurrent += current;
    totalBest    += best;
  }

  const days = getDaysInMonth(year, month);
  const nowTs = new Date(); nowTs.setHours(0, 0, 0, 0);
  let possible = 0, done = 0;
  for (const h of habits) {
    for (let d = 1; d <= days; d++) {
      const dt = new Date(year, month, d);
      if (dt <= nowTs) {
        possible++;
        if (isHabitDoneOn(h.id, completions, year, month, d)) done++;
      }
    }
  }
  const monthPct = possible > 0 ? Math.round((done / possible) * 100) : 0;

  return {
    totalHabits,
    completedToday,
    avgStreak: totalHabits > 0 ? Math.round(totalCurrent / totalHabits) : 0,
    bestStreak: totalHabits > 0 ? Math.round(totalBest / totalHabits) : 0,
    monthPct,
    possible,
    done,
  };
}

// ── Monthly history ───────────────────────────────────────────────────────────

export function getMonthSummary(habits, completions, year, month) {
  return habits.map(h => {
    const { count, pct, cls } = getHabitProgress(h, completions, year, month);
    const { current, best } = calcStreaks(h.id, completions);
    return { habit: h, count, pct, cls, currentStreak: current, bestStreak: best };
  });
}

/**
 * Returns an array of { year, month, pct } for the last N months.
 * Used to render the trend mini-chart in the History page.
 */
export function getMonthlyTrend(habits, completions, fromYear, fromMonth, numMonths = 6) {
  const result = [];
  for (let i = numMonths - 1; i >= 0; i--) {
    let m = fromMonth - i;
    let y = fromYear;
    while (m < 0) { m += 12; y--; }
    const days = getDaysInMonth(y, m);
    const nowTs = new Date(); nowTs.setHours(0, 0, 0, 0);
    let possible = 0, done = 0;
    for (const h of habits) {
      for (let d = 1; d <= days; d++) {
        const dt = new Date(y, m, d);
        if (dt <= nowTs) {
          possible++;
          if (isHabitDoneOn(h.id, completions, y, m, d)) done++;
        }
      }
    }
    const pct = possible > 0 ? Math.round((done / possible) * 100) : 0;
    result.push({ year: y, month: m, pct, possible, done });
  }
  return result;
}
