/**
 * Hash-based SPA Router
 * ──────────────────────
 * Maps URL hashes to page render functions.
 * Supports route guards (e.g. auth-required routes).
 * Uses hash routing so no server config is needed for file:// or static hosting.
 */

import { ROUTES } from './constants.js';
import { getState, setRoute } from './store.js';

const _routes = new Map();
let _fallback = null;

// ── Route registration ────────────────────────────────────────────────────────

export function registerRoute(hash, renderFn, options = {}) {
  _routes.set(hash, { renderFn, ...options });
}

export function registerFallback(renderFn) {
  _fallback = renderFn;
}

// ── Navigation ────────────────────────────────────────────────────────────────

export function navigate(hash) {
  window.location.hash = hash;
}

export function currentHash() {
  return window.location.hash || ROUTES.TRACKER;
}

// ── Resolution ────────────────────────────────────────────────────────────────

export function resolveRoute() {
  const hash = currentHash();
  const route = _routes.get(hash);
  const state = getState();

  // Auth guard: protected routes redirect to auth if no session
  if (route?.requiresAuth && !state.session) {
    navigate(ROUTES.AUTH);
    return null;
  }

  // Auth gate: auth page redirects to tracker if already logged in
  if (hash === ROUTES.AUTH && state.session) {
    navigate(ROUTES.TRACKER);
    return null;
  }

  setRoute(hash);
  return route ?? _fallback;
}

// ── Init ─────────────────────────────────────────────────────────────────────

export function initRouter(onNavigate) {
  const handle = () => {
    const route = resolveRoute();
    if (route) onNavigate(route);
  };
  window.addEventListener('hashchange', handle);
  handle(); // handle initial load
}
