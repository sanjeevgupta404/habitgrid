/**
 * Theme Manager
 * ─────────────
 * Handles dark/light mode by toggling a data-theme attribute on <html>.
 * All colour tokens are defined in CSS under [data-theme="dark"].
 * Persists preference via Settings store.
 */

import { actionUpdateSettings } from './store.js';

export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme immediately (before store is ready, used in FOUC-prevention script)
export function applyTheme(theme) {
  const resolved = theme === 'system' ? getSystemTheme() : (theme || 'light');
  document.documentElement.setAttribute('data-theme', resolved);

  // Update meta theme-color for browser chrome (Android status bar)
  const metaEl = document.getElementById('meta-theme-color');
  if (metaEl) {
    // In dark mode use a dark colour, in light use the accent
    const accentColor = document.documentElement.style.getPropertyValue('--accent') || '#6366f1';
    metaEl.content = resolved === 'dark' ? '#1c1b18' : accentColor;
  }
}

export async function setTheme(theme) {
  applyTheme(theme);
  await actionUpdateSettings({ theme });
}

export function toggleTheme(currentTheme) {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

// Listen to OS theme changes and re-apply when system pref changes
export function watchSystemTheme(callback) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', e => callback(e.matches ? 'dark' : 'light'));
}
