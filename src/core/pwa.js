/**
 * PWA Bootstrap
 * ──────────────
 * Registers the service worker, generates PNG icons on first run,
 * and wires up the install prompt banner.
 */

// ── Service Worker registration ───────────────────────────────────────────────
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });

    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // A new version is ready — show a soft update toast
          import('./store.js').then(({ getState }) => {
            import('../components/toast.js').then(({ showToast }) => {
              showToast('🔄 Update available — refresh to apply', 'default', 6000);
            });
          });
        }
      });
    });

    return reg;
  } catch (err) {
    console.warn('[PWA] SW registration failed:', err);
    return null;
  }
}

// ── PNG icon generator ────────────────────────────────────────────────────────
// Generates icons into Cache Storage so the SW can serve them.
// Only runs when icons aren't already cached.
export async function generateIcons() {
  if (!('caches' in window) || !document.createElement('canvas').getContext) return;

  const CACHE_NAME = 'habitgrid-icons-v1';
  const cache = await caches.open(CACHE_NAME);
  const sizes = [192, 512];

  for (const size of sizes) {
    const url = `./icons/icon-${size}.png`;
    const existing = await cache.match(url);
    if (existing) continue; // already generated

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#8b5cf6');

    const r = size * 0.18;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Emoji
    ctx.font = `${Math.round(size * 0.52)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✅', size / 2, size / 2 + size * 0.04);

    await new Promise(resolve => {
      canvas.toBlob(async blob => {
        if (blob) {
          await cache.put(url, new Response(blob, {
            headers: { 'Content-Type': 'image/png' }
          }));
        }
        resolve();
      }, 'image/png');
    });
  }
}

// ── Install prompt ────────────────────────────────────────────────────────────
let _deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredPrompt = e;
  // Show install button in UI if present
  document.dispatchEvent(new CustomEvent('pwa:installable'));
});

window.addEventListener('appinstalled', () => {
  _deferredPrompt = null;
  document.dispatchEvent(new CustomEvent('pwa:installed'));
});

export function canInstall() {
  return !!_deferredPrompt;
}

export async function promptInstall() {
  if (!_deferredPrompt) return false;
  _deferredPrompt.prompt();
  const { outcome } = await _deferredPrompt.userChoice;
  _deferredPrompt = null;
  return outcome === 'accepted';
}
