/**
 * Shared UI Primitives
 * ─────────────────────
 * Tiny helper functions used by multiple components/pages.
 * Import from here to keep things DRY.
 */

import { CATEGORY_META } from '../core/constants.js';

export function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderProgressBar(count, goal, compact = false) {
  const pct = goal > 0 ? Math.min(100, Math.round((count / goal) * 100)) : 0;
  const cls = pct >= 100 ? 'done' : pct >= 60 ? 'close' : 'low';
  if (compact) {
    return `
    <div class="prog-bar-track" title="${count}/${goal} days (${pct}%)">
      <div class="prog-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>`;
  }
  return `
  <div class="cell-prog">
    <div class="prog-top">
      <span class="prog-count">${count}</span>
      <span class="prog-sep">/</span>
      <span class="prog-goal">${goal}</span>
      <span class="prog-pct ${cls}">${pct}%</span>
    </div>
    <div class="prog-bar-track">
      <div class="prog-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>
  </div>`;
}

export function renderStatCard(colorClass, icon, label, value, sub) {
  return `
  <div class="stat-card ${colorClass}">
    <div class="stat-icon">${icon}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-sub">${sub}</div>
  </div>`;
}

export function renderCategoryBadge(category) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;
  return `<span class="habit-cat-badge ${meta.color}">${category}</span>`;
}

export function renderEmptyState({ icon = '📋', title, body, actionHtml = '' } = {}) {
  return `
  <div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <h2>${escHtml(title)}</h2>
    <p>${escHtml(body)}</p>
    ${actionHtml}
  </div>`;
}

export function renderPageHeader(title, subtitle = '', actionsHtml = '') {
  return `
  <div class="page-header">
    <div class="page-header-text">
      <h1 class="page-title">${escHtml(title)}</h1>
      ${subtitle ? `<p class="page-subtitle">${escHtml(subtitle)}</p>` : ''}
    </div>
    ${actionsHtml ? `<div class="page-header-actions">${actionsHtml}</div>` : ''}
  </div>`;
}
