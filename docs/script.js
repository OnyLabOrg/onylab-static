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

// Theme switcher. 1 button cycles System, Light, Dark. System is the default
// and stores nothing, so the page keeps following the reader's setting; a
// forced choice is stored and applied by the inline script in the head before
// first paint. The browser chrome colour follows the forced choice too.
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  const root = document.documentElement;
  const order = ['system', 'light', 'dark'];
  const themeMetas = Array.from(document.querySelectorAll('meta[name="theme-color"]'));
  const metaColors = {};
  themeMetas.forEach((meta) => {
    const scheme = (meta.media || '').includes('dark') ? 'dark' : 'light';
    metaColors[scheme] = meta.content;
    meta.dataset.scheme = scheme;
  });

  const readTheme = () => {
    try {
      const stored = localStorage.getItem('olb-theme');
      return order.includes(stored) ? stored : 'system';
    } catch (error) {
      return root.dataset.theme || 'system';
    }
  };

  const applyTheme = (choice) => {
    if (choice === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);
    themeMetas.forEach((meta) => {
      meta.content = metaColors[choice === 'system' ? meta.dataset.scheme : choice];
    });
    const label = themeToggle.dataset[`label${choice[0].toUpperCase()}${choice.slice(1)}`];
    themeToggle.dataset.choice = choice;
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
  };

  applyTheme(readTheme());

  themeToggle.addEventListener('click', () => {
    const next = order[(order.indexOf(themeToggle.dataset.choice) + 1) % order.length];
    try {
      if (next === 'system') localStorage.removeItem('olb-theme');
      else localStorage.setItem('olb-theme', next);
    } catch (error) {
      /* Without storage the choice lasts until the reader leaves the page. */
    }
    applyTheme(next);
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

// Product tour. Without script every app panel shows, one under the other.
// With it, the panels become tabs, and any link to an app's panel (the map,
// the app cards, the footer) opens that tab instead of jumping down the list.
const tour = document.querySelector('.olb-custom-tour');

if (tour) {
  const tablist = tour.querySelector('[role="tablist"]');
  const tabs = Array.from(tour.querySelectorAll('[role="tab"]'));
  const panels = Array.from(tour.querySelectorAll('[role="tabpanel"]'));

  const select = (app, focus) => {
    const tab = tabs.find((t) => t.dataset.app === app);
    if (!tab) return false;
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.id !== `tour-${app}`; });
    // Keep the chosen tab visible when the strip scrolls sideways on a phone.
    if (tablist.scrollWidth > tablist.clientWidth) {
      tablist.scrollTo({ left: tab.offsetLeft - tablist.offsetLeft - 16 });
    }
    if (focus) tab.focus();
    return true;
  };

  tablist.hidden = false;
  tour.classList.add('is-enhanced');
  const fromHash = location.hash.startsWith('#tour-') ? location.hash.slice(6) : '';
  if (!select(fromHash) && tabs[0]) select(tabs[0].dataset.app);

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) select(tab.dataset.app);
  });

  tablist.addEventListener('keydown', (e) => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (keys[e.key] + tabs.length) % tabs.length;
    select(tabs[next].dataset.app, true);
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#tour-"]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname) return;
    const app = url.hash.slice(6);
    if (!select(app)) return;
    e.preventDefault();
    history.replaceState(null, '', url.hash);
    tour.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}
