// A hand-verified directory of Guwahati cinemas/multiplexes, transcribed
// from "Guwahati Multiplex & Cinema Guide" (BookMyShow-verified, September
// 2026). Same "mini RAG" idea as the other category files: instead of
// sending this whole list to Gemini on every message, getRelevantCinemas()
// below only returns the cinemas that actually match what the visitor
// asked about.
//
// Deliberately narrower than the other category files, by explicit
// decision when this was built: no rating field (the source has none —
// `tier` is the only prominence signal, the same role it plays in
// temples.js), no type-based matching (the source's "Type" column is
// inconsistent free text, not a clean vocabulary — dropped rather than
// guessed at), and no showtime/pricing/seat-availability data of any kind
// (the source itself says that must come from a live booking source this
// app doesn't have — the chatbot's existing general "say so honestly
// rather than guessing" rule already covers a "what's playing tonight"
// question without any cinema-specific wording needed here).
const cinemas = [
  { name: 'INOX: Aurus', area: 'Aurus Mall, Dispur', tier: 1,
    bestFor: 'Premium movie-going experience, mainstream releases, mall dining and leisure.',
    highlight: "Best premium option for a special movie outing, combining naturally with Aurus Mall — part of Guwahati's modern GS Road mall-and-entertainment corridor.",
    tip: "Use live listings for today's show, screen and seat availability." },

  { name: 'PVR: City Centre', area: 'City Centre Mall, Christian Basti', tier: 1,
    bestFor: 'Mainstream Bollywood, Hollywood and regional releases; mall dining and shopping.',
    highlight: 'One of the strongest central choices for visitors combining shopping and a movie, located in a major modern shopping and entertainment destination.',
    tip: 'Check live showtimes rather than static hours.' },

  { name: 'Cinepolis: Central Mall', area: 'Central Mall, Christian Basti', tier: 1,
    bestFor: 'Mainstream releases and mall-based movie experience.',
    highlight: 'The principal modern cinema option in the GS Road/Christian Basti cluster, part of the established GS Road retail and entertainment corridor.',
    tip: 'Ideal for shopping + movie itineraries.' },

  { name: 'INOX: NCS Square', area: 'NCS Square Mall, Adabari', tier: 1,
    bestFor: 'Mainstream releases, food, parking and western Guwahati convenience.',
    highlight: 'The best major multiplex choice for Adabari/west Guwahati, located in a major west-Guwahati retail/transport corridor.',
    tip: 'Check live show and screen details.' },

  { name: 'Devgn CineX: Roodraksh Mall', area: 'Roodraksh Mall, Bhangagarh', tier: 2,
    bestFor: 'Mainstream film releases and mall-based cinema.',
    highlight: 'A strong alternative on the central GS Road stretch, located in the established Roodraksh Mall retail cluster.',
    tip: 'Useful when already around Bhangagarh/Lachit Nagar.' },

  { name: 'Matrix Cinemas: Matrix Mall', area: 'Matrix Mall, Beltola', tier: 2,
    bestFor: 'Mainstream releases for southern Guwahati.',
    highlight: "Convenient for Beltola, Basistha and Six Mile, part of southern Guwahati's growing retail corridor.",
    tip: 'Use live listings for current movies.' },

  { name: 'Grande Cines: Paltan Bazaar', area: 'Grand Plaza, Paltan Bazaar', tier: 2,
    bestFor: 'Mainstream releases and central-city convenience.',
    highlight: 'Useful for travellers near the railway station and Paltan Bazaar, part of the central commercial/transport hub.',
    tip: 'Easy to combine with Paltan Bazaar shopping.' },

  { name: 'Galleria Cinema: HUB Mall', area: 'Hub Mall, Bhangagarh', tier: 2,
    bestFor: 'Mainstream films and mall-based cinema.',
    highlight: "Convenient Bhangagarh/GS Road option, part of one of Guwahati's established mall clusters.",
    tip: 'Check current screen/show listings.' },

  { name: 'TS Cinemas: Times Square Mall', area: 'Times Square Mall, Zoo Road', tier: 2,
    bestFor: 'Mainstream releases for eastern-central Guwahati.',
    highlight: 'Convenient for Zoo Road and surrounding areas, part of the RG Baruah Road/Zoo Road retail corridor.',
    tip: 'Combine with Zoo Road-area activities.' },

  { name: 'Anuradha Cineplex', area: 'Bamunimaidan', tier: 2,
    bestFor: 'Mainstream film programming and local audience experience.',
    highlight: 'A useful Bamunimaidan-side cinema and a more local alternative to large chains — an established cinema identity in the eastern-central city.',
    tip: 'Check live schedule before travelling.' },

  { name: 'Grand Royal Cines, Sixmile', area: 'NRB City Mall, Six Mile/Khanapara', tier: 2,
    bestFor: 'Mainstream releases.',
    highlight: 'Convenient for Six Mile/Khanapara/southern Guwahati, part of the southern GS Road retail cluster.',
    tip: 'Good shopping + movie combination.' },

  { name: 'Aideo Cinema Hall', area: 'ASFFDC, Panjabari', tier: 3,
    bestFor: 'Cinema and local cultural programming.',
    highlight: 'More locally rooted than a national-chain multiplex and relevant to Panjabari cultural programming, located within the Assam State Film Finance and Development Corporation complex.',
    tip: 'Check programme schedule before visiting.' },

  { name: 'Kelvin Gold Cinema', area: 'Shradhanjali Complex, Fancy Bazaar', tier: 3,
    bestFor: 'Mainstream movie releases in the Fancy Bazaar area.',
    highlight: 'Useful when shopping or staying around Fancy Bazaar; the current BookMyShow directory identifies it as newly opened.',
    tip: 'Use a live booking source for current films.' },

  { name: 'RR Cinemas', area: 'VIP Azara, near the airport', tier: 3,
    bestFor: 'Mainstream film programming near the airport side.',
    highlight: 'Useful for Azara/airport-side visitors — a neighbourhood-level cinema option.',
    tip: 'Check the live listing before making a dedicated trip.' },

  { name: 'Gold Cinema: Narengi', area: 'LG Tower Tiniali, Narengi', tier: 3,
    bestFor: 'Mainstream releases for eastern Guwahati.',
    highlight: 'Convenient for Narengi and nearby eastern neighbourhoods — a neighbourhood cinema serving the local market.',
    tip: 'Use live show listings.' },

  { name: 'Silver Screen (AC Dolby 7.1), Bijoynagar', area: 'Chhaygaon–Guwahati Road, Bijoynagar', tier: 3,
    bestFor: 'Mainstream cinema for the western/southwestern approach to Guwahati.',
    highlight: "Relevant only when a visitor's route includes the Bijoynagar/Chhaygaon side — a local cinema serving the wider Guwahati-Kamrup corridor.",
    tip: 'Do not recommend for a central-city tourist unless the location genuinely makes sense for their route.' },
];

// Name keyword lookup — lets a visitor ask about one specific cinema by
// name/alias and get just that one, rather than falling through to the
// Tier 1 default. The two INOX branches are disambiguated by their mall
// name ("Aurus" vs "NCS Square"), not the shared "INOX" brand name.
const NAME_KEYWORDS = [
  { pattern: /aurus/, name: 'INOX: Aurus' },
  { pattern: /\bpvr\b|city\s?cent(re|er)/, name: 'PVR: City Centre' },
  { pattern: /cinepolis/, name: 'Cinepolis: Central Mall' },
  { pattern: /ncs\s?square/, name: 'INOX: NCS Square' },
  { pattern: /devgn|cinex|roodraksh/, name: 'Devgn CineX: Roodraksh Mall' },
  { pattern: /matrix/, name: 'Matrix Cinemas: Matrix Mall' },
  { pattern: /grande\s?cines?/, name: 'Grande Cines: Paltan Bazaar' },
  { pattern: /galleria|hub\s?mall/, name: 'Galleria Cinema: HUB Mall' },
  { pattern: /\bts\s?cinemas?\b|times\s?square/, name: 'TS Cinemas: Times Square Mall' },
  { pattern: /anuradha/, name: 'Anuradha Cineplex' },
  { pattern: /grand\s?royal/, name: 'Grand Royal Cines, Sixmile' },
  { pattern: /aideo/, name: 'Aideo Cinema Hall' },
  { pattern: /kelvin/, name: 'Kelvin Gold Cinema' },
  { pattern: /\brr\s?cinemas?\b/, name: 'RR Cinemas' },
  { pattern: /narengi/, name: 'Gold Cinema: Narengi' },
  { pattern: /silver\s?screen|bijoynagar|chhaygaon/, name: 'Silver Screen (AC Dolby 7.1), Bijoynagar' },
];

// Area keyword lookup — its own table, mirroring the exact areas used in
// the source document's own "Recommendations by Intent" table.
const AREA_KEYWORDS = [
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  { pattern: /adabari/, area: 'Adabari' },
  { pattern: /bhangagarh/, area: 'Bhangagarh' },
  { pattern: /beltola|basistha/, area: 'Beltola' },
  { pattern: /paltan\s?bazaar/, area: 'Paltan Bazaar' },
  { pattern: /zoo\s?road/, area: 'Zoo Road' },
  { pattern: /bamunimaidan|jyotinagar/, area: 'Bamunimaidan' },
  { pattern: /six\s?mile|sixmile|khanapara/, area: 'Six Mile' },
  { pattern: /panjabari/, area: 'Panjabari' },
  { pattern: /fancy\s?bazaar/, area: 'Fancy Bazaar' },
  { pattern: /azara|airport/, area: 'Azara' },
  { pattern: /narengi/, area: 'Narengi' },
  { pattern: /bijoynagar|chhaygaon/, area: 'Bijoynagar' },
];

const CINEMA_TRIGGER = /\bcinemas?\b|\bmovies?\b|\bfilms?\b|multiplex(es)?|theat(re|er)s?|\bpvr\b|\binox\b|cinepolis/;

function matchNames(text) {
  const matched = [];
  for (const { pattern, name } of NAME_KEYWORDS) {
    if (pattern.test(text)) matched.push(name);
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
// cinemas. A specific cinema name always narrows to just that one. A
// vague question with no name/area given returns Tier 1 only — the 4
// best-known, most central multiplexes — the same fallback role `tier`
// plays in temples.js. Returns [] only when the message isn't about
// cinemas/movies at all.
function getRelevantCinemas(message) {
  const text = message.toLowerCase();

  const matchedNames = matchNames(text);
  const matchedAreas = matchAreas(text);

  const isCinemaQuestion = CINEMA_TRIGGER.test(text) || matchedNames.length > 0;
  if (!isCinemaQuestion) return [];

  let results = cinemas;
  if (matchedNames.length > 0) {
    results = results.filter((c) => matchedNames.includes(c.name));
  }
  if (matchedAreas.length > 0) {
    results = results.filter((c) => matchedAreas.some((area) => c.area.toLowerCase().includes(area.toLowerCase())));
  }

  const noSpecificFilter = matchedNames.length === 0 && matchedAreas.length === 0;
  if (noSpecificFilter) {
    return cinemas.filter((c) => c.tier === 1);
  }

  return results;
}

module.exports = { cinemas, getRelevantCinemas };
