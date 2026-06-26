/**
 * Toast & Confetti Component
 * ───────────────────────────
 * Self-contained. No dependencies on store — call showToast() from anywhere.
 */

let _container = null;

function getContainer() {
  if (!_container || !document.body.contains(_container)) {
    _container = document.createElement('div');
    _container.id = 'toast-container';
    document.body.appendChild(_container);
  }
  return _container;
}

export function showToast(msg, type = 'default', duration = 3000) {
  const c = getContainer();
  const toast = document.createElement('div');
  toast.className = `toast${type !== 'default' ? ' ' + type : ''}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = msg;
  c.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

export function launchConfetti() {
  const colors = ['#6366f1','#8b5cf6','#22c55e','#f59e0b','#ec4899','#3b82f6','#14b8a6','#f97316'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = [
      `left:${Math.random() * 100}vw`,
      `top:-10px`,
      `background:${colors[i % colors.length]}`,
      `width:${5 + Math.random() * 7}px`,
      `height:${5 + Math.random() * 7}px`,
      `animation-duration:${1.5 + Math.random() * 2}s`,
      `animation-delay:${Math.random() * 0.6}s`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }
}
