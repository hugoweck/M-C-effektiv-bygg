const siteHeader = document.querySelector('.site-header');
const heroBg = document.querySelector('.hero-bg');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeaderState = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 20);
};

updateHeaderState();
window.addEventListener('scroll', updateHeaderState, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll('.reveal').forEach((section) => revealObserver.observe(section));

if (!prefersReducedMotion) {
  window.addEventListener(
    'scroll',
    () => {
      if (!heroBg) return;
      const scrolled = Math.min(window.scrollY * 0.2, 120);
      heroBg.style.transform = `scale(1.08) translateY(${scrolled}px)`;
    },
    { passive: true }
  );
}

const processSection = document.querySelector('#process');
const processList = processSection?.querySelector('.process-list');
const processSteps = processSection ? [...processSection.querySelectorAll('.process-step')] : [];

if (processSection && processList && processSteps.length) {
  if (prefersReducedMotion) {
    processList.classList.add('is-visible');
    processSteps.forEach((step) => step.classList.add('is-visible'));
    processSteps[0]?.classList.add('is-active');
  } else {
    const processSectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          processList.classList.add('is-visible');
          processSteps.forEach((step, index) => {
            window.setTimeout(() => {
              step.classList.add('is-visible');
            }, index * 120);
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    processSectionObserver.observe(processSection);

    const setActiveStep = (activeStep) => {
      processSteps.forEach((step) => {
        step.classList.toggle('is-active', step === activeStep);
      });
    };

    const processStepObserver = new IntersectionObserver(
      (entries) => {
        const inViewEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!inViewEntries.length) return;
        setActiveStep(inViewEntries[0].target);
      },
      {
        threshold: [0.35, 0.6],
        rootMargin: '-42% 0px -42% 0px'
      }
    );

    processSteps.forEach((step) => processStepObserver.observe(step));
  }
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.target);
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(progress * target).toLocaleString('sv-SE');
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);

document.querySelectorAll('.counter').forEach((counter) => counterObserver.observe(counter));

document.querySelectorAll('a.page-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href) return;

    event.preventDefault();
    document.body.classList.add('page-leave');
    setTimeout(() => {
      window.location.href = href;
    }, 360);
  });
});
