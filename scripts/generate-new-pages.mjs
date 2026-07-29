import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();
const LANGUAGES = ['de', 'en', 'bs'];
const SITE_ORIGIN = 'https://liza-memories-photography.com/';

const serviceLinks = [
  { key: 'portrait', file: 'portraitfotografie-graz.html' },
  { key: 'maternity', file: 'babybauch-shooting-graz.html' },
  { key: 'newborn', file: 'newborn-fotografie-graz.html' },
  { key: 'family', file: 'familienfotografie-graz.html' },
  { key: 'combo', file: 'babybauch-und-neugeborenen-shooting-graz.html' },
  { key: 'wedding', file: 'hochzeitsfotograf-graz.html' }
];

const copy = {
  de: {
    pageTitle: 'Pakete & Preise | LiZa Memories Photography',
    metaDescription: 'Alle Pakete und Preise für Portrait-, Babybauch-, Neugeborenen-, Familien- und Hochzeitsfotografie in Graz transparent im Überblick.',
    navServices: {
      portrait: 'Portrait',
      maternity: 'Babybauch',
      newborn: 'Neugeborene',
      family: 'Familie',
      combo: 'Babybauch & Neugeborene',
      wedding: 'Hochzeit'
    },
    breadcrumbHome: 'Startseite',
    breadcrumbCurrent: 'Pakete & Preise',
    eyebrow: 'Transparent & übersichtlich',
    title: 'Pakete & Preise',
    lead: 'Wählt den Bereich, der zu euch passt, und vergleicht Bronze, Silber und Gold ganz in Ruhe. Alle Leistungen und Preisvorteile sind klar angeführt, damit ihr genau wisst, was in eurem Paket enthalten ist.',
    inquiry: 'Jetzt anfragen',
    overview: 'Schnellübersicht',
    overviewText: 'Die günstigsten Pakete aller Bereiche auf einen Blick.',
    from: 'ab',
    details: 'Pakete ansehen',
    serviceDetails: 'Mehr zur Leistung',
    packageInquiry: 'Paket anfragen',
    savings: 'Euer Vorteil',
    tiers: { bronze: 'Bronze', silver: 'Silber', gold: 'Gold' },
    extraTitle: 'Zusatzpreise & wichtige Hinweise',
    extraCards: [
      { title: 'Zusätzliche Bilder', text: 'Ein zusätzlich bearbeitetes Bild kostet 15 €. Vorteilspakete: 5 Bilder für 60 € oder 10 Bilder für 100 €.' },
      { title: 'Individuelle Wünsche', text: 'Weitere Bilder, längere Begleitungen und individuell zusammengestellte Pakete sind nach Absprache jederzeit möglich.' },
      { title: 'Preishinweis', text: 'Alle Preise sind umsatzsteuerfrei gemäß § 6 Abs. 1 Z 27 UStG. Anfahrtskosten außerhalb von Graz werden individuell berechnet.' }
    ],
    finalTitle: 'Noch unsicher, welches Paket passt?',
    finalText: 'Schreibt mir kurz, was ihr euch wünscht. Ich helfe euch gerne dabei, das passende Paket für eure Erinnerungen auszuwählen.',
    finalButton: 'Persönlich beraten lassen'
  },
  en: {
    pageTitle: 'Packages & Pricing | LiZa Memories Photography',
    metaDescription: 'Transparent packages and pricing for portrait, maternity, newborn, family and wedding photography in Graz.',
    navServices: {
      portrait: 'Portrait',
      maternity: 'Maternity',
      newborn: 'Newborn',
      family: 'Family',
      combo: 'Maternity & Newborn',
      wedding: 'Wedding'
    },
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Packages & Pricing',
    eyebrow: 'Transparent & easy to compare',
    title: 'Packages & Pricing',
    lead: 'Choose the photography experience that suits you and compare Bronze, Silver and Gold at your own pace. Every inclusion and package advantage is listed clearly, so you know exactly what you receive.',
    inquiry: 'Inquire now',
    overview: 'Quick overview',
    overviewText: 'The entry price for every photography category at a glance.',
    from: 'from',
    details: 'View packages',
    serviceDetails: 'Explore the service',
    packageInquiry: 'Inquire about this package',
    savings: 'Your advantage',
    tiers: { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' },
    extraTitle: 'Additional pricing & important notes',
    extraCards: [
      { title: 'Additional images', text: 'One additional edited image costs €15. Bundle options: 5 images for €60 or 10 images for €100.' },
      { title: 'Individual requests', text: 'Additional images, longer coverage and individually tailored packages are always possible by arrangement.' },
      { title: 'Pricing note', text: 'All prices are VAT-exempt under § 6 para. 1 no. 27 UStG. Travel costs outside Graz are calculated individually.' }
    ],
    finalTitle: 'Not sure which package suits you?',
    finalText: 'Send me a short message about what you have in mind. I will gladly help you choose the right package for your memories.',
    finalButton: 'Get personal guidance'
  },
  bs: {
    pageTitle: 'Paketi & cijene | LiZa Memories Photography',
    metaDescription: 'Pregledni paketi i cijene za portretno, trudničko, fotografisanje novorođenčadi, porodica i vjenčanja u Grazu.',
    navServices: {
      portrait: 'Portret',
      maternity: 'Trudničko',
      newborn: 'Novorođenčad',
      family: 'Porodica',
      combo: 'Trudničko & novorođenče',
      wedding: 'Vjenčanje'
    },
    breadcrumbHome: 'Početna',
    breadcrumbCurrent: 'Paketi & cijene',
    eyebrow: 'Transparentno & pregledno',
    title: 'Paketi & cijene',
    lead: 'Odaberite vrstu fotografisanja koja vam odgovara i u miru uporedite bronzani, srebrni i zlatni paket. Sve usluge i pogodnosti jasno su navedene kako biste tačno znali šta je uključeno.',
    inquiry: 'Pošalji upit',
    overview: 'Brzi pregled',
    overviewText: 'Početne cijene svih vrsta fotografisanja na jednom mjestu.',
    from: 'od',
    details: 'Pogledaj pakete',
    serviceDetails: 'Više o usluzi',
    packageInquiry: 'Pošalji upit za paket',
    savings: 'Vaša pogodnost',
    tiers: { bronze: 'Bronza', silver: 'Srebro', gold: 'Zlato' },
    extraTitle: 'Dodatne cijene & važne napomene',
    extraCards: [
      { title: 'Dodatne fotografije', text: 'Jedna dodatno obrađena fotografija košta 15 €. Paket ponude: 5 fotografija za 60 € ili 10 fotografija za 100 €.' },
      { title: 'Individualne želje', text: 'Dodatne fotografije, duža pratnja i individualno prilagođeni paketi uvijek su mogući po dogovoru.' },
      { title: 'Napomena o cijenama', text: 'Sve cijene su oslobođene PDV-a prema § 6 st. 1 br. 27 UStG. Putni troškovi izvan Graza obračunavaju se individualno.' }
    ],
    finalTitle: 'Niste sigurni koji paket vam odgovara?',
    finalText: 'Napišite mi ukratko šta želite. Rado ću vam pomoći da odaberete odgovarajući paket za vaše uspomene.',
    finalButton: 'Zatraži lični savjet'
  }
};

const categories = [
  {
    id: 'portrait',
    serviceKey: 'portrait',
    start: 99,
    title: { de: 'Portraitshooting', en: 'Portrait Session', bs: 'Portretno fotografisanje' },
    intro: {
      de: 'Persönliche Portraits mit ruhiger Anleitung und unterschiedlichen Bildlooks.',
      en: 'Personal portraits with calm guidance and a choice of image looks.',
      bs: 'Lični portreti uz mirno vođenje i različite izglede fotografija.'
    },
    packages: [
      {
        tier: 'bronze',
        price: 99,
        name: { de: 'Kleine Erinnerung', en: 'Small Memory', bs: 'Mala uspomena' },
        details: {
          de: ['20 Minuten', '3 bearbeitete Bilder', '1 Outfit', '1 Bildlook'],
          en: ['20 minutes', '3 edited images', '1 outfit', '1 image look'],
          bs: ['20 minuta', '3 obrađene fotografije', '1 outfit', '1 izgled fotografije']
        }
      },
      {
        tier: 'silver',
        price: 119,
        name: { de: 'Lieblingsmomente', en: 'Favorite Moments', bs: 'Omiljeni trenuci' },
        details: {
          de: ['20 Minuten', '5 bearbeitete Bilder', '1 Outfit', '1 Bildlook'],
          en: ['20 minutes', '5 edited images', '1 outfit', '1 image look'],
          bs: ['20 minuta', '5 obrađenih fotografija', '1 outfit', '1 izgled fotografije']
        },
        saving: {
          de: '10 € günstiger als Bronze plus 2 zusätzliche Bilder.',
          en: '€10 less than Bronze plus 2 additional images.',
          bs: '10 € povoljnije od bronzanog paketa uz 2 dodatne fotografije.'
        }
      },
      {
        tier: 'gold',
        price: 154,
        name: { de: 'Portrait Vielfalt', en: 'Portrait Variety', bs: 'Raznolikost portreta' },
        details: {
          de: ['30 Minuten', '8 bearbeitete Bilder', 'Bis zu 2 Outfits', 'Verschiedene Bildvarianten'],
          en: ['30 minutes', '8 edited images', 'Up to 2 outfits', 'Different image variations'],
          bs: ['30 minuta', '8 obrađenih fotografija', 'Do 2 outfita', 'Različite varijante fotografija']
        },
        saving: {
          de: '10 € günstiger als Silber plus 3 zusätzliche Bilder.',
          en: '€10 less than Silver plus 3 additional images.',
          bs: '10 € povoljnije od srebrnog paketa uz 3 dodatne fotografije.'
        }
      }
    ]
  },
  {
    id: 'babybauch',
    serviceKey: 'maternity',
    start: 179,
    title: { de: 'Babybauchshooting', en: 'Maternity Session', bs: 'Trudničko fotografisanje' },
    intro: {
      de: 'Von einer kleinen Erinnerung bis zur vielseitigen Babybauchserie mit der ganzen Familie.',
      en: 'From a small keepsake to a varied maternity series including your family.',
      bs: 'Od male uspomene do raznovrsne trudničke serije sa cijelom porodicom.'
    },
    packages: [
      {
        tier: 'bronze',
        price: 179,
        name: { de: 'Mama & Bauch', en: 'Mama & Bump', bs: 'Mama i trbuščić' },
        details: {
          de: ['30 Minuten', '5 bearbeitete Bilder', '1 Outfit beziehungsweise Bildset'],
          en: ['30 minutes', '5 edited images', '1 outfit or image set'],
          bs: ['30 minuta', '5 obrađenih fotografija', '1 outfit odnosno set']
        }
      },
      {
        tier: 'silver',
        price: 214,
        name: { de: 'Gemeinsam warten', en: 'Waiting Together', bs: 'Zajedno u iščekivanju' },
        details: {
          de: ['45 Minuten', '8 bearbeitete Bilder', 'Bis zu 2 Outfits oder Bildsets', 'Partner inklusive'],
          en: ['45 minutes', '8 edited images', 'Up to 2 outfits or image sets', 'Partner included'],
          bs: ['45 minuta', '8 obrađenih fotografija', 'Do 2 outfita ili seta', 'Partner uključen']
        },
        saving: {
          de: '10 € günstiger als Bronze plus 3 zusätzliche Bilder.',
          en: '€10 less than Bronze plus 3 additional images.',
          bs: '10 € povoljnije od bronzanog paketa uz 3 dodatne fotografije.'
        }
      },
      {
        tier: 'gold',
        price: 284,
        name: { de: 'Liebe im Bauch', en: 'Love Within', bs: 'Ljubav u iščekivanju' },
        details: {
          de: ['60 Minuten', '14 bearbeitete Bilder', 'Bis zu 3 Outfits oder Bildsets', 'Partner und Geschwister inklusive'],
          en: ['60 minutes', '14 edited images', 'Up to 3 outfits or image sets', 'Partner and siblings included'],
          bs: ['60 minuta', '14 obrađenih fotografija', 'Do 3 outfita ili seta', 'Partner i djeca uključeni']
        },
        saving: {
          de: '20 € günstiger als Silber plus 6 zusätzliche Bilder.',
          en: '€20 less than Silver plus 6 additional images.',
          bs: '20 € povoljnije od srebrnog paketa uz 6 dodatnih fotografija.'
        }
      }
    ]
  },
  {
    id: 'neugeborene',
    serviceKey: 'newborn',
    start: 199,
    title: { de: 'Neugeborenen- & Babyfotografie', en: 'Newborn & Baby Photography', bs: 'Fotografisanje novorođenčadi & beba' },
    intro: {
      de: 'Ruhige Neugeborenenshootings mit vorbereiteten Bildsets und viel Zeit für euer Baby.',
      en: 'Calm newborn sessions with prepared image sets and plenty of time for your baby.',
      bs: 'Mirno fotografisanje novorođenčeta uz pripremljene setove i dovoljno vremena za bebu.'
    },
    packages: [
      {
        tier: 'bronze',
        price: 199,
        name: { de: 'Kleines Wunder', en: 'Little Wonder', bs: 'Malo čudo' },
        details: {
          de: ['Bis zu 75 Minuten', '6 bearbeitete Bilder', '1 vorbereitetes Bildset', 'Babyaufnahmen'],
          en: ['Up to 75 minutes', '6 edited images', '1 prepared image set', 'Baby portraits'],
          bs: ['Do 75 minuta', '6 obrađenih fotografija', '1 pripremljeni set', 'Fotografije bebe']
        }
      },
      {
        tier: 'silver',
        price: 249,
        name: { de: 'Erste Erinnerungen', en: 'First Memories', bs: 'Prve uspomene' },
        details: {
          de: ['Bis zu 90 Minuten', '11 bearbeitete Bilder', '2 vorbereitete Bildsets', 'Elternbilder inklusive'],
          en: ['Up to 90 minutes', '11 edited images', '2 prepared image sets', 'Parent portraits included'],
          bs: ['Do 90 minuta', '11 obrađenih fotografija', '2 pripremljena seta', 'Fotografije s roditeljima uključene']
        },
        saving: {
          de: '25 € günstiger als Bronze plus 5 zusätzliche Bilder.',
          en: '€25 less than Bronze plus 5 additional images.',
          bs: '25 € povoljnije od bronzanog paketa uz 5 dodatnih fotografija.'
        }
      },
      {
        tier: 'gold',
        price: 329,
        name: { de: 'Willkommen, kleines Wunder', en: 'Welcome, Little Wonder', bs: 'Dobrodošlo, malo čudo' },
        details: {
          de: ['Bis zu 2 Stunden', '18 bearbeitete Bilder', '3 vorbereitete Bildsets', 'Familien- und Geschwisterbilder inklusive'],
          en: ['Up to 2 hours', '18 edited images', '3 prepared image sets', 'Family and sibling portraits included'],
          bs: ['Do 2 sata', '18 obrađenih fotografija', '3 pripremljena seta', 'Porodične fotografije i fotografije s djecom uključene']
        },
        saving: {
          de: '25 € günstiger als Silber plus 7 zusätzliche Bilder.',
          en: '€25 less than Silver plus 7 additional images.',
          bs: '25 € povoljnije od srebrnog paketa uz 7 dodatnih fotografija.'
        }
      }
    ]
  },
  {
    id: 'familie',
    serviceKey: 'family',
    start: 189,
    title: { de: 'Familienshooting', en: 'Family Session', bs: 'Porodično fotografisanje' },
    intro: {
      de: 'Natürliche Familienmomente von der kleinen gemeinsamen Serie bis zu vielen Konstellationen.',
      en: 'Natural family moments, from a small shared series to a wide range of family combinations.',
      bs: 'Prirodni porodični trenuci, od male zajedničke serije do različitih porodičnih kombinacija.'
    },
    packages: [
      {
        tier: 'bronze',
        price: 189,
        name: { de: 'Kleine Familienzeit', en: 'Little Family Time', bs: 'Malo porodično vrijeme' },
        details: {
          de: ['30 Minuten', '5 bearbeitete Bilder', 'Gemeinsame Familienaufnahmen'],
          en: ['30 minutes', '5 edited images', 'Shared family portraits'],
          bs: ['30 minuta', '5 obrađenih fotografija', 'Zajednički porodični portreti']
        }
      },
      {
        tier: 'silver',
        price: 239,
        name: { de: 'Familienmomente', en: 'Family Moments', bs: 'Porodični trenuci' },
        details: {
          de: ['45 Minuten', '9 bearbeitete Bilder', 'Verschiedene Familienkonstellationen'],
          en: ['45 minutes', '9 edited images', 'Different family combinations'],
          bs: ['45 minuta', '9 obrađenih fotografija', 'Različite porodične kombinacije']
        },
        saving: {
          de: '10 € günstiger als Bronze plus 4 zusätzliche Bilder.',
          en: '€10 less than Bronze plus 4 additional images.',
          bs: '10 € povoljnije od bronzanog paketa uz 4 dodatne fotografije.'
        }
      },
      {
        tier: 'gold',
        price: 319,
        name: { de: 'Familienzeit', en: 'Family Time', bs: 'Porodično vrijeme' },
        details: {
          de: ['60 Minuten', '16 bearbeitete Bilder', 'Familien-, Geschwister- und Einzelaufnahmen'],
          en: ['60 minutes', '16 edited images', 'Family, sibling and individual portraits'],
          bs: ['60 minuta', '16 obrađenih fotografija', 'Porodični, dječiji i pojedinačni portreti']
        },
        saving: {
          de: '25 € günstiger als Silber plus 7 zusätzliche Bilder.',
          en: '€25 less than Silver plus 7 additional images.',
          bs: '25 € povoljnije od srebrnog paketa uz 7 dodatnih fotografija.'
        }
      }
    ]
  },
  {
    id: 'kombi',
    serviceKey: 'combo',
    start: 299,
    title: { de: 'Babybauch- & Neugeborenen-Kombination', en: 'Maternity & Newborn Bundle', bs: 'Trudničko & novorođenče paket' },
    intro: {
      de: 'Zwei aufeinander abgestimmte Shootings mit deutlichem Preisvorteil gegenüber Einzelbuchungen.',
      en: 'Two coordinated sessions with clear savings compared with individual bookings.',
      bs: 'Dva usklađena fotografisanja uz jasnu uštedu u odnosu na pojedinačne rezervacije.'
    },
    packages: [
      {
        tier: 'bronze',
        price: 299,
        name: { de: 'Zwei kleine Erinnerungen', en: 'Two Little Memories', bs: 'Dvije male uspomene' },
        details: {
          de: ['2 Shootings', 'Je 5 bearbeitete Bilder', 'Je 1 Bildset', 'Insgesamt 10 Bilder'],
          en: ['2 sessions', '5 edited images per session', '1 image set per session', '10 images in total'],
          bs: ['2 fotografisanja', 'Po 5 obrađenih fotografija', 'Po 1 set', 'Ukupno 10 fotografija']
        },
        saving: {
          de: '79 € günstiger als zwei vergleichbare Einzelbuchungen.',
          en: '€79 less than two comparable individual bookings.',
          bs: '79 € povoljnije od dvije uporedive pojedinačne rezervacije.'
        }
      },
      {
        tier: 'silver',
        price: 389,
        name: { de: 'Unsere Geschichte', en: 'Our Story', bs: 'Naša priča' },
        details: {
          de: ['2 Shootings', 'Je 9 bearbeitete Bilder', 'Je bis zu 2 Bildsets', 'Insgesamt 18 Bilder'],
          en: ['2 sessions', '9 edited images per session', 'Up to 2 image sets per session', '18 images in total'],
          bs: ['2 fotografisanja', 'Po 9 obrađenih fotografija', 'Do 2 seta po fotografisanju', 'Ukupno 18 fotografija']
        },
        saving: {
          de: '30 € günstiger als Bronze plus 8 Bilder; 74 € günstiger als Einzelbuchungen.',
          en: '€30 less than Bronze plus 8 images; €74 less than individual bookings.',
          bs: '30 € povoljnije od bronze uz 8 fotografija više; 74 € povoljnije od pojedinačnih rezervacija.'
        }
      },
      {
        tier: 'gold',
        price: 499,
        name: { de: 'Vom Bauch ins Herz', en: 'From Bump to Heart', bs: 'Od stomaka do srca' },
        details: {
          de: ['2 Shootings', 'Je 15 bearbeitete Bilder', 'Je bis zu 3 Bildsets', 'Partner und Geschwister inklusive', 'Insgesamt 30 Bilder'],
          en: ['2 sessions', '15 edited images per session', 'Up to 3 image sets per session', 'Partner and siblings included', '30 images in total'],
          bs: ['2 fotografisanja', 'Po 15 obrađenih fotografija', 'Do 3 seta po fotografisanju', 'Partner i djeca uključeni', 'Ukupno 30 fotografija']
        },
        saving: {
          de: '70 € günstiger als Silber plus 12 Bilder; 114 € günstiger als Einzelbuchungen.',
          en: '€70 less than Silver plus 12 images; €114 less than individual bookings.',
          bs: '70 € povoljnije od srebra uz 12 fotografija više; 114 € povoljnije od pojedinačnih rezervacija.'
        }
      }
    ]
  },
  {
    id: 'hochzeit',
    serviceKey: 'wedding',
    start: 299,
    title: { de: 'Hochzeit & kleine Feiern', en: 'Wedding & Intimate Celebrations', bs: 'Vjenčanje & male proslave' },
    intro: {
      de: 'Fotografische Begleitung für Standesamt, Taufen, intime Hochzeiten und kleine Feiern.',
      en: 'Photographic coverage for civil ceremonies, baptisms, intimate weddings and small celebrations.',
      bs: 'Fotografska pratnja za vjenčanja, krštenja, intimna slavlja i male proslave.'
    },
    packages: [
      {
        tier: 'bronze',
        price: 299,
        name: { de: 'Ja, ich will', en: 'Yes, I Do', bs: 'Da, želim' },
        details: {
          de: ['Bis zu 1 Stunde', 'Trauung und Gruppenbilder', 'Ca. 20 professionell bearbeitete Bilder', 'Private Online-Galerie'],
          en: ['Up to 1 hour', 'Ceremony and group portraits', 'Around 20 professionally edited images', 'Private online gallery'],
          bs: ['Do 1 sat', 'Ceremonija i grupne fotografije', 'Oko 20 profesionalno obrađenih fotografija', 'Privatna online galerija']
        }
      },
      {
        tier: 'silver',
        price: 449,
        name: { de: 'Unser Moment', en: 'Our Moment', bs: 'Naš trenutak' },
        details: {
          de: ['Bis zu 2 Stunden', 'Trauung, Paar- und Gruppenfotos', 'Ca. 30 Highlightbilder', 'Zusätzliche grundoptimierte Reportagebilder'],
          en: ['Up to 2 hours', 'Ceremony, couple and group portraits', 'Around 30 highlight images', 'Additional basic-optimized reportage images'],
          bs: ['Do 2 sata', 'Ceremonija, fotografije para i grupne fotografije', 'Oko 30 istaknutih fotografija', 'Dodatne osnovno optimizirane reportažne fotografije']
        },
        saving: {
          de: '1 Stunde mehr, Paarshooting und eine umfangreichere Reportage.',
          en: '1 additional hour, a couple session and more extensive coverage.',
          bs: '1 sat više, fotografisanje para i opširnija reportaža.'
        }
      },
      {
        tier: 'gold',
        price: 639,
        name: { de: 'Unser besonderer Tag', en: 'Our Special Day', bs: 'Naš poseban dan' },
        details: {
          de: ['Bis zu 3 Stunden', 'Zeremonie, Paarfotos, Gruppenbilder und kleine Feier', 'Ca. 35 Highlightbilder', 'Ca. 65 zusätzliche grundoptimierte Reportagebilder'],
          en: ['Up to 3 hours', 'Ceremony, couple portraits, group photos and intimate celebration', 'Around 35 highlight images', 'Around 65 additional basic-optimized reportage images'],
          bs: ['Do 3 sata', 'Ceremonija, fotografije para, grupne fotografije i mala proslava', 'Oko 35 istaknutih fotografija', 'Oko 65 dodatnih osnovno optimiziranih reportažnih fotografija']
        },
        saving: {
          de: '1 Stunde mehr, Begleitung der Feier und deutlich mehr Reportagebilder.',
          en: '1 additional hour, coverage of the celebration and significantly more reportage images.',
          bs: '1 sat više, pratnja proslave i znatno više reportažnih fotografija.'
        }
      }
    ]
  }
];

function localizedFile(fileName, lang) {
  if (fileName === '/' || /^index(?:-(?:en|bs))?\.html$/i.test(fileName)) {
    return lang === 'de' ? '/' : `index-${lang}.html`;
  }
  const baseFile = fileName.replace(/-(?:en|bs)\.html$/i, '.html');
  return lang === 'de' ? baseFile : baseFile.replace(/\.html$/, `-${lang}.html`);
}

function pricingFile(lang) {
  return lang === 'de' ? 'preise.html' : `preise-${lang}.html`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function priceText(amount, lang, withPrefix = false) {
  if (lang === 'en') {
    return `${withPrefix ? 'from ' : ''}€${amount}`;
  }
  const prefix = withPrefix ? `${copy[lang].from} ` : '';
  return `${prefix}${amount} €`;
}

function renderPackageCard(category, packageInfo, lang) {
  const strings = copy[lang];
  const details = packageInfo.details[lang]
    .map((detail) => `<li>${escapeHtml(detail)}</li>`)
    .join('');
  const saving = packageInfo.saving?.[lang]
    ? `<p class="package-saving"><strong>${escapeHtml(strings.savings)}:</strong> ${escapeHtml(packageInfo.saving[lang])}</p>`
    : '';
  const inquiryHref = `${localizedFile('index.html', lang)}#contact-form-card`;

  return `<article class="package-card package-card--${packageInfo.tier}">
    <span class="package-tier">${escapeHtml(strings.tiers[packageInfo.tier])}</span>
    <h3>${escapeHtml(packageInfo.name[lang])}</h3>
    <div class="num" data-promo-price>${priceText(packageInfo.price, lang)}</div>
    <ul class="package-details">${details}</ul>
    ${saving}
    <a class="btn primary" href="${inquiryHref}">${escapeHtml(strings.packageInquiry)}</a>
  </article>`;
}

function renderPricingMain(lang) {
  const strings = copy[lang];
  const overview = categories.map((category) => `<article class="price-overview-card">
    <span class="label">${escapeHtml(strings.from)}</span>
    <h3>${escapeHtml(category.title[lang])}</h3>
    <div class="num" data-promo-price>${priceText(category.start, lang, true)}</div>
    <a href="#${category.id}">${escapeHtml(strings.details)} →</a>
  </article>`).join('');

  const jumpLinks = categories
    .map((category) => `<a href="#${category.id}">${escapeHtml(category.title[lang])}</a>`)
    .join('');

  const sections = categories.map((category) => {
    const service = serviceLinks.find((item) => item.key === category.serviceKey);
    const serviceHref = localizedFile(service.file, lang);
    const cards = category.packages
      .map((packageInfo) => renderPackageCard(category, packageInfo, lang))
      .join('');

    return `<section class="package-section" id="${category.id}">
      <div class="container">
        <div class="package-section-head">
          <div>
            <h2>${escapeHtml(category.title[lang])}</h2>
            <p>${escapeHtml(category.intro[lang])}</p>
            <a class="service-detail-link" href="${serviceHref}">${escapeHtml(strings.serviceDetails)} →</a>
          </div>
          <div class="starting-price" data-promo-price>${priceText(category.start, lang, true)}</div>
        </div>
        <div class="package-grid">${cards}</div>
      </div>
    </section>`;
  }).join('');

  const notes = strings.extraCards
    .map((card) => `<article class="price-note"><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p></article>`)
    .join('');

  return `<main>
    <section class="pricing-hero">
      <div class="container">
        <span class="eyebrow">${escapeHtml(strings.eyebrow)}</span>
        <h1>${escapeHtml(strings.title)}</h1>
        <p class="lead">${escapeHtml(strings.lead)}</p>
        <div class="pricing-hero-actions">
          <a class="btn primary" href="${localizedFile('index.html', lang)}#contact-form-card">${escapeHtml(strings.inquiry)}</a>
          <a class="btn secondary" href="#overview">${escapeHtml(strings.overview)}</a>
        </div>
      </div>
    </section>
    <div class="price-jump-wrap" aria-label="${escapeHtml(strings.overview)}">
      <nav class="container price-jump">${jumpLinks}</nav>
    </div>
    <section class="price-overview-section" id="overview">
      <div class="container section-head">
        <h2>${escapeHtml(strings.overview)}</h2>
        <p>${escapeHtml(strings.overviewText)}</p>
      </div>
      <div class="container price-overview">${overview}</div>
    </section>
    ${sections}
    <section class="price-notes">
      <div class="container section-head">
        <h2>${escapeHtml(strings.extraTitle)}</h2>
      </div>
      <div class="container price-note-grid">${notes}</div>
    </section>
    <section class="pricing-final-cta">
      <div class="container cta-band">
        <h2>${escapeHtml(strings.finalTitle)}</h2>
        <p>${escapeHtml(strings.finalText)}</p>
        <div class="hero-actions">
          <a class="btn primary" href="${localizedFile('index.html', lang)}#contact-form-card">${escapeHtml(strings.finalButton)}</a>
        </div>
      </div>
    </section>
  </main>`;
}

function setMeta(document, selector, content) {
  const node = document.querySelector(selector);
  if (node) {
    node.setAttribute('content', content);
  }
}

function ensureServiceNavigation(document, lang) {
  const labels = copy[lang].navServices;
  const menu = document.querySelector('.services-dropdown .nav-dropdown-menu');
  if (menu) {
    menu.innerHTML = serviceLinks
      .map((service) => `<a href="${localizedFile(service.file, lang)}">${escapeHtml(labels[service.key])}</a>`)
      .join('');
  }

  const footer = document.querySelector('.footer-primary-links');
  const portfolioLink = footer?.querySelector('a');
  if (footer) {
    const portfolio = portfolioLink
      ? `<a href="${localizedFile('index.html', lang)}#portfolio">${escapeHtml(portfolioLink.textContent)}</a>`
      : '';
    footer.innerHTML = portfolio + serviceLinks
      .map((service) => `<a href="${localizedFile(service.file, lang)}">${escapeHtml(labels[service.key])}</a>`)
      .join('');
  }
}

async function createHomeTemplates() {
  const template = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');

  await Promise.all(['en', 'bs'].map((lang) => (
    fs.writeFile(path.join(ROOT, localizedFile('index.html', lang)), template, 'utf8')
  )));
}

async function createPortraitTemplates() {
  const template = await fs.readFile(path.join(ROOT, 'familienfotografie-graz.html'), 'utf8');
  const dom = new JSDOM(template);
  const { document } = dom.window;

  document.body.className = 'portrait-page';
  document.querySelector('#gallery-showcase')?.remove();

  const heroImage = document.querySelector('.hero-visual img');
  if (heroImage) {
    heroImage.setAttribute('src', 'about.webp');
    heroImage.setAttribute('width', '1000');
    heroImage.setAttribute('height', '799');
    heroImage.removeAttribute('srcset');
    heroImage.removeAttribute('sizes');
    heroImage.style.objectPosition = 'center center';
  }

  const preload = document.querySelector('link[rel="preload"][as="image"]');
  if (preload) {
    preload.setAttribute('href', 'about.webp');
    preload.removeAttribute('imagesrcset');
    preload.removeAttribute('imagesizes');
  }

  document.querySelectorAll('.lang-option').forEach((link) => {
    link.setAttribute('href', localizedFile('portraitfotografie-graz.html', link.dataset.lang || 'de'));
  });

  const html = `<!DOCTYPE html>\n${document.documentElement.outerHTML}\n`
    .replace(/^[ \t]+$/gm, '');
  await Promise.all(LANGUAGES.map((lang) => (
    fs.writeFile(path.join(ROOT, localizedFile('portraitfotografie-graz.html', lang)), html, 'utf8')
  )));
  dom.window.close();
}

async function createComboTemplates() {
  const sourcePath = path.join(ROOT, 'babybauch-und-neugeborenen-shooting-graz.html');
  const template = await fs.readFile(sourcePath, 'utf8');
  const dom = new JSDOM(template);
  const { document } = dom.window;

  document.querySelectorAll('main > section').forEach((section) => {
    const heading = section.querySelector('h2')?.textContent || '';
    if (/Für wen diese Kombi/i.test(heading)) {
      section.remove();
    }
  });

  document.querySelectorAll('.lang-option').forEach((link) => {
    link.setAttribute('href', localizedFile('babybauch-und-neugeborenen-shooting-graz.html', link.dataset.lang || 'de'));
  });

  const html = `<!DOCTYPE html>\n${document.documentElement.outerHTML}\n`
    .replace(/^[ \t]+$/gm, '');
  await Promise.all(LANGUAGES.map((lang) => (
    fs.writeFile(path.join(ROOT, localizedFile('babybauch-und-neugeborenen-shooting-graz.html', lang)), html, 'utf8')
  )));
  dom.window.close();
}

async function createPricingPage(lang) {
  const templateFile = localizedFile('familienfotografie-graz.html', lang);
  const template = await fs.readFile(path.join(ROOT, templateFile), 'utf8');
  const dom = new JSDOM(template);
  const { document } = dom.window;
  const strings = copy[lang];
  const currentFile = pricingFile(lang);
  const pageUrl = new URL(currentFile, SITE_ORIGIN).toString();

  document.documentElement.lang = lang;
  document.documentElement.dataset.staticLang = lang;
  document.body.className = 'pricing-page';
  document.title = strings.pageTitle;
  setMeta(document, 'meta[name="description"]', strings.metaDescription);
  setMeta(document, 'meta[property="og:title"]', strings.pageTitle);
  setMeta(document, 'meta[property="og:description"]', strings.metaDescription);
  setMeta(document, 'meta[property="og:url"]', pageUrl);

  document.querySelectorAll('link[rel="canonical"], link[rel="alternate"]').forEach((node) => node.remove());
  document.head.insertAdjacentHTML('beforeend', `<link rel="canonical" href="${pageUrl}">
    <link rel="alternate" hreflang="de" href="${new URL('preise.html', SITE_ORIGIN)}">
    <link rel="alternate" hreflang="en" href="${new URL('preise-en.html', SITE_ORIGIN)}">
    <link rel="alternate" hreflang="bs" href="${new URL('preise-bs.html', SITE_ORIGIN)}">
    <link rel="alternate" hreflang="x-default" href="${new URL('preise.html', SITE_ORIGIN)}">`);

  if (!document.querySelector('link[href="pricing-page.css"]')) {
    document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="pricing-page.css">');
  }
  document.querySelector('link[rel="preload"][as="image"]')?.remove();

  document.querySelectorAll('script[src*="service-page.js"], script[src*="home-promo.js"]').forEach((script) => script.remove());
  document.head.insertAdjacentHTML('beforeend', '<script src="scripts/home-promo.js?v=20260729-1" defer></script><script src="pricing-page.js?v=20260729-1" defer></script>');

  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => script.remove());
  const catalog = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: strings.title,
    url: pageUrl,
    itemListElement: categories.map((category) => ({
      '@type': 'OfferCatalog',
      name: category.title[lang],
      itemListElement: category.packages.map((packageInfo) => ({
        '@type': 'Offer',
        name: `${strings.tiers[packageInfo.tier]} - ${packageInfo.name[lang]}`,
        price: packageInfo.price,
        priceCurrency: 'EUR',
        url: `${pageUrl}#${category.id}`
      }))
    }))
  };
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: strings.breadcrumbHome, item: new URL(localizedFile('index.html', lang), SITE_ORIGIN).toString() },
      { '@type': 'ListItem', position: 2, name: strings.breadcrumbCurrent, item: pageUrl }
    ]
  };
  document.head.insertAdjacentHTML('beforeend', `<script type="application/ld+json" data-schema-key="primary">${JSON.stringify(catalog)}</script><script type="application/ld+json" data-schema-key="breadcrumbs">${JSON.stringify(breadcrumbs)}</script>`);

  ensureServiceNavigation(document, lang);

  const navLinks = document.querySelectorAll('.nav-links > a, .nav-links > .nav-dropdown > a');
  navLinks.forEach((link) => link.classList.remove('active'));
  if (navLinks[0]) navLinks[0].setAttribute('href', localizedFile('index.html', lang));
  if (navLinks[1]) navLinks[1].setAttribute('href', localizedFile('ueber-mich.html', lang));
  if (navLinks[2]) navLinks[2].setAttribute('href', `${localizedFile('index.html', lang)}#services`);
  if (navLinks[3]) navLinks[3].setAttribute('href', `${localizedFile('index.html', lang)}#portfolio`);
  if (navLinks[4]) {
    navLinks[4].setAttribute('href', currentFile);
    navLinks[4].classList.add('active');
  }
  if (navLinks[5]) navLinks[5].setAttribute('href', `${localizedFile('index.html', lang)}#faq`);
  if (navLinks[6]) navLinks[6].setAttribute('href', `${localizedFile('index.html', lang)}#direct-contact-card`);

  document.querySelectorAll('.portfolio-dropdown .nav-dropdown-menu a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const [base, hash = 'gallery-showcase'] = href.split('#');
    link.setAttribute('href', `${localizedFile(base || 'index.html', lang)}#${hash}`);
  });

  document.querySelectorAll('[data-header-cta], [data-footer-cta]').forEach((link) => {
    link.setAttribute('href', `${localizedFile('index.html', lang)}#contact-form-card`);
  });
  const footerContact = document.querySelector('.footer-secondary-links a');
  footerContact?.setAttribute('href', `${localizedFile('index.html', lang)}#direct-contact-card`);

  const breadcrumbsNode = document.querySelector('.breadcrumbs');
  if (breadcrumbsNode) {
    breadcrumbsNode.innerHTML = `<div class="container"><ol>
      <li><a href="${localizedFile('index.html', lang)}">${escapeHtml(strings.breadcrumbHome)}</a></li>
      <li aria-current="page">${escapeHtml(strings.breadcrumbCurrent)}</li>
    </ol></div>`;
  }

  document.querySelector('main')?.replaceWith(JSDOM.fragment(renderPricingMain(lang)));

  document.querySelectorAll('.lang-option').forEach((link) => {
    const optionLang = link.dataset.lang || 'de';
    link.setAttribute('href', pricingFile(optionLang));
    link.classList.toggle('active', optionLang === lang);
  });
  const currentLanguage = document.getElementById('langCurrent');
  if (currentLanguage) {
    currentLanguage.textContent = lang.toUpperCase();
  }

  const output = `<!DOCTYPE html>\n${document.documentElement.outerHTML}\n`
    .replace(/^[ \t]+$/gm, '');
  await fs.writeFile(path.join(ROOT, currentFile), output, 'utf8');
  dom.window.close();
}

await createHomeTemplates();
await createPortraitTemplates();
await createComboTemplates();
for (const lang of LANGUAGES) {
  await createPricingPage(lang);
}
