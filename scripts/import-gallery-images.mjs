import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const IMPORT_DIR = path.join(ROOT, 'bilder-import');
const PROCESSED_DIR = path.join(IMPORT_DIR, '_verarbeitet');
const RESPONSIVE_DIR = path.join(ROOT, 'responsive');
const RESPONSIVE_WIDTHS = [320, 480, 640, 800];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

const CATEGORIES = {
  babybauch: {
    folder: 'babybauch',
    outputPrefix: 'galerie-babybauch',
    pages: {
      de: 'babybauch-shooting-graz.html',
      en: 'babybauch-shooting-graz-en.html',
      bs: 'babybauch-shooting-graz-bs.html'
    },
    alt: {
      de: 'Babybauchfoto beim Babybauch Shooting in Graz',
      en: 'Maternity photo from a maternity session in Graz',
      bs: 'Fotografija trudnickog fotografisanja u Grazu'
    }
  },
  neugeborene: {
    folder: 'neugeborene',
    outputPrefix: 'galerie-neugeborene',
    pages: {
      de: 'newborn-fotografie-graz.html',
      en: 'newborn-fotografie-graz-en.html',
      bs: 'newborn-fotografie-graz-bs.html'
    },
    alt: {
      de: 'Neugeborenenfoto bei einem Neugeborenen Shooting in Graz',
      en: 'Newborn photo from a newborn session in Graz',
      bs: 'Fotografija novorodjenceta sa fotografisanja u Grazu'
    }
  },
  familie: {
    folder: 'familie',
    outputPrefix: 'galerie-familie',
    pages: {
      de: 'familienfotografie-graz.html',
      en: 'familienfotografie-graz-en.html',
      bs: 'familienfotografie-graz-bs.html'
    },
    alt: {
      de: 'Familienfoto bei einem natuerlichen Familienshooting in Graz',
      en: 'Family photo from a natural family session in Graz',
      bs: 'Porodicna fotografija sa prirodnog fotografisanja u Grazu'
    }
  },
  hochzeit: {
    folder: 'hochzeit',
    outputPrefix: 'galerie-hochzeit',
    pages: {
      de: 'hochzeitsfotograf-graz.html',
      en: 'hochzeitsfotograf-graz-en.html',
      bs: 'hochzeitsfotograf-graz-bs.html'
    },
    alt: {
      de: 'Hochzeitsfoto einer standesamtlichen Trauung oder Feier in Graz',
      en: 'Wedding photo from a civil ceremony or celebration in Graz',
      bs: 'Fotografija vjencanja ili proslave u Grazu'
    }
  }
};

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureImportFolders() {
  await fs.mkdir(IMPORT_DIR, { recursive: true });
  await fs.mkdir(PROCESSED_DIR, { recursive: true });
  await fs.mkdir(RESPONSIVE_DIR, { recursive: true });

  for (const category of Object.values(CATEGORIES)) {
    await fs.mkdir(path.join(IMPORT_DIR, category.folder), { recursive: true });
    await fs.mkdir(path.join(PROCESSED_DIR, category.folder), { recursive: true });
  }
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'foto';
}

async function uniqueOutputName(prefix, originalName) {
  const base = slugify(path.basename(originalName, path.extname(originalName)));
  let candidate = `${prefix}-${base}.webp`;
  let counter = 2;

  while (await pathExists(path.join(ROOT, candidate))) {
    candidate = `${prefix}-${base}-${counter}.webp`;
    counter += 1;
  }

  return candidate;
}

function escapeHtmlAscii(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/[^\x20-\x7E]/g, (char) => `&#${char.codePointAt(0)};`);
}

async function readAltText(imagePath, category) {
  const parsed = path.parse(imagePath);
  const sidecar = path.join(parsed.dir, `${parsed.name}.alt.txt`);

  if (!(await pathExists(sidecar))) {
    return category.alt;
  }

  const raw = await fs.readFile(sidecar, 'utf8');
  const result = { ...category.alt };

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const [lang, ...parts] = trimmed.split('=');
    const key = lang.trim().toLowerCase();
    const text = parts.join('=').trim();

    if (['de', 'en', 'bs'].includes(key) && text) {
      result[key] = text;
    }
  }

  return result;
}

async function createOptimizedImages(inputPath, outputName) {
  const outputPath = path.join(ROOT, outputName);
  const inputBuffer = await fs.readFile(inputPath);
  const base = sharp(inputBuffer).rotate();

  await base
    .resize({
      width: 1600,
      height: 1900,
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 84, effort: 5 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const baseName = path.basename(outputName, '.webp');
  const variants = [];

  for (const responsiveWidth of RESPONSIVE_WIDTHS) {
    if (!width || responsiveWidth >= width) {
      continue;
    }

    const rel = `responsive/${baseName}-${responsiveWidth}w.webp`;
    await sharp(outputPath)
      .resize({ width: responsiveWidth, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(ROOT, rel));
    variants.push({ path: rel, width: responsiveWidth });
  }

  variants.push({ path: outputName, width });

  return {
    src: outputName,
    width,
    height,
    srcset: variants.map((entry) => `${entry.path} ${entry.width}w`).join(', ')
  };
}

function buildFigure(image, alt) {
  const escapedAlt = escapeHtmlAscii(alt);
  const escapedSrc = escapeHtmlAscii(image.src);
  const escapedSrcset = escapeHtmlAscii(image.srcset);

  return `        <figure class="gallery-item" tabindex="0" role="button" aria-label="${escapedAlt} &ouml;ffnen"><img src="${escapedSrc}" width="${image.width}" height="${image.height}" alt="${escapedAlt}" loading="lazy" decoding="async" srcset="${escapedSrcset}" sizes="(max-width: 900px) calc(100vw - 2rem), 320px"></figure>`;
}

async function appendToPage(pageName, figureHtml, imageSrc) {
  const pagePath = path.join(ROOT, pageName);
  let html = await fs.readFile(pagePath, 'utf8');

  if (html.includes(`src="${imageSrc}"`)) {
    return false;
  }

  const galleryPattern = /(<div class="container gallery-grid">\s*)([\s\S]*?)(\n\s*<\/div>\s*\n\s*<\/section>)/;
  const match = html.match(galleryPattern);

  if (!match) {
    throw new Error(`Galerie-Bereich nicht gefunden: ${pageName}`);
  }

  const updatedGallery = `${match[1]}${match[2].trimEnd()}\n${figureHtml}${match[3]}`;
  html = html.replace(galleryPattern, updatedGallery);
  await fs.writeFile(pagePath, html, 'utf8');
  return true;
}

async function validateGalleryPages() {
  const checked = new Set();
  const galleryPattern = /<div class="container gallery-grid">[\s\S]*?\n\s*<\/div>\s*\n\s*<\/section>/;

  for (const category of Object.values(CATEGORIES)) {
    for (const pageName of Object.values(category.pages)) {
      if (checked.has(pageName)) {
        continue;
      }

      const html = await fs.readFile(path.join(ROOT, pageName), 'utf8');
      if (!galleryPattern.test(html)) {
        throw new Error(`Galerie-Bereich nicht gefunden: ${pageName}`);
      }

      checked.add(pageName);
    }
  }
}

async function moveProcessedFile(inputPath, categoryFolder) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.join(PROCESSED_DIR, categoryFolder);
  const target = path.join(targetDir, `${stamp}-${path.basename(inputPath)}`);
  await fs.rename(inputPath, target);

  const parsed = path.parse(inputPath);
  const sidecar = path.join(parsed.dir, `${parsed.name}.alt.txt`);
  if (await pathExists(sidecar)) {
    await fs.rename(sidecar, path.join(targetDir, `${stamp}-${parsed.name}.alt.txt`));
  }
}

async function importCategory(categoryKey, category) {
  const folder = path.join(IMPORT_DIR, category.folder);
  const files = (await fs.readdir(folder))
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'de'));

  if (!files.length) {
    return 0;
  }

  let imported = 0;

  for (const file of files) {
    const inputPath = path.join(folder, file);
    const outputName = await uniqueOutputName(category.outputPrefix, file);
    const alt = await readAltText(inputPath, category);
    const image = await createOptimizedImages(inputPath, outputName);

    for (const [lang, pageName] of Object.entries(category.pages)) {
      await appendToPage(pageName, buildFigure(image, alt[lang] || alt.de), image.src);
    }

    await moveProcessedFile(inputPath, category.folder);
    imported += 1;
    console.log(`[OK] ${file} -> ${outputName} (${categoryKey})`);
  }

  return imported;
}

async function main() {
  await ensureImportFolders();
  await validateGalleryPages();

  let total = 0;
  for (const [categoryKey, category] of Object.entries(CATEGORIES)) {
    total += await importCategory(categoryKey, category);
  }

  if (!total) {
    console.log('Keine neuen Bilder gefunden.');
    console.log(`Lege Fotos in ${IMPORT_DIR}\\babybauch, \\neugeborene, \\familie oder \\hochzeit ab und starte das Script erneut.`);
    return;
  }

  console.log('');
  console.log(`${total} Bild(er) importiert.`);
  console.log('Bitte die Website kurz lokal pruefen und danach pushen.');
}

main().catch((error) => {
  console.error('');
  console.error('[FEHLER] Galerie-Import abgebrochen:');
  console.error(error.message);
  process.exitCode = 1;
});
