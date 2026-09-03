/**
 * EasyCoin Liquid Glass Interaction Engine
 * Implements mouse-driven specular sheen tracking, 3D tilt mechanics, and liquid ripples.
 */
(function () {
  'use strict';

  function initLiquidGlass() {
    // 1. Inject Ambient Liquid Color Orbs to enhance refraction
    var targets = document.querySelectorAll('.cardssec1, .sheetsec1, .voicesec1, .standalone-container');
    targets.forEach(function (sec) {
      if (sec.querySelector('.liquid-orbs-container')) return;
      var orbsContainer = document.createElement('div');
      orbsContainer.className = 'liquid-orbs-container';
      orbsContainer.setAttribute('aria-hidden', 'true');
      orbsContainer.innerHTML = `
        <div class="liquid-orb liquid-orb-1"></div>
        <div class="liquid-orb liquid-orb-2"></div>
        <div class="liquid-orb liquid-orb-3"></div>
      `;
      if (getComputedStyle(sec).position === 'static') {
        sec.style.position = 'relative';
      }
      sec.insertBefore(orbsContainer, sec.firstChild);
    });

    // 2. Dynamic Specular Light & 3D Tilt on Glass Cards
    var glassCards = document.querySelectorAll('.card-item, .feat-box, .voice-card, .senior-tile, .action-tile, .showcase-feat-item');
    glassCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');

        // Subtle 3D Tilt (Reduced on mobile/touch)
        if (window.innerWidth > 900) {
          var centerX = rect.width / 2;
          var centerY = rect.height / 2;
          var rotateX = ((y - centerY) / centerY) * -4.5;
          var rotateY = ((x - centerX) / centerX) * 4.5;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        }
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });

    // 3. Liquid Click Ripple Effect on Interactive Elements
    var rippleTargets = document.querySelectorAll('.liquid-glass-btn, .dlrtt-cta, .hero-cta-main, .hero-cta-sec, .action-tile, .senior-tile, .send-action-btn, .key-btn, .ctrl-btn');
    rippleTargets.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        var ripple = document.createElement('span');
        ripple.className = 'liquid-ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        btn.appendChild(ripple);

        setTimeout(function () {
          if (ripple.parentElement) {
            ripple.parentElement.removeChild(ripple);
          }
        }, 750);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initLiquidGlass);
  window.initLiquidGlass = initLiquidGlass;
})();
