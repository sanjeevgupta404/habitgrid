/**
 * Settings Page
 * ──────────────
 * User preferences, data management (export/import), account info,
 * and a reset option. All settings are persisted via SettingsAPI.
 */

import { getState, subscribe, actionUpdateSettings, actionLogout } from '../core/store.js';
import { setTheme } from '../core/theme.js';
import { navigate } from '../core/router.js';
import { ROUTES, APP_VERSION, CATEGORIES } from '../core/constants.js';
import { exportJSON, exportCSV, importJSON } from '../utils/io.js';
import { showToast } from '../components/toast.js';
import { escHtml } from '../components/shared.js';
import { canInstall, promptInstall } from '../core/pwa.js';

function renderSettingsPage(state) {
  const s = state.settings;
  const { habits, completions, currentYear, currentMonth, session } = state;

  return `
  <div id="main">
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Manage your preferences and data</p>
      </div>
    </div>

    <!-- Account -->
    <section class="settings-section">
      <h2 class="settings-section-title">Account</h2>
      <div class="settings-card">
        ${session ? `
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Signed in as</div>
            <div class="settings-row-desc">${escHtml(session.email)}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-action="logout">Sign Out</button>
        </div>` : `
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Not signed in</div>
            <div class="settings-row-desc">Create an account to sync your data in the future</div>
          </div>
          <a href="${ROUTES.AUTH}" class="btn btn-primary btn-sm">Sign In</a>
        </div>`}
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label" for="s-username">Display Name</label>
          </div>
          <input id="s-username" class="form-input settings-input"
            type="text" placeholder="Your name"
            value="${escHtml(s.userName || session?.name || '')}" maxlength="40" />
        </div>
      </div>
    </section>

    <!-- Appearance -->
    <section class="settings-section">
      <h2 class="settings-section-title">Appearance</h2>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Theme</div>
            <div class="settings-row-desc">Choose light or dark mode</div>
          </div>
          <div class="theme-toggle-group">
            <button class="theme-opt${s.theme === 'light' ? ' active' : ''}" data-action="set-theme" data-theme="light">☀️ Light</button>
            <button class="theme-opt${s.theme === 'dark'  ? ' active' : ''}" data-action="set-theme" data-theme="dark">🌙 Dark</button>
            <button class="theme-opt${s.theme === 'system' ? ' active' : ''}" data-action="set-theme" data-theme="system">💻 System</button>
          </div>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label" for="s-accent">Accent Color</label>
            <div class="settings-row-desc">Primary brand color used throughout the app</div>
          </div>
          <div class="accent-picker">
            ${[
              { color: '#6366f1', label: 'Indigo'  },
              { color: '#8b5cf6', label: 'Purple'  },
              { color: '#ec4899', label: 'Pink'    },
              { color: '#14b8a6', label: 'Teal'    },
              { color: '#22c55e', label: 'Green'   },
              { color: '#f59e0b', label: 'Amber'   },
              { color: '#3b82f6', label: 'Blue'    },
              { color: '#ef4444', label: 'Red'     },
            ].map(({ color, label }) => `
              <button class="accent-swatch${s.accentColor === color ? ' selected' : ''}"
                style="background:${color}" data-action="set-accent" data-color="${color}"
                title="${label}" aria-label="${label}"></button>`
            ).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- Tracker Preferences -->
    <section class="settings-section">
      <h2 class="settings-section-title">Tracker Preferences</h2>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label" for="s-default-goal">Default Monthly Goal</label>
            <div class="settings-row-desc">Pre-filled when adding a new habit</div>
          </div>
          <input id="s-default-goal" class="form-input settings-input"
            type="number" min="1" max="31" value="${s.defaultGoal}" />
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <label class="settings-row-label" for="s-week-start">Week Starts On</label>
          </div>
          <select id="s-week-start" class="form-select settings-input">
            <option value="0"${s.weekStartsOn === 0 ? ' selected' : ''}>Sunday</option>
            <option value="1"${s.weekStartsOn === 1 ? ' selected' : ''}>Monday</option>
          </select>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Show Goal Column</div>
            <div class="settings-row-desc">Display the goal count column in the grid</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="s-show-goal" ${s.showGoalColumn ? 'checked' : ''} />
            <span class="toggle-track"></span>
          </label>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Show Streaks in Dashboard</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="s-show-streaks" ${s.showStreaks ? 'checked' : ''} />
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>
    </section>

    <!-- Data Management -->
    <section class="settings-section">
      <h2 class="settings-section-title">Data Management</h2>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Export Backup (JSON)</div>
            <div class="settings-row-desc">Download all habits, completions, and settings</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-action="export-json">⬇ Export JSON</button>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Export Current Month (CSV)</div>
            <div class="settings-row-desc">Spreadsheet-compatible, current view month</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-action="export-csv">⬇ Export CSV</button>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Import Backup (JSON)</div>
            <div class="settings-row-desc">Restore from a previously exported backup file</div>
          </div>
          <label class="btn btn-ghost btn-sm" style="cursor:pointer">
            ⬆ Import JSON
            <input type="file" id="import-file" accept=".json" style="display:none" data-action="import-file" />
          </label>
        </div>
        <div class="settings-row settings-row-danger">
          <div class="settings-row-info">
            <div class="settings-row-label">Reset All Data</div>
            <div class="settings-row-desc">Permanently delete all habits and completions</div>
          </div>
          <button class="btn btn-danger btn-sm" data-action="reset-data">🗑 Reset Data</button>
        </div>
      </div>
    </section>

    <!-- App / PWA -->
    <section class="settings-section">
      <h2 class="settings-section-title">App</h2>
      <div class="settings-card">
        <div class="settings-row" id="install-row" style="${canInstall() ? '' : 'display:none'}">
          <div class="settings-row-info">
            <div class="settings-row-label">Install HabitGrid</div>
            <div class="settings-row-desc">Add to your home screen for the full app experience</div>
          </div>
          <button class="btn btn-primary btn-sm" data-action="install-app">⬇ Install</button>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Offline Support</div>
            <div class="settings-row-desc">App works offline after first load — data stays in your browser</div>
          </div>
          <span style="font-size:12px;color:var(--green);font-weight:600">✓ Active</span>
        </div>
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">Version</div>
            <div class="settings-row-desc">HabitGrid v${APP_VERSION}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="settings-section">
      <h2 class="settings-section-title">About</h2>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-info">
            <div class="settings-row-label">HabitGrid</div>
            <div class="settings-row-desc">Version ${APP_VERSION} · Frontend-only · Data stored locally</div>
          </div>
        </div>
      </div>
    </section>
  </div>`;
}

// ── Mount ─────────────────────────────────────────────────────────────────────
export function mountSettingsPage(container) {
  let _unsub;
  let _state;

  function render(state) {
    _state = state;
    container.innerHTML = renderSettingsPage(state);
    bindEvents();
  }

  function bindEvents() {
    // Save text/number inputs on blur
    container.querySelector('#s-username')?.addEventListener('blur', e => {
      actionUpdateSettings({ userName: e.target.value.trim() });
    });
    container.querySelector('#s-default-goal')?.addEventListener('change', e => {
      actionUpdateSettings({ defaultGoal: parseInt(e.target.value, 10) || 20 });
    });
    container.querySelector('#s-week-start')?.addEventListener('change', e => {
      actionUpdateSettings({ weekStartsOn: parseInt(e.target.value, 10) });
    });
    container.querySelector('#s-show-goal')?.addEventListener('change', e => {
      actionUpdateSettings({ showGoalColumn: e.target.checked });
    });
    container.querySelector('#s-show-streaks')?.addEventListener('change', e => {
      actionUpdateSettings({ showStreaks: e.target.checked });
    });

    // Import file
    container.querySelector('#import-file')?.addEventListener('change', async e => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await importJSON(file);
        showToast('✅ Data imported successfully. Reloading…', 'success');
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        showToast('❌ Import failed: ' + err.message, 'error');
      }
    });

    // Click actions
    container.addEventListener('click', async e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;

      if (action === 'install-app') {
        const accepted = await promptInstall();
        if (accepted) showToast('✅ HabitGrid installed!', 'success');
      } else if (action === 'set-theme') {
        const theme = e.target.dataset.theme;
        await setTheme(theme);
      } else if (action === 'set-accent') {
        const color = e.target.dataset.color;
        document.documentElement.style.setProperty('--accent', color);
        // Also update meta theme-color for browser chrome
        const metaTheme = document.getElementById('meta-theme-color');
        if (metaTheme) metaTheme.content = color;
        await actionUpdateSettings({ accentColor: color });
      } else if (action === 'export-json') {
        await exportJSON();
        showToast('✅ JSON backup downloaded', 'success');
      } else if (action === 'export-csv') {
        const { habits, completions, currentYear, currentMonth } = _state;
        await exportCSV(habits, completions, currentYear, currentMonth);
        showToast('✅ CSV exported', 'success');
      } else if (action === 'logout') {
        await actionLogout();
        navigate(ROUTES.AUTH);
      } else if (action === 'reset-data') {
        if (confirm('This will permanently delete ALL habits, completions, and settings. Are you sure?')) {
          if (confirm('Last chance — this cannot be undone.')) {
            const { STORAGE_KEYS } = await import('../core/constants.js');
            Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
            showToast('All data cleared. Reloading…', 'default');
            setTimeout(() => window.location.reload(), 1000);
          }
        }
      }
    });
  }

  let _prev = {};
  _unsub = subscribe(state => {
    const { settings, session } = state;
    if (settings !== _prev.settings || session !== _prev.session) {
      _prev = { settings, session };
      render(state);
    }
  });

  render(getState());
  return () => _unsub?.();
}
