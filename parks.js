// A hand-verified directory of Guwahati parks, compiled from a dedicated
// parks PDF. Same "mini RAG" idea as restaurants.js/venues.js: instead of
// sending this whole list to Gemini on every message, getRelevantParks()
// below only returns the parks that actually match what the visitor asked
// about. Matching is driven by "activities" (what a park is used for —
// boating, walking, photography, etc.), the direct analog of restaurants'
// cuisines or nightlife's tags.
//
// Unlike restaurants/venues, parks have no star rating in the source data,
// and entry fees are too nuanced (free-entry windows, senior/child
// exemptions, extra charges for boating/light shows) to force into a
// single number — entryFee stays a descriptive string on purpose.

const parks = [
  { name: 'Brahmaputra Riverfront Park', area: 'Pan Bazar',
    activities: ['walking', 'river-view', 'photography', 'sunset', 'fitness'],
    daysOff: 'None', entryFee: '₹60 (free 5:00-10:00 AM; kids under 9 & seniors over 75 free)',
    highlight: '1.2 km paved riverbank promenade, illuminated fountains, open-air gym & viewing decks.' },
  { name: 'Sati Radhika Shanti Udyan (Uzanbazar Riverfront)', area: 'Uzan Bazar',
    activities: ['river-view', 'sunset', 'family', 'cultural'],
    daysOff: 'None', entryFee: '₹60 (free 6:00-10:00 AM; kids under 9 & seniors over 75 free)',
    highlight: 'Overlook deck, 7 decorative Assamese cultural gates, sensory sound playground.' },
  { name: 'Botanical Garden Guwahati', area: 'Fancy Bazar',
    activities: ['jogging', 'walking', 'fitness'],
    daysOff: 'Wednesday', entryFee: '₹60 (free morning walk access)',
    highlight: '2.5 km jogging track, 230+ plant species, lotus pond, yoga corner & bamboo tunnel.' },
  { name: 'Nehru Park', area: 'Pan Bazar',
    activities: ['cultural', 'picnic', 'kids-play'],
    daysOff: 'Thursday', entryFee: '₹50 (free for morning walkers)',
    highlight: "45 life-sized Assamese folk dance sculptures, musical fountain & mini toy train." },
  { name: 'Shraddhanjali Kanan', area: 'Tarun Nagar (opposite Zoo Road)',
    activities: ['walking', 'family', 'kids-play'],
    daysOff: 'Tuesday', entryFee: '₹30 (free morning walk access till 8:00 AM)',
    highlight: 'Illuminated musical fountains, landscaped gardens, kids rides & amphitheatre.' },
  { name: 'Amrit Udyan', area: 'Hengrabari',
    activities: ['walking', 'heritage', 'roller-skating', 'fitness'],
    daysOff: 'Monday', entryFee: '₹30 (free morning walk access 5:00-8:00 AM)',
    highlight: 'Statues of 8 NE tribal freedom fighters, roller-skating rink & rock-climbing wall.' },
  { name: 'Atal Udyan', area: 'Adabari',
    activities: ['fitness', 'walking', 'kids-play'],
    daysOff: 'Monday', entryFee: '₹30 (free morning walk access till 8:00 AM)',
    highlight: 'Manicured gardens, kids playground, paved trails & shaded gazebos.' },
  { name: 'Jor Pukhuri Park', area: 'Uzan Bazar',
    activities: ['birdwatching', 'photography', 'walking', 'heritage', 'relaxation'],
    daysOff: 'Monday', entryFee: '₹20 (free 6:00-10:00 AM; kids under 9 & seniors over 75 free)',
    highlight: 'Historic Ahom twin ponds, protected turtle & swan habitat, perimeter trail.' },
  { name: 'Dighalipukhuri Park', area: 'Ambari (Central Guwahati)',
    activities: ['boating', 'walking', 'heritage'],
    daysOff: 'None', entryFee: '₹20 (boating extra, approx. ₹50 per person)',
    highlight: 'Paddle boat rentals, lakeside paved promenade & open-air War Memorial display.' },
  { name: 'Gandhi Mandap Park', area: 'Sarania Hills',
    activities: ['panoramic-view', 'light-show', 'museum'],
    daysOff: 'None', entryFee: '₹20 (additional ₹10 for the light show)',
    highlight: 'Tallest national flag mast, museum & evening sound-and-light show.' },
  { name: 'Mahabahu Brahmaputra River Heritage Centre', area: 'Pan Bazar (Latasil)',
    activities: ['heritage', 'river-view', 'museum'],
    daysOff: 'Monday', entryFee: '₹150',
    highlight: 'Restored DC bungalow, art gallery, open amphitheatre & riverside cafe.' },
  { name: 'Sankardev Udyan', area: 'Bharalumukh',
    activities: ['sunset', 'river-view', 'relaxation'],
    daysOff: 'None', entryFee: '₹10 (free morning entry)',
    highlight: 'Direct view of Brahmaputra River, open gazebos & cultural statue.' },
  { name: 'Deshbhakta Tarun Ram Phukan Park', area: 'Bharalumukh',
    activities: ['river-view', 'relaxation', 'jogging', 'kids-play'],
    daysOff: 'None', entryFee: '₹10-₹20 (free before 8:00 AM)',
    highlight: 'Paved riverfront walkway, green lawns & play equipment.' },
  { name: 'Saraighat War Memorial Park', area: 'Agyathuri',
    activities: ['heritage', 'river-view'],
    daysOff: 'None', entryFee: '₹20',
    highlight: 'Bronze battle reliefs of the 1671 Battle of Saraighat & terraced river garden.' },
  { name: 'Swahid Udyan', area: 'Ambari',
    activities: ['walking', 'relaxation', 'kids-play', 'heritage'],
    daysOff: 'None', entryFee: '₹25',
    highlight: "Martyrs' monument, manicured paths & children play area." },
  { name: 'Silpukhuri Park', area: 'Silpukhuri',
    activities: ['relaxation', 'walking'],
    daysOff: 'None', entryFee: 'Free',
    highlight: 'Renovated water tank walkway, benches & lighting.' },
  { name: 'Doulagup Park', area: 'Maligaon',
    activities: ['jogging', 'kids-play'],
    daysOff: 'None', entryFee: 'Free',
    highlight: 'Dedicated running track, flowerbeds & playground.' },
];

// Activity keyword lookup — one row per canonical activity actually used
// above, with common synonyms folded in.
const ACTIVITY_KEYWORDS = [
  { pattern: /\bwalk(ing|s)?\b|\bstrolls?\b/, activity: 'walking' },
  { pattern: /\bjog(ging|s)?\b|\brunning\b|\bexercise\b/, activity: 'jogging' },
  { pattern: /\bboat(ing|s)?\b|paddle\s?boat/, activity: 'boating' },
  { pattern: /\bphoto(s|graphy|graph)?\b/, activity: 'photography' },
  { pattern: /\bbird(s|watching)?\b/, activity: 'birdwatching' },
  { pattern: /\bsunset\b/, activity: 'sunset' },
  { pattern: /\briver\s?view\b|\briverside\b|\bbrahmaputra\b/, activity: 'river-view' },
  { pattern: /panoramic|city\s?view/, activity: 'panoramic-view' },
  { pattern: /\bheritage\b|\bhistor(y|ic|ical)\b|\bmemorial\b/, activity: 'heritage' },
  { pattern: /\bpicnics?\b/, activity: 'picnic' },
  { pattern: /kids?\s?(play|amusement)|children/, activity: 'kids-play' },
  { pattern: /\bfamily\b/, activity: 'family' },
  { pattern: /\bcultural\b|\bculture\b/, activity: 'cultural' },
  { pattern: /\bfitness\b|\byoga\b|\bgym\b|rock[- ]?climbing/, activity: 'fitness' },
  { pattern: /roller[- ]?skat/, activity: 'roller-skating' },
  { pattern: /\brelax(ing|ation)?\b|\bquiet\b|\bpeaceful\b/, activity: 'relaxation' },
  { pattern: /light\s?show|sound[- ]and[- ]light/, activity: 'light-show' },
  { pattern: /\bmuseum\b|art\s?gallery/, activity: 'museum' },
];

// Area keyword lookup — one row per distinct Location value used above.
const AREA_KEYWORDS = [
  { pattern: /pan\s?bazar/, area: 'Pan Bazar' },
  { pattern: /uzan\s?bazar/, area: 'Uzan Bazar' },
  { pattern: /fancy\s?bazar/, area: 'Fancy Bazar' },
  { pattern: /tarun\s?nagar/, area: 'Tarun Nagar' },
  { pattern: /hengrabari/, area: 'Hengrabari' },
  { pattern: /adabari/, area: 'Adabari' },
  { pattern: /\bambari\b/, area: 'Ambari' },
  { pattern: /sarania/, area: 'Sarania Hills' },
  { pattern: /bharalumukh/, area: 'Bharalumukh' },
  { pattern: /agyathuri/, area: 'Agyathuri' },
  { pattern: /silpukhuri/, area: 'Silpukhuri' },
  { pattern: /maligaon/, area: 'Maligaon' },
];

// "Open every day" is one of the explicit examples this feature needs to
// support, so it gets its own dedicated filter rather than being left to
// chance in the highlight text.
const OPEN_DAILY_TRIGGER = /open\s*(every\s*day|daily|all\s*(week|days))|no\s*(off\s*day|holiday)/;

const PARK_TRIGGER = /\bparks?\b|\bgardens?\b|\budyan\b|\bkanan\b|\briverfront\b|\bpromenade\b/;

function matchActivities(text) {
  const matched = new Set();
  for (const { pattern, activity } of ACTIVITY_KEYWORDS) {
    if (pattern.test(text)) matched.add(activity);
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
// parks. Returns [] both when the message isn't park-related at all, and
// when it's a park question too generic to narrow down (there's no
// "top-rated" fallback here the way restaurants has, since parks have no
// rating field) — systemPrompt.js asks a clarifying question in that case.
function getRelevantParks(message) {
  const text = message.toLowerCase();

  const matchedActivities = matchActivities(text);
  const matchedAreas = matchAreas(text);
  const openDaily = OPEN_DAILY_TRIGGER.test(text);

  const isParkQuestion = PARK_TRIGGER.test(text) || matchedActivities.size > 0;
  if (!isParkQuestion) return [];

  const noSpecificFilter = matchedActivities.size === 0 && matchedAreas.length === 0 && !openDaily;
  if (noSpecificFilter) return [];

  let results = parks;
  if (matchedActivities.size > 0) {
    results = results.filter((p) => p.activities.some((a) => matchedActivities.has(a)));
  }
  if (matchedAreas.length > 0) {
    results = results.filter((p) => matchedAreas.some((area) => p.area.toLowerCase().includes(area.toLowerCase())));
  }
  if (openDaily) {
    results = results.filter((p) => p.daysOff === 'None');
  }

  return results;
}

module.exports = { parks, getRelevantParks };
