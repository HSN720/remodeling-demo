/* ============================================================
   ALDERMERE — service-page split sections: cinematic scroll reveal
   ------------------------------------------------------------
   For every "text on one side / image on the other" section (.split):
     • The image starts drifted toward the centre of the section and slightly
       scaled up; the copy starts hidden and offset to its outer edge.
     • As the section is scrolled through the viewport, the image settles into
       its column and the copy slides in from the outer side with a soft fade.
       Normal split  -> image is on the LEFT  -> it slides left, copy enters from the right.
       Reverse split -> image is on the RIGHT -> it slides right, copy enters from the left.
     • Movement is tied to scroll position (scrub), so it only happens while the
       user is moving through that section — calm and premium, never jumpy.

   Responsiveness & accessibility:
     • Desktop / tablet (>=761px): the horizontal cinematic reveal above.
     • Mobile (<=760px): the layout is already image-first / copy-below, so we
       leave the existing .reveal fade-up untouched (a soft fade-up).
     • prefers-reduced-motion or no GSAP: we do nothing and let the static
       .reveal system show the content with no heavy movement.
   ============================================================ */
(function () {
  'use strict';

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  // No GSAP -> the .reveal IntersectionObserver in site.js already reveals the
  // content. Bail out so nothing is hidden.
  if (!gsap || !ScrollTrigger) return;

  var splits = Array.prototype.slice.call(document.querySelectorAll('.split'));
  if (!splits.length) return;

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();

  // ---- Desktop / tablet, motion allowed: horizontal cinematic reveal ----
  mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', function () {
    var built = [];

    splits.forEach(function (split) {
      var media = split.querySelector('.split__media');
      var body = split.querySelector('.split__body');
      if (!media || !body) return;

      // Take ownership from the IntersectionObserver reveal system so the two
      // animations never fight over opacity/transform.
      media.classList.remove('reveal', 'is-visible');
      body.classList.remove('reveal', 'is-visible');

      // Clip the horizontal travel at the section edge so the slide-in can never
      // create a horizontal scrollbar. (overflow-x:clip keeps vertical flow intact.)
      var section = split.closest('.section') || split.parentElement;
      if (section) section.style.overflowX = 'clip';

      // Reverse split = image on the right / copy on the left -> everything
      // travels the opposite direction.
      var dir = split.classList.contains('split--reverse') ? -1 : 1;

      var tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: split,
          start: 'top 85%',   // begins as the section enters
          end: 'top 35%',     // settled by the time it is ~a third up the screen
          scrub: 0.6          // smooth lag — premium, not snappy
        }
      });

      tl.fromTo(
        media,
        { xPercent: dir * 36, scale: 1.06, transformOrigin: 'center center', force3D: true },
        { xPercent: 0, scale: 1 },
        0
      ).fromTo(
        body,
        { x: dir * 70, autoAlpha: 0 },
        { x: 0, autoAlpha: 1 },
        0.05
      );

      built.push({ split: split, media: media, body: body, section: section, tl: tl });
    });

    // Cleanup when the query stops matching (e.g. the viewport is resized down to
    // mobile): kill triggers, clear inline transforms, and hand the elements back
    // to the .reveal system so the mobile fade-up keeps working.
    return function () {
      built.forEach(function (b) {
        if (b.tl) {
          if (b.tl.scrollTrigger) b.tl.scrollTrigger.kill();
          b.tl.kill();
        }
        gsap.set([b.media, b.body], { clearProps: 'all' });
        if (b.section) b.section.style.overflowX = '';
        b.media.classList.add('reveal', 'is-visible');
        b.body.classList.add('reveal', 'is-visible');
      });
    };
  });
})();
