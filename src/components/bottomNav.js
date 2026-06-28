/**
 * Bottom Navigation Bar (mobile)
 * ───────────────────────────────
 * Visible only on screens ≤ 768px via CSS.
 * Mirrors the topbar nav links with larger tap targets for thumbs.
 * Subscribes to route changes so the active tab stays in sync.
 */

import { ROUTES } from '../core/constants.js';
import { getState, subscribe } from '../core/store.js';

const NAV_ITEMS = [
  { route: ROUTES.TRACKER,  label: 'Tracker',  icon: '✅' },
  { route: ROUTES.HISTORY,  label: 'History',  icon: '📅' },
  { route: ROUTES.SETTINGS, label: 'Settings', icon: '⚙️' },
];

function html(currentRoute) {
  const items = NAV_ITEMS.map(item => {
    const active = currentRoute === item.route;
    return `
    <a href="${item.route}"
       class="bn-item${active ? ' active' : ''}"
       aria-current="${active ? 'page' : 'false'}"
       aria-label="${item.label}">
      <span class="bn-icon" aria-hidden="true">${item.icon}</span>
      <span class="bn-label">${item.label}</span>
    </a>`;
  }).join('');

  return `<nav id="bottom-nav" class="bottom-nav" aria-label="Main navigation">${items}</nav>`;
}

export function mountBottomNav(container) {
  function render(state) {
    const existing = document.getElementById('bottom-nav');
    const wrapper  = document.createElement('div');
    wrapper.innerHTML = html(state.currentRoute);
    const newEl = wrapper.firstElementChild;

    if (existing) {
      existing.replaceWith(newEl);
    } else {
      container.appendChild(newEl);
    }
  }

  const unsub = subscribe(state => render(state));
  render(getState());
  return unsub;
}
