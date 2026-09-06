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
