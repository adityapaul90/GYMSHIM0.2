// Hamburger menu (this page doesn't load script.js, so it lives here)
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Scroll-reveal for feature cards, section headers, CTA
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// Stagger the feature card grids so they animate one after another
document.querySelectorAll('.workout-features-grid').forEach(grid => {
  [...grid.children].forEach((card, i) => {
    card.style.setProperty('--reveal-delay', `${i * 0.1}s`);
  });
});

// Product showcase view toggle (Side View / Top View)
const showcaseLabel = document.getElementById('showcaseLabel');
const showcaseVideo = document.getElementById('showcaseVideo');
const showcasePlaceholder = document.getElementById('showcasePlaceholder');

document.querySelectorAll('.showcase-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.showcase-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');

    if (thumb.dataset.view === 'Side View') {
      showcaseVideo.style.display = 'block';
      showcasePlaceholder.style.display = 'none';
    } else {
      showcaseVideo.style.display = 'none';
      showcasePlaceholder.style.display = 'flex';
      showcaseLabel.textContent = thumb.dataset.view;
    }
  });
});




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