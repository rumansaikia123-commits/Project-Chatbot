const { parseBudgetSignal } = require('./restaurants');

// A hand-researched directory of Guwahati nightlife venues (bars, pubs,
// lounges, breweries, clubs/discotheques). Refreshed September 2026 from a
// source-checked nightlife research document (real Google/Zomato/
// TripAdvisor ratings and review counts, cross-checked per venue) covering
// 52 real venues across a Bar/Pub/Lounge table and a Club/Discotheque/
// Night Club/Dance table. Same "mini RAG" idea as restaurants.js/parks.js/
// temples.js: instead of sending this whole list to Gemini on every
// message, getRelevantVenues() below only returns the venues that actually
// match what the visitor asked about.
//
// Unlike the old version of this file, matching here is NOT a single flat
// `tags` array OR-matched against a handful of triggers — it's several
// independent, real fields (typeOfPlace, musicVibe, rooftop, karaoke, cost,
// area), each with its own matcher, AND-combined the same way
// restaurants.js independently combines cuisine + area + budget. A query
// like "rooftop bar with karaoke under 2000" narrows on all three
// dimensions at once, not just whichever single tag happened to fire.
//
// `tags` still exists on each venue, but it's now a small, computed
// display-only summary (built once below by buildDisplayTags) for the
// visitor-facing card's chip row — it plays no role in matching, unlike
// before. `highlight` is written by hand, same as every other file, but
// grounded only in the verified fields below (Type of Place, Music/Vibe,
// Rooftop, Karaoke, Rating) — never from the source document's "AI Notes"
// column, which was explicitly excluded from this app: it's subjective
// tier commentary, not a verified fact, and this project's rule throughout
// is to only ever show/derive from real, checkable data.
//
// `reviewCount` (nullable) is the raw number of ratings behind each venue's
// `rating`, taken from the same source document. It exists purely so a
// thin, barely-reviewed rating doesn't get treated as equally trustworthy
// as one backed by hundreds or thousands of real reviews — see
// confidenceAdjustedScore below, and the matching guardrail in
// systemPrompt.js.
//
// Three venues (Terra Mayaa, The Maroon Room, Abacus Brewing Co & Kitchen)
// also exist in restaurants.js. Their rating/area were kept in sync there
// when this file was refreshed, so the bot never shows two different
// numbers for the same place depending on whether someone asked about food
// or nightlife.
const venues = [
  // ===================================================================
  // Bar / Pub / Lounge table (source document)
  // ===================================================================
  { name: 'The Beer Cafe', area: 'Christian Basti (City Center Mall)',
    typeOfPlace: ['bar-pub'], musicVibe: ['indie', 'live-music', 'tribute-nights'],
    rooftop: false, karaoke: false, rating: 4.8, reviewCount: 3945, costForTwo: 3000,
    highlight: 'Bar/pub known for indie live-music tribute nights; near 4,000 Google reviews, one of the most reviewed venues on the list.' },
  // Distinct branch from restaurants.js/older data's "Beer Cafe" at Times
  // Square Mall, Sreenagar — different mall/address, kept as its own entry
  // rather than assumed to be the same location.

  { name: 'Abacus Brewing Co & Kitchen', area: 'Khanapara, Hotel Palacio, GS Road',
    typeOfPlace: ['bar-pub', 'brewery'], musicVibe: ['rock', 'indie', 'live-music', 'tribute-nights'],
    rooftop: false, karaoke: false, rating: 4.9, reviewCount: null, costForTwo: 3000,
    highlight: 'Craft brewery and bar/pub with rock and indie live-music tribute nights. Also a food pick — see restaurants.js.' },

  { name: 'The Anglers Club & Tavern', area: 'Uzan Bazar, Latasil',
    typeOfPlace: ['bar-pub'], musicVibe: ['rock', 'live-music', 'tribute-nights'],
    rooftop: false, karaoke: true, rating: 4.3, reviewCount: null, costForTwo: 3000,
    highlight: 'Irish-pub-style bar with rock live-music tribute nights and karaoke.' },

  { name: 'House of Madira', area: 'Christian Basti (Central Mall, Block B)',
    typeOfPlace: ['lounge-bar', 'bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.4, reviewCount: 640, costForTwo: 3500,
    highlight: 'Established lounge-bar with a commercial-music vibe.' },

  { name: 'Café Hendrix', area: 'Rukminigaon, opposite Downtown Hospital',
    typeOfPlace: ['bar-pub'], musicVibe: ['rock', 'live-music', 'tribute-nights'],
    rooftop: false, karaoke: false, rating: 4.2, reviewCount: 2473, costForTwo: 1200,
    highlight: 'Rock-focused live-music pub with tribute nights.' },

  { name: 'Shanghai Salsa', area: 'Zoo Road Tiniali, Hotgarh Chariali',
    typeOfPlace: ['bar-pub'], musicVibe: ['rock', 'live-music', 'tribute-nights'],
    rooftop: false, karaoke: true, rating: 4.4, reviewCount: null, costForTwo: 1500,
    highlight: 'Mexican-styled pub with rock live-music tribute nights and karaoke.' },

  { name: 'Odiin Experiences', area: 'Zoo Road (Central Mall, RG Baruah Road)',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['rock', 'indie', 'live-music', 'tribute-nights'],
    rooftop: true, karaoke: false, rating: 4.2, reviewCount: null, costForTwo: 2500,
    highlight: 'Premium rooftop lounge-bar with rock/indie live-music tribute nights.' },

  { name: 'The Whiskey Bar & Grill', area: 'Zoo Road, near Doordarshan Kendra',
    typeOfPlace: ['bar-pub'], musicVibe: ['rock', 'live-music', 'tribute-nights'],
    rooftop: true, karaoke: true, rating: 4.6, reviewCount: 1191, costForTwo: 1500,
    highlight: 'Rooftop bar with rock live-music tribute nights and karaoke — over 1,100 ratings.' },

  { name: 'The Vibe House', area: 'Khanapara, Indra East Building, Jaya Nagar',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.9, reviewCount: 666, costForTwo: 1500,
    highlight: 'High-rated bar with a commercial-music vibe.' },

  { name: 'Terra Mayaa', area: 'Christian Basti, Anil Plaza II, GS Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: true, karaoke: false, rating: 4.3, reviewCount: null, costForTwo: 3000,
    highlight: 'Rooftop bar with a commercial-music vibe. Also a food pick — see restaurants.js.' },

  { name: 'The Maroon Room', area: 'Dispur, Aurus Mall, GS Road, Sarumotoria',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['rock', 'indie', 'live-music', 'tribute-nights'],
    rooftop: false, karaoke: false, rating: 4.6, reviewCount: 1527, costForTwo: null,
    highlight: 'Premium lounge-bar with rock/indie live-music tribute nights. Also a food pick — see restaurants.js.' },

  { name: "Freemason's Brewworks", area: 'Christian Basti (City Center Mall)',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium', 'brewery'], musicVibe: ['rock', 'indie', 'live-music', 'tribute-nights'],
    rooftop: true, karaoke: false, rating: 4.2, reviewCount: 1427, costForTwo: 2500,
    highlight: 'Premium rooftop brewery and lounge-bar with rock/indie live-music tribute nights.' },

  { name: 'The Root Barrel', area: 'Zoo Tiniali, RG Baruah Road',
    typeOfPlace: ['bar-pub', 'brewery'], musicVibe: ['commercial'],
    rooftop: true, karaoke: false, rating: 4.4, reviewCount: null, costForTwo: 1800,
    highlight: 'Rooftop craft-beer brewery and bar with a commercial-music vibe.' },

  { name: 'FTV Bar & Lounge', area: 'ABC, Exotica Arcade, GS Road',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.1, reviewCount: 218, costForTwo: 2500,
    highlight: 'Premium lounge-bar with a commercial-music vibe.' },

  { name: 'Malt – Novotel Guwahati', area: 'Six Mile, Novotel Guwahati, GS Road',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: false, karaoke: true, rating: 4.4, reviewCount: null, costForTwo: null,
    highlight: 'Premium hotel lounge-bar with a commercial-music vibe and karaoke.' },

  { name: 'Ascend Resto Lounge & Bar', area: 'Christian Basti, opp. Reliance Trends',
    typeOfPlace: ['lounge-bar', 'bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.4, reviewCount: 183, costForTwo: 1000,
    highlight: 'Value-priced lounge-bar with a commercial-music vibe.' },

  { name: 'Olive Garden Rooftop Restro Cum Bar', area: 'Zoo Tiniali, near Doordarshan Kendra',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: true, karaoke: false, rating: 4.3, reviewCount: 4649, costForTwo: null,
    highlight: 'Premium rooftop lounge-bar with a commercial-music vibe — over 4,600 Google reviews, the largest review footprint on the list.' },

  { name: 'Vapourr Bar & Lounge', area: 'Ulubari, Dona Planet, GS Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.3, reviewCount: 567, costForTwo: null,
    highlight: 'Established bar-lounge with a commercial-music vibe.' },

  { name: 'Bulls & Beers', area: 'Tarun Nagar, Dihang Arcade, GS Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.0, reviewCount: 2629, costForTwo: 1000,
    highlight: 'Local value-priced bar with a commercial-music vibe.' },

  { name: 'The View Restaurant & Lounge', area: 'Christian Basti, HB Tower, GS Road',
    typeOfPlace: ['lounge-bar', 'bar-pub'], musicVibe: ['commercial'],
    rooftop: true, karaoke: false, rating: 3.8, reviewCount: 2629, costForTwo: null,
    highlight: 'Rooftop lounge-bar with a commercial-music vibe — the lowest-rated bar/pub in this set, worth tempered expectations.' },

  { name: 'Keiko MRP Bar', area: 'Christian Basti, opp. Central Mall',
    typeOfPlace: ['mrp-bar', 'bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.0, reviewCount: 846, costForTwo: 900,
    highlight: 'MRP-style value drinking bar with a commercial-music vibe.' },

  { name: 'Kitchen Bar & Restaurant – Christian Basti', area: 'Christian Basti, near International Hospital',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.0, reviewCount: null, costForTwo: 1200,
    highlight: 'Local bar-restaurant with a commercial-music vibe.' },

  { name: 'Kitchen Bar & Restaurant – Zoo Tiniali', area: 'Zoo Tiniali, RG Baruah Road',
    typeOfPlace: ['mrp-bar', 'bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.0, reviewCount: 415, costForTwo: 1400,
    highlight: 'MRP-style local bar-restaurant with a commercial-music vibe.' },

  { name: "Friend's Bar Cum Restaurant", area: 'Zoo Tiniali, near Commerce College Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.1, reviewCount: 124, costForTwo: 700,
    highlight: 'Lowest-tier, most local/value bar option in this set.' },

  { name: 'Uptown Escape Cafe & Cocktail Bar', area: 'Christian Basti, Subham Buildwell, GS Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.5, reviewCount: 1004, costForTwo: 2100,
    highlight: 'Cafe-cocktail bar with a commercial-music vibe.' },

  { name: 'Bombay Brasserie', area: 'Christian Basti (City Center Mall)',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.6, reviewCount: 686, costForTwo: 2000,
    highlight: 'Premium lounge-bar with a commercial-music vibe.' },

  { name: 'Elevate Bar & Bistro', area: 'Lachit Nagar, Roodraksh Mall',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: true, karaoke: false, rating: 4.6, reviewCount: 114, costForTwo: 900,
    highlight: 'Premium rooftop lounge-bar with a commercial-music vibe.' },

  { name: 'Beer Nation Cafe', area: 'Christian Basti, near Central Mall',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.5, reviewCount: 169, costForTwo: 900,
    highlight: 'Well-rated bar with a commercial-music vibe.' },

  { name: 'Broncco', area: 'Ulubari, Lachit Nagar, S Sarania Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.2, reviewCount: 381, costForTwo: 1000,
    highlight: 'Neighbourhood bar with a commercial-music vibe.' },

  { name: 'Chakkranosh', area: 'Ulubari, BK Kakati Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.6, reviewCount: null, costForTwo: 1600,
    highlight: 'Well-rated bar with a commercial-music vibe. A same-named restaurant also exists in Dispur — likely a different location, kept separate.' },

  { name: 'Reign – Bar & Lounge, Radisson Blu', area: 'Gotanagar, Radisson Blu Hotel, NH 37',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: [],
    rooftop: false, karaoke: false, rating: 5.0, reviewCount: 77, costForTwo: null,
    highlight: 'Premium hotel lounge — highest-rated bar/pub in this set, though from a smaller review base; a good, calm late-night hotel option.' },

  { name: 'SISO Speakeasy', area: 'Christian Basti, Subham Buildwell, GS Road',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.5, reviewCount: 145, costForTwo: null,
    highlight: 'Premium speakeasy-style lounge-bar with a commercial-music vibe.' },

  { name: 'BudgetBars.com', area: 'Zoo Tiniali, RG Baruah Road',
    typeOfPlace: ['bar-pub'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.2, reviewCount: 277, costForTwo: 900,
    highlight: 'Value-priced bar with a commercial-music vibe.' },

  { name: 'Levitate Rooftop Restaurant', area: 'Khanapara, near Vivanta, GS Road',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: true, karaoke: false, rating: 4.8, reviewCount: 2323, costForTwo: null,
    highlight: 'Premium rooftop lounge-bar with panoramic Khanapara views and a commercial-music vibe — over 2,300 Google reviews.' },

  { name: 'Quench House', area: 'Dispur, near Ganeshguri Flyover, GS Road',
    typeOfPlace: ['lounge-bar', 'bar-pub', 'premium'], musicVibe: ['commercial'],
    rooftop: false, karaoke: false, rating: 4.4, reviewCount: 915, costForTwo: null,
    highlight: 'Well-reviewed premium lounge-bar with a commercial-music vibe.' },

  // ===================================================================
  // Club / Discotheque / Night Club / Dance table (source document)
  // ===================================================================
  { name: 'Nyx Lounge & Deck', area: 'Khanapara, Hotel Palacio, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'party'],
    rooftop: true, karaoke: false, rating: 4.8, reviewCount: 1742, costForTwo: 4000,
    highlight: "Self-described Guwahati's #1 rooftop night club — DJ/EDM/commercial party sets, near 1,750 Google reviews." },

  { name: 'The Locals', area: 'Khanapara, Swagata Envision, Jaya Nagar, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'party'],
    rooftop: true, karaoke: false, rating: 4.7, reviewCount: 263, costForTwo: 4000,
    highlight: 'Rooftop DJ-driven nightclub with EDM/commercial/party sets.' },

  { name: 'Roycee Club', area: 'ABC, Exotica Arcade, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: true, karaoke: false, rating: 4.0, reviewCount: 39, costForTwo: 4000,
    highlight: 'Rooftop club with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'Nuts & Brew', area: 'Six Mile, Shradhanjali Complex, GS Road',
    typeOfPlace: ['club-discotheque', 'brewery'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: true, karaoke: false, rating: 4.0, reviewCount: 39, costForTwo: 3000,
    highlight: 'Rooftop craft-beer microbrewery and club with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'XS Bar & Lounge', area: 'ABC, Anil Plaza II, Tarun Nagar Main Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 4.1, reviewCount: 1587, costForTwo: 3000,
    highlight: 'Stylish club with DJ/EDM/commercial/Bollywood/party sets, on the pricier side.' },

  { name: 'The Afters – Octave, Vivanta Guwahati', area: 'Khanapara, Vivanta Guwahati',
    typeOfPlace: ['club-discotheque', 'after-party'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 4.1, reviewCount: 1587, costForTwo: 4000,
    highlight: 'Hotel after-party venue with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'Club Elite', area: 'Khanapara, Hotel Palacio, GS Road',
    typeOfPlace: ['club-discotheque', 'after-party'], musicVibe: ['dj', 'edm', 'trance', 'party'],
    rooftop: false, karaoke: false, rating: 4.0, reviewCount: 30, costForTwo: 4000,
    highlight: 'After-party club with DJ/EDM/trance/party sets.' },

  { name: 'Club Madiza', area: 'Ananda Nagar, Dona Planet, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 3.8, reviewCount: 26, costForTwo: 2000,
    highlight: 'Club with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'Retrotown', area: 'Near Bhangagarh Flyover, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 4.2, reviewCount: 87, costForTwo: 3000,
    highlight: 'Club with DJ/EDM/commercial/Bollywood/party sets.' },

  // Rating shown as unrated: the source document lists "43.8/5" for this
  // entry, which isn't a valid rating (almost certainly a typo for 4.8 or
  // 3.8). Rather than guess which, this is treated the same as any other
  // unverified rating — null.
  { name: 'Noya by Nyx', area: 'Khanapara, Hotel Palacio, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: null, reviewCount: 87, costForTwo: 3000,
    highlight: 'Club with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'T Sin Q – Sports cum Lounge Bar', area: 'Ganeshguri, Cinepolis Building, GS Road',
    typeOfPlace: ['club-discotheque', 'lounge-bar'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 4.1, reviewCount: 186, costForTwo: 3000,
    highlight: 'Sports-bar-meets-club with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'Donna Belle', area: 'Garchuk, near DPS, Ahomgaon',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: true, karaoke: false, rating: 4.1, reviewCount: 1000, costForTwo: 3000,
    highlight: 'Rooftop club with DJ/EDM/commercial/Bollywood/party sets — around 1,000 Google reviews.' },

  { name: 'X Factor – The Mixologist Pub', area: 'ABC, Anil Plaza II, Ananda Nagar, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 4.0, reviewCount: 32, costForTwo: 2000,
    highlight: 'Mixology-focused club with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'Crystal Discotheque', area: 'Zoo Tiniali, RG Baruah Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 3.7, reviewCount: 803, costForTwo: 2000,
    highlight: 'Long-running discotheque with DJ/EDM/commercial/Bollywood/party sets, over 800 Google reviews.' },

  { name: 'Club Valentine', area: 'Zoo Road, opposite Doordarshan Kendra',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 4.0, reviewCount: 89, costForTwo: 3000,
    highlight: 'Club with DJ/EDM/commercial/Bollywood/party sets.' },

  { name: 'Tulip Restaurant / Club DMD', area: 'Khanapara, Six Mile Flyover, GS Road',
    typeOfPlace: ['club-discotheque'], musicVibe: ['dj', 'edm', 'commercial', 'bollywood', 'party'],
    rooftop: false, karaoke: false, rating: 3.8, reviewCount: 607, costForTwo: 3000,
    highlight: 'Restaurant-club combo with DJ/EDM/commercial/Bollywood/party sets.' },

  // Gullu Party House deliberately excluded: 5.0/5 rating from only 5
  // reviews — a genuine statistical outlier in this data set (the
  // next-lowest review count anywhere in the file is 26), not credible
  // enough to publish rather than just down-rank.

  // ===================================================================
  // Other verified venues (not covered by the source document above,
  // kept from earlier research — real, just not re-verified in this pass)
  // ===================================================================
  { name: 'The Lounge - Dynasty', area: 'Fancy Bazaar',
    typeOfPlace: ['lounge-bar'], musicVibe: ['live-music'],
    rooftop: false, karaoke: true, rating: null, reviewCount: null, costForTwo: null,
    highlight: 'Live music and karaoke inside Hotel Dynasty. Warm ambience.' },

  { name: 'Skye Rooftop Bar & Pool', area: 'Novotel GS Road, 10th floor',
    typeOfPlace: ['lounge-bar'], musicVibe: [],
    rooftop: true, karaoke: null, rating: 5, reviewCount: null, costForTwo: 3000,
    highlight: 'Pool-side rooftop bar.' },

  { name: 'EXORO The Rooftop Pub', area: 'Roodraksh Mall, Bhangagarh, 4th floor',
    typeOfPlace: ['lounge-bar'], musicVibe: ['dj'],
    rooftop: true, karaoke: null, rating: 4.3, reviewCount: null, costForTwo: null,
    highlight: 'Live DJ + music, neon-lit, panoramic views.' },

  { name: 'The Socialite', area: 'GS Road',
    typeOfPlace: ['lounge-bar'], musicVibe: ['live-music'],
    rooftop: false, karaoke: null, rating: null, reviewCount: null, costForTwo: null,
    highlight: 'Live music evenings, reasonable prices, open till midnight.' },

  { name: '188 Downtown', area: 'Dispur, inside Novotel',
    typeOfPlace: ['lounge-bar'], musicVibe: [],
    rooftop: false, karaoke: null, rating: null, reviewCount: null, costForTwo: null,
    highlight: 'Upscale multi-cuisine dining and bar, praised for its music.' },

  { name: 'Trafik Lounge Bar & Restaurant', area: 'Silpukhuri',
    typeOfPlace: ['lounge-bar'], musicVibe: [],
    rooftop: false, karaoke: null, rating: null, reviewCount: null, costForTwo: null,
    highlight: 'Budget-friendly lounge-bar.' },

  // Also listed in restaurants.js as a cafe — it's a cafe by day, bar by night.
  { name: 'Leaf Deck Café Bar', area: 'Chandmari',
    typeOfPlace: ['lounge-bar'], musicVibe: [],
    rooftop: false, karaoke: null, rating: 4.8, reviewCount: null, costForTwo: null,
    highlight: 'Cafe cum bar with handcrafted cocktails and all-day happy hours.' },
];

// Builds a small (usually 2-4 item), display-only chip row for the card —
// purely computed from the verified fields below, never from the source
// document's "AI Notes" column, and never used for matching (see
// getRelevantVenues, which matches on the real fields directly instead).
function buildDisplayTags(v) {
  const tags = [];
  if (v.rooftop) tags.push('rooftop');
  if (v.typeOfPlace.includes('club-discotheque')) tags.push('club');
  if (v.typeOfPlace.includes('brewery')) tags.push('brewery');
  if (v.typeOfPlace.includes('mrp-bar')) tags.push('mrp bar');
  if (v.typeOfPlace.includes('premium')) tags.push('premium');
  if (v.typeOfPlace.includes('after-party')) tags.push('after-party');
  if (v.karaoke) tags.push('karaoke');
  if (v.musicVibe.includes('live-music')) tags.push('live music');
  if (v.musicVibe.includes('dj')) tags.push('DJ');
  if (v.musicVibe.includes('edm')) tags.push('EDM');
  if (tags.length === 0) tags.push(v.typeOfPlace.includes('lounge-bar') ? 'lounge' : 'bar');
  return tags;
}
venues.forEach((v) => { v.tags = buildDisplayTags(v); });

// ----- Matching: several independent fields, AND-combined -----
// (the direct analog of restaurants.js's cuisine + area + budget model,
// replacing the old single flat `tags` OR-match)

const TYPE_KEYWORDS = [
  // "clubs" (plural) previously failed to match \bclub(bing)?\b — same class
  // of bug as the earlier "cafes" fix (the trailing \b breaks right after
  // "club" when "s" follows). "night club"/"night clubs" (with a space)
  // previously failed to match the literal unbroken string "nightclub".
  // "dancing" previously failed to match \bdance\b — not a plural, a
  // different word ending, so a plain "s?" wouldn't have caught it either.
  { pattern: /\bclub(s|bing)?\b|night\s?clubs?|discotheques?|\bdanc(e|es|ing)\b/, type: 'club-discotheque' },
  { pattern: /after[- ]?part(y|ies)/, type: 'after-party' },
  { pattern: /brewer(y|ies)|craft\s?beer|microbrewery/, type: 'brewery' },
  { pattern: /\bpremium\b|upscale|high[- ]?end/, type: 'premium' },
  { pattern: /\bmrp\b/, type: 'mrp-bar' },
  { pattern: /\blounges?\b/, type: 'lounge-bar' },
  { pattern: /\bpubs?\b|\bbars?\b/, type: 'bar-pub' },
];

const VIBE_KEYWORDS = [
  { pattern: /\brock\b/, vibe: 'rock' },
  { pattern: /\bindie\b/, vibe: 'indie' },
  // (?!a) after "gig" stops it matching inside "gigabyte"/"gigahertz".
  { pattern: /live\s?(music|band)|\bgig(?!a)/, vibe: 'live-music' },
  { pattern: /tribute\s?nights?/, vibe: 'tribute-nights' },
  { pattern: /\bdj\b/, vibe: 'dj' },
  { pattern: /\bedm\b|electronic\s?dance/, vibe: 'edm' },
  { pattern: /\btrance\b/, vibe: 'trance' },
  { pattern: /bollywood/, vibe: 'bollywood' },
  { pattern: /commercial/, vibe: 'commercial' },
  // "parties" is an irregular plural — \bparty\b alone doesn't match it
  // (the word changes shape, not just adds a suffix), same root cause as
  // the club-discotheque fixes above.
  { pattern: /\bpart(y|ies)\b/, vibe: 'party' },
];

const AREA_KEYWORDS = [
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  { pattern: /khanapara/, area: 'Khanapara' },
  { pattern: /uzan\s?bazar/, area: 'Uzan Bazar' },
  { pattern: /zoo\s?tiniali|zoo\s?road/, area: 'Zoo Tiniali' },
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /tarun\s?nagar/, area: 'Tarun Nagar' },
  { pattern: /\babc\b|bhangagarh/, area: 'ABC, Bhangagarh' },
  { pattern: /ulubari/, area: 'Ulubari' },
  { pattern: /six\s?mile|\b6\s?mile\b/, area: 'Six Mile' },
  { pattern: /ganeshguri/, area: 'Ganeshguri' },
  { pattern: /lachit\s?nagar/, area: 'Lachit Nagar' },
  { pattern: /rukminigaon/, area: 'Rukminigaon' },
  { pattern: /gotanagar/, area: 'Gotanagar' },
  { pattern: /ananda\s?nagar/, area: 'Ananda Nagar' },
  { pattern: /garchuk/, area: 'Garchuk' },
  { pattern: /fancy\s?bazaar/, area: 'Fancy Bazaar' },
  { pattern: /silpukhuri/, area: 'Silpukhuri' },
  { pattern: /chandmari/, area: 'Chandmari' },
  { pattern: /sreenagar/, area: 'Sreenagar' },
];

function matchTypeOfPlace(text) {
  const matched = new Set();
  for (const { pattern, type } of TYPE_KEYWORDS) {
    if (pattern.test(text)) matched.add(type);
  }
  return matched;
}

function matchMusicVibe(text) {
  const matched = new Set();
  for (const { pattern, vibe } of VIBE_KEYWORDS) {
    if (pattern.test(text)) matched.add(vibe);
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

const NIGHTLIFE_TRIGGER = /\bbars?\b|\bpubs?\b|\blounges?\b|\bclub(s|bing)?\b|night\s?clubs?|discotheques?|\brooftop\b|brewer(y|ies)|\bnightlife\b|\bdrink|hang\s?out|\bpart(y|ies)|\bchill(?!i)|alcohol|\bgig(?!a)|\bdanc(e|es|ing)\b/;
const ROOFTOP_TRIGGER = /roof\s?top/;
const KARAOKE_TRIGGER = /\bkaraoke\b/;

const TOP_N = 10;

// A rating alone doesn't say how much to trust it — a 5.0 from 5 reviews
// isn't more reliable than a 4.6 from 1,500. Rather than a statistical
// formula, this is a simple, explainable tiered penalty: the fewer real
// reviews back a rating up (or none given at all), the more it gets
// discounted before ranking. Mirrors the same "review confidence"
// principle the original nightlife research document itself called for.
function confidenceAdjustedScore(v) {
  if (v.rating == null) return -1;
  if (v.reviewCount == null) return v.rating - 0.3;
  if (v.reviewCount < 50) return v.rating - 0.3;
  if (v.reviewCount < 200) return v.rating - 0.1;
  return v.rating;
}

// Looks at what the visitor actually asked and independently matches on
// type of place, music/vibe, rooftop, karaoke, budget, and area — the same
// AND-of-whatever-fired model restaurants.js uses, so "rooftop bar with
// karaoke under 2000" narrows on all three at once. Sorts by a
// review-confidence-adjusted score (not raw rating) and caps at TOP_N,
// so a broad "best bars" question gets a concise top-10 list led by
// genuinely well-supported venues, not just whichever happens to have the
// highest raw number from a handful of reviews.
function getRelevantVenues(message) {
  const text = message.toLowerCase();

  const matchedTypes = matchTypeOfPlace(text);
  const matchedVibes = matchMusicVibe(text);
  const matchedAreas = matchAreas(text);
  const wantsRooftop = ROOFTOP_TRIGGER.test(text);
  const wantsKaraoke = KARAOKE_TRIGGER.test(text);
  const budget = parseBudgetSignal(text);

  const isNightlifeQuestion =
    NIGHTLIFE_TRIGGER.test(text) || matchedTypes.size > 0 || matchedVibes.size > 0 || wantsKaraoke;
  if (!isNightlifeQuestion) return [];

  let results = venues;
  if (matchedTypes.size > 0) {
    results = results.filter((v) => v.typeOfPlace.some((t) => matchedTypes.has(t)));
  }
  if (matchedVibes.size > 0) {
    results = results.filter((v) => v.musicVibe.some((m) => matchedVibes.has(m)));
  }
  if (wantsRooftop) {
    results = results.filter((v) => v.rooftop === true);
  }
  if (wantsKaraoke) {
    results = results.filter((v) => v.karaoke === true);
  }
  if (budget) {
    results = results.filter(
      (v) => v.costForTwo != null && (!budget.min || v.costForTwo >= budget.min) && (!budget.max || v.costForTwo <= budget.max)
    );
  }
  if (matchedAreas.length > 0) {
    results = results.filter((v) => matchedAreas.some((area) => v.area.toLowerCase().includes(area.toLowerCase())));
  }

  const sorted = [...results].sort((a, b) => confidenceAdjustedScore(b) - confidenceAdjustedScore(a));
  return sorted.slice(0, TOP_N);
}

module.exports = { venues, getRelevantVenues };
