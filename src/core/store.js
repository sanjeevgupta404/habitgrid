/**
 * Central Application Store
 * ──────────────────────────
 * Single source of truth for runtime state. Uses a simple observer pattern
 * (subscribe/notify) so components can react to state changes without
 * coupling to each other. No framework needed.
 *
 * When adding a backend: replace API calls in actions, keep this file as-is.
 */

import { HabitsAPI, CompletionsAPI, SettingsAPI, AuthAPI } from './api.js';

// ── State shape ───────────────────────────────────────────────────────────────

const _state = {
  // Auth
  session: null,            // { id, name, email } | null

  // Data
  habits: [],               // Habit[]
  completions: {},          // { "habitId_YYYY-MM-DD": timestamp }
  settings: {},             // Settings

  // UI (not persisted)
  currentRoute: '#/tracker',
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  filter: 'all',
  categoryFilter: '',
  historyYear: new Date().getFullYear(),
  historyMonth: new Date().getMonth(),
  loading: false,
};

// ── Observer ─────────────────────────────────────────────────────────────────

const _listeners = new Set();

export function subscribe(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn); // returns unsubscribe fn
}

function notify() {
  for (const fn of _listeners) fn({ ..._state });
}

// ── Public read accessor ──────────────────────────────────────────────────────

export function getState() {
  return { ..._state };
}

// ── Internal mutator (always go through this for consistency) ─────────────────

function setState(partial) {
  Object.assign(_state, partial);
  notify();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

export async function initStore() {
  const [habits, completions, settings, session] = await Promise.all([
    HabitsAPI.getAll(),
    CompletionsAPI.getAll(),
    SettingsAPI.get(),
    AuthAPI.getSession(),
  ]);
  setState({ habits, completions, settings, session });
}

// ── Auth actions ──────────────────────────────────────────────────────────────

export async function actionLogin(credentials) {
  const session = await AuthAPI.login(credentials);
  setState({ session });
  return session;
}

export async function actionRegister(data) {
  const session = await AuthAPI.register(data);
  setState({ session });
  return session;
}

export async function actionLogout() {
  await AuthAPI.logout();
  setState({ session: null });
}

// ── Habit actions ─────────────────────────────────────────────────────────────

export async function actionAddHabit(data) {
  const habit = await HabitsAPI.create(data);
  setState({ habits: [..._state.habits, habit] });
  return habit;
}

export async function actionUpdateHabit(id, data) {
  const updated = await HabitsAPI.update(id, data);
  setState({ habits: _state.habits.map(h => h.id === id ? updated : h) });
  return updated;
}

export async function actionDeleteHabit(id) {
  await HabitsAPI.delete(id);
  const completions = { ..._state.completions };
  for (const key of Object.keys(completions)) {
    if (key.startsWith(id + '_')) delete completions[key];
  }
  setState({ habits: _state.habits.filter(h => h.id !== id), completions });
}

// ── Completion actions ────────────────────────────────────────────────────────

export async function actionToggleDay(habitId, dateStr) {
  const checked = await CompletionsAPI.toggle(habitId, dateStr);
  const completions = { ..._state.completions };
  const key = `${habitId}_${dateStr}`;
  if (checked) completions[key] = Date.now();
  else delete completions[key];
  setState({ completions });
  return checked;
}

// ── Settings actions ──────────────────────────────────────────────────────────

export async function actionUpdateSettings(partial) {
  const settings = await SettingsAPI.set(partial);
  setState({ settings });
  return settings;
}

// ── UI-only mutations (no async needed) ───────────────────────────────────────

export function setRoute(route) {
  setState({ currentRoute: route });
}

export function setMonth(year, month) {
  setState({ currentYear: year, currentMonth: month });
}

export function setFilter(filter) {
  setState({ filter });
}

export function setCategoryFilter(categoryFilter) {
  setState({ categoryFilter });
}

export function setHistoryMonth(year, month) {
  setState({ historyYear: year, historyMonth: month });
}
