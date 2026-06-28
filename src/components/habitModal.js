/**
 * Habit Add/Edit Modal
 * ─────────────────────
 * Renders the form, wires up internal interactions, returns a Promise
 * that resolves with the saved data or null if cancelled.
 */

import { EMOJIS, CATEGORIES } from '../core/constants.js';
import { openModal, closeModal } from './modal.js';
import { escHtml } from './shared.js';

export function openHabitModal(habit = null) {
  return new Promise(resolve => {
    const isEdit  = !!habit;
    const modalId = 'habit-modal';

    const name     = habit?.name     ?? '';
    const goal     = habit?.goal     ?? 20;
    const category = habit?.category ?? 'Health';
    const emoji    = habit?.emoji    ?? '⭐';

    const emojiGrid = EMOJIS.map(e =>
      `<button type="button" class="emoji-opt${emoji === e ? ' selected' : ''}"
         data-emoji="${e}">${e}</button>`
    ).join('');

    const catOptions = CATEGORIES.map(c =>
      `<option value="${c}"${category === c ? ' selected' : ''}>${c}</option>`
    ).join('');

    const html = `
      <div class="modal-header">
        <h2>${isEdit ? 'Edit Habit' : 'Add New Habit'}</h2>
        <button class="modal-close" data-action="cancel" aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="hm-name">Habit Name</label>
          <input id="hm-name" class="form-input" type="text"
            placeholder="e.g. Morning Run" maxlength="60"
            value="${escHtml(name)}" autocomplete="off" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="hm-goal">Monthly Goal (days)</label>
            <input id="hm-goal" class="form-input" type="number"
              min="1" max="31" value="${goal}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="hm-cat">Category</label>
            <select id="hm-cat" class="form-select">${catOptions}</select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Icon / Emoji</label>
          <div class="emoji-grid" id="hm-emoji-grid">${emojiGrid}</div>
          <input id="hm-emoji" type="hidden" value="${emoji}" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-action="cancel">Cancel</button>
        <button class="btn btn-primary" data-action="save">
          ${isEdit ? 'Save Changes' : 'Add Habit'}
        </button>
      </div>`;

    openModal(html, {
      id: modalId,
      onClose: () => resolve(null),
    });

    const overlay = document.getElementById(modalId);

    // Emoji grid selection
    overlay.addEventListener('click', e => {
      const emojiBtn = e.target.closest('.emoji-opt');
      if (emojiBtn) {
        overlay.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
        emojiBtn.classList.add('selected');
        overlay.querySelector('#hm-emoji').value = emojiBtn.dataset.emoji;
        return;
      }

      const action = e.target.closest('[data-action]')?.dataset.action;

      if (action === 'cancel') {
        closeModal(modalId);
        resolve(null);
        return;
      }

      if (action === 'save') {
        const nameVal = overlay.querySelector('#hm-name').value.trim();
        if (!nameVal) {
          overlay.querySelector('#hm-name').focus();
          overlay.querySelector('#hm-name').classList.add('input-error');
          return;
        }
        const result = {
          name:     nameVal,
          goal:     parseInt(overlay.querySelector('#hm-goal').value, 10) || 20,
          category: overlay.querySelector('#hm-cat').value,
          emoji:    overlay.querySelector('#hm-emoji').value || '⭐',
        };
        closeModal(modalId);
        resolve(result);
      }
    });

    // Ctrl+Enter to save
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.ctrlKey) {
        overlay.querySelector('[data-action="save"]')?.click();
      }
    });
  });
}
