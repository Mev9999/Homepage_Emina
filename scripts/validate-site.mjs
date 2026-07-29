import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();
const EXPECTED_STARTING_PRICES = ['99', '179', '199', '189', '299', '299'];
const PRICE_PAGES = ['preise.html', 'preise-en.html', 'preise-bs.html'];
const SERVICE_PAGES = [
  'portraitfotografie-graz.html',
  'babybauch-shooting-graz.html',
  'newborn-fotografie-graz.html',
  'familienfotografie-graz.html',
  'babybauch-und-neugeborenen-shooting-graz.html',
  'hochzeitsfotograf-graz.html'
];
const LANGUAGES = ['', '-en', '-bs'];
const errors = [];

function localizedFile(fileName, suffix) {
  return suffix ? fileName.replace(/\.html$/, `${suffix}.html`) : fileName;
}

function report(fileName, message) {
  errors.push(`${fileName}: ${message}`);
}

function localTarget(reference, currentFile) {
  if (!reference || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) {
    return null;
  }

  const [rawPath, fragment = ''] = reference.split('#', 2);
  const withoutQuery = rawPath.split('?', 1)[0];
  const currentDirectory = path.dirname(currentFile);
  let targetPath;

  if (!withoutQuery) {
    targetPath = currentFile;
  } else if (withoutQuery === '/') {
    targetPath = 'index.html';
  } else if (withoutQuery.startsWith('/')) {
    targetPath = withoutQuery.slice(1);
  } else {
    targetPath = path.normalize(path.join(currentDirectory, withoutQuery));
  }

  return {
    path: decodeURIComponent(targetPath.replace(/\\/g, '/')),
    fragment: decodeURIComponent(fragment)
  };
}

async function exists(relativePath) {
  try {
    await fs.access(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

const htmlFiles = (await fs.readdir(ROOT)).filter((fileName) => fileName.endsWith('.html'));
const htmlCache = new Map();
const rootTextFiles = (await fs.readdir(ROOT))
  .filter((fileName) => /\.(?:css|html|js|mjs|xml)$/i.test(fileName));
const scriptTextFiles = (await fs.readdir(path.join(ROOT, 'scripts')))
  .filter((fileName) => /\.(?:js|mjs)$/i.test(fileName))
  .map((fileName) => `scripts/${fileName}`);

for (const fileName of [...rootTextFiles, ...scriptTextFiles]) {
  const text = await fs.readFile(path.join(ROOT, fileName), 'utf8');
  const hasMojibake = /[\u00c3\u00c2\ufffd]|\u00e2(?:\u20ac|\u2122)/u.test(text);
  const hasReplacementQuestionMark = /\b(?:f|daf|w|m)\?r\b|\b\w+\?ber\w*\b/u.test(text);
  if (hasMojibake || hasReplacementQuestionMark) {
    report(fileName, 'contains a suspicious encoding sequence');
  }
}

for (const fileName of htmlFiles) {
  const html = await fs.readFile(path.join(ROOT, fileName), 'utf8');
  const dom = new JSDOM(html);
  htmlCache.set(fileName, { html, document: dom.window.document, dom });

  dom.window.document.querySelectorAll('script[type="application/ld+json"]').forEach((script, index) => {
    try {
      JSON.parse(script.textContent);
    } catch {
      report(fileName, `contains invalid JSON-LD in block ${index + 1}`);
    }
  });
}

for (const [fileName, { document }] of htmlCache) {
  for (const node of document.querySelectorAll('[href], [src]')) {
    const attribute = node.hasAttribute('href') ? 'href' : 'src';
    const reference = node.getAttribute(attribute);
    const target = localTarget(reference, fileName);
    if (!target) {
      continue;
    }

    if (!(await exists(target.path))) {
      report(fileName, `missing local target "${reference}"`);
      continue;
    }

    if (target.fragment && target.path.endsWith('.html')) {
      const targetDocument = htmlCache.get(target.path)?.document;
      if (targetDocument && !targetDocument.getElementById(target.fragment)) {
        report(fileName, `missing anchor "${reference}"`);
      }
    }
  }
}

for (const suffix of LANGUAGES) {
  const homeFile = localizedFile('index.html', suffix);
  const homeDocument = htmlCache.get(homeFile)?.document;
  const homePrices = [...(homeDocument?.querySelectorAll('.pricing > .price .num[data-promo-price]') || [])]
    .slice(0, 6)
    .map((node) => node.dataset.promoPriceAmount);

  if (JSON.stringify(homePrices) !== JSON.stringify(EXPECTED_STARTING_PRICES)) {
    report(homeFile, `unexpected starting prices: ${homePrices.join(', ')}`);
  }

  for (const serviceFile of SERVICE_PAGES) {
    const localized = localizedFile(serviceFile, suffix);
    const serviceDocument = htmlCache.get(localized)?.document;
    const serviceCount = serviceDocument?.querySelectorAll('.services-dropdown .nav-dropdown-menu > a').length;
    if (serviceCount !== SERVICE_PAGES.length) {
      report(localized, `expected ${SERVICE_PAGES.length} service links, found ${serviceCount ?? 0}`);
    }
  }
}

for (const fileName of PRICE_PAGES) {
  const document = htmlCache.get(fileName)?.document;
  const sectionCount = document?.querySelectorAll('.package-section').length;
  const packageCount = document?.querySelectorAll('.package-card').length;
  const overviewCount = document?.querySelectorAll('.price-overview-card').length;

  if (sectionCount !== 6 || packageCount !== 18 || overviewCount !== 6) {
    report(fileName, `expected 6 sections, 18 packages and 6 overview cards; found ${sectionCount}, ${packageCount}, ${overviewCount}`);
  }
}

for (const { dom } of htmlCache.values()) {
  dom.window.close();
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Site validation passed for ${htmlFiles.length} HTML files.`);
}
