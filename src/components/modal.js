/**
 * Modal Manager
 * ──────────────
 * Lightweight modal stack. Supports multiple layered modals.
 * Each modal is a self-contained DOM node appended to body.
 */

let _stack = [];

export function openModal(contentHTML, { id = null, maxWidth = '480px', onClose = null } = {}) {
  const modalId = id || 'modal-' + Date.now();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = modalId;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="modal" style="max-width:${maxWidth}">
      ${contentHTML}
    </div>`;

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(modalId);
  });

  document.body.appendChild(overlay);
  _stack.push({ id: modalId, onClose });

  // Trap focus
  const first = overlay.querySelector('input, button, select, textarea, [tabindex]');
  if (first) setTimeout(() => first.focus(), 40);

  return modalId;
}

export function closeModal(id = null) {
  const targetId = id ?? _stack[_stack.length - 1]?.id;
  if (!targetId) return;
  const el = document.getElementById(targetId);
  if (el) {
    el.style.animation = 'fadeIn .15s ease reverse forwards';
    setTimeout(() => el.remove(), 120);
  }
  const entry = _stack.find(s => s.id === targetId);
  if (entry?.onClose) entry.onClose();
  _stack = _stack.filter(s => s.id !== targetId);
}

export function closeAllModals() {
  [..._stack].forEach(s => closeModal(s.id));
}

// Escape key closes top modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && _stack.length > 0) closeModal();
});
