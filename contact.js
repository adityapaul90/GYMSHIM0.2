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

// Contact form submit — sends to Google Sheets
const CONTACT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzk7IOqYCAUyG3ocaE8lBJxfgzNGT6I_fUA9VlK1ksJJx1Noqu3tQ7XdUOHBSl5FkSe/exec";

const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    type: "Contact",
    name: document.getElementById('contactName').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    phone: document.getElementById('contactPhone').value.trim(),
    gymName: document.getElementById('contactGymName').value.trim(),
    message: document.getElementById('contactMessage').value.trim()
  };

  contactSubmitBtn.disabled = true;
  
  try {
    await fetch(CONTACT_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Contact form submission failed:", err);
  } 

  contactSuccess.classList.add('visible');
  contactForm.reset();  
  contactSubmitBtn.disabled = false;
});




// Products & Services — full-page overlay (same behavior as index.html)
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