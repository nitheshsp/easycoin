/**
 * EasyCoin Authentication Guard & Senior Session Manager
 * Plug-and-play helper for app.html and index.html:
 * - Checks active session token.
 * - Displays active senior badge & Logout button on navbar.
 * - Implements 10-minute senior inactivity auto-guard.
 */
(function () {
  'use strict';

  class EasyAuthGuard {
    constructor(options = {}) {
      this.requireAuth = options.requireAuth !== false; // if true, redirects to login.html if unauthenticated
      this.inactivityTimeoutMs = 10 * 60 * 1000; // 10 minutes
      this.timer = null;

      this.init();
    }

    init() {
      const token = localStorage.getItem('easycoin_auth_token');
      const userRaw = localStorage.getItem('easycoin_user_session');

      if (!token) {
        if (this.requireAuth && !window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html')) {
          console.log('🔒 No active session detected. Redirecting to accessible login.');
          window.location.href = 'login.html';
          return;
        }
      }

      let user = { name: 'Harish Chandra', age: 78, avatar: '👴' };
      if (userRaw) {
        try { user = JSON.parse(userRaw); } catch (e) {}
      }

      this.injectNavbarControls(user);
      this.startInactivityTimer();
      this.bindActivityListeners();
    }

    injectNavbarControls(user) {
      const navControls = document.querySelector('.app-controls') || document.querySelector('.login-accessibility-tools');
      if (!navControls) return;

      // Avoid duplicate injections
      if (document.getElementById('seniorAuthPill')) return;

      const userPill = document.createElement('div');
      userPill.id = 'seniorAuthPill';
      userPill.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #EFF6FF;
        border: 1.5px solid #BFDBFE;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 700;
        color: #1E3A8A;
      `;
      userPill.innerHTML = `
        <span style="font-size:16px;">${user.avatar || '👴'}</span>
        <span>${user.name}</span>
      `;

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'ctrl-btn';
      logoutBtn.title = 'Sign Out of EasyCoin';
      logoutBtn.style.cssText = `
        background: #FEE2E2;
        border-color: #FCA5A5;
        color: #DC2626;
        font-weight: 700;
      `;
      logoutBtn.innerHTML = '🚪 Sign Out';
      logoutBtn.onclick = () => this.logout();

      navControls.prepend(logoutBtn);
      navControls.prepend(userPill);
    }

    startInactivityTimer() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (window.EasyAudio) {
          window.EasyAudio.speak('Your session was safely locked due to inactivity to protect your account.');
        }
        alert('🔒 Auto-Guard: Your session has timed out after 10 minutes of inactivity to safeguard your account.');
        this.logout();
      }, this.inactivityTimeoutMs);
    }

    resetInactivityTimer() {
      this.startInactivityTimer();
    }

    bindActivityListeners() {
      ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
        window.addEventListener(evt, () => this.resetInactivityTimer(), { passive: true });
      });
    }

    logout() {
      localStorage.removeItem('easycoin_auth_token');
      localStorage.removeItem('easycoin_user_session');
      if (window.EasyAudio) {
        window.EasyAudio.speak('You have been signed out safely.');
      }
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
    }
  }

  window.EasyGuard = EasyAuthGuard;

  // Auto-run if explicitly loaded on a page with data-auth-protect
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.hasAttribute('data-auth-protect')) {
      new EasyAuthGuard({ requireAuth: true });
    }
  });
})();
