/**
 * EasyCoin Dark / Light Mode Theme Engine
 * Synchronizes top-right sliders, stores user preference, and speaks accessible audio notifications.
 */
(function () {
  'use strict';

  var THEME_KEY = 'easycoin-theme-preference';

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  }

  function applyTheme(theme, announce = false) {
    var isDark = theme === 'dark';
    
    if (isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.add('dark-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    localStorage.setItem(THEME_KEY, theme);

    // Sync all toggle sliders on the page
    var sliders = document.querySelectorAll('.theme-slider-switch input');
    sliders.forEach(function (input) {
      input.checked = isDark;
    });

    // Update Sun / Moon icon highlights
    var sunIcons = document.querySelectorAll('.theme-icon.sun');
    var moonIcons = document.querySelectorAll('.theme-icon.moon');
    sunIcons.forEach(s => isDark ? s.classList.remove('active') : s.classList.add('active'));
    moonIcons.forEach(m => isDark ? m.classList.add('active') : m.classList.remove('active'));

    if (announce && window.EasyAudio) {
      window.EasyAudio.playClick();
      window.EasyAudio.speak(isDark ? 'Dark mode enabled' : 'Light mode enabled');
    }
  }

  function initThemeEngine() {
    var initialTheme = getStoredTheme();
    applyTheme(initialTheme, false);

    // Attach listener to all theme toggles
    document.addEventListener('change', function (e) {
      if (e.target && e.target.classList.contains('theme-toggle-input')) {
        var newTheme = e.target.checked ? 'dark' : 'light';
        applyTheme(newTheme, true);
      }
    });
  }

  window.EasyTheme = {
    toggle: function () {
      var current = getStoredTheme();
      var target = current === 'dark' ? 'light' : 'dark';
      applyTheme(target, true);
    },
    setTheme: applyTheme,
    getTheme: getStoredTheme
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeEngine);
  } else {
    initThemeEngine();
  }
})();
