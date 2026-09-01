// A hand-researched directory of Guwahati restaurants, compiled from Zomato
// CSV/PDF exports and deduplicated by hand. Each restaurant has a locality
// ("area"), a list of cuisines, an approximate cost for two (INR, or null
// if no source gave one), and a rating out of 5. Same "mini RAG" idea as
// venues.js: instead of sending this whole list to Gemini on every message,
// getRelevantRestaurants() below only returns the restaurants that actually
// match what the visitor asked about.
//
// Two entries (Terra Mayaa, The Maroon Room) already exist in venues.js as
// nightlife venues. A third (Abacus Brewing Co & Kitchen) turned up here
// too while transcribing this list. For all three, the rating and area
// below are taken from venues.js (not the newer restaurant source data),
// so the bot never shows two different ratings for the same place
// depending on whether someone asked about food or nightlife.

const restaurants = [
  // ----- ABC / Bhangagarh -----
  { name: 'The Barbeque Company', area: 'ABC, Bhangagarh (Exotica Arcade)', cuisines: ['North Indian', 'Buffet', 'BBQ'],
    costForTwo: 1000, rating: 4.3,
    highlight: 'Highly popular live buffet with grills.',
    address: '2nd Floor, Exotica Arcade, GS Rd, ABC, Guwahati, Assam 781005' },

  // ----- Ambari / Uzan Bazar -----
  { name: 'Lush - The Café', area: 'Ambari, Uzan Bazar', cuisines: ['Continental', 'Cafe'],
    costForTwo: 800, rating: 4.4,
    highlight: 'High-ranking aesthetic café concept.',
    address: 'GNB Rd, Ambari, near District Library, Guwahati, Assam 781001' },

  // ----- Beltola -----
  { name: 'JholoeKiya', area: 'Beltola', cuisines: ['North Indian', 'Chinese'],
    costForTwo: 1000, rating: 4.3,
    highlight: 'Flat 15% OFF dining discount on Zomato.',
    address: 'Survey, Beltola Tiniali, Guwahati, Assam 781028' },

  // ----- Christian Basti -----
  { name: 'Pirates of Grill', area: 'Christian Basti', cuisines: ['Buffet', 'North Indian', 'Chinese'],
    costForTwo: 1900, rating: 4.0,
    highlight: 'Flat 10% off via Swiggy Dineout pre-booking.',
    address: '2nd Floor, Central Mall, GS Rd, Christian Basti, Guwahati, Assam 781005' },
  { name: 'Red Hot Chilli Pepper', area: 'Christian Basti (Ganeshguri)', cuisines: ['Chinese', 'Pan-Asian'],
    costForTwo: 1500, rating: 4.3,
    highlight: 'Top-rated premium Chinese dine-out venue.',
    address: '2nd Floor, Central Mall, GS Rd, Christian Basti, Guwahati, Assam 781005' },
  { name: 'Lama by Yeti', area: 'Christian Basti', cuisines: ['Tibetan'],
    costForTwo: null, rating: 4.5,
    highlight: 'Awarded Best Ethnic Cuisine — Tibetan/Oriental specialties.' },
  // Abacus is also a venues.js nightlife venue — rating/area matched to that entry.
  { name: 'Abacus Brewing Co & Kitchen', area: 'Khanapara, Hotel Palacio, GS Road', cuisines: ['Asian', 'Continental', 'Modern Indian'],
    costForTwo: 2000, rating: 4.6,
    highlight: 'Craft brewery — reviewers call the live music the best in the city. Also a nightlife pick.',
    address: 'GS Road, Christian Basti, Guwahati, Assam' },

  // ----- Dighalipukhuri / Uzan Bazar -----
  { name: '11th Avenue Cafe Bistro', area: 'Dighalipukhuri, Uzan Bazar', cuisines: ['Continental', 'Italian', 'Cafe'],
    costForTwo: 700, rating: 4.2,
    highlight: 'Highly-rated youth hub and aesthetic café space.',
    address: 'Tayabullah Rd, Dighalipukhuri East, Uzan Bazar, Guwahati, Assam 781001' },

  // ----- Dispur / Tarun Nagar -----
  { name: 'Chakkranosh', area: 'Dispur', cuisines: ['North Indian', 'Mughlai', 'Biryani', 'Asian'],
    costForTwo: 900, rating: 4.6,
    highlight: 'Top-rated gourmet Indian, near the Secretariat.',
    address: 'Dispur, Near Secretariat, Guwahati, Assam' },
  // The Maroon Room is also a venues.js nightlife venue — rating/area matched to that entry.
  { name: 'The Maroon Room', area: 'Dispur', cuisines: ['Japanese', 'Italian', 'Continental'],
    costForTwo: 2500, rating: 4.9,
    highlight: "Guwahati's only restaurant with live entertainment every night — also a top nightlife pick.",
    address: '4th Floor, Subham Buildwell, GS Rd, Christian Basti, Guwahati, Assam 781006' },
  // Terra Mayaa is also a venues.js nightlife venue — rating/area matched to that entry.
  { name: 'Terra Mayaa Restaurant And Lounge', area: 'Tarun Nagar, Anil Plaza-II', cuisines: ['Continental', 'Italian', 'Asian'],
    costForTwo: 1800, rating: 4.1,
    highlight: 'Open-air rooftop deck with full bar and panoramic views — also a nightlife pick.',
    address: '6th Floor, Anil Plaza II, GS Road, Christian Basti, Guwahati, Assam' },

  // ----- Fancy Bazaar -----
  { name: 'Tandoor', area: 'Fancy Bazaar (Dynasty Hotel)', cuisines: ['Mughlai', 'North Indian', 'Kebab'],
    costForTwo: 1200, rating: 4.2,
    highlight: 'Flat 10% off on walk-in dining through Swiggy.',
    address: 'Hotel Dynasty, SS Rd, Fancy Bazaar, Guwahati, Assam 781001' },

  // ----- Ganeshguri -----
  { name: 'Mising Kitchen', area: 'Ganeshguri', cuisines: ['Assamese', 'North Eastern'],
    costForTwo: 600, rating: 4.4,
    highlight: 'Top-voted ethnic cuisine spot on Zomato; Mising local specialties.',
    address: 'Hengrabari Rd, near Ganesh Mandir, Ganeshguri, Guwahati, Assam 781006' },
  { name: 'Yoko Sizzlers', area: 'Ganeshguri (City Center Mall)', cuisines: ['Continental', 'Sizzlers'],
    costForTwo: 1400, rating: 4.6,
    highlight: 'Famous multi-cuisine premium casual dining.',
    address: '3rd Floor, City Centre Mall, GS Rd, Christian Basti, Guwahati, Assam 781005' },
  { name: 'Gams Delicacy', area: 'Ganeshguri', cuisines: ['Assamese', 'Tribal'],
    costForTwo: 600, rating: 4.1,
    highlight: 'Classic spot for local Assamese and tribal culinary authenticity.',
    address: 'Krishna Market, GS Rd, Ganeshguri, Guwahati, Assam 781006' },

  // ----- Jalukbari -----
  { name: 'The Great Kabab Factory', area: 'Jalukbari (Radisson Blu)', cuisines: ['North Indian', 'Mughlai', 'Kebab'],
    costForTwo: null, rating: 4.3,
    highlight: 'Flat 10% OFF on Zomato; Mughlai kebabs.' },

  // ----- Khanapara -----
  { name: 'Aroma: Modern Dining', area: 'Khanapara', cuisines: ['Multi-Cuisine', 'Italian', 'Assamese'],
    costForTwo: 1200, rating: 4.3,
    highlight: 'Flat 10% OFF active walk-in offer on Zomato.',
    address: 'GS Rd, near Khanapara Flyover, Khanapara, Guwahati, Assam 781022' },
  { name: 'Dine Way Platz', area: 'Khanapara', cuisines: ['North Indian', 'Chinese', 'Continental'],
    costForTwo: 1200, rating: 4.2,
    highlight: 'Premium fine-dining framework on Swiggy.',
    address: 'Jayanagar, Khanapara, Guwahati, Assam 781022' },

  // ----- Lachit Nagar -----
  { name: 'Aminia Restaurant', area: 'Lachit Nagar', cuisines: ['Mughlai', 'North Indian', 'Biryani'],
    costForTwo: 800, rating: 4.1,
    highlight: 'Popular for authentic Kolkata-style biryani.',
    address: 'GS Rd, near Lachit Nagar, Ulubari, Guwahati, Assam 781007' },

  // ----- Paltan Bazaar -----
  { name: 'Kiranshree Sweets', area: 'Paltan Bazaar', cuisines: ['Chinese', 'North Indian', 'South Indian', 'Mithai', 'Street Food'],
    costForTwo: 400, rating: 4.3,
    highlight: '30% OFF on delivery; popular for mithai and street food.',
    address: 'Paltan Bazaar, Near Railway Station, Guwahati, Assam' },
  { name: 'The Masala Wok', area: 'Paltan Bazaar', cuisines: ['North Indian'],
    costForTwo: null, rating: 4.6,
    highlight: 'Top delivery choice for combo platters.' },

  // ----- Rehabari -----
  { name: 'Urban Desi Kitchen', area: 'Rehabari', cuisines: ['North Indian', 'Pure Veg'],
    costForTwo: 800, rating: 4.8,
    highlight: 'Top-rated pure vegetarian family restaurant.',
    address: 'Rehabari Rd, near Bilpar, Rehabari, Guwahati, Assam 781008' },

  // ----- Six Mile -----
  { name: 'The Square', area: 'Six Mile (Novotel)', cuisines: ['Asian', 'Continental', 'French'],
    costForTwo: 3000, rating: 4.0,
    highlight: 'Flat 30% OFF active reservation deal on Zomato.',
    address: 'Novotel Guwahati, GS Rd, Downtown, Six Mile, Guwahati, Assam 781006' },
  { name: 'Malt', area: 'Six Mile (Novotel)', cuisines: ['North Indian', 'Finger Food'],
    costForTwo: 2500, rating: 4.1,
    highlight: 'Flat 50% off pre-bookings via Swiggy Dineout.',
    address: 'Novotel Guwahati, GS Rd, Downtown, Six Mile, Guwahati, Assam 781006' },
  { name: 'Confucius', area: 'Six Mile', cuisines: ['Chinese', 'Thai'],
    costForTwo: 1100, rating: 4.5,
    highlight: 'Top-tier delivery and casual dining; authentic Chinese & Thai.',
    address: 'GS Rd, opposite Pantaloons, Six Mile, Guwahati, Assam 781022' },

  // ----- Sundarpur -----
  { name: "Honey's Buffet Biryani", area: 'Sundarpur', cuisines: ['North Indian', 'Biryani', 'Buffet'],
    costForTwo: null, rating: 4.8,
    highlight: 'Highest-rated buffet biryani spot.' },

  // ----- Ulubari / Zoo Tiniali -----
  { name: 'Khorikaa', area: 'Ulubari, South Sarania', cuisines: ['Assamese'],
    costForTwo: 500, rating: 4.0,
    highlight: 'Legendary traditional Assamese thali destination.',
    address: '1st Floor, Bora Service Station, GS Rd, Ulubari, Guwahati, Assam 781007' },
  { name: 'Piazza', area: 'Ulubari', cuisines: ['Italian', 'Continental'],
    costForTwo: 1200, rating: 4.4,
    highlight: 'Celebrated casual dining and café space; gourmet pizza.',
    address: 'Dr B Baruah Rd, Ulubari, Guwahati, Assam 781007' },
  { name: 'Barbeque Nation', area: 'Ulubari', cuisines: ['North Indian', 'BBQ', 'Kebab'],
    costForTwo: 1600, rating: 4.5,
    highlight: 'Pre-bookable live buffet with BBQ grills and desserts.',
    address: '2nd Floor, Adityam Building, Shillong Rd, Ulubari, Guwahati, Assam' },
  { name: 'The Guwahati Address', area: 'Zoo Tiniali', cuisines: ['Chinese', 'Assamese', 'Bengali', 'North Indian', 'Asian'],
    costForTwo: 1200, rating: 4.1,
    highlight: 'Highly rated menu and ambience.',
    address: '45/46, RG Baruah Road, Zoo Tiniali, Guwahati, Assam' },
];

// Cuisine keyword lookup — one row per canonical cuisine that actually
// appears in the list above, with common synonyms folded in. Returns the
// set of canonical cuisines the visitor's message seems to be asking for.
const CUISINE_KEYWORDS = [
  { pattern: /assames[ea]/, cuisine: 'Assamese' },
  { pattern: /north\s?eastern|\bne\s?cuisine\b/, cuisine: 'North Eastern' },
  { pattern: /\btribal\b/, cuisine: 'Tribal' },
  { pattern: /\bcontinental\b/, cuisine: 'Continental' },
  { pattern: /\bitalian\b|\bpizza\b|\bpasta\b/, cuisine: 'Italian' },
  { pattern: /\bfrench\b/, cuisine: 'French' },
  { pattern: /\bchinese\b/, cuisine: 'Chinese' },
  { pattern: /pan-?asian|\basian\b/, cuisine: 'Asian' },
  { pattern: /\bbengali\b/, cuisine: 'Bengali' },
  { pattern: /north\s?indian/, cuisine: 'North Indian' },
  { pattern: /\bbbq\b|barbe?cue|\bgrills?\b/, cuisine: 'BBQ' },
  { pattern: /\bkebab/, cuisine: 'Kebab' },
  { pattern: /modern\s?indian/, cuisine: 'Modern Indian' },
  { pattern: /south\s?indian|\bdosa\b|\bidli\b/, cuisine: 'South Indian' },
  { pattern: /\bmithai\b|\bsweets?\b/, cuisine: 'Mithai' },
  { pattern: /street\s?food/, cuisine: 'Street Food' },
  { pattern: /\bmughlai\b/, cuisine: 'Mughlai' },
  { pattern: /\bbiryani\b/, cuisine: 'Biryani' },
  { pattern: /\btibetan\b|\bmomos?\b/, cuisine: 'Tibetan' },
  { pattern: /\bsizzlers?\b/, cuisine: 'Sizzlers' },
  { pattern: /\bbuffet\b/, cuisine: 'Buffet' },
  { pattern: /finger\s?food/, cuisine: 'Finger Food' },
  { pattern: /pure\s?veg|vegetarian/, cuisine: 'Pure Veg' },
  { pattern: /multi-?cuisine/, cuisine: 'Multi-Cuisine' },
  { pattern: /\bthai\b/, cuisine: 'Thai' },
  { pattern: /\bcaf[eé]\b|\bcoffee\b/, cuisine: 'Cafe' },
  { pattern: /\bjapanese\b|\bsushi\b/, cuisine: 'Japanese' },
];

// Area keyword lookup — one row per locality actually used above, with
// common alt-spellings. Matched as a substring against each restaurant's
// (sometimes compound, e.g. "Six Mile (Novotel)") area string, not an
// exact match — a plain Set-equality check would miss "Six Mile" matching
// "Six Mile (Novotel)".
const AREA_KEYWORDS = [
  { pattern: /\babc\b|bhangagarh/, area: 'ABC, Bhangagarh' },
  { pattern: /\bambari\b/, area: 'Ambari' },
  { pattern: /\bbeltola\b/, area: 'Beltola' },
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  { pattern: /dighalipukhuri|uzan\s?bazar/, area: 'Dighalipukhuri' },
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /tarun\s?nagar/, area: 'Tarun Nagar' },
  { pattern: /fancy\s?bazaar/, area: 'Fancy Bazaar' },
  { pattern: /ganeshguri/, area: 'Ganeshguri' },
  { pattern: /jalukbari/, area: 'Jalukbari' },
  { pattern: /khanapara/, area: 'Khanapara' },
  { pattern: /lachit\s?nagar/, area: 'Lachit Nagar' },
  { pattern: /paltan\s?bazaar/, area: 'Paltan Bazaar' },
  { pattern: /rehabari/, area: 'Rehabari' },
  { pattern: /six\s?mile|\b6\s?mile\b/, area: 'Six Mile' },
  { pattern: /sundarpur/, area: 'Sundarpur' },
  { pattern: /ulubari|south\s?sarania/, area: 'Ulubari' },
  { pattern: /zoo\s?tiniali|zoo\s?road/, area: 'Zoo Tiniali' },
];

function matchCuisines(text) {
  const matched = new Set();
  for (const { pattern, cuisine } of CUISINE_KEYWORDS) {
    if (pattern.test(text)) matched.add(cuisine);
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

// Turns phrases like "under 1000", "cheap", or "fine dining" into a
// { min?, max? } cost-for-two range. Returns null if nothing budget-related
// was mentioned.
function parseBudgetSignal(text) {
  const under = text.match(/(?:under|below|less than|within|up to)\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/);
  if (under) return { max: Number(under[1]) };

  const around = text.match(/(?:around|about|approx(?:imately)?)\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/);
  if (around) {
    const n = Number(around[1]);
    return { min: Math.round(n * 0.7), max: Math.round(n * 1.3) };
  }

  if (/\bcheap\b|budget[- ]?friendly|\baffordable\b|inexpensive|pocket[- ]?friendly/.test(text)) {
    return { max: 800 };
  }
  if (/\bexpensive\b|fine\s?dining|\bupscale\b|\bsplurge\b|high[- ]?end|\bpricey\b|special (occasion|dinner)/.test(text)) {
    return { min: 1800 };
  }
  return null;
}

const FOOD_TRIGGER = /\b(restaurants?|food|dining|dine|eat(?:ing|s)?|cuisine|lunch|dinner|breakfast|thali|caf[eé]|meal|hungry)\b/;

// Looks at what the visitor actually asked and returns only the matching
// restaurants. Returns [] both when the message isn't food-related at all,
// and when it's a food question too vague to narrow down (so
// systemPrompt.js can ask a clarifying question instead of guessing).
function getRelevantRestaurants(message) {
  const text = message.toLowerCase();

  const matchedCuisines = matchCuisines(text);
  const matchedAreas = matchAreas(text);
  const budget = parseBudgetSignal(text);

  const isFoodQuestion = FOOD_TRIGGER.test(text) || matchedCuisines.size > 0;
  if (!isFoodQuestion) return [];

  const noSpecificFilter = matchedCuisines.size === 0 && !budget && matchedAreas.length === 0;
  if (noSpecificFilter) return [];

  let results = restaurants;
  if (matchedCuisines.size > 0) {
    results = results.filter((r) => r.cuisines.some((c) => matchedCuisines.has(c)));
  }
  if (budget) {
    results = results.filter(
      (r) => r.costForTwo != null && (!budget.min || r.costForTwo >= budget.min) && (!budget.max || r.costForTwo <= budget.max)
    );
  }
  if (matchedAreas.length > 0) {
    results = results.filter((r) => matchedAreas.some((area) => r.area.toLowerCase().includes(area.toLowerCase())));
  }

  return results;
}

module.exports = { restaurants, getRelevantRestaurants };
