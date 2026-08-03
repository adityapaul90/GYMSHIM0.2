// privacy.js — lightweight script for privacy-policy.html
// Only handles: smooth scroll, mobile nav toggle, and the Products & Services overlay.
// (script.js has homepage-only code — hero video, plan cards, GSAP pinning, booking form —
// that runs unconditionally and throws on pages without those elements, which stops the
// rest of that file from running. This file avoids that by only touching things that exist here.)

// Lenis smooth scroll
if (typeof Lenis !== 'undefined') {
  window.lenis = new Lenis();

  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Products & Services — full-page overlay
const servicesToggle = document.getElementById('servicesToggle');
const servicesOverlay = document.getElementById('servicesOverlay');
const servicesOverlayBackdrop = document.getElementById('servicesOverlayBackdrop');
const servicesOverlayClose = document.getElementById('servicesOverlayClose');

function openServicesOverlay() {
  servicesOverlay.classList.add('open');
  servicesOverlay.setAttribute('aria-hidden', 'false');
  servicesToggle.setAttribute('aria-expanded', 'true');
  document.documentElement.classList.add('services-modal-locked');
  document.body.classList.add('services-modal-locked');
  if (window.lenis) window.lenis.stop();
}

function closeServicesOverlay() {
  servicesOverlay.classList.remove('open');
  servicesOverlay.setAttribute('aria-hidden', 'true');
  servicesToggle.setAttribute('aria-expanded', 'false');
  document.documentElement.classList.remove('services-modal-locked');
  document.body.classList.remove('services-modal-locked');
  if (window.lenis) window.lenis.start();
}

if (servicesToggle && servicesOverlay) {
  servicesToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = servicesOverlay.classList.contains('open');
    isOpen ? closeServicesOverlay() : openServicesOverlay();
  });

  if (servicesOverlayBackdrop) {
    servicesOverlayBackdrop.addEventListener('click', closeServicesOverlay);
  }
  if (servicesOverlayClose) {
    servicesOverlayClose.addEventListener('click', closeServicesOverlay);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && servicesOverlay.classList.contains('open')) {
      closeServicesOverlay();
    }
  });
}   