// A hand-researched directory of Guwahati sweet shops (mithai), compiled
// from a source-checked PDF (name, location, phone, real Google rating +
// review count, and a "What is Available" column that's the same base
// list for every shop — "Indian sweets / mithai / Savoury" — except that
// some shops additionally list "Chaats"). This is its own category (not
// folded into restaurants.js), since the data has no cost-for-two and no
// distinguishing per-shop highlight the way restaurants.js expects —
// it's a much closer match to the cabServices/selfDriveServices shape
// already used in transport.js (name/area/phone/rating/reviewCount).
//
// Two shops in the source have no phone number listed ("—" in the PDF):
// those are stored as `phone: null` rather than a made-up placeholder.
//
// `chaats` is a real, per-shop true/false fact taken directly from the
// source's "What is Available" column — used as an actual filter (see
// getRelevantSweetShops below), not just display text.
//
// `referenceRank` is the source PDF's own "Position for reference"
// column — a curated ranking (1 = shown first) the chatbot uses to order
// a general "sweets/mithai" question, in place of sorting by star
// rating. Kiranshree Sweets (see below) didn't exist in that source, so
// it's inserted at rank 5 and every original rank from 5 onward is
// shifted down by one to make room — this is why the numbers below don't
// match the source PDF's own numbers one-for-one for most shops.
const sweetShops = [
  { name: 'Govindam Sweets', area: 'Six Mile', phone: '+91 86381 24707', rating: 4.2, reviewCount: 4877,
    chaats: true, referenceRank: 1,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Ashok Sweets', area: 'Lachit Nagar / Ulubari', phone: '+91 69001 39684', rating: 4.5, reviewCount: 3335,
    chaats: true, referenceRank: 2,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Bhartiya Jalpan', area: 'Ganeshguri', phone: '+91 60029 06991', rating: 4.2, reviewCount: 3720,
    chaats: true, referenceRank: 3,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Bhartiya Jalpan', area: 'Fancy Bazaar / Lakhtokia', phone: '+91 361 2514656', rating: 4.2, reviewCount: 1614,
    chaats: true, referenceRank: 4,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  // Not in the source PDF — this is the same real place already listed
  // in restaurants.js (area/rating kept in sync with that entry, the
  // same "same place, same rating" rule already followed for Terra
  // Mayaa/The Maroon Room/Abacus Brewing Co & Kitchen). restaurants.js
  // itself is untouched; this is a second, independent entry here.
  { name: 'Kiranshree Sweets', area: 'Paltan Bazaar', phone: null, rating: 4.3, reviewCount: null,
    chaats: true, referenceRank: 5,
    highlight: 'Known for mithai and street-food-style chaats — also listed as a multi-cuisine restaurant serving North and South Indian dishes.' },
  { name: 'Gokul Sweets', area: 'Beltola Tiniali', phone: '+91 76649 21000', rating: 4.2, reviewCount: 2291,
    chaats: true, referenceRank: 6,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Makhan Bhog', area: 'Bhangagarh / GS Road', phone: '+91 98540 81406', rating: 4.1, reviewCount: 4997,
    chaats: true, referenceRank: 7,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Ashok Sweets & Namkeen', area: 'Zoo Tiniali', phone: '+91 99572 45895', rating: 3.9, reviewCount: 264,
    chaats: true, referenceRank: 8,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Madhukunj', area: 'Fancy Bazaar', phone: '+91 98640 13288', rating: 4.2, reviewCount: 492,
    chaats: false, referenceRank: 9,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Dalimi Sweets', area: 'Hatigaon', phone: null, rating: 4.2, reviewCount: 1572,
    chaats: false, referenceRank: 10,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'MISTIMUKH', area: 'GS Road / South Sarania / Lachit Nagar', phone: '+91 98640 51182', rating: 4.1, reviewCount: 613,
    chaats: false, referenceRank: 11,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Vachi Shri - Sweets and Cafe', area: 'Zoo Road / Sunderpur', phone: '+91 361 3541152', rating: 4.5, reviewCount: 914,
    chaats: true, referenceRank: 12,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Kalita Sweets House', area: 'Maligaon', phone: '+91 98540 78924', rating: 3.9, reviewCount: 1128,
    chaats: false, referenceRank: 13,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Ganapati Sweets And Snacks', area: 'Lokhra', phone: '+91 60012 07164', rating: 4.8, reviewCount: 105,
    chaats: true, referenceRank: 14,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks — including chaats.' },
  { name: 'Radhika Sweets', area: 'Anil Nagar / Nabin Nagar', phone: null, rating: 3.9, reviewCount: 629,
    chaats: false, referenceRank: 15,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Baruah Sweets', area: 'Khanapara / Jaya Nagar', phone: '+91 98647 75801', rating: 3.8, reviewCount: 311,
    chaats: false, referenceRank: 16,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Diganta Sweets', area: 'Rukmini Gaon / Dispur', phone: '+91 98644 56428', rating: 4.0, reviewCount: 133,
    chaats: false, referenceRank: 17,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Kolkata Sweets', area: 'South Sarania / Ulubari', phone: '+91 97061 07429', rating: 4.0, reviewCount: 9,
    chaats: false, referenceRank: 18,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Sarada Sweets', area: 'Athgaon', phone: '+91 91274 25847', rating: 4.9, reviewCount: 19,
    chaats: false, referenceRank: 19,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
  { name: 'Ghosh Mishtanna Bhandar', area: 'Kala Pahar', phone: '+91 97065 88419', rating: 4.5, reviewCount: 16,
    chaats: false, referenceRank: 20,
    highlight: 'Known for Indian sweets, mithai, and savoury snacks.' },
];

// A named shop always narrows the result to just that shop, regardless
// of any other filter — same convention as every other category file
// (transport.js, restaurants.js, etc).
const SWEETSHOP_NAME_KEYWORDS = [
  { pattern: /sarada\s?sweets/, name: 'Sarada Sweets' },
  { pattern: /ganapati\s?sweets(\s?and\s?snacks)?/, name: 'Ganapati Sweets And Snacks' },
  // Negative lookahead so a plain "Ashok Sweets" mention doesn't also
  // pull in the separate "Ashok Sweets & Namkeen" shop.
  { pattern: /ashok\s?sweets\b(?!\s*(&|and)\s*namkeen)/, name: 'Ashok Sweets' },
  { pattern: /ashok\s?sweets\s*(&|and)\s*namkeen/, name: 'Ashok Sweets & Namkeen' },
  { pattern: /govindam\s?sweets/, name: 'Govindam Sweets' },
  { pattern: /vachi\s?shri/, name: 'Vachi Shri - Sweets and Cafe' },
  { pattern: /ghosh\s?mishtanna(\s?bhandar)?/, name: 'Ghosh Mishtanna Bhandar' },
  // One pattern, matches both Bhartiya Jalpan branches (they share this
  // exact name in the array above) — a bare mention returns both real
  // branches, the same as this app already does elsewhere for a chain
  // with more than one real location.
  { pattern: /bhartiya\s?jalpan/, name: 'Bhartiya Jalpan' },
  { pattern: /gokul\s?sweets/, name: 'Gokul Sweets' },
  { pattern: /dalimi\s?sweets/, name: 'Dalimi Sweets' },
  { pattern: /madhukunj/, name: 'Madhukunj' },
  { pattern: /makhan\s?bhog/, name: 'Makhan Bhog' },
  { pattern: /mistimukh/, name: 'MISTIMUKH' },
  { pattern: /diganta\s?sweets/, name: 'Diganta Sweets' },
  { pattern: /kolkata\s?sweets/, name: 'Kolkata Sweets' },
  { pattern: /kalita\s?sweets(\s?house)?/, name: 'Kalita Sweets House' },
  { pattern: /radhika\s?sweets/, name: 'Radhika Sweets' },
  { pattern: /baruah\s?sweets/, name: 'Baruah Sweets' },
  { pattern: /kiranshree\s?sweets/, name: 'Kiranshree Sweets' },
];

// "chaats?" is deliberately included here too — asking about chaat alone
// is enough to bring up this category (it then also narrows to
// chaats-only shops, see getRelevantSweetShops below). Plural forms are
// checked deliberately: this project has repeatedly hit bugs where a
// trailing \b failed to match a natural plural (e.g. "cafe" not matching
// "cafes") because "s" is still a word character right after it.
const SWEETSHOP_TRIGGER =
  /\bmithai\b|\bsweets?\b|\bsweet\s?shops?\b|\bmishti\b|\bmistanna\b|\bmistaan\b|\bsavo(u)?ry\b|\bchaats?\b/;

function matchKeywords(text, table, field) {
  const matched = [];
  for (const entry of table) {
    if (entry.pattern.test(text)) matched.push(entry[field]);
  }
  return matched;
}

// Several shops' `area` genuinely lists more than one real locality
// (e.g. MISTIMUKH: "GS Road / South Sarania / Lachit Nagar") — this
// splits that display string into its real separate fragments so a
// question about ANY one of them correctly finds the shop.
function shopAreaFragments(shop) {
  return shop.area.split('/').map((fragment) => fragment.trim().toLowerCase());
}

function getRelevantSweetShops(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, SWEETSHOP_NAME_KEYWORDS, 'name');
  if (matchedNames.length > 0) {
    return sweetShops.filter((s) => matchedNames.includes(s.name));
  }

  if (!SWEETSHOP_TRIGGER.test(text)) return [];

  const chaatsSignal = /\bchaats?\b/.test(text);

  // Figure out which real area fragments (across the whole directory,
  // not just whatever survives the chaats filter) are actually
  // mentioned, so a combined "chaats near X" question still recognizes
  // "X" as a real, active area filter even if it ends up matching zero
  // shops together with chaats.
  const allFragments = new Set();
  for (const shop of sweetShops) {
    for (const fragment of shopAreaFragments(shop)) allFragments.add(fragment);
  }
  const mentionedFragments = [...allFragments].filter((fragment) => text.includes(fragment));

  let results = sweetShops;
  if (chaatsSignal) {
    results = results.filter((s) => s.chaats === true);
  }
  if (mentionedFragments.length > 0) {
    results = results.filter((s) => shopAreaFragments(s).some((fragment) => mentionedFragments.includes(fragment)));
  }

  // Sorted by the curated reference rank (1 first), not star rating —
  // this is the chatbot's actual recommendation order for a general
  // question, per the source PDF's own "Position for reference" column.
  return [...results].sort((a, b) => a.referenceRank - b.referenceRank);
}

module.exports = {
  sweetShops,
  getRelevantSweetShops,
};
