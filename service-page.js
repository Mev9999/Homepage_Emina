(() => {
  const LANGUAGE_KEY = 'lizaLanguage';
  const DEFAULT_LANG = 'de';
  const supportedLangs = ['de', 'en', 'bs'];
  const SITE_ORIGIN = 'https://liza-memories-photography.com/';
  const BUSINESS_MAP_URL = 'https://maps.app.goo.gl/Absk5FRMgyCuUwxe9';
  const BUSINESS_OPENING_HOURS = [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'https://schema.org/Monday',
        'https://schema.org/Tuesday',
        'https://schema.org/Wednesday',
        'https://schema.org/Thursday',
        'https://schema.org/Friday'
      ],
      opens: '16:00',
      closes: '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'https://schema.org/Saturday',
        'https://schema.org/Sunday'
      ],
      opens: '08:00',
      closes: '18:00'
    }
  ];
  const LANGUAGE_SUFFIX_PATTERN = /-(en|bs)\.html$/i;
  const HOME_PROMO_SCRIPT_ID = 'homePromoScript';

  const pageByFile = {
    'ueber-mich.html': 'about',
    'portraitfotografie-graz.html': 'portrait',
    'babybauch-shooting-graz.html': 'babybauch',
    'babybauch-und-neugeborenen-shooting-graz.html': 'combo',
    'newborn-fotografie-graz.html': 'newborn',
    'familienfotografie-graz.html': 'familie',
    'hochzeitsfotograf-graz.html': 'hochzeit'
  };
  const serviceLinks = [
    { key: 'portrait', href: 'portraitfotografie-graz.html' },
    { key: 'maternity', href: 'babybauch-shooting-graz.html' },
    { key: 'newborn', href: 'newborn-fotografie-graz.html' },
    { key: 'family', href: 'familienfotografie-graz.html' },
    { key: 'combo', href: 'babybauch-und-neugeborenen-shooting-graz.html' },
    { key: 'wedding', href: 'hochzeitsfotograf-graz.html' }
  ];
  const priceAnchorByPage = {
    portrait: 'portrait',
    babybauch: 'babybauch',
    newborn: 'neugeborene',
    familie: 'familie',
    combo: 'kombi',
    hochzeit: 'hochzeit'
  };

  function stripLanguageSuffix(fileName){
    return fileName.replace(LANGUAGE_SUFFIX_PATTERN, '.html');
  }

  function normalizeHtmlPath(fileName){
    return (fileName || '').replace(/^\/+/, '') || 'index.html';
  }

  function getLanguageFromFile(fileName){
    const match = normalizeHtmlPath(fileName).match(LANGUAGE_SUFFIX_PATTERN);
    return match ? match[1].toLowerCase() : DEFAULT_LANG;
  }

  function isHomeFile(fileName){
    return stripLanguageSuffix(normalizeHtmlPath(fileName)).toLowerCase() === 'index.html';
  }

  function buildLocalizedFileName(fileName, lang){
    const normalizedFile = stripLanguageSuffix(normalizeHtmlPath(fileName));
    if(isHomeFile(normalizedFile)){
      return lang === DEFAULT_LANG ? 'index.html' : `index-${lang}.html`;
    }
    if(lang === DEFAULT_LANG){
      return normalizedFile;
    }
    return normalizedFile.replace(/\.html$/i, `-${lang}.html`);
  }

  function buildLocalizedHref(fileName, lang){
    if(isHomeFile(fileName)){
      return lang === DEFAULT_LANG ? '/' : `index-${lang}.html`;
    }
    return buildLocalizedFileName(fileName, lang);
  }

  function buildAbsoluteUrlForLanguage(fileName, lang){
    return new URL(buildLocalizedHref(fileName, lang), SITE_ORIGIN).toString();
  }

  function buildAbsoluteUrl(fileName){
    return buildAbsoluteUrlForLanguage(fileName, getLanguageFromFile(fileName));
  }

  const currentFileName = window.location.pathname.split('/').pop() || 'babybauch-shooting-graz.html';
  const baseFileName = stripLanguageSuffix(currentFileName);
  const urlLanguage = getLanguageFromFile(currentFileName);
  const staticLang = (document.documentElement.getAttribute('data-static-lang') || '').toLowerCase();
  const pageKey = pageByFile[baseFileName];

  function ensureHomePromoScript(){
    if(document.getElementById(HOME_PROMO_SCRIPT_ID)){
      return;
    }

    const script = document.createElement('script');
    script.id = HOME_PROMO_SCRIPT_ID;
    script.src = 'scripts/home-promo.js';
    script.defer = true;
    document.head.appendChild(script);
  }

  ensureHomePromoScript();

  if(!pageKey){
    return;
  }

  const menuLabels = {
    de: 'Men\u00fc \u00f6ffnen',
    en: 'Open menu',
    bs: 'Otvori meni'
  };

  const siteHeaderNav = document.querySelector('.site-header .nav');
  const mobileNav = siteHeaderNav?.querySelector('.nav-links');

  function ensureServiceLinks(){
    const menu = mobileNav?.querySelector('.services-dropdown .nav-dropdown-menu');
    if(menu){
      menu.replaceChildren(...serviceLinks.map((service) => {
        const link = document.createElement('a');
        link.href = service.href;
        link.dataset.serviceKey = service.key;
        return link;
      }));
    }

    const footerLinks = document.querySelector('.footer-primary-links');
    if(footerLinks){
      const portfolio = footerLinks.querySelector('a');
      const links = serviceLinks.map((service) => {
        const link = document.createElement('a');
        link.href = service.href;
        link.dataset.serviceKey = service.key;
        return link;
      });
      footerLinks.replaceChildren(...(portfolio ? [portfolio, ...links] : links));
    }
  }

  ensureServiceLinks();

  if(siteHeaderNav && mobileNav){
    mobileNav.id = mobileNav.id || 'mobile-nav';
    mobileNav.classList.add('primary');

    const servicesDropdown = mobileNav.querySelector('.services-dropdown');
    if(servicesDropdown && !mobileNav.querySelector('.service-page-link')){
      const servicesFragment = document.createDocumentFragment();
      servicesDropdown.querySelectorAll('.nav-dropdown-menu a').forEach((link) => {
        const clone = link.cloneNode(true);
        clone.classList.add('service-page-link');
        servicesFragment.appendChild(clone);
      });
      servicesDropdown.after(servicesFragment);
    }

    const portfolioDropdown = mobileNav.querySelector('.portfolio-dropdown');
    if(portfolioDropdown && !mobileNav.querySelector('.portfolio-page-link')){
      const portfolioFragment = document.createDocumentFragment();
      portfolioDropdown.querySelectorAll('.nav-dropdown-menu a').forEach((link) => {
        const clone = link.cloneNode(true);
        clone.classList.add('portfolio-page-link');
        portfolioFragment.appendChild(clone);
      });
      portfolioDropdown.after(portfolioFragment);
    }

    if(!document.getElementById('burger')){
      const burger = document.createElement('button');
      burger.className = 'burger';
      burger.id = 'burger';
      burger.type = 'button';
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-controls', mobileNav.id);
      burger.setAttribute('aria-label', menuLabels[urlLanguage] || menuLabels[DEFAULT_LANG]);
      burger.innerHTML = '<span></span><span></span><span></span>';
      const brand = siteHeaderNav.querySelector('.brand');
      siteHeaderNav.insertBefore(burger, brand || mobileNav);
    }
  }

  const common = {
    de: {
      languageLabel: 'Sprache wählen',
      nav: { home: 'Home', about: 'Über mich', services: 'Leistungen', portfolio: 'Portfolio', gallery1: 'Babybauch Galerie', gallery2: 'Neugeborenen Galerie', gallery3: 'Familien Galerie', gallery4: 'Hochzeits Galerie', pricing: 'Preise', faq: 'Häufige Fragen', contact: 'Kontakt' },
      services: { portrait: 'Portrait', maternity: 'Babybauch', newborn: 'Neugeborene', family: 'Familie', combo: 'Babybauch & Neugeborene', wedding: 'Hochzeit' },
      breadcrumbs: { aria: 'Breadcrumb', home: 'Startseite', services: 'Leistungen' },
      contact: { email: 'E-Mail', phone: 'Telefon', location: 'Standort', more: 'Weitere Leistungen', locationValue: '8054 Graz' },
      footer: {
        portfolio: 'Portfolio',
        service1: 'Babybauch',
        service2: 'Neugeborene',
        service3: 'Familie',
        service4: 'Hochzeit',
        cta: 'Jetzt anfragen',
        contact: 'Kontakt',
        imprint: 'Impressum',
        privacy: 'Datenschutz',
        terms: 'AGB',
        copyright: '© {year} LiZa Memories Photography. Alle Rechte vorbehalten.'
      }
    },
    en: {
      languageLabel: 'Choose language',
      nav: { home: 'Home', about: 'About', services: 'Services', portfolio: 'Portfolio', gallery1: 'Maternity Gallery', gallery2: 'Newborn Gallery', gallery3: 'Family Gallery', gallery4: 'Wedding Gallery', pricing: 'Pricing', faq: 'FAQs', contact: 'Contact' },
      services: { portrait: 'Portrait', maternity: 'Maternity', newborn: 'Newborn', family: 'Family', combo: 'Maternity & Newborn', wedding: 'Wedding' },
      breadcrumbs: { aria: 'Breadcrumb', home: 'Home', services: 'Services' },
      contact: { email: 'Email', phone: 'Phone', location: 'Location', more: 'More services', locationValue: '8054 Graz' },
      footer: {
        portfolio: 'Portfolio',
        service1: 'Maternity',
        service2: 'Newborn',
        service3: 'Family',
        service4: 'Wedding',
        cta: 'Inquire now',
        contact: 'Contact',
        imprint: 'Imprint',
        privacy: 'Privacy',
        terms: 'Terms',
        copyright: '© {year} LiZa Memories Photography. All rights reserved.'
      }
    },
    bs: {
      languageLabel: 'Odaberi jezik',
      nav: { home: 'Početna', about: 'O meni', services: 'Usluge', portfolio: 'Portfolio', gallery1: 'Trudnička galerija', gallery2: 'Galerija novorođenčadi', gallery3: 'Porodična galerija', gallery4: 'Galerija vjenčanja', pricing: 'Cijene', faq: 'Česta pitanja', contact: 'Kontakt' },
      services: { portrait: 'Portret', maternity: 'Trudničko', newborn: 'Novorođenčad', family: 'Porodica', combo: 'Trudničko & novorođenče', wedding: 'Vjenčanje' },
      breadcrumbs: { aria: 'Breadcrumb', home: 'Početna', services: 'Usluge' },
      contact: { email: 'E-mail', phone: 'Telefon', location: 'Lokacija', more: 'Ostale usluge', locationValue: '8054 Graz' },
      footer: {
        portfolio: 'Portfolio',
        service1: 'Trudničko',
        service2: 'Novorođenčad',
        service3: 'Porodica',
        service4: 'Vjenčanje',
        cta: 'Pošalji upit',
        contact: 'Kontakt',
        imprint: 'Impresum',
        privacy: 'Zaštita podataka',
        terms: 'Uslovi',
        copyright: '© {year} LiZa Memories Photography. Sva prava zadržana.'
      }
    }
  };

  const pages = {};

  const refs = {
    siteHeaderNav,
    burger: document.getElementById('burger'),
    mobileNav,
    navLinks: document.querySelectorAll('.nav-links > a:not(.nav-icon-link):not(.service-page-link):not(.portfolio-page-link), .nav-links > .nav-dropdown > a'),
    servicesMenuLinks: document.querySelectorAll('.services-dropdown .nav-dropdown-menu a'),
    portfolioMenuLinks: document.querySelectorAll('.portfolio-dropdown .nav-dropdown-menu a'),
    mobileServiceLinks: document.querySelectorAll('.service-page-link'),
    mobilePortfolioLinks: document.querySelectorAll('.portfolio-page-link'),
    breadcrumbs: document.querySelector('.breadcrumbs'),
    breadcrumbLinks: document.querySelectorAll('.breadcrumbs a'),
    breadcrumbCurrent: document.querySelector('.breadcrumbs li[aria-current="page"]'),
    heroEyebrow: document.querySelector('.hero .eyebrow'),
    heroTitle: document.querySelector('.hero h1'),
    heroLead: document.querySelector('.hero .lead'),
    heroButtons: document.querySelectorAll('.hero .hero-actions a'),
    heroPoints: document.querySelectorAll('.hero-points div'),
    heroImage: document.querySelector('.hero-visual img'),
    section1Head: document.querySelector('[data-section-head="section1"]') || document.querySelectorAll('.section-head')[0],
    section2Head: document.querySelector('[data-section-head="section2"]') || document.querySelectorAll('.section-head')[1],
    galleryTitle: document.querySelector('[data-gallery-title]'),
    gallerySub: document.querySelector('[data-gallery-sub]'),
    cards: document.querySelectorAll('.grid-2 .card'),
    aboutStoryCard: document.querySelector('.about-story-card'),
    faqItems: document.querySelectorAll('.faq-item'),
    ctaTitle: document.querySelector('.cta-band h2'),
    ctaText: document.querySelector('.cta-band p'),
    ctaButtons: document.querySelectorAll('.cta-band .hero-actions a'),
    contactTitle: document.querySelector('.contact-card h2'),
    contactDetails: document.querySelectorAll('.contact-detail'),
    headerCta: document.querySelector('[data-header-cta]'),
    footerCopy: document.querySelector('[data-footer-copy]'),
    footerPrimaryLinks: document.querySelectorAll('.footer-primary-links a'),
    footerSecondaryLinks: document.querySelectorAll('.footer-secondary-links a'),
    footerCta: document.querySelector('[data-footer-cta]'),
    titleTag: document.querySelector('title'),
    metaDescription: document.querySelector('meta[name="description"]'),
    ogTitle: document.querySelector('meta[property="og:title"]'),
    ogDescription: document.querySelector('meta[property="og:description"]'),
    ogUrl: document.querySelector('meta[property="og:url"]'),
    canonicalLink: document.querySelector('link[rel="canonical"]'),
    langSwitch: document.getElementById('langSwitch'),
    langBtn: document.getElementById('langBtn'),
    langCurrent: document.getElementById('langCurrent'),
    langMenu: document.getElementById('langMenu'),
    langOptions: document.querySelectorAll('.lang-option'),
    primarySchema: document.querySelector('script[type="application/ld+json"]')
  };

  function setText(node, value){
    if(node && typeof value === 'string'){
      node.textContent = value;
    }
  }

  function setHTML(node, value){
    if(node && typeof value === 'string'){
      node.innerHTML = value;
    }
  }

  function setMeta(node, value){
    if(node && value){
      node.setAttribute('content', value);
    }
  }

  function setBurgerLabel(lang){
    if(refs.burger){
      refs.burger.setAttribute('aria-label', menuLabels[lang] || menuLabels[DEFAULT_LANG]);
    }
  }

  function closeMobileNavigation(){
    if(refs.mobileNav){
      refs.mobileNav.classList.remove('open');
    }
    if(refs.burger){
      refs.burger.classList.remove('active');
      refs.burger.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleMobileNavigation(){
    if(!refs.mobileNav || !refs.burger){
      return;
    }
    refs.mobileNav.classList.toggle('open');
    refs.burger.classList.toggle('active');
    refs.burger.setAttribute('aria-expanded', refs.mobileNav.classList.contains('open') ? 'true' : 'false');
  }

  function localizeHref(href, lang){
    if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')){
      return href;
    }

    const [pathAndQuery, hashFragment] = href.split('#', 2);
    const [pathName, queryString] = pathAndQuery.split('?', 2);
    const normalizedPath = normalizeHtmlPath(pathName);

    if(pathName === '/' || isHomeFile(normalizedPath)){
      const localizedPath = buildLocalizedHref('index.html', lang);
      const queryPart = queryString ? `?${queryString}` : '';
      const hashPart = hashFragment ? `#${hashFragment}` : '';
      return `${localizedPath}${queryPart}${hashPart}`;
    }

    if(!/\.html$/i.test(pathName)){
      return href;
    }

    const localizedPath = buildLocalizedHref(pathName, lang);
    const queryPart = queryString ? `?${queryString}` : '';
    const hashPart = hashFragment ? `#${hashFragment}` : '';
    return `${localizedPath}${queryPart}${hashPart}`;
  }

  function updateInternalLinks(lang){
    document.querySelectorAll('a[href]').forEach((link) => {
      if(link.classList.contains('lang-option')){
        return;
      }
      const href = link.getAttribute('href');
      const localizedHref = localizeHref(href, lang);
      if(localizedHref !== href){
        link.setAttribute('href', localizedHref);
      }
    });
  }

  function ensureAlternateLink(lang, href){
    let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
    if(!link){
      link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  function updateCanonicalAndAlternates(lang){
    const currentUrl = buildAbsoluteUrlForLanguage(baseFileName, lang);

    if(refs.canonicalLink){
      refs.canonicalLink.setAttribute('href', currentUrl);
    }
    setMeta(refs.ogUrl, currentUrl);

    ensureAlternateLink('de', buildAbsoluteUrlForLanguage(baseFileName, 'de'));
    ensureAlternateLink('en', buildAbsoluteUrlForLanguage(baseFileName, 'en'));
    ensureAlternateLink('bs', buildAbsoluteUrlForLanguage(baseFileName, 'bs'));
    ensureAlternateLink('x-default', buildAbsoluteUrlForLanguage(baseFileName, 'de'));
  }

  function setJsonLdScript(key, payload){
    let script = document.querySelector(`script[data-schema-key="${key}"]`);
    if(!script){
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.schemaKey = key;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
  }

  function updateStructuredData(lang, pageStrings, commonStrings){
    const currentUrl = buildAbsoluteUrlForLanguage(baseFileName, lang);
    const businessSchema = {
      '@context': 'https://schema.org',
      '@type': pageKey === 'about' ? 'Person' : 'Service',
      ...(pageKey === 'about'
        ? {
            name: 'Emina',
            jobTitle: lang === 'en' ? 'Photographer' : lang === 'bs' ? 'Fotografkinja' : 'Fotografin',
            image: 'https://liza-memories-photography.com/about.webp',
            url: currentUrl,
              worksFor: {
                '@type': 'ProfessionalService',
                name: 'LiZa Memories Photography',
                url: SITE_ORIGIN,
                hasMap: BUSINESS_MAP_URL,
                openingHoursSpecification: BUSINESS_OPENING_HOURS
              },
              description: pageStrings.metaDescription
            }
        : {
            name: pageStrings.metaTitle.split('|')[0].trim(),
              provider: {
                '@type': 'ProfessionalService',
                name: 'LiZa Memories Photography',
                url: SITE_ORIGIN,
                hasMap: BUSINESS_MAP_URL,
                openingHoursSpecification: BUSINESS_OPENING_HOURS
              },
            areaServed: 'Graz',
            serviceType: pageStrings.breadcrumbCurrent,
            url: currentUrl,
            description: pageStrings.metaDescription
          })
    };

    if(refs.primarySchema){
      refs.primarySchema.dataset.schemaKey = 'primary';
      refs.primarySchema.textContent = JSON.stringify(businessSchema);
    }

    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: commonStrings.breadcrumbs.home,
        item: buildAbsoluteUrlForLanguage('index.html', lang)
      }
    ];

    if(pageKey !== 'about'){
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: commonStrings.breadcrumbs.services,
        item: `${buildAbsoluteUrlForLanguage('index.html', lang)}#services`
      });
    }

    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: pageStrings.breadcrumbCurrent,
      item: currentUrl
    });

    setJsonLdScript('breadcrumbs', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    });

    const faqItems = (pageStrings.section2 && pageStrings.section2.faqs ? pageStrings.section2.faqs : [])
      .filter((faq) => faq && faq.q && faq.a)
      .map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a
        }
      }));

    if(faqItems.length){
      setJsonLdScript('faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems
      });
    }
  }

  function updateLegalLinks(lang){
    if(refs.footerSecondaryLinks.length < 4){
      return;
    }

    const imprintLink = refs.footerSecondaryLinks[1];
    const privacyLink = refs.footerSecondaryLinks[2];
    const termsLink = refs.footerSecondaryLinks[3];

    imprintLink.href = buildLocalizedFileName('impressum.html', lang);
    privacyLink.href = buildLocalizedFileName('datenschutz.html', lang);
    termsLink.href = buildLocalizedFileName('agb.html', lang);
  }

  function applyLanguage(lang){
    const pageStrings = pages[pageKey][lang] || pages[pageKey][DEFAULT_LANG];
    const commonStrings = common[lang] || common[DEFAULT_LANG];

    document.documentElement.lang = lang;

    if(refs.titleTag){
      refs.titleTag.textContent = pageStrings.metaTitle;
    }
    setMeta(refs.metaDescription, pageStrings.metaDescription);
    setMeta(refs.ogTitle, pageStrings.ogTitle);
    setMeta(refs.ogDescription, pageStrings.ogDescription);
    updateCanonicalAndAlternates(lang);

    if(refs.breadcrumbs){
      refs.breadcrumbs.setAttribute('aria-label', commonStrings.breadcrumbs.aria);
    }

    setText(refs.navLinks[0], commonStrings.nav.home);
    setText(refs.navLinks[1], commonStrings.nav.about);
    setText(refs.navLinks[2], commonStrings.nav.services);
    setText(refs.navLinks[3], commonStrings.nav.portfolio);
    setText(refs.navLinks[4], commonStrings.nav.pricing);
    setText(refs.navLinks[5], commonStrings.nav.faq);
    setText(refs.navLinks[6], commonStrings.nav.contact);

    refs.servicesMenuLinks.forEach((link) => {
      setText(link, commonStrings.services[link.dataset.serviceKey] || '');
    });

    refs.mobileServiceLinks.forEach((link) => {
      setText(link, commonStrings.services[link.dataset.serviceKey] || '');
    });

    if(refs.portfolioMenuLinks.length >= 4){
      setText(refs.portfolioMenuLinks[0], commonStrings.nav.gallery1);
      setText(refs.portfolioMenuLinks[1], commonStrings.nav.gallery2);
      setText(refs.portfolioMenuLinks[2], commonStrings.nav.gallery3);
      setText(refs.portfolioMenuLinks[3], commonStrings.nav.gallery4);
    }

    if(refs.mobilePortfolioLinks.length >= 4){
      setText(refs.mobilePortfolioLinks[0], commonStrings.nav.gallery1);
      setText(refs.mobilePortfolioLinks[1], commonStrings.nav.gallery2);
      setText(refs.mobilePortfolioLinks[2], commonStrings.nav.gallery3);
      setText(refs.mobilePortfolioLinks[3], commonStrings.nav.gallery4);
    }

    setText(refs.breadcrumbLinks[0], commonStrings.breadcrumbs.home);
    setText(refs.breadcrumbLinks[1], commonStrings.breadcrumbs.services);
    setText(refs.breadcrumbCurrent, pageStrings.breadcrumbCurrent);

    setText(refs.heroEyebrow, pageStrings.hero.eyebrow);
    setText(refs.heroTitle, pageStrings.hero.title);
    setText(refs.heroLead, pageStrings.hero.lead);
    setText(refs.heroButtons[0], pageStrings.hero.primary);
    setText(refs.heroButtons[1], pageStrings.hero.secondary);
    if(refs.heroButtons[0]){
      refs.heroButtons[0].setAttribute('href', 'index.html#contact-form-card');
    }
    if(refs.heroButtons[1]){
      refs.heroButtons[1].setAttribute('href', 'index.html#portfolio');
    }
    if(refs.heroImage){
      refs.heroImage.alt = pageStrings.hero.imageAlt;
    }

    pageStrings.hero.points.forEach((point, index) => {
      const card = refs.heroPoints[index];
      if(!card){
        return;
      }
      setText(card.querySelector('strong'), point.label);
      setText(card.querySelector('span'), point.value);
    });

    const firstHead = refs.section1Head;
    const secondHead = refs.section2Head;

    if(firstHead){
      setText(firstHead.querySelector('h2'), pageStrings.section1.title);
      setText(firstHead.querySelector('p'), pageStrings.section1.sub);
    }

    if(secondHead){
      setText(secondHead.querySelector('h2'), pageStrings.section2.title);
      setText(secondHead.querySelector('p'), pageStrings.section2.sub);
    }

    if(refs.galleryTitle && pageStrings.gallery){
      setText(refs.galleryTitle, pageStrings.gallery.title);
    }

    if(refs.gallerySub && pageStrings.gallery){
      setText(refs.gallerySub, pageStrings.gallery.sub);
    }

    const firstCard = refs.cards[0];
    const secondCard = refs.cards[1];

    if(firstCard){
      setText(firstCard.querySelector('h3'), pageStrings.section1.card1.title);
      const firstCardParagraph = firstCard.querySelector('.card-copy') || firstCard.querySelector('p');
      if(firstCardParagraph){
        if(pageStrings.section1.card1.html){
          setHTML(firstCardParagraph, pageStrings.section1.card1.html);
        }else if(pageStrings.section1.card1.text){
          setText(firstCardParagraph, pageStrings.section1.card1.text);
        }
      }
      const firstCardList = firstCard.querySelector('.list');
      const firstCardItems = firstCard.querySelectorAll('li');
      const card1Items = pageStrings.section1.card1.items || [];
      if(firstCardList){
        firstCardList.style.display = card1Items.length ? '' : 'none';
      }
      card1Items.forEach((item, index) => {
        setText(firstCardItems[index], item);
      });
    }

    if(secondCard){
      setText(secondCard.querySelector('h3'), pageStrings.section1.card2.title);
      const secondCardParagraph = secondCard.querySelector('p');
      if(secondCardParagraph && pageStrings.section1.card2.text){
        setText(secondCardParagraph, pageStrings.section1.card2.text);
      }
      const stepTexts = secondCard.querySelectorAll('.timeline .step div');
      (pageStrings.section1.card2.steps || []).forEach((item, index) => {
        setText(stepTexts[index], item);
      });
    }

    if(refs.aboutStoryCard){
      setText(refs.aboutStoryCard.querySelector('h3'), pageStrings.section1.card1.title);
      const aboutCopy = refs.aboutStoryCard.querySelector('.card-copy') || refs.aboutStoryCard.querySelector('p');
      if(aboutCopy){
        if(pageStrings.section1.card1.html){
          setHTML(aboutCopy, pageStrings.section1.card1.html);
        }else if(pageStrings.section1.card1.text){
          setText(aboutCopy, pageStrings.section1.card1.text);
        }
      }
    }

    refs.faqItems.forEach((item, index) => {
      const faq = pageStrings.section2.faqs[index];
      if(!faq){
        return;
      }
      setText(item.querySelector('h3'), faq.q);
      setText(item.querySelector('p'), faq.a);
    });

    setText(refs.ctaTitle, pageStrings.cta.title);
    setHTML(refs.ctaText, pageStrings.cta.text);
    if(refs.ctaText){
      const priceNode = Array.from(refs.ctaText.querySelectorAll('strong'))
        .find((node) => /\d+\s*(?:EUR|€)/i.test(node.textContent));
      if(priceNode){
        priceNode.setAttribute('data-promo-price', '');
      }
    }
    setText(refs.ctaButtons[0], pageStrings.cta.primary);
    setText(refs.ctaButtons[1], pageStrings.cta.secondary);
    if(refs.ctaButtons[0]){
      refs.ctaButtons[0].setAttribute('href', 'index.html#contact-form-card');
    }
    if(refs.ctaButtons[1] && priceAnchorByPage[pageKey]){
      refs.ctaButtons[1].setAttribute('href', `preise.html#${priceAnchorByPage[pageKey]}`);
    }

    setText(refs.contactTitle, pageStrings.contact.title);

    if(refs.contactDetails.length >= 4){
      setText(refs.contactDetails[0].querySelector('strong'), commonStrings.contact.email);
      setText(refs.contactDetails[1].querySelector('strong'), commonStrings.contact.phone);
      setText(refs.contactDetails[2].querySelector('strong'), commonStrings.contact.location);
      setText(refs.contactDetails[3].querySelector('strong'), commonStrings.contact.more);
      setText(refs.contactDetails[2].querySelector('span'), commonStrings.contact.locationValue);
      setHTML(refs.contactDetails[3].querySelector('span'), pageStrings.contact.moreServices);
    }

    setText(refs.footerPrimaryLinks[0], commonStrings.footer.portfolio);
    refs.footerPrimaryLinks.forEach((link, index) => {
      if(index === 0){
        return;
      }
      setText(link, commonStrings.services[link.dataset.serviceKey] || '');
    });
    setText(refs.footerSecondaryLinks[0], commonStrings.footer.contact);
    setText(refs.footerSecondaryLinks[1], commonStrings.footer.imprint);
    setText(refs.footerSecondaryLinks[2], commonStrings.footer.privacy);
    setText(refs.footerSecondaryLinks[3], commonStrings.footer.terms);
    setText(refs.headerCta, commonStrings.footer.cta);
    setText(refs.footerCta, commonStrings.footer.cta);

    if(refs.footerCopy){
      refs.footerCopy.textContent = commonStrings.footer.copyright.replace('{year}', new Date().getFullYear());
    }
    updateLegalLinks(lang);
    updateInternalLinks(lang);
    if(refs.navLinks[4]){
      refs.navLinks[4].setAttribute('href', localizeHref('preise.html', lang));
    }
    updateStructuredData(lang, pageStrings, commonStrings);

    if(refs.langBtn){
      refs.langBtn.setAttribute('aria-label', commonStrings.languageLabel);
    }
    setBurgerLabel(lang);
    document.documentElement.lang = lang;
    setText(refs.langCurrent, lang.toUpperCase());
    refs.langOptions.forEach((option) => {
      option.classList.toggle('active', option.dataset.lang === lang);
    });
  }

  function syncLanguageUi(lang){
    const commonStrings = common[lang] || common[DEFAULT_LANG];
    document.documentElement.lang = lang;
    if(refs.langBtn){
      refs.langBtn.setAttribute('aria-label', commonStrings.languageLabel);
    }
    setBurgerLabel(lang);
    setText(refs.langCurrent, lang.toUpperCase());
    refs.langOptions.forEach((option) => {
      option.classList.toggle('active', option.dataset.lang === lang);
    });
  }

  function getInitialLanguage(){
    return supportedLangs.includes(urlLanguage) ? urlLanguage : DEFAULT_LANG;
  }

  function persistLanguage(lang){
    try{
      localStorage.setItem(LANGUAGE_KEY, lang);
    }catch(_error){}
  }

  pages.about = {
    de: {
      metaTitle: 'Über mich | LiZa Memories Photography',
      metaDescription: 'Lerne Emina von LiZa Memories Photography kennen. Natürliche, ruhige und hochwertige Babybauch-, Neugeborenen- und Familienfotografie in Graz.',
      ogTitle: 'Über mich | LiZa Memories Photography',
      ogDescription: 'Lerne die Fotografin hinter LiZa Memories Photography kennen und erfahre, wie ruhig, einfühlsam und persönlich die Shootings gestaltet sind.',
      breadcrumbCurrent: 'Über mich',
      hero: {
        eyebrow: 'Über mich',
        title: 'Ehrliche Bilder für besondere Erinnerungen.',
        lead: 'Ich bin Emina, die Fotografin hinter LiZa Memories Photography. Mein Herz schlägt für natürliche Babybauch-, Neugeborenen- und Familienfotografie, bei der ihr euch wohlfühlen dürft und Bilder entstehen, die auch Jahre später noch berühren.',
        primary: 'Jetzt anfragen',
        secondary: 'Portfolio ansehen',
        points: [
          { label: 'Stil', value: 'Ruhig, liebevoll und authentisch' },
          { label: 'Fokus', value: 'Babybauch, Neugeborene und Familie' },
          { label: 'Antwort', value: 'Rückmeldung innerhalb von 24h' }
        ],
        imageAlt: 'Fotografin Emina von LiZa Memories Photography'
      },
      section1: {
        title: 'Was euch bei mir wichtig sein darf',
        sub: 'Ohne Druck, ohne starre Posen, dafür mit viel Gefühl für den Moment.',
        card1: {
          title: 'Hallo, ich bin Emina',
          html: 'Ich gehe meiner Leidenschaft für Fotografie und vielen anderen kreativen Bereichen schon mein ganzes Leben lang nach. Irgendwann war für mich klar, dass ich diesen Weg auch professionell gehen möchte und all das, was ich in den letzten Jahren lernen und erleben durfte, in meine Arbeit einfließen lasse.<br><br>Heute liegt mein Fokus auf liebevoller Babybauch-, Neugeborenen- und Familienfotografie. Ich möchte Bilder schaffen, die nicht gestellt wirken, sondern euch so zeigen, wie ihr seid.<br><br>Aus eigener Erfahrung weiß ich, wie schnell sich besondere Lebensphasen verändern und wie wertvoll es ist, diese Zeit festzuhalten. Genau deshalb ist es mir so wichtig, euch in einer ruhigen und entspannten Atmosphäre zu begleiten.<br><br>Bei jedem Shooting nehme ich mir Zeit, gehe einfühlsam auf euch ein und schaffe Raum dafür, dass ihr euch wohlfühlen dürft. Genau so entstehen ehrliche Bilder, die sich auch Jahre später noch gut anfühlen.'
        },
        card2: {
          title: 'So arbeite ich',
          steps: [
            'Wir besprechen in Ruhe, welches Shooting zu euch und eurer Situation passt.',
            'Beim Shooting leite ich euch einfühlsam an, ohne dass es gestellt wirkt.',
            'So entstehen natürliche Bilder mit echten Emotionen und zeitloser Wirkung.'
          ]
        }
      },
      section2: {
        title: 'Häufige Fragen zu mir und meiner Arbeit',
        sub: 'Hier findet ihr die wichtigsten Antworten, wenn ihr mich und meine Arbeitsweise vor einer Anfrage besser kennenlernen möchtet.',
        faqs: [
          {
            q: 'Welche Shootings begleite ich?',
            a: 'Mein Schwerpunkt liegt auf Babybauch-, Neugeborenen- und Familienfotografie. Zusätzlich begleite ich auch standesamtliche Trauungen und kleine Feiern.'
          },
          {
            q: 'Wo finden Shootings statt?',
            a: 'Ich fotografiere euch in der Regel bei mir in Graz Strassgang. Wenn ihr euch eine andere Location wünscht, sind Homestorys, Outdoor-Shootings oder eure Wunschlocation nach Absprache gerne möglich.'
          }
        ]
      },
      cta: {
        title: 'Lernt mich und meine Fotografie persönlich kennen',
        text: 'Wenn ihr euch ruhige, natürliche und hochwertige Bilder wünscht, freue ich mich auf eure Nachricht. Gemeinsam schauen wir, welches Shooting am besten zu euch passt.',
        primary: 'Jetzt anfragen',
        secondary: 'Portfolio ansehen'
      },
      contact: {
        title: 'Direkter Kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Babybauch</a> · <a href="newborn-fotografie-graz.html">Neugeborene</a> · <a href="familienfotografie-graz.html">Familie</a>'
      }
    },
    en: {
      metaTitle: 'About me | LiZa Memories Photography',
      metaDescription: 'Meet Emina from LiZa Memories Photography. Natural, calm and high-quality photography for maternity, newborn and family sessions in Graz.',
      ogTitle: 'About me | LiZa Memories Photography',
      ogDescription: 'Get to know the photographer behind LiZa Memories Photography and the calm, heartfelt approach behind every session.',
      breadcrumbCurrent: 'About me',
      hero: {
        eyebrow: 'About me',
        title: 'Honest images for special memories.',
        lead: 'I am Emina, the photographer behind LiZa Memories Photography. My heart is in maternity, newborn and family photography that feels natural, personal and timeless, with images that still move you years later.',
        primary: 'Inquire now',
        secondary: 'View portfolio',
        points: [
          { label: 'Style', value: 'Calm, loving and authentic' },
          { label: 'Focus', value: 'Maternity, newborn and family' },
          { label: 'Reply', value: 'Response within 24 hours' }
        ],
        imageAlt: 'Photographer Emina from LiZa Memories Photography'
      },
      section1: {
        title: 'What you can expect from me',
        sub: 'No pressure, no stiff poses, just a lot of feeling for the moment.',
        card1: {
          title: 'Hi, I\'m Emina',
          html: 'I have been passionate about photography and many other creative fields for as long as I can remember. At some point, it became clear to me that I wanted to follow this path professionally too and let everything I have learned and experienced over the past years flow into my work.<br><br>Today, my focus is on heartfelt maternity, newborn and family photography. I want to create images that do not feel staged, but show you exactly as you are.<br><br>From my own experience, I know how quickly special stages of life change and how valuable it is to hold on to them. That is exactly why it matters so much to me to accompany you in a calm and relaxed atmosphere.<br><br>In every session I take my time, respond to you with sensitivity and create space for you to feel comfortable. That is how honest images are created, images that still feel right years later.'
        },
        card2: {
          title: 'How I work',
          steps: [
            'We talk through which session fits you and your current season best.',
            'During the shoot I guide you gently, without making anything feel stiff.',
            'That is how natural images with real emotion and timeless beauty are created.'
          ]
        }
      },
      section2: {
        title: 'Frequently asked questions about me and my work',
        sub: 'Here are the key answers if you would like to get to know me and my way of working a little better before inquiring.',
        faqs: [
          {
            q: 'Which sessions do I offer?',
            a: 'My focus is on maternity, newborn and family photography. I also photograph civil ceremonies and small celebrations.'
          },
          {
            q: 'Where do sessions take place?',
            a: 'Most sessions take place with me in Graz Strassgang. If you would prefer a different setting, in-home sessions, outdoor sessions or your preferred location are all possible by arrangement.'
          }
        ]
      },
      cta: {
        title: 'Get to know me and my photography personally',
        text: 'If you are looking for calm, natural and high-quality images, I would love to hear from you. Together we can decide which session fits you best.',
        primary: 'Inquire now',
        secondary: 'View portfolio'
      },
      contact: {
        title: 'Direct contact',
        moreServices: '<a href="babybauch-shooting-graz.html">Maternity</a> · <a href="newborn-fotografie-graz.html">Newborn</a> · <a href="familienfotografie-graz.html">Family</a>'
      }
    },
    bs: {
      metaTitle: 'O meni | LiZa Memories Photography',
      metaDescription: 'Upoznajte Eminu iz LiZa Memories Photography. Prirodno, mirno i kvalitetno fotografisanje za trudnice, novorođenčad i porodice u Grazu.',
      ogTitle: 'O meni | LiZa Memories Photography',
      ogDescription: 'Upoznajte fotografkinju koja stoji iza LiZa Memories Photography i njen miran, pažljiv pristup svakom fotografisanju.',
      breadcrumbCurrent: 'O meni',
      hero: {
        eyebrow: 'O meni',
        title: 'Prirodne fotografije za posebne uspomene.',
        lead: 'Ja sam Emina, osnivačica LiZa Memories Photography. Posvetila sam se trudničkom fotografisanju, fotografisanju novorođenčadi i porodičnom fotografisanju koje djeluje prirodno, autentično i nenametljivo, uz fotografije koje vas dirnu i godinama kasnije.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj portfolio',
        points: [
          { label: 'Stil', value: 'Mirno, nježno i autentično' },
          { label: 'Fokus', value: 'Trudničko, novorođenčad i porodica' },
          { label: 'Odgovor', value: 'Povratna informacija u roku od 24h' }
        ],
        imageAlt: 'Fotografkinja Emina iz LiZa Memories Photography'
      },
      section1: {
        title: 'Šta možete očekivati od mene',
        sub: 'Bez pritiska, bez namještenih poza, nego s puno osjećaja za trenutak.',
        card1: {
          title: 'Zdravo, ja sam Emina',
          html: 'Fotografiji i mnogim drugim kreativnim područjima posvećena sam cijeli život. Nakon mnogo promišljanja i oklijevanja, odlučila sam da se ovom poslu predam u potpunosti, da slijedim svoje snove i sve ono što sam posljednjih godina učila i doživjela unesem u svoj rad.<br><br>Specijalizirala sam se za nježno trudničko fotografisanje, fotografisanje novorođenčadi i porodično fotografisanje. Želim stvarati fotografije koje ne djeluju namješteno, nego vas prikazuju onakvima kakvi zaista jeste.<br><br>Iz vlastitog iskustva znam koliko se brzo posebne životne faze mijenjaju i koliko ih je dragocjeno sačuvati. Upravo zato mi je toliko važno da vas pratim u mirnoj i opuštenoj atmosferi i tako zabilježim te posebne trenutke.<br><br>Na svakom fotografisanju odvajam vrijeme za vas, pristupam vam s puno empatije i stvaram prostor da se osjećate ugodno. Upravo tako nastaju fotografije koje djeluju prirodno i iskreno, i koje će u vama i godinama kasnije buditi iste emocije.'
        },
        card2: {
          title: 'Kako radim',
          steps: [
            'Zajedno u miru pogledamo koje fotografisanje vam najviše odgovara.',
            'Tokom fotografisanja vodim vas nježno, tako da sve djeluje opušteno i prirodno.',
            'Tako nastaju prirodne fotografije sa stvarnim emocijama i nježnom estetikom.'
          ]
        }
      },
      section2: {
        title: 'Česta pitanja o meni i mom radu',
        sub: 'Ovdje ćete pronaći najvažnije odgovore ako prije upita želite bolje upoznati mene i moj način rada.',
        faqs: [
          {
            q: 'Koja fotografisanja nudim?',
            a: 'Moj fokus je na trudničkom fotografisanju, fotografisanju novorođenčadi i porodičnom fotografisanju. Pored toga fotografišem i vjenčanja te male proslave.'
          },
          {
            q: 'Gdje se održavaju fotografisanja?',
            a: 'Najčešće fotografišem kod mene u Grazu Strassgang. Ako želite drugu lokaciju, fotografisanje kod vas kući, u prirodi ili na vašoj željenoj lokaciji rado je moguće po dogovoru.'
          }
        ]
      },
      cta: {
        title: 'Upoznajte mene i moj stil fotografisanja',
        text: 'Ako želite mirne, prirodne i kvalitetne fotografije, radovat ću se vašoj poruci. Zajedno ćemo pogledati koje fotografisanje vam najbolje odgovara.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj portfolio'
      },
      contact: {
        title: 'Direktan kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Trudničko</a> · <a href="newborn-fotografie-graz.html">Novorođenčad</a> · <a href="familienfotografie-graz.html">Porodica</a>'
      }
    }
  };

  pages.portrait = {
    de: {
      metaTitle: 'Portraitfotografie in Graz | LiZa Memories Photography',
      metaDescription: 'Persönliche Portraitfotografie in Graz mit entspannter Begleitung, natürlichen Posen und liebevoll bearbeiteten Bildern.',
      ogTitle: 'Portraitfotografie in Graz | LiZa Memories Photography',
      ogDescription: 'Natürliche Portraits in Graz mit ruhiger Anleitung und einem Ergebnis, das sich nach dir anfühlt.',
      breadcrumbCurrent: 'Portraitfotografie Graz',
      hero: {
        eyebrow: 'Portraitfotografie',
        title: 'Persönliche Portraits, die sich natürlich anfühlen und dich wirklich zeigen.',
        lead: 'Ein Portraitshooting darf leicht und unkompliziert sein. Mit ruhiger Anleitung, passenden Bildvarianten und einem Blick für kleine Details entstehen Bilder, auf denen du dich wiedererkennst und gerne siehst.',
        primary: 'Portraitshooting anfragen',
        secondary: 'Portfolio ansehen',
        points: [
          { label: 'Dauer', value: 'Je nach Paket etwa 20 bis 30 Minuten' },
          { label: 'Looks', value: 'Ein bis zwei Outfits und unterschiedliche Bildvarianten möglich' },
          { label: 'Bildlieferung', value: 'Meist innerhalb von 72 Stunden für dich verfügbar' }
        ],
        imageAlt: 'Natürliches Portrait von Emina in warmer Umgebung'
      },
      section1: {
        title: 'Was dein Portraitshooting besonders macht',
        sub: 'Klare Vorbereitung, entspannte Anleitung und genug Raum für Bilder, die zu dir passen.',
        card1: {
          title: 'Natürlich und persönlich',
          text: 'Du musst weder Erfahrung vor der Kamera haben noch wissen, wie du posieren sollst. Ich begleite dich ruhig durch das Shooting und achte darauf, dass Haltung, Ausdruck und Bildwirkung stimmig bleiben.',
          items: [
            'Sanfte Anleitung statt starrer oder überladener Posen.',
            'Je nach Paket sind unterschiedliche Outfits und Bildlooks möglich.',
            'Eine sorgfältige Auswahl und professionelle Bearbeitung deiner Lieblingsbilder.'
          ]
        },
        card2: {
          title: 'Entspannter Ablauf',
          steps: [
            'Kurze Anfrage mit deinem Wunschdatum und dem Anlass für die Portraits.',
            'Gemeinsame Abstimmung zu Kleidung, Hintergrund und wichtigen Details.',
            'Ruhiges Shooting mit verständlicher Anleitung und schneller Bildbearbeitung.'
          ]
        }
      },
      section2: {
        title: 'Häufige Fragen zum Portraitshooting',
        sub: 'Die wichtigsten Antworten, damit du dich von Anfang an gut vorbereitet fühlst.',
        faqs: [
          {
            q: 'Muss ich Erfahrung vor der Kamera haben?',
            a: 'Nein. Ich zeige dir während des Shootings Schritt für Schritt, welche Haltung und welcher Blick gut funktionieren. So musst du dir vorher keine Gedanken über Posen machen.'
          },
          {
            q: 'Was soll ich zum Portraitshooting mitbringen?',
            a: 'Bring am besten ein bis zwei Outfits mit, in denen du dich wohlfühlst. Ruhige Farben und Kleidung ohne große Logos wirken besonders harmonisch. Gemeinsam wählen wir aus, was zum gewünschten Bildlook passt.'
          }
        ]
      },
      gallery: {
        title: 'Portrait',
        sub: 'Natürliche Portraitfotografie mit ruhiger Bildsprache und persönlicher Ausstrahlung.'
      },
      cta: {
        title: 'Portraitshooting in Graz anfragen',
        text: 'Das Paket <strong>Kleine Erinnerung</strong> startet bei <strong>99 EUR</strong> und beinhaltet 20 Minuten Shooting, 3 bearbeitete Bilder, 1 Outfit und 1 Bildlook.',
        primary: 'Jetzt anfragen',
        secondary: 'Pakete ansehen'
      },
      contact: {
        title: 'Direkter Kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Babybauch</a> · <a href="newborn-fotografie-graz.html">Neugeborene</a> · <a href="familienfotografie-graz.html">Familie</a>'
      }
    },
    en: {
      metaTitle: 'Portrait Photography Graz | LiZa Memories Photography',
      metaDescription: 'Personal portrait photography in Graz with calm guidance, natural posing and professionally edited images.',
      ogTitle: 'Portrait Photography Graz | LiZa Memories Photography',
      ogDescription: 'Natural portraits in Graz with gentle direction and images that genuinely feel like you.',
      breadcrumbCurrent: 'Portrait Photography Graz',
      hero: {
        eyebrow: 'Portrait Photography',
        title: 'Personal portraits that feel natural and genuinely show who you are.',
        lead: 'A portrait session can feel light and uncomplicated. With calm guidance, carefully chosen image variations and attention to small details, we create portraits in which you recognize and truly like yourself.',
        primary: 'Inquire about a portrait session',
        secondary: 'View portfolio',
        points: [
          { label: 'Duration', value: 'Around 20 to 30 minutes depending on the package' },
          { label: 'Looks', value: 'One or two outfits and different image variations are possible' },
          { label: 'Image delivery', value: 'Usually available within 72 hours' }
        ],
        imageAlt: 'Natural portrait of Emina in a warm setting'
      },
      section1: {
        title: 'What makes your portrait session special',
        sub: 'Clear preparation, relaxed direction and enough room for images that feel right for you.',
        card1: {
          title: 'Natural and personal',
          text: 'You do not need camera experience or a list of poses. I guide you calmly throughout the session and make sure your posture, expression and overall image feel harmonious.',
          items: [
            'Gentle direction instead of stiff or overly complicated posing.',
            'Different outfits and image looks are possible depending on the package.',
            'A careful selection and professional edit of your favorite portraits.'
          ]
        },
        card2: {
          title: 'Relaxed process',
          steps: [
            'A short inquiry with your preferred date and the reason for your portraits.',
            'Personal planning for clothing, background and important details.',
            'A calm session with clear direction and fast image editing.'
          ]
        }
      },
      section2: {
        title: 'Frequently asked questions about portrait sessions',
        sub: 'The key answers to help you feel prepared and comfortable from the start.',
        faqs: [
          {
            q: 'Do I need experience in front of the camera?',
            a: 'No. During the session, I show you step by step which posture and expression work well. You do not need to prepare any poses beforehand.'
          },
          {
            q: 'What should I bring to my portrait session?',
            a: 'Bring one or two outfits in which you feel comfortable. Calm colors and clothing without large logos look especially harmonious. Together we choose what best suits the desired image style.'
          }
        ]
      },
      gallery: {
        title: 'Portrait',
        sub: 'Natural portrait photography with a calm visual style and personal expression.'
      },
      cta: {
        title: 'Inquire about a portrait session in Graz',
        text: 'The <strong>Small Memory</strong> package starts at <strong>99 EUR</strong> and includes a 20-minute session, 3 edited images, 1 outfit and 1 image look.',
        primary: 'Inquire now',
        secondary: 'View packages'
      },
      contact: {
        title: 'Direct contact',
        moreServices: '<a href="babybauch-shooting-graz.html">Maternity</a> · <a href="newborn-fotografie-graz.html">Newborn</a> · <a href="familienfotografie-graz.html">Family</a>'
      }
    },
    bs: {
      metaTitle: 'Portretno fotografisanje Graz | LiZa Memories Photography',
      metaDescription: 'Lično portretno fotografisanje u Grazu uz mirno vođenje, prirodne poze i profesionalno obrađene fotografije.',
      ogTitle: 'Portretno fotografisanje Graz | LiZa Memories Photography',
      ogDescription: 'Prirodni portreti u Grazu uz nježno vođenje i fotografije na kojima se prepoznajete.',
      breadcrumbCurrent: 'Portretno fotografisanje Graz',
      hero: {
        eyebrow: 'Portretno fotografisanje',
        title: 'Lični portreti koji djeluju prirodno i zaista pokazuju vas.',
        lead: 'Portretno fotografisanje može biti lagano i jednostavno. Uz mirno vođenje, pažljivo odabrane varijante fotografija i osjećaj za male detalje nastaju portreti na kojima se prepoznajete i rado gledate.',
        primary: 'Pošalji upit za portret',
        secondary: 'Pogledaj portfolio',
        points: [
          { label: 'Trajanje', value: 'Oko 20 do 30 minuta, zavisno od paketa' },
          { label: 'Izgledi', value: 'Mogući su jedan ili dva outfita i različite varijante fotografija' },
          { label: 'Isporuka fotografija', value: 'Najčešće dostupno u roku od 72 sata' }
        ],
        imageAlt: 'Prirodan portret Emine u toplom ambijentu'
      },
      section1: {
        title: 'Šta vaše portretno fotografisanje čini posebnim',
        sub: 'Jasna priprema, opušteno vođenje i dovoljno prostora za fotografije koje vam odgovaraju.',
        card1: {
          title: 'Prirodno i lično',
          text: 'Nije vam potrebno iskustvo pred kamerom niti morate znati kako pozirati. Mirno vas vodim kroz fotografisanje i pazim da držanje, izraz i cjelokupan izgled fotografije budu skladni.',
          items: [
            'Nježno vođenje umjesto krutih ili prenaglašenih poza.',
            'Zavisno od paketa mogući su različiti outfiti i izgledi fotografija.',
            'Pažljiv izbor i profesionalna obrada vaših omiljenih portreta.'
          ]
        },
        card2: {
          title: 'Opušten tok',
          steps: [
            'Kratak upit sa željenim datumom i razlogom za portrete.',
            'Lični dogovor o odjeći, pozadini i važnim detaljima.',
            'Mirno fotografisanje uz jasno vođenje i brzu obradu fotografija.'
          ]
        }
      },
      section2: {
        title: 'Česta pitanja o portretnom fotografisanju',
        sub: 'Najvažniji odgovori kako biste se od početka osjećali dobro pripremljeno.',
        faqs: [
          {
            q: 'Da li mi je potrebno iskustvo pred kamerom?',
            a: 'Ne. Tokom fotografisanja pokazujem vam korak po korak koje držanje i izraz dobro funkcionišu. Ne morate unaprijed razmišljati o pozama.'
          },
          {
            q: 'Šta trebam ponijeti na portretno fotografisanje?',
            a: 'Ponesite jedan ili dva outfita u kojima se osjećate ugodno. Mirne boje i odjeća bez velikih logotipa djeluju posebno skladno. Zajedno biramo ono što najbolje odgovara željenom izgledu fotografija.'
          }
        ]
      },
      gallery: {
        title: 'Portret',
        sub: 'Prirodno portretno fotografisanje sa mirnim vizuelnim stilom i ličnim izrazom.'
      },
      cta: {
        title: 'Upit za portretno fotografisanje u Grazu',
        text: 'Paket <strong>Mala uspomena</strong> počinje od <strong>99 EUR</strong> i uključuje 20 minuta fotografisanja, 3 obrađene fotografije, 1 outfit i 1 izgled fotografije.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj pakete'
      },
      contact: {
        title: 'Direktan kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Trudničko</a> · <a href="newborn-fotografie-graz.html">Novorođenčad</a> · <a href="familienfotografie-graz.html">Porodica</a>'
      }
    }
  };

  pages.babybauch = {
    de: {
      metaTitle: 'Babybauch Shooting in Graz | LiZa Memories Photography',
      metaDescription: 'Babybauch Shooting in Graz mit natürlicher, eleganter Bildsprache. Emotionale Erinnerungen, entspannte Begleitung und liebevoll bearbeitete Bilder.',
      ogTitle: 'Babybauch Shooting in Graz | LiZa Memories Photography',
      ogDescription: 'Emotionale Babybauchfotografie in Graz mit ruhiger Begleitung und zeitlosen Bildern.',
      breadcrumbCurrent: 'Babybauch Shooting Graz',
      hero: {
        eyebrow: 'Babybauch Shooting',
        title: 'Elegante Babybauchfotografie mit echter Emotion und ruhiger Begleitung.',
        lead: 'Wenn ihr euch ein Babybauch Shooting in Graz wünscht, das sich nicht gestellt anfühlt, sondern leicht, hochwertig und emotional wirkt, seid ihr bei LiZa Memories Photography genau richtig. Der Fokus liegt auf natürlichen Momenten, feinen Details und Bildern, die auch Jahre später noch berühren.',
        primary: 'Jetzt anfragen',
        secondary: 'Portfolio ansehen',
        points: [
          { label: 'Ort', value: 'Bei mir in Graz Strassgang oder nach Absprache an eurer Wunschlocation' },
          { label: 'Beste Zeit', value: 'Am schönsten zwischen der 28. und 34. Schwangerschaftswoche' },
          { label: 'Bildlieferung', value: 'Meist innerhalb von 72 Stunden für euch verfügbar' }
        ],
        imageAlt: 'Babybauch Shooting in Graz mit elegantem Portrait'
      },
      section1: {
        title: 'Was dieses Babybauch Shooting besonders macht',
        sub: 'Hier findet ihr alle wichtigen Infos zu Stil, Ablauf und den liebevollen Momenten, die diese Bilder so besonders machen.',
        card1: {
          title: 'Sanfte Bildsprache',
          text: 'Die Bildsprache bleibt weich, elegant und natürlich. Ziel sind keine harten Posen, sondern feminine, echte und zeitlose Aufnahmen.',
          items: [
            'Partner und Geschwister können auf Wunsch dabei sein.',
            'Mehrere Outfits sind möglich, damit verschiedene Looks entstehen.',
            'Genug Zeit für kleine Pausen und entspannte Outfit-Wechsel.'
          ]
        },
        card2: {
          title: 'Entspannter Ablauf',
          steps: [
            'Kurze Anfrage mit eurem Wunschdatum.',
'Persönliche Abstimmung zu Kleidung und weiteren Details.',
'Ruhiges Shooting mit viel Feingefühl und schneller Bildbearbeitung.'
          ]
        }
      },
      section2: {
        title: 'Häufige Fragen zum Babybauch Shooting',
        sub: 'Die wichtigsten Antworten auf einen Blick - kompakt, klar und ohne Umwege.',
        faqs: [
          {
            q: 'Wann ist der beste Zeitpunkt?',
            a: 'Am schönsten ist ein Babybauch Shooting meist zwischen der 28. und 34. Schwangerschaftswoche, wenn der Bauch bereits gut sichtbar ist und du dich in der Regel noch wohl fühlst.'
          },
          {
            q: 'Können Partner und Kinder dabei sein?',
            a: 'Ja, sehr gerne. Gerade diese gemeinsamen Momente machen die Bilder oft noch emotionaler und persönlicher.'
          }
        ]
      },
      gallery: {
        title: 'Galerie',
        sub: 'Eine Auswahl an Babybauchbildern mit ruhiger Bildsprache, feinen Details und echter Vorfreude.'
      },
      cta: {
        title: 'Babybauch Shooting in Graz anfragen',
        text: 'Das Paket <strong>Mama & Bauch</strong> startet bei <strong>179 EUR</strong> und beinhaltet 30 Minuten Shooting, 5 bearbeitete Bilder und 1 Outfit beziehungsweise Bildset.',
        primary: 'Jetzt anfragen',
        secondary: 'Zu den Preisen'
      },
      contact: {
        title: 'Direkter Kontakt',
        moreServices: '<a href="newborn-fotografie-graz.html">Neugeborene</a> · <a href="familienfotografie-graz.html">Familie</a> · <a href="hochzeitsfotograf-graz.html">Hochzeit</a>'
      },
      footer: {
        links: ['Startseite', 'Neugeborene', 'Familie', 'Impressum', 'Datenschutz']
      }
    },
    en: {
      metaTitle: 'Maternity Photography Graz | LiZa Memories Photography',
      metaDescription: 'Maternity photography in Graz with an elegant and natural visual style. Emotional memories, calm guidance and lovingly edited images.',
      ogTitle: 'Maternity Photography Graz | LiZa Memories Photography',
      ogDescription: 'Emotional maternity photography in Graz with calm guidance and timeless imagery.',
      breadcrumbCurrent: 'Maternity Photography Graz',
      hero: {
        eyebrow: 'Maternity Photography Graz',
        title: 'Elegant maternity photography with real emotion and calm guidance.',
        lead: 'If you are looking for a maternity session in Graz that feels natural, refined and emotional instead of staged, you are in the right place with LiZa Memories Photography. The focus is on genuine moments, fine details and images that still move you years later.',
        primary: 'Inquire now',
        secondary: 'View portfolio',
        points: [
          { label: 'Location', value: 'At my studio space in Graz Strassgang or at your preferred location by arrangement' },
          { label: 'Best time', value: 'Ideally between weeks 28 and 34' },
          { label: 'Image delivery', value: 'Usually available within 72 hours' }
        ],
        imageAlt: 'Maternity photography in Graz with an elegant portrait'
      },
      section1: {
        title: 'What makes this maternity session special',
        sub: 'Here you can see the key details about the style, the experience and the gentle moments that make these images feel so timeless.',
        card1: {
          title: 'Soft visual style',
          text: 'The imagery stays soft, elegant and natural. The goal is not stiff posing, but feminine, genuine and timeless portraits.',
          items: [
            'Partners and siblings are welcome if you want them included.',
            'Multiple outfits are possible for different looks and moods.',
            'There is enough time for short breaks and relaxed outfit changes.'
          ]
        },
        card2: {
          title: 'Relaxed process',
          steps: [
            'A short inquiry with your preferred date.',
            'Personal planning for outfits and other important details.',
            'A calm session with gentle guidance and fast image editing.'
          ]
        }
      },
      section2: {
        title: 'Frequently asked questions about maternity sessions',
        sub: 'The most important answers at a glance - clear, warm and easy to skim.',
        faqs: [
          {
            q: 'When is the best time?',
            a: 'A maternity session is usually most beautiful between weeks 28 and 34 of pregnancy, when the belly is clearly visible and you still feel comfortable.'
          },
          {
            q: 'Can my partner and children join?',
            a: 'Yes, absolutely. These shared moments often make the final gallery even more emotional and personal.'
          }
        ]
      },
      gallery: {
        title: 'Gallery',
        sub: 'A selection of maternity images with calm visual language, fine details and genuine anticipation.'
      },
      cta: {
        title: 'Inquire about a maternity session in Graz',
        text: 'The <strong>Mama & Bump</strong> package starts at <strong>179 EUR</strong> and includes a 30-minute session, 5 edited images and 1 outfit or image set.',
        primary: 'Inquire now',
        secondary: 'View pricing'
      },
      contact: {
        title: 'Direct contact',
        moreServices: '<a href="newborn-fotografie-graz.html">Newborn</a> · <a href="familienfotografie-graz.html">Family</a> · <a href="hochzeitsfotograf-graz.html">Wedding</a>'
      },
      footer: {
        links: ['Home', 'Newborn', 'Family', 'Imprint', 'Privacy']
      }
    },
    bs: {
      metaTitle: 'Trudničko fotografisanje Graz | LiZa Memories Photography',
      metaDescription: 'Trudničko fotografisanje u Grazu sa elegantnim i prirodnim stilom. Emotivne uspomene, mirno vođenje i pažljivo obrađene fotografije.',
      ogTitle: 'Trudničko fotografisanje Graz | LiZa Memories Photography',
      ogDescription: 'Emotivno trudničko fotografisanje u Grazu sa mirnim vođenjem i nježnim, elegantnim fotografijama.',
      breadcrumbCurrent: 'Trudničko fotografisanje Graz',
      hero: {
        eyebrow: 'Trudničko fotografisanje Graz',
        title: 'Elegantno trudničko fotografisanje u nježnom i prirodnom stilu.',
        lead: 'Ako želite trudničko fotografisanje u Grazu koje ne djeluje namješteno, nego nježno, kvalitetno i emotivno, LiZa Memories Photography je pravi izbor. Fokus je na prirodnim trenucima, finim detaljima i fotografijama koje će vas dirnuti i godinama kasnije.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj portfolio',
        points: [
          { label: 'Lokacija', value: 'Kod mene u Graz Strassgangu ili po dogovoru na vašoj željenoj lokaciji' },
          { label: 'Najbolje vrijeme', value: 'Najljepše između 28. i 34. sedmice' },
          { label: 'Isporuka fotografija', value: 'Najčešće dostupno u roku od 72 sata' }
        ],
        imageAlt: 'Trudničko fotografisanje u Grazu sa elegantnim portretom'
      },
      section1: {
        title: 'Šta ovo trudničko fotografisanje čini posebnim',
        sub: 'Ovdje ćete pronaći najvažnije informacije o stilu, toku fotografisanja i nježnim trenucima koji ove uspomene čine posebnim.',
        card1: {
          title: 'Nježan vizuelni stil',
          text: 'Vizuelni stil ostaje mekan, elegantan i prirodan. Cilj nisu krute poze, nego ženstvene, autentične i prirodne fotografije.',
          items: [
            'Partner i djeca mogu biti uključeni po želji.',
            'Moguće je više odjevnih kombinacija za različite izglede.',
            'Ima dovoljno vremena za kratke pauze i opuštene promjene outfita.'
          ]
        },
        card2: {
          title: 'Opušten tok',
          steps: [
            'Kratak upit sa željenim datumom.',
            'Lični dogovor o odjeći i ostalim važnim detaljima.',
            'Mirno fotografisanje uz puno empatije i brzu obradu fotografija.'
          ]
        }
      },
      section2: {
        title: 'Česta pitanja o trudničkom fotografisanju',
        sub: 'Najvažniji odgovori na jednom mjestu - kratko, jasno i pregledno.',
        faqs: [
          {
            q: 'Kada je najbolje vrijeme?',
            a: 'Trudničko fotografisanje je najljepše uglavnom između 28. i 34. sedmice trudnoće, kada je stomak već lijepo vidljiv, a vi se još uvijek osjećate ugodno.'
          },
          {
            q: 'Mogu li partner i djeca biti dio fotografisanja?',
            a: 'Da, naravno. Upravo ti zajednički trenuci često čine galeriju još emotivnijom i ličnijom.'
          }
        ]
      },
      gallery: {
        title: 'Galerija',
        sub: 'Izbor trudničkih fotografija sa mirnim vizuelnim stilom, finim detaljima i nježnom atmosferom iščekivanja.'
      },
      cta: {
        title: 'Upit za trudničko fotografisanje u Grazu',
        text: 'Paket <strong>Mama i trbuščić</strong> počinje od <strong>179 EUR</strong> i uključuje 30 minuta fotografisanja, 5 obrađenih fotografija i 1 outfit odnosno set.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj cijene'
      },
      contact: {
        title: 'Direktan kontakt',
        moreServices: '<a href="newborn-fotografie-graz.html">Novorođenčad</a> · <a href="familienfotografie-graz.html">Porodica</a> · <a href="hochzeitsfotograf-graz.html">Vjenčanje</a>'
      },
      footer: {
        links: ['Početna', 'Novorođenčad', 'Porodica', 'Impresum', 'Zaštita podataka']
      }
    }
  };

  pages.combo = {
    de: {
      metaTitle: 'Babybauch & Neugeborenen-Shooting Graz | LiZa Memories Photography',
      metaDescription: 'Babybauch- und Neugeborenen-Shooting in Graz als liebevolle Kombination mit zwei aufeinander abgestimmten Shootings und attraktivem Preisvorteil.',
      ogTitle: 'Babybauch & Neugeborenen-Kombi in Graz | LiZa Memories Photography',
      ogDescription: 'Zwei besondere Lebensphasen, eine vertraute Begleitung und eine einheitliche Bildsprache.',
      breadcrumbCurrent: 'Babybauch & Neugeborenen-Kombi',
      hero: {
        eyebrow: 'Babybauch & Neugeborenen-Kombi',
        title: 'Vom Babybauch bis zu den ersten Tagen mit eurem kleinen Wunder.',
        lead: 'Diese Kombination verbindet euer Babybauch-Shooting mit einem späteren Neugeborenen-Shooting. So entstehen zwei aufeinander abgestimmte Bildserien, die eure Vorfreude und die erste Zeit mit eurem Baby in einer einheitlichen, liebevollen Bildsprache erzählen.',
        primary: 'Kombi anfragen',
        secondary: 'Portfolio ansehen',
        points: [
          { label: '2 Shootings', value: 'Babybauch und Neugeborene gemeinsam geplant' },
          { label: 'Preisvorteil', value: 'Alle Kombi-Pakete sind günstiger als zwei vergleichbare Einzelbuchungen' },
          { label: 'Gemeinsamer Stil', value: 'Eine harmonische Bildsprache von der Schwangerschaft bis zum Baby' }
        ],
        imageAlt: 'Kombination aus Babybauch- und Neugeborenenfotografie in Graz'
      },
      section1: {
        title: 'Warum sich die gemeinsame Planung lohnt',
        sub: 'Zwei besondere Shootings, eine vertraute Begleitung und ein stimmiges Ergebnis von Anfang an.',
        card1: {
          title: 'Ein roter Faden',
          text: 'Beide Shootings werden gemeinsam geplant und fotografisch aufeinander abgestimmt. So müsst ihr euch nicht zweimal neu orientieren und bekommt Erinnerungen, die sichtbar zusammengehören.',
          items: [
            'Babybauch- und Neugeborenenbilder in einer harmonischen Bildsprache.',
            'Partner und Geschwister können je nach Paket eingebunden werden.',
            'Ein attraktiver Preisvorteil gegenüber vergleichbaren Einzelbuchungen.'
          ]
        },
        card2: {
          title: 'Entspannter Ablauf',
          steps: [
            'Das Babybauch-Shooting planen wir idealerweise zwischen der 28. und 34. Schwangerschaftswoche.',
            'Den Neugeborenen-Termin halten wir rund um den errechneten Geburtstermin flexibel.',
            'Beide Shootings finden ruhig, persönlich und mit schneller Bildbearbeitung statt.'
          ]
        }
      },
      section2: {
        title: 'Häufige Fragen zur Kombi',
        sub: 'Die wichtigsten Antworten für eine entspannte Planung beider Shootings.',
        faqs: [
          {
            q: 'Wann sollten wir die Kombination buchen?',
            a: 'Am besten meldet ihr euch schon während der Schwangerschaft. So können wir das Babybauch-Shooting rechtzeitig planen und rund um den errechneten Termin genug Flexibilität für das Neugeborenen-Shooting lassen.'
          },
          {
            q: 'Müssen beide Termine sofort feststehen?',
            a: 'Nein. Den Babybauch-Termin vereinbaren wir vorab. Der Termin für das Neugeborenen-Shooting wird flexibel an die tatsächliche Geburt angepasst.'
          },
          {
            q: 'Können Partner und Geschwister dabei sein?',
            a: 'Ja, sehr gern. Je nach Paket können Partner und Geschwister bei beiden Shootings integriert werden. Die genauen Leistungen findet ihr transparent in der Paketübersicht.'
          },
          {
            q: 'Wie groß ist der Preisvorteil?',
            a: 'Schon das kleinste Kombi-Paket ist 79 EUR günstiger als zwei vergleichbare Einzelbuchungen. Bei den größeren Paketen steigt zusätzlich die Anzahl der enthaltenen Bilder und Bildsets.'
          }
        ]
      },
      gallery: {
        title: 'Galerie',
        sub: 'Babybauch- und Neugeborenenbilder mit einer ruhigen, liebevollen und aufeinander abgestimmten Bildsprache.'
      },
      cta: {
        title: 'Babybauch & Neugeborenen-Kombi anfragen',
        text: 'Das Paket <strong>Zwei kleine Erinnerungen</strong> startet bei <strong>299 EUR</strong> und beinhaltet zwei Shootings mit je 5 bearbeiteten Bildern, je 1 Bildset und insgesamt 10 Bildern.',
        primary: 'Kombi anfragen',
        secondary: 'Pakete ansehen'
      },
      contact: {
        title: 'Direkter Kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Babybauch</a> · <a href="newborn-fotografie-graz.html">Neugeborene</a> · <a href="familienfotografie-graz.html">Familie</a>'
      }
    },
    en: {
      metaTitle: 'Maternity & Newborn Photography Graz | LiZa Memories Photography',
      metaDescription: 'A maternity and newborn photography bundle in Graz with two coordinated sessions, a consistent visual style and attractive package savings.',
      ogTitle: 'Maternity & Newborn Bundle Graz | LiZa Memories Photography',
      ogDescription: 'Two special life stages, one familiar photographer and a beautifully consistent visual story.',
      breadcrumbCurrent: 'Maternity & Newborn Bundle',
      hero: {
        eyebrow: 'Maternity & Newborn Bundle',
        title: 'From your growing belly to the first days with your little wonder.',
        lead: 'This bundle combines your maternity session with a later newborn session. The result is two coordinated image series that tell the story of your anticipation and your baby\'s first days in one gentle and consistent visual style.',
        primary: 'Inquire about the bundle',
        secondary: 'View portfolio',
        points: [
          { label: '2 sessions', value: 'Maternity and newborn photography planned together' },
          { label: 'Package savings', value: 'Every bundle costs less than two comparable individual bookings' },
          { label: 'Consistent style', value: 'A harmonious visual story from pregnancy to your baby\'s first days' }
        ],
        imageAlt: 'Combination of maternity and newborn photography in Graz'
      },
      section1: {
        title: 'Why planning both sessions together is worthwhile',
        sub: 'Two meaningful sessions, one familiar photographer and a coherent result from the very beginning.',
        card1: {
          title: 'One consistent story',
          text: 'Both sessions are planned together and photographically coordinated. You do not need to start over twice, and you receive memories that visibly belong together.',
          items: [
            'Maternity and newborn images in one harmonious visual style.',
            'Partners and siblings can be included depending on the package.',
            'Attractive savings compared with equivalent individual bookings.'
          ]
        },
        card2: {
          title: 'Relaxed process',
          steps: [
            'We ideally schedule the maternity session between weeks 28 and 34.',
            'The newborn appointment remains flexible around your estimated due date.',
            'Both sessions are calm, personal and followed by fast image editing.'
          ]
        }
      },
      section2: {
        title: 'Frequently asked questions about the bundle',
        sub: 'The key answers for planning both sessions comfortably and without pressure.',
        faqs: [
          {
            q: 'When should we book the bundle?',
            a: 'Ideally, contact me during pregnancy. This gives us time to schedule the maternity session and keep enough flexibility around your due date for the newborn session.'
          },
          {
            q: 'Do both dates have to be fixed immediately?',
            a: 'No. We set the maternity date in advance. The newborn appointment is then adjusted flexibly to your baby\'s actual arrival.'
          },
          {
            q: 'Can partners and siblings take part?',
            a: 'Yes, absolutely. Depending on the package, partners and siblings can be included in both sessions. The exact inclusions are listed clearly in the package overview.'
          },
          {
            q: 'How much do we save?',
            a: 'Even the smallest bundle saves 79 EUR compared with two equivalent individual bookings. The larger packages also include more images and prepared image sets.'
          }
        ]
      },
      gallery: {
        title: 'Gallery',
        sub: 'Maternity and newborn images with a calm, loving and beautifully coordinated visual style.'
      },
      cta: {
        title: 'Inquire about the maternity & newborn bundle',
        text: 'The <strong>Two Little Memories</strong> package starts at <strong>299 EUR</strong> and includes two sessions with 5 edited images and 1 image set per session, for a total of 10 images.',
        primary: 'Inquire about the bundle',
        secondary: 'View packages'
      },
      contact: {
        title: 'Direct contact',
        moreServices: '<a href="babybauch-shooting-graz.html">Maternity</a> · <a href="newborn-fotografie-graz.html">Newborn</a> · <a href="familienfotografie-graz.html">Family</a>'
      }
    },
    bs: {
      metaTitle: 'Trudničko & fotografisanje novorođenčeta Graz | LiZa Memories Photography',
      metaDescription: 'Kombinacija trudničkog i fotografisanja novorođenčeta u Grazu sa dva usklađena termina, jedinstvenim stilom i povoljnijom cijenom.',
      ogTitle: 'Trudničko & novorođenče paket Graz | LiZa Memories Photography',
      ogDescription: 'Dvije posebne životne faze, poznata fotografkinja i skladna zajednička priča.',
      breadcrumbCurrent: 'Trudničko & novorođenče paket',
      hero: {
        eyebrow: 'Trudničko & novorođenče paket',
        title: 'Od trudničkog stomaka do prvih dana sa vašim malim čudom.',
        lead: 'Ova kombinacija povezuje trudničko fotografisanje sa kasnijim fotografisanjem novorođenčeta. Tako nastaju dvije usklađene serije koje vašu radost iščekivanja i prve dane sa bebom pričaju u jednom nježnom i skladnom vizuelnom stilu.',
        primary: 'Pošalji upit za paket',
        secondary: 'Pogledaj portfolio',
        points: [
          { label: '2 fotografisanja', value: 'Trudničko i fotografisanje novorođenčeta planirani zajedno' },
          { label: 'Povoljnija cijena', value: 'Svaki paket je povoljniji od dvije uporedive pojedinačne rezervacije' },
          { label: 'Zajednički stil', value: 'Skladna vizuelna priča od trudnoće do prvih dana sa bebom' }
        ],
        imageAlt: 'Kombinacija trudničkog i fotografisanja novorođenčeta u Grazu'
      },
      section1: {
        title: 'Zašto se isplati planirati oba fotografisanja zajedno',
        sub: 'Dva posebna fotografisanja, poznata fotografkinja i skladan rezultat od samog početka.',
        card1: {
          title: 'Jedna povezana priča',
          text: 'Oba fotografisanja planiraju se zajedno i vizuelno usklađuju. Ne morate dva puta počinjati ispočetka, a dobijate uspomene koje jasno pripadaju jedna drugoj.',
          items: [
            'Trudničke i fotografije novorođenčeta u skladnom vizuelnom stilu.',
            'Partner i djeca mogu biti uključeni, zavisno od paketa.',
            'Povoljnija cijena u odnosu na uporedive pojedinačne rezervacije.'
          ]
        },
        card2: {
          title: 'Opušten tok',
          steps: [
            'Trudničko fotografisanje idealno planiramo između 28. i 34. sedmice.',
            'Termin za novorođenče ostaje fleksibilan oko očekivanog datuma poroda.',
            'Oba fotografisanja su mirna, lična i praćena brzom obradom fotografija.'
          ]
        }
      },
      section2: {
        title: 'Česta pitanja o kombinovanom paketu',
        sub: 'Najvažniji odgovori za opušteno planiranje oba fotografisanja.',
        faqs: [
          {
            q: 'Kada trebamo rezervisati kombinovani paket?',
            a: 'Najbolje je da se javite već tokom trudnoće. Tako možemo na vrijeme planirati trudničko fotografisanje i ostaviti dovoljno fleksibilnosti za termin novorođenčeta.'
          },
          {
            q: 'Moraju li oba termina odmah biti određena?',
            a: 'Ne. Termin trudničkog fotografisanja dogovaramo unaprijed, dok termin za novorođenče fleksibilno prilagođavamo stvarnom datumu rođenja.'
          },
          {
            q: 'Mogu li partner i djeca učestvovati?',
            a: 'Da, naravno. Zavisno od paketa, partner i djeca mogu biti uključeni u oba fotografisanja. Tačan obim svake ponude jasno je naveden u pregledu paketa.'
          },
          {
            q: 'Kolika je ušteda?',
            a: 'Već najmanji kombinovani paket je 79 EUR povoljniji od dvije uporedive pojedinačne rezervacije. Veći paketi dodatno uključuju više fotografija i pripremljenih setova.'
          }
        ]
      },
      gallery: {
        title: 'Galerija',
        sub: 'Trudničke i fotografije novorođenčeta u mirnom, nježnom i međusobno usklađenom vizuelnom stilu.'
      },
      cta: {
        title: 'Upit za trudničko & novorođenče paket',
        text: 'Paket <strong>Dvije male uspomene</strong> počinje od <strong>299 EUR</strong> i uključuje dva fotografisanja sa po 5 obrađenih fotografija i 1 setom, ukupno 10 fotografija.',
        primary: 'Pošalji upit za paket',
        secondary: 'Pogledaj pakete'
      },
      contact: {
        title: 'Direktan kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Trudničko</a> · <a href="newborn-fotografie-graz.html">Novorođenčad</a> · <a href="familienfotografie-graz.html">Porodica</a>'
      }
    }
  };

  pages.newborn = {
    de: {
      metaTitle: 'Neugeborenenfotografie in Graz | LiZa Memories Photography',
      metaDescription: 'Neugeborenenfotografie in Graz mit viel Geduld, Sicherheit und liebevoller Bildsprache. Natürliche Erinnerungen für die erste Zeit mit eurem Baby.',
      ogTitle: 'Neugeborenenfotografie in Graz | LiZa Memories Photography',
      ogDescription: 'Sanfte Neugeborenenfotografie in Graz mit ruhigem Ablauf und zeitlosen Bildern.',
      breadcrumbCurrent: 'Neugeborenenfotografie Graz',
      hero: {
        eyebrow: 'Neugeborenenfotografie',
        title: 'Sanfte Neugeborenenbilder mit viel Geduld, Ruhe und echter Geborgenheit.',
        lead: 'Die ersten Tage mit eurem Baby sind einmalig. Ein Neugeborenen-Shooting in Graz sollte deshalb ruhig, sicher und ohne Zeitdruck ablaufen. Genau darauf ist LiZa Memories Photography spezialisiert: natürliche Bilder, liebevolle Details und eine entspannte Atmosphäre für Eltern, Geschwister und Baby.',
        primary: 'Neugeborenen-Shooting anfragen',
        secondary: 'Portfolio ansehen',
        points: [
          { label: 'Beste Zeit', value: 'Am schönsten in den ersten 5 bis 14 Tagen nach der Geburt' },
          { label: 'Dauer', value: 'Meist 2 bis 3 Stunden, damit Pausen ganz entspannt Platz haben' },
          { label: 'Familie', value: 'Familienbilder mit Eltern und Geschwistern sind natürlich möglich' }
        ],
        imageAlt: 'Neugeborenenaufnahme mit schlafendem Baby in ruhiger Pose'
      },
      section1: {
        title: 'Was Eltern an diesem Neugeborenen Shooting schätzen',
        sub: 'Hier seht ihr die wichtigsten Infos zu Ablauf, Ruhe und dem Gefühl, das diese ersten Bilder so besonders macht.',
        card1: {
          title: 'Ruhiger Ablauf',
          items: [
            'Genug Zeit für Stillen, Wickeln und Beruhigen.',
            'Sichere, sanfte und entspannte Begleitung während des Shootings.',
            'Familienbilder und Geschwisterbilder können integriert werden.',
            'Kein Zeitdruck, damit ihr euch als Familie ganz in Ruhe einfinden könnt.'
          ]
        },
        card2: {
          title: 'Wichtige Infos',
          steps: [
            'Am besten schon während der Schwangerschaft anfragen.',
            'Der finale Termin wird flexibel an die Geburt angepasst.',
            'Ruhiges Shooting mit viel Feingefühl und schneller Bildbearbeitung.'
          ]
        }
      },
      section2: {
        title: 'Häufige Fragen zur Neugeborenenfotografie',
        sub: 'Die wichtigsten Antworten für eine entspannte Planung auf einen Blick.',
        faqs: [
          {
            q: 'Wann sollten wir anfragen?',
            a: 'Am besten schon in der Schwangerschaft, damit rund um den errechneten Termin genug Flexibilität für das Shooting bleibt.'
          },
          {
            q: 'Was, wenn unser Baby unruhig ist?',
            a: 'Das ist ganz normal. Für Stillen, Wickeln und Beruhigen ist immer Zeit eingeplant, damit das Shooting ruhig und entspannt bleibt.'
          }
        ]
      },
      gallery: {
        title: 'Galerie',
        sub: 'Sanfte Neugeborenenbilder voller Ruhe, Nähe und kleiner Details aus den ersten Tagen.'
      },
      cta: {
        title: 'Neugeborenen-Shooting in Graz anfragen',
        text: 'Das Paket <strong>Kleines Wunder</strong> startet bei <strong>199 EUR</strong> und beinhaltet bis zu 75 Minuten Shooting, 6 bearbeitete Bilder, 1 vorbereitetes Bildset und Babyaufnahmen.',
        primary: 'Termin anfragen',
        secondary: 'Preise ansehen'
      },
      contact: {
        title: 'Direkter Kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Babybauch</a> · <a href="familienfotografie-graz.html">Familie</a> · <a href="hochzeitsfotograf-graz.html">Hochzeit</a>'
      },
      footer: {
        links: ['Startseite', 'Babybauch', 'Familie', 'Impressum', 'Datenschutz']
      }
    },
    en: {
      metaTitle: 'Newborn Photography Graz | LiZa Memories Photography',
      metaDescription: 'Newborn photography in Graz with patience, safety and a gentle visual style. Natural memories for your baby\'s first days.',
      ogTitle: 'Newborn Photography Graz | LiZa Memories Photography',
      ogDescription: 'Gentle newborn photography in Graz with a calm process and timeless images.',
      breadcrumbCurrent: 'Newborn Photography Graz',
      hero: {
        eyebrow: 'Newborn Photography Graz',
        title: 'Gentle newborn images with patience, calm and a true sense of comfort.',
        lead: 'The first days with your baby are unique. A newborn session in Graz should therefore feel calm, safe and completely free from pressure. That is exactly what LiZa Memories Photography is known for: natural images, loving details and a relaxed atmosphere for parents, siblings and baby.',
        primary: 'Ask about a newborn session',
        secondary: 'View portfolio',
        points: [
          { label: 'Best time', value: 'Ideally within the first 5 to 14 days after birth' },
          { label: 'Duration', value: 'Usually 2 to 3 hours, with plenty of room for breaks' },
          { label: 'Family', value: 'Family portraits with parents and siblings can naturally be included' }
        ],
        imageAlt: 'Newborn portrait with a sleeping baby in a calm pose'
      },
      section1: {
        title: 'What parents appreciate about this newborn session',
        sub: 'Here you can quickly see the key details about the calm flow, the safety and the gentle atmosphere behind these first images.',
        card1: {
          title: 'Calm process',
          items: [
            'Enough time for feeding, changing and soothing.',
            'Safe, gentle and relaxed guidance throughout the session.',
            'Family portraits and sibling portraits can be included.',
            'There is no time pressure, so your family can settle in calmly.'
          ]
        },
        card2: {
          title: 'Important details',
          steps: [
            'It is best to get in touch during pregnancy.',
            'The final date is adjusted flexibly once the baby is born.',
            'A calm session, plenty of sensitivity and quick image delivery are all part of the experience.'
          ]
        }
      },
      section2: {
        title: 'Frequently asked questions about newborn photography',
        sub: 'The most important answers for an easy and relaxed planning process.',
        faqs: [
          {
            q: 'When should we inquire?',
            a: 'Ideally during pregnancy so there is enough flexibility around the due date for the session.'
          },
          {
            q: 'What if our baby is unsettled?',
            a: 'That is completely normal. Time for feeding, changing and soothing is always built in so the session stays calm and stress-free.'
          }
        ]
      },
      gallery: {
        title: 'Gallery',
        sub: 'Gentle newborn images full of calm, closeness and tiny details from the very first days.'
      },
      cta: {
        title: 'Inquire about a newborn session in Graz',
        text: 'The <strong>Little Wonder</strong> package starts at <strong>199 EUR</strong> and includes up to 75 minutes, 6 edited images, 1 prepared image set and baby portraits.',
        primary: 'Inquire now',
        secondary: 'View pricing'
      },
      contact: {
        title: 'Direct contact',
        moreServices: '<a href="babybauch-shooting-graz.html">Maternity</a> · <a href="familienfotografie-graz.html">Family</a> · <a href="hochzeitsfotograf-graz.html">Wedding</a>'
      },
      footer: {
        links: ['Home', 'Maternity', 'Family', 'Imprint', 'Privacy']
      }
    },
    bs: {
      metaTitle: 'Fotografisanje novorođenčadi Graz | LiZa Memories Photography',
      metaDescription: 'Fotografisanje novorođenčadi u Grazu sa puno strpljenja, sigurnosti i nježnim stilom. Prirodne uspomene za prve dane vaše bebe.',
      ogTitle: 'Fotografisanje novorođenčadi Graz | LiZa Memories Photography',
      ogDescription: 'Nježno fotografisanje novorođenčadi u Grazu sa mirnim tokom i nježnim fotografijama.',
      breadcrumbCurrent: 'Fotografisanje novorođenčadi Graz',
      hero: {
        eyebrow: 'Fotografisanje novorođenčadi Graz',
        title: 'Nježno fotografisanje novorođenčadi uz strpljiv, miran i pažljiv pristup.',
        lead: 'Prvi dani sa vašom bebom prolaze brzo i upravo zato ih je toliko važno zabilježiti. Kod LiZa Memories Photography očekuje vas fotografisanje u mirnoj i sigurnoj atmosferi, bez ikakvog pritiska. Važno je da se i vi i vaša beba osjećate ugodno i opušteno, jer upravo tako nastaju prirodne fotografije pune topline i nježnih detalja, koje čuvaju uspomenu na te prve dane.',
        primary: 'Upit za fotografisanje novorođenčadi',
        secondary: 'Pogledaj portfolio',
        points: [
          { label: 'Najbolje vrijeme', value: 'Najljepše u prvih 5 do 14 dana nakon rođenja' },
          { label: 'Trajanje', value: 'Najčešće 2 do 3 sata kako bi pauze protekle bez stresa' },
          { label: 'Porodica', value: 'Moguće su i porodične fotografije sa roditeljima i djecom' }
        ],
        imageAlt: 'Fotografija uspavane bebe u mirnoj pozi'
      },
      section1: {
        title: 'Šta roditelji cijene kod ovog fotografisanja novorođenčadi',
        sub: 'Ovdje možete brzo vidjeti najvažnije informacije o mirnom toku, sigurnosti i atmosferi koja ove prve fotografije čini posebnim.',
        card1: {
          title: 'Miran tok',
          items: [
            'Dovoljno vremena za hranjenje, presvlačenje i smirivanje bebe.',
            'Sve se odvija mirno, nježno i u skladu s ritmom vaše bebe.',
            'Mogu se uključiti i porodične fotografije te fotografije s braćom i sestrama.',
            'Bez žurbe i pritiska, kako biste se i vi i vaša beba osjećali mirno i opušteno.'
          ]
        },
        card2: {
          title: 'Važne informacije',
          steps: [
            'Najbolje je poslati upit još tokom trudnoće.',
            'Konačan termin se fleksibilno prilagođava nakon rođenja.',
            'Cijelo iskustvo obilježavaju miran pristup, puno pažnje i brza obrada fotografija.'
          ]
        }
      },
      section2: {
        title: 'Česta pitanja o fotografisanju novorođenčadi',
        sub: 'Najvažniji odgovori za mirnu i jednostavnu organizaciju.',
        faqs: [
          {
            q: 'Kada je najbolje poslati upit?',
            a: 'Najbolje već tokom trudnoće kako bi oko termina rođenja ostalo dovoljno fleksibilnosti za fotografisanje.'
          },
          {
            q: 'Šta ako je beba nemirna?',
            a: 'To je sasvim normalno. Vrijeme za hranjenje, presvlačenje i umirivanje je uvijek planirano, tako da fotografisanje ostaje mirno i opušteno.'
          }
        ]
      },
      gallery: {
        title: 'Galerija',
        sub: 'Nježne fotografije novorođenčadi pune mira, bliskosti i malih detalja iz prvih dana.'
      },
      cta: {
        title: 'Upit za fotografisanje novorođenčadi u Grazu',
        text: 'Paket <strong>Malo čudo</strong> počinje od <strong>199 EUR</strong> i uključuje do 75 minuta fotografisanja, 6 obrađenih fotografija, 1 pripremljeni set i fotografije bebe.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj cijene'
      },
      contact: {
        title: 'Direktan kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Trudničko</a> · <a href="familienfotografie-graz.html">Porodica</a> · <a href="hochzeitsfotograf-graz.html">Vjenčanje</a>'
      },
      footer: {
        links: ['Početna', 'Trudničko', 'Porodica', 'Impresum', 'Zaštita podataka']
      }
    }
  };

  pages.familie = {
    de: {
      metaTitle: 'Familienfotografie in Graz | LiZa Memories Photography',
      metaDescription: 'Familienfotografie in Graz mit echten Momenten, natürlicher Nähe und liebevoll bearbeiteten Bildern für bleibende Erinnerungen.',
      ogTitle: 'Familienfotografie in Graz | LiZa Memories Photography',
      ogDescription: 'Natürliche Familienfotografie in Graz für echte, emotionale und zeitlose Erinnerungen.',
      breadcrumbCurrent: 'Familienfotografie Graz',
      hero: {
        eyebrow: 'Familienfotografie',
        title: 'Echte Familienmomente, liebevoll festgehalten.',
        lead: 'Familienfotografie in Graz sollte nicht steif oder künstlich wirken. Ziel sind echte Interaktionen, kleine Gesten, wärmevolle Nähe und Bilder, die eure Familie so zeigen, wie sie wirklich ist: liebevoll, lebendig und zeitlos.',
        primary: 'Familien Shooting anfragen',
        secondary: 'Portfolio ansehen',
        points: [
          { label: 'Für wen', value: 'Für Eltern, Kinder und echte gemeinsame Familienmomente' },
          { label: 'Mitgedacht', value: 'Spielzeug, kleine Pausen und ein entspannter Ablauf sind eingeplant' },
          { label: 'Bildlieferung', value: 'Meist innerhalb von 72 Stunden für euch verfügbar' }
        ],
        imageAlt: 'Familienfotografie in Graz mit Mutter und Kind'
      },
      section1: {
        title: 'Warum Familien sich bei LiZa Memories wohl fühlen',
        sub: 'Hier findet ihr die wichtigsten Infos darüber, wie das Shooting abläuft und warum die Bilder so natürlich und nah wirken.',
        card1: {
          title: 'Natürlicher Umgang',
          items: [
            'Keine überladenen Posen, sondern echte Interaktion.',
            'Viel Feingefühl für Kinder, Eltern und unterschiedliche Stimmungen.',
            'Bilder mit echter Nähe statt künstlicher Perfektion.',
            'Kinder dürfen sich bewegen, spielen und einfach sie selbst sein.'
          ]
        },
        card2: {
          title: 'Entspannter Ablauf',
          steps: [
            'Kurze Anfrage mit eurem Wunschdatum.',
            'Persönliche Abstimmung zu Personen, Kleidung und weiteren Details.',
            'Entspanntes Shooting mit spielerischer Begleitung und schneller Bildbearbeitung.'
          ]
        }
      },
      section2: {
        title: 'Häufige Fragen zur Familienfotografie',
        sub: 'Kurz und klar beantwortet, damit ihr schnell wisst, ob diese Art von Shooting zu euch passt.',
        faqs: [
          {
            q: 'Müssen Kinder still sitzen?',
            a: 'Nein, überhaupt nicht. Gerade bei Familienbildern dürfen Kinder neugierig, verspielt und in Bewegung sein. Wenn sie zwischendurch eine Pause brauchen, ist das völlig in Ordnung. Vor Ort gibt es genug Spielzeug, Bücher und auch tiptoi von unseren eigenen Kindern, damit sie kurz spielen und abschalten können. Ich gehe spielerisch auf sie ein und hole sie immer wieder liebevoll zurück ins Shooting, wenn es für sie passt.'
          },
          {
            q: 'Können auch Großeltern oder weitere Familienmitglieder dabei sein?',
            a: 'Ja, sehr gern nach Absprache. Wenn ihr euch zusätzlich Bilder mit Großeltern oder anderen Herzensmenschen wünscht, planen wir das Shooting so, dass sowohl gemeinsame Familienbilder als auch kleinere Kombinationen in Ruhe möglich sind.'
          }
        ]
      },
      gallery: {
        title: 'Galerie',
        sub: 'Natürliche Familienmomente mit echter Nähe, Bewegung und einer warmen, ungestellten Stimmung.'
      },
      cta: {
        title: 'Familienfotografie in Graz anfragen',
        text: 'Das Paket <strong>Kleine Familienzeit</strong> startet bei <strong>189 EUR</strong> und beinhaltet 30 Minuten Shooting, 5 bearbeitete Bilder und gemeinsame Familienaufnahmen.',
        primary: 'Jetzt anfragen',
        secondary: 'Pakete ansehen'
      },
      contact: {
        title: 'Direkter Kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Babybauch</a> · <a href="newborn-fotografie-graz.html">Neugeborene</a> · <a href="hochzeitsfotograf-graz.html">Hochzeit</a>'
      },
      footer: {
        links: ['Startseite', 'Babybauch', 'Neugeborene', 'Impressum', 'Datenschutz']
      }
    },
    en: {
      metaTitle: 'Family Photography Graz | LiZa Memories Photography',
      metaDescription: 'Family photography in Graz with genuine moments, natural closeness and lovingly edited images that last.',
      ogTitle: 'Family Photography Graz | LiZa Memories Photography',
      ogDescription: 'Natural family photography in Graz for real, emotional and timeless memories.',
      breadcrumbCurrent: 'Family Photography Graz',
      hero: {
        eyebrow: 'Family Photography Graz',
        title: 'Real family moments, lovingly captured.',
        lead: 'Family photography in Graz should never feel stiff or artificial. The goal is real interaction, small gestures, warm closeness and images that show your family just as it truly is: loving, lively and timeless.',
        primary: 'Inquire about a family session',
        secondary: 'View portfolio',
        points: [
          { label: 'Perfect for', value: 'For parents, children and real shared family moments' },
          { label: 'Thoughtfully planned', value: 'Toys, little breaks and a relaxed flow are all part of the session.' },
          { label: 'Image delivery', value: 'Usually available within 72 hours' }
        ],
        imageAlt: 'Family photography in Graz with mother and child'
      },
      section1: {
        title: 'Why families feel at ease with LiZa Memories',
        sub: 'Here you can see the most important details about the process and why the images feel so natural, warm and close.',
        card1: {
          title: 'Natural approach',
          items: [
            'No overloaded posing, but genuine interaction.',
            'A lot of sensitivity for children, parents and different moods.',
            'Images with real closeness instead of artificial perfection.',
            'Children are welcome to move, play and simply be themselves.'
          ]
        },
        card2: {
          title: 'Relaxed process',
          steps: [
            'A short inquiry with your preferred date.',
            'Personal coordination about who will join, clothing and further details.',
            'A relaxed session with playful guidance and fast image editing.'
          ]
        }
      },
      section2: {
        title: 'Frequently asked questions about family photography',
        sub: 'Short, clear answers so you can quickly see whether this session style fits your family.',
        faqs: [
          {
            q: 'Do children need to sit still?',
            a: 'No, not at all. During family sessions, children are welcome to be curious, playful and in motion. If they need a little break in between, that is completely fine. There are toys, books and even tiptoi from our own children on site so they can play and switch off for a moment. I engage with them playfully and gently invite them back into the session whenever it feels right for them.'
          },
          {
            q: 'Can grandparents or other family members join?',
            a: 'Yes, absolutely by arrangement. If you would like images with grandparents or other loved ones as well, we can plan the session so both full family portraits and smaller combinations fit in calmly.'
          }
        ]
      },
      gallery: {
        title: 'Gallery',
        sub: 'Natural family moments with real closeness, movement and a warm, unstaged atmosphere.'
      },
      cta: {
        title: 'Inquire about family photography in Graz',
        text: 'The <strong>Little Family Time</strong> package starts at <strong>189 EUR</strong> and includes a 30-minute session, 5 edited images and shared family portraits.',
        primary: 'Inquire now',
        secondary: 'View packages'
      },
      contact: {
        title: 'Direct contact',
        moreServices: '<a href="babybauch-shooting-graz.html">Maternity</a> · <a href="newborn-fotografie-graz.html">Newborn</a> · <a href="hochzeitsfotograf-graz.html">Wedding</a>'
      },
      footer: {
        links: ['Home', 'Maternity', 'Newborn', 'Imprint', 'Privacy']
      }
    },
    bs: {
      metaTitle: 'Porodično fotografisanje Graz | LiZa Memories Photography',
      metaDescription: 'Porodično fotografisanje u Grazu sa stvarnim trenucima, prirodnom bliskošću i pažljivo obrađenim fotografijama za trajne uspomene.',
      ogTitle: 'Porodično fotografisanje Graz | LiZa Memories Photography',
      ogDescription: 'Prirodno porodično fotografisanje u Grazu za stvarne, emotivne i tople uspomene.',
      breadcrumbCurrent: 'Porodično fotografisanje Graz',
      hero: {
        eyebrow: 'Porodično fotografisanje Graz',
        title: 'Prirodni porodični trenuci puni topline i bliskosti.',
        lead: 'Porodično fotografisanje u Grazu najljepše je kada protiče opušteno, prirodno i bez usiljenih poza. Najljepše fotografije nastaju kroz bliskost, spontane trenutke i male geste koje vašu porodicu prikazuju onakvom kakva zaista jeste – povezanu, toplu i punu života.',
        primary: 'Upit za porodično fotografisanje',
        secondary: 'Pogledaj portfolio',
        points: [
          { label: 'Idealno za', value: 'Za roditelje, djecu i lijepe porodične trenutke koje želite sačuvati' },
          { label: 'Sve je osmišljeno', value: 'Igračke, male pauze i opušten tok fotografisanja su unaprijed planirani' },
          { label: 'Isporuka fotografija', value: 'Najčešće dostupno u roku od 72 sata' }
        ],
        imageAlt: 'Porodično fotografisanje u Grazu sa majkom i djetetom'
      },
      section1: {
        title: 'Zašto se porodice osjećaju ugodno uz LiZa Memories',
        sub: 'Ovdje ćete pronaći najvažnije informacije o toku fotografisanja i zašto fotografije djeluju tako prirodno, toplo i blisko.',
        card1: {
          title: 'Prirodan pristup',
          items: [
            'Bez prenaglašenih poza, nego sa stvarnom interakcijom.',
            'Puno osjećaja za djecu, roditelje i različita raspoloženja.',
            'Fotografije sa stvarnom bliskošću umjesto vještačke perfekcije.',
            'Djeca se mogu kretati, igrati i jednostavno biti ono što jesu.'
          ]
        },
        card2: {
          title: 'Opušten tok',
          steps: [
            'Kratak upit sa željenim terminom.',
            'Lični dogovor o osobama, odjeći i dodatnim detaljima.',
            'Opušteno fotografisanje uz razigran pristup i brzu obradu fotografija.'
          ]
        }
      },
      section2: {
        title: 'Česta pitanja o porodičnom fotografisanju',
        sub: 'Kratki i jasni odgovori kako biste brzo osjetili da li ovaj stil fotografisanja odgovara vašoj porodici.',
        faqs: [
          {
            q: 'Moraju li djeca mirno sjediti?',
            a: 'Ne, nikako. Na porodičnom fotografisanju djeca smiju biti radoznala, razigrana i u pokretu. Ako im usput zatreba kratka pauza, to je potpuno u redu. Kod nas ima dovoljno igračaka, knjiga i tiptoija od naše djece, tako da se mogu malo igrati i predahnuti. Pristupam im kroz igru i nježno ih vraćam u fotografisanje kada im to odgovara.'
          },
          {
            q: 'Mogu li se priključiti i bake, djedovi ili drugi članovi porodice?',
            a: 'Da, naravno po dogovoru. Ako želite i fotografije sa bakama, djedovima ili drugim dragim osobama, fotografisanje planiramo tako da mirno stignemo napraviti i zajedničke i manje kombinacije.'
          }
        ]
      },
      gallery: {
        title: 'Galerija',
        sub: 'Prirodni porodični trenuci sa stvarnom bliskošću, pokretom i toplom, nenamještenom atmosferom.'
      },
      cta: {
        title: 'Upit za porodično fotografisanje u Grazu',
        text: 'Paket <strong>Malo porodično vrijeme</strong> počinje od <strong>189 EUR</strong> i uključuje 30 minuta fotografisanja, 5 obrađenih fotografija i zajedničke porodične portrete.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj pakete'
      },
      contact: {
        title: 'Direktan kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Trudničko</a> · <a href="newborn-fotografie-graz.html">Novorođenčad</a> · <a href="hochzeitsfotograf-graz.html">Vjenčanje</a>'
      },
      footer: {
        links: ['Početna', 'Trudničko', 'Novorođenčad', 'Impresum', 'Zaštita podataka']
      }
    }
  };

  pages.hochzeit = {
    de: {
      metaTitle: 'Hochzeitsfotograf in Graz | Standesamt & kleine Feier | LiZa Memories Photography',
      metaDescription: 'Hochzeitsfotograf in Graz für Standesamt und kleine Feiern. Emotionale Begleitung, elegante Bildsprache und private Online-Galerie.',
      ogTitle: 'Hochzeitsfotograf in Graz | LiZa Memories Photography',
      ogDescription: 'Edle fotografische Begleitung für Standesamt und kleine Feiern in Graz.',
      breadcrumbCurrent: 'Hochzeitsfotografie Graz',
      hero: {
        eyebrow: 'Hochzeitsfotografie',
        title: 'Edle Begleitung für Standesamt und kleine Feiern in Graz.',
        lead: 'Nicht jede Hochzeit braucht große Inszenierung. Gerade standesamtliche Trauungen und kleinere Feiern leben von echter Atmosphäre, stillen Details und echten Emotionen. Genau diese Momente begleitet LiZa Memories Photography mit ruhiger, hochwertiger Bildsprache.',
        primary: 'Hochzeit anfragen',
        secondary: 'Portfolio ansehen',
        points: [
          { label: 'Anlass', value: 'Standesamt, kleine Hochzeiten, Taufen und Feiern im kleinen Rahmen' },
          { label: 'Preis', value: 'Pakete für Standesamt, Taufen und kleine Feiern starten bei 299 EUR' },
          { label: 'Begleitung', value: 'Ruhig, stilvoll und unaufdringlich mit Fokus auf echte Momente' }
        ],
        imageAlt: 'Paarfoto eines Hochzeitspaares in Graz'
      },
      section1: {
        title: 'Was die Begleitung auszeichnet',
        sub: 'Hier seht ihr die wichtigsten Details dazu, wie ruhig, stilvoll und unaufdringlich diese fotografische Begleitung aufgebaut ist.',
        card1: {
          title: 'Fokus auf Stimmung',
          items: [
            'Zeremonie, Paarfotos und Gruppenbilder in einem eleganten Stil.',
            'Ruhige Begleitung ohne Hektik oder künstliche Inszenierung.',
            'Ideal für Standesamt, intime Feiern und kleine Hochzeiten.',
            'Auch kleine Details und echte Emotionen werden mit viel Feingefühl festgehalten.'
          ]
        },
        card2: {
          title: 'Leistungsumfang',
          steps: [
            'Bis zu 3 Stunden fotografische Begleitung.',
            '35 bearbeitete Bilder plus 65 weitere unbearbeitete Aufnahmen.',
            'Ruhige fotografische Begleitung mit viel Gefühl und zeitloser Bildbearbeitung.'
          ]
        }
      },
      section2: {
        title: 'Häufige Fragen zur Hochzeitsbegleitung',
        sub: 'Die wichtigsten Antworten für Paare, die sich eine stilvolle und entspannte Begleitung wünschen.',
        faqs: [
          {
            q: 'Ist das nur für große Hochzeiten?',
            a: 'Nein. Diese Begleitung ist bewusst für Standesamt, intime Feiern und kleine Hochzeiten gedacht, bei denen echte Stimmung im Vordergrund steht.'
          },
          {
            q: 'Was ist enthalten?',
            a: 'Je nach Paket begleite ich eure Zeremonie, halte Paarfotos, Gruppenbilder und die kleinen echten Momente dazwischen fest. Ihr bekommt eine sorgfältig ausgewählte und liebevoll bearbeitete Bildserie, die eure Feier ruhig, hochwertig und emotional widerspiegelt.'
          }
        ]
      },
      gallery: {
        title: 'Galerie',
        sub: 'Eine Auswahl an Bildern aus standesamtlichen Trauungen und kleinen Feiern mit ruhiger, eleganter Bildsprache.'
      },
      cta: {
        title: 'Hochzeitsfotograf in Graz anfragen',
        text: 'Das Paket <strong>Ja, ich will</strong> startet bei <strong>299 EUR</strong> und beinhaltet bis zu 1 Stunde Begleitung, Trauung und Gruppenbilder, ca. 20 professionell bearbeitete Bilder und eine private Online-Galerie.',
        primary: 'Termin anfragen',
        secondary: 'Preise ansehen'
      },
      contact: {
        title: 'Direkter Kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Babybauch</a> · <a href="newborn-fotografie-graz.html">Neugeborene</a> · <a href="familienfotografie-graz.html">Familie</a>'
      },
      footer: {
        links: ['Startseite', 'Babybauch', 'Neugeborene', 'Impressum', 'Datenschutz']
      }
    },
    en: {
      metaTitle: 'Wedding Photographer Graz | Civil Ceremony & Small Celebration | LiZa Memories Photography',
      metaDescription: 'Wedding photographer in Graz for civil ceremonies and intimate celebrations. Emotional coverage, elegant imagery and a private online gallery.',
      ogTitle: 'Wedding Photographer Graz | LiZa Memories Photography',
      ogDescription: 'Elegant photographic coverage for civil ceremonies and intimate celebrations in Graz.',
      breadcrumbCurrent: 'Wedding Photographer Graz',
      hero: {
        eyebrow: 'Wedding Photographer Graz',
        title: 'Elegant coverage for civil ceremonies and intimate celebrations in Graz.',
        lead: 'Not every wedding needs a grand production. Civil ceremonies and smaller celebrations often live from real atmosphere, quiet details and genuine emotion. LiZa Memories Photography captures exactly those moments with a calm and refined visual style.',
        primary: 'Inquire about wedding coverage',
        secondary: 'View portfolio',
        points: [
          { label: 'Occasion', value: 'Civil ceremonies, intimate weddings, baptisms and small celebrations' },
          { label: 'Price', value: 'Packages for civil ceremonies, baptisms and intimate celebrations start at 299 EUR' },
          { label: 'Coverage', value: 'Calm, elegant and unobtrusive with a focus on real moments' }
        ],
        imageAlt: 'Wedding couple portrait in Graz'
      },
      section1: {
        title: 'What makes this wedding coverage special',
        sub: 'Here you can quickly see how calm, elegant and unobtrusive this kind of photographic coverage is designed to feel.',
        card1: {
          title: 'Focus on atmosphere',
          items: [
            'Ceremony, couple portraits and group photos in an elegant style.',
            'Calm guidance without stress or artificial staging.',
            'Ideal for civil ceremonies, intimate celebrations and small weddings.',
            'Small details and real emotions are captured with great sensitivity as well.'
          ]
        },
        card2: {
          title: 'What is included',
          steps: [
            'Up to 3 hours of photographic coverage.',
            '35 edited images plus 65 additional unedited captures.',
            'Calm photographic coverage with feeling and timeless image editing.'
          ]
        }
      },
      section2: {
        title: 'Frequently asked questions about wedding coverage',
        sub: 'The most important answers for couples who want an elegant and relaxed photographic experience.',
        faqs: [
          {
            q: 'Is this only for large weddings?',
            a: 'No. This coverage is intentionally designed for civil ceremonies, intimate celebrations and smaller weddings where atmosphere matters most.'
          },
          {
            q: 'What is included?',
            a: 'Depending on the package, I cover your ceremony, create couple portraits, group photos and capture the small real moments in between. You receive a carefully selected and lovingly edited image series that reflects your celebration in a calm, elegant and emotional way.'
          }
        ]
      },
      gallery: {
        title: 'Gallery',
        sub: 'A selection of images from civil ceremonies and intimate celebrations with a calm and elegant visual style.'
      },
      cta: {
        title: 'Inquire about wedding photography in Graz',
        text: 'The <strong>Yes, I Do</strong> package starts at <strong>299 EUR</strong> and includes up to 1 hour of coverage, the ceremony and group portraits, around 20 professionally edited images and a private online gallery.',
        primary: 'Inquire now',
        secondary: 'View pricing'
      },
      contact: {
        title: 'Direct contact',
        moreServices: '<a href="babybauch-shooting-graz.html">Maternity</a> · <a href="newborn-fotografie-graz.html">Newborn</a> · <a href="familienfotografie-graz.html">Family</a>'
      },
      footer: {
        links: ['Home', 'Maternity', 'Newborn', 'Imprint', 'Privacy']
      }
    },
    bs: {
      metaTitle: 'Vjenčani fotograf Graz | Vjenčanje i mala proslava | LiZa Memories Photography',
      metaDescription: 'Vjenčani fotograf u Grazu za vjenčanja i male proslave. Emotivna pratnja, elegantan stil i privatna online galerija.',
      ogTitle: 'Vjenčani fotograf Graz | LiZa Memories Photography',
      ogDescription: 'Fotografska pratnja za vjenčanja i male proslave u Grazu sa fokusom na emocije, detalje i atmosferu.',
      breadcrumbCurrent: 'Vjenčani fotograf Graz',
      hero: {
        eyebrow: 'Vjenčani fotograf Graz',
        title: 'Fotografska pratnja za vjenčanja i male proslave u Grazu.',
        lead: 'Ne treba svako vjenčanje veliku inscenaciju. Upravo vjenčanja i manje proslave žive od stvarne atmosfere, tihih detalja i iskrenih emocija. LiZa Memories Photography te trenutke bilježi mirno, elegantno i s puno empatije.',
        primary: 'Upit za vjenčanje',
        secondary: 'Pogledaj portfolio',
        points: [
          { label: 'Povod', value: 'Vjenčanja, krštenja i proslave u manjem krugu' },
          { label: 'Cijena', value: 'Paketi za vjenčanja, krštenja i manje proslave počinju od 299 EUR' },
          { label: 'Pratnja', value: 'Mirna, elegantna i nenametljiva pratnja sa fokusom na stvarne trenutke' }
        ],
        imageAlt: 'Portret vjenčanog para u Grazu'
      },
      section1: {
        title: 'Šta ovu pratnju čini posebnom',
        sub: 'Ovdje možete brzo vidjeti koliko je ova fotografska pratnja mirna, elegantna i nenametljiva.',
        card1: {
          title: 'Fokus na atmosferu',
          items: [
            'Ceremonija, fotografije para i grupne fotografije u elegantnom stilu.',
            'Mirna pratnja bez žurbe i vještačke inscenacije.',
            'Idealno za vjenčanja, intimne proslave i manja slavlja.',
            'Uz puno osjećaja bilježim i male detalje te iskrene emocije.'
          ]
        },
        card2: {
          title: 'Šta je uključeno',
          steps: [
            'Do 3 sata fotografske pratnje.',
            '35 obrađenih fotografija plus još 65 dodatnih neobrađenih snimaka.',
            'Mirna fotografska pratnja sa puno empatije i nježnom, skladnom obradom fotografija.'
          ]
        }
      },
      section2: {
        title: 'Česta pitanja o pratnji vjenčanja',
        sub: 'Najvažniji odgovori za parove koji žele elegantnu i opuštenu fotografsku pratnju.',
        faqs: [
          {
            q: 'Da li je ovo samo za velika vjenčanja?',
            a: 'Ne. Ova pratnja je namijenjena upravo za vjenčanja, intimne proslave i manja slavlja gdje je atmosfera najvažnija.'
          },
          {
            q: 'Šta je uključeno?',
            a: 'Zavisno od paketa pratim vašu ceremoniju, fotografišem par, grupne fotografije i male autentične trenutke između svega toga. Dobijate pažljivo odabranu i s ljubavlju obrađenu seriju fotografija koja vašu proslavu prikazuje mirno, elegantno i emotivno.'
          }
        ]
      },
      gallery: {
        title: 'Galerija',
        sub: 'Izbor fotografija sa vjenčanja i manjih proslava u mirnom i elegantnom vizuelnom stilu.'
      },
      cta: {
        title: 'Upit za vjenčanog fotografa u Grazu',
        text: 'Paket <strong>Da, želim</strong> počinje od <strong>299 EUR</strong> i uključuje do 1 sat pratnje, ceremoniju i grupne fotografije, oko 20 profesionalno obrađenih fotografija i privatnu online galeriju.',
        primary: 'Pošalji upit',
        secondary: 'Pogledaj cijene'
      },
      contact: {
        title: 'Direktan kontakt',
        moreServices: '<a href="babybauch-shooting-graz.html">Trudničko</a> · <a href="newborn-fotografie-graz.html">Novorođenčad</a> · <a href="familienfotografie-graz.html">Porodica</a>'
      },
      footer: {
        links: ['Početna', 'Trudničko', 'Novorođenčad', 'Impresum', 'Zaštita podataka']
      }
    }
  };

  const currentLang = supportedLangs.includes(staticLang) ? staticLang : getInitialLanguage();
  if(supportedLangs.includes(staticLang)){
    syncLanguageUi(currentLang);
  }else{
    applyLanguage(currentLang);
  }

  function setupGalleryLightbox(){
    const items = [];
    const triggerEntries = [];
    const itemIndexBySrc = new Map();
    const galleryFigures = Array.from(document.querySelectorAll('.gallery-item'));
    const heroVisual = document.querySelector('.hero-visual');
    const heroImage = heroVisual ? heroVisual.querySelector('img') : null;

    function registerTrigger(trigger, image){
      if(!trigger || !image){
        return;
      }

      const src = image.getAttribute('src');
      const key = src || `image-${items.length}`;
      let index = itemIndexBySrc.get(key);

      if(index === undefined){
        index = items.length;
        items.push(image);
        itemIndexBySrc.set(key, index);
      }

      triggerEntries.push({ trigger, image, index });
    }

    if(heroVisual && heroImage){
      heroVisual.classList.add('hero-visual--lightbox');
      registerTrigger(heroVisual, heroImage);
    }

    galleryFigures.forEach((figure) => {
      registerTrigger(figure, figure.querySelector('img'));
    });

    if(!items.length){
      return;
    }

    let lightbox = document.getElementById('lightbox');
    if(!lightbox){
      document.body.insertAdjacentHTML('beforeend', `
        <div class="lightbox" id="lightbox" aria-hidden="true">
          <button type="button" class="close" aria-label="Bild schließen">×</button>
          <button type="button" class="prev" aria-label="Vorheriges Bild">‹</button>
          <img src="" alt="">
          <button type="button" class="next" aria-label="Nächstes Bild">›</button>
        </div>
      `);
      lightbox = document.getElementById('lightbox');
    }

    const lbImg = lightbox.querySelector('img');
    const prev = lightbox.querySelector('.prev');
    const next = lightbox.querySelector('.next');
    const close = lightbox.querySelector('.close');
    let currentIndex = -1;

    function openLightbox(index){
      currentIndex = index;
      const activeImage = items[index];
      if(!activeImage){
        return;
      }
      lbImg.setAttribute('src', activeImage.getAttribute('src'));
      lbImg.setAttribute('alt', activeImage.getAttribute('alt') || '');
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox(){
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
    }

    function prevImg(){
      if(currentIndex <= 0){
        currentIndex = items.length;
      }
      openLightbox((currentIndex - 1) % items.length);
    }

    function nextImg(){
      openLightbox((currentIndex + 1) % items.length);
    }

    triggerEntries.forEach(({ trigger, image, index }) => {
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('role', 'button');
      const openLabel = { de: 'Bild vergr\u00f6\u00dfern', en: 'Enlarge photo', bs: 'Uve\u0107aj fotografiju' }[document.documentElement.lang] || 'Enlarge photo';
      trigger.setAttribute('aria-label', openLabel + ': ' + (image.getAttribute('alt') || ''));
      trigger.addEventListener('click', () => openLightbox(index));
      trigger.addEventListener('keydown', (event) => {
        if(event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    if(items.length < 2){
      prev.hidden = true;
      next.hidden = true;
    }

    close.addEventListener('click', closeLightbox);
    prev.addEventListener('click', prevImg);
    next.addEventListener('click', nextImg);
    lightbox.addEventListener('click', (event) => {
      if(event.target === lightbox){
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if(!lightbox.classList.contains('open')){
        return;
      }
      if(event.key === 'Escape'){
        closeLightbox();
      }
      if(event.key === 'ArrowLeft' && !prev.hidden){
        prevImg();
      }
      if(event.key === 'ArrowRight' && !next.hidden){
        nextImg();
      }
    });
  }

  setupGalleryLightbox();

  if(refs.burger && refs.mobileNav){
    refs.burger.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleMobileNavigation();
    });

    refs.mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNavigation();
      });
    });

    window.addEventListener('resize', () => {
      if(window.innerWidth > 640){
        closeMobileNavigation();
      }
    });
  }

  if(refs.langBtn && refs.langMenu){
    refs.langBtn.addEventListener('click', () => {
      const isOpen = refs.langMenu.classList.contains('open');
      refs.langMenu.classList.toggle('open');
      refs.langBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  }

  refs.langOptions.forEach((option) => {
    option.addEventListener('click', (event) => {
      const selectedLang = option.dataset.lang;
      if(!supportedLangs.includes(selectedLang)){
        return;
      }
      const targetHref = option.getAttribute('href') || buildLocalizedHref(baseFileName, selectedLang);
      const targetPath = targetHref.split('#', 2)[0];
      const targetHash = window.location.hash || '';

      event.preventDefault();
      persistLanguage(selectedLang);
      window.location.href = `${targetPath}${targetHash}`;
    });
  });

  document.addEventListener('click', (event) => {
    if(refs.mobileNav && refs.burger && refs.siteHeaderNav && !refs.siteHeaderNav.contains(event.target)){
      closeMobileNavigation();
    }

    if(!refs.langSwitch || !refs.langMenu || !refs.langBtn){
      return;
    }
    if(!refs.langSwitch.contains(event.target)){
      refs.langMenu.classList.remove('open');
      refs.langBtn.setAttribute('aria-expanded', 'false');
    }
  });
})();
