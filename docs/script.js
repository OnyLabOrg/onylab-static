// Header gains a hairline once the page has moved off the top.
const header = document.getElementById('header');
if (header) {
  const setScrolled = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', setScrolled, { passive: true });
  setScrolled();
}

// Collapsed navigation. The panel only exists at mobile widths; the button is
// hidden by CSS above that, so no width check is needed here.
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  const setOpen = (open) => {
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };

  navToggle.addEventListener('click', () => {
    setOpen(!navMenu.classList.contains('is-open'));
  });

  navMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !navMenu.classList.contains('is-open')) return;
    setOpen(false);
    navToggle.focus();
  });
}

// Language switcher. A disclosure button over a short list of links. Picking a
// language stores the choice, so the English root stops guessing from the
// browser setting on the next visit.
const langToggle = document.getElementById('langToggle');
const langMenu = document.getElementById('langMenu');

if (langToggle && langMenu) {
  const setLangOpen = (open) => {
    langMenu.classList.toggle('is-open', open);
    langToggle.setAttribute('aria-expanded', String(open));
  };

  langToggle.addEventListener('click', () => {
    setLangOpen(!langMenu.classList.contains('is-open'));
  });

  langMenu.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-lang]');
    if (!link) return;
    try {
      localStorage.setItem('olb-lang', link.dataset.lang);
    } catch (error) {
      /* Without storage the root page keeps following the browser setting. */
    }
    setLangOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (!langMenu.contains(e.target) && !langToggle.contains(e.target)) setLangOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !langMenu.classList.contains('is-open')) return;
    setLangOpen(false);
    langToggle.focus();
  });
}
