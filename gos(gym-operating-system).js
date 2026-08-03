/* ================================================================
   GYMSHIM GOS — LAUNCH PAGE
   Vanilla JS + GSAP + ScrollTrigger + Lenis.
   Every animated behaviour on the page lives in this one file,
   grouped by feature and commented individually.
   ================================================================ */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------------------------------------------------------------
     1. LENIS — smooth scrolling.
     Ties into GSAP's ticker so ScrollTrigger stays in sync with the
     smoothed scroll position instead of the raw native scroll.
     --------------------------------------------------------------- */
  let lenis;
  if (!reducedMotion) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------
     1b. SHARED NAVBAR — hamburger menu + Services dropdown.
     Same behaviour as every other page on the site (this page didn't
     have the real navbar wired up before, so this was missing).
     --------------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.closest('.nav-dropdown');
      const isOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        dropdown.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav-dropdown-toggle').setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------------------------------------------------------
     2. CURSOR GLOW — follows the pointer with a lerped delay so it
     feels like a soft light rather than snapping to the cursor.
     --------------------------------------------------------------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !isTouch && !reducedMotion) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let gx = mx, gy = my;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    function glowLoop() {
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      cursorGlow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      requestAnimationFrame(glowLoop);
    }
    glowLoop();
  }

  /* ---------------------------------------------------------------
     3. PARTICLE FIELD — a light canvas particle system drifting
     behind the hero and showcase. Particles link with faint lines
     when close together, echoing the "system" visual language.
     --------------------------------------------------------------- */
  const canvas = document.getElementById('particleField');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [];
    const DENSITY = 1 / 24000;
    const LINK_DIST = 120;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.round(w * h * DENSITY));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1 + Math.random() * 1.2
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(216,35,35,${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }

    resize();
    step();
    window.addEventListener('resize', resize);
  }

  /* ---------------------------------------------------------------
     4. MAGNETIC BUTTONS — pulls slightly toward the cursor while
     hovered, springs back to rest on leave.
     --------------------------------------------------------------- */
  if (!isTouch && !reducedMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(btn, { x, y, duration: 0.4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------------------------------------------------------------
     5. RIPPLE CLICK EFFECT — a short-lived expanding circle at the
     click point on any magnetic button.
     --------------------------------------------------------------- */
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.6;
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------------------------------------------------------------
     6. HERO ENTRANCE — staggered reveal of every .js-reveal element
     inside the hero, on page load (not scroll-triggered, since it's
     the first thing visible).
     --------------------------------------------------------------- */
  const heroReveals = document.querySelectorAll('#launchHero .js-reveal');
  if (heroReveals.length) {
    gsap.set(heroReveals, { y: 26 });
    gsap.to(heroReveals, {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.15
    });
  }

  /* ---------------------------------------------------------------
     7. SECTION REVEALS — every .js-reveal element outside the hero
     (Solution, Feature Rich Management, Apps, and the closing strip)
     fades/rises in individually as it scrolls into view. Without
     this, anything added in a new section stays invisible forever,
     since .js-reveal starts at opacity:0 in CSS.
     --------------------------------------------------------------- */
  document.querySelectorAll('.js-reveal').forEach(el => {
    if (el.closest('#launchHero')) return; // hero handles its own entrance above
    gsap.set(el, { y: 24 });
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------------------------------------------------------------
     8. DEVICE SHOWCASE — mouse parallax tilt (idle) + the main
     pinned ScrollTrigger timeline (scroll-scrubbed).
     --------------------------------------------------------------- */
  const laptop = document.getElementById('deviceLaptop');
  const phone = document.getElementById('devicePhone');
  const showcasePin = document.getElementById('showcasePin');
  const showcaseGlow = document.querySelector('.showcase-glow');

  // -- Idle mouse-parallax tilt on the laptop (subtle, bounded) --
  if (laptop && !isTouch && !reducedMotion) {
    showcasePin.addEventListener('mousemove', (e) => {
      const r = showcasePin.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(laptop, {
        rotateY: x * 10,
        rotateX: y * -8,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
    showcasePin.addEventListener('mouseleave', () => {
      gsap.to(laptop, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power2.out' });
    });
  }

  // -- Main pinned scroll timeline --
  if (laptop && phone && !reducedMotion) {
    gsap.set(laptop, { scale: 0.7, rotateY: -22, rotateX: 10, opacity: 0, transformPerspective: 1400 });
    gsap.set(phone, { xPercent: 130, opacity: 0, rotateY: 18, transformPerspective: 1400 });
    gsap.set(showcaseGlow, { opacity: 0.4, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.launch-showcase',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        pin: showcasePin,
        anticipatePin: 1
      }
    });

    tl.to(laptop, { scale: 1, rotateY: -6, rotateX: 4, opacity: 1, duration: 1, ease: 'power2.out' }, 0)
      .to(showcaseGlow, { opacity: 0.85, scale: 1.15, duration: 1, ease: 'power2.out' }, 0)
      .to(laptop, { rotateY: 0, rotateX: 0, duration: 1, ease: 'power2.inOut' }, 1)
      .to(phone, { xPercent: 0, opacity: 1, rotateY: 0, duration: 1, ease: 'power2.out' }, 1.1)
      .to(laptop, { x: '-6%', duration: 1, ease: 'power1.inOut' }, 1.1);

    // Position the phone beside the laptop once JS has real layout
    // sizes to work with (keeps it responsive without hardcoding px).
    function positionDevices() {
      const rect = showcasePin.getBoundingClientRect();
      laptop.style.left = `calc(50% - ${laptop.offsetWidth / 2}px)`;
      laptop.style.top = `calc(50% - ${laptop.offsetHeight / 2}px)`;
      phone.style.left = `calc(50% + ${laptop.offsetWidth / 2.4}px)`;
      phone.style.top = `calc(50% - ${phone.offsetHeight / 2}px)`;
    }
    positionDevices();
    window.addEventListener('resize', positionDevices);
  } else if (laptop && phone) {
    // Reduced-motion fallback: show the final composed state statically.
    laptop.style.left = `calc(50% - ${laptop.offsetWidth / 2}px)`;
    laptop.style.top = `calc(50% - ${laptop.offsetHeight / 2}px)`;
    phone.style.left = `calc(50% + ${laptop.offsetWidth / 2.4}px)`;
    phone.style.top = `calc(50% - ${phone.offsetHeight / 2}px)`;
  }

  /* ---------------------------------------------------------------
     9. LAPTOP SCREENSHOT REVEAL — the real dashboard image sweeps in
     with a brightness/scale settle once the showcase scrolls into
     view (the continuous glass sheen from CSS handles the ongoing
     reflection on top of it).
     --------------------------------------------------------------- */
  const laptopScreen = document.getElementById('laptopScreen');
  const dashScreenshot = laptopScreen ? laptopScreen.querySelector('.dash-screenshot') : null;

  if (dashScreenshot) {
    if (!reducedMotion) {
      gsap.set(dashScreenshot, { scale: 1.08, opacity: 0, filter: 'brightness(1.6)' });
    }
    ScrollTrigger.create({
      trigger: '.launch-showcase',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (reducedMotion) return;
        gsap.to(dashScreenshot, {
          scale: 1, opacity: 1, filter: 'brightness(1)',
          duration: 1.3, ease: 'power2.out'
        });
      }
    });
  }

  /* ---------------------------------------------------------------
     10. PHONE NOTIFICATION CARDS — slide in one at a time once the
     phone itself has entered, then loop by cycling opacity/position.
     --------------------------------------------------------------- */
  const phoneCards = ['phoneCard1', 'phoneCard2', 'phoneCard3']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (phoneCards.length) {
    ScrollTrigger.create({
      trigger: '.launch-showcase',
      start: 'top 40%',
      once: true,
      onEnter: () => {
        gsap.to(phoneCards, {
          x: 0, opacity: 1, duration: 0.7, stagger: 0.25, ease: 'power3.out'
        });
        if (!reducedMotion) startPhoneCardLoop();
      }
    });
  }

  // After the initial entrance, gently cycle the cards' emphasis so
  // the screen never looks static — one card "pulses" at a time.
  function startPhoneCardLoop() {
    let i = 0;
    setInterval(() => {
      phoneCards.forEach((c, ci) => {
        gsap.to(c, { scale: ci === i ? 1.03 : 1, duration: 0.5, ease: 'power2.out' });
      });
      i = (i + 1) % phoneCards.length;
    }, 1800);
  }

  /* ---------------------------------------------------------------
     11. CHALLENGES SECTION — spine draw-in, card entrance, digit-roll
     counters, hover connector pulse, and a red->white background
     drift as the section scrolls (all scrubbed to scroll progress).
     --------------------------------------------------------------- */
  const challengesSection = document.getElementById('challenges');
  const spineFill = document.getElementById('challengesSpineFill');
  const challengesBg = document.getElementById('challengesBg');
  const challengeCards = document.querySelectorAll('.challenge-card');

  if (challengesSection && spineFill && challengeCards.length) {
    const spineLen = spineFill.getTotalLength ? spineFill.getTotalLength() : 1000;

    if (!reducedMotion) {
      gsap.set(spineFill, { strokeDasharray: spineLen, strokeDashoffset: spineLen });

      // Spine draws in and the background tint drifts red -> white,
      // both scrubbed directly to how far the section has scrolled.
      gsap.to(spineFill, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: challengesSection,
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: 0.6
        }
      });

      gsap.to(challengesBg, {
        '--challenges-bg-mix': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: challengesSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    } else {
      gsap.set(spineFill, { strokeDashoffset: 0 });
    }

    challengeCards.forEach((card) => {
      const fromX = card.classList.contains('challenge-card-left') ? -40 : 40;
      const numEl = card.querySelector('.challenge-num');
      const finalLabel = numEl ? numEl.dataset.final : null;

      ScrollTrigger.create({
        trigger: card,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          if (reducedMotion) {
            gsap.set(card, { opacity: 1, x: 0 });
            if (numEl && finalLabel) numEl.textContent = finalLabel;
            return;
          }

          gsap.to(card, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out'
          });

          // Digit-roll: cycle a few random 2-digit values before
          // landing on the real number, like an odometer settling.
          if (numEl && finalLabel) {
            let ticks = 0;
            const maxTicks = 7;
            const rollInterval = setInterval(() => {
              ticks++;
              if (ticks >= maxTicks) {
                clearInterval(rollInterval);
                numEl.textContent = finalLabel;
              } else {
                numEl.textContent = String(Math.floor(Math.random() * 90) + 10);
              }
            }, 45);
          }

          const icon = card.querySelector('.challenge-icon');
          if (icon) {
            gsap.fromTo(icon,
              { scale: 0, rotate: -20 },
              { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.2)', delay: 0.15 }
            );
          }
        }
      });

      // Set the initial (pre-scroll) transform now that we know direction.
      if (!reducedMotion) gsap.set(card, { x: fromX });
    });
  }

})();