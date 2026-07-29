(() => {
  // Update future homepage promotions here.
  const HOME_PROMO_CONFIG = {
    startsAt: '2026-04-08T12:00:00+02:00',
    endsAt: '2026-05-31T23:59:59+02:00',
    priceDiscountRate: 0.5,
    messages: {
      de: {
        badge: 'Neukundenrabatt',
        text: '\u{1F337} Exklusives Willkommensangebot: 50 % Rabatt auf dein erstes Shooting. Nur begrenzte Pl\u00e4tze verf\u00fcgbar. \u2728'
      },
      en: {
        badge: 'New customer discount',
        text: '\u{1F337} Exclusive welcome offer: 50% off your first shoot. Limited spots available. \u2728'
      },
      bs: {
        badge: 'Popust za nove klijente',
        text: '\u{1F337} Ekskluzivna ponuda dobrodo\u0161lice: 50% popusta na tvoje prvo fotografisanje. Ograni\u010den broj termina dostupan. \u2728'
      }
    }
  };

  const PROMO_STYLE_ID = 'homePromoStyles';
  const PROMO_BANNER_ID = 'homePromoBanner';
  const PROMO_PRICE_SELECTOR = '[data-promo-price]';
  const PRICE_PREFIX_BY_LANG = {
    de: 'ab',
    en: 'from',
    bs: 'od'
  };
  let promoTimerId = null;

  function getCurrentLang() {
    const staticLang = (document.documentElement.getAttribute('data-static-lang') || '').toLowerCase();
    const htmlLang = (document.documentElement.lang || '').toLowerCase();

    if (HOME_PROMO_CONFIG.messages[staticLang]) {
      return staticLang;
    }
    if (HOME_PROMO_CONFIG.messages[htmlLang]) {
      return htmlLang;
    }
    return 'de';
  }

  function getPromoWindow() {
    const now = new Date();
    const startsAt = HOME_PROMO_CONFIG.startsAt ? new Date(HOME_PROMO_CONFIG.startsAt) : null;
    const endsAt = HOME_PROMO_CONFIG.endsAt ? new Date(HOME_PROMO_CONFIG.endsAt) : null;
    const isVisible = (!startsAt || now >= startsAt) && (!endsAt || now <= endsAt);

    return { now, startsAt, endsAt, isVisible };
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function parsePriceAmount(value) {
    const normalized = String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalized) {
      return null;
    }

    const knownPrefixes = Array.from(new Set(Object.values(PRICE_PREFIX_BY_LANG)));
    const lowered = normalized.toLowerCase();
    let hasPrefix = false;
    let remainder = normalized;

    for (const candidate of knownPrefixes) {
      const token = `${candidate.toLowerCase()} `;
      if (lowered.startsWith(token)) {
        hasPrefix = true;
        remainder = normalized.slice(candidate.length).trim();
        break;
      }
    }

    const numericValue = remainder.replace(/[^\d.,-]/g, '').replace(',', '.');
    const amount = Number.parseFloat(numericValue);
    if (!Number.isFinite(amount)) {
      return null;
    }

    return { amount, hasPrefix };
  }

  function formatPrice(amount, lang, hasPrefix) {
    const locale =
      lang === 'en' ? 'en-US' :
      lang === 'bs' ? 'bs-BA' :
      'de-AT';

    const fractionDigits = Number.isInteger(amount) ? 0 : 2;
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(amount);

    const prefix = hasPrefix ? (PRICE_PREFIX_BY_LANG[lang] || PRICE_PREFIX_BY_LANG.de) : '';
    if (lang === 'en') {
      return `${prefix ? `${prefix} ` : ''}\u20ac${formattedAmount}`;
    }
    return `${prefix ? `${prefix} ` : ''}${formattedAmount} \u20ac`;
  }

  function ensurePriceData(node) {
    if (node.dataset.promoPriceAmount) {
      return true;
    }

    const parsed = parsePriceAmount(node.textContent);
    if (!parsed) {
      return false;
    }

    node.dataset.promoPriceAmount = String(parsed.amount);
    node.dataset.promoPriceHasPrefix = parsed.hasPrefix ? '1' : '0';
    return true;
  }

  function syncPricingPromo() {
    const { isVisible } = getPromoWindow();
    const lang = getCurrentLang();
    const discountLabel = `-${Math.round(HOME_PROMO_CONFIG.priceDiscountRate * 100)}%`;
    const discountFactor = 1 - HOME_PROMO_CONFIG.priceDiscountRate;

    document.querySelectorAll(PROMO_PRICE_SELECTOR).forEach((node) => {
      if (!ensurePriceData(node)) {
        return;
      }

      const baseAmount = Number.parseFloat(node.dataset.promoPriceAmount || '');
      const hasPrefix = node.dataset.promoPriceHasPrefix === '1';

      if (!Number.isFinite(baseAmount)) {
        return;
      }

      if (!isVisible) {
        node.classList.remove('promo-price');
        node.textContent = formatPrice(baseAmount, lang, hasPrefix);
        return;
      }

      const reducedAmount = Math.round(baseAmount * discountFactor * 100) / 100;
      const originalPriceText = formatPrice(baseAmount, lang, hasPrefix);
      const reducedPriceText = formatPrice(reducedAmount, lang, hasPrefix);

      node.classList.add('promo-price');
      node.innerHTML = [
        `<span class="promo-price-original">${escapeHtml(originalPriceText)}</span>`,
        '<span class="promo-price-sale">',
        `  <span class="promo-price-current">${escapeHtml(reducedPriceText)}</span>`,
        `  <span class="promo-price-chip">${escapeHtml(discountLabel)}</span>`,
        '</span>'
      ].join('');
    });
  }

  function injectStyles() {
    if (document.getElementById(PROMO_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = PROMO_STYLE_ID;
    style.textContent = `
      .promo-banner-wrap {
        background: linear-gradient(90deg, rgba(237, 202, 176, 0.96) 0%, rgba(231, 188, 165, 0.96) 52%, rgba(220, 169, 154, 0.96) 100%);
        border-top: 1px solid rgba(201, 141, 122, 0.16);
        border-bottom: 1px solid rgba(201, 141, 122, 0.18);
        box-shadow: 0 12px 24px rgba(181, 132, 113, 0.12);
      }

      .promo-banner-wrap[hidden] {
        display: none !important;
      }

      .promo-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.85rem;
        flex-wrap: wrap;
        padding: 0.72rem 1rem;
        text-align: center;
        color: #5f453d;
      }

      .promo-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem 0.8rem;
        border-radius: 999px;
        background: rgba(255, 250, 247, 0.82);
        border: 1px solid rgba(255, 255, 255, 0.55);
        box-shadow: 0 8px 18px rgba(169, 118, 100, 0.12);
        color: #a05f51;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .promo-banner-text {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.45;
        max-width: 980px;
      }

      [data-promo-price].promo-price {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.52rem;
        line-height: 1.18;
      }

      .promo-price-original {
        color: #c85f69;
        text-decoration: line-through;
        text-decoration-color: #d96570;
        text-decoration-thickness: 3px;
        text-decoration-skip-ink: none;
      }

      .promo-price-sale {
        display: inline-flex;
        align-items: center;
        gap: 0.48rem;
        flex-wrap: wrap;
      }

      .promo-price-current {
        color: #342725;
        font-weight: 900;
      }

      .promo-price-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.22rem 0.56rem;
        border-radius: 999px;
        background: linear-gradient(180deg, #d97a85 0%, #c86472 100%);
        box-shadow: 0 10px 24px rgba(201, 100, 114, 0.16);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.02em;
        line-height: 1;
        white-space: nowrap;
      }

      @media (max-width: 640px) {
        .promo-banner {
          gap: 0.5rem;
          padding: 0.78rem 1rem;
        }

        .promo-badge {
          font-size: 0.66rem;
          letter-spacing: 0.11em;
          padding: 0.32rem 0.68rem;
        }

        .promo-banner-text {
          font-size: 0.84rem;
          line-height: 1.5;
          max-width: 34ch;
        }

        .promo-price-chip {
          font-size: 0.68rem;
          padding: 0.2rem 0.5rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function ensureBanner() {
    let banner = document.getElementById(PROMO_BANNER_ID);
    if (banner) {
      return banner;
    }

    const header = document.querySelector('header.site, header.site-header');
    if (!header) {
      return null;
    }

    banner = document.createElement('div');
    banner.id = PROMO_BANNER_ID;
    banner.className = 'promo-banner-wrap';
    banner.hidden = true;
    banner.innerHTML = [
      '<div class="promo-banner site-shell" role="status" aria-live="polite">',
      '  <span class="promo-badge" id="homePromoBadge"></span>',
      '  <p class="promo-banner-text" id="homePromoText"></p>',
      '</div>'
    ].join('');

    header.insertAdjacentElement('afterend', banner);
    return banner;
  }

  function renderBanner() {
    const banner = ensureBanner();
    if (!banner) {
      return;
    }

    const lang = getCurrentLang();
    const message = HOME_PROMO_CONFIG.messages[lang] || HOME_PROMO_CONFIG.messages.de;
    const badge = banner.querySelector('#homePromoBadge');
    const text = banner.querySelector('#homePromoText');

    if (badge) {
      badge.textContent = message.badge;
    }

    if (text) {
      text.textContent = message.text;
    }
  }

  function syncBannerVisibility() {
    const banner = ensureBanner();
    if (!banner) {
      return;
    }

    if (promoTimerId) {
      window.clearTimeout(promoTimerId);
      promoTimerId = null;
    }

    const { now, startsAt, endsAt, isVisible } = getPromoWindow();

    banner.hidden = !isVisible;
    syncPricingPromo();

    const nextChanges = [startsAt, endsAt]
      .filter(date => date instanceof Date && !Number.isNaN(date.getTime()) && date.getTime() > now.getTime())
      .map(date => date.getTime());

    if (nextChanges.length) {
      const nextDelay = Math.max(1000, Math.min(...nextChanges) - now.getTime() + 1000);
      promoTimerId = window.setTimeout(syncBannerVisibility, nextDelay);
    }
  }

  function observeLanguageChanges() {
    const observer = new MutationObserver(() => {
      renderBanner();
      syncPricingPromo();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'data-static-lang']
    });
  }

  function observePriceTargets() {
    if (!document.body) {
      return;
    }

    const observer = new MutationObserver(() => {
      syncPricingPromo();
    });

    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-promo-price']
    });
  }

  function init() {
    injectStyles();
    renderBanner();
    syncBannerVisibility();
    observeLanguageChanges();
    observePriceTargets();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
