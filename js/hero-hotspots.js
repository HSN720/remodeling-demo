/* ============================================================
   ALDERMERE — interactive portfolio hero (shared)
   The whole hero image is interactive. Each fixed dot owns a large invisible
   proximity zone (radius scales with the image); the cursor's NEAREST qualifying
   dot activates and fades its label in — no need to hit the tiny marker. Clicking
   that area opens the detailed card, which stays until another feature is clicked,
   an outside click, or Escape. Desktop only; mobile uses the highlights rail.
   ============================================================ */
(function () {
  'use strict';
  var stage = document.getElementById('kstage');
  var frame = document.getElementById('kframe');
  var img = document.getElementById('kimg');
  var panel = document.getElementById('kpanel');
  if (!stage || !frame || !img || !panel) return;

  var pTitle = document.getElementById('kptitle');
  var pDesc = document.getElementById('kpdesc');
  var pClose = document.getElementById('kclose');

  var DOTS = Array.prototype.slice.call(frame.querySelectorAll('.khero__spot')).map(function (el) {
    var cs = getComputedStyle(el);
    return {
      el: el,
      xp: parseFloat(cs.getPropertyValue('--x')),
      yp: parseFloat(cs.getPropertyValue('--y')),
      r: parseFloat(el.getAttribute('data-r')) || 0.2,
      title: el.querySelector('.khero__label').textContent,
      desc: el.getAttribute('data-desc')
    };
  });
  if (!DOTS.length) return;

  function isDesktop() { return window.innerWidth > 760; }

  function pickDot(cx, cy) {
    var ir = img.getBoundingClientRect();
    if (!ir.width) return null;
    var best = null, bestD = Infinity;
    for (var i = 0; i < DOTS.length; i++) {
      var d = DOTS[i];
      var dx = ir.left + ir.width * d.xp / 100;
      var dy = ir.top + ir.height * d.yp / 100;
      var dist = Math.sqrt((cx - dx) * (cx - dx) + (cy - dy) * (cy - dy));
      if (dist <= d.r * ir.width && dist < bestD) { bestD = dist; best = d; }
    }
    return best;
  }

  function setActive(dot) {
    for (var i = 0; i < DOTS.length; i++) {
      DOTS[i].el.classList.toggle('is-active', DOTS[i] === dot);
    }
    frame.style.cursor = dot ? 'pointer' : 'default';
  }

  frame.addEventListener('mousemove', function (e) {
    if (!isDesktop()) return;
    setActive(pickDot(e.clientX, e.clientY));
  });
  frame.addEventListener('mouseleave', function () { setActive(null); });

  frame.addEventListener('click', function (e) {
    if (!isDesktop()) return;
    var dot = pickDot(e.clientX, e.clientY);
    if (!dot) return;
    e.stopPropagation();
    openPanel(dot, e.clientX, e.clientY);
  });

  function openPanel(dot, cx, cy) {
    pTitle.textContent = dot.title;
    pDesc.textContent = dot.desc;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    var sr = stage.getBoundingClientRect();
    var pw = panel.offsetWidth, ph = panel.offsetHeight;
    var x = cx - sr.left + 20;
    var y = cy - sr.top + 20;
    if (x + pw > sr.width - 12) x = cx - sr.left - pw - 20;
    if (x < 12) x = 12;
    if (y + ph > sr.height - 12) y = sr.height - ph - 12;
    if (y < 12) y = 12;
    panel.style.left = x + 'px';
    panel.style.top = y + 'px';
  }
  function closePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  panel.addEventListener('click', function (e) { e.stopPropagation(); });
  if (pClose) pClose.addEventListener('click', function (e) { e.stopPropagation(); closePanel(); });
  document.addEventListener('click', closePanel);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
})();
