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
const processProgressLine = processSection?.querySelector('.process-progress-line');
const processTrack = processSection?.querySelector('.process-track');
const processSteps = processSection ? [...processSection.querySelectorAll('.process-step')] : [];

if (processSection && processWrap && processProgressLine && processTrack && processSteps.length) {
  const setActiveStep = (index) => {
    processSteps.forEach((step, stepIndex) => {
      step.classList.toggle('active', stepIndex === index);
    });
  };

  const isMobileLayout = () => window.innerWidth <= 768;

  if (prefersReducedMotion) {
    processProgressLine.style.width = '100%';
    processSteps.forEach((step) => step.classList.add('is-visible'));
    setActiveStep(0);
  } else {
    const processRevealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          processSteps.forEach((step, index) => {
            window.setTimeout(() => step.classList.add('is-visible'), index * 100);
          });

          observer.disconnect();
        });
      },
      {
        threshold: 0.22,
        rootMargin: '0px 0px -12% 0px'
      }
    );

    processRevealObserver.observe(processSection);

    let ticking = false;

    const updateDesktopProgress = () => {
      const sectionRect = processSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollDistance = sectionRect.height + viewportHeight;
      const rawProgress = ((viewportHeight - sectionRect.top) / scrollDistance) * 100;
      const clampedProgress = Math.max(0, Math.min(100, rawProgress));

      processProgressLine.style.width = `${clampedProgress}%`;

      const activeIndex = Math.min(
        processSteps.length - 1,
        Math.max(0, Math.floor((clampedProgress / 100) * processSteps.length))
      );

      setActiveStep(activeIndex);
    };

    const updateMobileActiveStep = () => {
      const trackRect = processTrack.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let closestIndex = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;

      processSteps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(center - trackCenter);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveStep(closestIndex);
    };

    const updateProcessState = () => {
      if (isMobileLayout()) {
        updateMobileActiveStep();
      } else {
        updateDesktopProgress();
      }

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
    processTrack.addEventListener('scroll', requestProcessUpdate, { passive: true });
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
