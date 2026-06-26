/**
 * Application Entry Point
 * ────────────────────────
 * Bootstraps the store, router, theme, and top bar.
 * Each route swap tears down the current page and mounts the next.
 */

import { initStore, getState } from './core/store.js';
import { initRouter, registerRoute, registerFallback, navigate } from './core/router.js';
import { applyTheme, getSystemTheme } from './core/theme.js';
import { ROUTES } from './core/constants.js';
import { mountTopbar } from './components/topbar.js';
import { mountBottomNav } from './components/bottomNav.js';
import { registerSW, generateIcons } from './core/pwa.js';

import { mountAuthPage }     from './pages/auth.js';
import { mountTrackerPage }  from './pages/tracker.js';
import { mountHistoryPage }  from './pages/history.js';
import { mountSettingsPage } from './pages/settings.js';

// ── DOM roots ─────────────────────────────────────────────────────────────────
const appEl  = document.getElementById('app');
const pageEl = document.getElementById('page-content');

// ── Active page teardown ──────────────────────────────────────────────────────
let _teardown = null;

function mountPage(route) {
  if (_teardown) { _teardown(); _teardown = null; }
  pageEl.innerHTML = '';
  pageEl.scrollTop = 0;
  pageEl.className = 'page-content';

  // Add route class for potential per-page body styles
  const routeClass = route?.name ?? route?.renderFn?.name ?? 'page';
  pageEl.classList.add(`page-${routeClass}`);

  _teardown = route.renderFn(pageEl) ?? null;
}

// ── Route definitions ─────────────────────────────────────────────────────────
registerRoute(ROUTES.AUTH, container => {
  mountAuthPage(container);
}, { name: 'auth' });
registerRoute(ROUTES.TRACKER, container => {
  return mountTrackerPage(container);
}, { name: 'tracker' });
registerRoute(ROUTES.HISTORY, container => {
  return mountHistoryPage(container);
}, { name: 'history' });
registerRoute(ROUTES.SETTINGS, container => {
  return mountSettingsPage(container);
}, { name: 'settings' });

registerFallback({ renderFn: container => {
  container.innerHTML = `
  <div id="main" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;gap:16px;text-align:center">
    <div style="font-size:64px">🗺️</div>
    <h2 style="font-size:22px;font-weight:700">Page Not Found</h2>
    <p style="color:var(--text2)">That route doesn't exist.</p>
    <a href="${ROUTES.TRACKER}" class="btn btn-primary">Go to Tracker</a>
  </div>`;
}, name: 'not-found' });

// ── Boot sequence ─────────────────────────────────────────────────────────────
async function boot() {
  // 1. Apply stored theme immediately (before any render to avoid flash)
  const stored = (() => {
    try { return JSON.parse(localStorage.getItem('hg_settings_v2')); } catch { return null; }
  })();
  const theme = stored?.theme === 'system' ? getSystemTheme()
              : stored?.theme ?? 'light';
  applyTheme(theme);

  // Apply stored accent color
  if (stored?.accentColor) {
    document.documentElement.style.setProperty('--accent', stored.accentColor);
  }

  // 2. Init data store
  await initStore();

  // 3. Mount persistent top bar and bottom nav
  mountTopbar(appEl);
  mountBottomNav(appEl);

  // 4. Start router (calls mountPage on each navigation)
  initRouter(route => mountPage(route));

  // 5. If no hash, go to tracker
  if (!window.location.hash) navigate(ROUTES.TRACKER);

  // 6. PWA: register service worker + generate icons (non-blocking)
  registerSW();
  generateIcons();

  // 7. Install banner — shows when Chrome fires beforeinstallprompt
  document.addEventListener('pwa:installable', () => {
    if (document.getElementById('install-banner')) return; // already shown
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <span class="install-banner-icon">✅</span>
      <div class="install-banner-text">
        <div class="install-banner-title">Install HabitGrid</div>
        <div class="install-banner-sub">Add to home screen for offline access</div>
      </div>
      <div class="install-banner-actions">
        <button class="btn btn-primary btn-sm" id="install-accept">Install</button>
        <button class="btn btn-ghost btn-sm"   id="install-dismiss">✕</button>
      </div>`;
    document.body.appendChild(banner);

    document.getElementById('install-accept').addEventListener('click', async () => {
      const { promptInstall } = await import('./core/pwa.js');
      const accepted = await promptInstall();
      banner.remove();
      if (accepted) {
        const { showToast } = await import('./components/toast.js');
        showToast('🎉 HabitGrid installed!', 'success');
      }
    });
    document.getElementById('install-dismiss').addEventListener('click', () => {
      banner.style.animation = 'toastOut .3s ease forwards';
      setTimeout(() => banner.remove(), 320);
    });
  });

  document.addEventListener('pwa:installed', () => {
    document.getElementById('install-banner')?.remove();
  });
}

boot();
