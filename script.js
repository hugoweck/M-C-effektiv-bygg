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
const processWrap = processSection?.querySelector('[data-process]');
const processSteps = processSection ? [...processSection.querySelectorAll('[data-step]')] : [];

if (processSection && processWrap && processSteps.length) {
  const setActiveStep = (activeStep) => {
    processSteps.forEach((step) => {
      step.classList.toggle('is-active', step === activeStep);
    });
  };

  if (prefersReducedMotion) {
    processWrap.style.setProperty('--progress', '100%');
    processSteps.forEach((step) => {
      step.classList.add('is-visible');
    });
    setActiveStep(processSteps[0]);
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const step = entry.target;
          const stepIndex = processSteps.indexOf(step);
          window.setTimeout(() => {
            step.classList.add('is-visible');
          }, stepIndex * 120);

          observer.unobserve(step);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    processSteps.forEach((step) => revealObserver.observe(step));

    let ticking = false;

    const updateProcessState = () => {
      const viewportCenter = window.innerHeight * 0.5;
      const sectionRect = processSection.getBoundingClientRect();
      const scrollRange = sectionRect.height + window.innerHeight;
      const sectionProgress = ((window.innerHeight - sectionRect.top) / scrollRange) * 100;
      const clampedProgress = Math.max(0, Math.min(100, sectionProgress));
      processWrap.style.setProperty('--progress', `${clampedProgress}%`);

      if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) {
        ticking = false;
        return;
      }

      let nearestStep = processSteps[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      processSteps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const distance = Math.abs(stepCenter - viewportCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestStep = step;
        }
      });

      setActiveStep(nearestStep);
      ticking = false;
    };

    const requestProcessUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProcessState);
    };

    requestProcessUpdate();
    window.addEventListener('scroll', requestProcessUpdate, { passive: true });
    window.addEventListener('resize', requestProcessUpdate);
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
