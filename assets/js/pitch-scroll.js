/**
 * EasyCoin Kinetic Typography Pitch Scroll Engine
 * Progressively reveals words with opacity on scroll, handles interactive inline switches, and triggers SVG animations.
 */
(function () {
  'use strict';

  function initPitchScroll() {
    var pitchSec = document.querySelector('.dlrtt-pitch');
    if (!pitchSec) return;

    var words = pitchSec.querySelectorAll('.pw, .pic');
    var toggle = pitchSec.querySelector('.dlrtt-otgl');

    // Handle interactive toggle switch
    if (toggle) {
      toggle.addEventListener('click', function () {
        this.classList.toggle('go');
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          if (this.classList.contains('go')) {
            window.EasyAudio.speak('Voice Assist Mode Activated');
          } else {
            window.EasyAudio.speak('Voice Assist Mode Deactivated');
          }
        }
      });
      toggle.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.click();
        }
      });
    }

    // Scroll-driven word lighting
    function onScroll() {
      var rect = pitchSec.getBoundingClientRect();
      var totalScroll = pitchSec.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      var progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
      var count = words.length;

      words.forEach(function (w, idx) {
        var threshold = idx / count;
        if (progress >= threshold) {
          w.classList.add('lit');
          if (w.classList.contains('pic')) {
            w.style.opacity = '1';
            w.style.transform = 'scale(1)';
            w.classList.add('go');
          } else {
            w.style.opacity = '1';
            w.style.color = '#00081B';
          }
        } else {
          w.classList.remove('lit');
          if (w.classList.contains('pic')) {
            w.style.opacity = '0.16';
            w.style.transform = 'scale(0.85)';
            w.classList.remove('go');
          } else {
            w.style.opacity = '0.18';
            w.style.color = 'inherit';
          }
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('DOMContentLoaded', initPitchScroll);
  window.initPitchScroll = initPitchScroll;
})();
