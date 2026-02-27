const siteHeader = document.querySelector('.site-header');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowPowerDevice =
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4);

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

const initServiceCardAnimation = () => {
  const servicesGrid = document.querySelector('.service-grid');
  const serviceCards = document.querySelectorAll('.service-card');

  if (!servicesGrid || !serviceCards.length) return;

  if (prefersReducedMotion) {
    serviceCards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  const serviceCardObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        serviceCards.forEach((card) => card.classList.add('is-visible'));
        observer.disconnect();
      });
    },
    {
      threshold: 0.4
    }
  );

  serviceCardObserver.observe(servicesGrid);
};

initServiceCardAnimation();

// PROCESS ANIMATION START
const initProcessAnimation = () => {
  const processSection = document.querySelector('#process');
  const processWrap = processSection?.querySelector('[data-process]');
  const processSteps = processSection ? [...processSection.querySelectorAll('[data-step]')] : [];
  const disableProcessAnimation = prefersReducedMotion || isLowPowerDevice;

  if (!processSection || !processWrap || !processSteps.length) return;

  const setDoneSteps = (doneIndex) => {
    processSteps.forEach((step, index) => {
      const isDone = index <= doneIndex;
      step.classList.toggle('is-done', isDone);
      step.classList.toggle('is-pending', !isDone);
    });
  };

  if (disableProcessAnimation) {
    processSection.classList.add('process-static');
    processWrap.style.setProperty('--progress', '100%');
    setDoneSteps(processSteps.length - 1);
    return;
  }

  const activationRange = 0.7;
  const widthUpdateThreshold = 0.5;
  let ticking = false;
  let isInView = false;
  let lastProgressWidth = -1;
  let currentStepIndex = -1;

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
    if (!isInView || ticking) return;
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
      requestProcessUpdate();
    },
    { passive: true }
  );

  window.addEventListener('resize', requestProcessUpdate);
};

initProcessAnimation();
// PROCESS ANIMATION END

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

const initContactForm = () => {
  const form = document.querySelector('#contactForm');
  const submitButton = document.querySelector('#contactSubmit');
  const formStatus = document.querySelector('#formStatus');

  if (!form || !submitButton || !formStatus) return;

  const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';

  if (window.emailjs) {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!window.emailjs) {
      formStatus.textContent = 'Formulärtjänsten kunde inte laddas. Försök igen senare eller ring oss.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Skickar…';
    formStatus.textContent = 'Skickar…';

    const formData = new FormData(form);
    const templateParams = {
      to_email: 'info@mceffektivbygg.se',
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      message: formData.get('message')
    };

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      formStatus.textContent = 'Tack! Vi återkommer inom 24h.';
      form.reset();
    } catch (error) {
      formStatus.textContent = 'Något gick fel. Testa igen eller kontakta oss på 070-912 31 63.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Skicka förfrågan';
    }
  });
};

initContactForm();
