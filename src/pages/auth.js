/**
 * Auth Page — Login & Register
 * ─────────────────────────────
 * Auth-ready UI backed by localStorage. When a real backend is added,
 * only the actionLogin/actionRegister functions in store.js change.
 */

import { actionLogin, actionRegister } from '../core/store.js';
import { navigate } from '../core/router.js';
import { ROUTES } from '../core/constants.js';
import { showToast } from '../components/toast.js';
import { escHtml } from '../components/shared.js';

function renderAuthPage(mode = 'login') {
  const isLogin = mode === 'login';
  return `
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <span class="auth-logo">✅</span>
        <h1 class="auth-title">HabitGrid</h1>
        <p class="auth-subtitle">Build habits that stick</p>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab${isLogin ? ' active' : ''}" data-mode="login">Sign In</button>
        <button class="auth-tab${!isLogin ? ' active' : ''}" data-mode="register">Create Account</button>
      </div>

      <form id="auth-form" class="auth-form" novalidate>
        ${!isLogin ? `
        <div class="form-group">
          <label class="form-label" for="auth-name">Full Name</label>
          <input id="auth-name" class="form-input" type="text"
            placeholder="Your name" autocomplete="name" required />
        </div>` : ''}
        <div class="form-group">
          <label class="form-label" for="auth-email">Email</label>
          <input id="auth-email" class="form-input" type="email"
            placeholder="you@example.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="auth-password">Password</label>
          <div class="password-wrap">
            <input id="auth-password" class="form-input" type="password"
              placeholder="••••••••" autocomplete="${isLogin ? 'current-password' : 'new-password'}"
              minlength="6" required />
            <button type="button" class="password-toggle" data-action="toggle-pw"
              aria-label="Toggle password visibility">👁</button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary auth-submit" id="auth-submit">
          ${isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div class="auth-divider"><span>or</span></div>
      <button class="btn btn-ghost auth-guest" data-action="continue-guest">
        Continue without account
      </button>

      <p class="auth-legal">
        Your data is stored locally in this browser.
        ${!isLogin ? 'No email verification required.' : ''}
      </p>
    </div>
  </div>`;
}

export function mountAuthPage(container) {
  let _mode = 'login';

  function render() {
    container.innerHTML = renderAuthPage(_mode);
    bindEvents();
  }

  function bindEvents() {
    // Tab switch
    container.querySelectorAll('.auth-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _mode = btn.dataset.mode;
        render();
      });
    });

    // Password toggle
    container.querySelector('[data-action="toggle-pw"]')?.addEventListener('click', e => {
      const inp = container.querySelector('#auth-password');
      inp.type = inp.type === 'password' ? 'text' : 'password';
      e.currentTarget.textContent = inp.type === 'password' ? '👁' : '🙈';
    });

    // Guest mode
    container.querySelector('[data-action="continue-guest"]')?.addEventListener('click', () => {
      navigate(ROUTES.TRACKER);
    });

    // Form submit
    container.querySelector('#auth-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = container.querySelector('#auth-submit');
      btn.disabled = true;
      btn.textContent = '...';

      try {
        const email    = container.querySelector('#auth-email').value.trim();
        const password = container.querySelector('#auth-password').value;

        if (_mode === 'login') {
          await actionLogin({ email, password });
          showToast('Welcome back! 👋', 'success');
        } else {
          const name = container.querySelector('#auth-name')?.value.trim() || 'User';
          await actionRegister({ name, email, password });
          showToast('Account created! 🎉', 'success');
        }
        navigate(ROUTES.TRACKER);
      } catch (err) {
        showToast(err.message || 'Something went wrong.', 'error');
        btn.disabled = false;
        btn.textContent = _mode === 'login' ? 'Sign In' : 'Create Account';
      }
    });
  }

  render();
}
