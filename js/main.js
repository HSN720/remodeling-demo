/* ============================================================
   ALDERMERE — interactions
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  /* ---------- Loader ---------- */
  function dismissLoader(loader) {
    loader.classList.add('is-done');
    document.body.style.overflow = '';
    const hero = document.getElementById('hero');
    if (hero) hero.classList.add('is-ready'); // triggers the hero entrance
  }

  function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    if (!loader) {
      const hero = document.getElementById('hero');
      if (hero) hero.classList.add('is-ready');
      return;
    }

    let p = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setTimeout(() => dismissLoader(loader), 220);
    };
    const tick = () => {
      p += Math.random() * 18 + 6;
      if (p >= 100) p = 100;
      if (fill) fill.style.width = p + '%';
      if (p < 100) setTimeout(tick, 110);
      else finish();
    };
    // (No scroll lock — the loader covers the viewport; locking could trap the
    // page if dismissal ever fails.)
    if (reduceMotion) {
      if (fill) fill.style.width = '100%';
      dismissLoader(loader);
    } else {
      setTimeout(tick, 200);
    }
    // Safety fallback
    window.addEventListener('load', () => setTimeout(finish, 1800));
    setTimeout(finish, 4000);
  }

  /* ---------- Navbar: scrolled + hide on scroll-down ---------- */
  function initNav() {
    const nav = document.getElementById('nav');
    const hero = document.getElementById('hero');
    if (!nav) return;
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const heroH = hero ? hero.offsetHeight : window.innerHeight;

      // Solidify after leaving the hero's first viewport
      if (y > window.innerHeight * 0.85) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');

      // Hide on downward scroll, reveal on up — only past the hero
      if (y > heroH && y > lastY + 4) nav.classList.add('is-hidden');
      else if (y < lastY - 4) nav.classList.remove('is-hidden');

      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    const close = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      menu.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  /* ---------- Hero: scroll-scrubbed video ----------
     Reliable, simple method: on every scroll update we set video.currentTime
     DIRECTLY from scroll progress. No ticker loop, no targetTime smoothing
     (continuous seeking when idle thrashes the decoder and looks "frozen").
     The video is only ever loaded + paused; currentTime is the only thing touched.

     NOTE: For genuinely smooth scroll-scrubbing the MP4 must be encoded with
     frequent keyframes, otherwise seeks snap to the nearest keyframe and look
     choppy. Recommended re-encode:
       ffmpeg -i hero-section1.mp4 -vf "scale=1920:-2" -c:v libx264 -preset slow \
         -crf 18 -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p \
         -movflags +faststart hero-section1-scrub.mp4
     Then point the <source> at the dense-keyframe file.
  */
  // Prepare a video purely for scrubbing: loaded + paused, never autoplay/loop.
  function prepScrubVideo(video) {
    video.loop = false;
    video.muted = true;
    video.autoplay = false;
    video.removeAttribute('autoplay');
    try { video.pause(); video.currentTime = 0; } catch (e) {}
  }

  // One-time, muted "prime": as soon as the video can play, briefly play() then
  // immediately pause(). This activates the decoder so that scrubbed currentTime
  // seeks actually PAINT frames on every host (a large second video often shows
  // only its first state until it has been activated — which is why the hero
  // scrubbed but the middle video looked like a static image on the deployed
  // site). It is NOT autoplay: it pauses on the same tick and only scrubs on
  // scroll thereafter.
  function primeVideo(video) {
    var primed = false;
    var doPrime = function () {
      if (primed) return;
      primed = true;
      try {
        var p = video.play();
        if (p && p.then) p.then(function () { video.pause(); }).catch(function () { try { video.pause(); } catch (e) {} });
        else video.pause();
      } catch (err) {}
      console.log('[' + (video.id || 'video') + '] primed (decoder activated)');
    };
    // Prime the moment there's enough data to render a frame, regardless of scroll.
    if (video.readyState >= 2) doPrime();
    else {
      video.addEventListener('canplay', doPrime, { once: true });
      video.addEventListener('loadeddata', doPrime, { once: true });
    }
    // Belt-and-suspenders: also kick off loading immediately.
    try { video.load(); } catch (e) {}
  }

  // Create a pinned, scroll-scrubbed video section. progress 0 = start, 1 = end.
  // Scrolling down advances the video, scrolling up reverses it (native to scroll position).
  function createScrubVideo(opts) {
    const ST = window.ScrollTrigger;
    const video = opts.video;
    const label = (opts.section && opts.section.id) || 'video';
    const srcEl = video.querySelector('source');

    // ---- Debug logs (compare [hero] vs [showcase] in the console) ----
    console.log('[' + label + '] video element found:', !!video, '#' + video.id);
    console.log('[' + label + '] video src:', (srcEl && srcEl.getAttribute('src')) || video.currentSrc || '(none)');
    video.addEventListener('loadedmetadata', function () {
      console.log('[' + label + '] loadedmetadata — duration =', video.duration, 's');
    });
    video.addEventListener('loadeddata', function () {
      console.log('[' + label + '] loadeddata (first frame available)');
    });
    video.addEventListener('error', function () {
      console.error('[' + label + '] VIDEO ERROR — code', video.error && video.error.code, video.error && video.error.message);
    });
    if (srcEl) srcEl.addEventListener('error', function () {
      console.error('[' + label + '] SOURCE FAILED TO LOAD:', srcEl.src);
    });

    // Create the pin SYNCHRONOUSLY and in document order (hero before showcase via
    // refreshPriority). The pin does NOT need the video loaded — onUpdate guards
    // `if (!video.duration) return`, so durations are never NaN. Building both pins
    // up-front (instead of waiting on each video's metadata) is what keeps the pin
    // spacing correct: otherwise the showcase can get measured before the hero's
    // pin spacer exists and the two pinned sections overlap.
    ST.create({
      trigger: opts.section,
      start: 'top top',
      end: opts.end || '+=500%',
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      refreshPriority: opts.refreshPriority || 0, // higher = measured first
      onUpdate: (self) => {
        if (opts.onProgress) opts.onProgress(self.progress);
        if (!video.duration) return; // NaN-safe (e.g. video not loaded yet / failed)
        video.currentTime = self.progress * video.duration; // direct, continuous mapping
      },
    });
    console.log('[' + label + '] ScrollTrigger created (pinned scrub)');

    // Recompute bounds once the video data arrives (a missing/slow video can never
    // break layout — the pin already exists and the scene shows its fallback image).
    video.addEventListener('loadeddata', function () {
      try { ST.refresh(); } catch (e) {}
    }, { once: true });
  }

  // Fallback (no GSAP): tall sticky track, direct currentTime from scroll position.
  function fallbackScrubVideo(opts) {
    const section = opts.section;
    const video = opts.video;
    section.classList.add('is-fallback');
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / (scrollable || 1), 0, 1);
      if (opts.onProgress) opts.onProgress(p);
      const d = video.duration;
      if (d && isFinite(d)) {
        try { video.currentTime = p * d; } catch (e) {}
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (video.readyState >= 1) update();
    else video.addEventListener('loadedmetadata', update, { once: true });
  }

  /* ---------- Hero + middle showcase: scroll-scrubbed videos ----------
     The video is only ever loaded + paused; currentTime is the only thing touched.
     NOTE: For smooth scroll-scrubbing the MP4 must be encoded with frequent
     keyframes, else seeks snap to the nearest keyframe and look choppy:
       ffmpeg -i in.mp4 -vf "scale=1920:-2" -c:v libx264 -preset slow -crf 18 \
         -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p \
         -movflags +faststart out-scrub.mp4
  */
  function initHero() {
    const hero = document.getElementById('hero');
    const heroContent = document.getElementById('heroContent');
    const heroVideo = document.getElementById('heroVideo');
    const showcase = document.getElementById('showcase');
    const middleVideo = document.getElementById('middleVideo');

    const videos = [heroVideo, middleVideo].filter(Boolean);
    videos.forEach(prepScrubVideo);

    // Continuous headline fade for the hero (linear ramp — no stages/snap points).
    const heroFade = (p) => {
      if (!heroContent) return;
      const fade = clamp(1 - (p - 0.04) / 0.34, 0, 1);
      heroContent.style.opacity = fade.toFixed(3);
      heroContent.style.transform = 'translateY(' + (p * -34).toFixed(1) + 'px)';
    };

    // Reduced motion: hold a single still frame on each video, no pinning.
    if (reduceMotion) {
      videos.forEach((v) => {
        const paint = () => { try { v.currentTime = 0; } catch (e) {} };
        if (v.readyState >= 1) paint();
        else v.addEventListener('loadedmetadata', paint, { once: true });
      });
      return;
    }

    // Prime each video so seeked frames paint reliably on every host.
    videos.forEach(primeVideo);

    const gsap = window.gsap;
    const ST = window.ScrollTrigger;

    if (gsap && ST) {
      gsap.registerPlugin(ST);

      // Pinned scroll-scrubbing only measures correctly when the pins are computed
      // from the top of the page. If the browser restores a mid-page scroll on
      // reload or back-navigation, ScrollTrigger measures the pins at that offset
      // and the hero pin gets a NEGATIVE start — so at the top of the page the hero
      // video is already scrubbed into the middle of the clip ("starting late /
      // starting in the middle"). Take ownership of scroll restoration and force a
      // top-of-page start so pin geometry is always measured from 0.
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      if (ST.clearScrollMemory) ST.clearScrollMemory();
      window.scrollTo(0, 0);

      // Create pins in document order with refreshPriority so the hero (higher on
      // the page) is always measured BEFORE the showcase — this prevents the two
      // pinned sections from overlapping.
      if (hero && heroVideo) {
        createScrubVideo({ section: hero, video: heroVideo, end: '+=500%', onProgress: heroFade, refreshPriority: 2 });
      }
      if (showcase && middleVideo) {
        createScrubVideo({ section: showcase, video: middleVideo, end: '+=500%', refreshPriority: 1 });
      }

      // Always measure pin geometry from scroll 0, then restore the user's position.
      // Refreshing while scrolled into a pinned section corrupts its start/end (the
      // pinned element is position:fixed mid-measurement), which is the root cause of
      // the offset hero scrub. Jumping to 0 → refresh → back happens within one frame,
      // so it never paints and the user sees no jump.
      const refreshFromTop = () => {
        const y = window.scrollY;
        window.scrollTo(0, 0);
        ST.refresh();
        window.scrollTo(0, y);
      };
      refreshFromTop();
      // Recalculate once everything (fonts, videos) is loaded — pin spacing is then
      // correct even on slow hosts (GitHub Pages).
      window.addEventListener('load', () => setTimeout(refreshFromTop, 200));
    } else {
      if (hero && heroVideo) fallbackScrubVideo({ section: hero, video: heroVideo, onProgress: heroFade });
      if (showcase && middleVideo) fallbackScrubVideo({ section: showcase, video: middleVideo });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Before/After slider ---------- */
  function initBeforeAfter() {
    document.querySelectorAll('[data-ba]').forEach((fig) => {
      const before = fig.querySelector('[data-ba-before]');
      const handle = fig.querySelector('[data-ba-handle]');
      const range = fig.querySelector('[data-ba-range]');
      if (!before || !handle || !range) return;

      const set = (v) => {
        const pct = clamp(v, 0, 100);
        before.style.width = pct + '%';
        handle.style.left = pct + '%';
        range.value = pct;
      };

      range.addEventListener('input', () => set(parseFloat(range.value)));

      // Pointer drag anywhere on the figure for a luxe feel
      let dragging = false;
      const fromEvent = (clientX) => {
        const r = fig.getBoundingClientRect();
        set(((clientX - r.left) / r.width) * 100);
      };
      fig.addEventListener('pointerdown', (e) => {
        dragging = true;
        fig.setPointerCapture(e.pointerId);
        fromEvent(e.clientX);
      });
      fig.addEventListener('pointermove', (e) => {
        if (dragging) fromEvent(e.clientX);
      });
      fig.addEventListener('pointerup', () => (dragging = false));
      fig.addEventListener('pointercancel', () => (dragging = false));

      set(50);
    });
  }

  /* ---------- Architectural scroll marker (light sections only) ---------- */
  function initScrollMarker() {
    const marker = document.getElementById('scrollMarker');
    if (!marker) return;
    // Only the light (white/warm-white) sections — never dark, gray, or video sections.
    const lightEls = Array.from(
      document.querySelectorAll('#services, .whychoose, #process, #projects, #financing')
    );
    if (!lightEls.length) return;

    const PAD = 130; // keep the marker clear of the navbar / bottom edge
    const place = () => {
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight - vh;
      const prog = docH > 0 ? clamp(window.scrollY / docH, 0, 1) : 0;
      const y = PAD + prog * (vh - 2 * PAD);
      marker.style.top = y + 'px';

      let over = false;
      for (const el of lightEls) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) { over = true; break; }
      }
      marker.classList.toggle('is-visible', over);
    };

    // Prefer GSAP ScrollTrigger (it polls scroll position every tick and stays in
    // sync with the pinned sections); fall back to scroll events otherwise.
    const ST = window.ScrollTrigger;
    if (ST) {
      ST.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: place, onRefresh: place });
    }
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place, { passive: true });
    place();
  }

  /* ---------- Init (home-only specials; shared chrome lives in site.js) ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initHero();
    // Before/after sliders are initialized once in site.js (runs on every page),
    // so we don't bind them again here.
    initScrollMarker();
  });
})();
