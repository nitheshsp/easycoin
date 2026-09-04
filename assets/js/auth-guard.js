/**
 * EasyCoin Authentication Guard & Senior Session Manager
 * Enforces single-entry flow:
 * - Directs unauthenticated users to index.html / login.html.
 * - Manages user accounts database in localStorage ('easycoin_users_db').
 * - Powers multi-user sessions, personalized app greeting, and inactivity security.
 */
(function () {
  'use strict';

  var DEFAULT_USERS = [
    {
      id: 'usr_harish_01',
      name: 'Harish Chandra',
      age: 78,
      phone: '9876543210',
      avatar: '👴',
      pin: '1234',
      symbols: ['☀️', '🐄', '🪔'],
      balance: 14250,
      guardianName: 'Daughter Ananya',
      guardianPhone: '+91 98765 43210',
      registeredAt: '15 Feb 2026'
    }
  ];

  function getUsersDB() {
    try {
      var raw = localStorage.getItem('easycoin_users_db');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    localStorage.setItem('easycoin_users_db', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  function saveUserToDB(userObj) {
    var db = getUsersDB();
    var existingIndex = db.findIndex(function (u) {
      return u.phone === userObj.phone || u.id === userObj.id;
    });
    if (existingIndex >= 0) {
      db[existingIndex] = Object.assign({}, db[existingIndex], userObj);
    } else {
      db.unshift(userObj);
    }
    localStorage.setItem('easycoin_users_db', JSON.stringify(db));
    return db;
  }

  class EasyAuthGuard {
    constructor(options = {}) {
      this.requireAuth = options.requireAuth !== false;
      this.inactivityTimeoutMs = 15 * 60 * 1000; // 15 mins for senior comfort
      this.timer = null;

      this.init();
    }

    init() {
      const token = localStorage.getItem('easycoin_auth_token');
      const userRaw = localStorage.getItem('easycoin_user_session');
      const isAppPage = window.location.pathname.endsWith('app.html') || window.location.pathname.includes('/app.html');

      // Strict protection for app.html
      if (isAppPage && (!token || !userRaw)) {
        console.log('🔒 Strict Auth: No active user session detected on app.html. Redirecting to landing.');
        sessionStorage.setItem('easycoin_auth_redirect_msg', 'Please Sign In or Create an Account first to access your secure bank.');
        window.location.replace('index.html?auth=required');
        return;
      }

      let user = null;
      if (userRaw) {
        try { user = JSON.parse(userRaw); } catch (e) {}
      }

      if (user) {
        this.injectUserBanner(user);
        this.startInactivityTimer();
        this.bindActivityListeners();
      }
    }

    injectUserBanner(user) {
      // If on index.html or app.html, ensure active user is indicated
      const headerAuthZone = document.getElementById('indexAuthZone');
      if (headerAuthZone) {
        headerAuthZone.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="display:flex; align-items:center; gap:6px; background:rgba(0,61,209,0.08); padding:6px 12px; border-radius:999px; border:1px solid rgba(0,61,209,0.2);">
              <span style="font-size:16px;">${user.avatar || '👴'}</span>
              <span style="font-size:13px; font-weight:800; color:var(--text-main,#0F172A);">${user.name}</span>
            </div>
            <a href="app.html" class="dlrtt-cta" style="padding:8px 14px; font-size:13px;">
              Open Bank →
            </a>
            <button type="button" class="dlrtt-btn2" onclick="window.EasyGuard.logout()" title="Sign out of current account" style="padding:7px 10px; font-size:12px; color:#DC2626;">
              🚪 Exit
            </button>
          </div>
        `;
      }
    }

    startInactivityTimer() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (window.EasyAudio) {
          window.EasyAudio.speak('Your session was safely locked due to inactivity to protect your account.');
        }
        sessionStorage.setItem('easycoin_session_timeout', 'true');
        setTimeout(() => this.logout(), 1000);
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
        window.EasyAudio.speak('You have been signed out safely. Returning to home.');
      }
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    }

    static getCurrentUser() {
      try {
        const raw = localStorage.getItem('easycoin_user_session');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    static isAuthenticated() {
      return !!(localStorage.getItem('easycoin_auth_token') && localStorage.getItem('easycoin_user_session'));
    }

    static setCurrentUser(userObj, tokenStr) {
      const token = tokenStr || ('jwt_senior_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
      localStorage.setItem('easycoin_auth_token', token);
      localStorage.setItem('easycoin_user_session', JSON.stringify(userObj));
      saveUserToDB(userObj);
      return { token, user: userObj };
    }

    static getAllUsers() {
      return getUsersDB();
    }

    static registerUser(userData) {
      const newUser = {
        id: 'usr_' + Date.now().toString(36),
        name: userData.name || 'New Senior Member',
        age: Number(userData.age) || 65,
        phone: userData.phone || '9876543210',
        avatar: userData.avatar || '👴',
        pin: userData.pin || '1234',
        symbols: userData.symbols || ['☀️', '🐄', '🪔'],
        balance: Number(userData.balance) || 10000,
        guardianName: userData.guardianName || 'Family Guardian',
        guardianPhone: userData.guardianPhone || '+91 98765 43210',
        registeredAt: 'Today'
      };

      saveUserToDB(newUser);
      EasyAuthGuard.setCurrentUser(newUser);
      return newUser;
    }
  }

  window.EasyGuard = EasyAuthGuard;

  // Immediately check protection on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new EasyAuthGuard());
  } else {
    new EasyAuthGuard();
  }
})();
