(() => {
  const LANGUAGE_KEY = 'lizaLanguage';
  const nav = document.querySelector('.site-header .nav');
  const mobileNav = nav?.querySelector('.nav-links');
  const langSwitch = document.getElementById('langSwitch');
  const langBtn = document.getElementById('langBtn');
  const langMenu = document.getElementById('langMenu');
  const language = (document.documentElement.dataset.staticLang || document.documentElement.lang || 'de').toLowerCase();
  const menuLabels = {
    de: 'Menü öffnen',
    en: 'Open menu',
    bs: 'Otvori meni'
  };

  function closeMobileNavigation() {
    mobileNav?.classList.remove('open');
    const burger = document.getElementById('burger');
    burger?.classList.remove('active');
    burger?.setAttribute('aria-expanded', 'false');
  }

  if (nav && mobileNav) {
    mobileNav.id = mobileNav.id || 'mobile-nav';
    mobileNav.classList.add('primary');

    ['services-dropdown', 'portfolio-dropdown'].forEach((dropdownClass) => {
      const dropdown = mobileNav.querySelector(`.${dropdownClass}`);
      if (!dropdown) {
        return;
      }

      const markerClass = dropdownClass === 'services-dropdown'
        ? 'service-page-link'
        : 'portfolio-page-link';
      if (mobileNav.querySelector(`.${markerClass}`)) {
        return;
      }

      const fragment = document.createDocumentFragment();

      dropdown.querySelectorAll('.nav-dropdown-menu a').forEach((link) => {
        const clone = link.cloneNode(true);
        clone.classList.add(markerClass);
        fragment.appendChild(clone);
      });
      dropdown.after(fragment);
    });

    let burger = document.getElementById('burger');
    if (!burger) {
      burger = document.createElement('button');
      burger.className = 'burger';
      burger.id = 'burger';
      burger.type = 'button';
      burger.innerHTML = '<span></span><span></span><span></span>';

      const brand = nav.querySelector('.brand');
      nav.insertBefore(burger, brand || mobileNav);
    }

    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', mobileNav.id);
    burger.setAttribute('aria-label', menuLabels[language] || menuLabels.de);

    burger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = mobileNav.classList.toggle('open');
      burger.classList.toggle('active', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNavigation);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 640) {
        closeMobileNavigation();
      }
    });
  }

  if (langBtn && langMenu) {
    langBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = langMenu.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.lang-option').forEach((option) => {
    option.addEventListener('click', () => {
      try {
        localStorage.setItem(LANGUAGE_KEY, option.dataset.lang || 'de');
      } catch (_error) {
        // Language navigation still works when storage is unavailable.
      }
    });
  });

  document.addEventListener('click', (event) => {
    if (nav && !nav.contains(event.target)) {
      closeMobileNavigation();
    }
    if (langSwitch && !langSwitch.contains(event.target)) {
      langMenu?.classList.remove('open');
      langBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
