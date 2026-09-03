// A hand-verified directory of Guwahati transport: the fixed hubs you'd
// arrive at or depart from (airport, railway, bus, water terminal, ferry
// ghats), plus real private cab-hire and self-drive rental businesses
// for inter-state/intra-state trips. Same "mini RAG" idea as every other
// category file. Kept in one file, same reasoning as accommodations.js —
// the three groups are all "how do I get around" questions, just
// answered from different data shapes.
//
// Unlike most categories, none of these three carry day/order itinerary
// fields — arriving somewhere, or booking a cab, isn't a sequenced daily
// activity the way a temple visit or a game of badminton is, same
// reasoning already applied to accommodations.js.
//
// Cab-hire and self-drive ratings/review counts come from a mix of
// Google and aggregator sites (Justdial, SafarCabby) depending on what
// each business's own listings actually showed during research — unlike
// every other category in this app, which consistently cites Google.
// Noted here, and in the highlight text's honesty framing, rather than
// overstating a single consistent source. Every entry below was checked
// against at least two independent sources before being included; two
// real candidates were deliberately left out after research: "Gear Up
// Now" self-drive (a same-area listing under a similar name was flagged
// "Closed Down," so current operating status couldn't be confirmed), and
// "Mini Taxi Tours & Travels" cab-hire (a real, well-rated business, but
// no phone number could be confirmed after two separate searches).

const transportHubs = [
  { name: 'Lokpriya Gopinath Bordoloi International Airport', area: 'Borjhar, ~26-28 km from Dispur',
    type: 'Airport',
    highlight: "Guwahati's only airport and the primary air gateway to all of Northeast India — domestic and international flights." },

  { name: 'Guwahati Railway Station (GHY)', area: 'Station Road, Paltan Bazaar',
    type: 'Railway Station',
    highlight: "The main railway station serving Guwahati, with direct connections across India — also India's first fully solar-powered railway station." },

  { name: 'Kamakhya Junction Railway Station (KYQ)', area: 'Kamakhya Station Road, Maligaon',
    type: 'Railway Station',
    highlight: "The second-largest railway station in Guwahati, particularly convenient for anyone travelling to or from Kamakhya Temple." },

  { name: 'ISBT Khanapara', area: 'Khanapara Flyover, Khanapara',
    type: 'Bus Terminal',
    highlight: "Guwahati's main Inter-State Bus Terminus — long-distance government and private buses to other states and cities." },

  { name: 'ASTC Bus Stand, Paltan Bazaar', area: 'Paltan Bazaar, right behind Guwahati Railway Station',
    type: 'Bus Terminal',
    highlight: 'The older, central ASTC bus stand — a convenient transfer point since it sits right next to the railway station.' },

  { name: 'Gateway of Guwahati Terminal and Jetty', area: 'Pan Bazaar',
    type: 'Water Terminal',
    highlight: "The city's modern, purpose-built river terminal and the central hub for ferries and river cruises on the Brahmaputra. Cruise pickup shifts seasonally — Pan Bazaar in winter, Uzan Bazaar in summer — as the river's water level changes." },

  { name: 'Kachari Ghat', area: 'Near Uzan Bazaar / Pan Bazaar',
    type: 'Ferry Ghat',
    highlight: 'The main traditional ferry point to Umananda Temple; also a terminal for the Guwahati Ropeway.' },

  { name: 'Sukreswar Ghat', area: 'South bank of the Brahmaputra, by Sukreswar Temple',
    type: 'Ferry Ghat',
    highlight: 'An alternative traditional ferry point to Umananda Temple.' },
];

// Real private cab-hire businesses (chauffeur-driven, book by phone/app)
// for inter-state and intra-state travel — distinct from the app-based
// ride-hailing (Uber/Ola/Rapido) mentioned for within-city questions,
// which has no dedicated entries here since there's no specific venue to
// list for those, just the fact that they operate in Guwahati.
const cabServices = [
  { name: 'Rocket Cab', area: 'Hengrabari', phone: '+91 6909700160', rating: 4.8, reviewCount: 409,
    highlight: 'Outstation tour packages across the Northeast — Shillong, Cherrapunjee, Dawki, Kaziranga, Tawang — plus airport transfers.' },

  { name: 'Assam Cabs', area: 'Bamunimaidan', phone: '09972826298', rating: 4.5, reviewCount: 313,
    highlight: 'An established (since 2014) 24-hour local and outstation cab service across Assam, Meghalaya, and Arunachal Pradesh.' },

  { name: 'Cabinnortheast', area: 'Latasil, near Guwahati High Court', phone: '8638965261', rating: 4.9, reviewCount: 49,
    highlight: 'Cab service and tours across Guwahati, Meghalaya, and Arunachal Pradesh, including airport transfers.' },

  { name: 'Jyoti Travels', area: 'Lokhra', phone: '+91 97077 69750', rating: 4.6, reviewCount: 479,
    highlight: 'An established (since 2016) car rental and travel agency for both local and outstation trips, with a fleet ranging from standard to luxury.' },

  { name: 'IGuwahati Tours & Travels', area: 'Basistha Chariali', phone: '+91 94350 16833', rating: 4.2, reviewCount: 349,
    highlight: 'A Northeast India tour and car rental company operating since 2013, with trained chauffeurs.' },

  { name: 'FuFu Gadi', area: 'Guwahati', phone: '+91 7637963112', rating: 4.9, reviewCount: null,
    highlight: 'Airport transfers, local rides, and outstation trips across Assam and the Northeast, with over 6 years in service and 10,000+ riders.' },

  { name: 'Orange Cabs', area: 'Tarun Nagar, near Assam State Zoo', phone: '9810668899', rating: 4.2, reviewCount: 31,
    highlight: 'Premium cab service for city rides, airport transfers, and outstation trips across Assam and the Northeast.' },

  { name: 'Savaari', area: 'Pan-India platform, serves Guwahati', phone: '9045450000', rating: 4.5, reviewCount: null,
    highlight: 'A large, well-known chauffeur-driven cab platform (app/website/phone booking) with hatchback-to-tempo-traveller options — trusted by over 10 lakh customers nationally.' },
];

// Real self-drive rental businesses — you drive yourself, no chauffeur.
const selfDriveServices = [
  { name: 'North East Rental', area: 'Sonaighuli', phone: '+91 74187 00125', rating: 4.9, reviewCount: 2847,
    highlight: "Guwahati's oldest and most-reviewed self-drive agency (established 2019), with over 500,000 customers served." },

  { name: 'A to Z Self Drive', area: 'At the airport, Kahikuchi', phone: '9387933157', rating: 4.8, reviewCount: 474,
    highlight: 'Open 24 hours, right at the airport — self-drive car and bike rental.' },

  { name: 'Ahija Self Drive', area: 'Zoo Road Tiniali, Ambikagirinagar', phone: '7670017670', rating: 4.4, reviewCount: 2600,
    highlight: 'A large, well-reviewed self-drive car rental fleet.' },

  { name: 'Onroadz Self Drive', area: 'Chandmari', phone: '+91 9655214888', rating: 4.8, reviewCount: 386,
    highlight: 'Self-drive car rental with a diverse fleet, including trips into Meghalaya.' },

  { name: 'Guwahati Self Drive', area: 'Ananda Nagar, GS Road', phone: '09054291505', rating: 4.3, reviewCount: 355,
    highlight: 'A self-drive fleet ranging from compact cars to SUVs, including luxury options.' },
];

const HUB_NAME_KEYWORDS = [
  { pattern: /airport|lgbi|bordoloi/, name: 'Lokpriya Gopinath Bordoloi International Airport' },
  { pattern: /kamakhya.{0,15}(railway|junction|station)/, name: 'Kamakhya Junction Railway Station (KYQ)' },
  { pattern: /guwahati\s?railway|main\s?railway\s?station|\bghy\b/, name: 'Guwahati Railway Station (GHY)' },
  { pattern: /isbt|khanapara.{0,15}bus/, name: 'ISBT Khanapara' },
  { pattern: /astc|paltan\s?bazaar.{0,15}bus/, name: 'ASTC Bus Stand, Paltan Bazaar' },
  { pattern: /gateway\s?of\s?guwahati|river\s?terminal|jetty/, name: 'Gateway of Guwahati Terminal and Jetty' },
  { pattern: /kachari\s?ghat/, name: 'Kachari Ghat' },
  { pattern: /sukreswar\s?ghat/, name: 'Sukreswar Ghat' },
];

// "Cruise" is deliberately its own Water Terminal signal, separate from
// "ferry"/"ghat" — found via testing that "where does the river cruise
// start from" originally matched only the two ferry ghats (via a shared
// "river cruise" pattern) and missed the actual cruise terminal, Gateway
// of Guwahati, which is the more precisely correct answer for that
// specific question.
const HUB_TYPE_KEYWORDS = [
  { pattern: /\bairports?\b|\bflights?\b|\bfly\b/, type: 'Airport' },
  { pattern: /railway|train\s?station|\btrains?\b/, type: 'Railway Station' },
  { pattern: /bus\s?(terminal|stand|terminus)|\bisbt\b/, type: 'Bus Terminal' },
  { pattern: /water\s?terminal|river\s?terminal|\bcruise\b|\bjetty\b/, type: 'Water Terminal' },
  { pattern: /\bferry\b|\bghat\b|boat\s?to\s?umananda/, type: 'Ferry Ghat' },
];

// Deliberately broad — "how do I get to Guwahati" / "how do I travel
// from Guwahati to X" is the single most natural way this gets asked,
// alongside naming a hub or hub-type directly.
const HUB_TRIGGER =
  /how\s?(do|can)\s?i\s?(get|travel|reach)\s?(to|from)|\btravel(ling)?\s?to\s?guwahati\b|\bwhere\s?(is|are)\s?the\b.{0,20}(airport|station|terminal|terminus)/;

const CAB_NAME_KEYWORDS = [
  { pattern: /rocket\s?cab/, name: 'Rocket Cab' },
  { pattern: /assam\s?cabs/, name: 'Assam Cabs' },
  { pattern: /cabinnortheast|cabin\s?north\s?east/, name: 'Cabinnortheast' },
  { pattern: /jyoti\s?travels/, name: 'Jyoti Travels' },
  { pattern: /iguwahati/, name: 'IGuwahati Tours & Travels' },
  { pattern: /fufu\s?gadi/, name: 'FuFu Gadi' },
  { pattern: /orange\s?cabs/, name: 'Orange Cabs' },
  { pattern: /savaari/, name: 'Savaari' },
];

const SELFDRIVE_NAME_KEYWORDS = [
  { pattern: /north\s?east\s?rental/, name: 'North East Rental' },
  { pattern: /a\s?to\s?z\s?self\s?drive/, name: 'A to Z Self Drive' },
  { pattern: /ahija/, name: 'Ahija Self Drive' },
  { pattern: /onroadz/, name: 'Onroadz Self Drive' },
  { pattern: /guwahati\s?self\s?drive/, name: 'Guwahati Self Drive' },
];

// "Self drive" is deliberately specific (never just "car rental" alone),
// so a generic "car rental" question defaults to the more common
// chauffeur-driven cab-hire intent instead — same reasoning as sports.js
// letting a bare sport name default to bookable facilities over
// spectator venues.
const SELFDRIVE_TRIGGER = /self[\s-]?driv|drive\s?(it\s?)?myself|without\s?a\s?driver|rent\s?a\s?car\s?myself/;
const CAB_TRIGGER =
  /\bcabs?\b|\btaxis?\b|hire\s?a\s?(car|driver)|book\s?a\s?(cab|taxi)|outstation|inter[\s-]?state|intra[\s-]?state|car\s?rental|chauffeur|with\s?a\s?driver/;

function matchKeywords(text, table, field) {
  const matched = [];
  for (const entry of table) {
    if (entry.pattern.test(text)) matched.push(entry[field]);
  }
  return matched;
}

// A named hub always narrows. Otherwise a hub-type match (e.g. "railway
// station") narrows to that type; a genuinely broad "how do I get to
// Guwahati" with no specific type returns everything (only 8 entries —
// short enough to show in full, and a mixed "here's the airport, the
// railway station, and the bus terminal" answer is exactly what that
// kind of question wants).
function getRelevantTransportHubs(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, HUB_NAME_KEYWORDS, 'name');
  const matchedTypes = matchKeywords(text, HUB_TYPE_KEYWORDS, 'type');

  const isTransportQuestion = HUB_TRIGGER.test(text) || matchedNames.length > 0 || matchedTypes.length > 0;
  if (!isTransportQuestion) return [];

  if (matchedNames.length > 0) {
    return transportHubs.filter((h) => matchedNames.includes(h.name));
  }
  if (matchedTypes.length > 0) {
    return transportHubs.filter((h) => matchedTypes.includes(h.type));
  }
  return transportHubs;
}

// A named business always narrows. Otherwise the CAB_TRIGGER (a broad
// net — "cab", "taxi", "outstation", "car rental", etc.) returns the
// full list of 8; defers to self-drive when self-drive has its own
// explicit signal and this one has nothing beyond the shared, generic
// "car rental" wording, so "self drive car rental" doesn't also surface
// chauffeur services.
function getRelevantCabServices(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, CAB_NAME_KEYWORDS, 'name');
  const cabSignal = CAB_TRIGGER.test(text);
  const selfDriveSignal = SELFDRIVE_TRIGGER.test(text);

  if (matchedNames.length > 0) {
    return cabServices.filter((c) => matchedNames.includes(c.name));
  }
  if (!cabSignal) return [];
  if (selfDriveSignal) return [];
  return cabServices;
}

// Same shape, mirrored.
function getRelevantSelfDriveServices(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, SELFDRIVE_NAME_KEYWORDS, 'name');
  const selfDriveSignal = SELFDRIVE_TRIGGER.test(text);

  if (matchedNames.length > 0) {
    return selfDriveServices.filter((s) => matchedNames.includes(s.name));
  }
  if (!selfDriveSignal) return [];
  return selfDriveServices;
}

module.exports = {
  transportHubs,
  cabServices,
  selfDriveServices,
  getRelevantTransportHubs,
  getRelevantCabServices,
  getRelevantSelfDriveServices,
};
