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

  /* ---------------- Hamburger menu ---------------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  /* ---------------- Services nav dropdown ---------------- */
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




