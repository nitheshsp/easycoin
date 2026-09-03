/**
 * EasyCoin Main UI & Navigation Engine
 * Exact match to dlr-test.training sticky glass header, sliding indicators, mobile drawers, and FAQ accordions.
 */
(function () {
  'use strict';

  function initHeader() {
    var hdr = document.getElementById('dlrtt-hdr');
    var navLinks = document.querySelector('.dlrtt-links');
    var indicator = document.querySelector('.dlrtt-links .ind');
    var burger = document.querySelector('.dlrtt-burger');
    var sheet = document.getElementById('dlrtt-sheet');

    // Sticky Header Scroll Listener
    function onScroll() {
      if (window.scrollY > 30) {
        hdr.classList.add('is-stuck');
      } else {
        hdr.classList.remove('is-stuck');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Sliding nav indicator
    if (navLinks && indicator) {
      var links = navLinks.querySelectorAll('.top');
      links.forEach(function (link) {
        link.addEventListener('mouseenter', function () {
          var rect = this.getBoundingClientRect();
          var navRect = navLinks.getBoundingClientRect();
          indicator.style.opacity = '1';
          indicator.style.width = rect.width + 'px';
          indicator.style.transform = 'translateX(' + (rect.left - navRect.left) + 'px)';
        });
      });

      navLinks.addEventListener('mouseleave', function () {
        indicator.style.opacity = '0';
      });
    }

    // Mobile Hamburger & Sheet Drawer
    if (burger && sheet) {
      burger.addEventListener('click', function () {
        var isOpen = sheet.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('dlrtt-noscroll', isOpen);
        if (window.EasyAudio) window.EasyAudio.playClick();
      });

      var sheetItems = sheet.querySelectorAll('.itm, .sh-b');
      sheetItems.forEach(function (item) {
        item.addEventListener('click', function () {
          sheet.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('dlrtt-noscroll');
        });
      });
    }
  }

  // Interactive FAQ Accordion
  function initFAQ() {
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      var questionBtn = item.querySelector('.faq-q');
      if (questionBtn) {
        questionBtn.addEventListener('click', function () {
          var wasOpen = item.classList.contains('is-open');
          faqItems.forEach(function (other) { other.classList.remove('is-open'); });
          if (!wasOpen) {
            item.classList.add('is-open');
          }
          if (window.EasyAudio) window.EasyAudio.playClick();
        });
      }
    });
  }

  // Interactive Pricing / Guarantee Accordion
  function initGuarantee() {
    var garBtns = document.querySelectorAll('.garbtn');
    garBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var li = this.closest('li.gar');
        if (li) {
          li.classList.toggle('is-auf');
          if (window.EasyAudio) window.EasyAudio.playClick();
        }
      });
    });
  }

  // Interactive Readiness Gauge Meter (in Cards section)
  function initGauges() {
    var gaugeDials = document.querySelectorAll('.gauge-circle');
    gaugeDials.forEach(function (dial) {
      var score = parseInt(dial.getAttribute('data-score') || '98', 10);
      var circle = dial.querySelector('circle.progress');
      if (circle) {
        var radius = circle.r.baseVal.value;
        var circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
        
        var offset = circumference - (score / 100) * circumference;
        setTimeout(function () {
          circle.style.strokeDashoffset = offset;
        }, 500);
      }
    });
  }

  // Language Switcher
  function initLangSwitch() {
    var langLinks = document.querySelectorAll('.lang-opt');
    langLinks.forEach(function (opt) {
      opt.addEventListener('click', function (e) {
        e.preventDefault();
        langLinks.forEach(function (l) { l.classList.remove('active'); });
        this.classList.add('active');
        var lang = this.getAttribute('data-lang') || 'en';
        if (window.EasyAudio) {
          window.EasyAudio.voiceLang = lang === 'hi' ? 'hi-IN' : (lang === 'es' ? 'es-ES' : (lang === 'de' ? 'de-DE' : 'en-US'));
          window.EasyAudio.playClick();
          window.EasyAudio.speak(lang === 'hi' ? 'भाषा बदली गई' : 'Language changed to ' + this.textContent.trim());
        }
      });
    });
  }

  // High Contrast Mode Toggle
  function initAccessibilityToggle() {
    var highContrastBtn = document.getElementById('toggleContrastBtn');
    if (highContrastBtn) {
      highContrastBtn.addEventListener('click', function () {
        document.body.classList.toggle('high-contrast-mode');
        var isHigh = document.body.classList.contains('high-contrast-mode');
        if (window.EasyAudio) {
          window.EasyAudio.playClick();
          window.EasyAudio.speak(isHigh ? 'High contrast accessibility mode on' : 'Normal mode on');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initFAQ();
    initGuarantee();
    initGauges();
    initLangSwitch();
    initAccessibilityToggle();

    // Initialize WebGL Fluid Shader on Hero and Guarantee Canvas
    var heroBg = document.querySelector('.hero-flow-bg');
    if (heroBg && window.initHeroFlow) {
      window.initHeroFlow(heroBg, 'hero-canvas');
    }
    var garCard = document.querySelector('.dlrtt-pf-container');
    if (garCard && window.initHeroFlow) {
      window.initHeroFlow(garCard, 'dlrtt-pf-canvas');
    }
  });
})();
