const MQ_DESKTOP = window.matchMedia('(min-width: 960px)');

const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');
const navButtons = document.querySelectorAll('.nav-list button');
const sections = document.querySelectorAll('main section[id]');

function isDesktop() {
  return MQ_DESKTOP.matches;
}

function setMenuOpen(open) {
  if (!header) return;

  // Op desktop geen overlay-menu
  if (isDesktop()) open = false;

  header.classList.toggle('is-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';

  if (toggle) {
    toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  }

  if (open && nav) {
    const first = nav.querySelector('button');
    first?.focus();
  }
}

function scrollToTarget(id) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  if (id === 'main') {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  const headerOffset = header ? header.offsetHeight : 0;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function updateHeaderState() {
  if (!header || !hero) return;
  const threshold = Math.max(hero.offsetHeight - header.offsetHeight - 40, 80);
  header.classList.toggle('is-scrolled', window.scrollY > threshold);
}

function initScrollNav() {
  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.getAttribute('data-scroll');
      setMenuOpen(false);
      scrollToTarget(target);
    });
  });
}

function initNav() {
  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenuOpen(!header.classList.contains('is-open'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  });

  // Sluit menu bij klik buiten de header-acties (op de overlay)
  nav?.addEventListener('click', (e) => {
    if (e.target === nav) setMenuOpen(false);
  });

  const onViewportChange = () => {
    if (isDesktop()) setMenuOpen(false);
    updateHeaderState();
  };

  if (typeof MQ_DESKTOP.addEventListener === 'function') {
    MQ_DESKTOP.addEventListener('change', onViewportChange);
  } else {
    MQ_DESKTOP.addListener(onViewportChange);
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  window.addEventListener('resize', updateHeaderState, { passive: true });
  updateHeaderState();
}

function initReveal() {
  const nodes = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );

  nodes.forEach((n) => observer.observe(n));

  requestAnimationFrame(() => {
    document.querySelectorAll('.hero .reveal').forEach((n) => n.classList.add('is-visible'));
  });
}

function initActiveSection() {
  if (!('IntersectionObserver' in window) || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navButtons.forEach((btn) => {
          btn.classList.toggle('is-active', btn.getAttribute('data-scroll') === id);
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

initScrollNav();
initNav();
initReveal();
initActiveSection();
initYear();
initCookies();
initHashScroll();
initHScroll();
initCareerList();
initIntroCarousel();

function initIntroCarousel() {
  const track = document.querySelector('[data-intro-carousel]');
  if (!track) return;

  const mq = window.matchMedia('(max-width: 699px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originals = [...track.children];
  if (originals.length < 2) return;

  let clones = [];

  function sync() {
    const wantMarquee = mq.matches && !reduce.matches;

    if (wantMarquee && !clones.length) {
      originals.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
        clones.push(clone);
      });
    } else if (!wantMarquee && clones.length) {
      clones.forEach((c) => c.remove());
      clones = [];
    }

    track.classList.toggle('is-marquee', wantMarquee);
  }

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', sync);
  } else {
    mq.addListener(sync);
  }

  if (typeof reduce.addEventListener === 'function') {
    reduce.addEventListener('change', sync);
  } else if (typeof reduce.addListener === 'function') {
    reduce.addListener(sync);
  }

  sync();
}

function initYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = year;
  });
}

function initHashScroll() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || !document.getElementById(hash)) return;

  window.setTimeout(() => {
    scrollToTarget(hash);
    // Clean hash from address bar without jump (optional: keep for shareability)
  }, 50);
}

function initCareerList() {
  const list = document.querySelector('[data-career-list]');
  if (!list) return;

  list.querySelectorAll('.career-item').forEach((item) => {
    const trigger = item.querySelector('.career-item-trigger');
    const panel = item.querySelector('.career-item-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
  });
}

function initHScroll() {
  const mq = window.matchMedia('(max-width: 899px)');

  function snapToNearest(scroller) {
    const items = [...scroller.children].filter((el) => el.nodeType === 1);
    if (!items.length) return;

    const origin = items[0].offsetLeft;
    let bestLeft = scroller.scrollLeft;
    let bestDist = Infinity;

    items.forEach((item) => {
      const left = item.offsetLeft - origin;
      const dist = Math.abs(left - scroller.scrollLeft);
      if (dist < bestDist) {
        bestDist = dist;
        bestLeft = left;
      }
    });

    scroller.scrollTo({ left: bestLeft, behavior: 'smooth' });
  }

  function syncHints() {
    const mobile = mq.matches;
    document.querySelectorAll('[data-h-scroll]').forEach((scroller) => {
      const hint = scroller.parentElement?.querySelector('[data-h-scroll-hint]');
      if (!hint) return;

      if (!mobile) {
        hint.hidden = true;
        return;
      }

      const canScroll = scroller.scrollWidth > scroller.clientWidth + 8;
      hint.hidden = !canScroll;
    });
  }

  document.querySelectorAll('[data-h-scroll]').forEach((scroller) => {
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let moved = false;

    scroller.addEventListener('pointerdown', (e) => {
      // Touch gebruikt native snap; muis-drag snapten we zelf
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      scroller.setPointerCapture?.(e.pointerId);
    });

    scroller.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      scroller.scrollLeft = startScroll - dx;
    });

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      if (moved) snapToNearest(scroller);
    };

    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener(
      'scroll',
      () => {
        const hint = scroller.parentElement?.querySelector('[data-h-scroll-hint]');
        if (hint && scroller.scrollLeft > 24) hint.hidden = true;
      },
      { passive: true }
    );
  });

  syncHints();
  window.addEventListener('resize', syncHints, { passive: true });
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', syncHints);
  } else {
    mq.addListener(syncHints);
  }
}

function initCookies() {
  const STORAGE_KEY = 'consulterra-cookies';
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');

  function showBanner() {
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
  }

  function saveChoice(value) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice: value, at: new Date().toISOString() })
      );
    } catch {
      /* private mode / blocked storage */
    }
    hideBanner();
  }

  function hasChoice() {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  }

  acceptBtn?.addEventListener('click', () => saveChoice('accepted'));
  rejectBtn?.addEventListener('click', () => saveChoice('rejected'));

  document.querySelectorAll('[data-cookie-settings]').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      showBanner();
    });
  });

  if (!hasChoice()) {
    // Kleine delay zodat de layout eerst kan laden
    window.setTimeout(showBanner, 600);
  }
}
