/**
 * Date Utilities
 * ──────────────
 * Pure functions only. No side effects. Easy to unit-test when backend arrives.
 */

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function dateKey(year, month, day) {
  // month is 0-indexed
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

export function todayDateKey() {
  const n = new Date();
  return dateKey(n.getFullYear(), n.getMonth(), n.getDate());
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function isToday(year, month, day) {
  return dateKey(year, month, day) === todayDateKey();
}

export function isFuture(year, month, day) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(year, month, day) > now;
}

export function isPast(year, month, day) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(year, month, day) < now;
}

export function addMonths(year, month, delta) {
  let m = month + delta;
  let y = year;
  if (m > 11) { m = 0; y++; }
  if (m < 0)  { m = 11; y--; }
  return { year: y, month: m };
}

/**
 * Groups days 1..daysInMonth into week chunks (Sun–Sat boundaries).
 * Returns [{ week, start, end }]
 */
export function getWeeksInMonth(year, month) {
  const days = getDaysInMonth(year, month);
  const weeks = [];
  let week = 1, start = 1;
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month, d).getDay();
    if (d > 1 && dow === 0) {
      weeks.push({ week, start, end: d - 1 });
      week++;
      start = d;
    }
  }
  weeks.push({ week, start, end: days });
  return weeks;
}

export function formatMonthYear(year, month) {
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  return `${MONTHS[month]} ${year}`;
}

export function formatShortMonthYear(year, month) {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${M[month]} ${year}`;
}
