(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  const links = Array.from(document.querySelectorAll('.nav__link'));

  /* ---------- Mobile menu ---------- */
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav-toggle__label').textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Header border on scroll ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Selected work: category tabs ----------
     Tab dibangun otomatis dari atribut data-category / data-label di tiap .work-card.
     Tambah card dengan kategori baru -> tab + counter-nya muncul sendiri.
     Harus jalan SEBELUM scroll-reveal di bawah, supaya tab ikut ter-observe. */
  const tabList = document.querySelector('[data-work-tabs]');
  const panel = document.getElementById('work-panel');
  const grid = panel ? panel.querySelector('.work-grid') : null;

  if (tabList && panel && grid) {
    const status = document.getElementById('work-status');
    const cards = Array.from(grid.querySelectorAll('.work-card[data-category]'));

    // kategori diurutkan sesuai kemunculan pertama di HTML
    const categories = [{ key: 'all', label: 'All' }];
    cards.forEach((card) => {
      const key = card.dataset.category;
      if (!categories.some((c) => c.key === key)) {
        categories.push({ key, label: card.dataset.label || key });
      }
    });

    const countFor = (key) =>
      key === 'all' ? cards.length : cards.filter((c) => c.dataset.category === key).length;

    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;

    const tabs = categories.map((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab';
      btn.id = 'work-tab-' + cat.key;
      btn.dataset.key = cat.key;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-controls', panel.id);

      const text = document.createElement('span');
      text.textContent = cat.label;
      const count = document.createElement('span');
      count.className = 'tab__count';
      count.textContent = String(countFor(cat.key));

      btn.append(text, count);
      tabList.appendChild(btn);
      return btn;
    });
    tabList.hidden = false;

    const select = (key, { focus = false, userAction = false } = {}) => {
      const current = categories.find((c) => c.key === key) || categories[0];

      tabs.forEach((tab) => {
        const on = tab.dataset.key === current.key;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      });

      let visible = 0;
      cards.forEach((card) => {
        const show = current.key === 'all' || card.dataset.category === current.key;
        card.hidden = !show;
        if (show) visible += 1;
      });
      grid.dataset.count = String(visible);
      panel.setAttribute('aria-labelledby', 'work-tab-' + current.key);

      if (userAction) {
        // putar ulang animasi masuk untuk card yang tetap tampil
        cards.forEach((card) => {
          if (card.hidden) return;
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = '';
        });
        if (status) {
          const noun = visible === 1 ? 'project' : 'projects';
          status.textContent = current.key === 'all'
            ? `Showing all ${visible} ${noun}`
            : `Showing ${visible} ${noun} in ${current.label}`;
        }
      }
    };

    tabList.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (tab) select(tab.dataset.key, { userAction: true });
    });

    // keyboard: panah kiri/kanan, Home, End
    tabList.addEventListener('keydown', (e) => {
      const current = e.target.closest('.tab');
      if (!current) return;
      const i = tabs.indexOf(current);
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(tabs[next].dataset.key, { focus: true, userAction: true });
    });

    select('all');
  }

  /* ---------- Active nav link + scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const sections = links
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Photo fallback (initials) if image is missing ---------- */
  const img = document.querySelector('.photo__img');
  if (img) {
    const showFallback = () => img.closest('.photo').classList.add('photo--fallback');
    img.addEventListener('error', showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  }
})();