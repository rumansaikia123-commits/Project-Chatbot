// A hand-verified directory of general Guwahati sightseeing/attractions,
// transcribed from "Guwahati Places to See" (tiers independently verified
// by the person who runs this chatbot, September 2026). Same "mini RAG"
// idea as every other category file: getRelevantAttractions() below only
// returns the places that actually match what the visitor asked about.
//
// Five temples (Kamakhya, Umananda, Basistha, Madan Kamdev, Bhubaneshwari)
// and one park (Dighalipukhuri) already exist as their own real entries in
// temples.js/parks.js. Rather than re-describe them from scratch — which
// would risk this file quietly drifting out of sync with the already-
// verified data there (exactly the kind of bug already hit once, when
// Chakkranosh had two different areas in two different files) — this file
// pulls their `name`/`area` directly from temples.js/parks.js at load
// time via fromTemple()/fromPark() below. If either source file is ever
// corrected, this file's entries update automatically, with no manual
// re-sync step to remember.
//
// By deliberate design, none of those six places are name-matchable in
// THIS file at all (see the NAME_KEYWORDS table — they're simply absent
// from it, and CROSS_REFERENCED_NAMES exists to guarantee it stays that
// way even if a future edit tries to add one back). A visitor asking
// about "Kamakhya" by name should always land on temples.js's answer
// (deity, timings, dress code, mythology) — this file only surfaces them
// for a genuinely general "what to see"/"things to do" question, or a
// theme match (e.g. "historical sites"), never a bare name lookup. The
// same reasoning extends to the generic words "temple" and "park"
// themselves: THEME_KEYWORDS below deliberately has no trigger for the
// `temple-religious` or `park-garden` themes, since temples.js/parks.js
// already fully own those generic questions too — those two theme tags
// still exist on the data (useful context, and reachable via the Tier 1
// fallback or another theme word on the same entry), just with no
// dedicated keyword of their own that could fire on a bare "temple" or
// "park" mention and answer alongside the real category file.
const { temples } = require('./temples');
const { parks } = require('./parks');

function fromTemple(name) {
  const t = temples.find((x) => x.name === name);
  return { name: t.name, area: t.area };
}
function fromPark(name) {
  const p = parks.find((x) => x.name === name);
  return { name: p.name, area: p.area };
}

// tier/rank are internal only — never sent to Gemini or shown on the
// card. tier drives the vague-question fallback (same role as every
// other category); rank is the source document's own finer-grained
// ordering, used to sort that fallback. distanceFromDispur is kept as
// the source's own descriptive string (not converted to a bare number)
// since several are already ranges (e.g. "~45-50 km") — same "don't force
// false precision" reasoning as parks.js's entryFee or temples.js's
// timings.
const attractions = [
  { ...fromTemple('Maa Kamakhya Temple'), tier: 1, rank: 1, distanceFromDispur: '~8 km',
    themes: ['temple-religious', 'historical-site', 'cultural-centre', 'viewpoint'],
    highlight: "Guwahati's defining landmark and one of Assam's major pilgrimage destinations." },

  { name: 'Alfresco Grand', area: 'Gateway of Guwahati Terminal, Pan Bazaar (winter) / Uzan Bazaar (summer)', tier: 1, rank: 2, distanceFromDispur: '~8-12 km',
    themes: ['river-experience', 'scenic-nature'],
    highlight: 'The largest and most popular cruise on the Brahmaputra — sunset, sundown, and dinner sailings, with live music and a buffet on the dinner cruise. Pricing and exact schedules vary by source, so verify current details when booking.' },

  { ...fromTemple('Umananda Temple'), tier: 1, rank: 3, distanceFromDispur: '~10 km',
    themes: ['temple-religious', 'river-experience', 'scenic-nature', 'historical-site'],
    highlight: 'Sacred river island reached by boat, combining spirituality with distinctive Brahmaputra scenery.' },

  { name: 'Assam State Zoo cum Botanical Garden', area: 'Japorigog', tier: 1, rank: 4, distanceFromDispur: '~5 km',
    themes: ['zoo-botanical-garden', 'wildlife-sanctuary', 'scenic-nature', 'family-attraction'],
    highlight: "Guwahati's major wildlife and botanical attraction and a popular family destination." },

  { name: 'Pobitora Wildlife Sanctuary', area: 'Morigaon / Mayong side', tier: 1, rank: 5, distanceFromDispur: '~45-50 km',
    themes: ['wildlife-sanctuary', 'scenic-nature', 'adventure-activity', 'day-trip'],
    highlight: 'Short wildlife excursion famous for one-horned rhinos and safari experiences.' },

  { name: 'Srimanta Sankaradeva Kalakshetra', area: 'Panjabari', tier: 1, rank: 6, distanceFromDispur: '~5 km',
    themes: ['cultural-centre', 'museum-heritage', 'family-attraction'],
    highlight: 'Major cultural complex showcasing Assamese art, traditions, architecture and heritage.' },

  { name: 'Deepor Beel', area: 'Southwest Guwahati', tier: 1, rank: 7, distanceFromDispur: '~15-18 km',
    themes: ['wetland', 'wildlife-sanctuary', 'scenic-nature', 'lake-water-body'],
    highlight: "Important wetland and bird habitat offering one of Guwahati's strongest natural experiences." },

  { name: 'Guwahati Ropeway', area: 'Pan Bazaar to North Guwahati', tier: 1, rank: 8, distanceFromDispur: '~10 km',
    themes: ['river-experience', 'viewpoint', 'adventure-activity', 'scenic-nature', 'family-attraction'],
    highlight: 'Unique aerial crossing of the Brahmaputra with panoramic river, hill and city views.' },

  { name: 'Mayong', area: 'Morigaon', tier: 1, rank: 9, distanceFromDispur: '~45-55 km',
    themes: ['cultural-centre', 'historical-site', 'archaeological-site', 'scenic-nature', 'day-trip'],
    highlight: "Known for folklore, traditional beliefs, archaeological heritage and its 'land of magic' identity." },

  { name: 'Assam State Museum', area: 'Ambari', tier: 2, rank: 10, distanceFromDispur: '~7 km',
    themes: ['museum-heritage', 'historical-site', 'cultural-centre'],
    highlight: "Museum covering Assam's archaeology, history, art and traditional culture." },

  { name: 'Sualkuchi', area: 'North Bank / Kamrup', tier: 2, rank: 11, distanceFromDispur: '~35-40 km',
    themes: ['cultural-centre', 'historical-site', 'museum-heritage', 'scenic-nature', 'day-trip'],
    highlight: 'Famous weaving town where visitors can experience traditional Assamese silk production.' },

  { name: 'Brahmaputra River Heritage Centre', area: 'Pan Bazaar', tier: 2, rank: 12, distanceFromDispur: '~8 km',
    themes: ['museum-heritage', 'cultural-centre', 'historical-site', 'river-experience'],
    highlight: 'Heritage centre focused on the Brahmaputra and its importance to Guwahati.' },

  { ...fromTemple('Madan Kamdev Temple Complex'), tier: 2, rank: 13, distanceFromDispur: '~40-45 km',
    themes: ['archaeological-site', 'historical-site', 'cultural-centre', 'scenic-nature', 'day-trip'],
    highlight: 'Atmospheric medieval temple ruins and stone sculptures surrounded by greenery.' },

  { ...fromTemple('Basistha Temple & Ashram'), tier: 2, rank: 14, distanceFromDispur: '~10 km',
    themes: ['temple-religious', 'historical-site', 'scenic-nature', 'adventure-activity'],
    highlight: 'Sacred ashram and river setting with forested surroundings and natural scenery.' },

  { name: 'Gandhi Mandap', area: 'Sarania Hills', tier: 2, rank: 15, distanceFromDispur: '~7 km',
    themes: ['historical-site', 'viewpoint', 'scenic-nature'],
    highlight: 'Gandhi memorial on a hill offering elevated views over Guwahati.' },

  { name: 'Amchang Wildlife Sanctuary', area: 'East Guwahati', tier: 2, rank: 16, distanceFromDispur: '~15-20 km',
    themes: ['wildlife-sanctuary', 'scenic-nature', 'adventure-activity'],
    highlight: 'Forested wildlife landscape close to the city for nature-oriented visitors.' },

  { name: 'Chandubi Lake', area: 'Near Boko', tier: 2, rank: 17, distanceFromDispur: '~60-70 km',
    themes: ['lake-water-body', 'scenic-nature', 'adventure-activity', 'day-trip'],
    highlight: 'Peaceful natural lake surrounded by hills and rural landscapes.' },

  { name: 'Pobitora-Mayong Circuit', area: 'Mayong / Pobitora', tier: 2, rank: 18, distanceFromDispur: '~45-55 km',
    themes: ['wildlife-sanctuary', 'cultural-centre', 'scenic-nature', 'day-trip'],
    highlight: "Combined excursion pairing Pobitora wildlife with Mayong's folklore and heritage." },

  { ...fromPark('Dighalipukhuri Park'), tier: 3, rank: 19, distanceFromDispur: '~7 km',
    themes: ['park-garden', 'lake-water-body', 'historical-site', 'scenic-nature', 'family-attraction'],
    highlight: 'Historic water body and popular central-city leisure area.' },

  { name: 'Guwahati Planetarium', area: 'Uzan Bazaar', tier: 3, rank: 20, distanceFromDispur: '~7 km',
    themes: ['museum-heritage', 'family-attraction', 'adventure-activity'],
    highlight: 'Popular astronomy and science attraction, particularly suitable for families.' },

  { name: 'Regional Science Centre', area: 'Khanapara', tier: 3, rank: 21, distanceFromDispur: '~10 km',
    themes: ['museum-heritage', 'family-attraction', 'adventure-activity'],
    highlight: 'Interactive science attraction with educational exhibits and activities.' },

  { name: 'Shilpagram', area: 'Panjabari', tier: 3, rank: 22, distanceFromDispur: '~5 km',
    themes: ['cultural-centre', 'museum-heritage'],
    highlight: 'Traditional craft and cultural complex representing Assam and Northeast India.' },

  { name: 'Nehru Park', area: 'Pan Bazaar', tier: 3, rank: 23, distanceFromDispur: '~8 km',
    themes: ['park-garden', 'family-attraction'],
    highlight: 'Central green space suitable for a short relaxed visit.' },

  { name: 'Shraddhanjali Kanan', area: 'RG Baruah Road', tier: 3, rank: 24, distanceFromDispur: '~5 km',
    themes: ['park-garden', 'family-attraction'],
    highlight: 'Urban recreational space used for leisure and public gatherings.' },

  { name: 'Lachit Borphukan Maidam', area: 'Near Saraighat', tier: 3, rank: 25, distanceFromDispur: '~15-18 km',
    themes: ['historical-site', 'cultural-centre'],
    highlight: "Memorial associated with Assam's celebrated Ahom general Lachit Borphukan." },

  { name: 'Dr. Bhupen Hazarika Samadhi Kshetra', area: 'Jalukbari', tier: 3, rank: 26, distanceFromDispur: '~12-15 km',
    themes: ['historical-site', 'cultural-centre', 'scenic-nature'],
    highlight: "Memorial to one of Assam's most influential cultural figures." },

  { name: 'Guwahati War Cemetery', area: 'Silpukhuri', tier: 3, rank: 27, distanceFromDispur: '~8 km',
    themes: ['historical-site', 'museum-heritage'],
    highlight: 'Commonwealth War Graves cemetery connected to the World War II era.' },

  { name: 'Ambari Archaeological Site', area: 'Ambari', tier: 3, rank: 28, distanceFromDispur: '~7 km',
    themes: ['archaeological-site', 'historical-site', 'museum-heritage'],
    highlight: 'Important archaeological remains within Guwahati.' },

  { name: 'North Guwahati Heritage Area', area: 'North Bank', tier: 3, rank: 29, distanceFromDispur: '~15-20 km',
    themes: ['historical-site', 'cultural-centre', 'scenic-nature', 'day-trip'],
    highlight: 'Cluster of historic sites, old settlements and Brahmaputra landscapes.' },

  { ...fromTemple('Bhubaneshwari Temple'), tier: 3, rank: 30, distanceFromDispur: '~15-20 km',
    themes: ['viewpoint', 'scenic-nature', 'temple-religious'],
    highlight: 'Elevated location with broad views across the Brahmaputra and surrounding landscape.' },

  { name: 'Garanga Beel', area: 'Pobitora', tier: 3, rank: 31, distanceFromDispur: '~45-50 km',
    themes: ['wetland', 'scenic-nature', 'wildlife-sanctuary', 'day-trip'],
    highlight: 'Wetland landscape that fits naturally into a Pobitora-Mayong excursion.' },

  { name: 'Rani Reserve Forest / Rani Area', area: 'Southwest Guwahati', tier: 3, rank: 32, distanceFromDispur: '~25-30 km',
    themes: ['scenic-nature', 'wildlife-sanctuary', 'adventure-activity'],
    highlight: 'Forested outskirts offering a more natural experience away from the city.' },

  // "Nature Resorts" dropped from this entry's themes — Resorts/Hotels
  // will be their own separate category later, not folded in here.
  { name: 'Chandrapur', area: 'Northeast Guwahati', tier: 3, rank: 33, distanceFromDispur: '~30-35 km',
    themes: ['scenic-nature', 'lake-water-body', 'day-trip'],
    highlight: 'Green semi-rural landscape on the outskirts of Guwahati.' },

  // "Resorts" dropped from this entry's themes for the same reason.
  { name: 'Sonapur', area: 'Southeast Guwahati', tier: 3, rank: 34, distanceFromDispur: '~25-30 km',
    themes: ['scenic-nature', 'adventure-activity', 'day-trip'],
    highlight: 'Rural and forested outskirts suited to nature-oriented excursions.' },

  { name: 'Highest View Point, Jorabat', area: 'Jorabat', tier: 3, rank: 35, distanceFromDispur: '~25 km',
    themes: ['viewpoint', 'scenic-nature'],
    highlight: 'Elevated roadside viewpoint around the Guwahati-Meghalaya gateway.' },

  // Three more real cruise operators, researched directly (not from a
  // source document) — kept at Tier 2 rather than Tier 1 alongside
  // Alfresco Grand, since Alfresco is the single most recognized name
  // among them and Tier 1 already had a full, deliberate set of 9 places.
  { name: 'Star Cruise Brahmaputra', area: 'Gateway Terminal, Fancy Bazaar', tier: 2, rank: 36, distanceFromDispur: '~8-12 km',
    themes: ['river-experience', 'scenic-nature'],
    highlight: 'A well-established cruise operator offering sunset, lunch, and dinner sailings, plus newer full-day island-excursion packages to Umananda and Lenga River Island. Phone: +91-7577966666.' },

  { name: 'MV Kohuwa Bon', area: 'Gateway Terminal, Fancy Bazaar', tier: 2, rank: 37, distanceFromDispur: '~8-12 km',
    themes: ['river-experience', 'scenic-nature'],
    highlight: 'A boutique twin-deck houseboat cruise with Assamese-inspired cabin interiors, live music, and complimentary snacks — the highest-rated of the short Brahmaputra cruises.' },

  // Tier 3, not Tier 2: unlike the three cruises above (each a same-day
  // evening outing), this is a multi-night commitment and genuinely a
  // different kind of trip, not a quick addition to a short Guwahati
  // visit — reflected honestly in its highlight text below rather than
  // implying it fits into a single day's plan.
  { name: 'MV Mahabaahu', area: 'Pandu Port', tier: 3, rank: 38, distanceFromDispur: '~10 km',
    themes: ['river-experience', 'scenic-nature'],
    highlight: 'A multi-night luxury river cruise (2-7 nights) between Guwahati and Jorhat, with en-suite cabins, a pool, spa, and guided Kaziranga wildlife excursions along the way — a separate multi-day trip in its own right, not a same-day activity, and only runs October-April. Contact: 098118 40940.' },
];

// Never name-matchable in this file — guarantees the deliberate exclusion
// above holds even if a future edit tries to add one of these back.
const CROSS_REFERENCED_NAMES = new Set([
  'Maa Kamakhya Temple',
  'Umananda Temple',
  'Basistha Temple & Ashram',
  'Madan Kamdev Temple Complex',
  'Bhubaneshwari Temple',
  'Dighalipukhuri Park',
]);

const NAME_KEYWORDS = [
  // Deliberately no generic "river cruise"/"sunset cruise" pattern here —
  // a name match narrows EXCLUSIVELY to that one entry, so a generic
  // phrase like that would wrongly hide the other three real cruises. A
  // genuinely generic cruise question is left to fall through to the
  // theme match instead ('river-experience', which "cruise"/"boat"
  // already trigger below), correctly surfacing all four real operators.
  { pattern: /alfresco\s?grand/, name: 'Alfresco Grand' },
  { pattern: /star\s?cruise(\s?brahmaputra)?/, name: 'Star Cruise Brahmaputra' },
  { pattern: /kohuwa\s?bon/, name: 'MV Kohuwa Bon' },
  { pattern: /mahabaahu/, name: 'MV Mahabaahu' },
  { pattern: /assam\s?state\s?zoo|\bzoo\b|botanical\s?garden/, name: 'Assam State Zoo cum Botanical Garden' },
  { pattern: /pobitora/, name: 'Pobitora Wildlife Sanctuary' },
  { pattern: /sankaradeva|kalakshetra/, name: 'Srimanta Sankaradeva Kalakshetra' },
  { pattern: /deepor\s?beel/, name: 'Deepor Beel' },
  { pattern: /ropeway/, name: 'Guwahati Ropeway' },
  { pattern: /\bmayong\b/, name: 'Mayong' },
  { pattern: /state\s?museum/, name: 'Assam State Museum' },
  { pattern: /sualkuchi/, name: 'Sualkuchi' },
  { pattern: /river\s?heritage\s?centre|brahmaputra\s?heritage/, name: 'Brahmaputra River Heritage Centre' },
  { pattern: /gandhi\s?mandap/, name: 'Gandhi Mandap' },
  { pattern: /amchang/, name: 'Amchang Wildlife Sanctuary' },
  { pattern: /chandubi/, name: 'Chandubi Lake' },
  { pattern: /pobitora\s*[-–]\s*mayong|mayong\s*[-–]\s*pobitora/, name: 'Pobitora-Mayong Circuit' },
  { pattern: /planetarium/, name: 'Guwahati Planetarium' },
  { pattern: /science\s?cent(re|er)/, name: 'Regional Science Centre' },
  { pattern: /shilpagram/, name: 'Shilpagram' },
  { pattern: /nehru\s?park/, name: 'Nehru Park' },
  { pattern: /shraddhanjali\s?kanan/, name: 'Shraddhanjali Kanan' },
  { pattern: /lachit\s?borphukan|\bmaidam\b/, name: 'Lachit Borphukan Maidam' },
  { pattern: /bhupen\s?hazarika|samadhi\s?kshetra/, name: 'Dr. Bhupen Hazarika Samadhi Kshetra' },
  { pattern: /war\s?cemetery/, name: 'Guwahati War Cemetery' },
  { pattern: /ambari\s?archaeological/, name: 'Ambari Archaeological Site' },
  { pattern: /north\s?guwahati\s?heritage/, name: 'North Guwahati Heritage Area' },
  { pattern: /garanga\s?beel/, name: 'Garanga Beel' },
  { pattern: /rani\s?reserve|rani\s?forest/, name: 'Rani Reserve Forest / Rani Area' },
  { pattern: /chandrapur/, name: 'Chandrapur' },
  { pattern: /sonapur/, name: 'Sonapur' },
  { pattern: /jorabat/, name: 'Highest View Point, Jorabat' },
];

// Deliberately no keyword for 'temple-religious' or 'park-garden' — see
// the file-level comment above. Every other theme from the source
// document's "Falls Under" column gets a normal trigger.
const THEME_KEYWORDS = [
  { pattern: /\bhistorical\b|\bhistory\b|\bmemorial\b/, theme: 'historical-site' },
  { pattern: /\bmuseum\b|\bheritage\b/, theme: 'museum-heritage' },
  { pattern: /\bcultural\b|\bculture\b/, theme: 'cultural-centre' },
  { pattern: /viewpoint|view\s?point/, theme: 'viewpoint' },
  { pattern: /\bcruises?\b|\bboat(ing)?\b|riverfront|\briver\b/, theme: 'river-experience' },
  { pattern: /\bscenic\b|\bnature\b|natural/, theme: 'scenic-nature' },
  { pattern: /\bzoo\b|botanical\s?garden/, theme: 'zoo-botanical-garden' },
  { pattern: /wildlife|sanctuary|safari|\brhino/, theme: 'wildlife-sanctuary' },
  { pattern: /\bfamily\b|\bkids\b|\bchildren\b/, theme: 'family-attraction' },
  { pattern: /wetland/, theme: 'wetland' },
  { pattern: /\blake\b|water\s?body/, theme: 'lake-water-body' },
  { pattern: /archaeolog/, theme: 'archaeological-site' },
  { pattern: /day\s?trip|excursion|day\s?tour/, theme: 'day-trip' },
  { pattern: /adventure|\bactivit(y|ies)\b/, theme: 'adventure-activity' },
];

const AREA_KEYWORDS = [
  { pattern: /japorigog/, area: 'Japorigog' },
  { pattern: /morigaon/, area: 'Morigaon' },
  { pattern: /panjabari/, area: 'Panjabari' },
  { pattern: /southwest\s?guwahati/, area: 'Southwest Guwahati' },
  { pattern: /\bambari\b/, area: 'Ambari' },
  { pattern: /north\s?bank/, area: 'North Bank' },
  { pattern: /sarania/, area: 'Sarania Hills' },
  { pattern: /east\s?guwahati/, area: 'East Guwahati' },
  { pattern: /\bboko\b/, area: 'Boko' },
  { pattern: /pan\s?bazaar/, area: 'Pan Bazaar' },
  { pattern: /uzan\s?bazaar/, area: 'Uzan Bazaar' },
  { pattern: /khanapara/, area: 'Khanapara' },
  { pattern: /rg\s?baruah\s?road/, area: 'RG Baruah Road' },
  { pattern: /saraighat/, area: 'Saraighat' },
  { pattern: /jalukbari/, area: 'Jalukbari' },
  { pattern: /silpukhuri/, area: 'Silpukhuri' },
  { pattern: /north\s?guwahati/, area: 'North Guwahati' },
  { pattern: /southeast\s?guwahati/, area: 'Southeast Guwahati' },
  { pattern: /northeast\s?guwahati/, area: 'Northeast Guwahati' },
  { pattern: /jorabat/, area: 'Jorabat' },
];

// Deliberately permissive on "see"/"do"/"visit"/"explore" phrasing — real
// visitors ask this many different ways ("what should I see," "what can
// I see," "things to see," "where to explore"), not just the one exact
// phrase "what to see." Found missing during testing: "what should I do
// in Guwahati" (an extremely natural phrasing) originally matched
// nothing at all, since "do" was only allowed after "things to ___", not
// after "what should/can/to (i) ___" — added it there too. Also found
// missing: "river exploration" — the bare verb pattern \bexplore\b never
// matches its own noun form "exploration," so a real, natural question
// like "details of river exploration in Guwahati" matched nothing at all
// (confirmed live: the reply fell back to a vague, generic answer
// instead of naming any of the real cruise operators or ferry points).
// Broadened to \bexplor(e|ing|ation)\b to also catch "exploring" and
// "exploration," not just the bare verb.
const SIGHTSEEING_TRIGGER =
  /\bsightseeing\b|things?\s?to\s?(do|see)|places?\s?to\s?(see|visit|explor(e|ing))|what\s?(should|can|to)\s?(i\s?)?(do|see|visit|explor(e|ing))|\battractions?\b|\bexcursions?\b|day\s?trips?|\bexplor(e|ing|ation)\b/;

const TOP_N = 10;

function matchNames(text) {
  const matched = [];
  for (const { pattern, name } of NAME_KEYWORDS) {
    if (pattern.test(text)) matched.push(name);
  }
  return matched;
}

function matchThemes(text) {
  const matched = new Set();
  for (const { pattern, theme } of THEME_KEYWORDS) {
    if (pattern.test(text)) matched.add(theme);
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

// A named place (from the 29 not cross-referenced elsewhere) or a real
// theme/area match always narrows. A genuinely broad "what to see"/
// "things to do" question with no name/theme/area falls back to the 9
// Tier 1 places, sorted by the source document's own rank — the same
// fallback role tier plays in temples.js/cinemas.js.
function getRelevantAttractions(message) {
  const text = message.toLowerCase();

  const matchedNames = matchNames(text).filter((name) => !CROSS_REFERENCED_NAMES.has(name));
  const matchedThemes = matchThemes(text);
  const matchedAreas = matchAreas(text);

  const isSightseeingQuestion =
    SIGHTSEEING_TRIGGER.test(text) || matchedNames.length > 0 || matchedThemes.size > 0;
  if (!isSightseeingQuestion) return [];

  if (matchedNames.length > 0) {
    return attractions.filter((a) => matchedNames.includes(a.name));
  }

  let results = attractions;
  if (matchedThemes.size > 0) {
    results = results.filter((a) => a.themes.some((t) => matchedThemes.has(t)));
  }
  if (matchedAreas.length > 0) {
    results = results.filter((a) => matchedAreas.some((area) => a.area.toLowerCase().includes(area.toLowerCase())));
  }

  const noSpecificFilter = matchedThemes.size === 0 && matchedAreas.length === 0;
  if (noSpecificFilter) {
    results = attractions.filter((a) => a.tier === 1);
  }

  const sorted = [...results].sort((a, b) => a.rank - b.rank);
  return sorted.slice(0, TOP_N);
}

module.exports = { attractions, getRelevantAttractions };
