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
  const activationRange = 0.7;
  const widthUpdateThreshold = 0.5;
  let latestScrollY = window.scrollY;
  let ticking = false;
  let isInView = false;
  let lastProgressWidth = -1;
  let currentStepIndex = -1;

  const setDoneSteps = (doneIndex) => {
    processSteps.forEach((step, index) => {
      const isDone = index <= doneIndex;
      step.classList.toggle('is-done', isDone);
      step.classList.toggle('is-pending', !isDone);
    });
  };

  processSteps.forEach((step) => {
    step.classList.add('is-pending');
  });

  const updateProcessState = () => {
    ticking = false;

    if (!isInView) return;

    const sectionRect = processSection.getBoundingClientRect();
    const scrollRange = sectionRect.height + window.innerHeight;
    const rawProgress = (window.innerHeight - sectionRect.top) / scrollRange;
    const clampedProgress = Math.max(0, Math.min(1, rawProgress));
    const effectiveProgress = Math.max(0, Math.min(1, clampedProgress / activationRange));
    const progressWidth = effectiveProgress * 100;

    if (Math.abs(progressWidth - lastProgressWidth) > widthUpdateThreshold) {
      processWrap.style.setProperty('--progress', `${progressWidth}%`);
      lastProgressWidth = progressWidth;
    }

    const nextStepIndex = Math.max(
      -1,
      Math.min(processSteps.length - 1, Math.floor(effectiveProgress * processSteps.length) - 1)
    );

    if (nextStepIndex !== currentStepIndex) {
      currentStepIndex = nextStepIndex;
      setDoneSteps(currentStepIndex);
    }
  };

  const requestProcessUpdate = () => {
    if (ticking || !isInView) return;
    ticking = true;
    window.requestAnimationFrame(updateProcessState);
  };

  const processViewportObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isInView = entry.isIntersecting;

        if (isInView) {
          requestProcessUpdate();
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '15% 0px 15% 0px'
    }
  );

  processViewportObserver.observe(processSection);

  window.addEventListener(
    'scroll',
    () => {
      latestScrollY = window.scrollY;
      requestProcessUpdate();
    },
    { passive: true }
  );

  window.addEventListener('resize', () => {
    latestScrollY = window.scrollY;
    requestProcessUpdate();
  });

  if (prefersReducedMotion) {
    processWrap.style.setProperty('--progress', '100%');
    setDoneSteps(processSteps.length - 1);
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
