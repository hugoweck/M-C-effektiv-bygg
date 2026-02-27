const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

if (prefersReducedMotion) {
  document.querySelectorAll('.process-step').forEach((step) => step.classList.add('show'));
} else {
  const processObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const steps = Array.from(entry.target.querySelectorAll('.process-step'));
        steps.forEach((step, index) => {
          step.style.transitionDelay = `${index * 120}ms`;
          step.classList.add('show');
        });
        processObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.28 }
  );

  const processList = document.querySelector('.process-line');
  if (processList) processObserver.observe(processList);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.target);
      const duration = prefersReducedMotion ? 300 : 1200;
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

const form = document.querySelector('#forfragan');
const formErrors = document.querySelector('#form-errors');
const formSuccess = document.querySelector('#form-success');
const fileInput = document.querySelector('#bilder');
const fileFeedback = document.querySelector('#file-feedback');

if (fileInput && fileFeedback) {
  fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files || []);

    if (files.length === 0) {
      fileFeedback.textContent = 'Ingen fil vald.';
      return;
    }

    if (files.length > 3) {
      fileFeedback.textContent = 'Välj max 3 bilder.';
      fileInput.value = '';
      return;
    }

    fileFeedback.textContent = `Valda filer: ${files.map((file) => file.name).join(', ')}`;
  });
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!formErrors || !formSuccess) return;

    formErrors.textContent = '';
    formSuccess.textContent = '';

    const formData = new FormData(form);
    const kundtyp = formData.get('kundtyp');
    const namn = formData.get('namn')?.toString().trim();
    const efternamn = formData.get('efternamn')?.toString().trim();
    const epost = formData.get('epost')?.toString().trim();
    const telefon = formData.get('telefon')?.toString().trim();
    const gdpr = formData.get('gdpr');
    const files = Array.from(fileInput?.files || []);

    const errors = [];
    if (!kundtyp) errors.push('Välj kundtyp.');
    if (!namn) errors.push('Fyll i namn.');
    if (!efternamn) errors.push('Fyll i efternamn.');
    if (!epost) errors.push('Fyll i e-post.');
    if (!telefon) errors.push('Fyll i telefon.');
    if (!gdpr) errors.push('Du måste godkänna GDPR för att skicka formuläret.');
    if (files.length > 3) errors.push('Du kan ladda upp max 3 bilder.');

    if (errors.length > 0) {
      formErrors.textContent = errors.join(' ');
      return;
    }

    formSuccess.textContent = 'Tack! Vi återkommer inom 24 timmar.';
    form.reset();
    if (fileFeedback) fileFeedback.textContent = 'Ingen fil vald.';
  });
}
