/* ============================================================
   PORTFOLIO — main.js
   ============================================================

   HOW TO ENABLE THE CONTACT FORM (takes ~2 minutes):
   ─────────────────────────────────────────────────────────
   1. Sign up for free at https://www.emailjs.com
   2. Add an Email Service (Gmail, Outlook, etc.)
   3. Create an Email Template — use these variables in it:
        {{from_name}}    → sender's name
        {{from_email}}   → sender's email (set as Reply-To)
        {{subject}}      → message subject
        {{message}}      → message body
   4. Copy your:
        • Public Key     (Account → API Keys)
        • Service ID     (Email Services)
        • Template ID    (Email Templates)
   5. Paste them into the CONFIG object below.
   ─────────────────────────────────────────────────────────
*/

const CONFIG = {
  emailjsPublicKey:  '_YnG-mxJ2py87rtts',   // ← paste here
  emailjsServiceId:  'service_eswzecr',   // ← paste here
  emailjsTemplateId: 'template_jrr6fh9',  // ← paste here
};

/* ── LOAD EMAILJS SDK ── */
(function loadEmailJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = () => {
    if (CONFIG.emailjsPublicKey !== 'YOUR_PUBLIC_KEY') {
      emailjs.init({ publicKey: CONFIG.emailjsPublicKey });
      console.log('EmailJS ready ✦');
    } else {
      console.warn('EmailJS: paste your keys into CONFIG in main.js');
    }
  };
  document.head.appendChild(script);
})();

/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

function animateCursor() {
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════════════
   HERO PARALLAX
══════════════════════════════════════════════ */
const heroBgText = document.querySelector('.hero-bg-text');
window.addEventListener('scroll', () => {
  if (heroBgText) {
    heroBgText.style.transform =
      `translate(-50%, calc(-50% + ${window.scrollY * 0.15}px))`;
  }
});

/* ══════════════════════════════════════════════
   ACTIVE NAV LINK
══════════════════════════════════════════════ */
const navSections = document.querySelectorAll('section[id], div[id]');
const navLinks    = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  navSections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
  });
  navLinks.forEach(link => {
    link.style.opacity =
      link.getAttribute('href') === '#' + current ? '1' : '0.6';
  });
});

/* ══════════════════════════════════════════════
   CONTACT FORM — VALIDATION + EMAILJS SUBMIT
══════════════════════════════════════════════ */
const form       = document.getElementById('contactForm');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = submitBtn?.querySelector('.btn-text');
const btnLoading = submitBtn?.querySelector('.btn-loading');
const successBox = document.getElementById('formSuccess');
const failBox    = document.getElementById('formFail');

/* Helper: show/hide field error */
function setError(inputId, errorId, show) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return;
  if (show) {
    input.classList.add('invalid');
    error.classList.add('show');
  } else {
    input.classList.remove('invalid');
    error.classList.remove('show');
  }
}

/* Helper: validate the whole form, returns true if valid */
function validateForm() {
  const name    = document.getElementById('name')?.value.trim();
  const email   = document.getElementById('email')?.value.trim();
  const subject = document.getElementById('subject')?.value.trim();
  const message = document.getElementById('message')?.value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let valid = true;

  setError('name',    'nameError',    !name);
  setError('email',   'emailError',   !email || !emailRe.test(email));
  setError('subject', 'subjectError', !subject);
  setError('message', 'messageError', !message);

  if (!name || !subject || !message)              valid = false;
  if (!email || !emailRe.test(email))             valid = false;
  return valid;
}

/* Clear errors on input */
['name','email','subject','message'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    const errId = id + 'Error';
    setError(id, errId, false);
  });
});

/* Submit handler */
form?.addEventListener('submit', async e => {
  e.preventDefault();

  if (!validateForm()) return;

  /* Check keys are configured */
  if (CONFIG.emailjsPublicKey === 'YOUR_PUBLIC_KEY') {
    alert(
      '⚠️ EmailJS is not configured yet.\n\n' +
      'Open main.js and paste your Public Key, Service ID, and Template ID into the CONFIG object at the top of the file.\n\n' +
      'See the comments in main.js for step-by-step instructions.'
    );
    return;
  }

  /* Loading state */
  submitBtn.disabled = true;
  btnText.hidden     = true;
  btnLoading.hidden  = false;
  successBox.hidden  = true;
  failBox.hidden     = true;

  const templateParams = {
    from_name:  document.getElementById('name').value.trim(),
    from_email: document.getElementById('email').value.trim(),
    subject:    document.getElementById('subject').value.trim(),
    message:    document.getElementById('message').value.trim(),
  };

  try {
    await emailjs.send(
      CONFIG.emailjsServiceId,
      CONFIG.emailjsTemplateId,
      templateParams
    );

    /* Success */
    successBox.hidden = false;
    form.reset();
  } catch (err) {
    console.error('EmailJS error:', err);
    failBox.hidden = false;
  } finally {
    submitBtn.disabled = false;
    btnText.hidden     = false;
    btnLoading.hidden  = true;
  }
});
