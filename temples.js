// A hand-verified directory of Guwahati-area temples and sacred sites,
// transcribed from "Guwahati & Around — Temple & Sacred-Site Research Guide"
// (source-checked against Government of Assam / Assam Tourism / Incredible
// India, September 2026). Same "mini RAG" idea as venues.js/restaurants.js/
// parks.js: instead of sending this whole list to Gemini on every message,
// getRelevantTemples() below only returns the temples that actually match
// what the visitor asked about.
//
// Temples are different from the other three categories in one deliberate
// way: `historicalSignificance`, `mythologicalSignificance`, and
// `spiritualSignificance` are narrative grounding text, not structured card
// fields. They're never sent to the browser and never part of the AI's
// JSON response schema — they only feed systemPrompt.js so Gemini can
// paraphrase them into a natural spoken reply, rather than reciting a
// canned paragraph. Historical fact and religious tradition are kept in
// separate fields on purpose (the source document's own "Theology
// standard"): mythological claims are phrased as "tradition says"/
// "devotees believe," not stated as settled fact, and that framing must be
// preserved wherever this text is used.
//
// `tier` (1, 2, or 3) is the source document's own prominence ranking —
// Tier 1 is the handful of best-known, must-see temples (Kamakhya,
// Umananda, etc.), Tier 2/3 are real but less central, some a genuine day
// trip away (Hajo, Madan Kamdev). It's never shown on the card — it only
// drives which temples get returned for a vague, unfiltered question (see
// getRelevantTemples below), the same role `rating` plays for restaurants'
// "top rated" fallback.
//
// No `entryFee` field: the source document never states one for any of
// these 20 temples, and inventing "Free" would be exactly the kind of
// fabrication its own "App safety rule" warns against (never let Gemini
// invent opening hours, fees, booking rules, or dress restrictions).
const temples = [
  { name: 'Maa Kamakhya Temple', area: 'Nilachal Hill, Guwahati', deity: 'Kamakhya / Shakti (sacred yoni-peetha)', tier: 1,
    themes: ['shakta', 'tantric', 'pilgrimage', 'hilltop', 'festival'],
    timings: 'Visitor hours vary with rituals; current temple-reference guidance lists 5:30 AM-7:30 PM with closures during ritual periods. Verify same-day.',
    dressCode: 'Modest, respectful clothing; follow sanctum rules; footwear removed in temple areas.',
    highlight: "One of India's major Shakta pilgrimage centres and a major centre of Tantric practice.",
    historicalSignificance: 'Present temple reconstructed in 1565 under Koch ruler Chilarai after the earlier structure was destroyed. The complex contains several Shakta shrines and a natural spring in the cave-like sanctum.',
    mythologicalSignificance: "Shakta tradition says Sati's yoni fell here after Shiva carried her body; this is religious tradition, not archaeological fact.",
    spiritualSignificance: "Represents the Divine Feminine through fertility, creation, desire, power and transformation. The Ambubachi Mela ritualises the Goddess's annual menstruation." },

  { name: 'Umananda Temple', area: 'Umananda / Peacock Island, Brahmaputra', deity: 'Shiva as Umananda', tier: 1,
    themes: ['shaiva', 'riverside', 'ferry', 'pilgrimage'],
    timings: 'About 5:30 AM-6:00 PM in current visitor listings; ferry hours may be narrower.',
    dressCode: 'Modest/formal clothing; remove footwear; avoid shorts/sleeveless clothing.',
    highlight: 'Major Shaiva pilgrimage site distinguished by its Brahmaputra island setting and rock carvings.',
    historicalSignificance: 'Built in 1694 under Ahom king Gadadhar Singh. Damaged in the 1897 earthquake and later reconstructed.',
    mythologicalSignificance: 'Tradition identifies the island with Bhasmachala, where Shiva reduced Kamadeva to ashes; another tradition links it with Urvashi.',
    spiritualSignificance: 'Combines Shaiva worship, river pilgrimage and contemplation; Shivratri is especially important here.' },

  { name: 'Basistha Temple & Ashram', area: 'Basistha, south-eastern Guwahati', deity: 'Shiva; Sage Vashistha ashram tradition', tier: 1,
    themes: ['shaiva', 'pilgrimage', 'heritage'],
    timings: 'Current Gauhati University iRAD portal lists 6:00 AM-9:00 PM; verify locally.',
    dressCode: 'Modest clothing; footwear removed where required.',
    highlight: 'Important pilgrimage landscape where the Sandhya, Kanta and Lalita streams meet.',
    historicalSignificance: 'Existing temple built in the second half of the 18th century under Ahom king Rajeswar Singha; the site has older ashram traditions.',
    mythologicalSignificance: 'Popular tradition associates the site with Sage Vashistha and purification through its sacred waters.',
    spiritualSignificance: 'Good for Shiva worship, ritual bathing, meditation and a nature-and-spirituality experience.' },

  { name: 'Navagraha Temple', area: 'Chitrachal / Chitrasal Hill, Guwahati', deity: 'Nine planetary deities represented by nine Shiva lingas', tier: 1,
    themes: ['navagraha', 'shaiva', 'hilltop', 'ahom'],
    timings: 'Incredible India lists 4:00 AM-9:00 PM and notes a possible lunch closure; other listings vary.',
    dressCode: 'Modest temple clothing; footwear removed where required.',
    highlight: "Important centre for Navagraha worship, astrology and Guwahati's sacred-cosmological traditions.",
    historicalSignificance: '18th-century temple associated with Ahom king Rajeswar Singha; damaged by earthquake and later rebuilt.',
    mythologicalSignificance: 'The nine lingas represent the nine grahas (planetary deities) in Hindu cosmology and astrological practice.',
    spiritualSignificance: 'Devotees visit seeking planetary balance and auspiciousness; the site also has an astronomical/observational association.' },

  { name: 'Ugratara Temple', area: 'Uzan Bazar, Guwahati', deity: 'Goddess Ugra Tara / Tara', tier: 1,
    themes: ['shakta', 'tantric', 'tara', 'pilgrimage'],
    timings: 'No stable official public daily timetable located; verify locally, especially during festivals.',
    dressCode: 'Modest clothing; follow temple-specific restrictions.',
    highlight: 'Major Shakta shrine with strong tantric associations.',
    historicalSignificance: 'Built in 1725 by Ahom king Shiva Singha; the upper structure was damaged by earthquake and later repaired.',
    mythologicalSignificance: "Popular tradition connects the site with the place where Sati's navel fell. Government of Assam records also note Buddhist Tara/Eka Jata/Tiksna Kanta associations.",
    spiritualSignificance: 'Represents a fierce protective form of the Divine Mother and a distinctive Shakta/Tantric tradition.' },

  { name: 'Sukreswar Temple', area: 'Sukreswar Hill, Pan Bazaar riverfront', deity: 'Shiva', tier: 1,
    themes: ['shaiva', 'riverside'],
    timings: 'No consistently published current official daily timetable; verify locally.',
    dressCode: 'Modest temple attire; footwear removed where required.',
    highlight: 'Historic Shiva temple on the Brahmaputra riverbank and a recognised Guwahati religious landmark.',
    historicalSignificance: 'Historic Shiva temple on the Brahmaputra riverbank; a long-recognised Guwahati religious landmark.',
    mythologicalSignificance: 'Associated with Shiva and local sacred traditions. It is not one of the canonical twelve Jyotirlingas.',
    spiritualSignificance: 'A strong river-and-temple experience and a useful companion to Janardana Temple and Sukreswar Ghat.' },

  { name: 'Hayagriva Madhava Temple', area: 'Monikut Hill, Hajo, about 28 km west of Guwahati', deity: 'Hayagriva Madhava, a form of Vishnu', tier: 2,
    themes: ['vaishnava', 'hajo', 'buddhist-connection', 'pilgrimage'],
    timings: 'Independent current guides list about 6:00 AM-7:00/8:00 PM; official tourism pages do not publish a fixed daily schedule. Verify locally.',
    dressCode: 'Modest clothing covering shoulders/knees; footwear removed in sacred areas.',
    highlight: 'Major pilgrimage centre and an important example of Hindu-Buddhist cultural interaction.',
    historicalSignificance: 'Assam Tourism states the present temple was constructed by Koch king Raghudeva Narayan in 1583; the site has older sacred traditions.',
    mythologicalSignificance: "Vaishnava tradition venerates Vishnu as Hayagriva Madhava; Hajo's Buddhist traditions give the site wider religious significance.",
    spiritualSignificance: 'A strong destination for Vishnu devotion, pilgrimage, sacred art and inter-religious history.' },

  { name: 'Aswaklanta / Aswakranta Devalaya', area: 'North Guwahati, Brahmaputra bank', deity: 'Vishnu — Janardana and Anantasayi Vishnu', tier: 2,
    themes: ['vaishnava', 'north-guwahati', 'riverside', 'archaeology'],
    timings: 'No reliable current official timetable located; verify locally.',
    dressCode: 'Modest temple clothing; footwear removed where required.',
    highlight: 'Important Vishnu shrine with strong archaeological and riverside value.',
    historicalSignificance: 'Present complex built under Ahom king Shiva Singha in 1720. Government archaeology records two Vishnu temples and earlier stone-temple remains; the Anantasayi Vishnu is an important early-medieval sculpture.',
    mythologicalSignificance: "A popular tradition says Krishna's horse became tired here while travelling against Narakasura; another tradition explains the name through an attack on the horse.",
    spiritualSignificance: 'Vaishnava pilgrimage combined with archaeological and scenic interest.' },

  { name: 'Dirgheswari Temple', area: 'North Guwahati / Amingaon', deity: 'Durga / Shakti', tier: 2,
    themes: ['shakta', 'durga', 'north-guwahati', 'hilltop'],
    timings: 'No consistently verified official daily timetable; verify locally.',
    dressCode: 'Modest clothing; footwear removed where required.',
    highlight: 'Important Shakti destination with a hilltop and Brahmaputra-region setting.',
    historicalSignificance: 'Ahom-period hill temple traditionally associated with King Shiva Singha; Assam Tourism identifies it as an important North Guwahati Shakti shrine.',
    mythologicalSignificance: 'Local Shakti traditions centre on the Goddess and the wider sacred geography of North Guwahati.',
    spiritualSignificance: 'A quieter Durga/Shakti pilgrimage option than Kamakhya.' },

  { name: 'Doul Govinda Temple', area: 'Rajaduar, North Guwahati', deity: 'Krishna/Govinda; Shyamaray also worshipped', tier: 2,
    themes: ['vaishnava', 'north-guwahati', 'festival'],
    timings: 'Gauhati University iRAD lists 7:00 AM-8:00 PM; festival schedules may differ.',
    dressCode: 'Modest Vaishnava attire; footwear removed where required.',
    highlight: 'Prominent Krishna temple, especially known for Janmashtami and Doul/Holi celebrations.',
    historicalSignificance: 'Historic temple complex at the foothills of Chandrabharati Hill; Government of Assam notes copper plates, rock inscriptions and surrounding heritage.',
    mythologicalSignificance: 'Centres on Krishna/Govinda bhakti and community devotional practice.',
    spiritualSignificance: 'Excellent for kirtan, bhakti, festivals, and a North Guwahati riverfront experience.' },

  { name: 'Manikarneswar Temple', area: 'Manikarneswar Hill, North Guwahati', deity: 'Shiva; site also preserves Vishnu imagery', tier: 2,
    themes: ['shaiva', 'north-guwahati', 'archaeology', 'heritage'],
    timings: 'No consistently verified official daily timetable; verify locally.',
    dressCode: 'Modest clothing; footwear removed where required.',
    highlight: 'Important combined Shaiva and archaeological site with Brahmaputra views.',
    historicalSignificance: 'The Directorate of Archaeology describes a late-medieval brick Shiva temple built over an earlier stone temple, preserving earlier sculptures.',
    mythologicalSignificance: 'Specific mythology is less securely documented than its archaeological and Shaiva significance; local stories should be treated as tradition.',
    spiritualSignificance: 'A quiet historic pilgrimage and heritage experience away from the busiest centres.' },

  { name: 'Lankeswar Temple', area: 'Western Guwahati, hilltop near Jalukbari', deity: 'Shiva', tier: 2,
    themes: ['shaiva', 'hilltop'],
    timings: 'No consistently verified official daily timetable; verify locally.',
    dressCode: 'Modest clothing; footwear removed where required.',
    highlight: 'Historic Shaiva shrine and hill/landscape experience.',
    historicalSignificance: 'Assam Tourism identifies it as an ancient hilltop Shiva temple in western Guwahati.',
    mythologicalSignificance: 'Specific Lankeswar legends should be presented as local tradition unless separately sourced.',
    spiritualSignificance: 'A compact hill pilgrimage suitable for a quieter temple circuit.' },

  { name: 'Rudreswar Temple', area: 'North Guwahati, north bank of Brahmaputra', deity: 'Shiva as Rudreswar', tier: 2,
    themes: ['shaiva', 'north-guwahati', 'ahom', 'archaeology'],
    timings: 'No consistently verified official daily timetable; verify locally.',
    dressCode: 'Modest temple attire; footwear removed where required.',
    highlight: 'Important link between Ahom royal history and Shaiva worship.',
    historicalSignificance: 'Built in 1749 by Ahom king Pramatta Singha in memory of his father Rudra Singha; noted for its Ahom-Mughal architectural character.',
    mythologicalSignificance: 'The strongest documented significance here is historical and architectural; devotional identity centres on Shiva.',
    spiritualSignificance: 'Useful for visitors interested in Ahom history, architecture and pilgrimage.' },

  { name: 'Janardana Temple', area: 'Shukleshwar Hill, near Sukreswar Ghat', deity: 'Janardana/Vishnu tradition; Buddha image in main hall', tier: 2,
    themes: ['vaishnava', 'buddhist-connection', 'riverside', 'archaeology'],
    timings: 'No consistently verified official daily timetable; verify locally.',
    dressCode: 'Modest clothing; footwear removed where required.',
    highlight: "One of Guwahati's most distinctive syncretic religious sites.",
    historicalSignificance: 'Government of Assam says the temple is believed to be older but was renovated in the 17th century; its architecture and imagery blend Hindu and Buddhist elements.',
    mythologicalSignificance: 'Traditions connecting Buddha and Vishnu/Janardana should be described as a historical-religious interpretation, not universal Buddhist doctrine.',
    spiritualSignificance: "Excellent for visitors interested in inter-religious exchange, sacred art and Guwahati's layered religious history." },

  { name: 'Bhubaneshwari Temple', area: 'Hilltop adjacent to Guwahati', deity: 'Goddess Bhubaneshwari', tier: 3,
    themes: ['shakta', 'hilltop', 'sunset'],
    timings: 'No consistently verified official daily timetable; verify locally.',
    dressCode: 'Modest clothing; footwear removed where required.',
    highlight: 'Known especially for its hilltop setting and sunset views over the Brahmaputra.',
    historicalSignificance: 'Government of Assam describes a white hilltop shrine dedicated to Bhubaneshwari, reached by about a 20-minute walk from the bus-stand area.',
    mythologicalSignificance: 'Bhubaneshwari is a major Shakta form associated with the Divine Mother as cosmic ruler; temple-specific legends should be labelled as tradition.',
    spiritualSignificance: 'A quiet Shakta experience with strong landscape value.' },

  { name: 'Purva Tirupati Shri Balaji Temple', area: 'Betkuchi/Garchuk area, Guwahati', deity: 'Venkateshwara / Balaji, a form of Vishnu', tier: 3,
    themes: ['vaishnava'],
    timings: 'Official district listing confirms the site but does not publish a stable daily timetable; verify locally.',
    dressCode: 'Modest/formal clothing; footwear removed in temple areas.',
    highlight: 'Important modern Vaishnava pilgrimage site and example of pan-Indian temple culture in Assam.',
    historicalSignificance: 'A modern temple built in distinctive South Indian style and dedicated to Venkateshwara.',
    mythologicalSignificance: 'Venkateshwara devotion follows Tirumala/Venkatachala Vaishnava traditions.',
    spiritualSignificance: "A strong devotional environment and architectural contrast to Assam's Ahom-era temples." },

  { name: 'ISKCON Guwahati', area: 'South Sarania / Ulubari', deity: 'Radha-Krishna / Gaudiya Vaishnavism', tier: 3,
    themes: ['vaishnava'],
    timings: 'Daily darshan/aarti schedules vary; verify current programme with the temple.',
    dressCode: 'Modest clothing; temple decorum; footwear removed where required.',
    highlight: 'Important for kirtan, Bhagavad Gita teaching, bhakti and contemporary devotional culture.',
    historicalSignificance: 'A modern Gaudiya Vaishnava devotional centre in Guwahati, part of the international ISKCON movement.',
    mythologicalSignificance: 'Centres on Krishna devotion and Radha-Krishna bhakti within Gaudiya Vaishnavism.',
    spiritualSignificance: 'Accessible for visitors who want chanting, devotional music and community worship.' },

  { name: 'Shri Shirdi Sai Baba Temple', area: 'Radha Nagar Bye Lane, VIP Road, Six Mile', deity: 'Shirdi Sai Baba', tier: 3,
    themes: [],
    timings: 'Verify current darshan/aarti schedule with the temple/trust.',
    dressCode: 'Modest respectful clothing.',
    highlight: "Represents modern devotional Hinduism and Sai Baba's message of faith, compassion and service.",
    historicalSignificance: 'Trust registered in 2007; bhoomi pujan in 2009; Pran Pratistha and inauguration in 2012.',
    mythologicalSignificance: "Sai Baba is revered across devotional communities; theological identity claims should be framed as devotees' interpretations.",
    spiritualSignificance: 'Prayer, devotion, service and inclusive spirituality.' },

  { name: 'Kedareswara Temple', area: 'Madanachal Hill, Hajo', deity: 'Shiva', tier: 2,
    themes: ['shaiva', 'hajo', 'hilltop'],
    timings: 'No consistently verified official daily timetable; verify locally.',
    dressCode: 'Modest Shaiva attire; footwear removed where required.',
    highlight: "Important Shaiva component of Hajo's multi-faith pilgrimage circuit.",
    historicalSignificance: 'Historic Shiva temple on Madanachal Hill; Government of India/Ek Bharat field material records Rajeswar Singha-period land grants and discusses rebuilding over older fabric.',
    mythologicalSignificance: 'Associated with Kedara/Kedarnath naming traditions; specific legends should be labelled as tradition.',
    spiritualSignificance: "Strong for Shiva pilgrimage and Hajo's layered sacred geography." },

  { name: 'Madan Kamdev Temple Complex', area: 'Dewangiri/Madan Kamdev hillock, Baihata Chariali, Kamrup; about 40 km from Guwahati', deity: 'Uma-Maheswara / Shiva tradition', tier: 2,
    themes: ['shaiva', 'archaeology', 'heritage'],
    timings: 'Incredible India currently lists 9:00 AM-5:00 PM for the archaeological site; verify site access locally.',
    dressCode: 'Modest clothing appropriate for a sacred archaeological site; follow site rules.',
    highlight: 'One of the most important archaeological sacred sites near Guwahati, notable for architecture and sculpture.',
    historicalSignificance: 'The Directorate of Archaeology identifies ruined stone temples with the principal shrine dedicated to Uma-Maheswara. Government sources place the complex in the early-medieval/Kamarupa Pala-period landscape.',
    mythologicalSignificance: 'Legend says Kamadeva/Madan was restored here after Shiva reduced him to ashes, linking the site to love, desire and rebirth.',
    spiritualSignificance: 'A rare place to understand medieval sacred ideas of Shiva, Shakti, fertility, love and cosmic union through sculpture.' },
];

// Theme keyword lookup — one row per canonical theme actually used above,
// the direct analog of restaurants.js's cuisines or parks.js's activities.
const THEME_KEYWORDS = [
  { pattern: /\bshakta\b|\bshakti\b|\bgoddess\b/, theme: 'shakta' },
  { pattern: /\bshaiva\b|\bshiva\b|shivling|lingam|jyotirlinga/, theme: 'shaiva' },
  { pattern: /\bvaishnava\b|\bvishnu\b|\bkrishna\b|\bgovinda\b|venkateshwara|\bbalaji\b/, theme: 'vaishnava' },
  { pattern: /\btantric\b|\btantra\b/, theme: 'tantric' },
  { pattern: /\bnavagraha\b|nine\s?planets?|\bastrology\b/, theme: 'navagraha' },
  { pattern: /\bdurga\b/, theme: 'durga' },
  { pattern: /\btara\b/, theme: 'tara' },
  { pattern: /\bbuddhist\b|\bbuddha\b/, theme: 'buddhist-connection' },
  { pattern: /\bahom\b/, theme: 'ahom' },
  { pattern: /archaeolog(y|ical)|\bruins?\b|\bsculptures?\b/, theme: 'archaeology' },
  { pattern: /hill\s?top|hillock|\bon a hill\b/, theme: 'hilltop' },
  { pattern: /\briverside\b|river\s?bank|\bbrahmaputra\b/, theme: 'riverside' },
  { pattern: /\bpilgrimage\b|\bpilgrims?\b/, theme: 'pilgrimage' },
  { pattern: /\bsunset\b/, theme: 'sunset' },
  { pattern: /\bferry\b|\bboat\b/, theme: 'ferry' },
  { pattern: /\bhajo\b/, theme: 'hajo' },
  { pattern: /north\s?guwahati/, theme: 'north-guwahati' },
  { pattern: /\bheritage\b|\bhistoric(al)?\b/, theme: 'heritage' },
  { pattern: /\bsyncretic\b|inter-?religious/, theme: 'syncretic' },
  { pattern: /\bfestival\b|ambubachi|janmashtami|\bholi\b|\bdoul\b|shivratri/, theme: 'festival' },
];

// Area keyword lookup — its own table (not shared with restaurants.js/
// parks.js) since most temple locations (hills, islands, North Guwahati,
// Hajo) don't overlap with those files' localities.
const AREA_KEYWORDS = [
  { pattern: /nilachal/, area: 'Nilachal Hill' },
  { pattern: /umananda|peacock\s?island/, area: 'Umananda' },
  { pattern: /\bbasistha\b/, area: 'Basistha' },
  { pattern: /chitrachal|chitrasal/, area: 'Chitrachal' },
  { pattern: /uzan\s?bazar/, area: 'Uzan Bazar' },
  { pattern: /sukreswar|pan\s?bazaa?r/, area: 'Pan Bazaar' },
  { pattern: /\bhajo\b/, area: 'Hajo' },
  { pattern: /north\s?guwahati|amingaon/, area: 'North Guwahati' },
  { pattern: /rajaduar/, area: 'Rajaduar' },
  { pattern: /manikarneswar/, area: 'Manikarneswar' },
  { pattern: /jalukbari/, area: 'Jalukbari' },
  { pattern: /shukleshwar/, area: 'Shukleshwar' },
  { pattern: /betkuchi|garchuk/, area: 'Betkuchi' },
  { pattern: /south\s?sarania|ulubari/, area: 'Sarania' },
  { pattern: /six\s?mile/, area: 'Six Mile' },
  { pattern: /madanachal/, area: 'Madanachal' },
  { pattern: /baihata|kamrup/, area: 'Kamrup' },
];

// Name keyword lookup — lets a visitor ask about one specific temple by
// name/alias and get just that temple, rather than falling through to the
// Tier 1 default (see getRelevantTemples below).
const NAME_KEYWORDS = [
  { pattern: /kamakhya/, name: 'Maa Kamakhya Temple' },
  { pattern: /umananda|peacock\s?island/, name: 'Umananda Temple' },
  { pattern: /\bbasistha\b|vashistha/, name: 'Basistha Temple & Ashram' },
  { pattern: /navagraha/, name: 'Navagraha Temple' },
  { pattern: /ugratara|ugra\s?tara/, name: 'Ugratara Temple' },
  { pattern: /sukreswar/, name: 'Sukreswar Temple' },
  { pattern: /hayagriva|madhava/, name: 'Hayagriva Madhava Temple' },
  { pattern: /aswaklanta|aswakranta/, name: 'Aswaklanta / Aswakranta Devalaya' },
  { pattern: /dirgheswari/, name: 'Dirgheswari Temple' },
  { pattern: /doul\s?govinda/, name: 'Doul Govinda Temple' },
  { pattern: /manikarneswar/, name: 'Manikarneswar Temple' },
  { pattern: /lankeswar/, name: 'Lankeswar Temple' },
  { pattern: /rudreswar/, name: 'Rudreswar Temple' },
  { pattern: /janardana/, name: 'Janardana Temple' },
  { pattern: /bhubaneshwari/, name: 'Bhubaneshwari Temple' },
  { pattern: /purva\s?tirupati|\bbalaji\b/, name: 'Purva Tirupati Shri Balaji Temple' },
  { pattern: /iskcon/, name: 'ISKCON Guwahati' },
  { pattern: /sai\s?baba/, name: 'Shri Shirdi Sai Baba Temple' },
  { pattern: /kedareswar/, name: 'Kedareswara Temple' },
  { pattern: /madan\s?kamdev/, name: 'Madan Kamdev Temple Complex' },
];

const TEMPLE_TRIGGER = /\btemples?\b|\bmandir\b|\bshrines?\b|\bpilgrimage\b|\bdarshan\b|sacred\s?sites?/;

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

function matchNames(text) {
  const matched = [];
  for (const { pattern, name } of NAME_KEYWORDS) {
    if (pattern.test(text)) matched.push(name);
  }
  return matched;
}

// Looks at what the visitor actually asked and returns only the matching
// temples. A specific temple/deity name always narrows to just that temple
// (or temples, if the name is shared, e.g. multiple Shiva sites). A vague
// temple question with no name/theme/area given returns Tier 1 only — the
// 6 best-known, most significant temples — rather than all 20, the same
// role `rating` plays in restaurants.js's "top rated" fallback. Returns []
// only when the message isn't about temples at all.
function getRelevantTemples(message) {
  const text = message.toLowerCase();

  const matchedThemes = matchThemes(text);
  const matchedAreas = matchAreas(text);
  const matchedNames = matchNames(text);

  const isTempleQuestion = TEMPLE_TRIGGER.test(text) || matchedThemes.size > 0 || matchedNames.length > 0;
  if (!isTempleQuestion) return [];

  let results = temples;
  if (matchedNames.length > 0) {
    results = results.filter((t) => matchedNames.includes(t.name));
  }
  if (matchedThemes.size > 0) {
    results = results.filter((t) => t.themes.some((theme) => matchedThemes.has(theme)));
  }
  if (matchedAreas.length > 0) {
    results = results.filter((t) => matchedAreas.some((area) => t.area.toLowerCase().includes(area.toLowerCase())));
  }

  const noSpecificFilter = matchedNames.length === 0 && matchedThemes.size === 0 && matchedAreas.length === 0;
  if (noSpecificFilter) {
    return temples.filter((t) => t.tier === 1);
  }

  return results;
}

module.exports = { temples, getRelevantTemples };
