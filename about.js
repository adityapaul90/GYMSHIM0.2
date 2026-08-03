// Hamburger menu (this page doesn't load script.js, so it lives here)
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Scroll-reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// Stagger the team cards so they animate one after another
document.querySelectorAll('.team-grid').forEach(grid => {
  [...grid.children].forEach((card, i) => {
    card.style.setProperty('--reveal-delay', `${i * 0.1}s`);
  });
});


// Products & Services -> opens the services mega panel overlay
const servicesToggle = document.getElementById('servicesToggle');
const servicesOverlay = document.getElementById('servicesOverlay');
const servicesBackdrop = document.getElementById('servicesOverlayBackdrop');
const servicesClose = document.getElementById('servicesOverlayClose');

function openServicesOverlay(e) {
  if (e) e.preventDefault();
  servicesOverlay.classList.add('open');
  servicesOverlay.setAttribute('aria-hidden', 'false');
  servicesToggle.setAttribute('aria-expanded', 'true');
}
function closeServicesOverlay() {
  servicesOverlay.classList.remove('open');
  servicesOverlay.setAttribute('aria-hidden', 'true');
  servicesToggle.setAttribute('aria-expanded', 'false');
}

if (servicesToggle && servicesOverlay) {
  servicesToggle.addEventListener('click', openServicesOverlay);
  servicesBackdrop && servicesBackdrop.addEventListener('click', closeServicesOverlay);
  servicesClose && servicesClose.addEventListener('click', closeServicesOverlay);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeServicesOverlay(); });
}