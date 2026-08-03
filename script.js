  // Lenis smooth scroll — default config, same as lenis.dev
  window.lenis = new Lenis();

  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);






  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });


  //pop up 
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        statObserver.unobserve(entry.target);
      }
    });   
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat').forEach(stat => {
    stat.style.opacity = 0;
    stat.style.transform = 'translateY(20px)';
    stat.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    statObserver.observe(stat);
  });
  //,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
  const heroVideo = document.querySelector('.hero-video');
  const soundToggle = document.getElementById('soundToggle');

  function attemptUnmutedAutoplay() {
    heroVideo.muted = false;
    const playPromise = heroVideo.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Browser allowed sound — great
          soundToggle.textContent = '🔊';
        })
        .catch(() => {
          // Browser blocked it — fall back to muted autoplay
          heroVideo.muted = true;
          heroVideo.play();
          soundToggle.textContent = '🔇';
        });
    }
  }

  attemptUnmutedAutoplay();

  // Manual toggle always available
  soundToggle.addEventListener('click', () => {
    heroVideo.muted = !heroVideo.muted;
    soundToggle.textContent = heroVideo.muted ? '🔇' : '🔊';
  });

  // ..............................

  const hero = document.querySelector('.hero');

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;  // 0 to 1 across width
    const y = (e.clientY - rect.top) / rect.height;   // 0 to 1 across height

    // Distance from center, -0.5 to 0.5
    const offsetX = (x - 0.5) * 20;  // max 20px shift
    const offsetY = (y - 0.5) * 20;

    heroVideo.style.transform = `scale(1.1) translate(${offsetX}px, ${offsetY}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    heroVideo.style.transform = 'scale(1.05) translate(0, 0)';
  });

  // ...................................
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.reveal-group').forEach(group => {
    const items = group.querySelectorAll('.reveal-scale');
    items.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${i * 0.15}s`);
      revealObserver.observe(el);
    });
  }); 

  //.................................
  window.addEventListener('load', () => {
    document.querySelector('.hero-logo-overlay').classList.add('visible');

    // slight delay so text follows the ribbon logo in, not simultaneous
    setTimeout(() => {
      document.querySelector('.hero-content').classList.add('visible');
    }, 300);
  });
  // ...............................................................................
  const heroSection = document.querySelector('.hero');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const fadeDistance = window.innerHeight; // fades out over one full screen height of scrolling

    const progress = Math.min(scrollY / fadeDistance, 1); // 0 to 1

    heroSection.style.opacity = 1 - progress;
    heroSection.style.transform = `scale(${1 - progress * 0.1}) translateY(${progress * 40}px)`;
  });


  // Plans section — fade/scale out as it exits, same feel as hero
  // Plans section — fade/scale out as it exits, same feel as hero
  // const plansInner = document.querySelector('.plans-inner');

  // window.lenis.on('scroll', () => {
  //   const rect = plansInner.getBoundingClientRect();
  //   const exitDistance = window.innerHeight;

  //   const exitProgress = Math.min(Math.max(-rect.top / exitDistance, 0), 1);

  //   plansInner.style.opacity = 1 - exitProgress;

  //   // No scaling
  //   plansInner.style.transform = `translateY(${-exitProgress * 40}px)`;
  // });

  document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateX = y * -10;
      const rotateY = x * 10;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });





  // Scroll-reveal for plan cards, steps, and section headers
  const homeRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        homeRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-up, .plan-reveal').forEach(el => homeRevealObserver.observe(el));

  document.querySelectorAll('.plans-grid').forEach(grid => {
    [...grid.children].forEach((card, i) => {
      card.style.setProperty('--reveal-delay', `${i * 0.12}s`);
    });
  });

  document.querySelectorAll('.steps').forEach(stepsGrid => {
    [...stepsGrid.children].forEach((step, i) => {
      step.style.setProperty('--reveal-delay', `${i * 0.1}s`);
    });
  });











  // ......................................

  const steps = document.querySelectorAll(".step");

  const observer = new IntersectionObserver((entries)=>{

      entries.forEach(entry=>{

          if(entry.isIntersecting){

              steps.forEach(s=>{
                  s.style.opacity=".25";
              });

              entry.target.style.opacity="1";
          }

      });

  },{
      threshold:0.55
  });

  steps.forEach(step=>{

      step.style.transition="opacity .45s ease";
      step.style.opacity=".25";

      observer.observe(step);

  });


  // left side stable right side moving 
  gsap.registerPlugin(ScrollTrigger);

  let mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", () => {
    ScrollTrigger.create({
      trigger: ".how-it-works",
      start: "top top",
      end: "bottom bottom",
      pin: ".how-sticky",
      pinSpacing: false
    });
  });











  
    






  const scriptURL = "https://script.google.com/macros/s/AKfycbx9aNLo2esQaWBqBzd0e0FaffkmHmk75YJlWeNYh-lwYZBhGunRPNx_icMjQ3wHbAwnNw/exec";

const form = document.getElementById("myForm");

if (form) {
form.addEventListener("submit", async (e) => {
  
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    time: document.getElementById("time").value
  };

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    alert("Data Saved Successfully!");
    console.log(result);

    form.reset();

  } catch (error) {
    console.error(error);
    alert("Failed to save data.");
  }
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

    servicesOverlayBackdrop.addEventListener('click', closeServicesOverlay);
    servicesOverlayClose.addEventListener('click', closeServicesOverlay);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && servicesOverlay.classList.contains('open')) {
        closeServicesOverlay();
      }
    });
  }
