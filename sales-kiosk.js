gsap.registerPlugin(ScrollTrigger);

// --- Custom cursor ring ---
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

// --- Magnetic button ---
document.querySelectorAll('.skx-magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

// --- Premium GSAP scroll reveal for the 7 benefit rows ---
// (replaces the plain IntersectionObserver fade with scale + blur + smoother easing)
gsap.utils.toArray('.skx-row').forEach(row => {
  const media = row.querySelector('.skx-row-media');
  const content = row.querySelector('.skx-row-content');
  const fromXMedia = row.dataset.side === 'left' ? -120 : 120;
  const fromXContent = row.dataset.side === 'left' ? 120 : -120;

  gsap.set(media, { opacity: 0, x: fromXMedia, scale: 0.92, filter: 'blur(6px)' });
  gsap.set(content, { opacity: 0, x: fromXContent, filter: 'blur(4px)' });

  ScrollTrigger.create({
    trigger: row,
    start: 'top 78%',
    once: true,
    onEnter: () => {
    // Row reveal — was duration: 1.1, delay: 0.15
gsap.to(media, { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' });
gsap.to(content, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.5, delay: 0.1, ease: 'power3.out' });
    }
  });
});





// Lenis smooth scroll (matches the rest of the site)
window.lenis = new Lenis();
function raf(time) {
  window.lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);




// Floating glass-card objects (icons drifting with subtle rotation)
const objectIcons = ['💳', '✅', '📊', '🔔', '📱', '🎫'];
const objectsContainer = document.getElementById('skxObjects');
if (objectsContainer) {
  objectIcons.forEach((icon, i) => {
    const el = document.createElement('div');
    el.className = 'skx-object';
    el.textContent = icon;
    el.style.left = `${10 + Math.random() * 75}%`;
    el.style.top = `${10 + Math.random() * 70}%`;
    el.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
    el.style.setProperty('--dy', `${(Math.random() - 0.5) * 100}px`);
    el.style.animationDuration = `${10 + Math.random() * 6}s`;
    el.style.animationDelay = `${i * 0.6}s`;
    objectsContainer.appendChild(el);
  });
}

// Cursor spotlight
const skxHeroEl = document.querySelector('.skx-hero');
const spotlight = document.getElementById('skxSpotlight');
if (skxHeroEl && spotlight) {
  skxHeroEl.addEventListener('mousemove', (e) => {
    const rect = skxHeroEl.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    spotlight.style.setProperty('--sx', `${xPct}%`);
    spotlight.style.setProperty('--sy', `${yPct}%`);
  });
}




// Hamburger menu (page doesn't load script.js's version, so it lives here)
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ------------------------------------------------------------
// Scroll-reveal for hero elements / CTA (fade + rise)
// ------------------------------------------------------------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// ------------------------------------------------------------
// Each of the 7 rows (image + text) fades/slides into view,
// from its own side, as you scroll down to it.
// ------------------------------------------------------------
const rows = document.querySelectorAll('.skx-row');

const rowObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view'); // one-way reveal, stays revealed
      rowObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

rows.forEach(row => rowObserver.observe(row));

// ------------------------------------------------------------
// Continuous parallax: each media panel's inner content drifts
// at a different rate than the page scroll, so it keeps gliding
// gently rather than sitting still once revealed.
// ------------------------------------------------------------
const parallaxEls = document.querySelectorAll('.skx-row-media-inner');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (parallaxEls.length && !prefersReducedMotion) {
  let ticking = false;

  function updateParallax() {
    const viewportCenter = window.innerHeight / 2;
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const distance = viewportCenter - elCenter;
      const offset = Math.max(-60, Math.min(60, distance * 0.12));
      el.style.transform = `translateY(${offset}px)`;
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateParallax();
}

// ------------------------------------------------------------
// Terminal typewriter log (hero signature element)
// ------------------------------------------------------------
const logLines = [
  { text: '> lead captured...', cls: '' },
  { text: '> offer applied: 20% off', cls: 'skx-muted' },
  { text: '> payment confirmed', cls: 'skx-muted' },
  { text: '> membership closed ✓', cls: '' }
];

const logEl = document.getElementById('skxLog');
const counterEl = document.getElementById('skxCounter');
let counterValue = 0;

function typeLog() {
  if (!logEl) return;
  logEl.innerHTML = '';
  let i = 0;

  function nextLine() {
    if (i >= logLines.length) {
      counterValue++;
      if (counterEl) counterEl.textContent = counterValue;
      setTimeout(() => { typeLog(); }, 1400);
      return;
    }
    const line = document.createElement('span');
    line.className = 'skx-line ' + logLines[i].cls;
    line.textContent = logLines[i].text;
    logEl.appendChild(line);
    i++;
    setTimeout(nextLine, 650);
  }
  nextLine();

  const cursor = document.createElement('span');
  cursor.className = 'skx-cursor';
  logEl.appendChild(cursor);
}
typeLog();







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