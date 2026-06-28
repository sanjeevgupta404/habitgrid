/**
 * API Abstraction Layer
 * ─────────────────────
 * All data reads/writes go through this module.
 * Currently backed by localStorage. To connect a real backend, replace the
 * body of each function with a fetch() call — no other file needs to change.
 *
 * Async/await is used throughout so the calling code is already backend-ready.
 */

import { STORAGE_KEYS, SAMPLE_HABITS } from './constants.js';
import { uid } from '../utils/date.js';

// ── Internal helpers ─────────────────────────────────────────────────────────

function readKey(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeKey(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Auth ─────────────────────────────────────────────────────────────────────
// Stores a minimal user profile. Replace with real JWT flow when backend is ready.

export const AuthAPI = {
  async getSession() {
    return readKey(STORAGE_KEYS.AUTH, null);
    // Real: return fetch('/api/session').then(r => r.json())
  },

  async login({ email, password }) {
    // Simulate: accept any credentials, store locally
    const users = readKey('hg_users', []);
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('No account found with that email.');
    if (user.password !== password) throw new Error('Incorrect password.');
    const session = { id: user.id, name: user.name, email: user.email, loggedInAt: Date.now() };
    writeKey(STORAGE_KEYS.AUTH, session);
    return session;
    // Real: return fetch('/api/login', { method:'POST', body: JSON.stringify({email,password}) }).then(r=>r.json())
  },

  async register({ name, email, password }) {
    const users = readKey('hg_users', []);
    if (users.find(u => u.email === email)) throw new Error('An account with this email already exists.');
    const newUser = { id: uid(), name, email, password, createdAt: Date.now() };
    users.push(newUser);
    writeKey('hg_users', users);
    const session = { id: newUser.id, name: newUser.name, email: newUser.email, loggedInAt: Date.now() };
    writeKey(STORAGE_KEYS.AUTH, session);
    return session;
    // Real: return fetch('/api/register', { method:'POST', body: JSON.stringify({name,email,password}) }).then(r=>r.json())
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    // Real: return fetch('/api/logout', { method:'POST' })
  },
};

// ── Habits ───────────────────────────────────────────────────────────────────

export const HabitsAPI = {
  async getAll() {
    const habits = readKey(STORAGE_KEYS.HABITS, null);
    if (habits) return habits;
    // Seed sample habits on first run
    const seeded = SAMPLE_HABITS.map((h, i) => ({
      id: uid() + i, name: h.name, emoji: h.emoji,
      goal: h.goal, category: h.category,
      createdAt: Date.now(),
    }));
    writeKey(STORAGE_KEYS.HABITS, seeded);
    return seeded;
  },

  async create(data) {
    const habits = await this.getAll();
    const habit = { id: uid(), ...data, createdAt: Date.now() };
    habits.push(habit);
    writeKey(STORAGE_KEYS.HABITS, habits);
    return habit;
  },

  async update(id, data) {
    const habits = await this.getAll();
    const idx = habits.findIndex(h => h.id === id);
    if (idx === -1) throw new Error('Habit not found.');
    habits[idx] = { ...habits[idx], ...data, updatedAt: Date.now() };
    writeKey(STORAGE_KEYS.HABITS, habits);
    return habits[idx];
  },

  async delete(id) {
    const habits = await this.getAll();
    writeKey(STORAGE_KEYS.HABITS, habits.filter(h => h.id !== id));
    // Also clean up completions
    const completions = readKey(STORAGE_KEYS.COMPLETIONS, {});
    for (const key of Object.keys(completions)) {
      if (key.startsWith(id + '_')) delete completions[key];
    }
    writeKey(STORAGE_KEYS.COMPLETIONS, completions);
  },
};

// ── Completions ───────────────────────────────────────────────────────────────

export const CompletionsAPI = {
  async getAll() {
    return readKey(STORAGE_KEYS.COMPLETIONS, {});
  },

  async toggle(habitId, dateStr) {
    const completions = await this.getAll();
    const key = `${habitId}_${dateStr}`;
    if (completions[key]) {
      delete completions[key];
      writeKey(STORAGE_KEYS.COMPLETIONS, completions);
      return false; // now unchecked
    } else {
      completions[key] = Date.now();
      writeKey(STORAGE_KEYS.COMPLETIONS, completions);
      return true; // now checked
    }
  },
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const SettingsAPI = {
  defaults: {
    theme: 'light',
    accentColor: '#6366f1',
    weekStartsOn: 0,        // 0 = Sunday, 1 = Monday
    showStreaks: true,
    showGoalColumn: true,
    defaultGoal: 20,
    notifications: false,
    userName: '',
  },

  async get() {
    const saved = readKey(STORAGE_KEYS.SETTINGS, {});
    return { ...this.defaults, ...saved };
  },

  async set(partial) {
    const current = await this.get();
    const updated = { ...current, ...partial };
    writeKey(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};

// ── Data Export / Import ──────────────────────────────────────────────────────
// Lives here so a real backend can offer the same endpoints.

export const DataAPI = {
  async exportJSON() {
    const [habits, completions, settings] = await Promise.all([
      HabitsAPI.getAll(),
      CompletionsAPI.getAll(),
      SettingsAPI.get(),
    ]);
    return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), habits, completions, settings }, null, 2);
  },

  async importJSON(jsonString) {
    const data = JSON.parse(jsonString);
    if (!data.habits || !Array.isArray(data.habits)) throw new Error('Invalid backup file.');
    writeKey(STORAGE_KEYS.HABITS, data.habits);
    if (data.completions) writeKey(STORAGE_KEYS.COMPLETIONS, data.completions);
    if (data.settings)    writeKey(STORAGE_KEYS.SETTINGS, data.settings);
    return data;
  },

  async exportCSV(habits, completions, year, month) {
    const { getDaysInMonth, dateKey } = await import('../utils/date.js');
    const days = getDaysInMonth(year, month);
    const headers = ['Habit', 'Category', 'Goal', ...Array.from({ length: days }, (_, i) => `Day ${i + 1}`), 'Total', 'Pct'];
    const rows = habits.map(h => {
      let total = 0;
      const dayCols = Array.from({ length: days }, (_, i) => {
        const done = !!completions[`${h.id}_${dateKey(year, month, i + 1)}`];
        if (done) total++;
        return done ? '1' : '0';
      });
      const pct = h.goal > 0 ? ((total / h.goal) * 100).toFixed(0) + '%' : '—';
      return [h.name, h.category, h.goal, ...dayCols, total, pct];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    return csv;
  },
};
