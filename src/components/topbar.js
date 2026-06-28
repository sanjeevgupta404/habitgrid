/**
 * Top Navigation Bar
 * ───────────────────
 * Renders the sticky topbar with brand, nav links, month nav (context-sensitive),
 * theme toggle, and user menu.
 *
 * Re-renders itself when store changes, replacing only #topbar DOM node.
 */

import { ROUTES, MONTHS } from '../core/constants.js';
import { getState, subscribe } from '../core/store.js';
import { toggleTheme } from '../core/theme.js';
import { navigate } from '../core/router.js';

const NAV_ITEMS = [
  { route: ROUTES.TRACKER,  label: 'Tracker',  icon: '✅' },
  { route: ROUTES.HISTORY,  label: 'History',  icon: '📅' },
  { route: ROUTES.SETTINGS, label: 'Settings', icon: '⚙️' },
];

function html(state) {
  const { currentRoute, currentYear: y, currentMonth: m, settings, session } = state;
  const theme = settings?.theme ?? 'light';
  const isDark = theme === 'dark';
  const showMonthNav = currentRoute === ROUTES.TRACKER;

  const navLinks = NAV_ITEMS.map(item => `
    <a href="${item.route}"
       class="nav-link${currentRoute === item.route ? ' active' : ''}"
       aria-current="${currentRoute === item.route ? 'page' : 'false'}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </a>`).join('');

  const monthNav = showMonthNav ? `
    <div class="month-nav">
      <button class="icon-btn" data-action="prev-month" title="Previous month">&#8249;</button>
      <span class="month-label">${MONTHS[m]} ${y}</span>
      <button class="icon-btn" data-action="next-month" title="Next month">&#8250;</button>
    </div>` : '';

  const userInfo = session
    ? `<div class="user-menu">
         <span class="user-avatar">${(session.name || 'U')[0].toUpperCase()}</span>
         <span class="user-name">${session.name || session.email}</span>
         <button class="icon-btn" data-action="logout" title="Sign out">⎋</button>
       </div>`
    : `<a href="${ROUTES.AUTH}" class="btn btn-ghost btn-sm">Sign In</a>`;

  return `
  <div id="topbar">
    <div class="topbar-left">
      <a href="${ROUTES.TRACKER}" class="brand" aria-label="HabitGrid home">
        <span class="brand-logo">✅</span>
        <span class="brand-name">HabitGrid</span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        ${navLinks}
      </nav>
    </div>
    ${monthNav}
    <div class="topbar-right">
      <button class="icon-btn theme-toggle" data-action="toggle-theme"
        title="${isDark ? 'Switch to light mode' : 'Switch to dark mode'}"
        aria-label="Toggle theme">
        ${isDark ? '☀️' : '🌙'}
      </button>
      ${userInfo}
    </div>
  </div>`;
}

export function mountTopbar(container) {
  function render(state) {
    const existing = document.getElementById('topbar');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html(state);
    const newEl = wrapper.firstElementChild;

    if (existing) {
      existing.replaceWith(newEl);
    } else {
      container.prepend(newEl);
    }
    bindEvents(newEl, state);
  }

  function bindEvents(el, state) {
    el.addEventListener('click', async e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;

      if (action === 'prev-month') {
        const { addMonths } = await import('../utils/date.js');
        const { setMonth } = await import('../core/store.js');
        const next = addMonths(state.currentYear, state.currentMonth, -1);
        setMonth(next.year, next.month);
      } else if (action === 'next-month') {
        const { addMonths } = await import('../utils/date.js');
        const { setMonth } = await import('../core/store.js');
        const next = addMonths(state.currentYear, state.currentMonth, 1);
        setMonth(next.year, next.month);
      } else if (action === 'toggle-theme') {
        toggleTheme(state.settings?.theme ?? 'light');
      } else if (action === 'logout') {
        const { actionLogout } = await import('../core/store.js');
        await actionLogout();
        navigate(ROUTES.AUTH);
      }
    });
  }

  // Subscribe to store
  const unsub = subscribe(newState => render(newState));
  render(getState()); // initial render
  return unsub;
}
