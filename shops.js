// A hand-verified directory of Guwahati shopping destinations, transcribed
// from "Guwahati Shopping Guide" (GMC/GMDA/NEDFi/Purbashree-verified,
// September 2026). Same "mini RAG" idea as the other category files:
// instead of sending this whole list to Gemini on every message,
// getRelevantShops() below only returns the entries that actually match
// what the visitor asked about.
//
// Every entry gets exactly one `category`: 'mall', 'market', or 'corridor'
// (GS Road Shopping Corridor only — a strip of many shops/showrooms, not
// one single mall or market). The source document's own "Type" column is
// much messier free text ("Historic commercial market", "Traditional
// shopping / book area", "Government-linked emporium", etc.) — rather than
// use that directly (the same kind of inconsistency that made cinemas.js
// drop its Type column entirely), every value was checked by hand against
// this simple rule: it says "mall" -> mall, everything else defaults to
// "market" except the one genuine corridor. This was a deliberate,
// explicit decision, not a guess.
//
// `keywords` (nullable-empty array) exists only for the handful of shops
// with one specific, well-known specialty worth surfacing on its own —
// Pan Bazaar's book market, NEDFi Haat's craft focus, Purbashree/
// Pragjyotika's handloom and government-emporium status. Everything else
// is just a plain market/mall with no special keyword, same as the
// majority of entries in the source document.
//
// `tags` is a small computed display array (category + keywords), built
// once below — purely for the visitor-facing card's chip row, reusing the
// exact same 'tags' field name (and therefore the exact same rendering
// code) already used by venues.js. It plays no role in matching.
const shops = [
  { name: 'Fancy Bazaar', area: 'Fancy Bazaar / Lakhtokia', tier: 1, category: 'market', keywords: [],
    bestFor: 'Textiles, dress materials, garments, household goods, wholesale and retail.',
    highlight: "One of Guwahati's major traditional retail and wholesale centres and a strong local-market experience — a long-established commercial core of the old city, identified in planning documents as a major city-level retail centre.",
    tip: 'Go earlier for easier movement. Compare prices and quality; keep valuables secure in crowded lanes.' },

  { name: 'City Centre, Guwahati', area: 'GS Road, Christian Basti', tier: 1, category: 'mall', keywords: [],
    bestFor: 'Branded fashion, lifestyle, electronics, dining and entertainment.',
    highlight: 'A major modern shopping destination combining retail, food and entertainment — part of the modern commercial growth of the GS Road corridor.',
    tip: 'Best for branded shopping rather than traditional market shopping. Check individual outlet hours.' },

  { name: 'GS Road Shopping Corridor', area: 'GS Road, central to southern Guwahati', tier: 1, category: 'corridor', keywords: [],
    bestFor: 'Malls, branded fashion, electronics, restaurants, cafes and lifestyle retail.',
    highlight: "Guwahati's principal modern shopping corridor and the easiest area for a mall-hopping day — a long commercial strip packed with showrooms and stores, expanded with the growth of southern Guwahati and the Dispur-Khanapara corridor.",
    tip: 'Traffic can be heavy; use cab/ride-hailing for multiple stops.' },

  { name: 'Paltan Bazaar', area: 'Paltan Bazaar, near Guwahati Railway Station', tier: 1, category: 'market', keywords: [],
    bestFor: 'Clothes, footwear, travel goods, local products and practical purchases.',
    highlight: 'Major central commercial and transport hub, particularly useful to travellers — a long-established central commercial and transport area.',
    tip: 'Convenient before/after train travel; be careful with bags in crowded areas.' },

  { name: 'Pan Bazaar', area: 'Pan Bazaar, central Guwahati', tier: 1, category: 'market', keywords: ['books'],
    bestFor: 'Books, textiles, clothing, jewellery, footwear, stationery and mixed retail.',
    highlight: 'A proper general market in its own right, much like Fancy Bazaar, that also happens to have a well-known dedicated book-selling area — part of the old central commercial core, alongside Fancy Bazaar, Paltan Bazaar and Uzan Bazaar.',
    tip: 'Combine with Dighalipukhuri or central riverfront attractions.' },

  { name: 'NEDFi Haat', area: 'Rupnath Brahma Path, Rupnagar', tier: 1, category: 'market', keywords: ['craft'],
    bestFor: 'Northeast handloom, handicrafts, bamboo/cane work, textiles and regional crafts.',
    highlight: 'A purpose-built platform connecting Northeast artisans and producers with buyers — first established in 2002, relaunched at Rupnagar in 2019.',
    tip: 'Check current fair/exhibition schedule; excellent for regional craft shopping.' },

  { name: 'Purbashree Emporium', area: 'Dighalipukhuri / Maniram Dewan Road', tier: 1, category: 'market', keywords: ['handloom'],
    bestFor: 'Assam/Northeast handloom, silk, bamboo/cane crafts and souvenirs.',
    highlight: 'Curated regional products and a convenient souvenir-shopping stop — operates within the Northeast handloom/handicraft development ecosystem.',
    tip: 'Easy to combine with Dighalipukhuri and central-city sightseeing.' },

  { name: 'Pragjyotika Assam Emporium', area: 'Ambari, Guwahati', tier: 1, category: 'market', keywords: ['government-emporium', 'handloom'],
    bestFor: 'Muga/Eri silk, handloom textiles, cane/bamboo products and Assamese handicrafts.',
    highlight: 'A strong choice for curated Assam-made handloom and handicraft products — part of the Assam government-linked outlet system that promotes local handloom and handicraft products.',
    tip: 'Good when authenticity and Assam provenance matter.' },

  { name: 'Central Mall', area: 'GS Road / Christian Basti', tier: 2, category: 'mall', keywords: [],
    bestFor: 'Fashion, lifestyle, electronics, food and entertainment.',
    highlight: "Established modern retail option in the GS Road shopping belt — part of Guwahati's modern mall ecosystem.",
    tip: 'Useful for branded retail; check current tenant list for specific brands.' },

  { name: 'Roodraksh Mall', area: 'Bhangagarh, GS Road', tier: 2, category: 'mall', keywords: [],
    bestFor: 'Fashion, lifestyle, dining and branded retail.',
    highlight: 'Prominent modern retail option on GS Road — part of the established GS Road commercial corridor.',
    tip: 'Check individual brand hours before a targeted visit.' },

  { name: 'Aurus Mall', area: 'GS Road / Dispur side', tier: 2, category: 'mall', keywords: [],
    bestFor: 'Fashion, lifestyle, dining and cinema/entertainment.',
    highlight: "Strong modern retail-and-entertainment choice — part of southern Guwahati's commercial expansion.",
    tip: 'Good for shopping + movie combinations.' },

  { name: 'Megha Plaza', area: 'Basistha Chariali / Beltola Tiniali', tier: 2, category: 'mall', keywords: [],
    bestFor: 'Fashion, everyday retail, services and local shopping.',
    highlight: 'Useful southern Guwahati shopping destination — part of Beltola-Basistha commercial growth.',
    tip: 'Combine with Beltola/Basistha itinerary.' },

  { name: 'Times Square Mall', area: 'RG Baruah Road / Zoo Road side', tier: 2, category: 'mall', keywords: [],
    bestFor: 'Retail, fashion, food and leisure.',
    highlight: 'Useful modern shopping option for Zoo Road/eastern-central Guwahati — part of RG Baruah Road retail development.',
    tip: 'Combine with Zoo Road-area attractions.' },

  { name: 'Centro, Guwahati', area: 'RG Baruah Road, Manik Nagar', tier: 2, category: 'mall', keywords: [],
    bestFor: 'Fashion, lifestyle and branded shopping.',
    highlight: 'A fashion-focused modern mall on RG Baruah Road — part of newer branded retail growth.',
    tip: 'Useful for Zoo Road/Manik Nagar itinerary.' },

  { name: 'Ganeshguri Market', area: 'Ganeshguri / Dispur', tier: 2, category: 'market', keywords: [],
    bestFor: 'Groceries, fresh produce, clothing, household goods and everyday retail.',
    highlight: 'Major southern local shopping area and good everyday-commerce experience — an established southern sub-centre on the GS Road corridor.',
    tip: 'Better for local shopping than premium souvenirs.' },

  { name: 'Beltola Market', area: 'Beltola', tier: 2, category: 'market', keywords: [],
    bestFor: 'Fresh produce, vegetables, household and local market goods.',
    highlight: "One of Guwahati's better-known traditional market areas — an established southern market area with daily and periodic activity.",
    tip: 'Visit during active market periods for the strongest local atmosphere.' },

  { name: 'Uzan Bazaar', area: 'Uzan Bazaar', tier: 2, category: 'market', keywords: [],
    bestFor: 'Daily-use goods, food, local products and neighbourhood shopping.',
    highlight: "Historic neighbourhood with an established market and Brahmaputra-side setting — part of Guwahati's historic central core.",
    tip: 'Combine with nearby riverfront/heritage stops.' },

  { name: 'Dispur Super Market', area: 'Dispur', tier: 3, category: 'market', keywords: [],
    bestFor: 'Everyday goods, groceries, clothing and neighbourhood shopping.',
    highlight: 'Useful local shopping area in the administrative capital zone.',
    tip: 'Practical stop, not a major tourist attraction.' },

  { name: 'Chandmari Market', area: 'Chandmari', tier: 3, category: 'market', keywords: [],
    bestFor: 'Daily-use goods, groceries, local shopping and services.',
    highlight: 'Established eastern-central shopping area — a long-established commercial/residential district.',
    tip: 'Useful if already visiting Chandmari.' },

  { name: 'Ulubari Market', area: 'Ulubari', tier: 3, category: 'market', keywords: [],
    bestFor: 'Everyday shopping, groceries, local goods and services.',
    highlight: 'Convenient central-southern local market, recognised as a retail centre in planning documents.',
    tip: 'Best for nearby visitors rather than a dedicated tourist trip.' },

  { name: 'Six Mile Market', area: 'Six Mile / VIP Road', tier: 3, category: 'market', keywords: [],
    bestFor: 'Groceries, fresh produce, household goods and everyday retail.',
    highlight: "Useful southern Guwahati shopping stop that grew with southern Guwahati's expansion.",
    tip: 'Combine with Six Mile/Khanapara/Panjabari destinations.' },

  { name: 'Hong Kong Market', area: 'Danish Road, Lakhtokia, Fancy Bazaar', tier: 3, category: 'market', keywords: [],
    bestFor: 'Clothing, accessories, household and assorted retail goods.',
    highlight: 'A recognisable shopping destination within the Fancy Bazaar ecosystem, developed within the dense Lakhtokia/Fancy Bazaar retail zone.',
    tip: 'Compare quality and prices; secure bags in crowded lanes.' },

  { name: 'Bamboo Market – Shantipur / Bhootnath', area: 'Shantipur and Bhootnath', tier: 3, category: 'market', keywords: ['craft'],
    bestFor: 'Bamboo and related local products.',
    highlight: 'A useful specialised local-commerce experience — GMC records bamboo markets at Shantipur and Bhootnath specifically.',
    tip: 'Ask about transport/packing for bulky products.' },

  { name: 'Kacharighat Market', area: 'Kacharighat', tier: 3, category: 'market', keywords: [],
    bestFor: 'Local produce and market goods.',
    highlight: 'Historic market location associated with river-linked trade — described in urban research as one of the city’s older markets.',
    tip: 'Treat as local-market experience, not a souvenir mall.' },
];

function buildDisplayTags(s) {
  return [s.category, ...s.keywords];
}
shops.forEach((s) => { s.tags = buildDisplayTags(s); });

// Name keyword lookup — lets a visitor ask about one specific shop/mall/
// market by name and get just that one.
const NAME_KEYWORDS = [
  { pattern: /fancy\s?bazaar/, name: 'Fancy Bazaar' },
  { pattern: /city\s?cent(re|er)/, name: 'City Centre, Guwahati' },
  { pattern: /gs\s?road\s?(shopping\s?)?corridor|gs\s?road/, name: 'GS Road Shopping Corridor' },
  { pattern: /paltan\s?bazaar/, name: 'Paltan Bazaar' },
  { pattern: /pan\s?bazaar/, name: 'Pan Bazaar' },
  { pattern: /nedfi/, name: 'NEDFi Haat' },
  { pattern: /purbashree/, name: 'Purbashree Emporium' },
  { pattern: /pragjyotika/, name: 'Pragjyotika Assam Emporium' },
  { pattern: /central\s?mall/, name: 'Central Mall' },
  { pattern: /roodraksh/, name: 'Roodraksh Mall' },
  { pattern: /aurus/, name: 'Aurus Mall' },
  { pattern: /megha\s?plaza/, name: 'Megha Plaza' },
  { pattern: /times\s?square/, name: 'Times Square Mall' },
  { pattern: /\bcentro\b/, name: 'Centro, Guwahati' },
  { pattern: /ganeshguri\s?market/, name: 'Ganeshguri Market' },
  { pattern: /beltola\s?market/, name: 'Beltola Market' },
  { pattern: /uzan\s?bazaar/, name: 'Uzan Bazaar' },
  { pattern: /dispur\s?super\s?market/, name: 'Dispur Super Market' },
  { pattern: /chandmari\s?market/, name: 'Chandmari Market' },
  { pattern: /ulubari\s?market/, name: 'Ulubari Market' },
  { pattern: /six\s?mile\s?market/, name: 'Six Mile Market' },
  { pattern: /hong\s?kong\s?market/, name: 'Hong Kong Market' },
  { pattern: /bamboo\s?market|shantipur|bhootnath/, name: 'Bamboo Market – Shantipur / Bhootnath' },
  { pattern: /kacharighat/, name: 'Kacharighat Market' },
];

// Niche keyword lookup — the handful of specific searchable specialties
// worth surfacing on their own within the market bucket.
const NICHE_KEYWORDS = [
  { pattern: /\bbooks?\b|bookstores?|stationery/, keyword: 'books' },
  { pattern: /\bcraft(s)?\b|artisan|bamboo|cane\s?work|handicrafts?/, keyword: 'craft' },
  { pattern: /handloom|\bsilk\b|muga|\beri\b/, keyword: 'handloom' },
  { pattern: /government\s?emporium|govt\.?\s?emporium/, keyword: 'government-emporium' },
];

const AREA_KEYWORDS = [
  { pattern: /fancy\s?bazaar|lakhtokia/, area: 'Fancy Bazaar' },
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  { pattern: /paltan\s?bazaar/, area: 'Paltan Bazaar' },
  { pattern: /pan\s?bazaar/, area: 'Pan Bazaar' },
  { pattern: /rupnagar/, area: 'Rupnagar' },
  { pattern: /dighalipukhuri/, area: 'Dighalipukhuri' },
  { pattern: /\bambari\b/, area: 'Ambari' },
  { pattern: /bhangagarh/, area: 'Bhangagarh' },
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /beltola|basistha/, area: 'Beltola' },
  { pattern: /zoo\s?road/, area: 'Zoo Road' },
  { pattern: /manik\s?nagar/, area: 'Manik Nagar' },
  { pattern: /ganeshguri/, area: 'Ganeshguri' },
  { pattern: /uzan\s?bazaar/, area: 'Uzan Bazaar' },
  { pattern: /chandmari/, area: 'Chandmari' },
  { pattern: /ulubari/, area: 'Ulubari' },
  { pattern: /six\s?mile|vip\s?road/, area: 'Six Mile' },
  { pattern: /shantipur|bhootnath/, area: 'Shantipur' },
  { pattern: /kacharighat/, area: 'Kacharighat' },
];

// "Shopping" (generic, no bucket named) is the broadest trigger — vague
// questions fall back to Tier 1. "Market"/"bazaar" and "mall" are their
// own, more specific triggers that return the WHOLE matching bucket
// (not tier-limited), per explicit instruction that a general "market"
// ask should show everything with an explanation, not just the top tier.
const SHOPPING_TRIGGER = /\bshopping\b|\bshops?\b/;
const MALL_TRIGGER = /\bmalls?\b/;
const MARKET_TRIGGER = /\bmarkets?\b|\bbazaars?\b|\bbazars?\b/;
const CORRIDOR_TRIGGER = /gs\s?road/;

function matchNames(text) {
  const matched = [];
  for (const { pattern, name } of NAME_KEYWORDS) {
    if (pattern.test(text)) matched.push(name);
  }
  return matched;
}

function matchNiche(text) {
  const matched = new Set();
  for (const { pattern, keyword } of NICHE_KEYWORDS) {
    if (pattern.test(text)) matched.add(keyword);
  }
  return matched;
}

function matchAreas(text) {
  const matched = [];
  for (const { pattern, area } of AREA_KEYWORDS) {
    if (pattern.test(text)) matched.push(area);
  }
  return matched;
}

// Looks at what the visitor actually asked and returns only the matching
// shops. A specific name always wins outright. Otherwise: a niche keyword
// (books/craft/handloom/government-emporium) narrows within the market
// bucket; "mall" or "market"/"bazaar" narrows to that whole bucket;
// "GS Road" surfaces the corridor. Area narrows further on top of
// whichever bucket (or none) was selected. A genuinely vague "shopping"
// question, with no bucket and no area, falls back to Tier 1 only.
function getRelevantShops(message) {
  const text = message.toLowerCase();

  const matchedNames = matchNames(text);
  const matchedNiche = matchNiche(text);
  const matchedAreas = matchAreas(text);
  const wantsMall = MALL_TRIGGER.test(text);
  const wantsMarket = MARKET_TRIGGER.test(text);
  const wantsCorridor = CORRIDOR_TRIGGER.test(text);

  const isShoppingQuestion =
    SHOPPING_TRIGGER.test(text) || matchedNames.length > 0 || matchedNiche.size > 0 || wantsMall || wantsMarket || wantsCorridor;
  if (!isShoppingQuestion) return [];

  if (matchedNames.length > 0) {
    return shops.filter((s) => matchedNames.includes(s.name));
  }

  let results = shops;
  let bucketFilterApplied = false;

  if (matchedNiche.size > 0) {
    results = results.filter((s) => s.keywords.some((k) => matchedNiche.has(k)));
    bucketFilterApplied = true;
  } else if (wantsMall) {
    results = results.filter((s) => s.category === 'mall');
    bucketFilterApplied = true;
  } else if (wantsMarket) {
    results = results.filter((s) => s.category === 'market');
    bucketFilterApplied = true;
  } else if (wantsCorridor) {
    results = results.filter((s) => s.category === 'corridor');
    bucketFilterApplied = true;
  }

  if (matchedAreas.length > 0) {
    results = results.filter((s) => matchedAreas.some((area) => s.area.toLowerCase().includes(area.toLowerCase())));
  }

  if (!bucketFilterApplied && matchedAreas.length === 0) {
    return shops.filter((s) => s.tier === 1);
  }

  return results;
}

module.exports = { shops, getRelevantShops };
