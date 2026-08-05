gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------
   Global chrome: custom cursor ring, magnetic buttons, hamburger,
   services overlay, Lenis smooth scroll. Unchanged behaviour from
   the rest of the site, just kept here since this page doesn't
   load a shared script.js.
   --------------------------------------------------------------- */
const cursorRing = document.getElementById('skxCursorRing');
let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
if (cursorRing) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorRing.classList.add('visible');
  });
  function ringLoop() {
    ringX += (mouseX - ringX) * 0.35;
    ringY += (mouseY - ringY) * 0.35;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(ringLoop);
  }
  ringLoop();
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
  });
}

document.querySelectorAll('.skx-magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0, 0)'; });
});

if (window.Lenis) {
  window.lenis = new Lenis();
  function raf(time) { window.lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
}

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
    servicesOverlay.classList.contains('open') ? closeServicesOverlay() : openServicesOverlay();
  });
  servicesOverlayBackdrop.addEventListener('click', closeServicesOverlay);
  servicesOverlayClose.addEventListener('click', closeServicesOverlay);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && servicesOverlay.classList.contains('open')) closeServicesOverlay();
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   Generic reveal-on-scroll for anything tagged .reveal2
   --------------------------------------------------------------- */
const reveal2Observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      reveal2Observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal2').forEach(el => reveal2Observer.observe(el));

/* ---------------------------------------------------------------
   Hero title: split words already wrapped server-side into
   .sk2-word spans with --d for staggered rise-in (pure CSS anim,
   nothing to wire here) — just kick the ambient glow.
   --------------------------------------------------------------- */

/* ---------------------------------------------------------------
   Kiosk device screen: cycles through the real sales flow
   (lead captured -> offer shown -> payment -> membership closed)
   --------------------------------------------------------------- */
(function kioskDevice() {
  const steps = document.querySelectorAll('#sk2-device-screen .sk2-step');
  const bars = document.querySelectorAll('#sk2-device-screen .sk2-progress i');
  if (!steps.length) return;
  let idx = 0;
  const STEP_MS = 2200;

  function render() {
    steps.forEach((s, i) => s.classList.toggle('active', i === idx));
    bars.forEach((b, i) => {
      b.classList.remove('done', 'current');
      if (i < idx) b.classList.add('done');
      else if (i === idx) b.classList.add('current');
    });
  }
  render();
  if (!prefersReducedMotion) {
    setInterval(() => {
      idx = (idx + 1) % steps.length;
      render();
    }, STEP_MS);
  }
})();

/* ---------------------------------------------------------------
   Bento cards: cursor-tracked spotlight + gentle 3D tilt
   --------------------------------------------------------------- */
(function bentoTilt() {
  const cards = document.querySelectorAll('.sk2-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      if (prefersReducedMotion) return;
      const rx = ((y / rect.height) - 0.5) * -6;
      const ry = ((x / rect.width) - 0.5) * 6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();

/* ---------------------------------------------------------------
   GSAP staggered reveals for the bento grid and flow steps
   --------------------------------------------------------------- */
gsap.utils.toArray('.sk2-bento-grid').forEach(grid => {
  const cards = grid.querySelectorAll('.sk2-card');
  gsap.set(cards, { opacity: 0, y: 34, scale: 0.97 });
  ScrollTrigger.create({
    trigger: grid,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
    }
  });
});

gsap.utils.toArray('.sk2-flow-step').forEach((step, i) => {
  gsap.set(step, { opacity: 0, y: 24 });
  ScrollTrigger.create({
    trigger: step,
    start: 'top 85%',
    once: true,
    onEnter: () => gsap.to(step, { opacity: 1, y: 0, duration: 0.6, delay: i * 0.12, ease: 'power3.out' })
  });
});

gsap.utils.toArray('.sk2-shift-card').forEach((card, i) => {
  gsap.set(card, { opacity: 0, x: i === 0 ? -40 : 40 });
  ScrollTrigger.create({
    trigger: card,
    start: 'top 82%',
    once: true,
    onEnter: () => gsap.to(card, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
  });
});