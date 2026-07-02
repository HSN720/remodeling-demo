/* ============================================================
   ALDERMERE — shared site chrome (header / footer / CTA) + interactions
   Injected on every page so navigation stays consistent.
   ============================================================ */
(function () {
  'use strict';

  // Mark that JS is active. CSS only HIDES content for animation under `.js`,
  // so if this script never runs the full UI still renders (no blank page).
  document.documentElement.classList.add('js');

  var body = document.body;
  var page = body.getAttribute('data-page') || '';
  var isHome = page === 'home';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PHONE = '800.555.1234';
  var PHONE_HREF = 'tel:+18005551234';
  var EMAIL = 'design@aldermere.com';

  /* ---------- Markup ---------- */
  var NAV =
    '<div class="nav__inner">' +
      '<a class="nav__brand" href="index.html" aria-label="Aldermere home">' +
        '<span class="nav__brand-mark">ALDERMERE</span>' +
        '<span class="nav__brand-sub">Remodeling &amp; Custom Homes</span>' +
      '</a>' +
      '<nav class="nav__links" aria-label="Primary">' +
        '<a href="index.html" data-nav="home">Home</a>' +
        '<a href="about.html" data-nav="about">About</a>' +
        '<div class="nav__item nav__item--has-menu">' +
          '<a href="services.html" class="nav__top" data-nav="services">Services</a>' +
          '<div class="nav__menu">' +
            '<a href="kitchen-remodeling.html">Kitchen Remodeling</a>' +
            '<a href="bathroom-remodeling.html">Bathroom Remodeling</a>' +
            '<a href="whole-home-remodeling.html">Whole Home Remodeling</a>' +
            '<a href="home-additions.html">Home Additions</a>' +
            '<a href="outdoor-living.html">Outdoor Living</a>' +
            '<a href="services.html" class="nav__menu-all">View All Services &rarr;</a>' +
          '</div>' +
        '</div>' +
        '<a href="portfolio.html" data-nav="portfolio">Portfolio</a>' +
        '<a href="blog.html" data-nav="blog">Insights</a>' +
      '</nav>' +
      '<div class="nav__actions">' +
        '<a href="' + PHONE_HREF + '" class="nav__phone">' + PHONE + '</a>' +
        '<a href="contact.html" class="btn btn--solid nav__cta">Free Consultation</a>' +
      '</div>' +
      '<button class="nav__toggle" id="navToggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>' +
    '</div>';

  var MOBILE =
    '<nav class="mobile-menu__links" aria-label="Mobile">' +
      '<a href="index.html">Home</a>' +
      '<a href="about.html">About</a>' +
      '<a href="services.html">Services</a>' +
      '<a href="portfolio.html">Portfolio</a>' +
      '<a href="blog.html">Insights</a>' +
      '<a href="faq.html">FAQ</a>' +
      '<a href="contact.html" class="btn btn--solid">Free Consultation</a>' +
    '</nav>';

  var CTA =
    '<section class="cta-band">' +
      '<div class="container cta-band__inner">' +
        '<span class="eyebrow eyebrow--light">Begin Your Transformation</span>' +
        '<h2>Ready to design something extraordinary?</h2>' +
        '<p>Schedule your complimentary consultation. We&rsquo;ll walk your home, understand your vision, and show you exactly what&rsquo;s possible.</p>' +
        '<div class="cta-band__actions">' +
          '<a href="contact.html" class="btn btn--solid btn--lg">Get Free Consultation</a>' +
          '<a href="' + PHONE_HREF + '" class="btn btn--ghost btn--lg">Call ' + PHONE + '</a>' +
        '</div>' +
      '</div>' +
    '</section>';

  var FOOTER =
    '<footer class="footer">' +
      '<div class="container footer__inner">' +
        '<div class="footer__brand">' +
          '<span class="footer__mark">ALDERMERE</span>' +
          '<p>Luxury home remodeling, renovations, and custom transformations. Designed and built for generations across Fairfield County.</p>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h4>Services</h4>' +
          '<a href="kitchen-remodeling.html">Kitchen Remodeling</a>' +
          '<a href="bathroom-remodeling.html">Bathroom Remodeling</a>' +
          '<a href="whole-home-remodeling.html">Whole Home Renovations</a>' +
          '<a href="home-additions.html">Home Additions</a>' +
          '<a href="outdoor-living.html">Outdoor Living</a>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h4>Company</h4>' +
          '<a href="about.html">About Us</a>' +
          '<a href="portfolio.html">Portfolio</a>' +
          '<a href="blog.html">Insights</a>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h4>Resources</h4>' +
          '<a href="faq.html">FAQ</a>' +
          '<a href="contact.html">Contact</a>' +
          '<a href="' + PHONE_HREF + '">' + PHONE + '</a>' +
          '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a>' +
        '</div>' +
        '<div class="footer__col">' +
          '<h4>Studio</h4>' +
          '<span class="footer__addr">128 Greenwich Avenue<br />Greenwich, CT 06830</span>' +
          '<span class="footer__addr">Mon&ndash;Fri 9&ndash;6 &middot; Sat by appointment</span>' +
        '</div>' +
      '</div>' +
      '<div class="container footer__bar">' +
        '<span>&copy; <span class="js-year">2026</span> Aldermere Remodeling &amp; Custom Homes. Licensed &amp; Insured.</span>' +
        '<span class="footer__legal"><a href="faq.html">FAQ</a><a href="contact.html">Contact</a></span>' +
      '</div>' +
    '</footer>';

  /* ---------- Inject chrome (only when placeholders exist) ----------
     The static export bakes the header/footer directly into the HTML, so this
     injection is skipped there and only runs in the source/dev project. */
  var header = document.getElementById('site-header');
  if (header) {
    header.className = 'nav';
    header.id = 'nav';
    header.innerHTML = NAV;

    var mm = document.createElement('div');
    mm.className = 'mobile-menu';
    mm.id = 'mobileMenu';
    mm.setAttribute('aria-hidden', 'true');
    mm.innerHTML = MOBILE;
    body.appendChild(mm);
  }

  var footHost = document.getElementById('site-footer');
  if (footHost) {
    // Skip the shared CTA band on the home page, or when a page provides its own
    // hardcoded .cta-band (so a page can customize its call-to-action without
    // ending up with two stacked bands).
    var hasOwnCta = !!document.querySelector('.cta-band');
    footHost.outerHTML = (isHome || hasOwnCta ? '' : CTA) + FOOTER;
  }

  // Trigger the hero entrance independent of main.js (so it never stays hidden).
  var heroEl = document.getElementById('hero');
  if (heroEl) heroEl.classList.add('is-ready');

  /* ---------- Active nav link ---------- */
  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var activeMap = {
    'index.html': 'home',
    'about.html': 'about',
    'services.html': 'services',
    'kitchen-remodeling.html': 'services',
    'bathroom-remodeling.html': 'services',
    'whole-home-remodeling.html': 'services',
    'home-additions.html': 'services',
    'outdoor-living.html': 'services',
    'portfolio.html': 'portfolio',
    'blog.html': 'blog',
  };
  // project + blog detail pages keep their parent highlighted
  if (path.indexOf('project-') === 0) activeMap[path] = 'portfolio';
  if (path.indexOf('blog-') === 0) activeMap[path] = 'blog';
  var activeKey = activeMap[path];
  if (activeKey) {
    var link = document.querySelector('.nav__links [data-nav="' + activeKey + '"]');
    if (link) link.classList.add('is-active');
  }

  /* ---------- Year ---------- */
  var y = new Date().getFullYear();
  Array.prototype.forEach.call(document.querySelectorAll('.js-year'), function (el) {
    el.textContent = y;
  });

  /* ---------- Nav scrolled state ---------- */
  (function () {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var threshold = isHome ? window.innerHeight * 0.85 : 70;
    var onScroll = function () {
      if (window.scrollY > threshold) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.gsap && window.ScrollTrigger) {
      // gsap drives updates reliably even where raw scroll events are throttled
      window.ScrollTrigger.create({ start: 0, end: 'max', onUpdate: onScroll, onRefresh: onScroll });
    }
    onScroll();
  })();

  /* ---------- Mobile menu ---------- */
  (function () {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;
    var close = function () {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      body.style.overflow = '';
    };
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      menu.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      body.style.overflow = open ? 'hidden' : '';
    });
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', close);
    });
  })();

  /* ---------- Reveal on scroll ---------- */
  (function () {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  })();

  /* ---------- FAQ accordion ---------- */
  (function () {
    var items = document.querySelectorAll('.faq__item');
    Array.prototype.forEach.call(items, function (item) {
      var q = item.querySelector('.faq__q');
      var a = item.querySelector('.faq__a');
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var open = item.classList.toggle('is-open');
        a.style.maxHeight = open ? a.scrollHeight + 'px' : '';
      });
    });
  })();

  /* ---------- Before / After comparison slider ---------- */
  (function () {
    var clamp = function (n, min, max) { return Math.min(Math.max(n, min), max); };
    Array.prototype.forEach.call(document.querySelectorAll('[data-ba]'), function (fig) {
      var before = fig.querySelector('[data-ba-before]');
      var handle = fig.querySelector('[data-ba-handle]');
      var range = fig.querySelector('[data-ba-range]');
      if (!before || !handle || !range) return;

      var set = function (v) {
        var pct = clamp(v, 0, 100);
        // Reveal the full-size "before" layer with a clip instead of resizing it,
        // so it stays pixel-aligned with the "after" layer beneath.
        before.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        handle.style.left = pct + '%';
        range.value = pct;
      };
      range.addEventListener('input', function () { set(parseFloat(range.value)); });

      var dragging = false;
      var fromEvent = function (clientX) {
        var r = fig.getBoundingClientRect();
        set(((clientX - r.left) / r.width) * 100);
      };
      fig.addEventListener('pointerdown', function (e) { dragging = true; fig.setPointerCapture(e.pointerId); fromEvent(e.clientX); });
      fig.addEventListener('pointermove', function (e) { if (dragging) fromEvent(e.clientX); });
      fig.addEventListener('pointerup', function () { dragging = false; });
      fig.addEventListener('pointercancel', function () { dragging = false; });

      set(50);
    });
  })();

  /* ---------- Forms (front-end confirmation) ---------- */
  (function () {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-form]'), function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.createElement('div');
        msg.className = 'form__success';
        msg.textContent =
          'Thank you — your request has been received. An Aldermere design consultant will contact you within one business day.';
        form.replaceWith(msg);
      });
    });
  })();

  window.__siteReady = true;
})();
