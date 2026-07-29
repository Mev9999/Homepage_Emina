import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';
import sharp from 'sharp';

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://liza-memories-photography.com/';
const RENDER_PAGES = [
  'index.html',
  'index-en.html',
  'index-bs.html',
  'ueber-mich.html',
  'ueber-mich-en.html',
  'ueber-mich-bs.html',
  'portraitfotografie-graz.html',
  'portraitfotografie-graz-en.html',
  'portraitfotografie-graz-bs.html',
  'babybauch-shooting-graz.html',
  'babybauch-shooting-graz-en.html',
  'babybauch-shooting-graz-bs.html',
  'newborn-fotografie-graz.html',
  'newborn-fotografie-graz-en.html',
  'newborn-fotografie-graz-bs.html',
  'familienfotografie-graz.html',
  'familienfotografie-graz-en.html',
  'familienfotografie-graz-bs.html',
  'hochzeitsfotograf-graz.html',
  'hochzeitsfotograf-graz-en.html',
  'hochzeitsfotograf-graz-bs.html',
  'babybauch-und-neugeborenen-shooting-graz.html',
  'babybauch-und-neugeborenen-shooting-graz-en.html',
  'babybauch-und-neugeborenen-shooting-graz-bs.html',
  'preise.html',
  'preise-en.html',
  'preise-bs.html'
];
const ALL_HTML = [
  ...RENDER_PAGES,
  'impressum.html',
  'impressum-en.html',
  'impressum-bs.html',
  'datenschutz.html',
  'datenschutz-en.html',
  'datenschutz-bs.html',
  'agb.html',
  'agb-en.html',
  'agb-bs.html'
];
const LOCAL_IMAGE_PATTERN = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const IMAGE_WIDTHS = [320, 480, 640, 800];
const RESPONSIVE_DIR = 'responsive';
const SOCIAL_DIR = 'social';
const OG_IMAGE_REL = `${SOCIAL_DIR}/og-share-20.jpg`;
const OSM_GEO = { latitude: 47.0335704, longitude: 15.3952469 };
const HAS_MAP_URL = 'https://maps.app.goo.gl/Absk5FRMgyCuUwxe9';
const HEAD_TAGS = new Set(['META', 'TITLE', 'LINK', 'STYLE', 'SCRIPT', 'BASE']);
const BUSINESS_DETAILS = {
  '@type': 'ProfessionalService',
  name: 'LiZa Memories Photography',
  telephone: '+4368181942780',
  email: 'info@liza-memories-photography.com',
  url: SITE_ORIGIN,
  sameAs: ['https://instagram.com/liza.memories.photography'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mela-Spira-Str. 32b',
    postalCode: '8054',
    addressLocality: 'Graz',
    addressCountry: 'AT'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: OSM_GEO.latitude,
    longitude: OSM_GEO.longitude
  },
  hasMap: HAS_MAP_URL
};

class LocalResourceLoader extends ResourceLoader {
  async fetch(url) {
    if (!url) {
      return null;
    }

    if (url.startsWith('https://fonts.googleapis.com') || url.startsWith('https://fonts.gstatic.com')) {
      return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      const siteUrl = new URL(url);
      const origin = new URL(SITE_ORIGIN);
      if (siteUrl.origin !== origin.origin) {
        return null;
      }
      const pathname = siteUrl.pathname === '/' ? '/index.html' : siteUrl.pathname;
      const localPath = path.join(ROOT, decodeURIComponent(pathname.replace(/^\//, '')));
      return fs.readFile(localPath);
    }

    if (url.startsWith('file://')) {
      return fs.readFile(fileURLToPath(url));
    }

    return null;
  }
}

function escapeXml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function getPageLang(fileName) {
  if (/-en\.html$/i.test(fileName)) {
    return 'en';
  }
  if (/-bs\.html$/i.test(fileName)) {
    return 'bs';
  }
  return 'de';
}

function publicPathFor(fileName) {
  if (fileName === 'index.html') {
    return '';
  }
  return fileName;
}

function absoluteUrl(relativePath) {
  return new URL(relativePath, SITE_ORIGIN).toString();
}

function isLocalImage(src) {
  return src && LOCAL_IMAGE_PATTERN.test(src) && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('//') && !src.startsWith('data:');
}

function isContentImage(src) {
  return isLocalImage(src) && !/logo-liza\.png$/i.test(src) && !src.startsWith(`${SOCIAL_DIR}/`);
}

function getSizesForImage(img) {
  if (img.closest('.insta-grid')) {
    return '(max-width: 640px) calc((100vw - 2.6rem) / 2), (max-width: 1000px) calc((100vw - 3.2rem) / 3), 180px';
  }
  if (img.closest('.session-stories-grid')) {
    return '(max-width: 900px) calc(100vw - 2rem), 390px';
  }
  if (img.closest('.hero-visual')) {
    return '(max-width: 900px) calc(100vw - 2rem), 36vw';
  }
  if (img.closest('.hero .art')) {
    return '(max-width: 900px) calc(100vw - 2rem), 38vw';
  }
  if (img.closest('.story-band-main')) {
    return '(max-width: 900px) calc(100vw - 2rem), 760px';
  }
  if (img.closest('.story-band-stack')) {
    return '(max-width: 900px) calc(100vw - 2rem), 400px';
  }
  if (img.closest('.gallery-grid')) {
    return '(max-width: 900px) calc(100vw - 2rem), 320px';
  }
  if (img.closest('.masonry') || img.closest('#gallery')) {
    return '(max-width: 700px) calc(100vw - 2rem), (max-width: 980px) calc((100vw - 3rem) / 2), 390px';
  }
  if (img.closest('.about .portrait')) {
    return '(max-width: 900px) calc(100vw - 2rem), 32vw';
  }
  return '(max-width: 900px) calc(100vw - 2rem), 400px';
}

function setMeta(document, selector, content, attribute = 'content') {
  let node = document.querySelector(selector);
  if (!node) {
    const meta = document.createElement('meta');
    if (selector.includes('property=')) {
      const property = selector.match(/property="([^"]+)"/)?.[1];
      if (property) {
        meta.setAttribute('property', property);
      }
    } else {
      const name = selector.match(/name="([^"]+)"/)?.[1];
      if (name) {
        meta.setAttribute('name', name);
      }
    }
    document.head.appendChild(meta);
    node = meta;
  }
  node.setAttribute(attribute, content);
}

function removeLeadingBom(value = '') {
  return value.replace(/^\uFEFF/, '');
}

function isWhitespaceNode(node) {
  return node.nodeType === 3 && !node.textContent.replace(/\uFEFF/g, '').trim();
}

function isHeadOnlyNode(node) {
  return node.nodeType === 1 && HEAD_TAGS.has(node.tagName);
}

function normalizeDocumentStructure(document) {
  let contentReached = false;

  for (const node of Array.from(document.body.childNodes)) {
    if (contentReached) {
      break;
    }

    if (node.nodeType === 8 || isWhitespaceNode(node)) {
      node.remove();
      continue;
    }

    if (isHeadOnlyNode(node)) {
      document.head.appendChild(node);
      continue;
    }

    contentReached = true;
  }

  for (const parent of [document.head, document.body]) {
    for (const node of Array.from(parent.childNodes)) {
      if (isWhitespaceNode(node)) {
        node.remove();
      } else if (node.nodeType === 3 && node.textContent.includes('\uFEFF')) {
        node.textContent = node.textContent.replace(/\uFEFF/g, '');
      }
    }
  }

  let charset = document.head.querySelector('meta[charset]');
  if (!charset) {
    charset = document.createElement('meta');
    charset.setAttribute('charset', 'utf-8');
  }
  document.head.prepend(charset);

  const viewport = document.head.querySelector('meta[name="viewport"]');
  if (viewport && charset.nextSibling !== viewport) {
    charset.after(viewport);
  }
}

function dedupeSchemaBlocks(document) {
  const seenKeys = new Set();

  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    const key = script.getAttribute('data-schema-key');
    if (!key) {
      return;
    }
    if (seenKeys.has(key)) {
      script.remove();
      return;
    }
    seenKeys.add(key);
  });
}

function serializeDocument(dom) {
  const html = dom.window.document.documentElement.outerHTML;
  return `<!DOCTYPE html>\n${html}\n`;
}

function upsertAlternateLinks(document, fileName) {
  const fileBase = fileName.replace(/-(en|bs)\.html$/i, '.html');
  const hrefs = {
    de: absoluteUrl(publicPathFor(fileBase)),
    en: absoluteUrl(fileBase.replace(/\.html$/i, '-en.html')),
    bs: absoluteUrl(fileBase.replace(/\.html$/i, '-bs.html')),
    'x-default': absoluteUrl(publicPathFor(fileBase))
  };

  document.querySelectorAll('link[rel="alternate"]').forEach((link) => link.remove());

  for (const [lang, href] of Object.entries(hrefs)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', href);
    document.head.appendChild(link);
  }
}

function setCanonical(document, fileName) {
  const canonicalHref = absoluteUrl(publicPathFor(fileName));
  document.querySelectorAll('link[rel="canonical"]').forEach((link) => link.remove());

  const canonical = document.createElement('link');
  canonical.setAttribute('rel', 'canonical');
  document.head.appendChild(canonical);
  canonical.setAttribute('href', canonicalHref);
  return canonicalHref;
}

function updateJsonLd(document, fileName) {
  const heroImage = document.querySelector('.hero-visual img, .hero .art img');
  const heroImageUrl = heroImage && isLocalImage(heroImage.getAttribute('src'))
    ? absoluteUrl(heroImage.getAttribute('src'))
    : absoluteUrl('hero-bild.webp');
  const pageUrl = absoluteUrl(publicPathFor(fileName));

  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const payload = JSON.parse(script.textContent);

      if (payload['@graph']) {
        const business = payload['@graph'].find((entry) => entry['@type'] === 'ProfessionalService');
        if (business) {
          business.url = pageUrl;
          business.geo = BUSINESS_DETAILS.geo;
          business.hasMap = BUSINESS_DETAILS.hasMap;
          business.image = Array.from(new Set([
            ...(Array.isArray(business.image) ? business.image : business.image ? [business.image] : []),
            absoluteUrl('hero-bild.webp'),
            absoluteUrl('13.webp'),
            absoluteUrl('33.webp')
          ]));
        }
        script.textContent = JSON.stringify(payload);
        return;
      }

      if (payload['@type'] === 'Person') {
        payload.image = heroImageUrl;
        payload.worksFor = {
          ...BUSINESS_DETAILS,
          image: heroImageUrl
        };
        script.textContent = JSON.stringify(payload);
        return;
      }

      if (payload['@type'] === 'Service') {
        payload.image = heroImageUrl;
        payload.provider = {
          ...BUSINESS_DETAILS,
          image: heroImageUrl
        };
        script.textContent = JSON.stringify(payload);
      }
    } catch (_error) {
      // Keep invalid or unrelated JSON-LD untouched.
    }
  });
}

function updateSocialMeta(document, fileName) {
  const isHome = /^index(?:-(en|bs))?\.html$/i.test(fileName);
  const heroImage = document.querySelector('.hero-visual img, .hero .art img');
  const heroImageSrc = heroImage && isLocalImage(heroImage.getAttribute('src'))
    ? absoluteUrl(heroImage.getAttribute('src'))
    : absoluteUrl('hero-bild.webp');
  const heroAlt = heroImage?.getAttribute('alt') || 'LiZa Memories Photography';
  const imageHref = isHome ? absoluteUrl(OG_IMAGE_REL) : heroImageSrc;
  const imageWidth = isHome ? '1200' : (heroImage?.getAttribute('width') || '1000');
  const imageHeight = isHome ? '630' : (heroImage?.getAttribute('height') || '667');

  setMeta(document, 'meta[property="og:image"]', imageHref);
  setMeta(document, 'meta[property="og:image:width"]', imageWidth);
  setMeta(document, 'meta[property="og:image:height"]', imageHeight);
  setMeta(document, 'meta[property="og:image:alt"]', heroAlt);
  setMeta(document, 'meta[name="twitter:card"]', 'summary_large_image');
  setMeta(document, 'meta[name="twitter:image"]', imageHref);
  setMeta(document, 'meta[property="og:url"]', absoluteUrl(publicPathFor(fileName)));
}

function applyResponsiveImages(document, variantMap, fileName) {
  const isHomePage = /^index(?:-(en|bs))?\.html$/i.test(fileName);

  document.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!isContentImage(src)) {
      return;
    }

    if (isHomePage && (img.closest('.masonry') || img.closest('.story-band-grid'))) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      return;
    }

    const variants = variantMap.get(src);
    if (!variants || !variants.length) {
      return;
    }

    const srcset = variants
      .map((variant) => `${variant.path} ${variant.width}w`)
      .join(', ');

    img.setAttribute('srcset', srcset);
    img.setAttribute('sizes', getSizesForImage(img));
  });

  document.querySelectorAll('link[rel="preload"][as="image"]').forEach((link) => {
    const href = link.getAttribute('href');
    const heroImg = document.querySelector(`img[src="${href}"]`);
    if (!heroImg) {
      return;
    }
    const srcset = heroImg.getAttribute('srcset');
    const sizes = heroImg.getAttribute('sizes');
    if (srcset && sizes) {
      link.setAttribute('imagesrcset', srcset);
      link.setAttribute('imagesizes', sizes);
    }
  });
}

function collectImageEntries(document) {
  const entries = [];
  const seen = new Set();

  document.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!isContentImage(src) || seen.has(src)) {
      return;
    }
    seen.add(src);
    entries.push({
      src,
      title: img.getAttribute('alt') || ''
    });
  });

  return entries;
}

async function isOutputCurrent(outputPath, inputPaths) {
  try {
    const output = await fs.stat(outputPath);
    const inputs = await Promise.all(inputPaths.map((inputPath) => fs.stat(inputPath)));
    return inputs.every((input) => input.mtimeMs <= output.mtimeMs);
  } catch {
    return false;
  }
}

async function buildResponsiveImages() {
  const imageRefs = new Set();

  for (const fileName of ALL_HTML) {
    const html = removeLeadingBom(await fs.readFile(path.join(ROOT, fileName), 'utf8'));
    const matches = html.matchAll(/<img[^>]+src="([^"]+)"/gi);
    for (const match of matches) {
      const src = match[1];
      if (isContentImage(src)) {
        imageRefs.add(src);
      }
    }
  }

  await fs.mkdir(path.join(ROOT, RESPONSIVE_DIR), { recursive: true });
  const variantMap = new Map();

  for (const src of imageRefs) {
    const inputPath = path.join(ROOT, src);
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width || 0;
    const extension = path.extname(src).toLowerCase();
    const baseName = path.basename(src, extension);
    const variants = [];

    for (const width of IMAGE_WIDTHS) {
      if (!originalWidth || width >= originalWidth) {
        continue;
      }

      const outputRel = `${RESPONSIVE_DIR}/${baseName}-${width}w${extension}`;
      const outputPath = path.join(ROOT, outputRel);
      if (!(await isOutputCurrent(outputPath, [inputPath]))) {
        const pipeline = sharp(inputPath).resize({ width, withoutEnlargement: true });

        if (extension === '.webp') {
          await pipeline.webp({ quality: 82 }).toFile(outputPath);
        } else if (extension === '.png') {
          await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
        } else {
          await pipeline.jpeg({ quality: 84, mozjpeg: true }).toFile(outputPath);
        }
      }

      variants.push({ path: outputRel.replace(/\\/g, '/'), width });
    }

    variants.push({ path: src, width: originalWidth || IMAGE_WIDTHS.at(-1) });
    variantMap.set(src, variants.sort((a, b) => a.width - b.width));
  }

  return variantMap;
}

async function createOgShareImage() {
  const outputPath = path.join(ROOT, OG_IMAGE_REL);
  const collageImages = ['33.webp', 'hero-bild.webp', '1.webp', '20.webp', 'DSC02070.webp', '24.webp'];
  const collagePaths = collageImages.map((image) => path.join(ROOT, image));
  if (await isOutputCurrent(outputPath, collagePaths)) {
    return;
  }

  await fs.mkdir(path.join(ROOT, SOCIAL_DIR), { recursive: true });
  const containedImages = new Set(['1.webp', 'DSC02070.webp']);
  const tileWidth = 386;
  const tileHeight = 300;
  const gap = 10;
  const composites = [];

  for (const [index, image] of collageImages.entries()) {
    const left = gap + (index % 3) * (tileWidth + gap);
    const top = gap + Math.floor(index / 3) * (tileHeight + gap);
    const imagePath = path.join(ROOT, image);
    let input;

    if (containedImages.has(image)) {
      const background = await sharp(imagePath)
        .resize(tileWidth, tileHeight, { fit: 'cover', position: 'centre' })
        .blur(18)
        .composite([{
          input: Buffer.from(`<svg width="${tileWidth}" height="${tileHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f4e2d8" opacity="0.18"/></svg>`)
        }])
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();

      const foreground = await sharp(imagePath)
        .resize(tileWidth - 16, tileHeight - 16, {
          fit: 'contain',
          background: { r: 244, g: 226, b: 216, alpha: 0 }
        })
        .png()
        .toBuffer();

      input = await sharp(background)
        .composite([{ input: foreground, gravity: 'centre' }])
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
    } else {
      input = await sharp(imagePath)
        .resize(tileWidth, tileHeight, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer();
    }

    composites.push({ input, left, top });
  }

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: '#f4e2d8'
    }
  })
    .composite(composites)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);
}

async function renderPage(fileName) {
  let html = removeLeadingBom(await fs.readFile(path.join(ROOT, fileName), 'utf8'));
  html = html.replace(/\sdata-static-lang="(de|en|bs)"/gi, '');

  const virtualConsole = new VirtualConsole();
  virtualConsole.on('error', () => {});
  virtualConsole.on('warn', () => {});

  const dom = new JSDOM(html, {
    url: absoluteUrl(publicPathFor(fileName)),
    resources: new LocalResourceLoader(),
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
      window.matchMedia = window.matchMedia || (() => ({
        matches: false,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {}
      }));
      window.requestAnimationFrame = (callback) => setTimeout(callback, 0);
      window.cancelAnimationFrame = (handle) => clearTimeout(handle);
      window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
      window.open = () => null;
    }
  });

  await Promise.race([
    new Promise((resolve) => dom.window.addEventListener('load', () => setTimeout(resolve, 80), { once: true })),
    new Promise((resolve) => setTimeout(resolve, 2500))
  ]);

  return dom;
}

function applyStaticPagePostProcessing(dom, fileName, variantMap) {
  const { document } = dom.window;
  const lang = getPageLang(fileName);
  normalizeDocumentStructure(document);
  dedupeSchemaBlocks(document);
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-static-lang', lang);

  setCanonical(document, fileName);
  upsertAlternateLinks(document, fileName);
  updateSocialMeta(document, fileName);
  updateJsonLd(document, fileName);
  applyResponsiveImages(document, variantMap, fileName);
}

function buildImageSitemap(entriesByPage) {
  const items = Array.from(entriesByPage.entries()).map(([fileName, images]) => {
    const imageXml = images.map((image) => `
    <image:image>
      <image:loc>${escapeXml(absoluteUrl(image.src))}</image:loc>${image.title ? `
      <image:title>${escapeXml(image.title)}</image:title>` : ''}
    </image:image>`).join('');

    return `  <url>
    <loc>${escapeXml(absoluteUrl(publicPathFor(fileName)))}</loc>${imageXml}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${items}
</urlset>
`;
}

function buildPageSitemap() {
  const lastModified = new Date().toISOString().slice(0, 10);
  const groupedPages = new Map();

  for (const fileName of RENDER_PAGES) {
    const baseFile = fileName.replace(/-(en|bs)\.html$/i, '.html');
    if (!groupedPages.has(baseFile)) {
      groupedPages.set(baseFile, new Set());
    }
    groupedPages.get(baseFile).add(fileName);
  }

  const entries = RENDER_PAGES.map((fileName) => {
    const baseFile = fileName.replace(/-(en|bs)\.html$/i, '.html');
    const variants = groupedPages.get(baseFile) || new Set();
    const alternates = [
      ['de', baseFile],
      ['en', baseFile.replace(/\.html$/i, '-en.html')],
      ['bs', baseFile.replace(/\.html$/i, '-bs.html')]
    ]
      .filter(([, variant]) => variants.has(variant))
      .map(([lang, variant]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(absoluteUrl(publicPathFor(variant)))}" />`)
      .join('\n');
    const defaultLink = variants.has(baseFile)
      ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(publicPathFor(baseFile)))}" />`
      : '';

    return `  <url>
    <loc>${escapeXml(absoluteUrl(publicPathFor(fileName)))}</loc>
    <lastmod>${lastModified}</lastmod>
${alternates}${defaultLink}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

async function updateRobots() {
  const robotsPath = path.join(ROOT, 'robots.txt');
  let robots = await fs.readFile(robotsPath, 'utf8');
  if (!robots.includes('image-sitemap.xml')) {
    robots = `${robots.trimEnd()}\nSitemap: ${SITE_ORIGIN}image-sitemap.xml\n`;
    await fs.writeFile(robotsPath, robots, 'utf8');
  }
}

async function main() {
  await fs.writeFile(path.join(ROOT, '.nojekyll'), '', 'utf8');
  await createOgShareImage();
  const variantMap = await buildResponsiveImages();
  const imageEntriesByPage = new Map();

  for (const fileName of RENDER_PAGES) {
    const dom = await renderPage(fileName);
    applyStaticPagePostProcessing(dom, fileName, variantMap);
    imageEntriesByPage.set(fileName, collectImageEntries(dom.window.document));
    await fs.writeFile(path.join(ROOT, fileName), serializeDocument(dom), 'utf8');
    dom.window.close();
  }

  const imageSitemap = buildImageSitemap(imageEntriesByPage);
  await fs.writeFile(path.join(ROOT, 'image-sitemap.xml'), imageSitemap, 'utf8');
  await fs.writeFile(path.join(ROOT, 'sitemap.xml'), buildPageSitemap(), 'utf8');
  await updateRobots();
}

await main();
