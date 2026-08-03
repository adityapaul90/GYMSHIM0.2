/* ==============================================================
   GYMSHIM — DIGITAL MARKETING PAGE SCRIPT
   ============================================================== */

/* ---------------- Nav: hamburger + services dropdown ---------------- */
(() => {
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
})();

/* ---------------- Lenis smooth scroll ---------------- */
(() => {
  if (typeof Lenis === 'undefined') return;
  window.lenis = new Lenis();
  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

/* ---------------- Scroll reveal (+ stagger for grids) ---------------- */
(() => {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-up').forEach((el) => revealObserver.observe(el));

  ['.dm-features-grid', '.dm-ahead-grid', '.dm-gallery-grid'].forEach((sel) => {
    document.querySelectorAll(sel).forEach((grid) => {
      [...grid.children].forEach((card, i) => {
        card.style.setProperty('--reveal-delay', `${i * 0.08}s`);
      });
    });
  });
})();

/* ---------------- Magnetic buttons ---------------- */
(() => {
  document.querySelectorAll('.dm-magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
  });
})();

/* ---------------- Hero "Mindshare Radar" ---------------- */
(() => {
  const radar = document.getElementById('dmRadar');
  const phone = document.getElementById('dmPhone');
  const countEl = document.getElementById('dmLeadsCount');
  if (!radar || !phone) return;

  const pins = [1, 2, 3, 4, 5].map((n) => document.getElementById(`dmPin${n}`)).filter(Boolean);
  let leadCount = 0;
  let pinIndex = 0;
  let started = false;

  function bumpCount() {
    leadCount += 1;
    if (countEl) countEl.textContent = leadCount;
  }

  function popPin(pin) {
    const tag = pin.querySelector('.dm-pin-tag');
    const timeline = (window.gsap ? gsap.timeline() : null);

    if (timeline) {
      timeline
        .to(pin, { opacity: 1, scale: 1.6, duration: 0.35, ease: 'back.out(3)' })
        .to(pin, { scale: 1, duration: 0.25 }, '-=0.05')
        .to(tag, { opacity: 1, y: -4, duration: 0.3 }, '-=0.2')
        .call(bumpCount, null, '-=0.2')
        .to(tag, { opacity: 0, duration: 0.3 }, '+=1')
        .to(pin, { opacity: 0, duration: 0.3 }, '-=0.3');
    } else {
      // Fallback without GSAP
      pin.style.transition = 'opacity .3s ease';
      pin.style.opacity = '1';
      tag.style.transition = 'opacity .3s ease';
      tag.style.opacity = '1';
      bumpCount();
      setTimeout(() => { tag.style.opacity = '0'; pin.style.opacity = '0'; }, 1400);
    }
  }

  function loop() {
    if (!pins.length) return;
    popPin(pins[pinIndex]);
    pinIndex = (pinIndex + 1) % pins.length;
    setTimeout(loop, 1500);
  }

  function start() {
    if (started) return;
    started = true;
    setTimeout(loop, 500);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) start(); });
  }, { threshold: 0.3 });
  io.observe(radar);

  // Subtle 3D tilt on the phone, following the pointer within the radar
  radar.addEventListener('mousemove', (e) => {
    const rect = radar.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (window.gsap) {
      gsap.to(phone, { rotationY: x * 16, rotationX: -y * 16, duration: 0.5, ease: 'power3.out', transformPerspective: 600 });
    } else {
      phone.style.transform = `translate(-50%,-50%) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
    }
  });
  radar.addEventListener('mouseleave', () => {
    if (window.gsap) {
      gsap.to(phone, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'power3.out' });
    } else {
      phone.style.transform = 'translate(-50%,-50%)';
    }
  });
})();

/* ---------------- Stat counter (444M+) ---------------- */
(() => {
  const statEl = document.getElementById('dmStatNum');
  if (!statEl) return;
  let done = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !done) {
        done = true;
        const target = 444;
        let current = 0;
        const step = () => {
          current += Math.max(1, Math.round((target - current) / 8));
          if (current >= target) current = target;
          statEl.textContent = current;
          if (current < target) requestAnimationFrame(step);
        };
        step();
      }
    });
  }, { threshold: 0.5 });
  io.observe(statEl);
})();

/* ---------------- Gallery lightbox ---------------- */
(() => {
  const lightbox = document.getElementById('dmLightbox');
  const lightboxImg = document.getElementById('dmLightboxImg');
  const closeBtn = document.getElementById('dmLightboxClose');
  if (!lightbox || !lightboxImg) return;

  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.dm-gallery-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const full = btn.dataset.full || btn.querySelector('img').src;
      open(full, btn.querySelector('img').alt);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();