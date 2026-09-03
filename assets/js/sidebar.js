/**
 * EasyCoin Left Side Menu Bar Engine
 * Controls smooth scroll-spy, responsive drawer navigation, and status badge synchronization.
 */
(function () {
  'use strict';

  function initSidebar() {
    var sidebar = document.getElementById('appSidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var toggleBtn = document.getElementById('sidebarToggleBtn');
    var navItems = document.querySelectorAll('.sidebar-nav-item');
    var sections = [
      document.getElementById('balanceSection'),
      document.getElementById('contactsSection'),
      document.getElementById('billsSection'),
      document.getElementById('circleSection'),
      document.getElementById('txHistorySection'),
      document.getElementById('guardianSection')
    ].filter(Boolean);

    // Mobile Drawer Open / Close
    function openSidebar() {
      if (sidebar) sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sidebar && sidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Smooth Navigation Click Handling
    navItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          var targetId = href.substring(1);
          var targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveNav(href);

            // Announce section via voice if audio is available
            var sectionNames = {
              '#balanceSection': 'Balance and Quick Actions',
              '#contactsSection': '1-Tap Photo Contacts',
              '#billsSection': 'Monthly Bill Reminders',
              '#circleSection': 'UPI Family Circle for Minors',
              '#txHistorySection': 'Transaction History and Spoken Audit',
              '#guardianSection': 'Emergency Anti-Fraud Shield and SOS'
            };
            if (window.EasyAudio && sectionNames[href]) {
              window.EasyAudio.playClick();
            }
          }
          if (window.innerWidth <= 992) {
            closeSidebar();
          }
        }
      });
    });

    function setActiveNav(hash) {
      navItems.forEach(function (link) {
        if (link.getAttribute('href') === hash) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    // Scroll-Spy with IntersectionObserver
    if ('IntersectionObserver' in window && sections.length > 0) {
      var observerOptions = {
        root: null,
        rootMargin: '-15% 0px -65% 0px',
        threshold: 0
      };

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            if (id) {
              setActiveNav('#' + id);
            }
          }
        });
      }, observerOptions);

      sections.forEach(function (section) {
        observer.observe(section);
      });
    } else {
      // Fallback scroll listener
      window.addEventListener('scroll', function () {
        var scrollPos = window.scrollY + 140;
        for (var i = sections.length - 1; i >= 0; i--) {
          var sec = sections[i];
          if (sec.offsetTop <= scrollPos) {
            var id = sec.getAttribute('id');
            setActiveNav('#' + id);
            break;
          }
        }
      });
    }

    // Badge Refresh Mechanism
    function refreshBadges() {
      // Bills badge
      var billsBadge = document.getElementById('sideBillsBadge');
      if (billsBadge && window.EasyBills) {
        var pCount = window.EasyBills.getPendingCount();
        billsBadge.textContent = pCount > 0 ? pCount + ' Due' : 'All Paid';
        billsBadge.style.background = pCount > 0 ? '#FEF3C7' : '#DCFCE7';
        billsBadge.style.color = pCount > 0 ? '#B45309' : '#15803D';
      }

      // Circle badge
      var circleBadge = document.getElementById('sideCircleBadge');
      if (circleBadge && window.EasyCircle && window.EasyCircle.members) {
        var mCount = window.EasyCircle.members.length;
        circleBadge.textContent = mCount + (mCount === 1 ? ' Minor' : ' Minors');
      }

      // Sidebar Balance Sync
      var sidebarBal = document.getElementById('sidebarBalVal');
      if (sidebarBal && window.EasyBanking) {
        sidebarBal.textContent = '₹ ' + window.EasyBanking.getBalance().toLocaleString('en-IN');
      }
    }

    // Periodic & Event-based badge updates
    setTimeout(refreshBadges, 300);
    setInterval(refreshBadges, 2500);

    window.EasySidebar = {
      open: openSidebar,
      close: closeSidebar,
      refreshBadges: refreshBadges
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
