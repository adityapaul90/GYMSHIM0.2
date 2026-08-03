/* ==============================================================
   GOS — combined page script
   Three source files stitched together, each still its own IIFE
   (no shared variable scope, so no collisions):
     1. launch page JS  — Lenis, hamburger/dropdown, cursor glow,
        particle field, magnetic buttons, hero entrance, device
        showcase, challenges timeline
     2. ecosystem JS    — reveal-up, live readout, module timers,
        hero canvas, modules canvas, map tilt, tooltips, card tilt,
        demo video, comparison slider (hamburger/dropdown removed —
        already handled by #1)
     3. live-system JS  — the Live Gym Operating System component
        (component-only script; never had its own hamburger/dropdown)
   ============================================================== */

/* ================= 1. LAUNCH PAGE ================= */
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

  const servicesToggle = document.getElementById('servicesToggle');
  const servicesOverlay = document.getElementById('servicesOverlay');
  const servicesOverlayBackdrop = document.getElementById('servicesOverlayBackdrop');
  const servicesOverlayClose = document.getElementById('servicesOverlayClose');

  function openServicesOverlay() {
    servicesOverlay.classList.add('open');
    servicesOverlay.setAttribute('aria-hidden', 'false');
    servicesToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeServicesOverlay() {
    servicesOverlay.classList.remove('open');
    servicesOverlay.setAttribute('aria-hidden', 'true');
    servicesToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (servicesToggle && servicesOverlay) {
    servicesToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = servicesOverlay.classList.contains('open');
      isOpen ? closeServicesOverlay() : openServicesOverlay();
    });

    servicesOverlayBackdrop.addEventListener('click', closeServicesOverlay);
    servicesOverlayClose.addEventListener('click', closeServicesOverlay);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && servicesOverlay.classList.contains('open')) {
        closeServicesOverlay();
      }
    });
  }
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

/* ================= 2. ECOSYSTEM ================= */
/* ==============================================================
   GOS ECOSYSTEM — page interactions
   Everything here degrades gracefully if GSAP fails to load
   (checked once via hasGSAP) — the .reveal-up CSS transition in
   gos-ecosystem.css is the fallback path.
   ============================================================== */
(function () {
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  const EASE_OUT = 'expo.out';

  /* Hamburger + Services dropdown handled once, in the launch-page JS above. */

  /* ---------------- Scroll reveal ---------------- */
  // Stagger delays for grids (module cards, proof cards) — set before
  // either reveal path runs so both honor the same rhythm.
  document.querySelectorAll('.gos-module-grid, .gos-proof-grid, .gos-data-grid, .gos-benefits-grid').forEach(grid => {
    [...grid.children].forEach((card, i) => {
      card.style.setProperty('--reveal-delay', `${i * 0.06}s`);
    });
  });

  if (hasGSAP) {
    document.querySelectorAll('.reveal-up').forEach(el => {
      const delay = parseFloat(el.style.getPropertyValue('--reveal-delay')) || 0;
      gsap.fromTo(el,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: EASE_OUT, delay,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));
  }

  /* ---------------- Live system events readout ---------------- */
  const gosEvents = [
    '> lead captured via WhatsApp',
    '> member checked in — QR scan',
    '> access granted · Member #452',
    '> renewal reminder sent',
    '> payment reconciled',
    '> daily sales report generated'
  ];
  const readoutEl = document.getElementById('gosReadout');

  function typeGosReadout() {
    if (!readoutEl) return;
    readoutEl.innerHTML = '';
    let i = 0;

    function nextLine() {
      while (readoutEl.children.length >= 4) {
        readoutEl.removeChild(readoutEl.firstChild); // synchronous — loop must actually terminate
      }
      if (i >= gosEvents.length) {
        setTimeout(() => { i = 0; nextLine(); }, 1200);
        return;
      }
      const line = document.createElement('span');
      line.className = 'gos-line gos-fresh';
      line.textContent = gosEvents[i];
      readoutEl.appendChild(line);
      if (hasGSAP) {
        gsap.fromTo(line, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' });
      }
      i++;
      setTimeout(nextLine, 1100);
    }
    nextLine();
  }
  typeGosReadout();

  /* ---------------- Module video-frame timestamps ---------------- */
  // Purely cosmetic — reinforces the "watching a clip" read of each
  // module's animation. Each counter starts at a random offset so
  // all six don't tick in visible lockstep.
  document.querySelectorAll('[data-gos-timer]').forEach(el => {
    let seconds = Math.floor(Math.random() * 8);
    const tick = () => {
      seconds = (seconds + 1) % 60;
      el.textContent = '00:' + String(seconds).padStart(2, '0');
    };
    setInterval(tick, 1000);
  });

  /* ---------------- Hero: particle network canvas ---------------- */
  const heroCanvas = document.getElementById('gosHeroCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    const heroSection = heroCanvas.closest('.gos-hero');
    let w, h, dpr, particles = [];
    const PARTICLE_COUNT_PER_PX = 1 / 18000; // scales with viewport area
    const LINK_DIST = 130;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = heroSection.clientWidth;
      h = heroSection.clientHeight;
      heroCanvas.width = w * dpr;
      heroCanvas.height = h * dpr;
      heroCanvas.style.width = w + 'px';
      heroCanvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.round(w * h * PARTICLE_COUNT_PER_PX));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.4,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const distToMouse = Math.hypot(dx, dy);
        if (distToMouse < 140) {
          const force = (140 - distToMouse) / 140;
          p.x += (dx / distToMouse) * force * 0.6;
          p.y += (dy / distToMouse) * force * 0.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
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
            ctx.strokeStyle = `rgba(216,35,35,${0.14 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      resize();
      requestAnimationFrame(step);
      window.addEventListener('resize', resize);
      heroSection.addEventListener('mousemove', (e) => {
        const r = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
      });
      heroSection.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    }
  }

  /* ---------------- Modules section: GOS-themed node network + spotlight ----------------
     Retheme of a generic starfield: most nodes are small square "chip"
     nodes (circuit-board read, not night-sky), and a handful are the
     same six module glyphs used on the cards themselves — so the
     background visually IS the ecosystem, not decoration borrowed
     from elsewhere. Paired with a cursor-synced radial spotlight. */
  const modulesSection = document.getElementById('gosModulesSection');
  const modulesCanvas = document.getElementById('gosModulesCanvas');
  const modulesSpotlight = document.getElementById('gosModulesSpotlight');
  const GOS_ICONS = ['💬', '🪪', '🔐', '🔔', '💳', '📊'];

  if (modulesSection && modulesCanvas) {
    const ctx2 = modulesCanvas.getContext('2d');
    let mw, mh, mdpr, mParticles = [];
    const M_PARTICLE_COUNT_PER_PX = 1 / 26000;
    const M_LINK_DIST = 160;
    const mMouse = { x: -9999, y: -9999 };
    let clock = 0;

    function mResize() {
      mdpr = Math.min(window.devicePixelRatio || 1, 2);
      mw = modulesSection.clientWidth;
      mh = modulesSection.clientHeight;
      modulesCanvas.width = mw * mdpr;
      modulesCanvas.height = mh * mdpr;
      modulesCanvas.style.width = mw + 'px';
      modulesCanvas.style.height = mh + 'px';
      ctx2.setTransform(mdpr, 0, 0, mdpr, 0, 0);

      const count = Math.min(46, Math.round(mw * mh * M_PARTICLE_COUNT_PER_PX));
      // Roughly 1 in 5 nodes carries a module icon; the rest are small
      // circuit-chip squares. Icons are placed with extra spacing logic
      // implicitly via lower overall count, so they read individually.
      mParticles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * mw,
        y: Math.random() * mh,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        baseR: 1.4 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        icon: (i % 5 === 0) ? GOS_ICONS[(i / 5) % GOS_ICONS.length] : null,
      }));
    }

    function mStep() {
      clock += 0.02;
      ctx2.clearRect(0, 0, mw, mh);

      mParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > mw) p.vx *= -1;
        if (p.y < 0 || p.y > mh) p.vy *= -1;

        const dx = p.x - mMouse.x, dy = p.y - mMouse.y;
        const distToMouse = Math.hypot(dx, dy);
        if (distToMouse < 150) {
          const force = (150 - distToMouse) / 150;
          p.x += (dx / distToMouse) * force * 0.7;
          p.y += (dy / distToMouse) * force * 0.7;
        }

        const pulse = 1 + Math.sin(clock * 2 + p.phase) * 0.3;

        if (p.icon) {
          // Module glyph node — slow independent rotation + gentle glow ring.
          p.rot += 0.0025;
          ctx2.save();
          ctx2.translate(p.x, p.y);
          ctx2.rotate(Math.sin(p.rot) * 0.25);
          ctx2.font = `${13 * pulse}px sans-serif`;
          ctx2.textAlign = 'center';
          ctx2.textBaseline = 'middle';
          ctx2.globalAlpha = 0.75;
          ctx2.fillText(p.icon, 0, 0);
          ctx2.restore();

          ctx2.beginPath();
          ctx2.arc(p.x, p.y, 11 * pulse, 0, Math.PI * 2);
          ctx2.strokeStyle = 'rgba(216,35,35,0.35)';
          ctx2.lineWidth = 1;
          ctx2.stroke();
        } else {
          // Circuit-chip node — small rounded square, not a round "star".
          const r = p.baseR * pulse;
          ctx2.save();
          ctx2.translate(p.x, p.y);
          ctx2.shadowBlur = 6;
          ctx2.shadowColor = 'rgba(216,35,35,0.7)';
          ctx2.fillStyle = 'rgba(255,255,255,0.5)';
          ctx2.beginPath();
          if (ctx2.roundRect) {
            ctx2.roundRect(-r, -r, r * 2, r * 2, 1.5);
          } else {
            ctx2.rect(-r, -r, r * 2, r * 2);
          }
          ctx2.fill();
          ctx2.restore();
        }
      });

      for (let i = 0; i < mParticles.length; i++) {
        for (let j = i + 1; j < mParticles.length; j++) {
          const a = mParticles[i], b = mParticles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < M_LINK_DIST) {
            const t = 1 - dist / M_LINK_DIST;
            const grad = ctx2.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(216,35,35,${0.2 * t})`);
            grad.addColorStop(1, `rgba(255,255,255,${0.14 * t})`);
            ctx2.beginPath();
            ctx2.moveTo(a.x, a.y);
            ctx2.lineTo(b.x, b.y);
            ctx2.strokeStyle = grad;
            ctx2.lineWidth = 1;
            ctx2.stroke();
          }
        }
      }
      requestAnimationFrame(mStep);
    }

    const mReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!mReducedMotion) {
      mResize();
      requestAnimationFrame(mStep);
      window.addEventListener('resize', mResize);
      modulesSection.addEventListener('mousemove', (e) => {
        const r = modulesSection.getBoundingClientRect();
        mMouse.x = e.clientX - r.left;
        mMouse.y = e.clientY - r.top;
        if (modulesSpotlight) {
          modulesSpotlight.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
          modulesSpotlight.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
        }
      });
      modulesSection.addEventListener('mouseleave', () => { mMouse.x = -9999; mMouse.y = -9999; });
    }
  }

  /* ---------------- Hero: 3D tilt on the system map ---------------- */
  const gosMap = document.getElementById('gosMap');
  if (gosMap && hasGSAP && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gosMap.addEventListener('mousemove', (e) => {
      const r = gosMap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(gosMap, { rotateX: y * -12, rotateY: x * 12, duration: 0.5, ease: 'power2.out', transformPerspective: 700 });
    });
    gosMap.addEventListener('mouseleave', () => {
      gsap.to(gosMap, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    });
  }

  /* ---------------- Hero: node hover tooltip ---------------- */
  const tooltip = document.getElementById('gosNodeTooltip');
  document.querySelectorAll('.gos-node').forEach(node => {
    node.addEventListener('mouseenter', () => {
      if (hasGSAP) {
        gsap.to(node.querySelector('.gos-node-icon'), { scale: 1.15, duration: 0.25, ease: 'back.out(2)' });
      }
      if (!tooltip || !gosMap) return;
      tooltip.textContent = node.dataset.desc || '';
      tooltip.classList.add('visible');
      const nodeRect = node.getBoundingClientRect();
      const mapRect = gosMap.getBoundingClientRect();
      tooltip.style.left = (nodeRect.left - mapRect.left + nodeRect.width / 2) + 'px';
      tooltip.style.top = (nodeRect.top - mapRect.top) + 'px';
    });
    node.addEventListener('mouseleave', () => {
      if (hasGSAP) gsap.to(node.querySelector('.gos-node-icon'), { scale: 1, duration: 0.3, ease: 'power2.out' });
      if (tooltip) tooltip.classList.remove('visible');
    });
  });

  /* ---------------- Module + proof cards: 3D tilt on hover ---------------- */
  document.querySelectorAll('.gos-module-card, .gos-proof-card').forEach(card => {
    if (!hasGSAP || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateX: y * -6, rotateY: x * 6, y: -4,
        duration: 0.4, ease: 'power2.out', transformPerspective: 700
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: 0.5, ease: 'power2.out' });
    });
  });

  /* ---------------- Demo video showcase — click-to-load YouTube embed ----------------
     Loads the iframe only on click (not on page load), so the section stays
     fast until someone actually wants to watch. */
  const demoFrame = document.getElementById('gosDemoFrame');
  const demoPlay = document.getElementById('gosDemoPlay');

  if (demoFrame && demoPlay) {
    const youtubeId = demoFrame.dataset.youtubeId;

    demoPlay.addEventListener('click', () => {
      if (!youtubeId || demoFrame.classList.contains('playing')) return;

      const iframe = document.createElement('iframe');
      iframe.className = 'gos-demo-iframe';
      iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
      iframe.title = 'Gymshim GOS walkthrough video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.setAttribute('frameborder', '0');

      demoFrame.appendChild(iframe);
      demoFrame.classList.add('playing');
    });

    // Scroll-triggered cinematic scale-in, same language as the homepage hero.
    if (hasGSAP) {
      gsap.fromTo(demoFrame, { scale: 0.94, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 1, ease: EASE_OUT,
        scrollTrigger: { trigger: demoFrame, start: 'top 85%', once: true }
      });
    }
  }
  /* ---------------- Comparison slider (Without vs With Gymshim) ---------------- */
  const compTrack = document.getElementById('gosCompareTrack');
  const compDotsWrap = document.getElementById('gosCompDots');
  const compPrev = document.getElementById('gosCompPrev');
  const compNext = document.getElementById('gosCompNext');
  const compSlider = document.getElementById('gosCompareSlider');

  if (compTrack && compDotsWrap && compPrev && compNext) {
    const slides = [...compTrack.children];
    let compIndex = 0;
    let autoTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gos-compare-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Show slide ${i + 1}`);
      dot.addEventListener('click', () => goToComp(i));
      compDotsWrap.appendChild(dot);
    });
    const dots = [...compDotsWrap.children];

    function goToComp(i) {
      compIndex = (i + slides.length) % slides.length;
      compTrack.style.transform = `translateX(-${compIndex * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === compIndex));
    }
    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goToComp(compIndex + 1), 5000);
    }

    compPrev.addEventListener('click', () => { goToComp(compIndex - 1); restartAuto(); });
    compNext.addEventListener('click', () => { goToComp(compIndex + 1); restartAuto(); });
    compSlider.addEventListener('mouseenter', () => clearInterval(autoTimer));
    compSlider.addEventListener('mouseleave', restartAuto);

    // Basic touch swipe support.
    let touchStartX = null;
    compTrack.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    compTrack.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) goToComp(compIndex + (dx < 0 ? 1 : -1));
      touchStartX = null;
      restartAuto();
    });

    restartAuto();
  }
})();






/* ================= 3. LIVE SYSTEM ================= */
/* ==============================================================
   LIVE GYM OPERATING SYSTEM
   Requires: gsap, ScrollTrigger, MotionPathPlugin (all free on the
   jsdelivr gsap CDN as of gsap 3.12+).
   <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/MotionPathPlugin.min.js"></script>
   ============================================================== */

(() => {
  if (typeof gsap === 'undefined') {
    console.warn('[live-system] GSAP not found — add the gsap.min.js <script> tag before live-system.js.');
    return;
  }
  const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
  const hasMotionPath = typeof MotionPathPlugin !== 'undefined';
  if (!hasMotionPath) {
    console.warn('[live-system] MotionPathPlugin not found — packets along the SVG paths will be skipped. Add https://cdn.jsdelivr.net/npm/gsap@3/dist/MotionPathPlugin.min.js before live-system.js to enable them.');
  }
  if (!hasScrollTrigger) {
    console.warn('[live-system] ScrollTrigger not found — the loop will run continuously instead of pausing off-screen.');
  }
  gsap.registerPlugin(...[hasScrollTrigger && ScrollTrigger, hasMotionPath && MotionPathPlugin].filter(Boolean));

  const stage = document.getElementById('lsStage');
  if (!stage) return; // section not on this page

  const phoneWrap   = document.getElementById('lsPhoneWrap');
  const screenIcon  = document.getElementById('lsScreenIcon');
  const screenLabel = document.getElementById('lsScreenLabel');
  const progressBar = document.getElementById('lsScreenProgressBar');
  const toast       = document.getElementById('lsToast');
  const toastText   = document.getElementById('lsToastText');
  const pathGroup   = document.getElementById('lsPathGroup');
  const packetGroup = document.getElementById('lsPacketGroup');
  const particlesEl = document.getElementById('lsParticles');
  const svg         = document.getElementById('lsLines');

  const nodeEls = Array.from(stage.querySelectorAll('.ls-node'));

  const ICONS = {
    idle:   '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h7v7h-7z"/>',
    qr:     '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"/>',
    check:  '<polyline points="4 12 9 17 20 6"/>',
    trainer:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    workout:'<path d="M4 12h2l2-6 3 12 2-9 2 5h5"/>',
    payment:'<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    chart:  '<path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/>',
    bell:   '<path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>'
  };

  function setScreen(iconKey, label) {
    screenIcon.innerHTML = ICONS[iconKey] || ICONS.idle;
    gsap.fromTo(screenIcon, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
    screenLabel.textContent = label;
  }

  /* ----------------------------------------------------------
     ORBIT MATH — keeps CSS node placement and SVG paths in sync.
     Node screen position = radius * (cos angle, sin angle),
     which is exactly what the CSS orbit transform produces.
     ---------------------------------------------------------- */
  let radius = 0;
  let center = { x: 0, y: 0 };

  function layout() {
    const rect = stage.getBoundingClientRect();
    center = { x: rect.width / 2, y: rect.height / 2 };
    radius = rect.width * (rect.width < 640 ? 0.40 : 0.335);

    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);

    pathGroup.innerHTML = '';
    nodeEls.forEach(el => {
      el.style.setProperty('--radius', `${radius}px`);
      const angleDeg = parseFloat(el.style.getPropertyValue('--angle'));
      const rad = angleDeg * Math.PI / 180;
      const x = center.x + radius * Math.cos(rad);
      const y = center.y + radius * Math.sin(rad);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'ls-path');
      path.setAttribute('d', `M ${center.x} ${center.y} L ${x} ${y}`);
      path.dataset.node = el.dataset.node;
      pathGroup.appendChild(path);
      el.__endpoint = { x, y };
    });
  }

  layout();
  window.addEventListener('resize', () => {
    clearTimeout(window.__lsResize);
    window.__lsResize = setTimeout(layout, 150);
  });

  function pathFor(nodeId) {
    return pathGroup.querySelector(`path[data-node="${nodeId}"]`);
  }

  /* ----------------------------------------------------------
     AMBIENT PACKETS — continuous low-key travel on every path,
     independent of the story sequence, so it always feels alive.
     ---------------------------------------------------------- */
  function spawnAmbientPacket(nodeId) {
    if (!hasMotionPath) return;
    const path = pathFor(nodeId);
    if (!path) return;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'ls-packet');
    dot.setAttribute('r', 2);
    dot.style.opacity = 0.35;
    packetGroup.appendChild(dot);

    const reverse = Math.random() > 0.5;
    gsap.to(dot, {
      duration: 2.4 + Math.random() * 1.2,
      ease: 'none',
      motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: reverse ? 1 : 0, end: reverse ? 0 : 1 },
      onComplete: () => dot.remove()
    });
  }

  nodeEls.forEach(el => {
    const id = el.dataset.node;
    gsap.delayedCall(Math.random() * 3, function loop() {
      spawnAmbientPacket(id);
      gsap.delayedCall(2.6 + Math.random() * 2, loop);
    });
  });

  /* ----------------------------------------------------------
     STORY PACKET — one bright packet per active beat, travelling
     the exact path of the node currently in focus.
     ---------------------------------------------------------- */
  function fireStoryPacket(nodeId, direction) {
    if (!hasMotionPath) return;
    const path = pathFor(nodeId);
    if (!path) return;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'ls-packet');
    dot.setAttribute('r', 4);
    packetGroup.appendChild(dot);

    const fromNode = direction === 'in';
    gsap.fromTo(dot,
      { scale: 0 },
      {
        scale: 1, duration: 0.9, ease: 'none',
        motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: fromNode ? 1 : 0, end: fromNode ? 0 : 1 },
        onComplete: () => dot.remove()
      }
    );
  }

  /* ----------------------------------------------------------
     PARTICLES — ambient floating dots inside the stage
     ---------------------------------------------------------- */
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    p.style.left = `${startX}%`;
    p.style.top = `${startY}%`;
    p.style.setProperty('--px', `${(Math.random() - 0.5) * 60}px`);
    p.style.setProperty('--py', `${-40 - Math.random() * 60}px`);
    p.style.animation = `ls-particle-float ${6 + Math.random() * 5}s ease-in-out ${Math.random() * 5}s infinite`;
    particlesEl.appendChild(p);
  }

  /* ----------------------------------------------------------
     LIVE COUNTERS
     ---------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.4, ease: 'power2.out',
      onUpdate: () => { el.textContent = prefix + Math.round(obj.v).toLocaleString() + suffix; }
    });
  }

  const counterIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); counterIo.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  stage.querySelectorAll('[data-counter]').forEach(el => counterIo.observe(el));

  /* ----------------------------------------------------------
     STORY TIMELINE — loops forever, narrating the product
     ---------------------------------------------------------- */
  const STEPS = [
    { node: 'qr',            icon: 'qr',      label: 'QR code appears',        dir: 'out' },
    { node: 'qr',            icon: 'qr',      label: 'Scanning…',              dir: 'in'  },
    { node: 'membership',    icon: 'check',   label: 'Access granted',         dir: 'out' },
    { node: 'attendance',    icon: 'check',   label: 'Attendance updated',     dir: 'in'  },
    { node: 'trainer',       icon: 'trainer', label: 'Trainer notified',       dir: 'out' },
    { node: 'workout',       icon: 'workout', label: 'Workout assigned',       dir: 'out' },
    { node: 'payment',       icon: 'payment', label: 'Payment processed',      dir: 'in'  },
    { node: 'analytics',     icon: 'chart',   label: 'Analytics updated',      dir: 'out' },
    { node: 'notifications', icon: 'bell',    label: 'Business grows',        dir: 'out' }
  ];

  const master = gsap.timeline({ repeat: -1 });

  STEPS.forEach((step, i) => {
    const el = nodeEls.find(n => n.dataset.node === step.node);
    master.call(() => {
      nodeEls.forEach(n => n.classList.remove('is-active'));
      if (el) el.classList.add('is-active');
      setScreen(step.icon, step.label);
      fireStoryPacket(step.node, step.dir);
      toastText.textContent = step.label;
      gsap.to(toast, { opacity: 1, y: 0, duration: 0.3, overwrite: true });
      gsap.fromTo(progressBar, { width: '0%' }, { width: '100%', duration: 1.1, ease: 'power1.inOut' });
    })
    .to({}, { duration: 1.3 }) // hold
    .call(() => { gsap.to(toast, { opacity: 0, y: 14, duration: 0.25 }); });
  });

  /* ----------------------------------------------------------
     MOUSE PARALLAX — whole stage tilts gently toward the cursor
     ---------------------------------------------------------- */
  const quickX = gsap.quickTo(phoneWrap, 'rotationY', { duration: 0.6, ease: 'power3.out' });
  const quickY = gsap.quickTo(phoneWrap, 'rotationX', { duration: 0.6, ease: 'power3.out' });

  stage.addEventListener('mousemove', (e) => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    quickX(px * 16);
    quickY(-py * 16);

    // nodes drift slightly less, for depth
    nodeEls.forEach(n => {
      gsap.to(n, { x: px * 8, y: py * 8, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    });
  });
  stage.addEventListener('mouseleave', () => {
    quickX(0); quickY(0);
    nodeEls.forEach(n => gsap.to(n, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' }));
  });

  /* ----------------------------------------------------------
     MAGNETIC HOVER on each node
     ---------------------------------------------------------- */
  nodeEls.forEach(el => {
    const core = el.querySelector('.ls-node-core');
    el.addEventListener('mousemove', (e) => {
      const r = core.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.35;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      gsap.to(core, { x, y, duration: 0.25, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => gsap.to(core, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1,0.4)' }));
  });

  /* pause the loop off-screen to save cycles */
  if (hasScrollTrigger) {
    ScrollTrigger.create({
      trigger: stage,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => master.play(),
      onLeave: () => master.pause(),
      onEnterBack: () => master.play(),
      onLeaveBack: () => master.pause()
    });
  }
})();